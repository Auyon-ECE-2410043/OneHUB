Add-Type -AssemblyName System.Drawing

$outputDir = "docs/report_figures"
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}

function Create-RoundedRectangleGraphicsPath {
    param(
        [System.Drawing.Rectangle]$rect,
        [int]$radius
    )
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $diameter = $radius * 2
    $arc = New-Object System.Drawing.Rectangle $rect.X, $rect.Y, $diameter, $diameter

    # top left
    $path.AddArc($arc, 180, 90)
    # top right
    $arc.X = $rect.Right - $diameter
    $path.AddArc($arc, 270, 90)
    # bottom right
    $arc.Y = $rect.Bottom - $diameter
    $path.AddArc($arc, 0, 90)
    # bottom left
    $arc.X = $rect.Left
    $path.AddArc($arc, 90, 90)
    $path.CloseFigure()
    return $path
}

# ==========================================
# 1. Figure 1.1: System Architecture Diagram
# ==========================================
Write-Host "Rendering Figure 1.1: System Architecture Diagram..."
$w = 1200; $h = 750
$bmp = New-Object System.Drawing.Bitmap $w, $h
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias
$g.Clear([System.Drawing.Color]::White)

$fontTitle = New-Object System.Drawing.Font('Times New Roman', 18, [System.Drawing.FontStyle]::Bold)
$fontSection = New-Object System.Drawing.Font('Times New Roman', 14, [System.Drawing.FontStyle]::Bold)
$fontBoxTitle = New-Object System.Drawing.Font('Times New Roman', 11, [System.Drawing.FontStyle]::Bold)
$fontBoxBody = New-Object System.Drawing.Font('Times New Roman', 9, [System.Drawing.FontStyle]::Regular)

$penBorder = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(43, 108, 176), 2)
$penArrow = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(113, 128, 150), 2)
$penArrow.CustomEndCap = New-Object System.Drawing.Drawing2D.AdjustableArrowCap(5, 5)

$brushNavy = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(26, 54, 93))
$brushWhite = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$brushDark = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(45, 55, 72))

# Header Title
$g.DrawString("Figure 1.1: High-Level Distributed Architecture of OneHUB", $fontTitle, $brushNavy, 240, 25)

# Tier 1: Client Layer
$tier1Rect = New-Object System.Drawing.Rectangle 50, 70, 1100, 160
$tier1Path = Create-RoundedRectangleGraphicsPath $tier1Rect 12
$brushTier1 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(237, 242, 247))
$g.FillPath($brushTier1, $tier1Path)
$g.DrawPath($penBorder, $tier1Path)
$g.DrawString("CLIENT PRESENTATION TIER (Cross-Platform Responsive Clients)", $fontSection, $brushNavy, 70, 85)

# Boxes in Tier 1
# Box 1: Web Client
$b1 = New-Object System.Drawing.Rectangle 80, 120, 320, 90
$g.FillRectangle($brushWhite, $b1)
$g.DrawRectangle($penBorder, $b1)
$g.DrawString("Web Portal Single Page App", $fontBoxTitle, $brushNavy, 90, 125)
$g.DrawString("- React 19 + Vite + Tailwind CSS v4`n- HTML5, Lucide Icons, html2canvas-pro`n- Deployed on Vercel Global Edge CDN", $fontBoxBody, $brushDark, 90, 145)

# Box 2: Mobile Client
$b2 = New-Object System.Drawing.Rectangle 440, 120, 320, 90
$g.FillRectangle($brushWhite, $b2)
$g.DrawRectangle($penBorder, $b2)
$g.DrawString("Mobile Native Application", $fontBoxTitle, $brushNavy, 450, 125)
$g.DrawString("- Flutter 3.13 SDK / Dart 3.13`n- Android (com.ruet.onehub) & iOS`n- Provider Architecture & Native Hub", $fontBoxBody, $brushDark, 450, 145)

# Box 3: Communication Bridge
$b3 = New-Object System.Drawing.Rectangle 800, 120, 320, 90
$g.FillRectangle($brushWhite, $b3)
$g.DrawRectangle($penBorder, $b3)
$g.DrawString("Security & Communication Bridge", $fontBoxTitle, $brushNavy, 810, 125)
$g.DrawString("- HTTPS / TLS 1.3 Transport Protocol`n- Stateless JWT (Bearer Auth in Headers)`n- Axios HTTP Client with Interceptors", $fontBoxBody, $brushDark, 810, 145)

# Downward arrows Tier 1 -> Tier 2
$g.DrawLine($penArrow, 240, 230, 240, 280)
$g.DrawLine($penArrow, 600, 230, 600, 280)
$g.DrawLine($penArrow, 960, 230, 960, 280)

