/**
 * File: generate_presentation.js
 * Description: Generates a professional, executive-grade PowerPoint (.pptx) deck
 * for the RUET OneHUB SDP-1 Final Project Presentation (5-Minute Strategy).
 * 
 * Design Standards:
 * - 16:9 Widescreen Layout (10.0" x 5.625")
 * - Pristine White Background (#FFFFFF) throughout
 * - Standard: Bold Main Bullet Point + 3-4 high-impact explanation lines
 * - High-contrast typography: Trebuchet MS (Titles), Segoe UI (Body), Consolas (Timers/Tech)
 * - Embedded diagrams: RUET Logo, Routine Workflow, OBE Pipeline, System Architecture
 */

const pptxgen = require('pptxgenjs');
const path = require('path');
const fs = require('fs');

async function buildPresentation() {
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_16x9';

  // Palette
  const C = {
    NAVY: '0F172A',         // Slate 900
    SLATE_DARK: '1E293B',   // Slate 800
    SLATE_MID: '475569',    // Slate 600
    SLATE_LIGHT: '64748B',  // Slate 500
    BORDER_LIGHT: 'E2E8F0', // Slate 200
    CARD_BG: 'F8FAFC',      // Slate 50
    CARD_BG_BLUE: 'F0F7FF', // Blue 50
    CARD_BG_GREEN: 'F0FDF4',// Emerald 50
    CARD_BG_AMBER: 'FFFBEB',// Amber 50
    PRIMARY_BLUE: '1D4ED8', // Blue 700
    ACCENT_SKY: '0284C7',   // Sky 600
    ACCENT_EMERALD: '059669',// Emerald 600
    ACCENT_AMBER: 'D97706',  // Amber 600
    WHITE: 'FFFFFF',
    TEXT_DARK: '0F172A',
    TEXT_MUTED: '475569'
  };

  const FONTS = {
    TITLE: 'Trebuchet MS',
    BODY: 'Segoe UI',
    MONO: 'Consolas'
  };

  const ruetLogo = path.resolve('docs/report_figures/ruet_logo.png');
  const figArch = path.resolve('docs/report_figures/fig_1_1_architecture.png');
  const figRoutine = path.resolve('docs/report_figures/fig_4_1_routine_workflow.png');
  const figObe = path.resolve('docs/report_figures/fig_4_2_obe_flow.png');

  // ==========================================
  // SLIDE 1: Title & Presentation Roadmap
  // ==========================================
  {
    const slide = pres.addSlide();
    slide.background = { color: C.WHITE };

    // Top Accent Band
    slide.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 10.0, h: 0.1, fill: { color: C.PRIMARY_BLUE }, line: { color: C.PRIMARY_BLUE } });

    // RUET Logo
    if (fs.existsSync(ruetLogo)) {
      slide.addImage({ path: ruetLogo, x: 0.7, y: 0.35, w: 0.75, h: 0.85 });
    }

    // University Header
    slide.addText('RAJSHAHI UNIVERSITY OF ENGINEERING & TECHNOLOGY', {
      x: 1.55, y: 0.38, w: 7.7, h: 0.28,
      fontFace: FONTS.TITLE, fontSize: 12, bold: true, color: C.PRIMARY_BLUE
    });
    slide.addText('Department of Electrical & Computer Engineering • Software Development Project - I (ECE 2100)', {
      x: 1.55, y: 0.64, w: 7.7, h: 0.22,
      fontFace: FONTS.BODY, fontSize: 9.5, color: C.SLATE_MID, bold: true
    });

    // Main Title Card
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.7, y: 1.3, w: 8.6, h: 1.45,
      fill: { color: C.CARD_BG_BLUE },
      line: { color: 'BAE6FD', width: 1.2 },
      rectRadius: 0.08
    });

    slide.addText('RUET OneHUB: Central Academic Automation & Outcome-Based Education (OBE) Portal', {
      x: 0.9, y: 1.42, w: 8.2, h: 0.65,
      fontFace: FONTS.TITLE, fontSize: 18.5, bold: true, color: C.NAVY
    });

    slide.addText('A Unified Enterprise Ecosystem Ending Paperwork, Automating Accreditation, & Modernizing Campus Life', {
      x: 0.9, y: 2.1, w: 8.2, h: 0.45,
      fontFace: FONTS.BODY, fontSize: 11, color: C.SLATE_MID
    });

    // 3 Speaker Pillars with Main Bullets + 3-4 lines
    const speakers = [
      {
        header: 'SPEAKER 1: CAMPUS REALITY & CORE ACADEMIC HUB',
        time: '[00:00 - 01:25] (85s) • Lead Speaker',
        speaker: 'Auyon Dip Sardar (Roll: 2410043)',
        color: C.PRIMARY_BLUE,
        bg: 'EFF6FF',
        points: [
          'Exposes manual registration queues and scattered social media notices.',
          'Demonstrates 1-click registration, credit validation, and 1-Page Legal Paper.',
          'Showcases "Next Class" live countdown widget and Google Calendar sync.',
          'Introduces Course Resource Vault, Lab tracker, and Digital Student ID.'
        ]
      },
      {
        header: 'SPEAKER 2: THE ACCREDITATION ENGINE (OBE)',
        time: '[01:25 - 03:10] (105s) • Teacher\'s Favorite',
        speaker: 'Teammate 2 (Roll: 24100XX)',
        color: C.ACCENT_EMERALD,
        bg: 'ECFDF5',
        points: [
          'Addresses Washington Accord and BAETE accreditation requirements.',
          'Presents interactive CO-PO mapping matrix across 12 Program Outcomes.',
          'Details Bloom\'s Taxonomy question engine (Cognitive levels C1 to C6).',
          'Demonstrates automated RUET LaTeX exam paper generator & Best 3 of 4 CTs.'
        ]
      },
      {
        header: 'SPEAKER 3: SMART CAMPUS & STUDENT WELFARE',
        time: '[03:10 - 04:40] (90s) • Campus Life Lead',
        speaker: 'Teammate 3 (Roll: 24100YY)',
        color: '7C3AED',
        bg: 'F5F3FF',
        points: [
          'Tackles hall maintenance grievance books and dining token lunch queues.',
          'Demonstrates photo-backed room ticketing and roommate contacts card.',
          'Showcases sub-second camera dining QR scanner and bus route tracker.',
          'Explains emergency blood request broadcast and concludes for live Q&A.'
        ]
      }
    ];

    speakers.forEach((sp, idx) => {
      const cardX = 0.7 + idx * 2.95;
      slide.addShape(pres.ShapeType.roundRect, {
        x: cardX, y: 2.9, w: 2.75, h: 2.35,
        fill: { color: sp.bg },
        line: { color: sp.color, width: 1.2 },
        rectRadius: 0.08
      });

      slide.addText(sp.time, {
        x: cardX + 0.12, y: 2.98, w: 2.5, h: 0.2,
        fontFace: FONTS.MONO, fontSize: 7.5, bold: true, color: sp.color
      });
      slide.addText(sp.header, {
        x: cardX + 0.12, y: 3.18, w: 2.5, h: 0.35,
        fontFace: FONTS.TITLE, fontSize: 9.5, bold: true, color: C.NAVY
      });
      slide.addText(sp.speaker, {
        x: cardX + 0.12, y: 3.52, w: 2.5, h: 0.2,
        fontFace: FONTS.BODY, fontSize: 8.5, bold: true, color: C.SLATE_MID
      });

      // 4 clean lines
      let bulletY = 3.75;
      sp.points.forEach(pt => {
        slide.addText(`• ${pt}`, {
          x: cardX + 0.12, y: bulletY, w: 2.5, h: 0.34,
          fontFace: FONTS.BODY, fontSize: 7.5, color: C.SLATE_DARK
        });
        bulletY += 0.35;
      });
    });

    slide.addText('Closing [04:40 - 05:00] (20s): All 3 members present Institutional Impact, Multi-Tier Architecture & Live Q&A', {
      x: 0.7, y: 5.32, w: 8.6, h: 0.2,
      fontFace: FONTS.BODY, fontSize: 8.5, italic: true, align: 'center', color: C.SLATE_LIGHT
    });
  }

  // ==========================================
  // SLIDE 2: Campus Reality & Why OneHUB (Speaker 1)
  // ==========================================
  {
    const slide = pres.addSlide();
    slide.background = { color: C.WHITE };

    slide.addText('[00:00 - 01:25] (85s) • SPEAKER 1: THE CAMPUS REALITY', {
      x: 0.7, y: 0.32, w: 8.6, h: 0.22,
      fontFace: FONTS.MONO, fontSize: 9, bold: true, color: C.PRIMARY_BLUE
    });
    slide.addText('The Campus Reality: Ending the Paper Chase at RUET', {
      x: 0.7, y: 0.54, w: 8.6, h: 0.4,
      fontFace: FONTS.TITLE, fontSize: 19, bold: true, color: C.NAVY
    });
    slide.addText('Why we built OneHUB — Addressing the painful, fragmented administrative bottlenecks students face every semester.', {
      x: 0.7, y: 0.95, w: 8.6, h: 0.28,
      fontFace: FONTS.BODY, fontSize: 10, color: C.SLATE_MID
    });

    // 3 Main Bullet Point Columns with 3-4 descriptive lines each
    const pillars = [
      {
        mainBullet: '• Manual Course Registration Bottleneck',
        color: C.PRIMARY_BLUE,
        bg: C.CARD_BG_BLUE,
        lines: [
          'Students wait in departmental queues with paper registration sheets every semester.',
          'Requires running between advisers and department heads for manual signatures.',
          'A lost slip or missing fee voucher forces students to restart the entire process.',
          'OneHUB enables 1-click submission, auto-credit checks, and digital approvals.'
        ]
      },
      {
        mainBullet: '• Information Fragmentation in Chat Groups',
        color: C.ACCENT_AMBER,
        bg: C.CARD_BG_AMBER,
        lines: [
          'Class notices, room shifts, and cancellations are scattered across 50+ Messenger chats.',
          'Lecture slides, reference PDFs, and Drive links get buried under daily chatter.',
          'Students experience chronic anxiety about class timings and routine updates.',
          'OneHUB provides a verified Central Notice Board and structured Course Vaults.'
        ]
      },
      {
        mainBullet: '• Residential Hall & Dining Chaos',
        color: C.ACCENT_EMERALD,
        bg: C.CARD_BG_GREEN,
        lines: [
          'Room maintenance issues rely on handwritten hall registers that are rarely tracked.',
          'Mess counters suffer long lunchtime queues handling physical plastic tokens.',
          'Urgent blood requests posted on social media often go unnoticed during emergencies.',
          'OneHUB deploys digital hall ticketing, sub-second QR scans, and instant donor alerts.'
        ]
      }
    ];

    pillars.forEach((p, idx) => {
      const cardX = 0.7 + idx * 2.95;
      slide.addShape(pres.ShapeType.roundRect, {
        x: cardX, y: 1.35, w: 2.75, h: 3.5,
        fill: { color: p.bg },
        line: { color: C.BORDER_LIGHT, width: 1.2 },
        rectRadius: 0.08
      });

      slide.addText(p.mainBullet, {
        x: cardX + 0.12, y: 1.48, w: 2.5, h: 0.45,
        fontFace: FONTS.TITLE, fontSize: 11, bold: true, color: p.color
      });

      slide.addShape(pres.ShapeType.line, {
        x: cardX + 0.12, y: 1.96, w: 2.5, h: 0,
        line: { color: p.color, width: 1 }
      });

      let lineY = 2.08;
      p.lines.forEach((ln, lIdx) => {
        slide.addText(`- ${ln}`, {
          x: cardX + 0.12, y: lineY, w: 2.5, h: 0.62,
          fontFace: FONTS.BODY, fontSize: 8.6, color: C.SLATE_DARK
        });
        lineY += 0.65;
      });
    });

    // Verbal handover note
    slide.addShape(pres.ShapeType.rect, {
      x: 0.7, y: 4.95, w: 8.6, h: 0.48,
      fill: { color: C.CARD_BG },
      line: { color: C.BORDER_LIGHT, width: 1 }
    });
    slide.addText('SPEAKER 1 TRANSITION (At 01:25): "Administrative automation is only half the battle. To meet international engineering standards, universities must implement Outcome-Based Education. My teammate will now show how OneHUB powers RUET\'s OBE."', {
      x: 0.8, y: 5.0, w: 8.4, h: 0.38,
      fontFace: FONTS.BODY, fontSize: 8.2, italic: true, color: C.SLATE_MID
    });
  }

  // ==========================================
  // SLIDE 3: Core Academic Hub & Scheduling (Speaker 1)
  // ==========================================
  {
    const slide = pres.addSlide();
    slide.background = { color: C.WHITE };

    slide.addText('[00:00 - 01:25] (85s) • SPEAKER 1: CORE ACADEMIC HUB', {
      x: 0.7, y: 0.32, w: 8.6, h: 0.22,
      fontFace: FONTS.MONO, fontSize: 9, bold: true, color: C.PRIMARY_BLUE
    });
    slide.addText('Academic Automation: Frictionless Daily Campus Workflow', {
      x: 0.7, y: 0.54, w: 8.6, h: 0.4,
      fontFace: FONTS.TITLE, fontSize: 19, bold: true, color: C.NAVY
    });
    slide.addText('Replacing chaotic Messenger groups and manual spreadsheets with structured digital course management.', {
      x: 0.7, y: 0.95, w: 8.6, h: 0.28,
      fontFace: FONTS.BODY, fontSize: 10, color: C.SLATE_MID
    });

    // Left Column: 3 Main Bullet Points with 3-4 lines each
    const academicPoints = [
      {
        title: '• Automated Registration & 1-Page Legal Paper',
        lines: [
          'Pre-populates approved curriculum with exact credit boundaries (e.g. 20.25 Cr for 2-2).',
          'Enables instant digital approval by academic advisers and automatic fee calculation.',
          'Exports verified 1-Page Legal Paper with Adviser and Controller signatures & seals.',
          'Provides 300 DPI Legal-sized PNG download for physical archival and print.'
        ]
      },
      {
        title: '• "Next Class" Countdown & Google Calendar Export',
        lines: [
          'Live countdown card on dashboard: "Next: ECE 2213 in Room 302 (Starts in 25 mins)".',
          'Eliminates confusion over room changes, schedule shifts, and overlapping periods.',
          '1-Click Google Calendar export syncs full weekly routine to students\' phone calendars.',
          'Triggers automatic background notifications before each lecture starts.'
        ]
      },
      {
        title: '• Course Resource Vault, Lab Tracker & Digital ID',
        lines: [
          'Central course repository for lecture slides, past question papers, and reference books.',
          'Interactive Lab Experiment Tracker (Exp 1 to 10) with lab sheets and submission dates.',
          'Digital Student ID Card modal featuring official RUET hologram styling and QR code.',
          'Quick student identity verification for campus gates, buses, and central library entry.'
        ]
      }
    ];

    let startY = 1.35;
    academicPoints.forEach(p => {
      slide.addShape(pres.ShapeType.roundRect, {
        x: 0.7, y: startY, w: 4.8, h: 1.15,
        fill: { color: C.CARD_BG },
        line: { color: C.BORDER_LIGHT, width: 1 },
        rectRadius: 0.05
      });
      slide.addText(p.title, {
        x: 0.82, y: startY + 0.06, w: 4.55, h: 0.25,
        fontFace: FONTS.TITLE, fontSize: 10.5, bold: true, color: C.PRIMARY_BLUE
      });
      let lineY = startY + 0.32;
      p.lines.forEach(ln => {
        slide.addText(`- ${ln}`, {
          x: 0.82, y: lineY, w: 4.55, h: 0.18,
          fontFace: FONTS.BODY, fontSize: 7.8, color: C.SLATE_DARK
        });
        lineY += 0.19;
      });
      startY += 1.22;
    });

    // Right Column: Workflow Diagram
    slide.addShape(pres.ShapeType.roundRect, {
      x: 5.7, y: 1.35, w: 3.6, h: 3.75,
      fill: { color: C.CARD_BG_BLUE },
      line: { color: 'BAE6FD', width: 1.2 },
      rectRadius: 0.08
    });

    slide.addText('ACADEMIC WORKFLOW AUTOMATION', {
      x: 5.85, y: 1.48, w: 3.3, h: 0.24,
      fontFace: FONTS.TITLE, fontSize: 10, bold: true, color: C.PRIMARY_BLUE, align: 'center'
    });

    if (fs.existsSync(figRoutine)) {
      slide.addImage({
        path: figRoutine,
        x: 5.85, y: 1.78, w: 3.3, h: 2.3
      });
    }

    slide.addText('Outcome: Zero missed lectures, zero lost lecture slides, and 100% paperless course registration.', {
      x: 5.85, y: 4.25, w: 3.3, h: 0.7,
      fontFace: FONTS.BODY, fontSize: 8.5, color: C.SLATE_DARK, align: 'center'
    });

    slide.addText('Handover at 01:25 to Speaker 2 for the OBE Accreditation Engine', {
      x: 0.7, y: 5.3, w: 8.6, h: 0.2,
      fontFace: FONTS.MONO, fontSize: 8, color: C.SLATE_LIGHT, align: 'right'
    });
  }

  // ==========================================
  // SLIDE 4: The Accreditation Engine — OBE (Speaker 2)
  // ==========================================
  {
    const slide = pres.addSlide();
    slide.background = { color: C.WHITE };

    slide.addText('[01:25 - 03:10] (105s) • SPEAKER 2: THE ACCREDITATION ENGINE (TEACHER\'S FAVORITE)', {
      x: 0.7, y: 0.32, w: 8.6, h: 0.22,
      fontFace: FONTS.MONO, fontSize: 9, bold: true, color: C.ACCENT_EMERALD
    });
    slide.addText('Outcome-Based Education (OBE) & Automated LaTeX Engine', {
      x: 0.7, y: 0.54, w: 8.6, h: 0.4,
      fontFace: FONTS.TITLE, fontSize: 19, bold: true, color: C.NAVY
    });
    slide.addText('Meeting Washington Accord (BAETE) standards through automated CO-PO mapping and native LaTeX generation.', {
      x: 0.7, y: 0.95, w: 8.6, h: 0.28,
      fontFace: FONTS.BODY, fontSize: 10, color: C.SLATE_MID
    });

    // Left Column: 3 Main Bullet Points with 3-4 lines each
    const obePoints = [
      {
        title: '• Interactive CO-PO Mapping Matrix (12 Program Outcomes)',
        lines: [
          'Faculty define Course Outcomes (CO1-CO5) aligned with educational goals.',
          'Maps directly against RUET\'s 12 Program Outcomes (PO1 Knowledge to PO12 Ethics).',
          'Computes automated weighted attainment thresholds (High = 3, Medium = 2, Low = 1).',
          'Replaces weeks of manual spreadsheet calculations with real-time BAETE audits.'
        ]
      },
      {
        title: '• Bloom\'s Taxonomy Cognitive Engine & Question Tagging',
        lines: [
          'Questions are tagged across Cognitive Domains (C1 Remember to C6 Create).',
          'Ensures balanced cognitive assessments rather than rote memory examination.',
          'Visualizes cognitive domain distributions for every Class Test and Final exam.',
          'Directly links exam question marks to Course Outcome attainment metrics.'
        ]
      },
      {
        title: '• Native RUET LaTeX Question Paper Generator & Ordinance',
        lines: [
          'Faculty enter question stems in web UI; OneHUB compiles authentic RUET LaTeX papers.',
          'Produces publication-grade PDFs with proper marks tables, divisions, and CO tags.',
          'Automates RUET Ordinance: strictly calculates Best 3 out of 4 Class Tests.',
          'Tracks real-time attendance: Collegiate (≥75%), Non-collegiate (60-74%), Discollegiate (<60%).'
        ]
      }
    ];

    let startY = 1.35;
    obePoints.forEach(p => {
      slide.addShape(pres.ShapeType.roundRect, {
        x: 0.7, y: startY, w: 5.1, h: 1.15,
        fill: { color: C.CARD_BG_GREEN },
        line: { color: 'A7F3D0', width: 1 },
        rectRadius: 0.05
      });
      slide.addText(p.title, {
        x: 0.82, y: startY + 0.06, w: 4.85, h: 0.25,
        fontFace: FONTS.TITLE, fontSize: 10, bold: true, color: C.NAVY
      });
      let lineY = startY + 0.32;
      p.lines.forEach(ln => {
        slide.addText(`- ${ln}`, {
          x: 0.82, y: lineY, w: 4.85, h: 0.18,
          fontFace: FONTS.BODY, fontSize: 7.8, color: C.SLATE_DARK
        });
        lineY += 0.19;
      });
      startY += 1.22;
    });

    // Right Column: OBE Diagram + Buzzwords Box
    slide.addShape(pres.ShapeType.roundRect, {
      x: 6.0, y: 1.35, w: 3.3, h: 3.75,
      fill: { color: C.CARD_BG },
      line: { color: C.BORDER_LIGHT, width: 1.2 },
      rectRadius: 0.08
    });

    slide.addText('OBE ATTAINMENT PIPELINE', {
      x: 6.1, y: 1.48, w: 3.1, h: 0.24,
      fontFace: FONTS.TITLE, fontSize: 10, bold: true, color: C.ACCENT_EMERALD, align: 'center'
    });

    if (fs.existsSync(figObe)) {
      slide.addImage({
        path: figObe,
        x: 6.1, y: 1.76, w: 3.1, h: 1.85
      });
    }

    slide.addShape(pres.ShapeType.roundRect, {
      x: 6.1, y: 3.75, w: 3.1, h: 1.2,
      fill: { color: C.WHITE },
      line: { color: C.ACCENT_EMERALD, width: 1.2 },
      rectRadius: 0.05
    });

    slide.addText('CRITICAL OBE BUZZWORDS FOR PANEL:', {
      x: 6.15, y: 3.82, w: 3.0, h: 0.18,
      fontFace: FONTS.MONO, fontSize: 7.2, bold: true, color: C.ACCENT_EMERALD
    });
    slide.addText('• Washington Accord (BAETE Accreditation)\n• 12 Program Outcomes (PO1 - PO12)\n• Bloom\'s Taxonomy Levels (C1 - C6)\n• Best 3 of 4 CTs & Collegiate Matrix', {
      x: 6.15, y: 4.02, w: 3.0, h: 0.85,
      fontFace: FONTS.BODY, fontSize: 7.8, color: C.NAVY
    });

    slide.addText('Handover at 03:10 to Speaker 3 for Smart Campus & Student Welfare', {
      x: 0.7, y: 5.3, w: 8.6, h: 0.2,
      fontFace: FONTS.MONO, fontSize: 8, color: C.SLATE_LIGHT, align: 'right'
    });
  }

  // ==========================================
  // SLIDE 5: Smart Campus & Student Welfare (Speaker 3)
  // ==========================================
  {
    const slide = pres.addSlide();
    slide.background = { color: C.WHITE };

    slide.addText('[03:10 - 04:40] (90s) • SPEAKER 3: SMART CAMPUS & STUDENT WELFARE', {
      x: 0.7, y: 0.32, w: 8.6, h: 0.22,
      fontFace: FONTS.MONO, fontSize: 9, bold: true, color: '7C3AED'
    });
    slide.addText('Smart Campus: Connecting Student Life Beyond Classrooms', {
      x: 0.7, y: 0.54, w: 8.6, h: 0.4,
      fontFace: FONTS.TITLE, fontSize: 19, bold: true, color: C.NAVY
    });
    slide.addText('Streamlining residential halls, dining mess queues, transport routes, and medical emergencies.', {
      x: 0.7, y: 0.95, w: 8.6, h: 0.28,
      fontFace: FONTS.BODY, fontSize: 10, color: C.SLATE_MID
    });

    // 4 Welfare Pillars (2x2 Grid) with Main Bullet Points and 3-4 lines each
    const welfarePillars = [
      {
        title: '• Hall Maintenance & Room Grievance Ticketing',
        color: C.PRIMARY_BLUE,
        bg: C.CARD_BG_BLUE,
        lines: [
          'Students submit photo-backed tickets for Electricity, Plumbing, Wi-Fi, or Furniture.',
          'Hall Provosts and staff track issues: Pending → In Progress → Resolved.',
          'Displays student\'s allocated Hall, Room number, Bed number, and roommate contacts.',
          'Replaces overlooked paper registers with transparent digital accountability.'
        ]
      },
      {
        title: '• Camera-Based Dining QR Scanner (< 1 Second)',
        color: C.ACCENT_EMERALD,
        bg: C.CARD_BG_GREEN,
        lines: [
          'Mess managers open scanner on any phone/tablet camera at food counters.',
          'Scans and redeems digital meal tokens in under 1 second without plastic tokens.',
          'Dedicated booking toggle for Grand Feast / Special Dinner with guest tokens.',
          'Generates daily meal consumption statistics and prevents token duplication.'
        ]
      },
      {
        title: '• RUET Campus Bus Schedule & Stoppage Finder',
        color: C.ACCENT_AMBER,
        bg: C.CARD_BG_AMBER,
        lines: [
          'Daily departure schedules and stoppage timings for Vodra, Station, Talaimari, Court.',
          'Provides verified pickup points, return trip timetables, and driver hotlines.',
          'Eliminates missed commutes and long roadside waiting times for day-scholars.',
          'Synchronized with exam shifts and holiday schedules automatically.'
        ]
      },
      {
        title: '• Urgent Emergency Blood Request Broadcast Alert',
        color: 'DC2626',
        bg: 'FEF2F2',
        lines: [
          'Instant 1-click broadcast for patients at RUET Health Complex or RMCH.',
          'Pushes high-priority notification bell alerts to all registered matching donors.',
          'Displays patient blood group, hospital bed details, and emergency contact numbers.',
          'Turns hours of panicked social media searching into immediate life-saving response.'
        ]
      }
    ];

    welfarePillars.forEach((p, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const cardX = 0.7 + col * 4.4;
      const cardY = 1.35 + row * 1.7;

      slide.addShape(pres.ShapeType.roundRect, {
        x: cardX, y: cardY, w: 4.2, h: 1.58,
        fill: { color: p.bg },
        line: { color: C.BORDER_LIGHT, width: 1.2 },
        rectRadius: 0.08
      });

      slide.addText(p.title, {
        x: cardX + 0.12, y: cardY + 0.08, w: 3.95, h: 0.28,
        fontFace: FONTS.TITLE, fontSize: 10.5, bold: true, color: p.color
      });

      let lineY = cardY + 0.38;
      p.lines.forEach(ln => {
        slide.addText(`- ${ln}`, {
          x: cardX + 0.12, y: lineY, w: 3.95, h: 0.26,
          fontFace: FONTS.BODY, fontSize: 8, color: C.SLATE_DARK
        });
        lineY += 0.28;
      });
    });

    // Bottom Navigation Bar
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.7, y: 4.95, w: 8.6, h: 0.45,
      fill: { color: C.CARD_BG },
      line: { color: 'E2E8F0', width: 1 },
      rectRadius: 0.05
    });
    slide.addText('⚡ PRODUCTIVITY ENHANCER: Global Command Palette (Ctrl + K) & StudyBuddy AI allow students to jump to any feature, notice, or course in 1 keystroke.', {
      x: 0.85, y: 5.0, w: 8.3, h: 0.35,
      fontFace: FONTS.BODY, fontSize: 8.5, bold: true, color: C.NAVY
    });
  }

  // ==========================================
  // SLIDE 6: Architecture, Impact & Conclusion (All Members)
  // ==========================================
  {
    const slide = pres.addSlide();
    slide.background = { color: C.WHITE };

    slide.addText('[04:40 - 05:00] (20s) • ALL MEMBERS: SYSTEM ARCHITECTURE & CONCLUSION', {
      x: 0.7, y: 0.32, w: 8.6, h: 0.22,
      fontFace: FONTS.MONO, fontSize: 9, bold: true, color: C.PRIMARY_BLUE
    });
    slide.addText('Enterprise Architecture, Institutional Impact & Conclusion', {
      x: 0.7, y: 0.54, w: 8.6, h: 0.4,
      fontFace: FONTS.TITLE, fontSize: 19, bold: true, color: C.NAVY
    });
    slide.addText('Modern engineering stack built for scale, resilience, and university-wide adoption.', {
      x: 0.7, y: 0.95, w: 8.6, h: 0.28,
      fontFace: FONTS.BODY, fontSize: 10, color: C.SLATE_MID
    });

    // Left Column: Architecture Diagram + 4 Tech Stack Lines
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.7, y: 1.35, w: 4.6, h: 3.8,
      fill: { color: C.CARD_BG_BLUE },
      line: { color: 'BAE6FD', width: 1.2 },
      rectRadius: 0.08
    });

    slide.addText('• Multi-Tier Enterprise Architecture', {
      x: 0.85, y: 1.45, w: 4.3, h: 0.25,
      fontFace: FONTS.TITLE, fontSize: 10.5, bold: true, color: C.PRIMARY_BLUE
    });

    if (fs.existsSync(figArch)) {
      slide.addImage({
        path: figArch,
        x: 0.85, y: 1.75, w: 4.3, h: 2.15
      });
    }

    const techLines = [
      'Frontend: React 18, Vite, Tailwind CSS, Lucide Icons, and html2canvas-pro.',
      'Backend: Node.js, Express REST API, JWT authentication & Role-Based Access Control.',
      'Database: MongoDB Atlas with indexed schemas and atomic transaction safeguards.',
      'Engines: Native LaTeX question compiler, cron routine scheduler, and push alerts.'
    ];

    let techY = 4.0;
    techLines.forEach(ln => {
      slide.addText(`- ${ln}`, {
        x: 0.85, y: techY, w: 4.3, h: 0.22,
        fontFace: FONTS.BODY, fontSize: 7.6, color: C.SLATE_DARK
      });
      techY += 0.23;
    });

    // Right Column: Institutional Impact + Live Demo Handover
    slide.addShape(pres.ShapeType.roundRect, {
      x: 5.5, y: 1.35, w: 3.8, h: 3.8,
      fill: { color: C.CARD_BG },
      line: { color: C.BORDER_LIGHT, width: 1.2 },
      rectRadius: 0.08
    });

    slide.addText('• Measurable Institutional Impact', {
      x: 5.65, y: 1.45, w: 3.5, h: 0.25,
      fontFace: FONTS.TITLE, fontSize: 10.5, bold: true, color: C.NAVY
    });

    const impactLines = [
      '18 Departments Connected: Standardizes academic governance across RUET.',
      '95% Faster Approvals: Course registration cut from 3 days to under 30 seconds.',
      '100% BAETE Compliance: Automates CO-PO mapping, Best 3 of 4 CTs, and attendance.',
      'Zero Paperwork & Plastic Tokens: Digital 1-Page Legal sheets and sub-second QR meals.'
    ];

    let impY = 1.75;
    impactLines.forEach(ln => {
      slide.addText(`- ${ln}`, {
        x: 5.65, y: impY, w: 3.5, h: 0.35,
        fontFace: FONTS.BODY, fontSize: 8.2, color: C.SLATE_DARK
      });
      impY += 0.38;
    });

    // Live Demo Callout Card
    slide.addShape(pres.ShapeType.roundRect, {
      x: 5.65, y: 3.45, w: 3.5, h: 1.55,
      fill: { color: 'F0FDF4' },
      line: { color: '86EFAC', width: 1.2 },
      rectRadius: 0.06
    });

    slide.addText('• Ready for Live Demonstration & Q&A', {
      x: 5.75, y: 3.55, w: 3.3, h: 0.25,
      fontFace: FONTS.TITLE, fontSize: 10, bold: true, color: C.ACCENT_EMERALD
    });

    const demoLines = [
      'Turns hours of administrative chaos into single-second clicks.',
      'Modules live on screen: Registration, LaTeX Generator, Dining QR Scanner.',
      'We thank our honorable course teachers for their continuous guidance.',
      'We welcome your questions and are ready for the live demonstration!'
    ];

    let demoY = 3.85;
    demoLines.forEach(ln => {
      slide.addText(`- ${ln}`, {
        x: 5.75, y: demoY, w: 3.3, h: 0.24,
        fontFace: FONTS.BODY, fontSize: 7.8, italic: true, color: C.NAVY
      });
      demoY += 0.26;
    });
  }

  // Write file
  const fileName = 'OneHUB_Professional_Presentation_5Min.pptx';
  await pres.writeFile({ fileName });
  console.log(`Presentation successfully created: ${fileName}`);
}

buildPresentation().catch(err => {
  console.error('Error generating presentation:', err);
  process.exit(1);
});
