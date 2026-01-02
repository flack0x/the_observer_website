"""
Article Analytics Engine for The Observer
Analyzes all articles and computes metrics for the intelligence dashboard.

Runs after fetch_telegram.py in GitHub Actions.
"""

import os
import re
import json
from datetime import datetime, timedelta
from collections import Counter
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

# Supabase credentials
SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://gbqvivmfivsuvvdkoiuc.supabase.co')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

# =============================================================================
# ENTITY DEFINITIONS - Countries, Organizations, Key Figures
# =============================================================================

COUNTRIES = {
    # Middle East
    'israel': ['israel', 'israeli', 'idf', 'tel aviv', 'jerusalem', 'netanyahu', 'zionist'],
    'palestine': ['palestine', 'palestinian', 'gaza', 'west bank', 'hamas', 'ramallah'],
    'iran': ['iran', 'iranian', 'tehran', 'irgc', 'khamenei', 'persian'],
    'yemen': ['yemen', 'yemeni', 'houthi', 'houthis', 'sanaa', 'aden', 'ansar allah'],
    'saudi_arabia': ['saudi', 'arabia', 'riyadh', 'mbs', 'bin salman', 'kingdom'],
    'uae': ['emirates', 'emirati', 'uae', 'abu dhabi', 'dubai'],
    'lebanon': ['lebanon', 'lebanese', 'beirut', 'hezbollah', 'nasrallah'],
    'syria': ['syria', 'syrian', 'damascus', 'assad', 'idlib', 'aleppo'],
    'iraq': ['iraq', 'iraqi', 'baghdad', 'kurdish', 'kurdistan', 'pmu', 'hashd'],
    'jordan': ['jordan', 'jordanian', 'amman'],
    'egypt': ['egypt', 'egyptian', 'cairo', 'sisi', 'sinai'],
    'turkey': ['turkey', 'turkish', 'ankara', 'erdogan', 'ottoman'],
    'qatar': ['qatar', 'qatari', 'doha'],
    'bahrain': ['bahrain', 'bahraini', 'manama'],
    'oman': ['oman', 'omani', 'muscat'],
    'kuwait': ['kuwait', 'kuwaiti'],

    # Major Powers
    'usa': ['united states', 'america', 'american', 'washington', 'pentagon', 'biden', 'trump', 'white house', 'cia', 'us '],
    'russia': ['russia', 'russian', 'moscow', 'kremlin', 'putin', 'soviet'],
    'china': ['china', 'chinese', 'beijing', 'xi jinping', 'prc'],
    'uk': ['britain', 'british', 'uk', 'london', 'england'],
    'france': ['france', 'french', 'paris', 'macron'],
    'germany': ['germany', 'german', 'berlin'],
}

ORGANIZATIONS = {
    'idf': ['idf', 'israel defense forces', 'israeli military', 'israeli army', 'israeli forces'],
    'hamas': ['hamas', 'al-qassam', 'qassam brigades', 'izz ad-din'],
    'hezbollah': ['hezbollah', 'hizballah', 'nasrallah', 'lebanese resistance'],
    'houthis': ['houthi', 'houthis', 'ansar allah', 'ansarallah'],
    'irgc': ['irgc', 'revolutionary guard', 'quds force', 'iranian guard'],
    'pentagon': ['pentagon', 'us military', 'us forces', 'centcom', 'american military'],
    'cia': ['cia', 'langley', 'central intelligence'],
    'mossad': ['mossad', 'israeli intelligence', 'shin bet'],
    'un': ['united nations', ' un ', 'security council', 'unsc'],
    'nato': ['nato', 'atlantic alliance', 'north atlantic'],
    'eu': ['european union', ' eu ', 'brussels'],
    'pmu': ['pmu', 'popular mobilization', 'hashd al-shaabi', 'iraqi militia'],
    'isis': ['isis', 'isil', 'islamic state', 'daesh'],
    'al_qaeda': ['al qaeda', 'al-qaeda', 'aqap'],
}

CONFLICT_KEYWORDS = {
    'military_action': ['strike', 'attack', 'bomb', 'missile', 'drone', 'airstrike', 'offensive', 'assault', 'raid'],
    'casualties': ['killed', 'dead', 'wounded', 'injured', 'casualties', 'martyred', 'death toll'],
    'diplomacy': ['negotiation', 'ceasefire', 'truce', 'peace', 'talks', 'agreement', 'deal', 'treaty'],
    'escalation': ['escalation', 'tension', 'threat', 'warning', 'retaliation', 'response'],
    'weapons': ['weapon', 'arms', 'missile', 'rocket', 'tank', 'aircraft', 'warship', 'nuclear'],
    'intelligence': ['intelligence', 'spy', 'covert', 'secret', 'leak', 'surveillance', 'intercept'],
}

