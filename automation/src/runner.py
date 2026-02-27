"""
Main orchestrator for the Pendulumedu Quiz Scraper.
Coordinates the entire pipeline from authentication to Telegram distribution.
"""

import os
import sys
import logging
from typing import List, Optional
from datetime import datetime
from pathlib import Path

# Add project root to path for imports
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

# Import all modules
from src.state_manager import StateManager
from src.login import LoginManager, AuthenticationError
from src.scraper import QuizScraper, ScraperError
from src.parser import QuizParser, QuizData
from src.translator import Translator, TranslatedQuizData
from src.pdf_generator import PDFGenerator
from src.telegram_sender import TelegramSender
from src.telegram_text_sender import TelegramTextSender
from src.date_extractor import DateExtractor
from src.supabase_manager import SupabaseManager
from src.notification_sender import NotificationSender
from src.image_generator import ImageGenerator
from src.instagram_sender import InstagramSender
import subprocess

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)


class PipelineError(Exception):
    """Raised when pipeline processing fails"""
    pass


def load_environment_variables() -> dict:
    """
    Load and validate required environment variables.
    
    Returns:
        Dictionary containing credentials and configuration
        
    Raises:
        ValueError: If required environment variables are missing
    """
    logger.info("Loading environment variables...")
    
    # Load credentials
    login_email = os.getenv('LOGIN_EMAIL')
    login_password = os.getenv('LOGIN_PASSWORD')
    telegram_bot_token = os.getenv('TELEGRAM_BOT_TOKEN')
    telegram_channel = os.getenv('TELEGRAM_CHANNEL', 'currentadda')
    telegram_text_channel = os.getenv('TELEGRAM_TEXT_CHANNEL', '')  # Optional text channel
    
    # Validate required variables
    missing_vars = []
    if not login_email:
        missing_vars.append('LOGIN_EMAIL')
    if not login_password:
        missing_vars.append('LOGIN_PASSWORD')
    if not telegram_bot_token:
        missing_vars.append('TELEGRAM_BOT_TOKEN')
    
    if missing_vars:
        raise ValueError(
            f"Missing required environment variables: {', '.join(missing_vars)}"
        )
    
    logger.info("Environment variables loaded successfully")
    logger.info(f"Target Telegram PDF channel: @{telegram_channel}")
    if telegram_text_channel:
        logger.info(f"Target Telegram TEXT channel: @{telegram_text_channel}")
    
    return {
        'login_email': login_email,
        'login_password': login_password,
        'telegram_bot_token': telegram_bot_token,
        'telegram_channel': telegram_channel,
        'telegram_text_channel': telegram_text_channel
    }


