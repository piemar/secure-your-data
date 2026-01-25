import PptxGenJS from 'pptxgenjs';
import { SlideData } from '@/components/presentation/slidesPPTXData';

// MongoDB brand colors
const COLORS = {
  background: '0d1117',
  cardBg: '161b22',
  primary: '00ED64',
  text: 'c9d1d9',
  textMuted: '8b949e',
  white: 'ffffff',
  warning: 'f0ad4e',
};

export async function exportToPPTX(slides: SlideData[], filename: string = 'MongoDB-CSFLE-QE-Presentation') {
  const pptx = new PptxGenJS();

  // Set presentation properties
  pptx.author = 'MongoDB Solutions Architecture';
  pptx.title = 'Client-Side Field Level Encryption & Queryable Encryption';
  pptx.subject = 'SA Enablement Session';
  pptx.company = 'MongoDB';

  // Define master slide layout
  pptx.defineSlideMaster({
    title: 'MONGODB_MASTER',
    background: { color: COLORS.background },
    objects: [
      // Footer line
      {
        rect: {
          x: 0,
          y: 6.8,
          w: '100%',
          h: 0.02,
          fill: { color: COLORS.primary },
        },
      },
      // MongoDB logo placeholder (text)
      {
        text: {
          text: 'MongoDB',
          options: {
            x: 0.3,
            y: 6.85,
            w: 1.5,
            h: 0.25,
            fontSize: 10,
            color: COLORS.primary,
            fontFace: 'Arial',
            bold: true,
          },
        },
      },
    ],
    slideNumber: {
      x: 9.2,
      y: 6.85,
      color: COLORS.textMuted,
      fontSize: 10,
    },
  });

  // Generate slides
  slides.forEach((slideData, index) => {
    const slide = pptx.addSlide({ masterName: 'MONGODB_MASTER' });
    const { exportContent } = slideData;

    if (index === 0) {
      // Title slide - special layout
      slide.addText(exportContent.title, {
        x: 0.5,
        y: 2.0,
        w: 9,
        h: 1.2,
        fontSize: 36,
        bold: true,
        color: COLORS.primary,
        fontFace: 'Arial',
        align: 'center',
      });

      if (exportContent.subtitle) {
        slide.addText(exportContent.subtitle, {
          x: 0.5,
          y: 3.5,
          w: 9,
          h: 1,
          fontSize: 18,
          color: COLORS.text,
          fontFace: 'Arial',
          align: 'center',
        });
      }
    } else {
      // Regular slide - title at top
      slide.addText(exportContent.title, {
        x: 0.5,
        y: 0.3,
        w: 9,
        h: 0.6,
        fontSize: 28,
        bold: true,
        color: COLORS.primary,
        fontFace: 'Arial',
      });

      // Section indicator if available
      if (slideData.sectionNumber > 0) {
        slide.addText(`0${slideData.sectionNumber}  ${slideData.section.toUpperCase()}`, {
          x: 0.5,
          y: 0.95,
          w: 9,
          h: 0.3,
          fontSize: 10,
          color: COLORS.primary,
          fontFace: 'Arial',
        });
      }

      let contentY = slideData.sectionNumber > 0 ? 1.4 : 1.1;

      // Add table if present
      if (exportContent.table) {
        const tableData: PptxGenJS.TableRow[] = [
          exportContent.table.headers.map((h) => ({
            text: h,
            options: {
              fill: { color: '21262d' },
              color: COLORS.primary,
              bold: true,
              fontSize: 11,
              fontFace: 'Arial',
            },
          })),
          ...exportContent.table.rows.map((row) =>
            row.map((cell) => ({
              text: cell,
              options: {
                fill: { color: COLORS.cardBg },
                color: COLORS.text,
                fontSize: 10,
                fontFace: 'Arial',
              },
            }))
          ),
        ];

        slide.addTable(tableData, {
          x: 0.5,
          y: contentY,
          w: 9,
          colW: 9 / exportContent.table.headers.length,
          border: { type: 'solid', color: '30363d', pt: 0.5 },
          margin: 0.1,
        });

        contentY += 0.5 + exportContent.table.rows.length * 0.5;
      }

      // Add bullets if present
      if (exportContent.bullets && exportContent.bullets.length > 0) {
        const bulletText = exportContent.bullets.map((bullet) => ({
          text: bullet,
          options: {
            bullet: { type: 'bullet' as const, color: COLORS.primary },
            color: COLORS.text,
            fontSize: 14,
            fontFace: 'Arial',
            breakLine: true,
          },
        }));

        slide.addText(bulletText, {
          x: 0.5,
          y: contentY,
          w: 9,
          h: 5 - contentY,
          valign: 'top',
          lineSpacingMultiple: 1.5,
        });
      }
    }

    // Add speaker notes
    if (exportContent.notes) {
      slide.addNotes(exportContent.notes);
    }
  });

  // Save the file
  await pptx.writeFile({ fileName: `${filename}.pptx` });
}
