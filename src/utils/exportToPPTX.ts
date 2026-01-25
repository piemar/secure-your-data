import PptxGenJS from 'pptxgenjs';
import { SlideData } from '@/components/presentation/slidesPPTXData';

// MongoDB brand colors (hex without #)
const COLORS = {
  background: '0d1117',
  cardBg: '161b22',
  cardBorder: '30363d',
  primary: '00ED64',
  primaryDark: '00a847',
  text: 'c9d1d9',
  textMuted: '8b949e',
  white: 'ffffff',
  warning: 'f0ad4e',
  error: 'f85149',
  headerBg: '21262d',
};

// Slide dimensions (16:9)
const SLIDE = {
  width: 10,
  height: 5.625,
  margin: 0.4,
  contentStart: 1.1,
};

export async function exportToPPTX(slides: SlideData[], filename: string = 'MongoDB-CSFLE-QE-Presentation') {
  const pptx = new PptxGenJS();

  // Set presentation properties
  pptx.author = 'MongoDB Solutions Architecture';
  pptx.title = 'Client-Side Field Level Encryption & Queryable Encryption';
  pptx.subject = 'SA Enablement Session';
  pptx.company = 'MongoDB';
  pptx.layout = 'LAYOUT_16x9';

  // Define master slide layout with branding
  pptx.defineSlideMaster({
    title: 'MONGODB_MASTER',
    background: { color: COLORS.background },
    objects: [
      // Top accent line
      {
        rect: {
          x: 0,
          y: 0,
          w: '100%',
          h: 0.04,
          fill: { color: COLORS.primary },
        },
      },
      // Bottom footer bar
      {
        rect: {
          x: 0,
          y: 5.35,
          w: '100%',
          h: 0.275,
          fill: { color: COLORS.headerBg },
        },
      },
      // MongoDB text logo
      {
        text: {
          text: '◆ MongoDB',
          options: {
            x: 0.3,
            y: 5.38,
            w: 1.5,
            h: 0.22,
            fontSize: 9,
            color: COLORS.primary,
            fontFace: 'Arial',
            bold: true,
          },
        },
      },
      // Session title in footer
      {
        text: {
          text: 'SA Enablement: CSFLE & Queryable Encryption',
          options: {
            x: 2,
            y: 5.38,
            w: 5,
            h: 0.22,
            fontSize: 8,
            color: COLORS.textMuted,
            fontFace: 'Arial',
            align: 'center',
          },
        },
      },
    ],
    slideNumber: {
      x: 9.2,
      y: 5.38,
      w: 0.5,
      h: 0.22,
      color: COLORS.textMuted,
      fontSize: 9,
      fontFace: 'Arial',
    },
  });

  // Title slide master (no footer)
  pptx.defineSlideMaster({
    title: 'MONGODB_TITLE',
    background: { color: COLORS.background },
    objects: [
      // Top accent bar
      {
        rect: {
          x: 0,
          y: 0,
          w: '100%',
          h: 0.08,
          fill: { color: COLORS.primary },
        },
      },
      // Bottom accent
      {
        rect: {
          x: 0,
          y: 5.545,
          w: '100%',
          h: 0.08,
          fill: { color: COLORS.primary },
        },
      },
      // Center glow effect (simulated)
      {
        rect: {
          x: 3.5,
          y: 1.8,
          w: 3,
          h: 0.8,
          fill: { color: COLORS.cardBg },
          line: { color: COLORS.primary, pt: 2 },
          rectRadius: 0.15,
        },
      },
    ],
  });

  // Generate slides
  slides.forEach((slideData, index) => {
    if (index === 0) {
      createTitleSlide(pptx, slideData);
    } else if (slideData.sectionNumber === 0 && slideData.section === 'Agenda') {
      createAgendaSlide(pptx, slideData);
    } else {
      createContentSlide(pptx, slideData);
    }
  });

  // Save the file
  await pptx.writeFile({ fileName: `${filename}.pptx` });
}