# Tier 2: Backend API & Application Services Layer
$tier2Rect = New-Object System.Drawing.Rectangle 50, 280, 1100, 230
$tier2Path = Create-RoundedRectangleGraphicsPath $tier2Rect 12
$brushTier2 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(235, 248, 255))
$g.FillPath($brushTier2, $tier2Path)
$g.DrawPath($penBorder, $tier2Path)
$g.DrawString("APPLICATION & API GATEWAY TIER (Node.js & Express RESTful Server)", $fontSection, $brushNavy, 70, 295)

# Tier 2 Boxes
$b2_1 = New-Object System.Drawing.Rectangle 80, 335, 240, 150
$g.FillRectangle($brushWhite, $b2_1)
$g.DrawRectangle($penBorder, $b2_1)
$g.DrawString("Core Academic Services", $fontBoxTitle, $brushNavy, 90, 342)
$g.DrawString("- Routine Engine (Clash check)`n- Course Registration & Adviser`n- Marks & Continuous Assess.`n- OBE CO-PO Radar Mapping`n- Attendance % Warning System", $fontBoxBody, $brushDark, 90, 365)

$b2_2 = New-Object System.Drawing.Rectangle 350, 335, 240, 150
$g.FillRectangle($brushWhite, $b2_2)
$g.DrawRectangle($penBorder, $b2_2)
$g.DrawString("Campus Facilities Services", $fontBoxTitle, $brushNavy, 360, 342)
$g.DrawString("- Hall Seat Alloc. & Provost Review`n- Digital Dining & QR Token Wallet`n- Medical Center & Ambulance`n- Emergency Blood Directory`n- Semester Clearance Admin", $fontBoxBody, $brushDark, 360, 365)

$b2_3 = New-Object System.Drawing.Rectangle 620, 335, 240, 150
$g.FillRectangle($brushWhite, $b2_3)
$g.DrawRectangle($penBorder, $b2_3)
$g.DrawString("Intelligence & Cron Daemons", $fontBoxTitle, $brushNavy, 630, 342)
$g.DrawString("- StudyBuddy AI (Gemini Flash)`n- OBE LaTeX Test Generator`n- RUET Notice Scraper (6h cron)`n- Routine Reminders (1m cron)`n- Sliding-Window Offset Engine", $fontBoxBody, $brushDark, 630, 365)

$b2_4 = New-Object System.Drawing.Rectangle 890, 335, 230, 150
$g.FillRectangle($brushWhite, $b2_4)
$g.DrawRectangle($penBorder, $b2_4)
$g.DrawString("Security & Middleware", $fontBoxTitle, $brushNavy, 900, 342)
$g.DrawString("- Role Guard (requireRole)`n- express-rate-limit Defense`n- bcryptjs (Cost 12) Hashing`n- Gmail SMTP OTP Dispatch`n- Global System Settings Toggle", $fontBoxBody, $brushDark, 900, 365)

# Downward arrows Tier 2 -> Tier 3
$g.DrawLine($penArrow, 200, 510, 200, 560)
$g.DrawLine($penArrow, 470, 510, 470, 560)
$g.DrawLine($penArrow, 740, 510, 740, 560)
$g.DrawLine($penArrow, 1000, 510, 1000, 560)

# Tier 3: Data & Cloud Infrastructure Layer
$tier3Rect = New-Object System.Drawing.Rectangle 50, 560, 1100, 150
$tier3Path = Create-RoundedRectangleGraphicsPath $tier3Rect 12
$brushTier3 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(254, 243, 199))
$penAmber = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(217, 119, 6), 2)
$brushAmberDark = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(146, 64, 14))
$g.FillPath($brushTier3, $tier3Path)
$g.DrawPath($penAmber, $tier3Path)
$g.DrawString("PERSISTENCE & EXTERNAL SERVICES TIER (Cloud Infrastructure)", $fontSection, $brushAmberDark, 70, 575)

$b3_1 = New-Object System.Drawing.Rectangle 80, 610, 240, 80
$g.FillRectangle($brushWhite, $b3_1)
$g.DrawRectangle($penAmber, $b3_1)
$g.DrawString("MongoDB Atlas Cloud", $fontBoxTitle, $brushAmberDark, 90, 618)
$g.DrawString("23 Document Collections, TTL Indexes, Compound Queries, 99.99% SLA", $fontBoxBody, $brushDark, 90, 640)

