const fs = require('fs');
const path = require('path');
const docx = require('docx');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  Header,
  Footer,
  PageNumber
} = docx;

const { FONT_FAMILY, COLOR_MUTED } = require('./report_helpers');
const { getCoverPage, getFrontMatter } = require('./report_cover_and_front');
const { getChapter1, getChapter2 } = require('./report_chapter1_2');
const { getChapter3 } = require('./report_chapter3');
const { getChapter4 } = require('./report_chapter4');
const { getChapter5, getChapter6, getChapter7, getChapter8 } = require('./report_chapter5_6_7_8');

console.log('Compiling all chapters into cohesive document...');

const coverPage = getCoverPage();
const frontMatter = getFrontMatter();
const ch1 = getChapter1();
const ch2 = getChapter2();
const ch3 = getChapter3();
const ch4 = getChapter4();
const ch5 = getChapter5();
const ch6 = getChapter6();
const ch7 = getChapter7();
const ch8 = getChapter8();

console.log(`Aggregating sections:
- Cover Page: ${coverPage.length} elements
- Front Matter: ${frontMatter.length} elements
- Chapter 1: ${ch1.length} elements
- Chapter 2: ${ch2.length} elements
- Chapter 3: ${ch3.length} elements
- Chapter 4: ${ch4.length} elements
- Chapter 5: ${ch5.length} elements
- Chapter 6: ${ch6.length} elements
- Chapter 7: ${ch7.length} elements
- Chapter 8: ${ch8.length} elements
`);

const allChildren = [
  ...coverPage,
  ...frontMatter,
  ...ch1,
  ...ch2,
  ...ch3,
  ...ch4,
  ...ch5,
  ...ch6,
  ...ch7,
  ...ch8
];

const doc = new Document({
  styles: {
    default: {
      document: {
        run: {
          font: FONT_FAMILY,
          size: 24, // 12pt = 24 half-points
          color: '2D3748'
        },
        paragraph: {
          spacing: { line: 360, before: 120, after: 120 },
          alignment: AlignmentType.JUSTIFIED
        }
      }
    }
  },
  sections: [
    {
      properties: {
        page: {
          margin: {
            top: 1440,    // 1 inch
            bottom: 1440, // 1 inch
            left: 1440,   // 1 inch
            right: 1440   // 1 inch
          }
        }
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              spacing: { after: 120 },
              children: [
                new TextRun({
                  text: "OneHUB: Academic & Smart Campus Governance System | RUET",
                  font: FONT_FAMILY,
                  size: 18, // 9pt
                  italics: true,
                  color: COLOR_MUTED
                })
              ]
            })
          ]
        })
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 120 },
              children: [
                new TextRun({
                  text: "Page ",
                  font: FONT_FAMILY,
                  size: 20
                }),
                new TextRun({
                  children: [PageNumber.CURRENT],
                  font: FONT_FAMILY,
                  size: 20
                })
              ]
            })
          ]
        })
      },
      children: allChildren
    }
  ]
});

const outputPath = path.resolve('OneHUB_SDP1_Project_Report_Complete.docx');
const fallbackPath1 = path.resolve('OneHUB_SDP1_Project_Report.docx');
const fallbackPath2 = path.resolve('OneHUB_SDP1_Project_Report_Final.docx');

console.log(`Writing DOCX buffer to ${outputPath}...`);

Packer.toBuffer(doc).then(buffer => {
  try {
    fs.writeFileSync(outputPath, buffer);
    const stats = fs.statSync(outputPath);
    console.log(`SUCCESS! OneHUB SDP-I Project Report Complete generated successfully!`);
    console.log(`File size: ${(stats.size / 1024).toFixed(2)} KB (${stats.size} bytes)`);
    console.log(`Location: ${outputPath}`);
  } catch (err) {
    console.error(`Error writing to ${outputPath}:`, err);
  }

  try {
    fs.writeFileSync(fallbackPath1, buffer);
    console.log(`Updated copy written to ${fallbackPath1}`);
  } catch (err) {
    console.warn(`Note: Could not overwrite ${fallbackPath1} (file is currently open in Word). Output available at ${outputPath}`);
  }

  try {
    fs.writeFileSync(fallbackPath2, buffer);
    console.log(`Updated copy written to ${fallbackPath2}`);
  } catch (err) {
    console.warn(`Note: Could not overwrite ${fallbackPath2} (file is currently open in Word). Output available at ${outputPath}`);
  }
}).catch(err => {
  console.error('ERROR during report generation:', err);
  process.exit(1);
});
