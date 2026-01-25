---
name: html2pptx
description: Convert HTML strings or elements into PowerPoint slides using PptxGenJS
---

# html2pptx Skill

This skill allows you to convert HTML content into PowerPoint presentations using the `html2pptx` and `pptxgenjs` libraries. This is particularly useful for generating complex slides with mixed formatting (bold, italic, colors) that are easier to describe in HTML than through programmatic object construction.

## Prerequisites

Ensure the following NPM packages are installed:

```bash
npm install pptxgenjs html2pptx
```

## Basic Usage

### Programmatic Slide Generation

```javascript
const pptxgen = require('pptxgenjs');
const { htmlToPptxText } = require('html2pptx');

async function createPresentation() {
    let pptx = new pptxgen();
    let slide = pptx.addSlide();

    const htmlContent = '<h1>Title</h1><p>This is <b>bold</b> and this is <i>italic</i>.</p>';
    
    // Convert HTML to PptxGenJS text objects
    const textObjects = htmlToPptxText(htmlContent);

    slide.addText(textObjects, { x: 1, y: 1, w: 8, h: 4 });

    await pptx.writeFile({ fileName: 'Presentation.pptx' });
}
```

## Advanced Features

### Styling in HTML
The `html2pptx` library handles basic HTML tags and some inline styles:
- `<b>`, `<strong>`: Bold
- `<i>`, `<em>`: Italic
- `<u>`: Underline
- `<span>` with `style="color: #ff0000"`: Font color
- `<h1>`, `<h2>`, etc.: Mapped to different font sizes

### Layout Design
Combine `html2pptx` with standard `pptxgenjs` features for professional layouts:
- Use `addShape` for backgrounds and accent lines.
- Use `addImage` for logos and diagrams.
- Use `addTable` for structured data.

## Tips for Success

1. **Keep HTML simple**: The library focuses on text formatting within containers. Complex CSS layouts (flexbox, grid) will not be translated; handle those using `pptxgenjs` coordinates (`x`, `y`, `w`, `h`).
2. **Standard Units**: `pptxgenjs` uses inches as the default unit for positioning.
3. **RGB Colors**: Colors should be provided as hex strings (e.g., `'#00684A'`).
4. **Speaker Notes**: Add notes to slides using `slide.addNotes('Your notes here');`.