$b3_2 = New-Object System.Drawing.Rectangle 350, 610, 240, 80
$g.FillRectangle($brushWhite, $b3_2)
$g.DrawRectangle($penAmber, $b3_2)
$g.DrawString("Google Cloud AI & YouTube", $fontBoxTitle, $brushAmberDark, 360, 618)
$g.DrawString("Gemini 2.5 Flash Model Engine & YouTube Data v3 Playlist API", $fontBoxBody, $brushDark, 360, 640)

$b3_3 = New-Object System.Drawing.Rectangle 620, 610, 240, 80
$g.FillRectangle($brushWhite, $b3_3)
$g.DrawRectangle($penAmber, $b3_3)
$g.DrawString("Firebase Cloud Messaging", $fontBoxTitle, $brushAmberDark, 630, 618)
$g.DrawString("FCM Multi-cast Push Pipeline for mobile lecture reminders", $fontBoxBody, $brushDark, 630, 640)

$b3_4 = New-Object System.Drawing.Rectangle 890, 610, 230, 80
$g.FillRectangle($brushWhite, $b3_4)
$g.DrawRectangle($penAmber, $b3_4)
$g.DrawString("Render & Cloudinary", $fontBoxTitle, $brushAmberDark, 900, 618)
$g.DrawString("Docker Web Service hosting & CDN Cloud media asset storage", $fontBoxBody, $brushDark, 900, 640)

$bmp.Save("$outputDir/fig_1_1_architecture.png", [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()
Write-Host "Done: fig_1_1_architecture.png"

# ==========================================
# 2. Figure 3.1: Entity Relationship Diagram (ERD)
# ==========================================
Write-Host "Rendering Figure 3.1: ERD..."
$w = 1200; $h = 800
$bmp = New-Object System.Drawing.Bitmap $w, $h
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias
$g.Clear([System.Drawing.Color]::White)

$penLine = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(43, 108, 176), 2)
$penRel = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(229, 62, 62), 2)
$penRel.DashStyle = [System.Drawing.Drawing2D.DashStyle]::Dash

$g.DrawString("Figure 3.1: Entity-Relationship Diagram (ERD) of OneHUB Data Schemas", $fontTitle, $brushNavy, 220, 20)

function Draw-SchemaBox {
    param($g, $title, $fields, $x, $y, $w, $h)
    $rect = New-Object System.Drawing.Rectangle $x, $y, $w, $h
    $path = Create-RoundedRectangleGraphicsPath $rect 8
    $bWhite = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $bHead = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(26, 54, 93))
    $p = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(26, 54, 93), 2)
    $fTitle = New-Object System.Drawing.Font('Times New Roman', 10, [System.Drawing.FontStyle]::Bold)
    $fText = New-Object System.Drawing.Font('Times New Roman', 8, [System.Drawing.FontStyle]::Regular)
    $bDark = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(45, 55, 72))
    
    $g.FillPath($bWhite, $path)
    $g.DrawPath($p, $path)
    
    # Header bar
    $hRect = New-Object System.Drawing.Rectangle $x, $y, $w, 26
    $g.FillRectangle($bHead, $hRect)
    $wText = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $g.DrawString($title, $fTitle, $wText, ($x + 8), ($y + 5))
    
    $curY = $y + 32
    foreach ($field in $fields) {
        $g.DrawString($field, $fText, $bDark, ($x + 8), $curY)
        $curY += 16
    }
}

# Central USER Schema
Draw-SchemaBox $g "USER (Collection: users)" @("PK: _id: ObjectId", "name: String", "email: String (Unique)", "password: String (bcrypt)", "role: student|faculty|admin|hall_admin", "rollNo: String (Sparse)", "department: String (ECE, CSE, etc.)", "batch: String ('24, '23, etc.)", "bloodGroup: String (O+, A+, etc.)", "phone: String", "isAdviser: Boolean", "fcmTokens: [String]") 470 280 260 230

# Surrounding Related Entities
# 1. Registration
Draw-SchemaBox $g "REGISTRATION" @("PK: _id: ObjectId", "FK: studentId -> User._id", "session: String", "semester: String (1-1 to 4-2)", "courses: [CourseCode]", "status: pending|approved|rejected", "adviserApproved: Boolean", "hallFeeCleared: Boolean", "totalCredits: Number") 80 80 240 170

# 2. Mark (OBE)
Draw-SchemaBox $g "MARK (Continuous Assess)" @("PK: _id: ObjectId", "FK: studentId -> User._id", "courseCode: String", "semester: String", "assessmentType: CT|Lab|Final", "coMapping: String (CO1-CO4)", "marksObtained: Number", "maxMarks: Number") 470 70 260 160

# 3. Attendance
Draw-SchemaBox $g "ATTENDANCE" @("PK: _id: ObjectId", "courseCode: String", "department: String", "date: Date", "teacherId -> User._id", "records: [{ studentId, present }]") 870 80 250 140

