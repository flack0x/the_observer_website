"""
Telegram Article Fetcher for The Observer
Fetches articles from Telegram channels and stores them in Supabase.

OPTIMIZED VERSION:
- Incremental sync: Only fetches new messages since last sync
- Smart upsert: Only updates articles that have actually changed
- Tracks sync state per channel
- Use --full flag to force complete re-sync

Supports structured post format:
---
TITLE: Headline here
CATEGORY: Military | Political | Economic | Intelligence | Diplomatic | Breaking | Analysis
COUNTRIES: Israel, Yemen, Iran
ORGS: IDF, Houthis, Hamas
---
Article content...

Falls back to auto-detection for older posts without headers.
Also downloads and uploads images/videos to Supabase Storage.
"""

import os
import re
import sys
import json
import asyncio
import hashlib
import argparse
from datetime import datetime, timezone
from pathlib import Path
from dotenv import load_dotenv
from telethon import TelegramClient
from telethon.sessions import StringSession
from telethon.tl.types import Message, MessageMediaPhoto, MessageMediaDocument
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

# Sync state file (tracks last synced message ID per channel)
SYNC_STATE_FILE = Path(__file__).parent / '.sync_state.json'

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
    'geopolitics': 'Geopolitics',
    # Arabic
    'عسكري': 'Military',
    'سياسي': 'Political',
    'اقتصادي': 'Economic',
    'استخباراتي': 'Intelligence',
    'دبلوماسي': 'Diplomatic',
    'عاجل': 'Breaking',
    'تحليل': 'Analysis',
    'جيوسياسي': 'Geopolitics',
}

# Media size limits (in bytes)
MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10MB
MAX_VIDEO_SIZE = 50 * 1024 * 1024  # 50MB

# Supabase Storage bucket name
MEDIA_BUCKET = 'article-media'

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


# =============================================================================
# SYNC STATE MANAGEMENT
# =============================================================================

def load_sync_state() -> dict:
    """Load sync state from file."""
    if SYNC_STATE_FILE.exists():
        try:
            with open(SYNC_STATE_FILE, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"  Warning: Could not load sync state: {e}")
    return {}


def save_sync_state(state: dict):
    """Save sync state to file."""
    try:
        with open(SYNC_STATE_FILE, 'w') as f:
            json.dump(state, f, indent=2)
    except Exception as e:
        print(f"  Warning: Could not save sync state: {e}")


def get_last_synced_id(state: dict, channel: str) -> int:
    """Get the last synced message ID for a channel."""
    return state.get(channel, {}).get('last_message_id', 0)


def update_sync_state(state: dict, channel: str, last_id: int, article_count: int):
    """Update sync state for a channel."""
    state[channel] = {
        'last_message_id': last_id,
        'last_sync': datetime.now(timezone.utc).isoformat(),
        'articles_synced': article_count,
    }


# =============================================================================
# CONTENT HASHING (for change detection)
# =============================================================================

def hash_article_content(article: dict) -> str:
    """Create a hash of article content for change detection."""
    # Include fields that matter for content comparison
    content_str = '|'.join([
        str(article.get('title', '')),
        str(article.get('content', '')),
        str(article.get('category', '')),
        ','.join(sorted(article.get('countries', []))),
        ','.join(sorted(article.get('organizations', []))),
        str(article.get('image_url', '')),
        str(article.get('video_url', '')),
    ])
    return hashlib.md5(content_str.encode()).hexdigest()


# =============================================================================
# TEXT PROCESSING
# =============================================================================