SENTIMENT_WORDS = {
    'negative': ['attack', 'kill', 'dead', 'war', 'destroy', 'threat', 'crisis', 'conflict', 'strike', 'bomb',
                 'casualties', 'violence', 'terror', 'hostile', 'enemy', 'aggression', 'massacre', 'genocide'],
    'positive': ['peace', 'ceasefire', 'agreement', 'negotiation', 'diplomatic', 'aid', 'support', 'alliance',
                 'cooperation', 'treaty', 'reconciliation', 'stability', 'progress', 'success'],
    'neutral': ['announce', 'report', 'state', 'confirm', 'according', 'source', 'official', 'statement']
}


def count_mentions(text: str, keywords: list[str]) -> int:
    """Count how many times any of the keywords appear in text."""
    text_lower = text.lower()
    count = 0
    for keyword in keywords:
        count += len(re.findall(r'\b' + re.escape(keyword) + r'\b', text_lower))
    return count


def analyze_countries(articles: list[dict]) -> dict:
    """Analyze country mentions across all articles."""
    country_counts = Counter()

    for article in articles:
        text = f"{article['title']} {article['content']}".lower()
        for country, keywords in COUNTRIES.items():
            mentions = count_mentions(text, keywords)
            if mentions > 0:
                country_counts[country] += mentions

    # Return top 15 countries
    return dict(country_counts.most_common(15))


def analyze_organizations(articles: list[dict]) -> dict:
    """Analyze organization mentions across all articles."""
    org_counts = Counter()

    for article in articles:
        text = f"{article['title']} {article['content']}".lower()
        for org, keywords in ORGANIZATIONS.items():
            mentions = count_mentions(text, keywords)
            if mentions > 0:
                org_counts[org] += mentions

    return dict(org_counts.most_common(15))


def analyze_conflict_keywords(articles: list[dict]) -> dict:
    """Analyze conflict-related keywords."""
    keyword_counts = {category: Counter() for category in CONFLICT_KEYWORDS}
    category_totals = Counter()

    for article in articles:
        text = f"{article['title']} {article['content']}".lower()
        for category, keywords in CONFLICT_KEYWORDS.items():
            for keyword in keywords:
                count = len(re.findall(r'\b' + re.escape(keyword) + r'\b', text))
                if count > 0:
                    keyword_counts[category][keyword] += count
                    category_totals[category] += count

    return {
        'by_category': dict(category_totals),
        'top_keywords': {cat: dict(counts.most_common(5)) for cat, counts in keyword_counts.items()}
    }


def analyze_sentiment(articles: list[dict]) -> dict:
    """Simple keyword-based sentiment analysis."""
    sentiment_counts = {'negative': 0, 'positive': 0, 'neutral': 0}
    article_sentiments = []

    for article in articles:
        text = f"{article['title']} {article['content']}".lower()

        neg_count = sum(count_mentions(text, [w]) for w in SENTIMENT_WORDS['negative'])
        pos_count = sum(count_mentions(text, [w]) for w in SENTIMENT_WORDS['positive'])

        if neg_count > pos_count * 1.5:
            sentiment = 'negative'
        elif pos_count > neg_count * 1.5:
            sentiment = 'positive'
        else:
            sentiment = 'neutral'

        sentiment_counts[sentiment] += 1
        article_sentiments.append(sentiment)

    return {
        'distribution': sentiment_counts,
        'percentages': {
            k: round(v / len(articles) * 100, 1) if articles else 0
            for k, v in sentiment_counts.items()
        }
    }


def analyze_categories(articles: list[dict]) -> dict:
    """Analyze category distribution."""
    category_counts = Counter()
    for article in articles:
        category_counts[article.get('category', 'Unknown')] += 1
    return dict(category_counts.most_common())


def analyze_temporal(articles: list[dict]) -> dict:
    """Analyze temporal patterns."""
    now = datetime.now()
    today = now.date()
    week_ago = today - timedelta(days=7)
    month_ago = today - timedelta(days=30)

    daily_counts = Counter()
    hourly_counts = Counter()
    articles_today = 0
    articles_this_week = 0
    articles_this_month = 0

    for article in articles:
        try:
            date_str = article.get('telegram_date', '')
            if date_str:
                dt = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
                article_date = dt.date()

                # Daily counts for last 30 days
                if article_date >= month_ago:
                    daily_counts[article_date.isoformat()] += 1

                # Hourly distribution
                hourly_counts[dt.hour] += 1

                # Period counts
                if article_date == today:
                    articles_today += 1
                if article_date >= week_ago:
                    articles_this_week += 1
                if article_date >= month_ago:
                    articles_this_month += 1
        except (ValueError, TypeError):
            continue

    # Build daily trend (last 14 days)
    daily_trend = []
    for i in range(14, -1, -1):
        date = (today - timedelta(days=i)).isoformat()
        daily_trend.append({
            'date': date,
            'count': daily_counts.get(date, 0)
        })

    return {
        'articles_today': articles_today,
        'articles_this_week': articles_this_week,
        'articles_this_month': articles_this_month,
        'daily_trend': daily_trend,
        'hourly_distribution': dict(sorted(hourly_counts.items())),
        'peak_hour': hourly_counts.most_common(1)[0][0] if hourly_counts else 12
    }


