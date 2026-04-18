#!/usr/bin/env python3
"""
ITSector Talent Inbox ATS — Commercial Video Generator
Generates a ~90-second MP4 with animated mockup scenes.
No external assets required — all visuals are rendered via Pillow/numpy.

Usage:
    py gerar_video_comercial.py

Output:
    ITSector_Talent_ATS_Comercial_v1.mp4  (1920x1080, 30fps)
"""

import subprocess, sys

# ── Auto-install dependencies ─────────────────────────────────────
def pip_install(pkg):
    subprocess.check_call([sys.executable, "-m", "pip", "install", pkg, "-q"])

try:
    from moviepy.editor import (
        VideoClip, CompositeVideoClip, ImageClip, TextClip,
        concatenate_videoclips, ColorClip
    )
    from moviepy.video.fx.fadein  import fadein
    from moviepy.video.fx.fadeout import fadeout
    print("moviepy already installed.")
except ImportError:
    print("Installing moviepy...")
    pip_install("moviepy==1.0.3")
    pip_install("imageio[ffmpeg]")
    from moviepy.editor import (
        VideoClip, CompositeVideoClip, ImageClip, TextClip,
        concatenate_videoclips, ColorClip
    )
    from moviepy.video.fx.fadein  import fadein
    from moviepy.video.fx.fadeout import fadeout

from PIL import Image, ImageDraw, ImageFont
import numpy as np
import os, math

# ─── CONSTANTS ───────────────────────────────────────────────────
W, H   = 1920, 1080
FPS    = 30
ROOT   = os.path.dirname(os.path.abspath(__file__))
OUTPUT = os.path.join(ROOT, "ITSector_Talent_ATS_Comercial_v1.mp4")

# Colour palette (RGB tuples)
DARK_BG      = (15,  23,  42)
DARK_BG2     = (21,  32,  60)
CARD_BG      = (30,  41,  59)
ACCENT_BLUE  = (59, 130, 246)
ACCENT_CYAN  = ( 6, 182, 212)
ACCENT_GREEN = (16, 185, 129)
ACCENT_AMBER = (245,158,  11)
ACCENT_ROSE  = (244, 63,  94)
ACCENT_PURPLE= (139, 92, 246)
WHITE        = (255, 255, 255)
LIGHT_GRAY   = (203, 213, 225)
MED_GRAY     = (148, 163, 184)

# ─── HELPERS ─────────────────────────────────────────────────────

def new_canvas(bg=DARK_BG):
    img = Image.new("RGB", (W, H), bg)
    return img, ImageDraw.Draw(img)

def font(size, bold=False):
    """Try Segoe UI, fall back to default."""
    candidates = [
        "C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf",
        "C:/Windows/Fonts/arial.ttf",
    ]
    for p in candidates:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                pass
    return ImageFont.load_default()

def text(draw, xy, txt, size=24, color=WHITE, bold=False, anchor="lt"):
    draw.text(xy, txt, font=font(size, bold), fill=color, anchor=anchor)

def rect(draw, x, y, w, h, color, radius=8):
    draw.rounded_rectangle([x, y, x+w, y+h], radius=radius, fill=color)

def gradient_bar(draw, x, y, w, h, c1, c2):
    for i in range(w):
        t = i / max(w-1, 1)
        r = int(c1[0] + (c2[0]-c1[0])*t)
        g = int(c1[1] + (c2[1]-c1[1])*t)
        b = int(c1[2] + (c2[2]-c1[2])*t)
        draw.line([(x+i, y), (x+i, y+h)], fill=(r, g, b))

