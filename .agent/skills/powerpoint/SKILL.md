---
name: PowerPoint Generation
description: Generate professional PowerPoint presentations using python-pptx
---

# PowerPoint Generation Skill

This skill enables you to generate professional PowerPoint (.pptx) presentations programmatically using the `python-pptx` library.

## Prerequisites

Before generating a presentation, ensure python-pptx is installed:

```bash
# Create virtual environment if needed
python3 -m venv /path/to/project/venv

# Install python-pptx
/path/to/project/venv/bin/pip install python-pptx
```

## Core Concepts

### Presentation Structure
- **Presentation**: The overall .pptx file
- **Slide**: Individual pages in the presentation
- **Shapes**: Text boxes, images, tables, diagrams on slides
- **Text Frame**: Container for text within a shape
- **Paragraph**: Text formatting unit within a text frame

### Common Slide Types
1. **Title Slide**: Main title with subtitle
2. **Content Slide**: Title with bullet points
3. **Two-Column Slide**: Side-by-side comparison
4. **Code Slide**: Dark background with monospace text
5. **Image Slide**: Visual-focused layout

## Implementation Pattern

### Basic Script Structure

```python
#!/usr/bin/env python3
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE
import os

# Brand colors (customize per project)
PRIMARY_COLOR = RGBColor(0, 104, 74)   # Green
DARK_COLOR = RGBColor(33, 49, 60)      # Dark gray
LIGHT_COLOR = RGBColor(249, 251, 250)  # Off-white

def create_presentation():
    """Main presentation generator."""
    prs = Presentation()
    prs.slide_width = Inches(10)
    prs.slide_height = Inches(7.5)
    
    # Add slides here...
    
    return prs

def main():
    prs = create_presentation()
    output_path = os.path.join(os.path.dirname(__file__), "output.pptx")
    prs.save(output_path)
    print(f"✅ Saved to: {output_path}")

if __name__ == "__main__":
    main()
```

### Helper Functions

#### Title Slide
```python
def add_title_slide(prs, title, subtitle=""):
    """Add a title slide."""
    slide = prs.slides.add_slide(prs.slide_layouts[6])  # Blank
    
    # Title
    title_box = slide.shapes.add_textbox(Inches(0.5), Inches(2.5), Inches(9), Inches(1.5))
    p = title_box.text_frame.paragraphs[0]
    p.text = title
    p.font.size = Pt(44)
    p.font.bold = True
    p.font.color.rgb = PRIMARY_COLOR
    p.alignment = PP_ALIGN.CENTER
    
    # Subtitle
    if subtitle:
        sub_box = slide.shapes.add_textbox(Inches(0.5), Inches(4), Inches(9), Inches(0.75))
        p = sub_box.text_frame.paragraphs[0]
        p.text = subtitle
        p.font.size = Pt(24)
        p.font.color.rgb = DARK_COLOR
        p.alignment = PP_ALIGN.CENTER
    
    return slide
```

#### Content Slide with Bullets
```python
def add_content_slide(prs, title, bullets, speaker_notes=""):
    """Add a content slide with bullet points."""
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    
    # Title
    title_box = slide.shapes.add_textbox(Inches(0.5), Inches(0.4), Inches(9), Inches(0.8))
    p = title_box.text_frame.paragraphs[0]
    p.text = title
    p.font.size = Pt(32)
    p.font.bold = True
    p.font.color.rgb = PRIMARY_COLOR
    
    # Accent line under title
    line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 
                                   Inches(0.5), Inches(1.15), 
                                   Inches(2), Inches(0.05))
    line.fill.solid()
    line.fill.fore_color.rgb = PRIMARY_COLOR
    line.line.fill.background()
    
    # Bullet points
    content_box = slide.shapes.add_textbox(Inches(0.5), Inches(1.4), Inches(9), Inches(5))
    tf = content_box.text_frame
    tf.word_wrap = True
    
    for i, bullet in enumerate(bullets):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.text = f"• {bullet}"
        p.font.size = Pt(20)
        p.font.color.rgb = DARK_COLOR
        p.space_after = Pt(12)
    
    # Speaker notes
    if speaker_notes:
        slide.notes_slide.notes_text_frame.text = speaker_notes
    
    return slide
```

