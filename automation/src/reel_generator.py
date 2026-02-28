"""
Instagram Reel Frame Generator — Generates stunning 1080x1920 vertical frames
for quiz question reels with animated-style transitions.

Produces:
  - Intro frame (brand + date)
  - Per-question "think" frame (question + options, no answer)
  - Per-question "reveal" frame (correct answer highlighted)
  - Outro frame (CTA)
"""

import os
import logging
from pathlib import Path
from datetime import datetime
from typing import List, Dict
import pytz
import base64

from .parser import QuizQuestion
from .translator import TranslatedQuizData

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ReelGenerator:
    """Generate 1080x1920 vertical HTML frames for Instagram Reels"""

    MAX_QUESTIONS_PER_REEL = 5  # 5 questions per reel for best engagement

    def __init__(self, output_dir: str = "output_reels"):
        self.output_dir = output_dir
        self.html_output_dir = "output"

        os.makedirs(self.output_dir, exist_ok=True)
        os.makedirs(self.html_output_dir, exist_ok=True)

        self.logo_base64 = self._load_logo_as_base64()

    def _load_logo_as_base64(self) -> str:
        """Load logo.png and convert to base64 data URI"""
        logo_path = Path("logo.png")
        if not logo_path.exists():
            logo_path = Path("../logo.png")

        if logo_path.exists():
            try:
                with open(logo_path, "rb") as f:
                    encoded = base64.b64encode(f.read()).decode('utf-8')
                    return f"data:image/png;base64,{encoded}"
            except Exception as e:
                logger.error(f"Failed to load logo: {e}")
        return ""

    def _get_reel_css(self) -> str:
        """Premium CSS for 1080x1920 vertical reel frames — ultra-attractive design"""
        return """
    @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+Gujarati:wght@400;500;600;700;800;900&display=swap');

    * { font-family: 'Noto Serif Gujarati', serif; box-sizing: border-box; margin: 0; padding: 0; }
    body {
        background: #0a0a0f;
        margin: 0;
        padding: 60px;
        display: flex;
        flex-direction: column;
        gap: 80px;
        align-items: center;
    }

    /* ═══════════════════════════════════════════════════════
       BASE REEL FRAME — 1080x1920 (9:16 vertical)
       ═══════════════════════════════════════════════════════ */
    .reel-frame {
        width: 1080px;
        height: 1920px;
        position: relative;
        overflow: hidden;
        display: flex;
        flex-direction: column;
    }

    /* ═══════════════════════════════════════════════════════
       INTRO FRAME
       ═══════════════════════════════════════════════════════ */
    .frame-intro {
        background: linear-gradient(160deg, #0f0326 0%, #1a0a3e 25%, #2d1b69 50%, #1e1145 75%, #0f0326 100%);
        justify-content: center;
        align-items: center;
        text-align: center;
        padding: 80px;
    }

    .frame-intro .glow-orb-1 {
        position: absolute;
        top: -200px;
        right: -150px;
        width: 600px;
        height: 600px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(139, 92, 246, 0.25), transparent 70%);
        pointer-events: none;
    }
    .frame-intro .glow-orb-2 {
        position: absolute;
        bottom: -250px;
        left: -200px;
        width: 700px;
        height: 700px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(236, 72, 153, 0.2), transparent 70%);
        pointer-events: none;
    }
    .frame-intro .glow-orb-3 {
        position: absolute;
        top: 40%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 500px;
        height: 500px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(99, 102, 241, 0.15), transparent 60%);
        pointer-events: none;
    }

    .frame-intro .logo-big {
        width: 200px;
        height: 200px;
        border-radius: 50px;
        box-shadow: 0 20px 60px rgba(139, 92, 246, 0.4), 0 0 120px rgba(139, 92, 246, 0.15);
        margin-bottom: 50px;
        position: relative;
        z-index: 2;
    }

    .frame-intro .brand-title {
        font-size: 80px;
        font-weight: 900;
        background: linear-gradient(135deg, #a78bfa 0%, #c084fc 30%, #f472b6 60%, #fb923c 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 30px;
        position: relative;
        z-index: 2;
    }

    .frame-intro .divider-line {
        width: 200px;
        height: 4px;
        background: linear-gradient(90deg, transparent, #818cf8, #c084fc, #f472b6, transparent);
        border-radius: 10px;
        margin: 30px auto;
        position: relative;
        z-index: 2;
    }

    .frame-intro .quiz-title {
        font-size: 52px;
        font-weight: 700;
        color: #e2e8f0;
        margin-bottom: 20px;
        position: relative;
        z-index: 2;
    }

    .frame-intro .quiz-subtitle {
        font-size: 38px;
        font-weight: 600;
        color: #94a3b8;
        margin-bottom: 60px;
        position: relative;
        z-index: 2;
    }

    .frame-intro .date-pill {
        display: inline-flex;
        align-items: center;
        gap: 16px;
        background: rgba(139, 92, 246, 0.15);
        border: 2px solid rgba(139, 92, 246, 0.3);
        padding: 20px 50px;
        border-radius: 100px;
        font-size: 36px;
        font-weight: 700;
        color: #c4b5fd;
        margin-bottom: 40px;
        position: relative;
        z-index: 2;
    }

    .frame-intro .question-count {
        font-size: 44px;
        font-weight: 800;
        color: #818cf8;
        position: relative;
        z-index: 2;
    }

    .frame-intro .swipe-hint {
        position: absolute;
        bottom: 120px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 32px;
        color: rgba(255,255,255,0.4);
        font-weight: 600;
        z-index: 2;
    }

    /* ═══════════════════════════════════════════════════════
       QUESTION FRAME (think — no answer highlighted)
       ═══════════════════════════════════════════════════════ */
    .frame-question {
        background: linear-gradient(160deg, #0f172a 0%, #1e1b4b 35%, #312e81 65%, #1e1b4b 100%);
        padding: 0;
    }

    /* Top gradient bar */
    .frame-question .top-bar {
        height: 8px;
        background: linear-gradient(90deg, #818cf8, #c084fc, #f472b6, #fb923c);
        flex-shrink: 0;
    }

    .frame-question .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 40px 60px 30px;
        flex-shrink: 0;
    }

    .frame-question .logo-container {
        display: flex;
        align-items: center;
        gap: 18px;
    }

    .frame-question .logo-img {
        height: 60px;
        border-radius: 14px;
        box-shadow: 0 6px 20px rgba(0,0,0,0.3);
    }

    .frame-question .brand-name {
        font-size: 38px;
        font-weight: 900;
        background: linear-gradient(90deg, #818cf8, #c084fc, #f472b6);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    .frame-question .q-badge {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 28px;
        font-weight: 800;
        color: #818cf8;
        background: rgba(129, 140, 248, 0.1);
        padding: 14px 30px;
        border-radius: 50px;
        border: 2px solid rgba(129, 140, 248, 0.2);
    }

    /* Progress bar */
    .frame-question .progress-bar-container {
        margin: 0 60px 35px;
        height: 8px;
        background: rgba(255,255,255,0.06);
        border-radius: 10px;
        overflow: hidden;
        flex-shrink: 0;
    }

    .frame-question .progress-bar-fill {
        height: 100%;
        background: linear-gradient(90deg, #818cf8, #c084fc);
        border-radius: 10px;
        transition: width 0.3s ease;
    }

    /* Content */
    .frame-question .content-area {
        flex: 1;
        padding: 0 60px;
        display: flex;
        flex-direction: column;
    }

    .frame-question .question-box {
        background: rgba(255, 255, 255, 0.04);
        backdrop-filter: blur(10px);
        padding: 45px 50px;
        border-radius: 28px;
        margin-bottom: 50px;
        border-left: 7px solid #818cf8;
        border: 1px solid rgba(255,255,255,0.06);
        position: relative;
    }

    .frame-question .question-box::before {
        content: '❓';
        position: absolute;
        top: -20px;
        left: 30px;
        font-size: 40px;
        background: #1e1b4b;
        padding: 0 15px;
    }

    .frame-question .question-text {
        font-size: 40px;
        font-weight: 700;
        color: #e2e8f0;
        line-height: 1.6;
    }

    .frame-question .options-list {
        display: flex;
        flex-direction: column;
        gap: 24px;
        flex: 1;
    }

    .frame-question .option-row {
        background: rgba(255, 255, 255, 0.04);
        padding: 30px 35px;
        border-radius: 22px;
        border: 2px solid rgba(255, 255, 255, 0.06);
        display: flex;
        align-items: center;
        gap: 24px;
        font-size: 34px;
        font-weight: 600;
        color: #cbd5e1;
    }

    .frame-question .option-label-circle {
        background: rgba(129, 140, 248, 0.12);
        min-width: 65px;
        height: 65px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        font-weight: 900;
        color: #818cf8;
        flex-shrink: 0;
        font-size: 30px;
        border: 2px solid rgba(129, 140, 248, 0.2);
    }

    .frame-question .option-text {
        flex: 1;
    }

    /* Think prompt */
    .frame-question .think-prompt {
        margin-top: auto;
        text-align: center;
        padding: 40px 0 25px;
        flex-shrink: 0;
    }

    .frame-question .think-text {
        font-size: 42px;
        font-weight: 800;
        background: linear-gradient(90deg, #fbbf24, #f59e0b, #d97706);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    .frame-question .think-emoji {
        font-size: 60px;
        display: block;
        margin-bottom: 10px;
        -webkit-text-fill-color: initial;
    }

    /* Footer */
    .frame-question .footer {
        padding: 25px 60px 40px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-top: 2px solid rgba(255,255,255,0.05);
        flex-shrink: 0;
    }

    .frame-question .date-text {
        font-size: 24px;
        font-weight: 600;
        color: #64748b;
    }

    .frame-question .social-tag {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 26px;
        font-weight: 800;
        color: #818cf8;
    }

    /* Decorative blobs */
    .frame-question .blob-1 { position: absolute; top: -150px; right: -120px; width: 500px; height: 500px; border-radius: 50%; background: radial-gradient(circle, rgba(129, 140, 248, 0.1), transparent 70%); pointer-events: none; }
    .frame-question .blob-2 { position: absolute; bottom: -180px; left: -150px; width: 550px; height: 550px; border-radius: 50%; background: radial-gradient(circle, rgba(244, 114, 182, 0.07), transparent 70%); pointer-events: none; }

    /* ═══════════════════════════════════════════════════════
       ANSWER REVEAL FRAME (correct answer shown)
       ═══════════════════════════════════════════════════════ */
    .frame-answer {
        background: linear-gradient(160deg, #0f172a 0%, #1e1b4b 35%, #312e81 65%, #1e1b4b 100%);
        padding: 0;
    }

    .frame-answer .top-bar {
        height: 8px;
        background: linear-gradient(90deg, #10b981, #34d399, #6ee7b7);
        flex-shrink: 0;
    }

    .frame-answer .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 40px 60px 30px;
        flex-shrink: 0;
    }

    .frame-answer .logo-container {
        display: flex;
        align-items: center;
        gap: 18px;
    }

    .frame-answer .logo-img {
        height: 60px;
        border-radius: 14px;
        box-shadow: 0 6px 20px rgba(0,0,0,0.3);
    }

    .frame-answer .brand-name {
        font-size: 38px;
        font-weight: 900;
        background: linear-gradient(90deg, #818cf8, #c084fc, #f472b6);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    .frame-answer .answer-badge {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 26px;
        font-weight: 800;
        color: white;
        background: linear-gradient(135deg, #10b981, #059669);
        padding: 14px 30px;
        border-radius: 50px;
        box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
    }

    .frame-answer .progress-bar-container {
        margin: 0 60px 35px;
        height: 8px;
        background: rgba(255,255,255,0.06);
        border-radius: 10px;
        overflow: hidden;
        flex-shrink: 0;
    }

    .frame-answer .progress-bar-fill {
        height: 100%;
        background: linear-gradient(90deg, #10b981, #34d399);
        border-radius: 10px;
    }

    .frame-answer .content-area {
        flex: 1;
        padding: 0 60px;
        display: flex;
        flex-direction: column;
    }

    .frame-answer .question-box {
        background: rgba(255, 255, 255, 0.04);
        padding: 40px 45px;
        border-radius: 28px;
        margin-bottom: 40px;
        border-left: 7px solid #10b981;
        border: 1px solid rgba(255,255,255,0.06);
    }

    .frame-answer .question-text {
        font-size: 36px;
        font-weight: 700;
        color: #e2e8f0;
        line-height: 1.55;
    }

    .frame-answer .options-list {
        display: flex;
        flex-direction: column;
        gap: 22px;
    }

    .frame-answer .option-row {
        background: rgba(255, 255, 255, 0.04);
        padding: 28px 32px;
        border-radius: 22px;
        border: 2px solid rgba(255, 255, 255, 0.06);
        display: flex;
        align-items: center;
        gap: 22px;
        font-size: 32px;
        font-weight: 600;
        color: #94a3b8;
    }

    .frame-answer .option-row.correct {
        background: rgba(16, 185, 129, 0.15);
        border: 3px solid #10b981;
        color: #6ee7b7;
        box-shadow: 0 0 40px rgba(16, 185, 129, 0.15), inset 0 0 40px rgba(16, 185, 129, 0.05);
    }

    .frame-answer .option-row.wrong {
        opacity: 0.4;
    }

    .frame-answer .option-label-circle {
        min-width: 60px;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        font-weight: 900;
        flex-shrink: 0;
        font-size: 28px;
        background: rgba(255,255,255,0.06);
        color: #64748b;
        border: 2px solid rgba(255,255,255,0.08);
    }

    .frame-answer .option-row.correct .option-label-circle {
        background: #10b981;
        color: white;
        border-color: #10b981;
        box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
    }

    .frame-answer .correct-banner {
        margin-top: 40px;
        background: rgba(16, 185, 129, 0.1);
        border: 2px solid rgba(16, 185, 129, 0.2);
        border-radius: 24px;
        padding: 30px 40px;
        text-align: center;
    }

    .frame-answer .correct-banner-text {
        font-size: 38px;
        font-weight: 800;
        color: #34d399;
    }

    .frame-answer .footer {
        margin-top: auto;
        padding: 25px 60px 40px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-top: 2px solid rgba(255,255,255,0.05);
        flex-shrink: 0;
    }

    .frame-answer .date-text {
        font-size: 24px;
        font-weight: 600;
        color: #64748b;
    }

    .frame-answer .social-tag {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 26px;
        font-weight: 800;
        color: #818cf8;
    }

    .frame-answer .blob-1 { position: absolute; top: -150px; right: -120px; width: 500px; height: 500px; border-radius: 50%; background: radial-gradient(circle, rgba(16, 185, 129, 0.12), transparent 70%); pointer-events: none; }
    .frame-answer .blob-2 { position: absolute; bottom: -180px; left: -150px; width: 550px; height: 550px; border-radius: 50%; background: radial-gradient(circle, rgba(99, 102, 241, 0.07), transparent 70%); pointer-events: none; }

    /* ═══════════════════════════════════════════════════════
       OUTRO FRAME
       ═══════════════════════════════════════════════════════ */
    .frame-outro {
        background: linear-gradient(160deg, #0f0326 0%, #1a0a3e 25%, #2d1b69 50%, #1e1145 75%, #0f0326 100%);
        justify-content: center;
        align-items: center;
        text-align: center;
        padding: 80px;
    }

    .frame-outro .glow-orb-1 {
        position: absolute;
        top: -150px;
        left: -100px;
        width: 500px;
        height: 500px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(236, 72, 153, 0.2), transparent 70%);
        pointer-events: none;
    }
    .frame-outro .glow-orb-2 {
        position: absolute;
        bottom: -200px;
        right: -150px;
        width: 600px;
        height: 600px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(139, 92, 246, 0.2), transparent 70%);
        pointer-events: none;
    }

    .frame-outro .score-section {
        position: relative;
        z-index: 2;
        margin-bottom: 80px;
    }

    .frame-outro .score-emoji {
        font-size: 100px;
        margin-bottom: 30px;
    }

    .frame-outro .score-text {
        font-size: 48px;
        font-weight: 800;
        color: #e2e8f0;
        margin-bottom: 15px;
    }

    .frame-outro .score-sub {
        font-size: 36px;
        font-weight: 600;
        color: #94a3b8;
    }

    .frame-outro .cta-section {
        position: relative;
        z-index: 2;
    }

    .frame-outro .cta-box {
        background: rgba(139, 92, 246, 0.15);
        border: 2px solid rgba(139, 92, 246, 0.3);
        border-radius: 30px;
        padding: 50px 60px;
        margin-bottom: 50px;
    }

    .frame-outro .cta-title {
        font-size: 44px;
        font-weight: 900;
        background: linear-gradient(90deg, #a78bfa, #f472b6);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 20px;
    }

    .frame-outro .cta-desc {
        font-size: 34px;
        font-weight: 600;
        color: #c4b5fd;
        line-height: 1.6;
    }

    .frame-outro .follow-btn {
        display: inline-flex;
        align-items: center;
        gap: 18px;
        background: linear-gradient(135deg, #7c3aed, #ec4899);
        padding: 28px 60px;
        border-radius: 100px;
        font-size: 38px;
        font-weight: 900;
        color: white;
        box-shadow: 0 12px 40px rgba(124, 58, 237, 0.4);
        position: relative;
        z-index: 2;
    }

    .frame-outro .follow-icon {
        width: 40px;
        height: 40px;
    }

    .frame-outro .link-text {
        margin-top: 50px;
        font-size: 30px;
        font-weight: 600;
        color: rgba(255,255,255,0.4);
        position: relative;
        z-index: 2;
    }

    /* Watermark */
    .watermark {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        opacity: 0.02;
        width: 700px;
        z-index: 0;
        pointer-events: none;
        filter: grayscale(100%) brightness(2);
    }
"""

    def generate_reel_html(self, quiz_data: TranslatedQuizData, reel_index: int = 0, date_gujarati: str = None) -> str:
        """
        Generate all reel frames as HTML for a set of questions.

        Args:
            quiz_data: Translated quiz data
            reel_index: Which reel (0 = first 5 questions, 1 = next 5, etc.)
            date_gujarati: Optional Gujarati date to display (extracted from quiz)

        Returns:
            Complete HTML string with all frames
        """
        if not date_gujarati:
            ist = pytz.timezone('Asia/Kolkata')
            current_date = datetime.now(ist)
            _guj_months = {
                1: 'જાન્યુઆરી', 2: 'ફેબ્રુઆરી', 3: 'માર્ચ', 4: 'એપ્રિલ',
                5: 'મે', 6: 'જૂન', 7: 'જુલાઈ', 8: 'ઓગસ્ટ',
                9: 'સપ્ટેમ્બર', 10: 'ઓક્ટોબર', 11: 'નવેમ્બર', 12: 'ડિસેમ્બર'
            }
            date_gujarati = f"{current_date.day} {_guj_months[current_date.month]} {current_date.year}"

        # Select questions for this reel
        start = reel_index * self.MAX_QUESTIONS_PER_REEL
        end = start + self.MAX_QUESTIONS_PER_REEL
        questions = quiz_data.questions[start:end]
        total_q = len(questions)

        if not questions:
            logger.warning(f"No questions for reel index {reel_index}")
            return ""

        css = self._get_reel_css()

        # Instagram icon SVG
        insta_svg = '<svg class="follow-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>'

        watermark_html = ""
        logo_html = ""
        logo_big_html = ""
        if self.logo_base64:
            watermark_html = f'<img src="{self.logo_base64}" alt="Watermark" class="watermark" />'
            logo_html = f'<img src="{self.logo_base64}" alt="Logo" class="logo-img" />'
            logo_big_html = f'<img src="{self.logo_base64}" alt="Logo" class="logo-big" />'

        html = f"""<!DOCTYPE html>
<html lang="gu">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Reel Frames</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+Gujarati:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
{css}
</style>
</head>
<body>
"""

        # ═══════════════════════════════════════════
        # INTRO FRAME
        # ═══════════════════════════════════════════
        html += f"""
        <div class="reel-frame frame-intro" id="reel{reel_index}_intro">
            <div class="glow-orb-1"></div>
            <div class="glow-orb-2"></div>
            <div class="glow-orb-3"></div>
            {watermark_html}

            {logo_big_html}

            <div class="brand-title">CurrentAdda</div>
            <div class="divider-line"></div>

            <div class="quiz-title">📝 કરંટ અફેર્સ ક્વિઝ</div>
            <div class="quiz-subtitle">Current Affairs Quiz</div>

            <div class="date-pill">📅 {date_gujarati}</div>

            <div class="question-count">🎯 {total_q} પ્રશ્નો • જવાબ વિચારો!</div>

            <div class="swipe-hint">▶ Watch & Think 🤔</div>
        </div>
"""

        # ═══════════════════════════════════════════
        # QUESTION + ANSWER FRAMES
        # ═══════════════════════════════════════════
        for idx, question in enumerate(questions):
            q_num = idx + 1
            progress_pct = int((q_num / total_q) * 100)

            # ── THINK FRAME (question, no answer) ──
            html += f"""
        <div class="reel-frame frame-question" id="reel{reel_index}_q{q_num}_think">
            <div class="blob-1"></div>
            <div class="blob-2"></div>
            {watermark_html}

            <div class="top-bar"></div>

            <div class="header">
                <div class="logo-container">
                    {logo_html}
                    <div class="brand-name">CurrentAdda</div>
                </div>
                <div class="q-badge">પ્રશ્ન {q_num}/{total_q}</div>
            </div>

            <div class="progress-bar-container">
                <div class="progress-bar-fill" style="width: {progress_pct}%"></div>
            </div>

            <div class="content-area">
                <div class="question-box">
                    <div class="question-text">{question.question_text}</div>
                </div>

                <div class="options-list">
"""
            for label, opt_text in question.options.items():
                html += f"""
                    <div class="option-row">
                        <div class="option-label-circle">{label}</div>
                        <div class="option-text">{opt_text}</div>
                    </div>
"""
            html += f"""
                </div>

                <div class="think-prompt">
                    <span class="think-emoji">🤔</span>
                    <span class="think-text">જવાબ વિચારો...</span>
                </div>
            </div>

            <div class="footer">
                <div class="date-text">📅 {date_gujarati}</div>
                <div class="social-tag">📸 @currentaddaa</div>
            </div>
        </div>
"""

            # ── ANSWER REVEAL FRAME ──
            correct_text = question.options.get(question.correct_answer, "")
            html += f"""
        <div class="reel-frame frame-answer" id="reel{reel_index}_q{q_num}_answer">
            <div class="blob-1"></div>
            <div class="blob-2"></div>
            {watermark_html}

            <div class="top-bar"></div>

            <div class="header">
                <div class="logo-container">
                    {logo_html}
                    <div class="brand-name">CurrentAdda</div>
                </div>
                <div class="answer-badge">✅ જવાબ</div>
            </div>

            <div class="progress-bar-container">
                <div class="progress-bar-fill" style="width: {progress_pct}%"></div>
            </div>

            <div class="content-area">
                <div class="question-box">
                    <div class="question-text">{question.question_text}</div>
                </div>

                <div class="options-list">
"""
            for label, opt_text in question.options.items():
                is_correct = label == question.correct_answer
                row_class = "correct" if is_correct else "wrong"
                check = " ✓" if is_correct else ""
                html += f"""
                    <div class="option-row {row_class}">
                        <div class="option-label-circle">{label}{check}</div>
                        <div class="option-text">{opt_text}</div>
                    </div>
"""

            html += f"""
                </div>

                <div class="correct-banner">
                    <div class="correct-banner-text">✅ સાચો જવાબ: ({question.correct_answer}) {correct_text}</div>
                </div>
            </div>

            <div class="footer">
                <div class="date-text">📅 {date_gujarati}</div>
                <div class="social-tag">📸 @currentaddaa</div>
            </div>
        </div>
"""

        # ═══════════════════════════════════════════
        # OUTRO FRAME
        # ═══════════════════════════════════════════
        html += f"""
        <div class="reel-frame frame-outro" id="reel{reel_index}_outro">
            <div class="glow-orb-1"></div>
            <div class="glow-orb-2"></div>
            {watermark_html}

            <div class="score-section">
                <div class="score-emoji">🏆</div>
                <div class="score-text">તમે કેટલા સાચા કર્યા?</div>
                <div class="score-sub">Comment માં જણાવો! 👇</div>
            </div>

            <div class="cta-section">
                <div class="cta-box">
                    <div class="cta-title">રોજ ક્વિઝ માટે ફોલો કરો!</div>
                    <div class="cta-desc">Daily current affairs quiz<br>in Gujarati & English 🇮🇳</div>
                </div>

                <div class="follow-btn">
                    {insta_svg}
                    @currentaddaa
                </div>

                <div class="link-text">🔗 Link in Bio for Online Quiz</div>
            </div>
        </div>
"""

        html += """
</body>
</html>
"""
        return html

    def generate_reel_html_file(self, quiz_data: TranslatedQuizData, reel_index: int = 0, date_gujarati: str = None) -> str:
        """Generate reel HTML file and return its path"""
        html_content = self.generate_reel_html(quiz_data, reel_index, date_gujarati)

        if not html_content:
            return ""

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(self.html_output_dir, f"reel_{reel_index}_{timestamp}.html")

        with open(output_path, "w", encoding="utf-8") as f:
            f.write(html_content)

        logger.info(f"Generated Reel HTML at {output_path}")
        return output_path

    def get_reel_count(self, quiz_data: TranslatedQuizData) -> int:
        """How many reels can be made from this quiz data"""
        import math
        return math.ceil(len(quiz_data.questions) / self.MAX_QUESTIONS_PER_REEL)