def clean_text(text: str) -> str:
    """Remove emojis and clean up text."""
    text = EMOJI_PATTERN.sub('', text)
    text = re.sub(r'[_*]{1,2}', '', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


def parse_structured_header(text: str) -> dict | None:
    """
    Parse structured headers from post - supports multiple formats.

    Supports formats:
    1. **Title** on one line, value on next line in **...**
    2. **Title : Value** or **Title: Value** all on one line
    3. Standard TITLE: Value format (legacy)

    Also parses Category, Countries, and Organizations.
    """
    result = {
        'title': None,
        'category': None,
        'countries': [],
        'organizations': [],
        'content_start': 0,
    }

    lines = text.split('\n')

    for i, line in enumerate(lines[:15]):
        line_clean = line.strip()
        # Strip common emoji prefixes that appear before headers
        line_clean = re.sub(r'^[🔴🔵🟢🟡⚫⚪⚠️🚨📢\s]+', '', line_clean)

        # Check for **Title** followed by value on next line
        if re.match(r'^\*\*(?:Title|العنوان)\*\*$', line_clean, re.IGNORECASE):
            # Look for value in next 2 lines (skip empty)
            for j in range(i+1, min(i+3, len(lines))):
                next_line = lines[j].strip()
                if next_line and not next_line.startswith('**Category'):
                    # Extract from **value** if present
                    title_match = re.match(r'^\*\*(.+?)\*\*$', next_line)
                    if title_match:
                        result['title'] = clean_text(title_match.group(1))[:150]
                    else:
                        result['title'] = clean_text(next_line)[:150]
                    break
            continue

        # Check for **Title : Value** or **Title: Value** on same line (with or without closing **)
        title_inline = re.match(
            r'^\*\*(?:Title|العنوان)\s*[:\-–—]\s*(.+?)\*\*$',
            line_clean, re.IGNORECASE
        )
        if title_inline:
            result['title'] = clean_text(title_inline.group(1))[:150]
            continue

        # Check for **Title: Value without closing ** (some posts have this format)
        title_inline_noclose = re.match(
            r'^\*\*(?:Title|العنوان)\s*[:\-–—]\s*(.+)$',
            line_clean, re.IGNORECASE
        )
        if title_inline_noclose and not line_clean.endswith('**'):
            result['title'] = clean_text(title_inline_noclose.group(1))[:150]
            continue

        # Check for standard TITLE: Value (original format)
        title_standard = re.match(
            r'^(?:TITLE|العنوان)\s*[:\-–—]\s*(.+)$',
            line_clean, re.IGNORECASE
        )
        if title_standard:
            result['title'] = clean_text(title_standard.group(1))[:150]
            continue

        # Parse Category (multiple formats)
        # **Category** followed by value, or **Category**: Value, or Category: Value
        if re.match(r'^\*\*(?:Category|CAT|التصنيف)\*\*$', line_clean, re.IGNORECASE):
            for j in range(i+1, min(i+3, len(lines))):
                next_line = lines[j].strip()
                if next_line:
                    cat_value = clean_text(next_line).lower()
                    # Only use first part before pipe
                    cat_value = cat_value.split('|')[0].strip()
                    if cat_value in VALID_CATEGORIES:
                        result['category'] = VALID_CATEGORIES[cat_value]
                    break
            continue

        cat_inline = re.match(
            r'^\*\*(?:Category|CAT|التصنيف)\*\*\s*[:\-]?\s*(.+)$',
            line_clean, re.IGNORECASE
        )
        if cat_inline:
            cat_value = cat_inline.group(1).strip().lower().split('|')[0].strip()
            if cat_value in VALID_CATEGORIES:
                result['category'] = VALID_CATEGORIES[cat_value]
            continue

        # Standard Category: Value format
        cat_standard = re.match(
            r'^(?:CATEGORY|CAT|التصنيف)\s*[:\-]\s*(.+)$',
            line_clean, re.IGNORECASE
        )
        if cat_standard:
            cat_value = cat_standard.group(1).strip().lower().split('|')[0].strip()
            if cat_value in VALID_CATEGORIES:
                result['category'] = VALID_CATEGORIES[cat_value]
            continue

        # Countries - **Countries Involved** or **Countries**
        if re.match(r'^\*\*(?:Countries?|الدول)(?:\s+Involved)?\*\*', line_clean, re.IGNORECASE):
            for j in range(i+1, min(i+3, len(lines))):
                next_line = lines[j].strip()
                if next_line and not next_line.startswith('**'):
                    # Split by | or comma, remove flags
                    countries = re.split(r'[|,،]', next_line)
                    result['countries'] = [
                        clean_text(re.sub(r'[\U0001F1E0-\U0001F1FF]+', '', c)).strip()
                        for c in countries if clean_text(c).strip()
                    ][:5]
                    break
            continue

        # Standard COUNTRIES: format
        countries_match = re.match(r'^(?:COUNTRIES|COUNTRY|الدول)\s*[:\-]\s*(.+)$', line_clean, re.IGNORECASE)
        if countries_match:
            countries_str = countries_match.group(1)
            result['countries'] = [c.strip() for c in re.split(r'[,،]', countries_str) if c.strip()]
            continue

        # Organizations - **Orgs** or standard format
        if re.match(r'^\*\*(?:Orgs?|Organizations?|المنظمات)\*\*', line_clean, re.IGNORECASE):
            for j in range(i+1, min(i+3, len(lines))):
                next_line = lines[j].strip()
                if next_line and not next_line.startswith('**'):
                    orgs = re.split(r'[|,،]', next_line)
                    result['organizations'] = [clean_text(o).strip() for o in orgs if clean_text(o).strip()][:5]
                    break
            continue

        orgs_match = re.match(r'^(?:ORGS?|ORGANIZATIONS?|المنظمات)\s*[:\-]\s*(.+)$', line_clean, re.IGNORECASE)
        if orgs_match:
            orgs_str = orgs_match.group(1)
            result['organizations'] = [o.strip() for o in re.split(r'[,،]', orgs_str) if o.strip()]
            continue

    # Return if we found at least a title
    if result['title']:
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

    # Skip patterns that indicate metadata, not titles
    skip_patterns = [
        r'^(?:Category|CATEGORY|التصنيف)',
        r'^(?:Countries?|الدول)',
        r'^(?:Orgs?|Organizations?|المنظمات)',
        r'^(?:Geopolitics?|Geographical)',
        r'^\d+\.',  # Numbered items
        r'^[IVX]+\.',  # Roman numerals
        r'^\*\*(?:Category|Countries|Orgs)',
    ]

    for line in lines[:8]:
        # Skip if matches metadata pattern
        if any(re.match(pat, line, re.IGNORECASE) for pat in skip_patterns):
            continue

        # Look for bold title: **Title Text Here**
        bold_match = re.match(r'^\*\*(.+?)\*\*$', line)
        if bold_match:
            title = clean_text(bold_match.group(1))
            # Skip if it's just a label like "Title" or has too many pipes
            if len(title) >= 15 and title.count('|') < 2:
                return truncate_title(title, 100)

        # Skip lines with too many pipes (category/tag lines)
        if line.count('|') >= 2:
            continue

        # Skip links and metadata
        if line.startswith('http') or line.startswith('@') or 'Link to' in line:
            continue
        if 't.me/' in line and len(line) < 50:
            continue
        if line.startswith('[') and '](' in line:
            continue

        # Use cleaned line if substantial
        cleaned = clean_text(line)
        cleaned = re.sub(r'^[🔴⚠️📢\s]+', '', cleaned)  # Remove emoji prefixes
        cleaned = re.sub(r'^[•\-\*\d\.]+\s*', '', cleaned)  # Remove bullet points

        has_letters = bool(re.search(r'[a-zA-Z\u0600-\u06FF]', cleaned))
        is_conclusion = cleaned.lower() in ['conclusion', 'الخاتمة', 'خاتمة', 'introduction', 'مقدمة']

        if has_letters and len(cleaned) >= 20 and cleaned.count('|') < 2 and not is_conclusion:
            return truncate_title(cleaned, 100)

    # Fallback: use first line if nothing else works
    if lines:
        cleaned = clean_text(lines[0])
        cleaned = re.sub(r'^[🔴⚠️📢\s]+', '', cleaned)
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


# =============================================================================
# MEDIA HANDLING
# =============================================================================

async def upload_media_to_storage(
    client: TelegramClient,
    supabase: Client,
    message: Message,
    article_id: str
) -> tuple[str | None, str | None]:
    """
    Download media from Telegram message and upload to Supabase Storage.
    Returns (image_url, video_url) tuple.
    """
    image_url = None
    video_url = None

    if not message.media:
        return image_url, video_url

    try:
        # Handle photos
        if isinstance(message.media, MessageMediaPhoto):
            # Download photo to bytes
            photo_bytes = await client.download_media(message.media, file=bytes)
            if photo_bytes and len(photo_bytes) <= MAX_IMAGE_SIZE:
                # Generate unique filename
                filename = f"{article_id.replace('/', '_')}_photo.jpg"

                # Upload to Supabase Storage
                result = supabase.storage.from_(MEDIA_BUCKET).upload(
                    path=filename,
                    file=photo_bytes,
                    file_options={"content-type": "image/jpeg", "upsert": "true"}
                )

                # Get public URL
                image_url = supabase.storage.from_(MEDIA_BUCKET).get_public_url(filename)
                print(f"      Uploaded image: {filename}")

        # Handle videos/documents
        elif isinstance(message.media, MessageMediaDocument):
            doc = message.media.document
            if doc and doc.mime_type:
                # Check if it's a video
                if doc.mime_type.startswith('video/'):
                    if doc.size <= MAX_VIDEO_SIZE:
                        # Download video to bytes
                        video_bytes = await client.download_media(message.media, file=bytes)
                        if video_bytes:
                            # Determine extension from mime type
                            ext = 'mp4' if 'mp4' in doc.mime_type else 'webm'
                            filename = f"{article_id.replace('/', '_')}_video.{ext}"

                            # Upload to Supabase Storage
                            result = supabase.storage.from_(MEDIA_BUCKET).upload(
                                path=filename,
                                file=video_bytes,
                                file_options={"content-type": doc.mime_type, "upsert": "true"}
                            )

                            # Get public URL
                            video_url = supabase.storage.from_(MEDIA_BUCKET).get_public_url(filename)
                            print(f"      Uploaded video: {filename}")
                    else:
                        print(f"      Skipped video (too large): {doc.size / 1024 / 1024:.1f}MB > {MAX_VIDEO_SIZE / 1024 / 1024}MB")

                # Check if it's an image (sometimes sent as document)
                elif doc.mime_type.startswith('image/'):
                    if doc.size <= MAX_IMAGE_SIZE:
                        photo_bytes = await client.download_media(message.media, file=bytes)
                        if photo_bytes:
                            ext = doc.mime_type.split('/')[-1]
                            if ext == 'jpeg':
                                ext = 'jpg'
                            filename = f"{article_id.replace('/', '_')}_photo.{ext}"

                            result = supabase.storage.from_(MEDIA_BUCKET).upload(
                                path=filename,
                                file=photo_bytes,
                                file_options={"content-type": doc.mime_type, "upsert": "true"}
                            )

                            image_url = supabase.storage.from_(MEDIA_BUCKET).get_public_url(filename)
                            print(f"      Uploaded image: {filename}")

    except Exception as e:
        print(f"      Error uploading media: {e}")

    return image_url, video_url


# =============================================================================
# MESSAGE PARSING
# =============================================================================

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
        '_message_id': first_message.id,  # For tracking
    }


