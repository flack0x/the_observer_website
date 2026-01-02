"""
Telegram Article Fetcher for The Observer
Fetches articles from Telegram channels and stores them in Supabase.

Setup:
1. Get Telegram API credentials from https://my.telegram.org/apps
2. Create a .env file with the required variables (see below)
3. Run: pip install -r requirements.txt
4. Run: python fetch_telegram.py
"""

import os
import re
import sys
import asyncio
from datetime import datetime
from dotenv import load_dotenv
from telethon import TelegramClient
from telethon.tl.types import Message
from supabase import create_client, Client

# Fix Windows console encoding for Arabic/emoji
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# Load environment variables
load_dotenv()

# Telegram API credentials (get from https://my.telegram.org/apps)
API_ID = os.getenv('TELEGRAM_API_ID')
API_HASH = os.getenv('TELEGRAM_API_HASH')
PHONE = os.getenv('TELEGRAM_PHONE')  # Your phone number

# Supabase credentials
SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://gbqvivmfivsuvvdkoiuc.supabase.co')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_KEY')  # Use service role key for write access

# Channel configuration
CHANNELS = {
    'en': 'observer_5',
    'ar': 'almuraqb',
}

def clean_title(text: str) -> str:
    """Clean up title text by removing emojis and symbols."""
    # Remove common emojis
    text = re.sub(r'[\U0001F300-\U0001F9FF]', '', text)
    text = re.sub(r'[\U00002600-\U000026FF]', '', text)
    text = re.sub(r'[\U00002700-\U000027BF]', '', text)
    text = re.sub(r'[🔴🔵🟢🟡⚫⚪🔻🔺]', '', text)
    # Remove leading/trailing symbols
    text = re.sub(r'^[\s\-–—:•*#]+', '', text)
    text = re.sub(r'[\s\-–—:•*#]+$', '', text)
    return text.strip()

def detect_category(text: str) -> str:
    """Detect article category from content."""
    lower_text = text.lower()

    if any(word in lower_text for word in ['breaking', 'urgent', 'عاجل']):
        return 'Breaking'
    if any(word in lower_text for word in ['military', 'weapon', 'army', 'forces', 'troops', 'battlefield', 'عسكري']):
        return 'Military'
    if any(word in lower_text for word in ['economic', 'sanction', 'dollar', 'gas deal', 'trade', 'اقتصاد']):
        return 'Economic'
    if any(word in lower_text for word in ['intelligence', 'leaked', 'exposed', 'covert', 'استخبارات']):
        return 'Intelligence'
    if any(word in lower_text for word in ['saudi', 'emirati', 'yemen', 'gaza', 'israel', 'iran', 'coalition', 'withdrawal', 'alliance', 'سياسي']):
        return 'Political'
    if any(word in lower_text for word in ['diplomatic', 'negotiation', 'summit', 'دبلوماسي']):
        return 'Diplomatic'

    return 'Analysis'

def parse_message(message: Message, channel: str, channel_username: str) -> dict | None:
    """Parse a Telegram message into an article."""
    if not message.text or len(message.text) < 100:
        return None

    text = message.text
    lines = [line.strip() for line in text.split('\n') if line.strip()]

    # Find title (first substantial line between 20-200 chars)
    title = ''
    for line in lines[:3]:
        cleaned = clean_title(line)
        if 20 <= len(cleaned) <= 200 and re.search(r'[a-zA-Z\u0600-\u06FF]', cleaned):
            title = cleaned
            break

    if not title:
        title = clean_title(lines[0]) if lines else 'Untitled'

    # Truncate title if too long
    if len(title) > 150:
        colon_idx = title.find(':')
        dash_idx = title.find('–')
        cut_point = colon_idx if colon_idx > 30 else (dash_idx if dash_idx > 30 else 147)
        title = title[:min(cut_point + 1, 147)].strip()
        if not title.endswith(':') and not title.endswith('–'):
            title += '...'

    # Create excerpt (skip title, take next 6 lines)
    title_line_idx = next((i for i, l in enumerate(lines) if clean_title(l) == title or clean_title(l).startswith(title.replace('...', ''))), 0)
    excerpt_lines = []
    for line in lines[title_line_idx + 1:title_line_idx + 7]:
        cleaned = clean_title(line)
        if len(cleaned) > 20 and not any(skip in cleaned for skip in ['Link to', '🔵', '@observer']):
            excerpt_lines.append(cleaned)

    excerpt = ' '.join(excerpt_lines)[:400]
    if len(excerpt) > 350:
        last_period = excerpt.rfind('.', 0, 350)
        if last_period > 200:
            excerpt = excerpt[:last_period + 1]
        else:
            last_space = excerpt.rfind(' ', 0, 350)
            excerpt = excerpt[:last_space] + '...'

    return {
        'telegram_id': f"{channel_username}/{message.id}",
        'channel': channel,
        'title': title,
        'excerpt': excerpt or title,
        'content': text,
        'category': detect_category(text),
        'telegram_link': f"https://t.me/{channel_username}/{message.id}",
        'telegram_date': message.date.isoformat(),
    }

async def fetch_channel_messages(client: TelegramClient, channel_username: str, channel: str, limit: int = 2000) -> list[dict]:
    """Fetch messages from a Telegram channel."""
    articles = []

    try:
        entity = await client.get_entity(channel_username)
        print(f"Fetching messages from @{channel_username}...")

        async for message in client.iter_messages(entity, limit=limit):
            if isinstance(message, Message) and message.text:
                article = parse_message(message, channel, channel_username)
                if article:
                    articles.append(article)
                    print(f"  Parsed: {article['title'][:50]}...")

        print(f"  Total articles from @{channel_username}: {len(articles)}")
    except Exception as e:
        print(f"Error fetching @{channel_username}: {e}")

    return articles

def upsert_articles(supabase: Client, articles: list[dict]):
    """Insert or update articles in Supabase."""
    if not articles:
        return

    print(f"\nUpserting {len(articles)} articles to Supabase...")

    for article in articles:
        try:
            supabase.table('articles').upsert(
                article,
                on_conflict='telegram_id'
            ).execute()
            print(f"  Saved: {article['telegram_id']}")
        except Exception as e:
            print(f"  Error saving {article['telegram_id']}: {e}")

    print("Done!")

async def main():
    """Main function to fetch and store articles."""
    # Validate credentials
    if not API_ID or not API_HASH:
        print("Error: Missing Telegram API credentials.")
        print("Get them from https://my.telegram.org/apps")
        print("Then set TELEGRAM_API_ID and TELEGRAM_API_HASH in .env")
        return

    if not SUPABASE_KEY:
        print("Error: Missing Supabase service key.")
        print("Set SUPABASE_SERVICE_KEY in .env")
        return

    # Initialize Supabase client
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

    # Initialize Telegram client
    client = TelegramClient('observer_session', int(API_ID), API_HASH)

    await client.start(phone=PHONE)
    print("Connected to Telegram!")

    all_articles = []

    # Fetch from all channels
    for channel, username in CHANNELS.items():
        articles = await fetch_channel_messages(client, username, channel)
        all_articles.extend(articles)

    # Store in Supabase
    upsert_articles(supabase, all_articles)

    await client.disconnect()
    print(f"\nTotal articles processed: {len(all_articles)}")

if __name__ == '__main__':
    asyncio.run(main())