function createTitleSlide(pptx: PptxGenJS, slideData: SlideData) {
  const slide = pptx.addSlide({ masterName: 'MONGODB_TITLE' });
  const { exportContent } = slideData;

  // Shield icon simulation
  slide.addShape('rect', {
    x: 4.25,
    y: 1.0,
    w: 1.5,
    h: 1.5,
    fill: { color: COLORS.cardBg },
    line: { color: COLORS.primary, pt: 3 },
    rectRadius: 0.2,
  });

  // Shield symbol
  slide.addText('🛡️', {
    x: 4.25,
    y: 1.15,
    w: 1.5,
    h: 1.2,
    fontSize: 48,
    align: 'center',
    valign: 'middle',
  });

  // Main title
  slide.addText(exportContent.title, {
    x: 0.5,
    y: 2.6,
    w: 9,
    h: 0.8,
    fontSize: 32,
    bold: true,
    color: COLORS.primary,
    fontFace: 'Arial',
    align: 'center',
  });

  // Subtitle
  if (exportContent.subtitle) {
    const subtitleLines = exportContent.subtitle.split('\n');
    slide.addText(subtitleLines[0] || '', {
      x: 0.5,
      y: 3.5,
      w: 9,
      h: 0.4,
      fontSize: 16,
      color: COLORS.text,
      fontFace: 'Arial',
      align: 'center',
    });
    if (subtitleLines[1]) {
      slide.addText(subtitleLines[1], {
        x: 0.5,
        y: 4.0,
        w: 9,
        h: 0.4,
        fontSize: 14,
        color: COLORS.primary,
        fontFace: 'Arial',
        align: 'center',
        bold: true,
      });
    }
  }

  if (exportContent.notes) {
    slide.addNotes(exportContent.notes);
  }
}

function createAgendaSlide(pptx: PptxGenJS, slideData: SlideData) {
  const slide = pptx.addSlide({ masterName: 'MONGODB_MASTER' });
  const { exportContent } = slideData;

  // Title
  slide.addText(exportContent.title, {
    x: SLIDE.margin,
    y: 0.3,
    w: 9,
    h: 0.5,
    fontSize: 24,
    bold: true,
    color: COLORS.primary,
    fontFace: 'Arial',
  });

  // Agenda items in a 2x4 grid
  const bullets = exportContent.bullets || [];
  const colWidth = 4.3;
  const rowHeight = 0.55;
  const startX = SLIDE.margin;
  const startY = 0.95;

  bullets.forEach((bullet, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = startX + col * (colWidth + 0.2);
    const y = startY + row * (rowHeight + 0.15);

    // Card background
    slide.addShape('roundRect', {
      x: x,
      y: y,
      w: colWidth,
      h: rowHeight,
      fill: { color: COLORS.cardBg },
      line: { color: COLORS.cardBorder, pt: 1 },
      rectRadius: 0.05,
    });

    // Extract number and text
    const match = bullet.match(/^(\d+)\s+(.+)$/);
    const num = match ? match[1].padStart(2, '0') : `0${i + 1}`;
    const text = match ? match[2] : bullet;

    // Number
    slide.addText(num, {
      x: x + 0.1,
      y: y + 0.08,
      w: 0.4,
      h: 0.4,
      fontSize: 16,
      bold: true,
      color: COLORS.primary,
      fontFace: 'Arial',
    });

    // Text
    slide.addText(text, {
      x: x + 0.55,
      y: y + 0.1,
      w: colWidth - 0.7,
      h: 0.35,
      fontSize: 10,
      color: COLORS.text,
      fontFace: 'Arial',
      valign: 'middle',
    });
  });

  if (exportContent.notes) {
    slide.addNotes(exportContent.notes);
  }
}

