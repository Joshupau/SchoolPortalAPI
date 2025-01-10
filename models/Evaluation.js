const { default: mongoose } = require("mongoose");



const EvaluationSchema = new mongoose.Schema(
    {
        program: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Program"
        },
        schoolyear: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Schoolyear",
        },
        sections: [
            {
                title: {
                    type: String,
                },
                weightage: {
                    type: Number,
                },
                questions: [
                    {
                        question: {
                            type: String,
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

const Evaluation = mongoose.model("Evaluation", EvaluationSchema)
module.exports = Evaluation