const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    blockName: { type: String, required: true },
    roomNumber: { type: String, required: true },
    departmentName: { type: String },
    programmeName: { type: String },
    complaintType: { type: String, required: true },
    remarks: { type: String },
    attachment: { type: String }, // file path
    status: {
      type: String,
      enum: ["Pending", "Assigned", "In-Progress", "Onhold", "Completed"],
      default: "Pending",
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Complaint", complaintSchema);
