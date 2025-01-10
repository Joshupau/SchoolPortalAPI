const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Studentusers",
        },
        section: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Section"       
        },
        gradelevel: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Gradelevel"
        },
        date: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ["present", "absent", "late", "excused"], 
            required: true,
            default: "present",
        },
    },
    {
        timestamps: true,
    }
);

const Attendance = mongoose.model("Attendance", AttendanceSchema)
module.exports = Attendance