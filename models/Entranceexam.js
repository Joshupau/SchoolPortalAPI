const { default: mongoose } = require("mongoose");


const EntranceExamSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Ticketusers"
        },
        schedule: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Examschedule"
        },
        score: {
            type: Number,
        },
        status: {
            type: String,
            default: "pending"
        }
    },
    {
        timestamps: true,
    }
)

const Entranceexam = mongoose.model("Entranceexam", EntranceExamSchema)
module.exports = Entranceexam