# 4. Course
Draw-SchemaBox $g "COURSE CATALOG" @("PK: _id: ObjectId", "courseCode: String (Unique)", "courseTitle: String", "credit: Number", "department: String", "semester: String (1-1..4-2)", "type: theory|sessional") 80 340 240 150

# 5. ClassSchedule (Routine)
Draw-SchemaBox $g "CLASS SCHEDULE" @("PK: _id: ObjectId", "courseCode: String", "department: String", "semester: String", "day: String (Sun-Thu)", "startTime: String ('08:00 AM')", "endTime: String ('08:50 AM')", "room: String", "teacher: String", "group: '1st 30'|'2nd 30'") 80 570 240 180

# 6. DiningWallet
Draw-SchemaBox $g "DINING WALLET" @("PK: _id: ObjectId", "FK: studentId -> User._id (1:1)", "balance: Number", "mealTokens: [{ date, type, status }]", "lastRecharge: Date") 470 580 260 140

# 7. MedicalAppointment
Draw-SchemaBox $g "MEDICAL APPOINTMENT" @("PK: _id: ObjectId", "FK: studentId -> User._id", "doctorName: String", "appointmentDate: Date", "timeSlot: String", "symptoms: String", "status: scheduled|completed") 870 340 250 150

# 8. Otp
Draw-SchemaBox $g "OTP (Expiring Auth)" @("PK: _id: ObjectId", "email: String", "otp: String (6 digits)", "createdAt: Date (TTL 600s)") 870 580 250 110

# Draw Relationship Lines
# User -> Registration (1 : N)
$g.DrawLine($penLine, 470, 320, 320, 200)
# User -> Mark (1 : N)
$g.DrawLine($penLine, 600, 280, 600, 230)
# User -> Attendance (1 : N)
$g.DrawLine($penLine, 730, 320, 870, 200)
# User -> DiningWallet (1 : 1)
$g.DrawLine($penLine, 600, 510, 600, 580)
# User -> Medical (1 : N)
$g.DrawLine($penLine, 730, 420, 870, 420)
# User -> Otp (1 : N)
$g.DrawLine($penLine, 730, 490, 870, 620)
# Course -> Schedule
$g.DrawLine($penRel, 200, 490, 200, 570)
# Course -> Registration
$g.DrawLine($penRel, 200, 340, 200, 250)

$bmp.Save("$outputDir/fig_3_1_erd.png", [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()
Write-Host "Done: fig_3_1_erd.png"

# ==========================================
# 3. Figure 3.2: Level 0 Context DFD
# ==========================================
Write-Host "Rendering Figure 3.2: DFD Level 0..."
$w = 1100; $h = 650
$bmp = New-Object System.Drawing.Bitmap $w, $h
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias
$g.Clear([System.Drawing.Color]::White)

$g.DrawString("Figure 3.2: Level 0 (Context) Data Flow Diagram for OneHUB", $fontTitle, $brushNavy, 240, 20)

# Central Process Circle
$pCenter = New-Object System.Drawing.Rectangle 400, 220, 300, 160
$bCircle = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(235, 248, 255))
$pCircle = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(43, 108, 176), 3)
$g.FillEllipse($bCircle, $pCenter)
$g.DrawEllipse($pCircle, $pCenter)
$g.DrawString("0.0`nOneHUB Central`nSmart Campus Platform", $fontSection, $brushNavy, 445, 265)

function Draw-DFDEntity {
    param($g, $title, $x, $y, $w, $h)
    $r = New-Object System.Drawing.Rectangle $x, $y, $w, $h
    $b = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(247, 250, 252))
    $p = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(26, 54, 93), 2)
    $f = New-Object System.Drawing.Font('Times New Roman', 12, [System.Drawing.FontStyle]::Bold)
    $brText = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(26, 54, 93))
    $g.FillRectangle($b, $r)
    $g.DrawRectangle($p, $r)
    $g.DrawString($title, $f, $brText, ($x + 15), ($y + 20))
}

# Entities
Draw-DFDEntity $g "STUDENT ACTOR" 80 120 180 70
Draw-DFDEntity $g "FACULTY ACTOR" 840 120 180 70
Draw-DFDEntity $g "DEPARTMENT ADMIN" 80 440 200 70
Draw-DFDEntity $g "HALL / PROVOST ADMIN" 820 440 230 70

# Data Flow Lines with Text
$fontSmall = New-Object System.Drawing.Font('Times New Roman', 8, [System.Drawing.FontStyle]::Regular)
# Student -> OneHUB
$g.DrawLine($penArrow, 260, 150, 420, 240)
$g.DrawString("Credentials, Course Choices,`nDining Purchase, Blood Query", $fontSmall, $brushDark, 250, 180)

