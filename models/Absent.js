const { default: mongoose } = require("mongoose");


const AbsentSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Studentusers"
        },
        grade: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Gradelevel"
        },
        section: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Section"
        },
        attendanceRecord: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Attendance", 
        },
        date: {
            type: Date,
        },
        reason: {
            type: String,
        }
    },
    {
        timestamps: true,
    }
)

const Absent = mongoose.model("Absent", AbsentSchema)
module.exports = Absent