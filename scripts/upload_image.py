"""
Image Uploader for The Observer
Uploads an image to Supabase Storage and updates article records.

Usage:
    python scripts/upload_image.py <image_path> <article_slug>

Example:
    python scripts/upload_image.py ./isw_map.png 2026-iran-protests-analysis
"""

import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

# Supabase credentials
SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://gbqvivmfivsuvvdkoiuc.supabase.co')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

# Storage bucket name
MEDIA_BUCKET = 'article-media'

# Article ID prefix for manual website articles
ARTICLE_PREFIX = 'website'


def upload_image(supabase: Client, image_path: str, article_slug: str) -> str | None:
    """Upload an image to Supabase Storage and return the public URL."""

    if not os.path.exists(image_path):
        print(f"Error: File not found: {image_path}")
        return None

    # Read image file
    with open(image_path, 'rb') as f:
        image_bytes = f.read()

    # Determine content type
    ext = os.path.splitext(image_path)[1].lower()
    content_types = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
    }
    content_type = content_types.get(ext, 'image/png')

    # Generate filename
    filename = f"{ARTICLE_PREFIX}_{article_slug}_photo{ext}"

    try:
        # Upload to Supabase Storage
        result = supabase.storage.from_(MEDIA_BUCKET).upload(
            path=filename,
            file=image_bytes,
            file_options={"content-type": content_type, "upsert": "true"}
        )

        # Get public URL
        image_url = supabase.storage.from_(MEDIA_BUCKET).get_public_url(filename)
        print(f"Uploaded image: {filename}")
        print(f"URL: {image_url}")
        return image_url

    except Exception as e:
        print(f"Error uploading image: {e}")
        return None


def update_articles_with_image(supabase: Client, article_slug: str, image_url: str):
    """Update both EN and AR articles with the image URL."""

    for channel in ['en', 'ar']:
        article_id = f"{ARTICLE_PREFIX}/{article_slug}-{channel}"
        try:
            result = supabase.table('articles').update(
                {'image_url': image_url}
            ).eq('telegram_id', article_id).execute()
            print(f"Updated {channel.upper()} article with image URL")
        except Exception as e:
            print(f"Error updating {channel} article: {e}")


def main():
    """Main function."""
    if len(sys.argv) < 3:
        print("Usage: python upload_image.py <image_path> <article_slug>")
        print("Example: python upload_image.py ./isw_map.png 2026-iran-protests-analysis")
        return

    image_path = sys.argv[1]
    article_slug = sys.argv[2]

    print("=" * 60)
    print("The Observer - Image Uploader")
    print("=" * 60)

    if not SUPABASE_KEY:
        print("\nError: Missing SUPABASE_SERVICE_KEY in environment.")
        return

    print("\nConnecting to Supabase...")
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    print("Connected!")

    print(f"\nUploading image: {image_path}")
    image_url = upload_image(supabase, image_path, article_slug)

    if image_url:
        print(f"\nUpdating articles...")
        update_articles_with_image(supabase, article_slug, image_url)
        print("\nDone!")
    else:
        print("\nFailed to upload image.")


if __name__ == '__main__':
    main()