def analyze_channels(articles: list[dict]) -> dict:
    """Analyze channel distribution."""
    channel_counts = Counter()
    for article in articles:
        channel_counts[article.get('channel', 'unknown')] += 1

    total = sum(channel_counts.values())
    return {
        'counts': dict(channel_counts),
        'percentages': {
            k: round(v / total * 100, 1) if total else 0
            for k, v in channel_counts.items()
        }
    }


def extract_trending_topics(articles: list[dict], days: int = 7) -> list[dict]:
    """Extract trending topics from recent articles."""
    cutoff = datetime.now() - timedelta(days=days)
    recent_articles = []

    for article in articles:
        try:
            date_str = article.get('telegram_date', '')
            if date_str:
                dt = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
                if dt.replace(tzinfo=None) >= cutoff:
                    recent_articles.append(article)
        except (ValueError, TypeError):
            continue

    # Count all entity mentions in recent articles
    all_mentions = Counter()

    for article in recent_articles:
        text = f"{article['title']} {article['content']}".lower()

        for country, keywords in COUNTRIES.items():
            if count_mentions(text, keywords) > 0:
                all_mentions[country] += 1

        for org, keywords in ORGANIZATIONS.items():
            if count_mentions(text, keywords) > 0:
                all_mentions[org] += 1

    # Return top trending
    return [{'topic': topic, 'mentions': count} for topic, count in all_mentions.most_common(10)]


def compute_all_metrics(articles: list[dict]) -> dict:
    """Compute all metrics from articles."""
    print(f"Analyzing {len(articles)} articles...")

    metrics = {
        'computed_at': datetime.now().isoformat(),
        'total_articles': len(articles),
        'countries': analyze_countries(articles),
        'organizations': analyze_organizations(articles),
        'categories': analyze_categories(articles),
        'temporal': analyze_temporal(articles),
        'channels': analyze_channels(articles),
        'sentiment': analyze_sentiment(articles),
        'conflict_analysis': analyze_conflict_keywords(articles),
        'trending': extract_trending_topics(articles),
    }

    return metrics


def save_metrics(supabase: Client, metrics: dict):
    """Save computed metrics to Supabase."""
    print("Saving metrics to Supabase...")

    # Delete old metrics (keep only latest)
    try:
        supabase.table('metrics').delete().neq('id', 0).execute()
    except Exception as e:
        print(f"Note: Could not clear old metrics: {e}")

    # Insert new metrics as a single snapshot
    supabase.table('metrics').insert({
        'metric_type': 'full_snapshot',
        'data': metrics,
        'computed_at': metrics['computed_at']
    }).execute()

    print("Metrics saved successfully!")


def main():
    """Main function to analyze articles and save metrics."""
    print("=" * 60)
    print("The Observer - Article Analytics Engine")
    print("=" * 60)

    if not SUPABASE_KEY:
        print("Error: Missing SUPABASE_SERVICE_KEY")
        return

    # Connect to Supabase
    print("\nConnecting to Supabase...")
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

    # Fetch all articles
    print("Fetching all articles...")
    response = supabase.table('articles').select('*').execute()
    articles = response.data

    if not articles:
        print("No articles found!")
        return

    print(f"Found {len(articles)} articles")

    # Compute metrics
    metrics = compute_all_metrics(articles)

    # Save to database
    save_metrics(supabase, metrics)

    # Print summary
    print("\n" + "=" * 60)
    print("ANALYTICS SUMMARY")
    print("=" * 60)
    print(f"Total Articles: {metrics['total_articles']}")
    print(f"Articles Today: {metrics['temporal']['articles_today']}")
    print(f"Articles This Week: {metrics['temporal']['articles_this_week']}")
    print(f"\nTop Countries:")
    for country, count in list(metrics['countries'].items())[:5]:
        print(f"  - {country}: {count} mentions")
    print(f"\nTop Organizations:")
    for org, count in list(metrics['organizations'].items())[:5]:
        print(f"  - {org}: {count} mentions")
    print(f"\nSentiment: {metrics['sentiment']['percentages']}")
    print("=" * 60)


if __name__ == '__main__':
    main()
