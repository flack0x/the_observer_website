"""
Telegram Article Fetcher for The Observer
Fetches articles from Telegram channels and stores them in Supabase.

Setup:
1. Get Telegram API credentials from https://my.telegram.org/apps
2. Create a .env file with the required variables (see below)
3. Run: pip install telethon python-dotenv supabase
4. Run: python fetch_telegram.py
"""

import os
import re
import sys
import asyncio
from datetime import datetime
from dotenv import load_dotenv
from telethon import TelegramClient
from telethon.sessions import StringSession
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

# String session for CI/CD (GitHub Actions)
# Generate with: python scripts/export_session.py
SESSION_STRING = os.getenv('TELEGRAM_SESSION_STRING')

# Supabase credentials
SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://gbqvivmfivsuvvdkoiuc.supabase.co')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_KEY')  # Use service role key for write access

# Channel configuration
CHANNELS = {
    'en': 'observer_5',
    'ar': 'almuraqb',
}

# Emoji patterns to remove
EMOJI_PATTERN = re.compile(
    "["
    "\U0001F300-\U0001F9FF"  # Misc symbols, emoticons, etc.
    "\U00002600-\U000026FF"  # Misc symbols
    "\U00002700-\U000027BF"  # Dingbats
    "\U0001F600-\U0001F64F"  # Emoticons
    "\U0001F680-\U0001F6FF"  # Transport/map symbols
    "\U00002300-\U000023FF"  # Misc technical
    "\U0000FE00-\U0000FE0F"  # Variation selectors
    "\U0001F1E0-\U0001F1FF"  # Flags
    "🔴🔵🟢🟡⚫⚪🔻🔺📌🖋👍✅❌⚠️🚨📢📣"
    "]+",
    flags=re.UNICODE
)


def clean_text(text: str) -> str:
    """Remove emojis and clean up text."""
    # Remove emojis
    text = EMOJI_PATTERN.sub('', text)
    # Remove markdown bold/italic markers for cleaning
    text = re.sub(r'[_*]{1,2}', '', text)
    # Clean up whitespace
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


def truncate_title(text: str, max_length: int = 100) -> str:
    """Truncate text to a reasonable title length at a natural break point."""
    text = text.strip()
    if len(text) <= max_length:
        return text

    # Try to cut at punctuation within limits
    for punct in ['. ', ': ', ' — ', ' - ', ', ', '; ']:
        idx = text.find(punct, 30, max_length)
        if idx > 0:
            return text[:idx].strip()

    # Cut at last word boundary before max_length
    last_space = text.rfind(' ', 30, max_length)
    if last_space > 30:
        return text[:last_space].strip() + '...'

    return text[:max_length - 3].strip() + '...'


def extract_title(text: str, channel: str) -> str:
    """
    Extract a SHORT, concise title from a Telegram message.
    Target: 60-100 characters max.
    """
    lines = [line.strip() for line in text.split('\n') if line.strip()]

    # Only check the first 3 lines for a bold title
    first_lines = '\n'.join(lines[:3])

    # Pattern 1: Look for bold text **title** - extract just the bold part
    bold_matches = re.findall(r'\*\*([^*]+)\*\*', first_lines)
    if bold_matches:
        # Get the first bold text that looks like a title
        for bold_text in bold_matches:
            cleaned = clean_text(bold_text)
            # Skip very short items (likely just a name/location)
            if len(cleaned) >= 10:
                return truncate_title(cleaned, 100)

    # Pattern 2: Bullet point articles - extract topic from first bullet
    # Format: "• **Topic**, description here..."
    bullet_pattern = r'^[•\-\*]\s*\*?\*?([^,•\n]{10,60})'
    for line in lines[:3]:
        match = re.match(bullet_pattern, line)
        if match:
            topic = clean_text(match.group(1))
            if len(topic) >= 10:
                return truncate_title(topic, 100)

    # Pattern 3: First line without bullets/formatting as title
    for line in lines[:5]:
        # Skip lines that are just links or channel mentions
        if line.startswith('http') or line.startswith('@') or 'Link to' in line:
            continue
        if 't.me/' in line and len(line) < 50:
            continue
        if line.startswith('[') and '](' in line:
            continue

        # Remove leading bullets/markers
        cleaned = re.sub(r'^[•\-\*\d\.]+\s*', '', line)
        cleaned = clean_text(cleaned)

        # Check if it looks like a title
        has_letters = bool(re.search(r'[a-zA-Z\u0600-\u06FF]', cleaned))

        # Skip section headers
        is_section_header = bool(re.match(r'^[IVX]+\.?\s|^\d+\.?\s', cleaned))
        is_conclusion = cleaned.lower() in ['conclusion', 'الخاتمة', 'خاتمة', 'introduction', 'مقدمة']

        if has_letters and len(cleaned) >= 15 and not is_section_header and not is_conclusion:
            return truncate_title(cleaned, 100)

    # Absolute fallback
    if lines:
        cleaned = clean_text(lines[0])
        cleaned = re.sub(r'^[•\-\*\d\.]+\s*', '', cleaned)
        return truncate_title(cleaned, 100) if cleaned else 'Untitled'

    return 'Untitled'