function createContentSlide(pptx: PptxGenJS, slideData: SlideData) {
  const slide = pptx.addSlide({ masterName: 'MONGODB_MASTER' });
  const { exportContent } = slideData;

  // Section indicator badge
  if (slideData.sectionNumber > 0) {
    slide.addShape('roundRect', {
      x: SLIDE.margin,
      y: 0.2,
      w: 2.2,
      h: 0.28,
      fill: { color: '1a3a2a' },
      line: { color: COLORS.primaryDark, pt: 1 },
      rectRadius: 0.05,
    });

    slide.addText(`0${slideData.sectionNumber}  ${slideData.section.toUpperCase()}`, {
      x: SLIDE.margin + 0.1,
      y: 0.21,
      w: 2,
      h: 0.26,
      fontSize: 8,
      color: COLORS.primary,
      fontFace: 'Arial',
      bold: true,
    });
  }

  // Title
  const titleY = slideData.sectionNumber > 0 ? 0.55 : 0.25;
  slide.addText(exportContent.title, {
    x: SLIDE.margin,
    y: titleY,
    w: 9,
    h: 0.45,
    fontSize: 22,
    bold: true,
    color: COLORS.primary,
    fontFace: 'Arial',
  });

  // Accent line under title
  slide.addShape('rect', {
    x: SLIDE.margin,
    y: titleY + 0.5,
    w: 1.5,
    h: 0.03,
    fill: { color: COLORS.primary },
  });

  let contentY = titleY + 0.7;

  // Add table if present
  if (exportContent.table) {
    const tableRows: PptxGenJS.TableRow[] = [
      // Header row
      exportContent.table.headers.map((h) => ({
        text: h,
        options: {
          fill: { color: COLORS.headerBg },
          color: COLORS.primary,
          bold: true,
          fontSize: 10,
          fontFace: 'Arial',
          align: 'center' as const,
          valign: 'middle' as const,
        },
      })),
      // Data rows
      ...exportContent.table.rows.map((row, rowIndex) =>
        row.map((cell) => ({
          text: cell,
          options: {
            fill: { color: rowIndex % 2 === 0 ? COLORS.cardBg : COLORS.background },
            color: COLORS.text,
            fontSize: 9,
            fontFace: 'Arial',
            valign: 'middle' as const,
          },
        }))
      ),
    ];

    const numCols = exportContent.table.headers.length;
    slide.addTable(tableRows, {
      x: SLIDE.margin,
      y: contentY,
      w: 9.2,
      colW: 9.2 / numCols,
      rowH: 0.35,
      border: { type: 'solid', color: COLORS.cardBorder, pt: 0.5 },
      margin: [0.05, 0.1, 0.05, 0.1],
    });

    contentY += 0.35 + exportContent.table.rows.length * 0.35 + 0.2;
  }

  // Add bullets if present
  if (exportContent.bullets && exportContent.bullets.length > 0) {
    const bulletHeight = Math.min(exportContent.bullets.length * 0.4 + 0.3, 4);
    
    // Card background for bullets
    slide.addShape('roundRect', {
      x: SLIDE.margin,
      y: contentY,
      w: 9.2,
      h: bulletHeight,
      fill: { color: COLORS.cardBg },
      line: { color: COLORS.cardBorder, pt: 1 },
      rectRadius: 0.08,
    });

    // Create bullet text with proper formatting
    const bulletTextParts: PptxGenJS.TextProps[] = exportContent.bullets.map((bullet) => ({
      text: bullet,
      options: {
        bullet: { 
          type: 'bullet' as const, 
          code: '25CF',
          color: COLORS.primary,
        },
        color: COLORS.text,
        fontSize: 12,
        fontFace: 'Arial',
        breakLine: true,
        paraSpaceAfter: 8,
        indentLevel: 0,
      },
    }));

    slide.addText(bulletTextParts, {
      x: SLIDE.margin + 0.2,
      y: contentY + 0.15,
      w: 8.8,
      h: bulletHeight - 0.3,
      valign: 'top',
    });
  }

  if (exportContent.notes) {
    slide.addNotes(exportContent.notes);
  }
}
