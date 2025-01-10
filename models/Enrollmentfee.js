const { default: mongoose } = require("mongoose");


const EnrollmentFeeSchema = new mongoose.Schema(
    {
        program: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Program"
        },
        gradelevel: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "GradeLevel"
        },
        tuition: [
            {
                name: {
                    type: String,
                    required: true
                },
                fees: [
                    {
                        fee: {
                            type: String,
                            required: true
                        },
                        amount: {
                            type: Number,
                            required: true
                        },
                    }
                ]
            }
        ]
    },
    {
        timestamps: true,
    }
)
const EnrollmentFee = mongoose.model("EnrollmentFee", EnrollmentFeeSchema)
module.exports = EnrollmentFee




