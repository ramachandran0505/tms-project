const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide role name"],
      unique: true,
      trim: true,
    },
    permissions: [String],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Role", roleSchema);
