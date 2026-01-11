
import os
import sys
import json
import logging
import time
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import List, Optional
import requests
from dotenv import load_dotenv

# Add project root to path
# seed_history.py is in c:\Users\LordKrishna\Desktop\pendulumedu\
# automation package is in c:\Users\LordKrishna\Desktop\pendulumedu\automation
# So we add the current directory to sys.path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from automation.src.login import LoginManager
from automation.src.scraper import QuizScraper
from automation.src.parser import QuizParser, QuizData, QuizQuestion
from automation.src.translator import Translator, TranslatedQuizData
from automation.src.supabase_manager import SupabaseManager
from automation.src.date_extractor import DateExtractor

load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)

class HistoricalSeeder:
    """Seeds Supabase with historical quiz data from scraped_urls.json"""
    
    def __init__(self, email: str, password: str):
        self.email = email
        self.password = password
        self.session = None
        self.scraper = None
        self.parser = QuizParser()
        self.translator = Translator()
        self.date_extractor = DateExtractor()
        
        # Try to get Service Role Key (SUPABASE_KEY) first for admin privileges
        # Fallback to Anon Key (NEXT_PUBLIC_SUPABASE_ANON_KEY) if service key missing
        service_key = os.getenv('SUPABASE_KEY')
        anon_key = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
        
        # Set environment variables so SupabaseManager can pick them up
        os.environ['SUPABASE_URL'] = os.getenv('NEXT_PUBLIC_SUPABASE_URL', 'https://dvsiyoqcylcvjtmgyphe.supabase.co')
        os.environ['SUPABASE_KEY'] = service_key if service_key else (anon_key or 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2c2l5b3FjeWxjdmp0bWd5cGhlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODAzNzUzOCwiZXhwIjoyMDgzNjEzNTM4fQ.50oYoPYSjnHjPxXHupmPE6GZIJaYfa3pFecPRFHLerg')
        
        self.supabase = SupabaseManager()

    def authenticate(self):
        """Authenticate and get session"""
        logger.info("Authenticating...")
        try:
            # Disable Gist usage by setting use_online=False
            login_manager = LoginManager(self.email, self.password, use_online=False)
            self.session = login_manager.get_session()
            self.scraper = QuizScraper(self.session)
            logger.info("✓ Authentication successful")
        except Exception as e:
            logger.error(f"Authentication failed: {e}")
            sys.exit(1)

    def translate_text_safe(self, text: str) -> str:
        """Translate text with infinite retry logic to never skip."""
        if not text or not text.strip():
            return text
        
        # Check preserved items using logic similar to Translator
        if hasattr(self.translator, 'preserve_items') and text in self.translator.preserve_items:
            return text
            
        attempt = 0
        while True:
            try:
                # Use the existing translator instance's underlying GoogleTranslator
                return self.translator.translator.translate(text)
            except Exception as e:
                attempt += 1
                # Exponential backoff capped at 60 seconds
                wait_time = min(2 ** attempt, 60)
                logger.warning(f"Translation failed (attempt {attempt}): {e}. Retrying in {wait_time}s...")
                time.sleep(wait_time)

    def fast_translate_single_question(self, question: QuizQuestion) -> QuizQuestion:
        """Translate a single question structure using safe translation."""
        # Translate question text
        translated_question_text = self.translate_text_safe(question.question_text)
        
        # Translate options
        translated_options = {}
        for label, text in question.options.items():
            translated_options[label] = self.translate_text_safe(text)
        
        # Translate explanation
        translated_explanation = self.translate_text_safe(question.explanation)
        
        return QuizQuestion(
            question_number=question.question_number,
            question_text=translated_question_text,
            options=translated_options,
            correct_answer=question.correct_answer,
            explanation=translated_explanation
        )

    def fast_translate_quiz(self, quiz_data: QuizData) -> TranslatedQuizData:
        """Translate full quiz using parallel threads for speed."""
        logger.info(f"⚡ Starting FAST translation of {len(quiz_data.questions)} questions...")
        
        translated_questions = []
        # Use ThreadPoolExecutor for concurrent translation requests
        # 5 workers is a good balance for speed vs rate limits
        with ThreadPoolExecutor(max_workers=5) as executor:
            # Submit all tasks
            future_to_q = {executor.submit(self.fast_translate_single_question, q): q for q in quiz_data.questions}
            
            # Wait for all to complete
            for future in as_completed(future_to_q):
                try:
                    t_q = future.result()
                    translated_questions.append(t_q)
                except Exception as e:
                    logger.error(f"Failed to translate question: {e}")
                    raise
        
        # Sort questions back to original order because as_completed is unordered
        translated_questions.sort(key=lambda x: x.question_number)
        
        return TranslatedQuizData(
            source_url=quiz_data.source_url,
            questions=translated_questions,
            extracted_date=quiz_data.extracted_date
        )

    def process_single_url(self, url: str) -> Optional[QuizData]:
        """Process a single URL: Scrape -> Parse -> Translate -> Upload"""
        try:
            logger.info(f"Processing: {url}")
            
            # 1. Scrape & Submit
            html = self.scraper.submit_quiz(url)
            
            # 2. Parse (Extract Q&A)
            quiz_data = self.parser.parse_quiz(html, url)
            
            if not quiz_data or not quiz_data.questions:
                logger.warning(f"No questions found for {url}")
                return None
            
            # 3. Translate to Gujarati (FAST & ROBUST)
            translated_quiz = self.fast_translate_quiz(quiz_data)
            
            # 4. Extract Date
            date_info = self.date_extractor.extract_date_from_url(url)
            if date_info:
                date_obj, date_str, gujarati_date_str = date_info
            else:
                logger.warning(f"Could not extract date from URL {url}, using current date")
                from datetime import datetime
                date_obj = datetime.now()
                gujarati_date_str = date_obj.strftime("%d-%m-%Y")

            # 4. Upload to Supabase 
            result_slug = self.supabase.sync_quiz(
                quiz_data=quiz_data,
                translated_questions=translated_quiz.questions,
                date_gujarati=gujarati_date_str,
                quiz_date=date_obj
            )
            
            if result_slug:
                logger.info(f"✓ Uploaded quiz '{result_slug}' for {url}")
            else:
                 logger.error(f"Failed to upload quiz for {url}")
            
            return quiz_data

        except Exception as e:
            logger.error(f"Error processing {url}: {e}")
            return None

    def load_processed_history(self) -> List[str]:
        """Load list of already processed URLs from local file"""
        history_file = "seeded_history.json"
        if os.path.exists(history_file):
            try:
                with open(history_file, 'r', encoding='utf-8') as f:
                    history = json.load(f)
                    if isinstance(history, list):
                        return history
                    elif isinstance(history, dict) and 'processed_urls' in history:
                        return history['processed_urls']
                    else:
                        return []
            except Exception as e:
                logger.warning(f"Could not load history file: {e}")
                return []
        return []

    def save_processed_url(self, url: str):
        """Append a successfully processed URL to history file"""
        history_file = "seeded_history.json"
        history = self.load_processed_history()
        
        if url not in history:
            history.append(url)
            try:
                with open(history_file, 'w', encoding='utf-8') as f:
                    json.dump(history, f, indent=2)
            except Exception as e:
                logger.error(f"Failed to update history file: {e}")

    def run(self, url_file: str, max_workers: int = 1):
        # max_workers ignored, we run sequentially now
        self.authenticate()
        
        # Load URLs to process
        try:
            with open(url_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                if isinstance(data, list):
                    urls = data
                elif isinstance(data, dict):
                    if 'processed_urls' in data:
                        urls = data['processed_urls']
                    elif 'urls' in data:
                        urls = data['urls']
                    else:
                        urls = next((v for v in data.values() if isinstance(v, list)), [])
                else:
                    logger.error("Invalid JSON format")
                    return
        except Exception as e:
            logger.error(f"Failed to load URL file: {e}")
            return

        # Load history
        processed_history = self.load_processed_history()
        logger.info(f"Loaded {len(processed_history)} already processed URLs")

        # Filter URLs
        urls_to_process = [url for url in urls if url not in processed_history]
        logger.info(f"Found {len(urls)} total URLs in source.")
        logger.info(f"Remaining URLs to process: {len(urls_to_process)}")
        
        if not urls_to_process:
            logger.info("All URLs have already been processed!")
            return

        # Process sequentially
        for i, url in enumerate(urls_to_process, 1):
            logger.info(f"\n[{i}/{len(urls_to_process)}] Starting: {url}")
            try:
                # Process the URL
                result = self.process_single_url(url)
                
                if result:
                    # If successful (returned QuizData), save to history
                    self.save_processed_url(url)
                    status = "✓"
                else:
                    status = "✗"
                    
                logger.info(f"[{i}/{len(urls_to_process)}] {status} Finished: {url}")
                
            except Exception as e:
                logger.error(f"[{i}/{len(urls_to_process)}] ✗ Exception for {url}: {e}")

if __name__ == "__main__":
    email = os.getenv('LOGIN_EMAIL')
    password = os.getenv('LOGIN_PASSWORD')
    
    if not email or not password:
        logger.error("Missing LOGIN_EMAIL or LOGIN_PASSWORD .env variables")
        sys.exit(1)
        
    seeder = HistoricalSeeder(email, password)
    # Be sure to point to the right file location
    seeder.run(r"c:\Users\LordKrishna\Desktop\pendulumedu\scraped_urls.json")
