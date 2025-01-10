const { default: mongoose } = require("mongoose");



const EvaluationResponseSchema = new mongoose.Schema(
    {
        evaluation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Evaluation",
        },
        teacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Teacherusers",
        },
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Studentusers",
        },
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
                questions: [
                    {
                        question: {
                            type: String,
                        },
                        answer: {
                            type: String,
                        },
                        rating: {
                            type: Number,
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

const Evaluationresponse = mongoose.model("Evaluationresponse", EvaluationResponseSchema)
module.exports = Evaluationresponse