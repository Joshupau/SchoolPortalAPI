const mongoose = require('mongoose');

// Define the Program schema
const ProgramSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

// Check if the model is already defined, otherwise define it
const Program = mongoose.models.Program || mongoose.model("Program", ProgramSchema);

module.exports = Program;
