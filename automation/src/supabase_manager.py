import os
import logging
import datetime
from typing import Dict, List, Optional
from supabase import create_client, Client
from .parser import QuizData, QuizQuestion

logger = logging.getLogger(__name__)

class SupabaseManager:
    """Handles synchronization of quiz data to Supabase database."""
    
    def __init__(self):
        """Initialize Supabase client using environment variables."""
        self.url: str = os.getenv("SUPABASE_URL", "")
        self.key: str = os.getenv("SUPABASE_KEY", "")
        
        if not self.url or not self.key:
            logger.warning("Supabase URL or Key missing. Database sync will be skipped.")
            self.client: Optional[Client] = None
        else:
            try:
                self.client = create_client(self.url, self.key)
                logger.info("Supabase client initialized successfully.")
            except Exception as e:
                logger.error(f"Failed to initialize Supabase client: {e}")
                self.client = None

    def _generate_slug(self, title: str) -> str:
        """Create a URL-friendly slug from the quiz title."""
        import re
        slug = title.lower()
        slug = re.sub(r'[^a-z0-9]+', '-', slug)
        return slug.strip('-')

    def is_quiz_exists(self, slug: str) -> bool:
        """Check if a quiz with the given slug already exists in the database."""
        if not self.client:
            return False
            
        try:
            result = self.client.table("quizzes").select("id").eq("slug", slug).execute()
            return len(result.data) > 0
        except Exception as e:
            logger.error(f"Error checking quiz existence: {e}")
            return False

    def sync_quiz(self, quiz_data: QuizData, translated_questions: List[QuizQuestion], date_gujarati: str, quiz_date: Optional[datetime.date] = None) -> Optional[str]:
        """
        Sync quiz and its questions to Supabase.
        
        Args:
            quiz_data: Original quiz data (for source_url etc)
            translated_questions: List of questions with Gujarati text
            date_gujarati: Formatted Gujarati date for display
            quiz_date: Specific date of the quiz
            
        Returns:
            Slug of the synced quiz if successful, None otherwise
        """
        if not self.client:
            logger.error("Supabase client not initialized. Cannot sync.")
            return None

        # Prepare quiz metadata
        title = f"Daily Current Affairs - {date_gujarati}"
        
        if quiz_date:
            slug = quiz_date.strftime("%Y-%m-%d")
        else:
            slug = self._generate_slug(date_gujarati.replace(" ", "-"))
        
        if self.is_quiz_exists(slug):
            logger.info(f"Quiz with slug '{slug}' already exists. Skipping sync.")
            return slug

        try:
            # 1. Insert Quiz
            quiz_payload = {
                "title": title,
                "slug": slug,
                "date_str": date_gujarati,
                "quiz_date": quiz_date.isoformat() if quiz_date else None,
                "source_url": quiz_data.source_url
            }
            
            quiz_res = self.client.table("quizzes").insert(quiz_payload).execute()
            
            # Check for data in response
            if not quiz_res.data:
                error_msg = getattr(quiz_res, 'error', 'Unknown error')
                raise Exception(f"Failed to insert quiz into Supabase: {error_msg}")
                
            quiz_id = quiz_res.data[0]["id"]
            logger.info(f"Inserted quiz into Supabase with ID: {quiz_id}")

            # 2. Insert Questions
            questions_payload = []
            for q in translated_questions:
                questions_payload.append({
                    "quiz_id": quiz_id,
                    "q_index": q.question_number,
                    "text": q.question_text,
                    "options": q.options,
                    "answer": q.correct_answer,
                    "explanation": q.explanation
                })
            
            if questions_payload:
                q_res = self.client.table("questions").insert(questions_payload).execute()
                if not q_res.data:
                    logger.warning("Questions insertion returned no data. Check RLS policies.")
                else:
                    logger.info(f"Successfully synced {len(q_res.data)} questions to Supabase.")
            
            return slug

        except Exception as e:
            logger.error(f"Supabase sync failed: {str(e)}")
            # Log helpful tip for RLS errors
            if "row-level security" in str(e).lower() or "401" in str(e) or "42501" in str(e):
                logger.error("TIP: This is likely an RLS error. Ensure you are using the 'service_role' key in your .env file, "
                             "not the 'anon' key. Backend automation requires a key that bypasses RLS.")
            return None
