"""
Export existing Telegram session to a StringSession.
This string can be stored as a GitHub secret for CI/CD automation.

Usage: python scripts/export_session.py
"""
import os
import asyncio
from telethon import TelegramClient
from telethon.sessions import StringSession
from dotenv import load_dotenv

load_dotenv()

API_ID = int(os.getenv('TELEGRAM_API_ID', ''))
API_HASH = os.getenv('TELEGRAM_API_HASH', '')

async def export_session():
    # Load existing session file
    session_path = os.path.join(os.path.dirname(__file__), 'observer_session')

    if not os.path.exists(session_path + '.session'):
        print("Error: No existing session file found at", session_path + '.session')
        print("Please run login_telegram.py first to create a session.")
        return

    # Connect with existing file session
    client = TelegramClient(session_path, API_ID, API_HASH)
    await client.connect()

    if not await client.is_user_authorized():
        print("Error: Session is not authorized. Please run login_telegram.py first.")
        await client.disconnect()
        return

    # Get the session string
    session_string = StringSession.save(client.session)

    print("\n" + "=" * 60)
    print("TELEGRAM_SESSION_STRING (add this as a GitHub secret):")
    print("=" * 60)
    print(session_string)
    print("=" * 60)
    print("\nIMPORTANT: Keep this string secret! It provides full access to your Telegram account.")
    print("\nAdd this as TELEGRAM_SESSION_STRING in GitHub Secrets:")
    print("  1. Go to your repo > Settings > Secrets and variables > Actions")
    print("  2. Click 'New repository secret'")
    print("  3. Name: TELEGRAM_SESSION_STRING")
    print("  4. Value: [paste the string above]")

    await client.disconnect()

if __name__ == '__main__':
    asyncio.run(export_session())
