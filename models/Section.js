const { default: mongoose } = require("mongoose");


const SectionSchema = new mongoose.Schema(
    {
        name: {
            type: String,
        },
        status: {
            type: String,
            default: "active",
        },
        gradelevel: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Gradelevel"
        },
        program: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Program"
        },
        schoolyear: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Schoolyear"
        },
        subjects: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subject"
        }],
        students: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Studentusers',
            index: true
        }]
    },
    {
        timestamps: true
    }
)


const Section = mongoose.model("Section", SectionSchema)
module.exports = Section