# OneHUB -> Student
$g.DrawLine($penArrow, 420, 270, 260, 180)
$g.DrawString("Routines, Attendance Alerts,`nOBE Attainment, Token QR", $fontSmall, $brushDark, 270, 230)

# Faculty -> OneHUB
$g.DrawLine($penArrow, 840, 150, 680, 240)
$g.DrawString("Lecture Attendance, Continuous Marks,`nAdviser Approval Verdict", $fontSmall, $brushDark, 680, 180)

# OneHUB -> Faculty
$g.DrawLine($penArrow, 680, 270, 840, 180)
$g.DrawString("Advisee Rosters, Class Schedules,`nCourse CO-PO Summary", $fontSmall, $brushDark, 700, 230)

# Admin -> OneHUB
$g.DrawLine($penArrow, 280, 460, 440, 360)
$g.DrawString("Routine Layouts, Room Allocations,`nUser Management, Feature Toggles", $fontSmall, $brushDark, 250, 390)

# Hall Admin -> OneHUB
$g.DrawLine($penArrow, 820, 460, 660, 360)
$g.DrawString("Hall Seat Review, Dining Menus,`nToken Redemption, Clearances", $fontSmall, $brushDark, 660, 390)

$bmp.Save("$outputDir/fig_3_2_dfd_lvl0.png", [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()
Write-Host "Done: fig_3_2_dfd_lvl0.png"

# ==========================================
# 4. Figure 4.2: OBE Radar Attainment Flow
# ==========================================
Write-Host "Rendering Figure 4.2: OBE Flow..."
$w = 1100; $h = 500
$bmp = New-Object System.Drawing.Bitmap $w, $h
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias
$g.Clear([System.Drawing.Color]::White)

$g.DrawString("Figure 4.2: Outcome-Based Education (OBE) Multi-Tier Attainment Model", $fontTitle, $brushNavy, 180, 20)

function Draw-ProcessStep {
    param($g, $stepNum, $title, $sub, $x, $y, $w, $h, $bg)
    $r = New-Object System.Drawing.Rectangle $x, $y, $w, $h
    $b = New-Object System.Drawing.SolidBrush($bg)
    $p = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(43, 108, 176), 2)
    $fTitle = New-Object System.Drawing.Font('Times New Roman', 11, [System.Drawing.FontStyle]::Bold)
    $fSub = New-Object System.Drawing.Font('Times New Roman', 9, [System.Drawing.FontStyle]::Regular)
    $g.FillRectangle($b, $r)
    $g.DrawRectangle($p, $r)
    $bDark = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(26, 54, 93))
    $g.DrawString("STEP " + $stepNum + ": " + $title, $fTitle, $bDark, ($x + 10), ($y + 12))
    $g.DrawString($sub, $fSub, $bDark, ($x + 10), ($y + 36))
}

$c1 = [System.Drawing.Color]::FromArgb(237, 242, 247)
$c2 = [System.Drawing.Color]::FromArgb(226, 232, 240)
$c3 = [System.Drawing.Color]::FromArgb(254, 235, 200)
$c4 = [System.Drawing.Color]::FromArgb(198, 246, 213)

Draw-ProcessStep $g "1" "Continuous Assessments" "Faculty inputs raw student scores in CT1..CT4, Lab Reports, Quizzes, Attendance, and Term Final." 60 120 220 180 $c1
$g.DrawLine($penArrow, 280, 210, 320, 210)

Draw-ProcessStep $g "2" "Course Outcome Mapping" "Each test item is tagged with CO1..CO4 and mapped to Bloom's Taxonomy (Cognitive C1..C6)." 320 120 220 180 $c2
$g.DrawLine($penArrow, 540, 210, 580, 210)

Draw-ProcessStep $g "3" "Weighted Matrix Engine" "System aggregates scores into normalized attainment vectors using course credit weights and 60% threshold." 580 120 220 180 $c3
$g.DrawLine($penArrow, 800, 210, 840, 210)

Draw-ProcessStep $g "4" "Interactive Radar Visual" "Generates dynamic SVG Radar Charts depicting student mastery across PO1..PO12 for BAETE audits." 840 120 220 180 $c4

# Legend note
$g.DrawString("Formula: PO_Attainment_j = Sum(Weight_ij * CO_Attainment_i) / Sum(Weight_ij) [Threshold >= 60% for Accreditation]", $fontBoxTitle, $brushNavy, 160, 360)

