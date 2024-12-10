const { default: mongoose } = require("mongoose");


const AnnouncementSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Staffusers"
        },
        writer: {
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


const Announcements = mongoose.model("Announcements", AnnouncementSchema)
module.exports = Announcements