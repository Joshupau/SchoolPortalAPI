const { default: mongoose } = require("mongoose");



const GradingPeriodSchema = new mongoose.Schema(
    {
        quarter: {
            type: String,
        },

    },
    {
        timestamps: true,
    }
)



const GradingPeriod = mongoose.model("GradingPeriod", GradingPeriodSchema)
module.exports = GradingPeriod