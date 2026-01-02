"""
Telegram Login Script
Run this first to authenticate with Telegram.
Once logged in, the session is saved and fetch_telegram.py will work automatically.
"""

import os
import asyncio
from dotenv import load_dotenv
from telethon import TelegramClient

load_dotenv()

API_ID = os.getenv('TELEGRAM_API_ID')
API_HASH = os.getenv('TELEGRAM_API_HASH')
PHONE = os.getenv('TELEGRAM_PHONE')

async def main():
    print("Connecting to Telegram...")
    client = TelegramClient('observer_session', int(API_ID), API_HASH)

    await client.start(phone=PHONE)

    print("\nLogged in successfully!")
    print("Session saved to 'observer_session.session'")
    print("\nYou can now run 'python fetch_telegram.py' to fetch articles.")

    await client.disconnect()

if __name__ == '__main__':
    asyncio.run(main())
