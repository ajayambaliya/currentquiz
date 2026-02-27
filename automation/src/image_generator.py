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

class ImageGenerator:
    """Generate HTML optimized for high-quality Instagram/Telegram image extraction"""
    
    def __init__(self, output_dir: str = "output_images"):
        self.output_dir = output_dir
        self.html_output_dir = "output"
        
        # Ensure directories exist
        os.makedirs(self.output_dir, exist_ok=True)
        os.makedirs(self.html_output_dir, exist_ok=True)
        
        # Load logo for watermark/header
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

    def _get_css(self) -> str:
        """Return the shared premium CSS for all cards"""
        return """
    * { font-family: 'Noto Serif Gujarati', serif; box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #0f0f1a; margin: 0; padding: 50px; display: flex; flex-direction: column; gap: 50px; align-items: center; }
    
    .instagram-card {
        width: 1080px;
        height: 1080px;
        position: relative;
        overflow: hidden;
        display: flex;
        flex-direction: column;
    }
    
    /* ── Question + Answer Card Styling ── */
    .card-qa {
        background: linear-gradient(145deg, #0f172a 0%, #1e1b4b 40%, #312e81 100%);
        padding: 55px 60px;
    }
    
    .card-qa .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 28px;
        border-bottom: 2px solid rgba(255,255,255,0.08);
        margin-bottom: 35px;
    }
    
    .card-qa .logo-container {
        display: flex;
        align-items: center;
        gap: 18px;
    }
    
    .card-qa .logo-img {
        height: 65px;
        border-radius: 16px;
        box-shadow: 0 8px 25px rgba(0,0,0,0.3);
    }
    
    .card-qa .brand-name {
        font-size: 42px;
        font-weight: 900;
        background: linear-gradient(90deg, #818cf8, #c084fc, #f472b6);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        letter-spacing: -0.5px;
    }
    
    .card-qa .q-number {
        font-size: 22px;
        font-weight: 700;
        color: #818cf8;
        background: rgba(129, 140, 248, 0.1);
        padding: 10px 24px;
        border-radius: 50px;
        border: 1px solid rgba(129, 140, 248, 0.2);
    }
    
    .card-qa .content-area {
        flex: 1;
        display: flex;
        flex-direction: column;
    }
    
    .card-qa .question-box {
        background: rgba(255, 255, 255, 0.04);
        backdrop-filter: blur(10px);
        padding: 35px 40px;
        border-radius: 24px;
        margin-bottom: 35px;
        border-left: 6px solid #818cf8;
        border: 1px solid rgba(255,255,255,0.06);
    }
    
    .card-qa .question-text {
        font-size: 36px;
        font-weight: 700;
        color: #e2e8f0;
        line-height: 1.55;
    }
    
    .card-qa .options-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
    }
    
    .card-qa .option-box {
        background: rgba(255, 255, 255, 0.04);
        padding: 22px 28px;
        border-radius: 18px;
        border: 2px solid rgba(255, 255, 255, 0.06);
        font-size: 28px;
        font-weight: 600;
        color: #cbd5e1;
        display: flex;
        align-items: center;
        gap: 18px;
    }
    
    .card-qa .option-box.correct {
        background: rgba(16, 185, 129, 0.12);
        border-color: #10b981;
        color: #6ee7b7;
        box-shadow: 0 0 30px rgba(16, 185, 129, 0.1);
    }
    
    .card-qa .option-label {
        background: rgba(255,255,255,0.06);
        min-width: 50px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 14px;
        font-weight: 800;
        color: #818cf8;
        flex-shrink: 0;
        font-size: 24px;
    }
    
    .card-qa .option-box.correct .option-label {
        background: #10b981;
        color: white;
    }
    
    .card-qa .footer {
        margin-top: auto;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 28px;
        border-top: 2px solid rgba(255,255,255,0.06);
    }
    
    .card-qa .date-badge {
        font-size: 22px;
        font-weight: 700;
        color: #94a3b8;
    }
    
    .card-qa .social-handle {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 26px;
        font-weight: 800;
        color: #818cf8;
        background: rgba(129, 140, 248, 0.08);
        padding: 14px 30px;
        border-radius: 100px;
        border: 1px solid rgba(129, 140, 248, 0.15);
    }
    
    .card-qa .social-icon {
        width: 32px;
        height: 32px;
    }
    
    /* ── Decorative Blobs ── */
    .blob-purple { position: absolute; top: -120px; right: -100px; width: 450px; height: 450px; border-radius: 50%; background: radial-gradient(circle, rgba(129, 140, 248, 0.12), transparent 70%); pointer-events: none; }
    .blob-pink { position: absolute; bottom: -150px; left: -120px; width: 500px; height: 500px; border-radius: 50%; background: radial-gradient(circle, rgba(244, 114, 182, 0.08), transparent 70%); pointer-events: none; }
    
    .watermark {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        opacity: 0.025;
        width: 600px;
        z-index: 0;
        pointer-events: none;
        filter: grayscale(100%) brightness(2);
    }
    
    /* ── Explanation Card Styling ── */
    .card-explain {
        background: linear-gradient(145deg, #fefce8 0%, #ecfdf5 50%, #f0f9ff 100%);
        padding: 55px 60px;
    }
    
    .card-explain .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 28px;
        border-bottom: 3px solid rgba(0,0,0,0.05);
        margin-bottom: 35px;
    }
    
    .card-explain .logo-container {
        display: flex;
        align-items: center;
        gap: 18px;
    }
    
    .card-explain .logo-img {
        height: 65px;
        border-radius: 16px;
        box-shadow: 0 8px 25px rgba(0,0,0,0.08);
    }
    
    .card-explain .brand-name {
        font-size: 42px;
        font-weight: 900;
        background: linear-gradient(90deg, #4f46e5, #7c3aed);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }
    
    .card-explain .explain-badge {
        font-size: 22px;
        font-weight: 700;
        color: white;
        background: linear-gradient(135deg, #10b981, #059669);
        padding: 10px 28px;
        border-radius: 50px;
    }
    
    .card-explain .content-area {
        flex: 1;
        display: flex;
        flex-direction: column;
    }
    
    .card-explain .q-recap {
        background: white;
        padding: 30px 35px;
        border-radius: 20px;
        margin-bottom: 25px;
        border-left: 6px solid #4f46e5;
        box-shadow: 0 4px 15px rgba(0,0,0,0.04);
    }
    
    .card-explain .q-recap-label {
        font-size: 20px;
        font-weight: 700;
        color: #4f46e5;
        margin-bottom: 8px;
        text-transform: uppercase;
        letter-spacing: 1px;
    }
    
    .card-explain .q-recap-text {
        font-size: 30px;
        font-weight: 700;
        color: #1e293b;
        line-height: 1.5;
    }
    
    .card-explain .answer-highlight {
        background: #ecfdf5;
        border: 2px solid #10b981;
        border-radius: 18px;
        padding: 22px 30px;
        margin-bottom: 25px;
        display: flex;
        align-items: center;
        gap: 18px;
    }
    
    .card-explain .answer-icon {
        background: #10b981;
        color: white;
        width: 50px;
        height: 50px;
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28px;
        font-weight: 900;
        flex-shrink: 0;
    }
    
    .card-explain .answer-text {
        font-size: 28px;
        font-weight: 700;
        color: #047857;
    }
    
    .card-explain .explanation-box {
        background: white;
        border-radius: 20px;
        padding: 30px 35px;
        flex: 1;
        box-shadow: 0 4px 15px rgba(0,0,0,0.04);
        overflow: hidden;
    }
    
    .card-explain .explanation-title {
        font-size: 22px;
        font-weight: 800;
        color: #2563eb;
        margin-bottom: 15px;
        display: flex;
        align-items: center;
        gap: 10px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    
    .card-explain .explanation-text {
        font-size: 28px;
        font-weight: 500;
        color: #334155;
        line-height: 1.65;
    }
    
    .card-explain .footer {
        margin-top: auto;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 28px;
        border-top: 3px solid rgba(0,0,0,0.05);
    }
    
    .card-explain .date-badge {
        font-size: 22px;
        font-weight: 700;
        color: #64748b;
    }
    
    .card-explain .social-handle {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 26px;
        font-weight: 800;
        color: #4f46e5;
        background: white;
        padding: 14px 30px;
        border-radius: 100px;
        box-shadow: 0 4px 15px rgba(79, 70, 229, 0.08);
        border: 1px solid #e0e7ff;
    }
    
    .card-explain .social-icon {
        width: 32px;
        height: 32px;
    }
"""

    def generate_html(self, quiz_data: TranslatedQuizData) -> str:
        """Generate HTML with two card types per question: QA card + Explanation card"""
        
        ist = pytz.timezone('Asia/Kolkata')
        current_date = datetime.now(ist)
        date_gujarati = current_date.strftime("%d %B %Y")

        css = self._get_css()

        html = f"""<!DOCTYPE html>
<html lang="gu">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Question Images</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+Gujarati:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
{css}
</style>
</head>
<body>
"""
        
        watermark_html = ""
        logo_html = ""
        if self.logo_base64:
            watermark_html = f'<img src="{self.logo_base64}" alt="Watermark" class="watermark" />'
            logo_html = f'<img src="{self.logo_base64}" alt="Logo" class="logo-img" />'
            
        # Instagram icon SVG
        insta_svg = '<svg class="social-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>'
        
        # ═══════════════════════════════════════════════════════════════
        # FIRST: Generate all card1 images (Question + Answer) — for Post 1
        # ═══════════════════════════════════════════════════════════════
        for question in quiz_data.questions:
            html += f"""
            <div class="instagram-card card-qa" id="q{question.question_number}_card1">
                <div class="blob-purple"></div><div class="blob-pink"></div>
                {watermark_html}
                
                <div class="header">
                    <div class="logo-container">
                        {logo_html}
                        <div class="brand-name">CurrentAdda</div>
                    </div>
                    <div class="q-number">પ્રશ્ન {question.question_number} / {len(quiz_data.questions)}</div>
                </div>
                
                <div class="content-area">
                    <div class="question-box">
                        <div class="question-text">{question.question_text}</div>
                    </div>
                    
                    <div class="options-grid">
            """
            for label, opt_text in question.options.items():
                is_correct = label == question.correct_answer
                correct_class = "correct" if is_correct else ""
                check_mark = " ✓" if is_correct else ""
                html += f"""
                        <div class="option-box {correct_class}">
                            <div class="option-label">{label}{check_mark}</div>
                            <div class="option-text">{opt_text}</div>
                        </div>
                """
            html += f"""
                    </div>
                </div>
                
                <div class="footer">
                    <div class="date-badge">📅 {date_gujarati}</div>
                    <div class="social-handle">
                        {insta_svg}
                        @currentaddaa
                    </div>
                </div>
            </div>
            """

        # ═══════════════════════════════════════════════════════════════
        # SECOND: Generate all card2 images (Explanation) — for Post 2
        # ═══════════════════════════════════════════════════════════════
        for question in quiz_data.questions:
            correct_text = question.options.get(question.correct_answer, "")
            explanation_text = question.explanation if question.explanation else "સમજૂતી ઉપલબ્ધ નથી"
            
            html += f"""
            <div class="instagram-card card-explain" id="q{question.question_number}_card2">
                {watermark_html}
                
                <div class="header">
                    <div class="logo-container">
                        {logo_html}
                        <div class="brand-name">CurrentAdda</div>
                    </div>
                    <div class="explain-badge">📖 સમજૂતી {question.question_number} / {len(quiz_data.questions)}</div>
                </div>
                
                <div class="content-area">
                    <div class="q-recap">
                        <div class="q-recap-label">પ્રશ્ન {question.question_number}</div>
                        <div class="q-recap-text">{question.question_text}</div>
                    </div>
                    
                    <div class="answer-highlight">
                        <div class="answer-icon">{question.correct_answer}</div>
                        <div class="answer-text">✅ સાચો જવાબ: {correct_text}</div>
                    </div>
                    
                    <div class="explanation-box">
                        <div class="explanation-title">
                            <svg style="width: 24px; height: 24px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            સમજૂતી (Explanation)
                        </div>
                        <div class="explanation-text">{explanation_text}</div>
                    </div>
                </div>
                
                <div class="footer">
                    <div class="date-badge">📅 {date_gujarati}</div>
                    <div class="social-handle">
                        {insta_svg}
                        @currentaddaa
                    </div>
                </div>
            </div>
            """
            
        html += """
</body>
</html>
"""
        return html

    def generate_html_file(self, quiz_data: TranslatedQuizData) -> str:
        """Generate HTML file and return its path"""
        html_content = self.generate_html(quiz_data)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(self.html_output_dir, f"images_quiz_{timestamp}.html")
        
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(html_content)
            
        logger.info(f"Generated stylish images HTML at {output_path}")
        return output_path
