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
            # Try finding it in parent directory if we're in src
            logo_path = Path("../logo.png")
            
        if logo_path.exists():
            try:
                with open(logo_path, "rb") as f:
                    encoded = base64.b64encode(f.read()).decode('utf-8')
                    return f"data:image/png;base64,{encoded}"
            except Exception as e:
                logger.error(f"Failed to load logo: {e}")
        return ""

    def generate_html(self, quiz_data: TranslatedQuizData) -> str:
        """Generate HTML with exactly 1080x1080 individual cards for each question"""
        
        # Get IST current date for the cards
        ist = pytz.timezone('Asia/Kolkata')
        current_date = datetime.now(ist)
        date_gujarati = current_date.strftime("%d %B %Y")

        html = f"""<!DOCTYPE html>
<html lang="gu">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Question Images</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+Gujarati:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<script src="https://cdn.tailwindcss.com"></script>
<style>
    * {{ font-family: 'Noto Serif Gujarati', serif; box-sizing: border-box; }}
    body {{ background: #1a1a2e; margin: 0; padding: 50px; display: flex; flex-direction: column; gap: 50px; align-items: center; }}
    
    .instagram-card {{
        width: 1080px;
        height: 1080px;
        /* Premium deep gradient background */
        background: linear-gradient(135deg, #ffffff 0%, #f0f4ff 100%);
        position: relative;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        padding: 50px 60px;
        box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
        border-radius: 40px;
    }}
    
    /* Decorative glassmorphism elements */
    .blob-1 {{ position: absolute; top: -100px; right: -100px; width: 400px; height: 400px; border-radius: 50%; background: linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(236, 72, 153, 0.1)); filter: blur(40px); pointer-events: none; }}
    .blob-2 {{ position: absolute; bottom: -150px; left: -100px; width: 500px; height: 500px; border-radius: 50%; background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(16, 185, 129, 0.1)); filter: blur(50px); pointer-events: none; }}

    .card-border {{
        position: absolute;
        top: 20px; left: 20px; right: 20px; bottom: 20px;
        border: 3px solid rgba(79, 70, 229, 0.15);
        border-radius: 30px;
        pointer-events: none;
        z-index: 10;
    }}

    .watermark {{
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        opacity: 0.04;
        width: 650px;
        z-index: 0;
        pointer-events: none;
        filter: grayscale(100%);
    }}

    .header {{
        display: flex;
        justify-content: space-between;
        align-items: center;
        z-index: 2;
        padding-bottom: 25px;
        border-bottom: 2px solid rgba(0,0,0,0.06);
        margin-bottom: 40px;
    }}

    .logo-container {{
        display: flex;
        align-items: center;
        gap: 20px;
    }}
    
    .logo-img {{
        height: 75px;
        border-radius: 18px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.08);
    }}
    
    .brand-name {{
        font-size: 44px;
        font-weight: 900;
        background: linear-gradient(90deg, #4f46e5, #ec4899);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        letter-spacing: -0.5px;
    }}

    .quiz-badge {{
        font-size: 26px;
        font-weight: 700;
        color: white;
        background: linear-gradient(135deg, #4f46e5, #3b82f6);
        padding: 12px 28px;
        border-radius: 50px;
        box-shadow: 0 10px 20px rgba(79, 70, 229, 0.2);
    }}

    .content-area {{
        flex: 1;
        z-index: 2;
        display: flex;
        flex-direction: column;
    }}

    .question-box {{
        background: rgba(255, 255, 255, 0.8);
        backdrop-filter: blur(10px);
        padding: 40px;
        border-radius: 24px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.04);
        margin-bottom: 40px;
        border-left: 8px solid #4f46e5;
    }}

    .question-text {{
        font-size: 40px;
        font-weight: 800;
        color: #1f2937;
        line-height: 1.5;
    }}

    .options-grid {{
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 25px;
    }}

    .option-box {{
        background: white;
        padding: 25px 30px;
        border-radius: 20px;
        border: 2px solid #f1f5f9;
        font-size: 30px;
        font-weight: 600;
        color: #4b5563;
        display: flex;
        align-items: center;
        gap: 20px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.02);
        transition: all 0.3s ease;
    }}
    
    .option-box.correct-answer {{
        background: #ecfdf5;
        border-color: #10b981;
        color: #047857;
        box-shadow: 0 10px 25px rgba(16, 185, 129, 0.15);
    }}
    
    .option-label {{
        background: #f1f5f9;
        width: 55px;
        height: 55px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 14px;
        font-weight: 800;
        color: #4f46e5;
        flex-shrink: 0;
        font-size: 26px;
    }}
    
    .option-box.correct-answer .option-label {{
        background: #10b981;
        color: white;
    }}

    .footer {{
        margin-top: auto;
        z-index: 2;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 30px;
        border-top: 2px solid rgba(0,0,0,0.06);
    }}

    .social-handle {{
        display: flex;
        align-items: center;
        gap: 15px;
        font-size: 28px;
        font-weight: 800;
        color: #4f46e5;
        background: white;
        padding: 15px 35px;
        border-radius: 100px;
        box-shadow: 0 10px 25px rgba(79, 70, 229, 0.1);
        border: 1px solid #e0e7ff;
    }}
    
    .social-icon {{
        width: 38px;
        height: 38px;
    }}

    .call-to-action {{
        font-size: 26px;
        font-weight: 700;
        color: #64748b;
        background: rgba(255,255,255,0.6);
        padding: 15px 30px;
        border-radius: 50px;
    }}
    
    .explanation-box {{
        background: #f8fafc;
        border: 2px solid #e2e8f0;
        border-radius: 20px;
        padding: 25px 30px;
        margin-top: 30px;
        font-size: 26px;
        color: #334155;
        line-height: 1.6;
        max-height: 240px;
        overflow: hidden;
        position: relative;
    }}
    
    .explanation-title {{
        color: #2563eb;
        font-weight: 800;
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 24px;
    }}

</style>
</head>
<body>
"""
        
        watermark_html = ""
        logo_html = ""
        if self.logo_base64:
            watermark_html = f'<img src="{self.logo_base64}" alt="Watermark" class="watermark" />'
            logo_html = f'<img src="{self.logo_base64}" alt="Logo" class="logo-img" />'
            
        # Instagram/Telegram stylized icon
        social_svg = '''<svg class="social-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.19-.08-.05-.19-.02-.27 0-.11.03-1.84 1.18-5.21 3.45-.49.34-.94.5-1.35.49-.45-.01-1.3-.25-1.93-.46-.78-.26-1.39-.4-1.34-.84.03-.23.36-.47.98-.71 3.86-1.68 6.43-2.79 7.72-3.33 3.67-1.53 4.43-1.8 4.92-1.81.11 0 .35.03.48.14.11.09.14.22.15.34-.01.08-.01.17-.03.23z"/></svg>'''
        
        # Build cards for each question
        for q_idx, question in enumerate(quiz_data.questions):
            # --------------------------------------------------------------------------------
            # Card 1: Question Only (For the Front Slide)
            # --------------------------------------------------------------------------------
            html += f"""
            <div class="instagram-card" id="q{question.question_number}_card1">
                <div class="blob-1"></div><div class="blob-2"></div>
                <div class="card-border"></div>
                {watermark_html}
                
                <div class="header">
                    <div class="logo-container">
                        {logo_html}
                        <div class="brand-name">CurrentAdda</div>
                    </div>
                    <div class="quiz-badge">કરંટ અફેર્સ • {date_gujarati}</div>
                </div>
                
                <div class="content-area">
                    <div class="question-box">
                        <div style="color: #4f46e5; font-weight: 800; font-size: 24px; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px;">પ્રશ્ન {question.question_number}</div>
                        <div class="question-text">{question.question_text}</div>
                    </div>
                    
                    <div class="options-grid">
            """
            for label, opt_text in question.options.items():
                html += f"""
                        <div class="option-box">
                            <div class="option-label">{label}</div>
                            <div class="option-text">{opt_text}</div>
                        </div>
                """
            html += f"""
                    </div>
                </div>
                
                <div class="footer">
                    <div class="call-to-action">
                        સ્વાઇપ કરો જવાબ માટે ➡️
                    </div>
                    <div class="social-handle">
                        {social_svg}
                        @currentaddaa
                    </div>
                </div>
            </div>
            """

            # --------------------------------------------------------------------------------
            # Card 2: Question + Answer Highlighted + Explanation (For the Next Slide)
            # --------------------------------------------------------------------------------
            html += f"""
            <div class="instagram-card" id="q{question.question_number}_card2">
                <div class="blob-1"></div><div class="blob-2"></div>
                <div class="card-border"></div>
                {watermark_html}
                
                <div class="header">
                    <div class="logo-container">
                        {logo_html}
                        <div class="brand-name">CurrentAdda</div>
                    </div>
                    <div class="quiz-badge bg-gradient-to-r from-emerald-500 to-teal-500">પ્રશ્ન {question.question_number} - જવાબ</div>
                </div>
                
                <div class="content-area">
                    <div class="question-box" style="margin-bottom: 25px; padding: 30px;">
                        <div class="question-text" style="font-size: 32px;">{question.question_text}</div>
                    </div>
                    
                    <div class="options-grid" style="gap: 20px;">
            """
            for label, opt_text in question.options.items():
                is_correct = label == question.correct_answer
                correct_class = "correct-answer" if is_correct else ""
                html += f"""
                        <div class="option-box {correct_class}" style="padding: 18px 25px; font-size: 26px;">
                            <div class="option-label" style="width: 48px; height: 48px; font-size: 22px;">{label}</div>
                            <div class="option-text">{opt_text}</div>
                        </div>
                """
            html += f"""
                    </div>
            """
            
            if question.explanation:
                html += f"""
                    <div class="explanation-box">
                        <div class="explanation-title">
                            <svg style="width: 24px; height: 24px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            સમજૂતી (Explanation)
                        </div>
                        <div style="font-size: 24px;">{question.explanation}</div>
                    </div>
                """
                
            html += f"""
                </div>
                
                <div class="footer">
                    <div class="call-to-action">
                        રોજ કરંટ અફેર્સ ક્વિઝ માટે ફોલો કરો
                    </div>
                    <div class="social-handle">
                        {social_svg}
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
        
        # Save HTML
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(self.html_output_dir, f"images_quiz_{timestamp}.html")
        
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(html_content)
            
        logger.info(f"Generated stylish images HTML at {output_path}")
        return output_path
