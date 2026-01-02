"""
Telegram Login with Verification Code
Run this after receiving the SMS/Telegram code.

Usage: python login_with_code.py <verification_code>
Example: python login_with_code.py 12345
"""

import os
import sys
import asyncio
from dotenv import load_dotenv
from telethon import TelegramClient

load_dotenv()

API_ID = os.getenv('TELEGRAM_API_ID')
API_HASH = os.getenv('TELEGRAM_API_HASH')
PHONE = os.getenv('TELEGRAM_PHONE')

async def main():
    if len(sys.argv) < 2:
        print("Usage: python login_with_code.py <verification_code>")
        print("Example: python login_with_code.py 12345")
        sys.exit(1)

    code = sys.argv[1]

    if not API_ID or not API_HASH or not PHONE:
        print("Error: Missing Telegram credentials in .env file")
        print("Required: TELEGRAM_API_ID, TELEGRAM_API_HASH, TELEGRAM_PHONE")
        sys.exit(1)

    client = TelegramClient('observer_session', int(API_ID), API_HASH)
    await client.connect()

    if not await client.is_user_authorized():
        await client.send_code_request(PHONE)
        try:
            await client.sign_in(PHONE, code)
            print("Logged in successfully!")
            print("Session saved to 'observer_session.session'")
        except Exception as e:
            print(f"Login failed: {e}")
            sys.exit(1)
    else:
        print("Already logged in!")

    await client.disconnect()

if __name__ == '__main__':
    asyncio.run(main())
