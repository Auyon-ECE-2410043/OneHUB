const fs = require('fs');
const path = require('path');
const docx = require('docx');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  Header,
  Footer,
  PageNumber,
  NumberFormat,
  ImageRun,
  UnderlineType,
  ShadingType
} = docx;

console.log('Starting full compilation of OneHUB SDP-I Project Report DOCX...');

// Constants & Formatting Specifications
const FONT_FAMILY = 'Times New Roman';
const COLOR_PRIMARY = '1A365D';   // Navy Blue for Main Headings
const COLOR_SECONDARY = '2B6CB0'; // Slate Blue for Subheadings
const COLOR_TEXT = '2D3748';      // Professional Charcoal for Body
const COLOR_MUTED = '4A5568';     // Muted Slate for captions
const COLOR_BG_HEADER = 'EDF2F7'; // Table header background
const COLOR_BORDER = 'CBD5E0';    // Subtle border color

const thinBorder = {
  style: BorderStyle.SINGLE,
  size: 1,
  color: COLOR_BORDER
};

const cellBorders = {
  top: thinBorder,
  bottom: thinBorder,
  left: thinBorder,
  right: thinBorder
};

// Helper: Paragraph Creator
function p(text, options = {}) {
  const runs = Array.isArray(text) ? text : [
    new TextRun({
      text: text,
      font: FONT_FAMILY,
      size: options.size || 24, // 12pt = 24 half-points
      bold: options.bold || false,
      italics: options.italics || false,
      color: options.color || COLOR_TEXT
    })
  ];

  return new Paragraph({
    alignment: options.alignment || AlignmentType.JUSTIFIED,
    spacing: {
      before: options.before !== undefined ? options.before : 120, // 6pt
      after: options.after !== undefined ? options.after : 120,    // 6pt
      line: options.line !== undefined ? options.line : 360        // 1.5 line spacing (360 twips)
    },
    bullet: options.bullet || undefined,
    children: runs
  });
}

function boldRun(text, options = {}) {
  return new TextRun({
    text: text,
    font: FONT_FAMILY,
    size: options.size || 24,
    bold: true,
    color: options.color || COLOR_TEXT
  });
}

function normalRun(text, options = {}) {
  return new TextRun({
    text: text,
    font: FONT_FAMILY,
    size: options.size || 24,
    bold: false,
    italics: options.italics || false,
    color: options.color || COLOR_TEXT
  });
}

function codeRun(text) {
  return new TextRun({
    text: text,
    font: 'Consolas',
    size: 20, // 10pt
    color: '805AD5' // Purple
  });
}

// Helper: Headings
function h1(text, pageBreak = true) {
  return new Paragraph({
    text: text,
    heading: HeadingLevel.HEADING_1,
    pageBreakBefore: pageBreak,
    spacing: { before: 360, after: 180, line: 360 },
    run: {
      font: FONT_FAMILY,
      size: 32, // 16pt
      bold: true,
      color: COLOR_PRIMARY
    }
  });
}

function h2(text) {
  return new Paragraph({
    text: text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 140, line: 360 },
    run: {
      font: FONT_FAMILY,
      size: 28, // 14pt
      bold: true,
      color: COLOR_SECONDARY
    }
  });
}

function h3(text) {
  return new Paragraph({
    text: text,
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 100, line: 360 },
    run: {
      font: FONT_FAMILY,
      size: 26, // 13pt
      bold: true,
      color: COLOR_TEXT
    }
  });
}

function h4(text) {
  return new Paragraph({
    text: text,
    heading: HeadingLevel.HEADING_4,
    spacing: { before: 160, after: 80, line: 360 },
    run: {
      font: FONT_FAMILY,
      size: 24, // 12pt
      bold: true,
      color: COLOR_TEXT
    }
  });
}

// Helper: Figure embedding
function figure(imagePath, captionText, width = 520, height = 300) {
  const fullPath = path.resolve(imagePath);
  if (!fs.existsSync(fullPath)) {
    console.warn(`Warning: Image not found at ${fullPath}`);
    return p(`[Figure: ${captionText}]`, { alignment: AlignmentType.CENTER, italics: true });
  }

  const imgData = fs.readFileSync(fullPath);
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 100 },
      children: [
        new ImageRun({
          data: imgData,
          transformation: { width: width, height: height }
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 80, after: 200, line: 300 },
      children: [
        new TextRun({
          text: captionText,
          font: FONT_FAMILY,
          size: 22, // 11pt
          bold: true,
          italics: true,
          color: COLOR_MUTED
        })
      ]
    })
  ];
}

// Helper: Tables
function createCell(text, options = {}) {
  const isHeader = options.isHeader || false;
  return new TableCell({
    width: options.width ? { size: options.width, type: WidthType.DXA } : undefined,
    shading: isHeader ? { fill: COLOR_BG_HEADER, type: ShadingType.CLEAR } : (options.shading ? { fill: options.shading, type: ShadingType.CLEAR } : undefined),
    margins: { top: 120, bottom: 120, left: 160, right: 160 },
    borders: cellBorders,
    children: [
      new Paragraph({
        alignment: options.alignment || AlignmentType.LEFT,
        spacing: { before: 40, after: 40, line: 260 },
        children: [
          new TextRun({
            text: text,
            font: FONT_FAMILY,
            size: isHeader ? 22 : (options.size || 20), // 11pt header, 10pt content
            bold: isHeader || options.bold || false,
            color: isHeader ? COLOR_PRIMARY : (options.color || COLOR_TEXT)
          })
        ]
      })
    ]
  });
}

function createTable(headers, rowsData, colWidths = []) {
  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map((h, i) => createCell(h, { isHeader: true, width: colWidths[i] }))
  });

  const bodyRows = rowsData.map(row => {
    return new TableRow({
      children: row.map((cellText, i) => createCell(cellText, { width: colWidths[i] }))
    });
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...bodyRows],
    spacing: { before: 180, after: 180 }
  });
}

function createCodeBlock(lines) {
  return lines.map(line => new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { before: 20, after: 20, line: 240 },
    children: [
      new TextRun({
        text: line,
        font: 'Consolas',
        size: 19, // 9.5pt
        color: '1A202C'
      })
    ]
  }));
}

console.log('Helpers initialized successfully.');
module.exports = {
  AlignmentType,
  FONT_FAMILY,
  COLOR_PRIMARY,
  COLOR_SECONDARY,
  COLOR_TEXT,
  COLOR_MUTED,
  p,
  boldRun,
  normalRun,
  codeRun,
  h1,
  h2,
  h3,
  h4,
  figure,
  createCell,
  createTable,
  createCodeBlock
};