$bmp.Save("$outputDir/fig_4_2_obe_flow.png", [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()
Write-Host "Done: fig_4_2_obe_flow.png"

# ==========================================
# 5. Figure 6.1: Project Gantt Chart
# ==========================================
Write-Host "Rendering Figure 6.1: Gantt Chart..."
$w = 1100; $h = 480
$bmp = New-Object System.Drawing.Bitmap $w, $h
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias
$g.Clear([System.Drawing.Color]::White)

$g.DrawString("Figure 6.1: Project Gantt Chart and Milestone Development Timeline (15 Weeks)", $fontTitle, $brushNavy, 160, 20)

$phases = @(
    @{ Name = "Phase 1: Requirements & SRS Modeling"; Start = 0; Dur = 2; Color = [System.Drawing.Color]::FromArgb(49, 130, 206) },
    @{ Name = "Phase 2: Core Backend, MongoDB & Auth"; Start = 2; Dur = 3; Color = [System.Drawing.Color]::FromArgb(43, 108, 176) },
    @{ Name = "Phase 3: React Web Portal & Routine Engine"; Start = 5; Dur = 3; Color = [System.Drawing.Color]::FromArgb(56, 161, 105) },
    @{ Name = "Phase 4: Flutter Mobile Client & FCM Push"; Start = 8; Dur = 3; Color = [System.Drawing.Color]::FromArgb(214, 158, 46) },
    @{ Name = "Phase 5: Gemini AI, Scrapers & OBE Radar"; Start = 11; Dur = 2; Color = [System.Drawing.Color]::FromArgb(128, 90, 213) },
    @{ Name = "Phase 6: UAT Testing, Security Audit & Cloud Deploy"; Start = 13; Dur = 2; Color = [System.Drawing.Color]::FromArgb(229, 62, 62) }
)

$chartLeft = 320
$chartTop = 80
$weekWidth = 48
$rowHeight = 50

# Draw Week header
for ($wk = 1; $wk -le 15; $wk++) {
    $x = $chartLeft + ($wk - 1) * $weekWidth
    $g.DrawString("W$wk", $fontBoxTitle, $brushNavy, ($x + 8), $chartTop)
    $penGrid = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(226, 232, 240), 1)
    $g.DrawLine($penGrid, $x, ($chartTop + 25), $x, ($chartTop + 25 + 6 * $rowHeight))
}

for ($i = 0; $i -lt $phases.Count; $i++) {
    $p = $phases[$i]
    $y = $chartTop + 30 + $i * $rowHeight
    
    # Label
    $g.DrawString($p.Name, $fontBoxBody, $brushDark, 30, ($y + 8))
    
    # Bar
    $barX = $chartLeft + $p.Start * $weekWidth
    $barW = $p.Dur * $weekWidth - 6
    $barRect = New-Object System.Drawing.Rectangle $barX, $y, $barW, 28
    $bBar = New-Object System.Drawing.SolidBrush($p.Color)
    $g.FillRectangle($bBar, $barRect)
    
    $wText = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $g.DrawString("Weeks " + ($p.Start + 1) + "-" + ($p.Start + $p.Dur), $fontBoxBody, $wText, ($barX + 8), ($y + 6))
}

$bmp.Save("$outputDir/fig_6_1_gantt.png", [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()
Write-Host "Done: fig_6_1_gantt.png"

# ==========================================
# 6. Figure 3.3: DFD Level 1 (Course Registration Workflow)
# ==========================================
Write-Host "Rendering Figure 3.3: DFD Level 1..."
$w = 1100; $h = 550
$bmp = New-Object System.Drawing.Bitmap $w, $h
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias
$g.Clear([System.Drawing.Color]::White)

$g.DrawString("Figure 3.3: Level 1 Data Flow Diagram: Course Registration & Adviser Approval", $fontTitle, $brushNavy, 120, 20)

Draw-DFDEntity $g "STUDENT" 50 180 140 70
Draw-DFDEntity $g "FACULTY ADVISER" 900 180 160 70

function Draw-ProcessCircle {
    param($g, $pNum, $title, $x, $y, $w, $h)
    $r = New-Object System.Drawing.Rectangle $x, $y, $w, $h
    $b = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(235, 248, 255))
    $p = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(43, 108, 176), 2)
    $fTitle = New-Object System.Drawing.Font('Times New Roman', 10, [System.Drawing.FontStyle]::Bold)
    $bNavy = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(26, 54, 93))
    $g.FillEllipse($b, $r)
    $g.DrawEllipse($p, $r)
    $g.DrawString("$pNum`n$title", $fTitle, $bNavy, ($x + 15), ($y + 20))
}