# =============================================================================
# MAIN FETCH LOGIC
# =============================================================================

async def fetch_channel_messages(
    client: TelegramClient,
    supabase: Client,
    channel_username: str,
    channel: str,
    min_id: int = 0,
    limit: int = 2000,
    full_sync: bool = False
) -> tuple[list[dict], int]:
    """
    Fetch messages from a Telegram channel.

    Args:
        min_id: Only fetch messages with ID > min_id (for incremental sync)
        full_sync: If True, ignore min_id and fetch all messages

    Returns:
        (articles, max_message_id)
    """
    articles = []
    structured_count = 0
    multipart_count = 0
    media_count = 0
    max_id = min_id

    try:
        entity = await client.get_entity(channel_username)

        if full_sync:
            print(f"\n[FULL SYNC] Fetching ALL messages from @{channel_username} ({channel})...")
        else:
            print(f"\n[INCREMENTAL] Fetching messages from @{channel_username} ({channel}) since ID {min_id}...")

        # Collect all valid messages first
        raw_messages = []
        fetch_count = 0

        async for message in client.iter_messages(entity, limit=limit, min_id=min_id if not full_sync else 0):
            fetch_count += 1
            if isinstance(message, Message):
                # Track max ID
                if message.id > max_id:
                    max_id = message.id

                # Accept if has enough text OR has media with some text
                # Lower threshold (20 chars) to include short header messages for multi-part articles
                has_text = message.text and len(message.text.strip()) >= 20
                has_media_with_caption = message.media and message.text and len(message.text.strip()) >= 10
                if has_text or has_media_with_caption:
                    raw_messages.append(message)

        print(f"  Fetched {fetch_count} messages, {len(raw_messages)} valid articles")

        if not raw_messages:
            print(f"  No new messages to process")
            return [], max_id

        # Group multi-part messages (within 3 minutes of each other)
        message_groups = group_multipart_messages(raw_messages, time_threshold_seconds=180)
        print(f"  Grouped into {len(message_groups)} article groups")

        # Get existing articles with their media URLs to avoid re-uploading
        existing_data = {}
        try:
            existing = supabase.table('articles').select('telegram_id, image_url, video_url, content').eq('channel', channel).execute()
            existing_data = {
                row['telegram_id']: {
                    'image_url': row.get('image_url'),
                    'video_url': row.get('video_url'),
                    'content_hash': hashlib.md5(str(row.get('content', '')).encode()).hexdigest()
                }
                for row in existing.data
            }
            print(f"  Found {len(existing_data)} existing articles in DB")
        except Exception as e:
            print(f"  Warning: Could not fetch existing data: {e}")

        # Process each group
        for group in message_groups:
            article = combine_message_group(group, channel, channel_username)
            if article:
                telegram_id = article['telegram_id']
                existing_article = existing_data.get(telegram_id, {})

                # Check if article already has media in DB
                existing_img = existing_article.get('image_url')
                existing_vid = existing_article.get('video_url')

                if existing_img or existing_vid:
                    # Use existing media URLs - skip download/upload
                    image_url = existing_img
                    video_url = existing_vid
                    if existing_img or existing_vid:
                        media_count += 1
                else:
                    # Find and upload media from the group (new article or missing media)
                    image_url = None
                    video_url = None
                    for msg in group:
                        if msg.media and (image_url is None or video_url is None):
                            img, vid = await upload_media_to_storage(
                                client, supabase, msg, telegram_id
                            )
                            if img and image_url is None:
                                image_url = img
                            if vid and video_url is None:
                                video_url = vid
                            # Stop if we found both
                            if image_url and video_url:
                                break

                    if image_url or video_url:
                        media_count += 1

                # Add media URLs to article
                article['image_url'] = image_url
                article['video_url'] = video_url

                articles.append(article)
                if article.get('is_structured'):
                    structured_count += 1
                if article.get('_part_count', 1) > 1:
                    multipart_count += 1

        print(f"  Processed: {len(articles)} articles ({structured_count} structured, {multipart_count} multi-part, {media_count} with media)")

    except Exception as e:
        print(f"Error fetching @{channel_username}: {e}")
        import traceback
        traceback.print_exc()

    return articles, max_id


