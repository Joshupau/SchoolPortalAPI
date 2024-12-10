const { default: mongoose } = require("mongoose");



const ExamScheduleSchema = new mongoose.Schema(
    {
        starttime: {
            type: String,
        },
        endtime: {
            type: String,
        },
        date: {
            type: Date
        },
        schoolyear: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Schoolyear"
        },
        examtakers: [{
            ticketuser: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Ticketusers"
            }
        }]
    },
    {
        timestamps: true,
    }
)


const Examschedule = mongoose.model("Examschedule", ExamScheduleSchema)
module.exports = Examschedule