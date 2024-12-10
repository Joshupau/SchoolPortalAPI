const { default: mongoose } = require("mongoose");


const NewsSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Staffusers"
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


const News = mongoose.model("News", NewsSchema)
module.exports = News