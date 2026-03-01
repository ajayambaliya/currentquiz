"""
Export Reel Data — Standalone script to export translated quiz data as JSON.

Run this AFTER the pipeline has scraped + translated a quiz.
It produces a 'reel_export_YYYYMMDD.json' you can take to any other project
to test different reel strategies without touching this codebase.

Usage:
    cd automation
    python export_reel_data.py <quiz_url>

Example:
    python export_reel_data.py https://pendulumedu.com/quiz/current-affairs/25-february-2026-current-affairs-quiz
"""

import os
import sys
import json
import logging
from datetime import datetime
from pathlib import Path

# Load environment variables
from dotenv import load_dotenv
load_dotenv('.env.local')

logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)


def export_quiz_to_json(url: str, output_path: str = None) -> str:
    """
    Scrape, parse, and translate a quiz, then export to JSON.
    
    Args:
        url: The pendulumedu.com quiz URL
        output_path: Optional output file path
        
    Returns:
        Path to the exported JSON file
    """
    from src.scraper import QuizScraper
    from src.parser import QuizParser
    from src.translator import Translator
    from src.date_extractor import DateExtractor

    import requests
    
    # Initialize components
    session = requests.Session()
    scraper = QuizScraper(session)
    parser = QuizParser()
    translator = Translator()
    date_extractor = DateExtractor()

    # Extract date
    date_info = date_extractor.extract_date_from_url(url)
    if date_info:
        date_obj, date_english, date_gujarati = date_info
        date_filename = date_extractor.get_filename_date(url)
    else:
        import pytz
        import datetime as dt
        ist = pytz.timezone('Asia/Kolkata')
        now = dt.datetime.now(ist)
        date_english = now.strftime("%d %B %Y")
        _guj_months = {
            1: 'જાન્યુઆરી', 2: 'ફેબ્રુઆરી', 3: 'માર્ચ', 4: 'એપ્રિલ',
            5: 'મે', 6: 'જૂન', 7: 'જુલાઈ', 8: 'ઓગસ્ટ',
            9: 'સપ્ટેમ્બર', 10: 'ઓક્ટોબર', 11: 'નવેમ્બર', 12: 'ડિસેમ્બર'
        }
        date_gujarati = f"{now.day} {_guj_months[now.month]} {now.year}"
        date_filename = now.strftime("%Y%m%d")

    logger.info(f"Date: {date_english} / {date_gujarati}")

    # Step 1: Scrape
    logger.info("Scraping quiz page and revealing solutions...")
    html = scraper.submit_quiz(url)

    # Step 2: Parse
    logger.info("Parsing quiz data...")
    quiz_data = parser.parse_quiz(html, url)
    logger.info(f"Parsed {len(quiz_data.questions)} questions")

    # Step 3: Translate
    logger.info("Translating to Gujarati...")
    translated_data = translator.translate_quiz(quiz_data)
    logger.info("Translation done")

    # Build live quiz link
    quiz_slug = url.rstrip('/').split('/')[-1]
    live_link = f"https://currentadda.vercel.app/quiz/{quiz_slug}"

    # Serialize to dict
    export = {
        "meta": {
            "source_url": url,
            "quiz_slug": quiz_slug,
            "live_quiz_link": live_link,
            "date_english": date_english,
            "date_gujarati": date_gujarati,
            "date_filename": date_filename,
            "total_questions": len(translated_data.questions),
            "reel_count": (len(translated_data.questions) + 4) // 5,
            "exported_at": datetime.now().isoformat()
        },
        "reel_config": {
            "max_questions_per_reel": 5,
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
                "reel_index": (q.question_number - 1) // 5,
                "position_in_reel": (q.question_number - 1) % 5 + 1,
                "frame_ids": {
                    "think": f"reel{(q.question_number-1)//5}_q{q.question_number}_think",
                    "answer": f"reel{(q.question_number-1)//5}_q{q.question_number}_answer"
                }
            }
            for q in translated_data.questions
        ]
    }

    # Output path
    if not output_path:
        output_path = f"reel_export_{date_filename}.json"

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(export, f, ensure_ascii=False, indent=2)

    logger.info(f"\n✅ Exported {len(translated_data.questions)} questions to: {output_path}")
    logger.info(f"   Reels: {export['meta']['reel_count']} reel(s)")
    return output_path


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python export_reel_data.py <quiz_url>")
        print()
        print("Example:")
        print("  python export_reel_data.py https://pendulumedu.com/quiz/current-affairs/25-february-2026-current-affairs-quiz")
        sys.exit(1)

    quiz_url = sys.argv[1]
    output = sys.argv[2] if len(sys.argv) > 2 else None

    output_file = export_quiz_to_json(quiz_url, output)
    print(f"\n📦 JSON ready: {output_file}")
    print("   Take this file to your other project to test reel strategies!")