def process_quiz(
    url: str,
    scraper: QuizScraper,
    parser: QuizParser,
    translator: Translator,
    pdf_generator: PDFGenerator,
    image_generator: ImageGenerator,
    instagram_sender: InstagramSender,
    telegram_sender: TelegramSender,
    telegram_text_sender: TelegramTextSender,
    supabase_manager: SupabaseManager,
    notification_sender: NotificationSender,
    state_manager: StateManager,
    date_extractor: DateExtractor
) -> bool:
    """
    Process a single quiz through the complete pipeline.
    
    Args:
        url: Quiz URL to process
        scraper: QuizScraper instance
        parser: QuizParser instance
        translator: Translator instance
        pdf_generator: PDFGenerator instance
        image_generator: ImageGenerator instance
        instagram_sender: InstagramSender instance
        telegram_sender: TelegramSender instance
        state_manager: StateManager instance
        date_extractor: DateExtractor instance
        
    Returns:
        True if successful, False otherwise
    """
    logger.info(f"Processing quiz: {url}")
    
    try:
        # Extract date from URL
        date_info = date_extractor.extract_date_from_url(url)
        if date_info:
            date_obj, date_english, date_gujarati = date_info
            date_filename = date_extractor.get_filename_date(url)
            logger.info(f"✓ Extracted date: {date_english}")
        else:
            # Fallback to current date
            import pytz
            ist = pytz.timezone('Asia/Kolkata')
            current_date = datetime.now(ist)
            date_obj = current_date
            date_english = current_date.strftime("%d %B %Y")
            date_gujarati = current_date.strftime("%d %B %Y")
            date_filename = current_date.strftime("%Y%m%d")
            logger.warning(f"Could not extract date from URL, using current date: {date_english}")
        
        # Set date in PDF generator
        pdf_generator.date_english = date_english
        pdf_generator.date_gujarati = date_gujarati
        pdf_generator.date_filename = date_filename
        
        # Step 1: Fetch and submit quiz page
        logger.info("Step 1: Fetching quiz page and revealing solutions...")
        html = scraper.submit_quiz(url)
        
        # Step 2: Parse quiz data
        logger.info("Step 2: Parsing quiz data...")
        quiz_data = parser.parse_quiz(html, url)
        logger.info(f"Parsed {len(quiz_data.questions)} questions")
        
        # Step 3: Translate to Gujarati
        logger.info("Step 3: Translating content to Gujarati...")
        translated_data = translator.translate_quiz(quiz_data)
        logger.info("Translation completed")
        
        # Step 4: Generate PDFs (both modes) & Images
        logger.info("Step 4: Generating PDFs and Images...")
        
        # --- Image Generation ---
        try:
            logger.info("  → Generating Instagram Image HTML...")
            images_html_path = image_generator.generate_html_file(translated_data)
            logger.info(f"  ✓ Image HTML: {images_html_path}")
            
            logger.info("  → Slicing HTML into Retinal Quality 1080x1080 PNG Cards...")
            images_output_dir = os.path.join(image_generator.output_dir, date_filename)
            subprocess.run(
                ['node', str(project_root / 'generate_images.js'), images_html_path, images_output_dir],
                check=True
            )
            logger.info(f"  ✓ Images saved to: {images_output_dir}")
        except Exception as img_err:
            logger.error(f"  ❌ Error generating Images: {img_err}")
            # Continuing since PDFs are more critical to the flow
        
        # Generate Study Mode PDF
        logger.info("  → Generating Study Mode PDF...")
        study_pdf_path = pdf_generator.generate_pdf(translated_data, mode='study')
        logger.info(f"  ✓ Study PDF: {study_pdf_path}")
        
        # Generate Practice Mode PDF
        logger.info("  → Generating Practice Mode PDF...")
        practice_pdf_path = pdf_generator.generate_pdf(translated_data, mode='practice')
        logger.info(f"  ✓ Practice PDF: {practice_pdf_path}")
        
        # Step 5: Send to Telegram
        logger.info("Step 5: Sending PDFs to Telegram...")
        
        # Send header message
        header_message = f"""📚 આજની ક્વિઝ - 2 ફોર્મેટમાં ઉપલબ્ધ!
📅 {date_english}
📝 {len(translated_data.questions)} પ્રશ્નો

📚 Study Mode - જવાબ અને સમજૂતી પ્રશ્ન સાથે
✍️ Practice Mode - જવાબો અને સમજૂતી છેલ્લે"""
        
        telegram_sender.send_message(header_message)
        
        # Small delay between messages
        import time
        time.sleep(2)
        
        # Send Study Mode PDF
        logger.info("  → Sending Study Mode PDF...")
        study_caption = f"""📚 કરંટ અફેર્સ ક્વિઝ - Study Mode
📅 {date_english}
📝 {len(translated_data.questions)} પ્રશ્નો

✅ આ PDF માં જવાબ અને સમજૂતી પ્રશ્ન સાથે જ છે
📖 અભ્યાસ અને શીખવા માટે યોગ્ય

#CurrentAffairs #GPSC #GSSSB #GujaratJobs"""
        
        study_success = telegram_sender.send_pdf(study_pdf_path, study_caption)
        
        if not study_success:
            logger.error("Failed to send Study Mode PDF")
            return False
        
        logger.info("  ✓ Study Mode PDF sent successfully")
        
        # Small delay between PDFs
        time.sleep(2)
        
        # Send Practice Mode PDF
        logger.info("  → Sending Practice Mode PDF...")
        practice_caption = f"""✍️ કરંટ અફેર્સ ક્વિઝ - Practice Mode
📅 {date_english}
📝 {len(translated_data.questions)} પ્રશ્નો

📝 આ PDF માં જવાબો અને સમજૂતી છેલ્લે છે
✅ પહેલા જાતે પ્રયત્ન કરો, પછી જવાબ તપાસો
🎯 પ્રેક્ટિસ અને સેલ્ફ-ટેસ્ટિંગ માટે યોગ્ય

#CurrentAffairs #GPSC #GSSSB #GujaratJobs"""
        
        practice_success = telegram_sender.send_pdf(practice_pdf_path, practice_caption)
        
        if not practice_success:
            logger.warning("Failed to send Practice Mode PDF (continuing anyway)")
        else:
            logger.info("  ✓ Practice Mode PDF sent successfully")
        
        logger.info("✅ Both PDFs sent to Telegram successfully")
        
        # Step 6: Send text messages (if text channel is configured)
        if telegram_text_sender:
            logger.info("Step 6: Sending formatted text messages to Telegram...")
            try:
                text_success = telegram_text_sender.send_quiz_questions(
                    translated_data,
                    date_english
                )
                if text_success:
                    logger.info("✅ Text messages sent successfully")
                else:
                    logger.warning("⚠️  Failed to send some text messages")
            except Exception as e:
                logger.error(f"❌ Error sending text messages: {e}")
        else:
            logger.info("ℹ️  Skipping text messages (text sender not configured)")
        
        # Step 7: Sync to Supabase for PWA
        logger.info("Step 7: Syncing data to Supabase...")
        date_obj_to_sync = date_obj.date() if 'date_obj' in locals() else None
        quiz_slug = supabase_manager.sync_quiz(quiz_data, translated_data.questions, date_gujarati, date_obj_to_sync)
        if quiz_slug:
            logger.info(f"✅ Data synced to Supabase. Slug: {quiz_slug}")
            
            # Send live quiz link to Telegram
            live_link = f"https://currentadda.vercel.app/quiz/{quiz_slug}"
            live_message = f"🎯 <b>Live Quiz રમો!</b>\n\n" \
                           f"📅 <b>તારીખ:</b> {date_gujarati}\n\n" \
                           f"હવે તમે આ ક્વિઝ ઓનલાઇન રમી શકો છો અને તમારો સ્કોર જાણી શકો છો.\n" \
                           f"👉 <a href='{live_link}'>અહીં ક્લિક કરો</a>\n\n" \
                           f"<b>વિશેષતાઓ:</b>\n" \
                           f"✅ ક્વિઝ પૂર્ણ થયા પછી તમે સમજૂતી જોઈ શકો છો.\n" \
                           f"🏆 તમે લીડરબોર્ડમાં તમારો રેન્ક જોઈ શકો છો.\n\n" \
                           f"#CurrentAdda #LiveQuiz #GPSC #GSSSB #GPRB #Constable #PSI"
            telegram_sender.send_message(live_message, parse_mode='HTML')
            
            # Step 7.1: Send Push Notification
            if notification_sender:
                logger.info("Step 7.1: Sending push notification...")
                notification_sender.send_quiz_notification(date_gujarati, quiz_slug)
                
            # Step 7.2: Send to Instagram
            logger.info("Step 7.2: Posting question to Instagram...")
            if instagram_sender and instagram_sender.is_configured():
                try:
                    images_output_dir = os.path.join(image_generator.output_dir, date_filename)
                    # Use the first question as a teaser post
                    if len(translated_data.questions) > 0:
                        first_q = translated_data.questions[0]
                        card1 = os.path.join(images_output_dir, f"q{first_q.question_number}_card1.png")
                        card2 = os.path.join(images_output_dir, f"q{first_q.question_number}_card2.png")
                        
                        if os.path.exists(card1) and os.path.exists(card2):
                            insta_caption = f"🎯 આજની કરંટ અફેર્સ ક્વિઝ ({date_gujarati})\n\n" \
                                            f"પ્રશ્ન નો જવાબ આપવા માટે સ્વાઇપ કરો ➡️\n\n" \
                                            f"આખી ક્વિઝ રમો અને લીડરબોર્ડ માં રેન્ક મેળવો:\n" \
                                            f"👉 {live_link}\n\n" \
                                            f"રોજ કરંટ અફેર્સ ક્વિઝ માટે ફોલો કરો @currentaddaa 🚀\n\n" \
                                            f"#CurrentAdda #CurrentAffairs #GPSC #GSSSB #GPRB #Constable #PSI #GujaratPolice #Talati #Clerk #GovernmentJobs #Gujarat"
                            
                            logger.info("[Instagram] Posting Card 1 and Card 2 as a Carousel...")
                            instagram_sender.post_carousel([card1, card2], insta_caption)
                        else:
                            logger.warning("[Instagram] Generated card images not found, skipping post.")
                except Exception as e:
                    logger.error(f"❌ Error posting to Instagram: {e}")
                    
        else:
            logger.warning("⚠️  Supabase sync failed, skipping Live Quiz link and Instagram post")

        # Step 8: Mark as processed
        logger.info(f"Step {'8' if telegram_text_sender else '7'}: Marking quiz as processed...")
        state_manager.mark_processed(url)
        logger.info(f"Quiz processed successfully: {url}")
        
        return True
        
    except ScraperError as e:
        logger.error(f"Scraper error: {str(e)}")
        return False
    except ValueError as e:
        logger.error(f"Parser error: {str(e)}")
        return False
    except Exception as e:
        logger.error(f"Unexpected error processing quiz: {str(e)}", exc_info=True)
        return False


