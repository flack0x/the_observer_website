#!/usr/bin/env python3
"""
Fetch news headlines from international news sources via RSS feeds.
Stores headlines in Supabase for the breaking news ticker.
"""

import os
import hashlib
import feedparser
import requests
from datetime import datetime, timezone
from typing import Optional
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    raise ValueError("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# News sources with their RSS feeds
# Format: (name, country, rss_url, language, category)
NEWS_SOURCES = [
    # Iraq
    ("Iraqi News Agency", "Iraq", "https://ina.iq/eng/rss.xml", "en", "Middle East"),
    ("Rudaw", "Iraq", "https://www.rudaw.net/english/rss", "en", "Middle East"),

    # Iran
    ("Press TV", "Iran", "https://www.presstv.ir/RSS", "en", "Middle East"),
    ("Tasnim News", "Iran", "https://www.tasnimnews.com/en/rss/feed", "en", "Middle East"),
    ("IRNA", "Iran", "https://en.irna.ir/rss.aspx", "en", "Middle East"),
    ("Fars News", "Iran", "https://www.farsnews.ir/en/rss", "en", "Middle East"),

    # Lebanon
    ("Al Mayadeen", "Lebanon", "https://english.almayadeen.net/rss/all-news", "en", "Middle East"),
    ("Daily Star Lebanon", "Lebanon", "https://www.dailystar.com.lb/RSS.aspx?feed=1", "en", "Middle East"),

    # Russia
    ("RT", "Russia", "https://www.rt.com/rss/news/", "en", "World"),
    ("TASS", "Russia", "https://tass.com/rss/v2.xml", "en", "World"),
    ("Sputnik", "Russia", "https://sputnikglobe.com/export/rss2/archive/index.xml", "en", "World"),

    # USA
    ("AP News", "USA", "https://apnews.com/world.rss", "en", "World"),
    ("Reuters", "USA", "https://www.reutersagency.com/feed/?taxonomy=best-topics&post_type=best", "en", "World"),

    # China
    ("Xinhua", "China", "https://english.news.cn/rss.xml", "en", "Asia"),
    ("CGTN", "China", "https://www.cgtn.com/rss/news.xml", "en", "Asia"),
    ("Global Times", "China", "https://www.globaltimes.cn/rss/outbrain.xml", "en", "Asia"),

    # UK
    ("BBC World", "UK", "https://feeds.bbci.co.uk/news/world/rss.xml", "en", "World"),
    ("Al Jazeera", "UK", "https://www.aljazeera.com/xml/rss/all.xml", "en", "World"),

    # France
    ("France 24", "France", "https://www.france24.com/en/rss", "en", "Europe"),

    # Japan
    ("NHK World", "Japan", "https://www3.nhk.or.jp/rss/news/cat0.xml", "en", "Asia"),

    # Egypt
    ("Ahram Online", "Egypt", "https://english.ahram.org.eg/Rss.aspx", "en", "Middle East"),

    # South Africa
    ("News24", "South Africa", "https://feeds.news24.com/articles/news24/World/rss", "en", "Africa"),

    # Yemen
    ("Yemen Press", "Yemen", "https://en.yemenpress.org/feed/", "en", "Middle East"),

    # Arabic Sources
    ("Al Jazeera Arabic", "Qatar", "https://www.aljazeera.net/aljazeerarss/a7c186be-1baa-4bd4-9d80-a84db769f779/73d0e1b4-532f-45ef-b135-bfdff8b8cab9", "ar", "World"),
    ("Sky News Arabia", "UAE", "https://www.skynewsarabia.com/rss", "ar", "World"),
]

# User agent to avoid blocks
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

def generate_headline_id(source: str, title: str) -> str:
    """Generate a unique ID for a headline."""
    content = f"{source}:{title}"
    return hashlib.md5(content.encode()).hexdigest()[:16]

def parse_date(entry) -> Optional[datetime]:
    """Parse publication date from RSS entry."""
    if hasattr(entry, 'published_parsed') and entry.published_parsed:
        try:
            return datetime(*entry.published_parsed[:6], tzinfo=timezone.utc)
        except Exception:
            pass
    if hasattr(entry, 'updated_parsed') and entry.updated_parsed:
        try:
            return datetime(*entry.updated_parsed[:6], tzinfo=timezone.utc)
        except Exception:
            pass
    return None

def fetch_rss_feed(url: str) -> Optional[feedparser.FeedParserDict]:
    """Fetch and parse an RSS feed."""
    try:
        response = requests.get(url, headers=HEADERS, timeout=15)
        response.raise_for_status()
        return feedparser.parse(response.content)
    except requests.RequestException as e:
        print(f"  Error fetching {url}: {e}")
        return None
    except Exception as e:
        print(f"  Error parsing {url}: {e}")
        return None

def clean_title(title: str) -> str:
    """Clean and truncate title."""
    # Remove HTML tags if any
    import re
    title = re.sub(r'<[^>]+>', '', title)
    # Remove extra whitespace
    title = ' '.join(title.split())
    # Truncate if too long
    if len(title) > 150:
        title = title[:147] + "..."
    return title

def fetch_headlines_from_source(name: str, country: str, rss_url: str, language: str, category: str) -> list:
    """Fetch headlines from a single source."""
    print(f"Fetching from {name} ({country})...")

    feed = fetch_rss_feed(rss_url)
    if not feed or not feed.entries:
        print(f"  No entries found for {name}")
        return []

    headlines = []
    for entry in feed.entries[:5]:  # Only take top 5 headlines per source
        title = entry.get('title', '')
        if not title:
            continue

        title = clean_title(title)
        url = entry.get('link', '')
        published_at = parse_date(entry)

        headline_id = generate_headline_id(name, title)

        headlines.append({
            "headline_id": headline_id,
            "source_name": name,
            "source_country": country,
            "title": title,
            "url": url,
            "category": category,
            "language": language,
            "published_at": published_at.isoformat() if published_at else None,
            "fetched_at": datetime.now(timezone.utc).isoformat(),
            "is_active": True,
        })

    print(f"  Found {len(headlines)} headlines from {name}")
    return headlines

def deactivate_old_headlines():
    """Deactivate headlines older than 24 hours."""
    try:
        cutoff = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        supabase.table("news_headlines").update({"is_active": False}).lt("fetched_at", cutoff.isoformat()).execute()
        print("Deactivated old headlines")
    except Exception as e:
        print(f"Error deactivating old headlines: {e}")

def save_headlines(headlines: list):
    """Save headlines to Supabase using upsert."""
    if not headlines:
        return

    try:
        # Upsert to handle duplicates
        result = supabase.table("news_headlines").upsert(
            headlines,
            on_conflict="headline_id"
        ).execute()
        print(f"Saved {len(headlines)} headlines to database")
    except Exception as e:
        print(f"Error saving headlines: {e}")

def main():
    """Main function to fetch all headlines."""
    print("=" * 60)
    print("Fetching News Headlines")
    print("=" * 60)

    all_headlines = []

    for source in NEWS_SOURCES:
        name, country, rss_url, language, category = source
        try:
            headlines = fetch_headlines_from_source(name, country, rss_url, language, category)
            all_headlines.extend(headlines)
        except Exception as e:
            print(f"  Error processing {name}: {e}")

    print("-" * 60)
    print(f"Total headlines fetched: {len(all_headlines)}")

    # Deactivate old headlines
    deactivate_old_headlines()

    # Save to database
    save_headlines(all_headlines)

    print("=" * 60)
    print("Done!")

if __name__ == "__main__":
    main()
