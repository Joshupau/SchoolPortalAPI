const { default: mongoose } = require("mongoose");



const SchoolYearSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId
        },
        startyear: {
            type: Number,
        },
        endyear: {
            type: Number,
        },
        currentstatus: {
            type: String,
        }
    },
    {
        timestamps: true
    }
)


const Schoolyear = mongoose.model("Schoolyear", SchoolYearSchema)
module.exports = Schoolyear