def main():
    """
    Main execution function.
    Orchestrates the entire quiz scraping, translation, and distribution pipeline.
    """
    logger.info("=" * 80)
    logger.info("Starting Pendulumedu Quiz Scraper")
    logger.info("=" * 80)
    
    try:
        # Step 1: Load environment variables
        logger.info("\n[1/8] Loading configuration...")
        env_vars = load_environment_variables()
        
        # Step 2: Initialize StateManager and load processed URLs
        logger.info("\n[2/8] Initializing state manager...")
        state_manager = StateManager()
        processed_urls = state_manager.load_processed_urls()
        logger.info(f"Loaded {len(processed_urls)} previously processed URLs")
        
        # Step 3: Authenticate using LoginManager
        logger.info("\n[3/8] Authenticating with pendulumedu.com...")
        login_manager = LoginManager(
            email=env_vars['login_email'],
            password=env_vars['login_password']
        )
        session = login_manager.get_session()
        logger.info("Authentication successful")
        
        # Step 4: Initialize all components
        logger.info("\n[4/8] Initializing pipeline components...")
        scraper = QuizScraper(session)
        parser = QuizParser()
        translator = Translator()
        pdf_generator = PDFGenerator()
        image_generator = ImageGenerator()
        instagram_sender = InstagramSender()
        date_extractor = DateExtractor()
        supabase_manager = SupabaseManager()
        notification_sender = NotificationSender()
        
        # Prepare channel username (add @ if not present)
        channel = env_vars['telegram_channel']
        if not channel.startswith('@'):
            channel = f"@{channel}"
        
        telegram_sender = TelegramSender(
            bot_token=env_vars['telegram_bot_token'],
            channel_username=channel
        )
        
        # Initialize text sender if text channel is configured
        telegram_text_sender = None
        text_channel_config = env_vars.get('telegram_text_channel', '').strip()
        
        if text_channel_config:
            text_channel = text_channel_config
            if not text_channel.startswith('@'):
                text_channel = f"@{text_channel}"
            
            telegram_text_sender = TelegramTextSender(
                bot_token=env_vars['telegram_bot_token'],
                channel_username=text_channel
            )
            logger.info(f"✓ Text sender initialized for: {text_channel}")
        else:
            logger.info("ℹ️  Text sender disabled (TELEGRAM_TEXT_CHANNEL not set)")
        
        logger.info("All components initialized")
        
        # Step 5: Fetch quiz listing
        logger.info("\n[5/8] Fetching quiz listing from website...")
        all_quiz_urls = scraper.get_quiz_urls()
        logger.info(f"✓ Found {len(all_quiz_urls)} total quizzes on website")
        
        if all_quiz_urls:
            logger.info(f"   Latest quiz: {all_quiz_urls[0]}")
            if len(all_quiz_urls) > 1:
                logger.info(f"   Oldest quiz: {all_quiz_urls[-1]}")
        
        # Step 6: Filter out already-processed URLs
        logger.info("\n[6/8] Filtering new quizzes...")
        logger.info(f"   Processed URLs in database: {len(processed_urls)}")
        logger.info(f"   Total URLs from website: {len(all_quiz_urls)}")
        
        new_quiz_urls = [url for url in all_quiz_urls if not state_manager.is_processed(url)]
        already_processed = len(all_quiz_urls) - len(new_quiz_urls)
        
        logger.info(f"   Already processed: {already_processed}")
        logger.info(f"   ✓ New quizzes to process: {len(new_quiz_urls)}")
        
        if new_quiz_urls:
            logger.info(f"\n   New quiz URLs:")
            for idx, url in enumerate(new_quiz_urls[:5], 1):  # Show first 5
                logger.info(f"      {idx}. {url}")
            if len(new_quiz_urls) > 5:
                logger.info(f"      ... and {len(new_quiz_urls) - 5} more")
        
        if not new_quiz_urls:
            logger.info("\n✓ No new quizzes to process. All quizzes are up to date!")
            logger.info(f"   Database has {len(processed_urls)} processed quizzes")
            logger.info(f"   Website has {len(all_quiz_urls)} total quizzes")
            return 0
        
        # Step 7: Process each new quiz
        logger.info("\n[7/8] Processing new quizzes...")
        successful_count = 0
        failed_count = 0
        
        for idx, url in enumerate(new_quiz_urls, start=1):
            logger.info(f"\n--- Processing quiz {idx}/{len(new_quiz_urls)} ---")
            
            success = process_quiz(
                url=url,
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
                date_extractor=date_extractor
            )
            
            if success:
                successful_count += 1
            else:
                failed_count += 1
                logger.warning(f"Failed to process quiz: {url}")
        
        # Step 8: Summary
        logger.info("\n[8/8] Pipeline execution completed")
        logger.info("=" * 80)
        logger.info("SUMMARY")
        logger.info("=" * 80)
        logger.info(f"Total quizzes found: {len(all_quiz_urls)}")
        logger.info(f"New quizzes: {len(new_quiz_urls)}")
        logger.info(f"Successfully processed: {successful_count}")
        logger.info(f"Failed: {failed_count}")
        logger.info("=" * 80)
        
        # Return exit code based on results
        if failed_count > 0:
            logger.warning("Some quizzes failed to process")
            return 1
        
        logger.info("All quizzes processed successfully!")
        return 0
        
    except AuthenticationError as e:
        logger.error(f"Authentication failed: {str(e)}")
        logger.error("Please verify LOGIN_EMAIL and LOGIN_PASSWORD environment variables")
        return 1
    
    except ScraperError as e:
        logger.error(f"Scraping failed: {str(e)}")
        return 1
    
    except ValueError as e:
        logger.error(f"Configuration error: {str(e)}")
        return 1
    
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        return 1


if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