#### Two-Column Comparison Slide
```python
def add_two_column_slide(prs, title, left_title, left_bullets, right_title, right_bullets, speaker_notes=""):
    """Add a two-column comparison slide."""
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    
    # Main title
    title_box = slide.shapes.add_textbox(Inches(0.5), Inches(0.4), Inches(9), Inches(0.8))
    p = title_box.text_frame.paragraphs[0]
    p.text = title
    p.font.size = Pt(32)
    p.font.bold = True
    p.font.color.rgb = PRIMARY_COLOR
    
    # Left column
    left_title_box = slide.shapes.add_textbox(Inches(0.5), Inches(1.3), Inches(4.3), Inches(0.5))
    p = left_title_box.text_frame.paragraphs[0]
    p.text = left_title
    p.font.size = Pt(22)
    p.font.bold = True
    
    left_box = slide.shapes.add_textbox(Inches(0.5), Inches(1.9), Inches(4.3), Inches(4.5))
    tf = left_box.text_frame
    tf.word_wrap = True
    for i, bullet in enumerate(left_bullets):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.text = f"• {bullet}"
        p.font.size = Pt(16)
        p.space_after = Pt(8)
    
    # Right column
    right_title_box = slide.shapes.add_textbox(Inches(5.2), Inches(1.3), Inches(4.3), Inches(0.5))
    p = right_title_box.text_frame.paragraphs[0]
    p.text = right_title
    p.font.size = Pt(22)
    p.font.bold = True
    
    right_box = slide.shapes.add_textbox(Inches(5.2), Inches(1.9), Inches(4.3), Inches(4.5))
    tf = right_box.text_frame
    tf.word_wrap = True
    for i, bullet in enumerate(right_bullets):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.text = f"• {bullet}"
        p.font.size = Pt(16)
        p.space_after = Pt(8)
    
    if speaker_notes:
        slide.notes_slide.notes_text_frame.text = speaker_notes
    
    return slide
```

#### Code Block Slide
```python
def add_code_slide(prs, title, code, speaker_notes=""):
    """Add a slide with code block (dark background)."""
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    
    # Title
    title_box = slide.shapes.add_textbox(Inches(0.5), Inches(0.4), Inches(9), Inches(0.8))
    p = title_box.text_frame.paragraphs[0]
    p.text = title
    p.font.size = Pt(32)
    p.font.bold = True
    p.font.color.rgb = PRIMARY_COLOR
    
    # Dark code background
    code_bg = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, 
                                      Inches(0.5), Inches(1.3), 
                                      Inches(9), Inches(5))
    code_bg.fill.solid()
    code_bg.fill.fore_color.rgb = RGBColor(30, 30, 30)
    
    # Code text
    code_box = slide.shapes.add_textbox(Inches(0.7), Inches(1.5), Inches(8.6), Inches(4.6))
    p = code_box.text_frame.paragraphs[0]
    p.text = code
    p.font.size = Pt(12)
    p.font.name = "Consolas"
    p.font.color.rgb = RGBColor(220, 220, 220)
    
    if speaker_notes:
        slide.notes_slide.notes_text_frame.text = speaker_notes
    
    return slide
```

## Usage Instructions

1. **Create the script** in your project's `scripts/` folder
2. **Customize colors** to match brand guidelines
3. **Define slides** by calling helper functions
4. **Run the script**:
   ```bash
   ./venv/bin/python scripts/generate_presentation.py
   ```
5. **Output** will be a .pptx file in the same directory

## Tips

- Use `Inches()` for positioning (10" wide x 7.5" tall is standard)
- Use `Pt()` for font sizes
- Use `RGBColor(r, g, b)` for colors (0-255 values)
- Speaker notes are added via `slide.notes_slide.notes_text_frame.text`
- Use blank layout (`prs.slide_layouts[6]`) for full control
- Add shapes with `slide.shapes.add_shape()` for diagrams

## Common Issues

| Issue | Solution |
|-------|----------|
| `ImportError: RgbColor` | Use `RGBColor` (capitalized) |
| Text not wrapping | Set `text_frame.word_wrap = True` |
| Font not applied | Set font on paragraph, not text_frame |
| Slide layout issues | Use blank layout (index 6) |
