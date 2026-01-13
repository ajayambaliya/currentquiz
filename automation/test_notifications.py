import logging
import os
import sys
from pathlib import Path

# Add project root to path for imports
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from src.notification_sender import NotificationSender
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def test_notification():
    """
    Simple script to test OneSignal notification sending.
    Make sure you have ONESIGNAL_APP_ID and ONESIGNAL_REST_API_KEY in your .env file.
    """
    # Load environment variables
    load_dotenv()
    
    app_id = os.getenv("ONESIGNAL_APP_ID")
    api_key = os.getenv("ONESIGNAL_REST_API_KEY")
    
    if not app_id or not api_key:
        logger.error("❌ Missing ONESIGNAL_APP_ID or ONESIGNAL_REST_API_KEY in .env file")
        print("\nPrerequsite:")
        print("1. Go to OneSignal Dashboard > Settings > Key & IDs")
        print("2. Copy 'OneSignal App ID' and 'REST API Key'")
        print("3. Add them to automation/.env")
        return

    logger.info("Initializing NotificationSender...")
    sender = NotificationSender(app_id=app_id, api_key=api_key)
    
    if not sender.enabled:
        logger.error("❌ NotificationSender is not enabled. Check credentials.")
        return

    test_date = "13 January 2026"
    test_slug = "test-quiz-notification"
    
    logger.info(f"Sending test notification for: {test_date}")
    success = sender.send_quiz_notification(test_date, test_slug)
    
    if success:
        print("\n✅ SUCCESS! Notification sent successfully.")
        print("Check your phone/browser if you have subscribed to the app.")
    else:
        print("\n❌ FAILED! Check the logs above for error details.")

if __name__ == "__main__":
    test_notification()
