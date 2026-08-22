const express = require("express");
const Fee = require("../models/Fee");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

// GET /api/fees -> all fee records for the logged-in student
router.get("/", requireAuth, async (req, res) => {
  try {
    const fees = await Fee.find({ studentId: req.user.id }).sort({ createdAt: -1 });
    res.json({ fees });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const mongoose = require("mongoose");
const Registration = require("../models/Registration");

// POST /api/fees/:feeId/pay -> Simulate sandbox payment
router.post("/:feeId/pay", requireAuth, requireRole("student"), async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { paymentMethod } = req.body; // "bKash", "Nagad", "Sonali Bank"
    const fee = await Fee.findOne({ _id: req.params.feeId, studentId: req.user.id }).session(session);
    
    if (!fee) throw new Error("Fee not found");
    if (fee.status === "paid") throw new Error("This fee is already paid");

    const validMethods = ["bKash", "Nagad", "Sonali Bank"];
    const method = validMethods.includes(paymentMethod) ? paymentMethod : "Cash/Bank";

    // Generate a verifiable transaction ID for this sandbox
    const txPrefix = method === "bKash" ? "BKX" : method === "Nagad" ? "NGX" : "SNB";
    const transactionId = `${txPrefix}-${Date.now().toString().slice(-6)}-${Math.floor(Math.random()*1000)}`;

    fee.status = "paid";
    fee.transactionId = transactionId;
    fee.paymentMethod = method;
    fee.paidAt = new Date();
    await fee.save({ session });

    const Notification = require("../models/Notification");
    await Notification.create([{
      recipientId: fee.studentId,
      title: "Payment Successful",
      message: `Your payment of ৳${fee.amount} for ${fee.label} was successful. (Txn ID: ${transactionId})`,
      type: "payment"
    }], { session });

    // If this is a Semester Registration fee, automatically approve the pending registration
    if (fee.feeType === "Semester Registration") {
      await Registration.updateMany(
        { studentId: req.user.id, semester: fee.semester, status: "pending" },
        { status: "approved" },
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();

    res.json({ fee, message: `Payment successful via ${method}` });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    const status = err.message === "Fee not found" ? 404 : 400;
    res.status(status).json({ error: err.message });
  }
});

// GET /api/fees/history -> only paid fees for the logged-in student
router.get("/history", requireAuth, async (req, res) => {
  try {
    const fees = await Fee.find({ studentId: req.user.id, status: "paid" }).sort({ paidAt: -1 });
    res.json({ fees });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PDFDocument = require("pdfkit");

// GET /api/fees/:feeId/receipt -> Generate 3-part digital receipt PDF
router.get("/:feeId/receipt", requireAuth, async (req, res) => {
  try {
    const fee = await Fee.findOne({ _id: req.params.feeId, studentId: req.user.id, status: "paid" })
      .populate("studentId", "name rollNo department batch");
      
    if (!fee) return res.status(404).json({ error: "Paid fee record not found" });

    const doc = new PDFDocument({ margin: 50 });
    
    // Set response headers to force download as PDF
    res.setHeader("Content-disposition", `attachment; filename=Receipt_${fee.transactionId}.pdf`);
    res.setHeader("Content-type", "application/pdf");
    
    doc.pipe(res);

    // PDF Content
    doc.fontSize(20).text("Rajshahi University of Engineering & Technology", { align: "center" });
    doc.moveDown();
    doc.fontSize(16).text("DIGITAL FEE RECEIPT", { align: "center", underline: true });
    doc.moveDown();
    
    doc.fontSize(12).text(`Transaction ID: ${fee.transactionId}`);
    doc.text(`Payment Method: ${fee.paymentMethod || "Unknown"}`);
    doc.text(`Date Paid: ${new Date(fee.paidAt).toLocaleString()}`);
    doc.moveDown();
    
    doc.text("Student Details:", { underline: true });
    doc.text(`Name: ${fee.studentId.name}`);
    doc.text(`Roll No: ${fee.studentId.rollNo}`);
    doc.text(`Department: ${fee.studentId.department}`);
    doc.moveDown();
    
    doc.text("Fee Details:", { underline: true });
    doc.text(`Type: ${fee.label}`);
    doc.text(`Semester: ${fee.semester}`);
    doc.text(`Total Amount: BDT ${fee.amount}`, { bold: true });
    doc.moveDown();

    doc.text("--------------------------------------------------");
    doc.text("This is a computer generated receipt and does not require a physical signature.", { align: "center", fontSize: 10 });
    
    doc.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;