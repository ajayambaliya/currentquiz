import os
import json
import logging
import subprocess
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List

from .translator import TranslatedQuizData
from .parser import QuizData

logger = logging.getLogger(__name__)

class RemotionReelGenerator:
    """Wrapper to generate Instagram Reels using the Remotion React project."""
    
    MAX_QUESTIONS_PER_REEL = 5
    
    def __init__(self, remotion_dir: str = "reel_generator/remotion-quiz", output_dir: str = "output_reels"):
        self.remotion_dir = Path(os.path.abspath(remotion_dir))
        self.output_dir = Path(os.path.abspath(output_dir))
        self.public_dir = self.remotion_dir / "public"
        self.data_file = self.public_dir / "data.json"
        
        os.makedirs(self.output_dir, exist_ok=True)
        os.makedirs(self.public_dir, exist_ok=True)
        
    def get_reel_count(self, translated_data: TranslatedQuizData) -> int:
        # We enforce exactly 1 reel (max 5 questions) to avoid exceeding Github Actions 
        # free tier limits (2000 mins/month) and keep execution time well under 10 minutes.
        return 1 if translated_data.questions else 0

    def prepare_data_json(self, quiz_data: QuizData, translated_data: TranslatedQuizData, date_english: str, date_gujarati: str, date_filename: str) -> None:
        """Prepares the JSON data for the Remotion project to consume."""
        quiz_slug = quiz_data.url.rstrip('/').split('/')[-1] if quiz_data.url else "quiz"
        live_link = f"https://currentadda.vercel.app/quiz/{quiz_slug}"
        
        export = {
            "meta": {
                "source_url": quiz_data.url,
                "quiz_slug": quiz_slug,
                "live_quiz_link": live_link,
                "date_english": date_english,
                "date_gujarati": date_gujarati,
                "date_filename": date_filename,
                "total_questions": len(translated_data.questions),
                "reel_count": self.get_reel_count(translated_data),
                "exported_at": datetime.now().isoformat()
            },
            "reel_config": {
                "max_questions_per_reel": self.MAX_QUESTIONS_PER_REEL,
                "frame_sizes": "1080x1920 (9:16)",
                "frame_timings_sec": {
                    "intro": 3.0,
                    "question_think": 5.0,
                    "answer_reveal": 3.0,
                    "outro": 4.0
                },
                "total_duration_5q_sec": 47.0
            },
            "questions": [
                {
                    "question_number": q.question_number,
                    "question_text": q.question_text,
                    "options": q.options,
                    "correct_answer": q.correct_answer,
                    "explanation": q.explanation,
                    "reel_index": (q.question_number - 1) // self.MAX_QUESTIONS_PER_REEL,
                    "position_in_reel": (q.question_number - 1) % self.MAX_QUESTIONS_PER_REEL + 1,
                    "frame_ids": {
                        "think": f"reel{(q.question_number-1)//self.MAX_QUESTIONS_PER_REEL}_q{q.question_number}_think",
                        "answer": f"reel{(q.question_number-1)//self.MAX_QUESTIONS_PER_REEL}_q{q.question_number}_answer"
                    }
                }
                for q in translated_data.questions
            ]
        }
        
        with open(self.data_file, 'w', encoding='utf-8') as f:
            json.dump(export, f, ensure_ascii=False, indent=2)
            
        logger.info(f"Generated Remotion data.json at {self.data_file}")

    def build_reel(self, reel_idx: int, date_filename: str) -> str:
        """Renders the specified reel index using Remotion."""
        # Output paths
        reel_video_dir = self.output_dir / date_filename
        os.makedirs(reel_video_dir, exist_ok=True)
        video_path = reel_video_dir / f"reel_{reel_idx}_{date_filename}.mp4"
        
        comp_id = f"QuizReel{reel_idx}"
        
        logger.info(f"Rendering {comp_id} via Remotion to {video_path}...")
        
        cmd = [
            "npx", "remotion", "render", comp_id, str(video_path)
        ]
        
        try:
            # Note: Remotion will read data.json from public folder automatically
            # Let's run it from the remotion dir
            result = subprocess.run(
                cmd,
                cwd=str(self.remotion_dir),
                capture_output=True,
                text=True,
                timeout=600  # 10 minute timeout for rendering
            )
            
            if result.returncode != 0:
                logger.error(f"Remotion render failed: {result.stderr}")
                return None
                
            logger.info(f"Successfully rendered: {video_path}")
            return str(video_path)
            
        except subprocess.TimeoutExpired:
            logger.error(f"Remotion rendering timed out for {comp_id}")
            return None
        except Exception as e:
            logger.error(f"Failed to render reel {reel_idx}: {str(e)}")
            return None
