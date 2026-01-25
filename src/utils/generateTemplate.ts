import PptxGenJS from 'pptxgenjs';

// MongoDB brand colors (hex without #)
const COLORS = {
  background: '0d1117',
  backgroundAlt: '161b22',
  cardBg: '1c2128',
  cardBorder: '30363d',
  primary: '00ED64',
  primaryDark: '00a847',
  primaryGlow: '00ED6433',
  text: 'c9d1d9',
  textMuted: '8b949e',
  white: 'ffffff',
  warning: 'f0ad4e',
  error: 'f85149',
  headerBg: '21262d',
  success: '3fb950',
};

// Slide layout constants
const LAYOUT = {
  width: 10,
  height: 5.625,
  margin: 0.4,
  footerHeight: 0.275,
  footerY: 5.35,
  accentLineHeight: 0.04,
};

/**
 * Generates a branded MongoDB PowerPoint template with multiple slide masters
 */
export async function generateBrandedTemplate(filename: string = 'MongoDB-Branded-Template') {
  const pptx = new PptxGenJS();

  // Set presentation properties
  pptx.author = 'MongoDB Solutions Architecture';
  pptx.title = 'MongoDB Branded Template';
  pptx.subject = 'CSFLE & Queryable Encryption';
  pptx.company = 'MongoDB';
  pptx.layout = 'LAYOUT_16x9';

  // ===== SLIDE MASTER 1: Title Slide =====
  pptx.defineSlideMaster({
    title: 'TITLE_SLIDE',
    background: { color: COLORS.background },
    objects: [
      // Top accent bar
      {
        rect: {
          x: 0,
          y: 0,
          w: '100%',
          h: LAYOUT.accentLineHeight * 2,
          fill: { color: COLORS.primary },
        },
      },
      // Bottom accent bar
      {
        rect: {
          x: 0,
          y: LAYOUT.height - LAYOUT.accentLineHeight * 2,
          w: '100%',
          h: LAYOUT.accentLineHeight * 2,
          fill: { color: COLORS.primary },
        },
      },
      // Center icon container
      {
        rect: {
          x: 4.0,
          y: 0.8,
          w: 2,
          h: 1.8,
          fill: { color: COLORS.cardBg },
          line: { color: COLORS.primary, pt: 3 },
          rectRadius: 0.2,
        },
      },
      // MongoDB logo in footer area
      {
        text: {
          text: '◆ MongoDB',
          options: {
            x: 0.3,
            y: LAYOUT.height - 0.5,
            w: 2,
            h: 0.3,
            fontSize: 11,
            color: COLORS.primary,
            fontFace: 'Arial',
            bold: true,
          },
        },
      },
    ],
  });

  // ===== SLIDE MASTER 2: Section Header =====
  pptx.defineSlideMaster({
    title: 'SECTION_HEADER',
    background: { color: COLORS.background },
    objects: [
      // Full-width accent at top
      {
        rect: {
          x: 0,
          y: 0,
          w: '100%',
          h: LAYOUT.accentLineHeight,
          fill: { color: COLORS.primary },
        },
      },
      // Large section number background
      {
        rect: {
          x: 0.4,
          y: 1.5,
          w: 2.5,
          h: 2.5,
          fill: { color: COLORS.cardBg },
          line: { color: COLORS.primaryDark, pt: 2 },
          rectRadius: 0.15,
        },
      },
      // Footer bar
      {
        rect: {
          x: 0,
          y: LAYOUT.footerY,
          w: '100%',
          h: LAYOUT.footerHeight,
          fill: { color: COLORS.headerBg },
        },
      },
      // MongoDB logo
      {
        text: {
          text: '◆ MongoDB',
          options: {
            x: 0.3,
            y: LAYOUT.footerY + 0.03,
            w: 1.5,
            h: 0.22,
            fontSize: 9,
            color: COLORS.primary,
            fontFace: 'Arial',
            bold: true,
          },
        },
      },
    ],
    slideNumber: {
      x: 9.2,
      y: LAYOUT.footerY + 0.03,
      w: 0.5,
      h: 0.22,
      color: COLORS.textMuted,
      fontSize: 9,
      fontFace: 'Arial',
    },
  });

  // ===== SLIDE MASTER 3: Content with Bullets =====
  pptx.defineSlideMaster({
    title: 'CONTENT_BULLETS',
    background: { color: COLORS.background },
    objects: [
      // Top accent line
      {
        rect: {
          x: 0,
          y: 0,
          w: '100%',
          h: LAYOUT.accentLineHeight,
          fill: { color: COLORS.primary },
        },
      },
      // Title underline accent
      {
        rect: {
          x: LAYOUT.margin,
          y: 1.05,
          w: 1.5,
          h: 0.03,
          fill: { color: COLORS.primary },
        },
      },
      // Content card background
      {
        rect: {
          x: LAYOUT.margin,
          y: 1.25,
          w: 9.2,
          h: 3.85,
          fill: { color: COLORS.cardBg },
          line: { color: COLORS.cardBorder, pt: 1 },
          rectRadius: 0.1,
        },
      },
      // Footer bar
      {
        rect: {
          x: 0,
          y: LAYOUT.footerY,
          w: '100%',
          h: LAYOUT.footerHeight,
          fill: { color: COLORS.headerBg },
        },
      },
      // MongoDB logo
      {
        text: {
          text: '◆ MongoDB',
          options: {
            x: 0.3,
            y: LAYOUT.footerY + 0.03,
            w: 1.5,
            h: 0.22,
            fontSize: 9,
            color: COLORS.primary,
            fontFace: 'Arial',
            bold: true,
          },
        },
      },
      // Session title
      {
        text: {
          text: 'SA Enablement: CSFLE & Queryable Encryption',
          options: {
            x: 2,
            y: LAYOUT.footerY + 0.03,
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
      y: LAYOUT.footerY + 0.03,
      w: 0.5,
      h: 0.22,
      color: COLORS.textMuted,
      fontSize: 9,
      fontFace: 'Arial',
    },
  });

  // ===== SLIDE MASTER 4: Two Column Layout =====
  pptx.defineSlideMaster({
    title: 'TWO_COLUMN',
    background: { color: COLORS.background },
    objects: [
      // Top accent line
      {
        rect: {
          x: 0,
          y: 0,
          w: '100%',
          h: LAYOUT.accentLineHeight,
          fill: { color: COLORS.primary },
        },
      },
      // Title underline
      {
        rect: {
          x: LAYOUT.margin,
          y: 1.05,
          w: 1.5,
          h: 0.03,
          fill: { color: COLORS.primary },
        },
      },
      // Left column card
      {
        rect: {
          x: LAYOUT.margin,
          y: 1.25,
          w: 4.4,
          h: 3.85,
          fill: { color: COLORS.cardBg },
          line: { color: COLORS.cardBorder, pt: 1 },
          rectRadius: 0.1,
        },
      },
      // Right column card
      {
        rect: {
          x: 5.2,
          y: 1.25,
          w: 4.4,
          h: 3.85,
          fill: { color: COLORS.cardBg },
          line: { color: COLORS.cardBorder, pt: 1 },
          rectRadius: 0.1,
        },
      },
      // Footer bar
      {
        rect: {
          x: 0,
          y: LAYOUT.footerY,
          w: '100%',
          h: LAYOUT.footerHeight,
          fill: { color: COLORS.headerBg },
        },
      },
      // MongoDB logo
      {
        text: {
          text: '◆ MongoDB',
          options: {
            x: 0.3,
            y: LAYOUT.footerY + 0.03,
            w: 1.5,
            h: 0.22,
            fontSize: 9,
            color: COLORS.primary,
            fontFace: 'Arial',
            bold: true,
          },
        },
      },
    ],
    slideNumber: {
      x: 9.2,
      y: LAYOUT.footerY + 0.03,
      w: 0.5,
      h: 0.22,
      color: COLORS.textMuted,
      fontSize: 9,
      fontFace: 'Arial',
    },
  });

  // ===== SLIDE MASTER 5: Table Layout =====
  pptx.defineSlideMaster({
    title: 'TABLE_LAYOUT',
    background: { color: COLORS.background },
    objects: [
      // Top accent line
      {
        rect: {
          x: 0,
          y: 0,
          w: '100%',
          h: LAYOUT.accentLineHeight,
          fill: { color: COLORS.primary },
        },
      },
      // Title underline
      {
        rect: {
          x: LAYOUT.margin,
          y: 1.05,
          w: 1.5,
          h: 0.03,
          fill: { color: COLORS.primary },
        },
      },
      // Footer bar
      {
        rect: {
          x: 0,
          y: LAYOUT.footerY,
          w: '100%',
          h: LAYOUT.footerHeight,
          fill: { color: COLORS.headerBg },
        },
      },
      // MongoDB logo
      {
        text: {
          text: '◆ MongoDB',
          options: {
            x: 0.3,
            y: LAYOUT.footerY + 0.03,
            w: 1.5,
            h: 0.22,
            fontSize: 9,
            color: COLORS.primary,
            fontFace: 'Arial',
            bold: true,
          },
        },
      },
    ],
    slideNumber: {
      x: 9.2,
      y: LAYOUT.footerY + 0.03,
      w: 0.5,
      h: 0.22,
      color: COLORS.textMuted,
      fontSize: 9,
      fontFace: 'Arial',
    },
  });

  // ===== SLIDE MASTER 6: Code/Diagram Layout =====
  pptx.defineSlideMaster({
    title: 'CODE_DIAGRAM',
    background: { color: COLORS.background },
    objects: [
      // Top accent line
      {
        rect: {
          x: 0,
          y: 0,
          w: '100%',
          h: LAYOUT.accentLineHeight,
          fill: { color: COLORS.primary },
        },
      },
      // Title underline
      {
        rect: {
          x: LAYOUT.margin,
          y: 1.05,
          w: 1.5,
          h: 0.03,
          fill: { color: COLORS.primary },
        },
      },
      // Code/Diagram area (darker background)
      {
        rect: {
          x: LAYOUT.margin,
          y: 1.25,
          w: 9.2,
          h: 3.85,
          fill: { color: '0a0c10' }, // Even darker
          line: { color: COLORS.cardBorder, pt: 1 },
          rectRadius: 0.1,
        },
      },
      // Terminal-style header bar
      {
        rect: {
          x: LAYOUT.margin,
          y: 1.25,
          w: 9.2,
          h: 0.3,
          fill: { color: COLORS.headerBg },
          rectRadius: 0,
        },
      },
      // Terminal dots
      {
        rect: {
          x: LAYOUT.margin + 0.15,
          y: 1.35,
          w: 0.1,
          h: 0.1,
          fill: { color: COLORS.error },
          rectRadius: 0.05,
        },
      },
      {
        rect: {
          x: LAYOUT.margin + 0.32,
          y: 1.35,
          w: 0.1,
          h: 0.1,
          fill: { color: COLORS.warning },
          rectRadius: 0.05,
        },
      },
      {
        rect: {
          x: LAYOUT.margin + 0.49,
          y: 1.35,
          w: 0.1,
          h: 0.1,
          fill: { color: COLORS.success },
          rectRadius: 0.05,
        },
      },
      // Footer bar
      {
        rect: {
          x: 0,
          y: LAYOUT.footerY,
          w: '100%',
          h: LAYOUT.footerHeight,
          fill: { color: COLORS.headerBg },
        },
      },
      // MongoDB logo
      {
        text: {
          text: '◆ MongoDB',
          options: {
            x: 0.3,
            y: LAYOUT.footerY + 0.03,
            w: 1.5,
            h: 0.22,
            fontSize: 9,
            color: COLORS.primary,
            fontFace: 'Arial',
            bold: true,
          },
        },
      },
    ],
    slideNumber: {
      x: 9.2,
      y: LAYOUT.footerY + 0.03,
      w: 0.5,
      h: 0.22,
      color: COLORS.textMuted,
      fontSize: 9,
      fontFace: 'Arial',
    },
  });

  // ===== SLIDE MASTER 7: Stats/Metrics Layout =====
  pptx.defineSlideMaster({
    title: 'STATS_LAYOUT',
    background: { color: COLORS.background },
    objects: [
      // Top accent line
      {
        rect: {
          x: 0,
          y: 0,
          w: '100%',
          h: LAYOUT.accentLineHeight,
          fill: { color: COLORS.primary },
        },
      },
      // Title underline
      {
        rect: {
          x: LAYOUT.margin,
          y: 1.05,
          w: 1.5,
          h: 0.03,
          fill: { color: COLORS.primary },
        },
      },
      // Stat card 1
      {
        rect: {
          x: LAYOUT.margin,
          y: 1.3,
          w: 2.9,
          h: 1.2,
          fill: { color: COLORS.cardBg },
          line: { color: COLORS.primary, pt: 2 },
          rectRadius: 0.1,
        },
      },
      // Stat card 2
      {
        rect: {
          x: 3.55,
          y: 1.3,
          w: 2.9,
          h: 1.2,
          fill: { color: COLORS.cardBg },
          line: { color: COLORS.primary, pt: 2 },
          rectRadius: 0.1,
        },
      },
      // Stat card 3
      {
        rect: {
          x: 6.7,
          y: 1.3,
          w: 2.9,
          h: 1.2,
          fill: { color: COLORS.cardBg },
          line: { color: COLORS.primary, pt: 2 },
          rectRadius: 0.1,
        },
      },
      // Content area below stats
      {
        rect: {
          x: LAYOUT.margin,
          y: 2.7,
          w: 9.2,
          h: 2.4,
          fill: { color: COLORS.cardBg },
          line: { color: COLORS.cardBorder, pt: 1 },
          rectRadius: 0.1,
        },
      },
      // Footer bar
      {
        rect: {
          x: 0,
          y: LAYOUT.footerY,
          w: '100%',
          h: LAYOUT.footerHeight,
          fill: { color: COLORS.headerBg },
        },
      },
      // MongoDB logo
      {
        text: {
          text: '◆ MongoDB',
          options: {
            x: 0.3,
            y: LAYOUT.footerY + 0.03,
            w: 1.5,
            h: 0.22,
            fontSize: 9,
            color: COLORS.primary,
            fontFace: 'Arial',
            bold: true,
          },
        },
      },
    ],
    slideNumber: {
      x: 9.2,
      y: LAYOUT.footerY + 0.03,
      w: 0.5,
      h: 0.22,
      color: COLORS.textMuted,
      fontSize: 9,
      fontFace: 'Arial',
    },
  });

  // ===== CREATE EXAMPLE SLIDES FOR EACH MASTER =====

  // 1. Title Slide Example
  const titleSlide = pptx.addSlide({ masterName: 'TITLE_SLIDE' });
  titleSlide.addText('🛡️', {
    x: 4.0,
    y: 1.0,
    w: 2,
    h: 1.4,
    fontSize: 56,
    align: 'center',
    valign: 'middle',
  });
  titleSlide.addText('Presentation Title', {
    x: 0.5,
    y: 2.8,
    w: 9,
    h: 0.7,
    fontSize: 32,
    bold: true,
    color: COLORS.primary,
    fontFace: 'Arial',
    align: 'center',
  });
  titleSlide.addText('Subtitle goes here', {
    x: 0.5,
    y: 3.5,
    w: 9,
    h: 0.5,
    fontSize: 16,
    color: COLORS.text,
    fontFace: 'Arial',
    align: 'center',
  });
  titleSlide.addText('SA Enablement Session', {
    x: 0.5,
    y: 4.1,
    w: 9,
    h: 0.4,
    fontSize: 14,
    bold: true,
    color: COLORS.primary,
    fontFace: 'Arial',
    align: 'center',
  });
  titleSlide.addNotes('TITLE_SLIDE: Use for presentation opening. Replace icon, title, and subtitle.');

  // 2. Section Header Example
  const sectionSlide = pptx.addSlide({ masterName: 'SECTION_HEADER' });
  sectionSlide.addText('01', {
    x: 0.6,
    y: 1.7,
    w: 2.1,
    h: 2,
    fontSize: 72,
    bold: true,
    color: COLORS.primary,
    fontFace: 'Arial',
    align: 'center',
    valign: 'middle',
  });
  sectionSlide.addText('Section Title', {
    x: 3.2,
    y: 2.2,
    w: 6.3,
    h: 0.7,
    fontSize: 36,
    bold: true,
    color: COLORS.primary,
    fontFace: 'Arial',
  });
  sectionSlide.addText('Brief description of this section', {
    x: 3.2,
    y: 2.9,
    w: 6.3,
    h: 0.5,
    fontSize: 16,
    color: COLORS.text,
    fontFace: 'Arial',
  });
  sectionSlide.addNotes('SECTION_HEADER: Use to introduce new sections. Update number and titles.');

  // 3. Content with Bullets Example
  const contentSlide = pptx.addSlide({ masterName: 'CONTENT_BULLETS' });
  addSectionBadge(contentSlide, '01', 'SECTION NAME');
  contentSlide.addText('Content Slide Title', {
    x: LAYOUT.margin,
    y: 0.55,
    w: 9,
    h: 0.45,
    fontSize: 22,
    bold: true,
    color: COLORS.primary,
    fontFace: 'Arial',
  });
  const bullets = [
    'First bullet point with key information',
    'Second bullet point explaining a concept',
    'Third bullet point with details',
    'Fourth bullet point summarizing',
  ];
  contentSlide.addText(
    bullets.map((b) => ({
      text: b,
      options: {
        bullet: { type: 'bullet' as const, code: '25CF', color: COLORS.primary },
        color: COLORS.text,
        fontSize: 14,
        fontFace: 'Arial',
        breakLine: true,
        paraSpaceAfter: 12,
      },
    })),
    {
      x: LAYOUT.margin + 0.25,
      y: 1.5,
      w: 8.7,
      h: 3.4,
      valign: 'top',
    }
  );
  contentSlide.addNotes('CONTENT_BULLETS: Standard content slide. Replace title and bullet points.');

  // 4. Two Column Example
  const twoColSlide = pptx.addSlide({ masterName: 'TWO_COLUMN' });
  addSectionBadge(twoColSlide, '02', 'COMPARISON');
  twoColSlide.addText('Two Column Comparison', {
    x: LAYOUT.margin,
    y: 0.55,
    w: 9,
    h: 0.45,
    fontSize: 22,
    bold: true,
    color: COLORS.primary,
    fontFace: 'Arial',
  });
  // Left column content
  twoColSlide.addText('Option A', {
    x: LAYOUT.margin + 0.2,
    y: 1.4,
    w: 4,
    h: 0.4,
    fontSize: 16,
    bold: true,
    color: COLORS.primary,
    fontFace: 'Arial',
  });
  twoColSlide.addText(
    ['Feature 1', 'Feature 2', 'Feature 3'].map((t) => ({
      text: t,
      options: {
        bullet: { type: 'bullet' as const, code: '2713', color: COLORS.primary },
        color: COLORS.text,
        fontSize: 12,
        breakLine: true,
        paraSpaceAfter: 8,
      },
    })),
    { x: LAYOUT.margin + 0.2, y: 1.9, w: 4, h: 2.5, valign: 'top' }
  );
  // Right column content
  twoColSlide.addText('Option B', {
    x: 5.4,
    y: 1.4,
    w: 4,
    h: 0.4,
    fontSize: 16,
    bold: true,
    color: COLORS.primary,
    fontFace: 'Arial',
  });
  twoColSlide.addText(
    ['Feature 1', 'Feature 2', 'Feature 3'].map((t) => ({
      text: t,
      options: {
        bullet: { type: 'bullet' as const, code: '2713', color: COLORS.primary },
        color: COLORS.text,
        fontSize: 12,
        breakLine: true,
        paraSpaceAfter: 8,
      },
    })),
    { x: 5.4, y: 1.9, w: 4, h: 2.5, valign: 'top' }
  );
  twoColSlide.addNotes('TWO_COLUMN: Use for comparisons. Replace column headers and bullet points.');

  // 5. Table Example
  const tableSlide = pptx.addSlide({ masterName: 'TABLE_LAYOUT' });
  addSectionBadge(tableSlide, '03', 'DATA');
  tableSlide.addText('Comparison Table', {
    x: LAYOUT.margin,
    y: 0.55,
    w: 9,
    h: 0.45,
    fontSize: 22,
    bold: true,
    color: COLORS.primary,
    fontFace: 'Arial',
  });
  const tableData: PptxGenJS.TableRow[] = [
    [
      { text: 'Feature', options: { fill: { color: COLORS.headerBg }, color: COLORS.primary, bold: true, fontSize: 11 } },
      { text: 'CSFLE', options: { fill: { color: COLORS.headerBg }, color: COLORS.primary, bold: true, fontSize: 11 } },
      { text: 'Queryable Encryption', options: { fill: { color: COLORS.headerBg }, color: COLORS.primary, bold: true, fontSize: 11 } },
    ],
    [
      { text: 'Query Type', options: { fill: { color: COLORS.cardBg }, color: COLORS.text, fontSize: 10 } },
      { text: 'Equality only', options: { fill: { color: COLORS.cardBg }, color: COLORS.text, fontSize: 10 } },
      { text: 'Equality + Range', options: { fill: { color: COLORS.cardBg }, color: COLORS.text, fontSize: 10 } },
    ],
    [
      { text: 'Performance', options: { fill: { color: COLORS.background }, color: COLORS.text, fontSize: 10 } },
      { text: 'Minimal overhead', options: { fill: { color: COLORS.background }, color: COLORS.text, fontSize: 10 } },
      { text: '2-3x storage', options: { fill: { color: COLORS.background }, color: COLORS.text, fontSize: 10 } },
    ],
  ];
  tableSlide.addTable(tableData, {
    x: LAYOUT.margin,
    y: 1.25,
    w: 9.2,
    colW: [3, 3.1, 3.1],
    rowH: 0.45,
    border: { type: 'solid', color: COLORS.cardBorder, pt: 0.5 },
    margin: [0.08, 0.15, 0.08, 0.15],
  });
  tableSlide.addNotes('TABLE_LAYOUT: Use for structured data comparisons. Modify table content.');

  // 6. Code/Diagram Example
  const codeSlide = pptx.addSlide({ masterName: 'CODE_DIAGRAM' });
  addSectionBadge(codeSlide, '04', 'IMPLEMENTATION');
  codeSlide.addText('Code Example', {
    x: LAYOUT.margin,
    y: 0.55,
    w: 9,
    h: 0.45,
    fontSize: 22,
    bold: true,
    color: COLORS.primary,
    fontFace: 'Arial',
  });
  codeSlide.addText(
    `// Example encryption configuration
const encryptedFieldsMap = {
  "medicalRecords.patients": {
    fields: [
      {
        path: "ssn",
        bsonType: "string",
        algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic"
      }
    ]
  }
};`,
    {
      x: LAYOUT.margin + 0.15,
      y: 1.65,
      w: 8.9,
      h: 3.2,
      fontSize: 11,
      fontFace: 'Consolas',
      color: COLORS.text,
      valign: 'top',
    }
  );
  codeSlide.addNotes('CODE_DIAGRAM: Use for code snippets or technical diagrams. Use monospace font.');

  // 7. Stats Example
  const statsSlide = pptx.addSlide({ masterName: 'STATS_LAYOUT' });
  addSectionBadge(statsSlide, '05', 'METRICS');
  statsSlide.addText('Key Statistics', {
    x: LAYOUT.margin,
    y: 0.55,
    w: 9,
    h: 0.45,
    fontSize: 22,
    bold: true,
    color: COLORS.primary,
    fontFace: 'Arial',
  });
  // Stat values
  const stats = [
    { value: '$4.88M', label: 'Avg breach cost', x: LAYOUT.margin + 0.2 },
    { value: '277', label: 'Days to identify', x: 3.75 },
    { value: '100%', label: 'Client-side encryption', x: 6.9 },
  ];
  stats.forEach((stat) => {
    statsSlide.addText(stat.value, {
      x: stat.x,
      y: 1.45,
      w: 2.5,
      h: 0.6,
      fontSize: 28,
      bold: true,
      color: COLORS.primary,
      fontFace: 'Arial',
      align: 'center',
    });
    statsSlide.addText(stat.label, {
      x: stat.x,
      y: 2.05,
      w: 2.5,
      h: 0.3,
      fontSize: 10,
      color: COLORS.textMuted,
      fontFace: 'Arial',
      align: 'center',
    });
  });
  statsSlide.addText(
    ['Statistic detail or explanation goes here', 'Additional context about these numbers', 'Call to action based on data'].map((t) => ({
      text: t,
      options: {
        bullet: { type: 'bullet' as const, code: '25CF', color: COLORS.primary },
        color: COLORS.text,
        fontSize: 12,
        breakLine: true,
        paraSpaceAfter: 10,
      },
    })),
    { x: LAYOUT.margin + 0.25, y: 2.9, w: 8.7, h: 2, valign: 'top' }
  );
  statsSlide.addNotes('STATS_LAYOUT: Use for data-driven slides. Update stat values and labels.');

  // Save the template
  await pptx.writeFile({ fileName: `${filename}.pptx` });
}

// Helper function to add section badge
function addSectionBadge(slide: PptxGenJS.Slide, number: string, title: string) {
  slide.addShape('roundRect', {
    x: LAYOUT.margin,
    y: 0.15,
    w: 2.4,
    h: 0.3,
    fill: { color: '1a3a2a' },
    line: { color: COLORS.primaryDark, pt: 1 },
    rectRadius: 0.05,
  });
  slide.addText(`${number}  ${title}`, {
    x: LAYOUT.margin + 0.12,
    y: 0.17,
    w: 2.2,
    h: 0.26,
    fontSize: 9,
    color: COLORS.primary,
    fontFace: 'Arial',
    bold: true,
  });
}
