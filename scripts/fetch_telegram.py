"""
Telegram Article Fetcher for The Observer
Fetches articles from Telegram channels and stores them in Supabase.

Supports structured post format:
---
TITLE: Headline here
CATEGORY: Military | Political | Economic | Intelligence | Diplomatic | Breaking | Analysis
COUNTRIES: Israel, Yemen, Iran
ORGS: IDF, Houthis, Hamas
---
Article content...

Falls back to auto-detection for older posts without headers.
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

# Telegram API credentials
API_ID = os.getenv('TELEGRAM_API_ID')
API_HASH = os.getenv('TELEGRAM_API_HASH')
PHONE = os.getenv('TELEGRAM_PHONE')
SESSION_STRING = os.getenv('TELEGRAM_SESSION_STRING')

# Supabase credentials
SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://gbqvivmfivsuvvdkoiuc.supabase.co')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

# Channel configuration
CHANNELS = {
    'en': 'observer_5',
    'ar': 'almuraqb',
}

# Valid categories (English and Arabic)
VALID_CATEGORIES = {
    # English
    'military': 'Military',
    'political': 'Political',
    'economic': 'Economic',
    'intelligence': 'Intelligence',
    'diplomatic': 'Diplomatic',
    'breaking': 'Breaking',
    'analysis': 'Analysis',
    # Arabic
    'عسكري': 'Military',
    'سياسي': 'Political',
    'اقتصادي': 'Economic',
    'استخباراتي': 'Intelligence',
    'دبلوماسي': 'Diplomatic',
    'عاجل': 'Breaking',
    'تحليل': 'Analysis',
}

# Emoji patterns to remove
EMOJI_PATTERN = re.compile(
    "["
    "\U0001F300-\U0001F9FF"
    "\U00002600-\U000026FF"
    "\U00002700-\U000027BF"
    "\U0001F600-\U0001F64F"
    "\U0001F680-\U0001F6FF"
    "\U00002300-\U000023FF"
    "\U0000FE00-\U0000FE0F"
    "\U0001F1E0-\U0001F1FF"
    "🔴🔵🟢🟡⚫⚪🔻🔺📌🖋👍✅❌⚠️🚨📢📣📂🌍🏛️📊"
    "]+",
    flags=re.UNICODE
)


def clean_text(text: str) -> str:
    """Remove emojis and clean up text."""
    text = EMOJI_PATTERN.sub('', text)
    text = re.sub(r'[_*]{1,2}', '', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


def parse_structured_header(text: str) -> dict | None:
    """
    Parse structured headers from post.

    Supports formats:
    TITLE: ...
    CATEGORY: ...
    COUNTRIES: ...
    ORGS: ...
    ---

    Or Arabic:
    العنوان: ...
    التصنيف: ...
    الدول: ...
    المنظمات: ...
    ---
    """
    result = {
        'title': None,
        'category': None,
        'countries': [],
        'organizations': [],
        'content_start': 0,
    }

    lines = text.split('\n')
    header_end = -1

    # Look for header fields in first 10 lines
    for i, line in enumerate(lines[:10]):
        line_clean = line.strip()
        line_lower = line_clean.lower()

        # Check for separator (end of header)
        if line_clean == '---' or line_clean == '—--' or line_clean == '———':
            header_end = i
            break

        # Parse TITLE / العنوان
        title_match = re.match(r'^(?:TITLE|العنوان)\s*[:\-]\s*(.+)$', line_clean, re.IGNORECASE)
        if title_match:
            result['title'] = clean_text(title_match.group(1))[:150]
            continue

        # Parse CATEGORY / التصنيف
        cat_match = re.match(r'^(?:CATEGORY|CAT|التصنيف)\s*[:\-]\s*(.+)$', line_clean, re.IGNORECASE)
        if cat_match:
            cat_value = cat_match.group(1).strip().lower()
            if cat_value in VALID_CATEGORIES:
                result['category'] = VALID_CATEGORIES[cat_value]
            continue

        # Parse COUNTRIES / الدول
        countries_match = re.match(r'^(?:COUNTRIES|COUNTRY|الدول)\s*[:\-]\s*(.+)$', line_clean, re.IGNORECASE)
        if countries_match:
            countries_str = countries_match.group(1)
            result['countries'] = [c.strip() for c in re.split(r'[,،]', countries_str) if c.strip()]
            continue

        # Parse ORGS / المنظمات
        orgs_match = re.match(r'^(?:ORGS?|ORGANIZATIONS?|المنظمات)\s*[:\-]\s*(.+)$', line_clean, re.IGNORECASE)
        if orgs_match:
            orgs_str = orgs_match.group(1)
            result['organizations'] = [o.strip() for o in re.split(r'[,،]', orgs_str) if o.strip()]
            continue

    # If we found a header separator and at least a title, return the result
    if header_end > 0 and result['title']:
        result['content_start'] = header_end + 1
        return result

    # Also check if we found title without separator (simpler format)
    if result['title'] and (result['category'] or result['countries']):
        # Find where content starts (after last header field)
        for i, line in enumerate(lines[:10]):
            if any(line.strip().lower().startswith(prefix) for prefix in
                   ['title:', 'category:', 'countries:', 'orgs:', 'العنوان:', 'التصنيف:', 'الدول:', 'المنظمات:']):
                result['content_start'] = i + 1
        return result

    return None


def truncate_title(text: str, max_length: int = 100) -> str:
    """Truncate text to a reasonable title length at a natural break point."""
    text = text.strip()
    if len(text) <= max_length:
        return text

    for punct in ['. ', ': ', ' — ', ' - ', ', ', '; ']:
        idx = text.find(punct, 30, max_length)
        if idx > 0:
            return text[:idx].strip()

    last_space = text.rfind(' ', 30, max_length)
    if last_space > 30:
        return text[:last_space].strip() + '...'

    return text[:max_length - 3].strip() + '...'


def extract_title_legacy(text: str) -> str:
    """Legacy title extraction for posts without structured headers."""
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    first_lines = '\n'.join(lines[:3])

    # Pattern 1: Bold text **title**
    bold_matches = re.findall(r'\*\*([^*]+)\*\*', first_lines)
    if bold_matches:
        for bold_text in bold_matches:
            cleaned = clean_text(bold_text)
            if len(cleaned) >= 10:
                return truncate_title(cleaned, 100)

    # Pattern 2: Bullet point articles
    bullet_pattern = r'^[•\-\*]\s*\*?\*?([^,•\n]{10,60})'
    for line in lines[:3]:
        match = re.match(bullet_pattern, line)
        if match:
            topic = clean_text(match.group(1))
            if len(topic) >= 10:
                return truncate_title(topic, 100)

    # Pattern 3: First substantial line
    for line in lines[:5]:
        if line.startswith('http') or line.startswith('@') or 'Link to' in line:
            continue
        if 't.me/' in line and len(line) < 50:
            continue
        if line.startswith('[') and '](' in line:
            continue

        cleaned = re.sub(r'^[•\-\*\d\.]+\s*', '', line)
        cleaned = clean_text(cleaned)

        has_letters = bool(re.search(r'[a-zA-Z\u0600-\u06FF]', cleaned))
        is_section_header = bool(re.match(r'^[IVX]+\.?\s|^\d+\.?\s', cleaned))
        is_conclusion = cleaned.lower() in ['conclusion', 'الخاتمة', 'خاتمة', 'introduction', 'مقدمة']

        if has_letters and len(cleaned) >= 15 and not is_section_header and not is_conclusion:
            return truncate_title(cleaned, 100)

    if lines:
        cleaned = clean_text(lines[0])
        cleaned = re.sub(r'^[•\-\*\d\.]+\s*', '', cleaned)
        return truncate_title(cleaned, 100) if cleaned else 'Untitled'

    return 'Untitled'


def extract_excerpt(text: str, title: str, content_start: int = 0) -> str:
    """Extract a meaningful excerpt from the content."""
    lines = [line.strip() for line in text.split('\n') if line.strip()]

    # Start from content_start if provided
    start_idx = content_start

    # If no content_start, find where title is and start after
    if start_idx == 0:
        for i, line in enumerate(lines[:5]):
            cleaned = clean_text(line)
            if title in cleaned or cleaned in title:
                start_idx = i + 1
                break

    excerpt_parts = []
    for line in lines[start_idx:start_idx + 8]:
        cleaned = clean_text(line)

        if any(skip in line for skip in ['http', 't.me/', '@observer', '@almuraqb', 'Link to']):
            continue
        if len(cleaned) < 20:
            continue
        # Skip header lines
        if any(line.strip().lower().startswith(prefix) for prefix in
               ['title:', 'category:', 'countries:', 'orgs:', 'العنوان:', 'التصنيف:', 'الدول:', 'المنظمات:', '---']):
            continue

        excerpt_parts.append(cleaned)

        if sum(len(p) for p in excerpt_parts) > 300:
            break

    excerpt = ' '.join(excerpt_parts)

    if len(excerpt) > 350:
        last_period = excerpt.rfind('.', 100, 350)
        if last_period > 100:
            excerpt = excerpt[:last_period + 1]
        else:
            last_space = excerpt.rfind(' ', 100, 350)
            if last_space > 100:
                excerpt = excerpt[:last_space] + '...'
            else:
                excerpt = excerpt[:347] + '...'

    return excerpt if excerpt else title


def detect_category_legacy(text: str) -> str:
    """Legacy category detection for posts without structured headers."""
    lower_text = text.lower()

    breaking_keywords = ['breaking', 'urgent', 'عاجل', 'خبر عاجل', 'طارئ']
    if any(word in lower_text for word in breaking_keywords):
        return 'Breaking'

    military_keywords = [
        'military', 'weapon', 'army', 'forces', 'troops', 'battlefield', 'missile',
        'drone', 'strike', 'attack', 'defense', 'war', 'combat', 'artillery',
        'عسكري', 'جيش', 'قوات', 'صاروخ', 'طائرة مسيرة', 'ضربة', 'هجوم', 'دفاع',
        'حرب', 'معركة', 'سلاح', 'انسحاب'
    ]
    if any(word in lower_text for word in military_keywords):
        return 'Military'

    intel_keywords = [
        'intelligence', 'leaked', 'exposed', 'covert', 'secret', 'spy', 'agent',
        'استخبارات', 'تسريب', 'كشف', 'سري', 'جاسوس', 'عميل'
    ]
    if any(word in lower_text for word in intel_keywords):
        return 'Intelligence'

    economic_keywords = [
        'economic', 'economy', 'sanction', 'dollar', 'trade', 'oil', 'gas',
        'market', 'financial', 'bank', 'currency',
        'اقتصاد', 'اقتصادي', 'عقوبات', 'دولار', 'تجارة', 'نفط', 'غاز', 'سوق', 'بنك'
    ]
    if any(word in lower_text for word in economic_keywords):
        return 'Economic'

    political_keywords = [
        'saudi', 'emirati', 'yemen', 'gaza', 'israel', 'iran', 'coalition',
        'government', 'president', 'minister', 'parliament', 'election', 'vote',
        'سعودي', 'إماراتي', 'يمن', 'غزة', 'إسرائيل', 'إيران', 'تحالف',
        'حكومة', 'رئيس', 'وزير', 'برلمان', 'انتخاب', 'سياسي', 'سياسة'
    ]
    if any(word in lower_text for word in political_keywords):
        return 'Political'

    diplomatic_keywords = [
        'diplomatic', 'diplomacy', 'negotiation', 'summit', 'treaty', 'agreement',
        'ambassador', 'embassy', 'talks',
        'دبلوماسي', 'دبلوماسية', 'مفاوضات', 'قمة', 'معاهدة', 'اتفاق', 'سفير', 'سفارة'
    ]
    if any(word in lower_text for word in diplomatic_keywords):
        return 'Diplomatic'

    return 'Analysis'


def detect_countries_legacy(text: str) -> list[str]:
    """Detect countries mentioned in text."""
    countries_map = {
        'israel': 'Israel', 'israeli': 'Israel', 'اسرائيل': 'Israel', 'إسرائيل': 'Israel',
        'palestine': 'Palestine', 'palestinian': 'Palestine', 'gaza': 'Palestine', 'فلسطين': 'Palestine', 'غزة': 'Palestine',
        'yemen': 'Yemen', 'yemeni': 'Yemen', 'اليمن': 'Yemen', 'يمن': 'Yemen',
        'iran': 'Iran', 'iranian': 'Iran', 'إيران': 'Iran', 'ايران': 'Iran',
        'saudi': 'Saudi Arabia', 'saudi arabia': 'Saudi Arabia', 'السعودية': 'Saudi Arabia',
        'uae': 'UAE', 'emirati': 'UAE', 'emirates': 'UAE', 'الإمارات': 'UAE',
        'egypt': 'Egypt', 'egyptian': 'Egypt', 'مصر': 'Egypt',
        'syria': 'Syria', 'syrian': 'Syria', 'سوريا': 'Syria',
        'lebanon': 'Lebanon', 'lebanese': 'Lebanon', 'لبنان': 'Lebanon',
        'iraq': 'Iraq', 'iraqi': 'Iraq', 'العراق': 'Iraq',
        'jordan': 'Jordan', 'jordanian': 'Jordan', 'الأردن': 'Jordan',
        'turkey': 'Turkey', 'turkish': 'Turkey', 'تركيا': 'Turkey',
        'russia': 'Russia', 'russian': 'Russia', 'روسيا': 'Russia',
        'usa': 'USA', 'america': 'USA', 'american': 'USA', 'أمريكا': 'USA',
        'china': 'China', 'chinese': 'China', 'الصين': 'China',
    }

    lower_text = text.lower()
    found = set()

    for keyword, country in countries_map.items():
        if keyword in lower_text:
            found.add(country)

    return list(found)[:5]  # Limit to 5 countries


def detect_organizations_legacy(text: str) -> list[str]:
    """Detect organizations mentioned in text."""
    orgs_map = {
        'idf': 'IDF', 'israel defense': 'IDF', 'جيش الدفاع': 'IDF',
        'hamas': 'Hamas', 'حماس': 'Hamas',
        'hezbollah': 'Hezbollah', 'حزب الله': 'Hezbollah',
        'houthi': 'Houthis', 'ansar allah': 'Houthis', 'الحوثي': 'Houthis', 'أنصار الله': 'Houthis',
        'irgc': 'IRGC', 'revolutionary guard': 'IRGC', 'الحرس الثوري': 'IRGC',
        'mossad': 'Mossad', 'الموساد': 'Mossad',
        'cia': 'CIA',
        'un ': 'UN', 'united nations': 'UN', 'الأمم المتحدة': 'UN',
        'nato': 'NATO', 'الناتو': 'NATO',
        'plo': 'PLO', 'منظمة التحرير': 'PLO',
        'fatah': 'Fatah', 'فتح': 'Fatah',
        'islamic jihad': 'Islamic Jihad', 'الجهاد الإسلامي': 'Islamic Jihad',
    }

    lower_text = text.lower()
    found = set()

    for keyword, org in orgs_map.items():
        if keyword in lower_text:
            found.add(org)

    return list(found)[:5]


def is_valid_article(text: str) -> bool:
    """Check if the message is a valid article."""
    if not text or len(text) < 100:
        return False

    lines = [l.strip() for l in text.split('\n') if l.strip()]
    link_lines = sum(1 for l in lines if 't.me/' in l or l.startswith('http'))

    if len(lines) <= 3 and link_lines >= len(lines) - 1:
        return False

    cleaned = clean_text(text)
    if len(cleaned) < 80:
        return False

    return True


def parse_message(message: Message, channel: str, channel_username: str) -> dict | None:
    """Parse a Telegram message into an article."""
    text = message.text

    if not is_valid_article(text):
        return None

    # Try to parse structured headers first
    structured = parse_structured_header(text)

    if structured and structured['title']:
        # Use structured data
        title = structured['title']
        category = structured['category'] or detect_category_legacy(text)
        countries = structured['countries'] or detect_countries_legacy(text)
        organizations = structured['organizations'] or detect_organizations_legacy(text)
        content_start = structured['content_start']
        is_structured = True
    else:
        # Fall back to legacy detection
        title = extract_title_legacy(text)
        category = detect_category_legacy(text)
        countries = detect_countries_legacy(text)
        organizations = detect_organizations_legacy(text)
        content_start = 0
        is_structured = False

    excerpt = extract_excerpt(text, title, content_start)

    return {
        'telegram_id': f"{channel_username}/{message.id}",
        'channel': channel,
        'title': title,
        'excerpt': excerpt,
        'content': text,
        'category': category,
        'countries': countries,
        'organizations': organizations,
        'is_structured': is_structured,
        'telegram_link': f"https://t.me/{channel_username}/{message.id}",
        'telegram_date': message.date.isoformat(),
    }


def group_multipart_messages(messages: list[Message], time_threshold_seconds: int = 180) -> list[list[Message]]:
    """
    Group consecutive messages that are likely parts of the same article.
    Messages posted within time_threshold_seconds of each other are grouped together.
    """
    if not messages:
        return []

    # Sort by date ascending (oldest first) for proper grouping
    sorted_messages = sorted(messages, key=lambda m: m.date)

    groups = []
    current_group = [sorted_messages[0]]

    for i in range(1, len(sorted_messages)):
        current_msg = sorted_messages[i]
        prev_msg = sorted_messages[i - 1]

        # Calculate time difference in seconds
        time_diff = (current_msg.date - prev_msg.date).total_seconds()

        if time_diff <= time_threshold_seconds:
            # Same group - messages are close together
            current_group.append(current_msg)
        else:
            # New group - save current and start new
            groups.append(current_group)
            current_group = [current_msg]

    # Don't forget the last group
    groups.append(current_group)

    return groups


def combine_message_group(messages: list[Message], channel: str, channel_username: str) -> dict | None:
    """
    Combine a group of messages into a single article.
    The first message (oldest) is treated as the main article with the title.
    Subsequent messages are appended as content.
    """
    if not messages:
        return None

    # Sort by date ascending (oldest first)
    sorted_messages = sorted(messages, key=lambda m: m.date)
    first_message = sorted_messages[0]

    # Combine all text content
    combined_text = '\n\n'.join(m.text for m in sorted_messages if m.text)

    if not is_valid_article(combined_text):
        return None

    # Try to parse structured headers from the first message
    structured = parse_structured_header(first_message.text)

    if structured and structured['title']:
        title = structured['title']
        category = structured['category'] or detect_category_legacy(combined_text)
        countries = structured['countries'] or detect_countries_legacy(combined_text)
        organizations = structured['organizations'] or detect_organizations_legacy(combined_text)
        content_start = structured['content_start']
        is_structured = True
    else:
        # Fall back to legacy detection on first message only
        title = extract_title_legacy(first_message.text)
        category = detect_category_legacy(combined_text)
        countries = detect_countries_legacy(combined_text)
        organizations = detect_organizations_legacy(combined_text)
        content_start = 0
        is_structured = False

    excerpt = extract_excerpt(combined_text, title, content_start)

    return {
        'telegram_id': f"{channel_username}/{first_message.id}",
        'channel': channel,
        'title': title,
        'excerpt': excerpt,
        'content': combined_text,
        'category': category,
        'countries': countries,
        'organizations': organizations,
        'is_structured': is_structured,
        'telegram_link': f"https://t.me/{channel_username}/{first_message.id}",
        'telegram_date': first_message.date.isoformat(),
        '_part_count': len(sorted_messages),  # For logging
    }


async def fetch_channel_messages(client: TelegramClient, channel_username: str, channel: str, limit: int = 2000) -> list[dict]:
    """Fetch messages from a Telegram channel and combine multi-part posts."""
    articles = []
    structured_count = 0
    multipart_count = 0

    try:
        entity = await client.get_entity(channel_username)
        print(f"\nFetching messages from @{channel_username} ({channel})...")

        # Collect all valid messages first
        raw_messages = []
        async for message in client.iter_messages(entity, limit=limit):
            if isinstance(message, Message) and message.text:
                # Basic validation - must have some content
                if len(message.text.strip()) >= 50:
                    raw_messages.append(message)

        print(f"  Collected {len(raw_messages)} raw messages")

        # Group multi-part messages (within 3 minutes of each other)
        message_groups = group_multipart_messages(raw_messages, time_threshold_seconds=180)
        print(f"  Grouped into {len(message_groups)} article groups")

        # Process each group
        for group in message_groups:
            article = combine_message_group(group, channel, channel_username)
            if article:
                articles.append(article)
                if article.get('is_structured'):
                    structured_count += 1
                if article.get('_part_count', 1) > 1:
                    multipart_count += 1
                    print(f"    Combined {article['_part_count']} parts: {article['title'][:50]}...")

        print(f"  Total articles: {len(articles)} ({structured_count} structured, {multipart_count} multi-part)")
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

    for i in range(0, len(articles), batch_size):
        batch = articles[i:i + batch_size]

        for article in batch:
            try:
                # Remove internal fields before saving
                article_data = {k: v for k, v in article.items() if not k.startswith('_')}
                supabase.table('articles').upsert(
                    article_data,
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
    print("Supports structured post format for better metadata!")
    print("=" * 60)

    if not API_ID or not API_HASH:
        print("\nError: Missing Telegram API credentials.")
        return

    if not SUPABASE_KEY:
        print("\nError: Missing Supabase service key.")
        return

    print("\nConnecting to Supabase...")
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

    print("Connecting to Telegram...")

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

    for channel, username in CHANNELS.items():
        articles = await fetch_channel_messages(client, username, channel)
        all_articles.extend(articles)

    upsert_articles(supabase, all_articles)

    await client.disconnect()

    print("\n" + "=" * 60)
    print(f"Total articles processed: {len(all_articles)}")
    print("=" * 60)


if __name__ == '__main__':
    asyncio.run(main())