def pill(draw, x, y, w, h, color, txt, txt_size=18, txt_color=WHITE, bold=False):
    rect(draw, x, y, w, h, color, radius=h//2)
    text(draw, (x+w//2, y+h//2), txt, size=txt_size, color=txt_color, bold=bold, anchor="mm")

def progress_bar(draw, x, y, w, h, pct, bg_color, fill_color, radius=4):
    rect(draw, x, y, w, h, bg_color, radius=radius)
    rect(draw, x, y, max(4, int(w*pct)), h, fill_color, radius=radius)

def img_to_frame(img):
    return np.array(img.convert("RGB"))

def blend_frames(f1, f2, t):
    """Linear cross-fade: t=0 -> f1, t=1 -> f2"""
    return (f1 * (1-t) + f2 * t).astype(np.uint8)

# ─── SCENE RENDERERS ─────────────────────────────────────────────

def render_intro():
    """Scene 0: Title card — company name, product tagline."""
    img, draw = new_canvas()

    # bg glow circles
    from PIL import ImageFilter
    glow = Image.new("RGB", (W, H), DARK_BG)
    gd = ImageDraw.Draw(glow)
    gd.ellipse([-200, -200, 900, 900], fill=(21, 40, 80))
    gd.ellipse([1200, 400, 2400, 1500], fill=(15, 30, 60))
    img = Image.blend(img, glow, 0.6)
    draw = ImageDraw.Draw(img)

    gradient_bar(draw, 0, 0, W, 8, ACCENT_BLUE, ACCENT_CYAN)

    pill(draw, 760, 230, 400, 44, ACCENT_BLUE, "ATS PLATFORM  |  v2.0", 20, WHITE, True)

    text(draw, (W//2, 330), "ITSector Talent", size=96, bold=True,
         color=WHITE, anchor="mm")
    text(draw, (W//2, 450), "Inbox ATS", size=96, bold=True,
         color=ACCENT_CYAN, anchor="mm")

    text(draw, (W//2, 560),
         "Intelligent Candidate & Recruitment Management",
         size=30, color=LIGHT_GRAY, anchor="mm")

    # metric pills
    for i, (val, lbl) in enumerate([("19+","Features"),("M365","Native"),("100%","Secure")]):
        mx = 600 + i*300
        text(draw, (mx, 660), val, size=38, color=ACCENT_CYAN, bold=True, anchor="mm")
        text(draw, (mx, 700), lbl, size=22, color=MED_GRAY, anchor="mm")

    gradient_bar(draw, 0, H-12, W, 12, ACCENT_BLUE, ACCENT_CYAN)
    return img_to_frame(img)


def render_problem():
    """Scene 1: The Problem — pain points."""
    img, draw = new_canvas()
    gradient_bar(draw, 0, 0, W, 8, ACCENT_ROSE, ACCENT_AMBER)

    pill(draw, 60, 50, 280, 40, ACCENT_ROSE, "THE PROBLEM", 19, WHITE, True)
    text(draw, (60, 120), "Traditional Email Recruitment Breaks Down", size=52, bold=True, color=WHITE)

    pains = [
        ("Lost Emails",   "Applications buried in the inbox\nwith no tracking or visibility",   ACCENT_ROSE),
        ("Manual CVs",    "Reading dozens of CVs every day\nwithout any normalisation",          ACCENT_AMBER),
        ("No Ranking",    "Impossible to objectively compare\ncandidates across open roles",      ACCENT_PURPLE),
        ("Wasted Time",   "Hours lost on repetitive tasks\nthat could be fully automated",        ACCENT_ROSE),
    ]
    for i, (title, desc, color) in enumerate(pains):
        cx = 80 + i*465
        rect(draw, cx, 250, 430, 360, CARD_BG)
        rect(draw, cx, 250, 430, 6, color)
        # icon circle
        draw.ellipse([cx+165, 270, cx+265, 370], fill=color)
        text(draw, (cx+215, 320), "!", size=56, bold=True, color=WHITE, anchor="mm")
        text(draw, (cx+215, 410), title, size=26, bold=True, color=WHITE, anchor="mt")
        # multi-line desc
        for j, line in enumerate(desc.split("\n")):
            text(draw, (cx+215, 475+j*36), line, size=20, color=LIGHT_GRAY, anchor="mt")

    rect(draw, 80, 680, W-160, 70, DARK_BG2)
    text(draw, (160, 715),
         "67%  of recruiters lose qualified candidates due to disorganised manual processes",
         size=26, color=LIGHT_GRAY)

    gradient_bar(draw, 0, H-8, W, 8, ACCENT_ROSE, ACCENT_AMBER)
    return img_to_frame(img)


def render_inbox(progress=0.0):
    """Scene 2: Smart Inbox — email list with animated 'processing' row."""
    img, draw = new_canvas()
    gradient_bar(draw, 0, 0, W, 8, ACCENT_BLUE, ACCENT_CYAN)

    pill(draw, 60, 50, 220, 40, ACCENT_BLUE, "SMART INBOX", 19, WHITE, True)
    text(draw, (60, 120), "Automatic Sync with Microsoft 365", size=52, bold=True, color=WHITE)

    # sidebar
    rect(draw, 0, 0, 240, H, (11, 17, 31))
    text(draw, (120, 60), "ITSector ATS", size=18, bold=True, color=ACCENT_CYAN, anchor="mm")
    for i, (nav, active) in enumerate([
        ("Dashboard",False),("Inbox",True),("Candidates",False),
        ("Jobs",False),("Talent Pool",False),("Settings",False)
    ]):
        ny = 150 + i*80
        if active:
            rect(draw, 10, ny-4, 220, 50, ACCENT_BLUE, radius=8)
        text(draw, (30, ny+16), nav, size=18, color=WHITE if active else MED_GRAY)

    # header bar
    sx = 260
    rect(draw, sx, 160, W-sx-40, 50, DARK_BG2, radius=8)
    text(draw, (sx+20, 185),
         f"Last sync: just now  |  29 emails processed  |  11 new candidates created",
         size=18, color=ACCENT_GREEN)

    emails = [
        ("Maria Silva",    "Application — .NET Developer Senior",    "14:32", "CV Processed", ACCENT_GREEN, True),
        ("Joao Santos",    "Application React Developer",             "13:45", "Analysing",    ACCENT_AMBER, True),
        ("Ana Costa",      "Re: QA Engineer Opportunity",             "12:20", "New",          ACCENT_BLUE,  True),
        ("Pedro Almeida",  "Spontaneous Application — DevOps",        "11:05", "CV Processed", ACCENT_GREEN, True),
        ("Newsletter SAPO","Tech News Weekly",                        "10:30", "Ignored",      MED_GRAY,     False),
        ("Sofia Martins",  "Interest in Power Apps role",             "09:15", "New",          ACCENT_BLUE,  True),
        ("Carlos Ferreira","CV attached — Mobile Developer",          "08:40", "CV Processed", ACCENT_GREEN, True),
    ]
    for i, (name, subject, time, status, sc, is_cand) in enumerate(emails):
        ey = 230 + i*82
        bg = CARD_BG if i%2==0 else (23, 34, 52)

        # Animate row 1 (index 1): pulse highlight based on progress
        if i == 1 and progress > 0:
            pulse = abs(math.sin(progress * math.pi * 3))
            r = int(bg[0] + (ACCENT_AMBER[0]-bg[0])*pulse*0.3)
            g = int(bg[1] + (ACCENT_AMBER[1]-bg[1])*pulse*0.3)
            b = int(bg[2] + (ACCENT_AMBER[2]-bg[2])*pulse*0.3)
            bg = (r, g, b)

        rect(draw, sx, ey, W-sx-40, 74, bg, radius=6)
        if is_cand:
            rect(draw, sx, ey, 8, 74, ACCENT_GREEN, radius=4)
        text(draw, (sx+30, ey+12), name,    size=21, bold=True, color=WHITE)
        text(draw, (sx+30, ey+42), subject, size=18, color=LIGHT_GRAY)
        text(draw, (W-160, ey+12), time,    size=18, color=MED_GRAY)
        pill(draw, W-200, ey+38, 160, 28, sc if is_cand else DARK_BG2,
             status, 16, sc if not is_cand else WHITE, True)

    gradient_bar(draw, 0, H-8, W, 8, ACCENT_BLUE, ACCENT_CYAN)
    return img_to_frame(img)


def render_cv_parse(progress=0.0):
    """Scene 3: CV Parsing — raw PDF → structured data, animated reveal."""
    img, draw = new_canvas()
    gradient_bar(draw, 0, 0, W, 8, ACCENT_CYAN, ACCENT_GREEN)

    pill(draw, 60, 50, 220, 40, ACCENT_CYAN, "CV PROCESSING", 19, WHITE, True)
    text(draw, (60, 120), "Intelligent Resume Extraction", size=52, bold=True, color=WHITE)

    # PDF mockup
    rect(draw, 80, 220, 560, 760, (248, 250, 252))
    text(draw, (360, 250), "curriculum_vitae.pdf", size=22, bold=True,
         color=(30, 41, 59), anchor="mm")
    draw.line([(100, 270), (620, 270)], fill=(226, 232, 240), width=2)
    lines = [
        ("MARIA SILVA", True),
        ("Senior .NET Developer", False),
        ("", False),
        ("EXPERIENCE", True),
        ("ITSector 2019–present  .NET Developer", False),
        ("BNP Paribas 2016–2019  Software Engineer", False),
        ("", False),
        ("SKILLS", True),
        ("C#  .NET Core  Azure  SQL Server  Docker", False),
        ("REST APIs  Microservices  CI/CD  Git", False),
        ("", False),
        ("LANGUAGES", True),
        ("Portuguese (Native)  English (Fluent)", False),
        ("", False),
        ("EDUCATION", True),
        ("MSc Computer Engineering — IST 2016", False),
    ]
    for i, (ln, hdr) in enumerate(lines):
        c = (15, 23, 42) if hdr else (71, 85, 105)
        text(draw, (110, 290 + i*38), ln, size=18 if hdr else 17,
             bold=hdr, color=c)

    # Arrow
    arrow_x = 680
    draw.polygon([(arrow_x, 580), (arrow_x+80, 620), (arrow_x, 660)], fill=ACCENT_CYAN)
    text(draw, (arrow_x+10, 680), "AI Parse", size=20, color=ACCENT_CYAN, anchor="mm")

    # Structured output — reveal animated by progress
    fields = [
        ("Name",             "Maria Silva",                       ACCENT_CYAN),
        ("Current Title",    "Senior .NET Developer",             ACCENT_CYAN),
        ("Experience",       "8 years",                           ACCENT_CYAN),
        ("Skills",           '["C#", ".NET Core", "Azure"]',      ACCENT_GREEN),
        ("Languages",        '["Portuguese", "English"]',         ACCENT_GREEN),
        ("Education",        "MSc Computer Eng. — IST 2016",      ACCENT_GREEN),
        ("Email",            "maria.silva@gmail.com",             ACCENT_BLUE),
        ("LinkedIn",         "linkedin.com/in/maria-silva-dev",   ACCENT_BLUE),
        ("Confidence",       "94%",                               ACCENT_GREEN),
    ]
    visible = max(1, int(len(fields) * min(progress, 1.0)))
    rect(draw, 800, 220, 1060, 760, CARD_BG, radius=10)
    text(draw, (830, 245), "Extracted Data", size=22, bold=True, color=ACCENT_GREEN)
    for i, (key, val, col) in enumerate(fields[:visible]):
        fy = 300 + i*72
        text(draw, (830, fy),    key, size=18, bold=True, color=MED_GRAY)
        text(draw, (1030, fy),   val, size=18, color=col)

    gradient_bar(draw, 0, H-8, W, 8, ACCENT_CYAN, ACCENT_GREEN)
    return img_to_frame(img)


def render_scoring():
    """Scene 4: Scoring Engine."""
    img, draw = new_canvas()
    gradient_bar(draw, 0, 0, W, 8, ACCENT_PURPLE, ACCENT_BLUE)

    pill(draw, 60, 50, 250, 40, ACCENT_PURPLE, "SCORING ENGINE", 19, WHITE, True)
    text(draw, (60, 120), "Objective and Configurable Evaluation", size=52, bold=True, color=WHITE)

    # Big score circle
    cx, cy, r = 340, 560, 200
    draw.ellipse([cx-r, cy-r, cx+r, cy+r], fill=ACCENT_BLUE)
    draw.ellipse([cx-r+18, cy-r+18, cx+r-18, cy+r-18], fill=DARK_BG)
    text(draw, (cx, cy-30), "91", size=100, bold=True, color=WHITE, anchor="mm")
    text(draw, (cx, cy+55), "/ 100", size=28, color=MED_GRAY, anchor="mm")
    text(draw, (cx, cy+100), "ADVANCE →", size=22, bold=True, color=ACCENT_GREEN, anchor="mm")

    criteria = [
        ("Required Skills",   0.90, ACCENT_BLUE),
        ("Years Experience",  0.80, ACCENT_CYAN),
        ("Optional Skills",   0.70, ACCENT_GREEN),
        ("Languages",         1.00, ACCENT_PURPLE),
        ("Domain",            0.60, ACCENT_AMBER),
        ("Location",          0.80, ACCENT_CYAN),
        ("CV Quality",        0.90, ACCENT_GREEN),
        ("Seniority Match",   0.70, ACCENT_BLUE),
    ]
    for i, (name, pct, color) in enumerate(criteria):
        ry = 220 + i*75
        text(draw, (620, ry+8), name, size=20, color=WHITE, bold=True)
        progress_bar(draw, 920, ry+12, 700, 24, pct, DARK_BG2, color, radius=6)
        text(draw, (1650, ry+8), f"{int(pct*100)}%", size=20, color=color, bold=True)

    # Thresholds
    for i, (score, action, desc, color) in enumerate([
        ("75+",   "ADVANCE",        "Auto-advances to interview",   ACCENT_GREEN),
        ("45–74", "MANUAL REVIEW",  "Recruiter decides",            ACCENT_AMBER),
        ("<45",   "REJECT",         "Below minimum threshold",       ACCENT_ROSE),
    ]):
        tx = 100 + i*580
        rect(draw, tx, 870, 520, 100, DARK_BG2, radius=8)
        rect(draw, tx, 870, 8, 100, color, radius=4)
        text(draw, (tx+30, 885), score,  size=30, bold=True, color=color)
        text(draw, (tx+30, 925), action, size=22, bold=True, color=color)
        text(draw, (tx+30, 955), desc,   size=18, color=MED_GRAY)

    gradient_bar(draw, 0, H-8, W, 8, ACCENT_PURPLE, ACCENT_BLUE)
    return img_to_frame(img)


def render_dashboard():
    """Scene 5: Dashboard KPIs."""
    img, draw = new_canvas()
    gradient_bar(draw, 0, 0, W, 8, ACCENT_BLUE, ACCENT_CYAN)

    pill(draw, 60, 50, 200, 40, ACCENT_BLUE, "DASHBOARD", 19, WHITE, True)
    text(draw, (60, 120), "Real-Time Recruitment Overview", size=52, bold=True, color=WHITE)

    # KPI cards
    kpis = [
        ("312", "Total Candidates", ACCENT_BLUE),
        ("14",  "Open Jobs",         ACCENT_GREEN),
        ("41",  "In Review",         ACCENT_AMBER),
        ("92%", "Processing Rate",   ACCENT_CYAN),
    ]
    for i, (val, label, color) in enumerate(kpis):
        kx = 80 + i*460
        rect(draw, kx, 220, 420, 180, CARD_BG, radius=10)
        text(draw, (kx+210, 290), val,   size=72, bold=True, color=color, anchor="mm")
        text(draw, (kx+210, 360), label, size=22, color=MED_GRAY, anchor="mm")

    # Pipeline bar
    rect(draw, 80, 460, W-160, 200, CARD_BG, radius=10)
    text(draw, (100, 480), "Recruitment Pipeline", size=22, bold=True, color=LIGHT_GRAY)
    stages = [
        ("New",       52, ACCENT_BLUE),
        ("Review",    31, ACCENT_AMBER),
        ("Shortlist", 18, ACCENT_CYAN),
        ("Interview", 10, ACCENT_PURPLE),
        ("Offer",      4, ACCENT_GREEN),
        ("Hired",      6, ACCENT_GREEN),
    ]
    for i, (stage, count, color) in enumerate(stages):
        sx = 100 + i*295
        rect(draw, sx, 530, 270, 100, color, radius=10)
        text(draw, (sx+135, 575), str(count), size=42, bold=True, color=WHITE, anchor="mm")
        text(draw, (sx+135, 616), stage,      size=20, color=WHITE, anchor="mm")

    # Recent activity
    rect(draw, 80, 720, W-160, 260, CARD_BG, radius=10)
    text(draw, (100, 740), "Recent Activity", size=22, bold=True, color=LIGHT_GRAY)
    activities = [
        ("Duplicate merged: Joao Santos (2 records)",     ACCENT_AMBER),
        ("Score: Pedro Almeida — 91/100 → ADVANCE",       ACCENT_GREEN),
        ("Candidate created: Ana Rodrigues (React Dev)",   ACCENT_BLUE),
        ("Interview scheduled: Maria Silva (14 May)",      ACCENT_PURPLE),
        ("Excel export: 312 candidates generated",         ACCENT_CYAN),
    ]
    for i, (act, color) in enumerate(activities):
        draw.ellipse([110, 790+i*42, 126, 806+i*42], fill=color)
        text(draw, (145, 790+i*42), act, size=20, color=LIGHT_GRAY)

    gradient_bar(draw, 0, H-8, W, 8, ACCENT_BLUE, ACCENT_CYAN)
    return img_to_frame(img)


def render_cta():
    """Scene 6: Call to action."""
    img, draw = new_canvas()

    from PIL import ImageFilter
    glow = Image.new("RGB", (W, H), DARK_BG)
    gd = ImageDraw.Draw(glow)
    gd.ellipse([-300, -300, 1000, 1000], fill=(21, 40, 80))
    gd.ellipse([1100, 300, 2500, 1700], fill=(15, 30, 60))
    img = Image.blend(img, glow, 0.7)
    draw = ImageDraw.Draw(img)

    gradient_bar(draw, 0, 0, W, 8, ACCENT_BLUE, ACCENT_CYAN)

    text(draw, (W//2, 300), "Ready to Transform", size=86, bold=True,
         color=WHITE, anchor="mm")
    text(draw, (W//2, 410), "Recruitment?", size=86, bold=True,
         color=ACCENT_CYAN, anchor="mm")

    draw.line([(W//2-200, 470), (W//2+200, 470)], fill=ACCENT_BLUE, width=3)

    text(draw, (W//2, 540),
         "4 Phases Complete  ·  19+ Features  ·  100% Local & Secure",
         size=28, color=LIGHT_GRAY, anchor="mm")

    for i, (val, lbl) in enumerate([
        ("19+","Complete Features"),
        ("14+","Database Models"),
        ("4","Phases Complete"),
        ("100%","Local & Secure"),
    ]):
        sx = 240 + i*380
        text(draw, (sx, 660), val, size=64, bold=True, color=ACCENT_CYAN, anchor="mm")
        text(draw, (sx, 730), lbl, size=22, color=MED_GRAY, anchor="mm")

    pill(draw, W//2-220, 810, 440, 80, ACCENT_BLUE, "Get Started  ›", 32, WHITE, True)

    text(draw, (W//2, 950),
         "ITSector  |  careers@itsector.pt  |  Talent Inbox ATS v2.0",
         size=22, color=MED_GRAY, anchor="mm")

    gradient_bar(draw, 0, H-8, W, 8, ACCENT_BLUE, ACCENT_CYAN)
    return img_to_frame(img)


# ─── ANIMATED CLIP BUILDERS ──────────────────────────────────────

FADE = 0.5   # cross-fade duration in seconds

def static_clip(frame_fn, duration, *args):
    """Static scene with optional fade in/out."""
    f = frame_fn(*args) if args else frame_fn()
    clip = ImageClip(f).set_duration(duration)
    return clip.fx(fadein, FADE).fx(fadeout, FADE)

def animated_clip(frame_fn, duration, fps=FPS):
    """Scene where frame_fn receives progress 0..1."""
    def make_frame(t):
        return frame_fn(t / duration)
    clip = VideoClip(make_frame, duration=duration).set_fps(fps)
    return clip.fx(fadein, FADE).fx(fadeout, FADE)


# ─── TITLE CARD OVERLAY ──────────────────────────────────────────

def title_card(title, subtitle, color, duration=1.8):
    """Brief chapter-title overlay clip."""
    img, draw = new_canvas(DARK_BG2)
    gradient_bar(draw, 0, 0, W, 8, color, ACCENT_CYAN)
    text(draw, (W//2, H//2 - 40), title,    size=80, bold=True, color=WHITE,  anchor="mm")
    text(draw, (W//2, H//2 + 60), subtitle, size=32, color=LIGHT_GRAY, anchor="mm")
    gradient_bar(draw, 0, H-8, W, 8, color, ACCENT_CYAN)
    f = img_to_frame(img)
    return ImageClip(f).set_duration(duration).fx(fadein, 0.3).fx(fadeout, 0.3)


# ─── MAIN ────────────────────────────────────────────────────────

def main():
    print("Rendering scenes…")

    clips = [
        # Intro
        static_clip(render_intro, 4.0),
        title_card("THE PROBLEM", "Why email-based recruitment fails", ACCENT_ROSE),
        static_clip(render_problem, 5.0),
        title_card("SMART INBOX", "Automatic sync with Microsoft 365", ACCENT_BLUE),
        animated_clip(render_inbox, 5.0),
        title_card("CV PROCESSING", "Intelligent resume extraction", ACCENT_CYAN),
        animated_clip(render_cv_parse, 5.0),
        title_card("SCORING ENGINE", "Objective, configurable evaluation", ACCENT_PURPLE),
        static_clip(render_scoring, 5.0),
        title_card("DASHBOARD", "Real-time recruitment overview", ACCENT_GREEN),
        static_clip(render_dashboard, 5.0),
        # CTA
        static_clip(render_cta, 5.0),
    ]

    print("Concatenating clips…")
    final = concatenate_videoclips(clips, method="compose")

    print(f"Exporting to {OUTPUT}  (~{final.duration:.0f}s at {FPS}fps)…")
    final.write_videofile(
        OUTPUT,
        fps=FPS,
        codec="libx264",
        audio=False,
        preset="fast",
        logger="bar",
    )
    print(f"\nDone: {OUTPUT}")


if __name__ == "__main__":
    main()
