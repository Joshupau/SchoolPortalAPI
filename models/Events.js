const { default: mongoose } = require("mongoose");


const EventSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Staffusers"
        },
        eventdate: {
            type: String,
            index: true
        },
        title: {
            type: String,
            index: true,
        },
        content: {
            type: String,
            index: true,
        },
        image: {
            type: String,
            index: true,
        },
        status: {
            type: String,
            default: "active"
        }
    },
    {
        timestamps: true
    }
)


const Events = mongoose.model("Events", EventSchema)
module.exports = Events