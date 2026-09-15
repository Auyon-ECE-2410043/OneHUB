const mongoose = require("mongoose");

const diningWalletSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  deposit: {
    type: Number,
    default: 0
  },
  withdrawn: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Virtual for balance
diningWalletSchema.virtual("balance").get(function() {
  return this.deposit - this.withdrawn;
});

// Ensure virtuals are included in JSON
diningWalletSchema.set("toJSON", { virtuals: true });
diningWalletSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("DiningWallet", diningWalletSchema);

