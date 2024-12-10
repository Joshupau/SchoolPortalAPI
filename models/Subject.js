const { default: mongoose } = require("mongoose");


const SubjectSchema = new mongoose.Schema(
    {
        name: {
            type: String,
        },
        status: {
            type: String,
            default: "active"
        },
        level: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Gradelevel"
        }
    },
    {
        timestamps: true
    }
)

const Subject = mongoose.model("Subject", SubjectSchema)
module.exports = Subject