def extract_excerpt(text: str, title: str) -> str:
    """Extract a meaningful excerpt from the content, skipping the title."""
    lines = [line.strip() for line in text.split('\n') if line.strip()]

    # Find where the title is and start after it
    start_idx = 0
    for i, line in enumerate(lines[:5]):
        cleaned = clean_text(line)
        if title in cleaned or cleaned in title:
            start_idx = i + 1
            break

    # Collect excerpt lines
    excerpt_parts = []
    for line in lines[start_idx:start_idx + 8]:
        cleaned = clean_text(line)

        # Skip links, channel mentions, and very short lines
        if any(skip in line for skip in ['http', 't.me/', '@observer', '@almuraqb', 'Link to']):
            continue
        if len(cleaned) < 20:
            continue

        excerpt_parts.append(cleaned)

        # Stop if we have enough content
        if sum(len(p) for p in excerpt_parts) > 300:
            break

    excerpt = ' '.join(excerpt_parts)

    # Trim to ~350 chars at a sentence boundary
    if len(excerpt) > 350:
        # Try to cut at a period
        last_period = excerpt.rfind('.', 100, 350)
        if last_period > 100:
            excerpt = excerpt[:last_period + 1]
        else:
            # Cut at word boundary
            last_space = excerpt.rfind(' ', 100, 350)
            if last_space > 100:
                excerpt = excerpt[:last_space] + '...'
            else:
                excerpt = excerpt[:347] + '...'

    return excerpt if excerpt else title


def detect_category(text: str) -> str:
    """Detect article category from content with improved Arabic support."""
    lower_text = text.lower()

    # Breaking/Urgent
    breaking_keywords = ['breaking', 'urgent', 'عاجل', 'خبر عاجل', 'طارئ']
    if any(word in lower_text for word in breaking_keywords):
        return 'Breaking'

    # Military
    military_keywords = [
        'military', 'weapon', 'army', 'forces', 'troops', 'battlefield', 'missile',
        'drone', 'strike', 'attack', 'defense', 'war', 'combat', 'artillery',
        'عسكري', 'جيش', 'قوات', 'صاروخ', 'طائرة مسيرة', 'ضربة', 'هجوم', 'دفاع',
        'حرب', 'معركة', 'سلاح', 'انسحاب'
    ]
    if any(word in lower_text for word in military_keywords):
        return 'Military'

    # Intelligence
    intel_keywords = [
        'intelligence', 'leaked', 'exposed', 'covert', 'secret', 'spy', 'agent',
        'استخبارات', 'تسريب', 'كشف', 'سري', 'جاسوس', 'عميل'
    ]
    if any(word in lower_text for word in intel_keywords):
        return 'Intelligence'

    # Economic
    economic_keywords = [
        'economic', 'economy', 'sanction', 'dollar', 'trade', 'oil', 'gas',
        'market', 'financial', 'bank', 'currency',
        'اقتصاد', 'اقتصادي', 'عقوبات', 'دولار', 'تجارة', 'نفط', 'غاز', 'سوق', 'بنك'
    ]
    if any(word in lower_text for word in economic_keywords):
        return 'Economic'

    # Political
    political_keywords = [
        'saudi', 'emirati', 'yemen', 'gaza', 'israel', 'iran', 'coalition',
        'government', 'president', 'minister', 'parliament', 'election', 'vote',
        'سعودي', 'إماراتي', 'يمن', 'غزة', 'إسرائيل', 'إيران', 'تحالف',
        'حكومة', 'رئيس', 'وزير', 'برلمان', 'انتخاب', 'سياسي', 'سياسة'
    ]
    if any(word in lower_text for word in political_keywords):
        return 'Political'

    # Diplomatic
    diplomatic_keywords = [
        'diplomatic', 'diplomacy', 'negotiation', 'summit', 'treaty', 'agreement',
        'ambassador', 'embassy', 'talks',
        'دبلوماسي', 'دبلوماسية', 'مفاوضات', 'قمة', 'معاهدة', 'اتفاق', 'سفير', 'سفارة'
    ]
    if any(word in lower_text for word in diplomatic_keywords):
        return 'Diplomatic'

    return 'Analysis'


