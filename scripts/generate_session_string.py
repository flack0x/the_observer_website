"""
Generate Telegram StringSession for GitHub Actions

This script creates a new session and outputs the StringSession format
that you can copy to your GitHub secret TELEGRAM_SESSION_STRING.

Run: python generate_session_string.py
"""

import os
import asyncio
from dotenv import load_dotenv
from telethon import TelegramClient
from telethon.sessions import StringSession

load_dotenv()

API_ID = os.getenv('TELEGRAM_API_ID')
API_HASH = os.getenv('TELEGRAM_API_HASH')
PHONE = os.getenv('TELEGRAM_PHONE')

async def main():
    if not API_ID or not API_HASH:
        print("Error: Missing TELEGRAM_API_ID or TELEGRAM_API_HASH in .env")
        return

    print("=" * 60)
    print("Telegram StringSession Generator")
    print("=" * 60)
    print()

    # Create client with StringSession (empty = new session)
    client = TelegramClient(StringSession(), int(API_ID), API_HASH)

    await client.start(phone=PHONE)

    session_string = client.session.save()

    print()
    print("=" * 60)
    print("SUCCESS! Copy the string below to your GitHub secret:")
    print("Secret name: TELEGRAM_SESSION_STRING")
    print("=" * 60)
    print()
    print(session_string)
    print()
    print("=" * 60)

    await client.disconnect()

if __name__ == '__main__':
    asyncio.run(main())
