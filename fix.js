const fs = require("fs");
const file = "routes/registrations.js";
let code = fs.readFileSync(file, "utf8");

code = code.replace(/[\s\S]*?\/\/ GET \/api\/registrations\/pending/,
`/**
 * File: registrations.js
 * Description: Handles student course registrations for each semester.
 * 
 * This file is part of the RUET OneHub Project.
 */

const express = require("express");
const Registration = require("../models/Registration");
const CourseAssignment = require("../models/CourseAssignment");
const Fee = require("../models/Fee");
const Notification = require("../models/Notification");
const User = require("../models/User");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

const PER_CREDIT_FEE = 20;
const EXAM_FEE_THEORY = 50;
const EXAM_FEE_SESSIONAL = 30;

// GET /api/registrations/pending`);
fs.writeFileSync(file, code);

