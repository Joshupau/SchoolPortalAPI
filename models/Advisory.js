const { default: mongoose } = require("mongoose");


const AdvisorySchema = new mongoose.Schema(
    {
        status: {
            type: String,
            default: "active"
        },
        program: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Program"
        },
        level: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Gradelevel"
        },
        section: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Section"
        },
        teacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Staffuser"
        }
    },
    {
        timestamps: true
    }
)


const Advisory = mongoose.model("Advisory", AdvisorySchema)
module.exports = Advisory

