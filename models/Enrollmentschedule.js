const { default: mongoose } = require("mongoose");



const EnrollmentScheduleSchema = new mongoose.Schema(
    {
        program: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Program"
        },
        startdate: {
            type: String,
            index: true,
        },
        enddate: {
            type: String,
            index: true
        }
    },
    {
        timestamps: true,
    }
)
const EnrollmentSchedule = mongoose.model("EnrollmentSchedule", EnrollmentScheduleSchema)
module.exports = EnrollmentSchedule
