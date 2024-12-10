const { default: mongoose } = require("mongoose");



const ScheduleSchema = new mongoose.Schema({
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Staffusers"
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject"
    },
    section: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Section"
    },
    schoolyear: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Schoolyear"
    },
    day: {
        type: String, // monday, tuesday, wednesday, thursday, friday
    },
    starttime: {
        type: String,
    },
    endtime: {
        type: String
    }
},
{
    timestamps: true
})

const Schedule = mongoose.model("Schedule", ScheduleSchema)
module.exports = Schedule