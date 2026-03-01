import os
import sys
import logging
from pathlib import Path
from dotenv import load_dotenv

# Add the automation directory to sys.path so we can import 'src'
automation_dir = Path(__file__).parent.absolute()
if str(automation_dir) not in sys.path:
    sys.path.insert(0, str(automation_dir))

# Import all modules from 'src' package
try:
    from src.runner import process_quiz
    from src.login import LoginManager
    from src.scraper import QuizScraper as Scraper
    from src.parser import QuizParser as Parser
    from src.translator import Translator
    from src.pdf_generator import PDFGenerator
    from src.telegram_sender import TelegramSender
    from src.telegram_text_sender import TelegramTextSender
    from src.state_manager import StateManager
    from src.supabase_manager import SupabaseManager
    from src.date_extractor import DateExtractor
    from src.image_generator import ImageGenerator
    from src.instagram_sender import InstagramSender
    from src.notification_sender import NotificationSender
    from src.remotion_generator import RemotionReelGenerator
    from src.instagram_reel_sender import InstagramReelSender
except ImportError as e:
    print(f"Import Error: {e}")
    print(f"Current sys.path: {sys.path}")
    sys.exit(1)

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("TestFlow")

def run_test(target_url):
    load_dotenv()
    
    logger.info("🚀 Starting Full Flow Test...")
    logger.info(f"Target URL: {target_url}")

    # Initialize Components
    bot_token = os.getenv('TELEGRAM_BOT_TOKEN')
    main_channel = os.getenv('TELEGRAM_CHANNEL', '@currentadda')
    if not main_channel.startswith('@'):
        main_channel = f"@{main_channel}"
    
    text_channel = os.getenv('TELEGRAM_TEXT_CHANNEL')
    if text_channel and not text_channel.startswith('@'):
        text_channel = f"@{text_channel}"

    logger.info("Initializing components...")
    login_manager = LoginManager()
    session = login_manager.get_session()
    
    scraper = Scraper(session)
    parser = Parser()
    translator = Translator()
    pdf_generator = PDFGenerator()
    
    telegram_sender = TelegramSender(
        bot_token=bot_token,
        channel_username=main_channel
    )
    
    telegram_text_sender = None
    if text_channel:
        telegram_text_sender = TelegramTextSender(
            bot_token=bot_token,
            channel_username=text_channel
        )
        
    state_manager = StateManager()
    supabase_manager = SupabaseManager()
    date_extractor = DateExtractor()
    image_generator = ImageGenerator()
    instagram_sender = InstagramSender()
    notification_sender = NotificationSender()
    
    automation_dir_path = Path(__file__).parent.absolute()
    remotion_generator = RemotionReelGenerator(
        remotion_dir=str(automation_dir_path / "reel_generator" / "remotion-quiz"),
        output_dir=str(automation_dir_path / "output_reels")
    )
    reel_sender = InstagramReelSender()

    # Run the processing logic
    success = process_quiz(
        url=target_url,
        scraper=scraper,
        parser=parser,
        translator=translator,
        pdf_generator=pdf_generator,
        image_generator=image_generator,
        instagram_sender=instagram_sender,
        telegram_sender=telegram_sender,
        telegram_text_sender=telegram_text_sender,
        supabase_manager=supabase_manager,
        notification_sender=notification_sender,
        state_manager=state_manager,
        date_extractor=date_extractor,
        remotion_generator=remotion_generator,
        reel_sender=reel_sender
    )

    if success:
        logger.info("✅ TEST SUCCESSFUL!")
        logger.info("Steps verified:")
        logger.info("1. Scraped & Parsed content")
        logger.info("2. Translated to Gujarati")
        logger.info("3. Generated Study & Practice PDFs")
        logger.info("4. Sent PDFs to Telegram")
        logger.info("5. Synced questions to Supabase")
        logger.info("6. Sent Live Quiz Link to Telegram")
    else:
        logger.error("❌ TEST FAILED. Check logs above for specific error.")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        url = sys.argv[1]
    else:
        # Default test URL if none provided
        url = "https://pendulumedu.com/quiz/current-affairs/10-january-2026-current-affairs-quiz"
        logger.warning(f"No URL provided. Using default: {url}")
    
    run_test(url)