Draw-ProcessCircle $g "1.1" "Course Selection`n& Credit Check" 240 160 140 100
Draw-ProcessCircle $g "1.2" "Prerequisite &`nHall Clearance" 440 160 140 100
Draw-ProcessCircle $g "1.3" "Adviser Review`n& Approval Gate" 680 160 140 100

# Connectors
$g.DrawLine($penArrow, 190, 215, 240, 215)
$g.DrawString("Semester Courses", $fontBoxBody, $brushDark, 160, 190)

$g.DrawLine($penArrow, 380, 215, 440, 215)
$g.DrawString("Max 25 Credits", $fontBoxBody, $brushDark, 370, 190)

$g.DrawLine($penArrow, 580, 215, 680, 215)
$g.DrawString("Clearance Verified", $fontBoxBody, $brushDark, 570, 190)

$g.DrawLine($penArrow, 820, 215, 900, 215)
$g.DrawString("Pending Roster", $fontBoxBody, $brushDark, 810, 190)

$g.DrawLine($penArrow, 900, 235, 820, 235)
$g.DrawString("Digital Approval", $fontBoxBody, $brushDark, 810, 240)

# Data Store below
$dsRect = New-Object System.Drawing.Rectangle 440, 380, 220, 60
$g.DrawLine($penBorder, 440, 380, 660, 380)
$g.DrawLine($penBorder, 440, 440, 660, 440)
$g.DrawString("D1: registrations collection", $fontBoxTitle, $brushNavy, 460, 400)

$g.DrawLine($penArrow, 510, 260, 510, 380)
$g.DrawLine($penArrow, 750, 260, 580, 380)

