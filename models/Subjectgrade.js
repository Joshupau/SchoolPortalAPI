const { default: mongoose } = require("mongoose");



const SubjectGradeSchema = new mongoose.Schema(
    {
        subject: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subjects"
        },
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Studentusers"
        },
        schoolyear: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Schoolyear"
        },
        quarter: {
            type: String
        },
        grade: {
            type: Number,
        },
        remarks: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
)

const Subjectgrade = mongoose.model("Subjectgrade", SubjectGradeSchema)
module.exports = Subjectgrade