def smart_upsert_articles(
    supabase: Client,
    articles: list[dict],
    channel: str,
    existing_data: dict = None,
    full_sync: bool = False
) -> dict:
    """
    Smart upsert that only updates articles that have actually changed.

    Returns stats dict with counts.
    """
    stats = {
        'total': len(articles),
        'inserted': 0,
        'updated': 0,
        'skipped': 0,
        'errors': 0,
    }

    if not articles:
        return stats

    print(f"\n  Processing {len(articles)} articles...")

    # Fetch existing data if not provided
    if existing_data is None:
        try:
            existing = supabase.table('articles').select('telegram_id, content, title, category, image_url, video_url').eq('channel', channel).execute()
            existing_data = {row['telegram_id']: row for row in existing.data}
        except Exception as e:
            print(f"  Warning: Could not fetch existing data: {e}")
            existing_data = {}

    for article in articles:
        try:
            telegram_id = article['telegram_id']
            existing = existing_data.get(telegram_id)

            # Remove internal fields before saving
            article_data = {k: v for k, v in article.items() if not k.startswith('_')}

            if existing:
                # Check if content has actually changed
                new_hash = hash_article_content(article_data)
                old_hash = hash_article_content(existing)

                if new_hash == old_hash:
                    stats['skipped'] += 1
                    continue
                else:
                    # Content changed, update
                    supabase.table('articles').upsert(
                        article_data,
                        on_conflict='telegram_id'
                    ).execute()
                    stats['updated'] += 1
            else:
                # New article, insert
                supabase.table('articles').upsert(
                    article_data,
                    on_conflict='telegram_id'
                ).execute()
                stats['inserted'] += 1

        except Exception as e:
            stats['errors'] += 1
            print(f"    Error saving {article.get('telegram_id', 'unknown')}: {e}")

    print(f"  Results: {stats['inserted']} new, {stats['updated']} updated, {stats['skipped']} unchanged, {stats['errors']} errors")

    # Clean up orphaned entries only on full sync
    if full_sync:
        print(f"\n  Cleaning up orphaned entries...")
        try:
            valid_ids = {article['telegram_id'] for article in articles}
            existing_ids = set(existing_data.keys())
            orphaned_ids = existing_ids - valid_ids

            if orphaned_ids:
                print(f"  Found {len(orphaned_ids)} orphaned entries to remove")
                for orphan_id in orphaned_ids:
                    try:
                        supabase.table('articles').delete().eq('telegram_id', orphan_id).execute()
                    except Exception as e:
                        print(f"    Error deleting {orphan_id}: {e}")
                print(f"  Removed {len(orphaned_ids)} orphaned entries")
            else:
                print(f"  No orphaned entries found")
        except Exception as e:
            print(f"  Error during cleanup: {e}")

    return stats