$bmp.Save("$outputDir/fig_3_3_dfd_lvl1.png", [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()
Write-Host "Done: fig_3_3_dfd_lvl1.png"

# ==========================================
# 7. Figure 4.1: Routine Designer & Export Pipeline
# ==========================================
Write-Host "Rendering Figure 4.1: Routine Pipeline..."
$w = 1100; $h = 450
$bmp = New-Object System.Drawing.Bitmap $w, $h
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias
$g.Clear([System.Drawing.Color]::White)

$g.DrawString("Figure 4.1: Visual Routine Generator, Clash Detection, and PNG Export Engine", $fontTitle, $brushNavy, 120, 20)

Draw-ProcessStep $g "1" "Visual Routine Grid" "Interactive weekly matrix (Sun-Thu). Renders dedicated Tea Break (10:30) and Lunch Break (1:20)." 50 120 220 180 $c1
$g.DrawLine($penArrow, 270, 210, 310, 210)

Draw-ProcessStep $g "2" "Conflict & Split-Lab" "Automated room and teacher clash detection. Allows 1st 30 / 2nd 30 lab batch assignment." 310 120 220 180 $c2
$g.DrawLine($penArrow, 530, 210, 570, 210)

Draw-ProcessStep $g "3" "Custom Theme Engine" "24 preset background colors, hex wheel, dynamic font switching (Times New Roman, Arial, Roboto)." 570 120 220 180 $c3
$g.DrawLine($penArrow, 790, 210, 830, 210)

Draw-ProcessStep $g "4" "html2canvas-pro Export" "Client-side high-DPI canvas rasterization converting oklch Tailwind colors into official PNG download." 830 120 220 180 $c4

$bmp.Save("$outputDir/fig_4_1_routine_workflow.png", [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()
Write-Host "Done: fig_4_1_routine_workflow.png"

# ==========================================
# 8. Figure 3.4: Object-Oriented Class Diagram
# ==========================================
Write-Host "Rendering Figure 3.4: Class Diagram..."
$w = 1200; $h = 700
$bmp = New-Object System.Drawing.Bitmap $w, $h
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias
$g.Clear([System.Drawing.Color]::White)

$g.DrawString("Figure 3.4: Object-Oriented Domain Class Diagram for OneHUB", $fontTitle, $brushNavy, 220, 20)

function Draw-UMLClass {
    param($g, $title, $attrs, $methods, $x, $y, $w, $h)
    $rect = New-Object System.Drawing.Rectangle $x, $y, $w, $h
    $brushHeader = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(43, 108, 176))
    $brushClassBody = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(247, 250, 252))
    
    $g.FillRectangle($brushClassBody, $rect)
    $g.DrawRectangle($penBorder, $rect)
    
    # Class title banner
    $titleRect = New-Object System.Drawing.Rectangle $x, $y, $w, 32
    $g.FillRectangle($brushHeader, $titleRect)
    $g.DrawRectangle($penBorder, $titleRect)
    $g.DrawString($title, $fontBoxTitle, $brushWhite, ($x + 12), ($y + 7))
    
    # Attributes
    $g.DrawString($attrs, $fontBoxBody, $brushDark, ($x + 10), ($y + 40))
    $sepY = $y + 40 + [int]($h * 0.45)
    $g.DrawLine($penBorder, $x, $sepY, ($x + $w), $sepY)
    
    # Methods
    $g.DrawString($methods, $fontBoxBody, $brushDark, ($x + 10), ($sepY + 8))
}

# Row 1 Classes
$userAttrs = "- id: ObjectId`n- name: String`n- rollNumber: String`n- email: String`n- role: UserRole`n- department: String`n- hallName: String`n- bloodGroup: String"
$userMethods = "+ authenticate(pwd): Token`n+ generateOTP(): String`n+ verifyOTP(code): Boolean`n+ getProfile(): UserDTO"
Draw-UMLClass $g "User (Entity)" $userAttrs $userMethods 60 80 320 250

$courseAttrs = "- courseCode: String`n- courseTitle: String`n- creditHours: Number`n- contactHours: Number`n- courseType: Enum`n- semester: String`n- department: String"
$courseMethods = "+ validatePrereqs(): Boolean`n+ getSyllabus(): Doc`n+ getCOList(): List<CO>`n+ calculateWeight(): Number"
Draw-UMLClass $g "Course (Entity)" $courseAttrs $courseMethods 440 80 320 250

$regAttrs = "- registrationId: ObjectId`n- studentId: ObjectId`n- academicSession: String`n- enrolledCourses: List<Course>`n- totalCredits: Number`n- adviserStatus: Status`n- provostStatus: Status"
$regMethods = "+ addCourse(course): Boolean`n+ submitForAdviserReview()`n+ approveByAdviser(adviserId)`n+ lockAndExportPDF(): Blob"
Draw-UMLClass $g "Registration (Aggregate)" $regAttrs $regMethods 820 80 320 250

# Row 2 Classes
$routineAttrs = "- slotId: ObjectId`n- day: DayOfWeek`n- startTime: Time`n- endTime: Time`n- courseCode: String`n- roomNumber: String`n- teacherInitials: String`n- labBatch: LabBatch"
$routineMethods = "+ detectConflict(existingSlots)`n+ exportRoutinePNG(canvas)`n+ notifyStudents(cronJob)`n+ updateBatchSlot(batchId)"
Draw-UMLClass $g "RoutineSlot (Entity)" $routineAttrs $routineMethods 60 380 320 250

$obeAttrs = "- courseCode: String`n- examType: Enum (CT/Lab/Final)`n- coList: List<CourseOutcome>`n- poMatrix: Matrix<CO, PO>`n- studentScores: Map<Roll, Marks>`n- benchmarkTarget: Double (60%)"
$obeMethods = "+ calculateCOAttainment()`n+ projectToPOLevel(): Matrix`n+ generateRadarChart(): Canvas`n+ exportLaTeXTestPaper(): TeX"
Draw-UMLClass $g "OBEEngine (Service)" $obeAttrs $obeMethods 440 380 320 250

$mealAttrs = "- tokenTransactionId: ObjectId`n- studentId: ObjectId`n- hallName: String`n- mealType: Enum (Lunch/Dinner)`n- tokenHash: String (SHA-256)`n- isRedeemed: Boolean`n- balanceAmount: Number"
$mealMethods = "+ purchaseToken(qty): Order`n+ renderDynamicQRCode(): QR`n+ verifyDiningHallScan(): Boolean`n+ getLedgerHistory(): List"
Draw-UMLClass $g "DiningWallet (Entity)" $mealAttrs $mealMethods 820 380 320 250

# Association Lines & Labels
$g.DrawLine($penArrow, 380, 180, 440, 180)
$g.DrawString("enrolls [1..*]", $fontBoxBody, $brushDark, 375, 160)

$g.DrawLine($penArrow, 760, 180, 820, 180)
$g.DrawString("contains [1..*]", $fontBoxBody, $brushDark, 755, 160)

$g.DrawLine($penArrow, 220, 330, 220, 380)
$g.DrawString("subscribes to", $fontBoxBody, $brushDark, 225, 345)

$g.DrawLine($penArrow, 600, 330, 600, 380)
$g.DrawString("assesses", $fontBoxBody, $brushDark, 605, 345)

$g.DrawLine($penArrow, 980, 330, 980, 380)
$g.DrawString("owns ledger", $fontBoxBody, $brushDark, 985, 345)

$bmp.Save("$outputDir/fig_3_4_class_diagram.png", [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()
Write-Host "Done: fig_3_4_class_diagram.png"

Write-Host "ALL DIAGRAMS GENERATED SUCCESSFULLY in $outputDir!"
