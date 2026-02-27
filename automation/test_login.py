import sys
import logging
from dotenv import load_dotenv

# Provide fallback search for .env.local
load_dotenv('.env.local')

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

from src.login import LoginManager, AuthenticationError

def test_login():
    logger.info("Starting isolated Login Test...")
    try:
        # The LoginManager automatically picks up LOGIN_EMAIL and LOGIN_PASSWORD from os.environ
        manager = LoginManager(use_online=False)
        
        logger.info(f"Targeting Email: {manager.email}")
        logger.info("Attempting to connect to PendulumEdu and authenticate...")
        
        # This triggers the login logic
        session = manager.login()
        
        logger.info("✅ SUCCESS! Successfully authenticated and retrieved session cookies.")
        logger.info(f"Cookies retrieved: {session.cookies.get_dict()}")
        
    except AuthenticationError as e:
        logger.error(f"❌ Login Failed! {e}")
    except Exception as e:
        logger.error(f"❌ Unexpected error occurred! {e}", exc_info=True)

if __name__ == "__main__":
    test_login()