# =============================================================================
# MAIN
# =============================================================================

async def main():
    """Main function to fetch and store articles."""
    # Parse command line arguments
    parser = argparse.ArgumentParser(description='Fetch Telegram articles for The Observer')
    parser.add_argument('--full', action='store_true', help='Force full sync (ignore last sync state)')
    parser.add_argument('--channel', choices=['en', 'ar'], help='Sync only one channel')
    parser.add_argument('--limit', type=int, default=2000, help='Maximum messages to fetch per channel')
    args = parser.parse_args()

    print("=" * 60)
    print("The Observer - Telegram Article Fetcher")
    print("OPTIMIZED: Incremental sync with change detection")
    print("=" * 60)

    if args.full:
        print("\n*** FULL SYNC MODE - Will fetch ALL messages ***\n")
    else:
        print("\n*** INCREMENTAL MODE - Only fetching new messages ***\n")

    if not API_ID or not API_HASH:
        print("\nError: Missing Telegram API credentials.")
        return

    if not SUPABASE_KEY:
        print("\nError: Missing Supabase service key.")
        return

    # Load sync state
    sync_state = load_sync_state()
    if sync_state and not args.full:
        print("Loaded sync state:")
        for ch, state in sync_state.items():
            print(f"  {ch}: last_id={state.get('last_message_id', 0)}, last_sync={state.get('last_sync', 'never')}")

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
        await client.connect()

        if not await client.is_user_authorized():
            print("Session not authorized. Please run login_telegram.py first to authenticate.")
            print("Or set TELEGRAM_SESSION_STRING in .env for non-interactive mode.")
            await client.disconnect()
            return

    print("Connected to Telegram!")

    total_stats = {
        'total': 0,
        'inserted': 0,
        'updated': 0,
        'skipped': 0,
        'errors': 0,
    }

    # Determine which channels to sync
    channels_to_sync = CHANNELS.items()
    if args.channel:
        channels_to_sync = [(args.channel, CHANNELS[args.channel])]

    for channel, username in channels_to_sync:
        # Get last synced ID for this channel
        last_id = 0 if args.full else get_last_synced_id(sync_state, channel)

        # Fetch messages
        articles, max_id = await fetch_channel_messages(
            client, supabase, username, channel,
            min_id=last_id,
            limit=args.limit,
            full_sync=args.full
        )

        if articles:
            # Smart upsert with change detection
            stats = smart_upsert_articles(supabase, articles, channel, full_sync=args.full)

            # Update totals
            for key in total_stats:
                total_stats[key] += stats[key]

            # Update sync state with new max ID
            update_sync_state(sync_state, channel, max_id, len(articles))
        else:
            # Even if no articles, update the max_id if we got one
            if max_id > last_id:
                update_sync_state(sync_state, channel, max_id, 0)

    # Save sync state
    save_sync_state(sync_state)

    await client.disconnect()

    print("\n" + "=" * 60)
    print("SYNC COMPLETE")
    print("=" * 60)
    print(f"Total processed: {total_stats['total']}")
    print(f"  New articles:  {total_stats['inserted']}")
    print(f"  Updated:       {total_stats['updated']}")
    print(f"  Unchanged:     {total_stats['skipped']}")
    print(f"  Errors:        {total_stats['errors']}")
    print("=" * 60)


if __name__ == '__main__':
    asyncio.run(main())