def is_valid_article(text: str) -> bool:
    """Check if the message is a valid article (not just a link or short post)."""
    if not text or len(text) < 150:
        return False

    # Skip messages that are primarily links
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    link_lines = sum(1 for l in lines if 't.me/' in l or l.startswith('http'))

    if len(lines) <= 3 and link_lines >= len(lines) - 1:
        return False

    # Must have substantial text content
    cleaned = clean_text(text)
    if len(cleaned) < 100:
        return False

    return True


def parse_message(message: Message, channel: str, channel_username: str) -> dict | None:
    """Parse a Telegram message into an article."""
    text = message.text

    if not is_valid_article(text):
        return None

    title = extract_title(text, channel)
    excerpt = extract_excerpt(text, title)
    category = detect_category(text)

    return {
        'telegram_id': f"{channel_username}/{message.id}",
        'channel': channel,
        'title': title,
        'excerpt': excerpt,
        'content': text,  # Store full original content with formatting
        'category': category,
        'telegram_link': f"https://t.me/{channel_username}/{message.id}",
        'telegram_date': message.date.isoformat(),
    }


async def fetch_channel_messages(client: TelegramClient, channel_username: str, channel: str, limit: int = 2000) -> list[dict]:
    """Fetch messages from a Telegram channel."""
    articles = []

    try:
        entity = await client.get_entity(channel_username)
        print(f"\nFetching messages from @{channel_username} ({channel})...")

        count = 0
        async for message in client.iter_messages(entity, limit=limit):
            if isinstance(message, Message) and message.text:
                article = parse_message(message, channel, channel_username)
                if article:
                    articles.append(article)
                    count += 1
                    # Print progress every 50 articles
                    if count % 50 == 0:
                        print(f"  Processed {count} articles...")

        print(f"  Total valid articles from @{channel_username}: {len(articles)}")
    except Exception as e:
        print(f"Error fetching @{channel_username}: {e}")
        import traceback
        traceback.print_exc()

    return articles


def upsert_articles(supabase: Client, articles: list[dict], batch_size: int = 50):
    """Insert or update articles in Supabase with batching."""
    if not articles:
        return

    print(f"\nUpserting {len(articles)} articles to Supabase...")

    success_count = 0
    error_count = 0

    # Process in batches
    for i in range(0, len(articles), batch_size):
        batch = articles[i:i + batch_size]

        for article in batch:
            try:
                supabase.table('articles').upsert(
                    article,
                    on_conflict='telegram_id'
                ).execute()
                success_count += 1
            except Exception as e:
                error_count += 1
                print(f"  Error saving {article['telegram_id']}: {e}")

        print(f"  Progress: {min(i + batch_size, len(articles))}/{len(articles)}")

    print(f"\nDone! Success: {success_count}, Errors: {error_count}")


async def main():
    """Main function to fetch and store articles."""
    print("=" * 60)
    print("The Observer - Telegram Article Fetcher")
    print("=" * 60)

    # Validate credentials
    if not API_ID or not API_HASH:
        print("\nError: Missing Telegram API credentials.")
        print("Get them from https://my.telegram.org/apps")
        print("Then set TELEGRAM_API_ID and TELEGRAM_API_HASH in .env")
        return

    if not SUPABASE_KEY:
        print("\nError: Missing Supabase service key.")
        print("Set SUPABASE_SERVICE_KEY in .env")
        return

    # Initialize Supabase client
    print("\nConnecting to Supabase...")
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

    # Initialize Telegram client
    print("Connecting to Telegram...")

    # Use StringSession for CI/CD, file session for local development
    if SESSION_STRING:
        print("Using StringSession (CI/CD mode)")
        client = TelegramClient(StringSession(SESSION_STRING), int(API_ID), API_HASH)
        await client.connect()
        if not await client.is_user_authorized():
            print("Error: StringSession is not authorized!")
            return
    else:
        print("Using file session (local mode)")
        session_path = os.path.join(os.path.dirname(__file__), 'observer_session')
        client = TelegramClient(session_path, int(API_ID), API_HASH)
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

    print("\n" + "=" * 60)
    print(f"Total articles processed: {len(all_articles)}")
    print("=" * 60)


if __name__ == '__main__':
    asyncio.run(main())
