"""Check recent articles in database."""
import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://gbqvivmfivsuvvdkoiuc.supabase.co')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Get website articles
result = supabase.table('articles').select('telegram_id, channel, title, category, image_url').like('telegram_id', 'website/%').execute()

print("Website Articles:")
print("=" * 80)
for article in result.data:
    print(f"ID: {article['telegram_id']}")
    print(f"Channel: {article['channel']}")
    print(f"Title: {article['title'][:60]}...")
    print(f"Category: {article['category']}")
    print(f"Image: {article['image_url'] or 'None'}")
    print("-" * 80)
