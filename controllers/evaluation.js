const { default: mongoose } = require("mongoose")
const Evaluation = require("../models/Evaluation")
const Schoolyear = require("../models/Schoolyear")
const Studentuserdetails = require("../models/Studentuserdetails")


exports.createevaluation = async (req, res) => {
    const { id } = req.user;
    const { program, schoolyear, sections: data } = req.body; 

    if (!program || !schoolyear || !data || typeof data !== "object") {
        return res.status(400).json({
            message: "failed",
            data: "Program, school year, and valid data are required.",
        });
    }

    const sections = Object.values(data).map((section) => ({
        title: section.category,
        weightage: section.weight,
        questions: section.questions.map((question) => ({
            question: question.text,
        })),
    }));

    await Evaluation.create({
        program,
        schoolyear,
        sections,
    })
    .then(data => data)
    .catch(error => {
        console.log(`There was an error encountered while creating evaluation. Error: ${error}`);
        return res.status(400).json({
            message: "bad-request",
            data: "There's a problem with the server. Please contact customer support for more details.",
        });
    });

    return res.status(200).json({ message: "success" })
};


exports.getevaluation = async (req, res) => {

    const evaluation = await Evaluation.find()
    .populate("program")
    .populate("schoolyear")
    .then(data => data)
    .catch(error => {
        console.log(`There was an error encountered while fetching evaluation. Error: ${error}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact customer support for more details." })
    })

    if(!evaluation) {
        return res.status(400).json({
            message: "failed", data: "No evaluation found"
        })
    }

    const finaldata = []

    evaluation.forEach(evaluation => {
        finaldata.push({
            id: evaluation._id,
            program: {
                id: evaluation.program._id,
                name: evaluation.program.name
            },
            schoolyear: {
                id: evaluation.schoolyear._id,
                schoolyear: evaluation.schoolyear.startyear + " - " + evaluation.schoolyear.endyear
            },
            sections: evaluation.sections
        })
    })

    res.status(200).json({
        message: "success", data: finaldata
    })
}

exports.getevaluationbyid = async (req, res) => {
    const { id } = req.query

    const evaluation = await Evaluation.findOne({ _id: new mongoose.Types.ObjectId(id)})
    .populate("program")
    .populate("schoolyear")
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while fetching evaluation by id. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact customer support for more details." })
    })

    if(!evaluation) {
        return res.status(400).json({
            message: "failed", data: "No evaluation found"
        })
    }

    const finaldata = []

        finaldata.push({
            id: evaluation._id,
            program: {
                id: evaluation.program._id,
                name: evaluation.program.name
            },
            schoolyear: {
                id: evaluation.schoolyear._id,
                schoolyear: evaluation.schoolyear.startyear + " - " + evaluation.schoolyear.endyear
            },
            sections: evaluation.sections
        })

    return res.status(200).json({
        message: "success", data: finaldata
    })
}

exports.deleteevaluation = async (req, res) => {

    const { id } = req.query

    const evaluation = await Evaluation.findOneAndDelete({ _id: new mongoose.Types.ObjectId(id) })
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while deleting evaluation. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact customer support for more details." })
    })

    if(!evaluation) {
        return res.status(400).json({
            message: "failed", data: "No evaluation found"
        })
    }

    return res.status(200).json({
        message: "success"
    })
}


exports.getstudentevaluationbyprogram = async (req, res) => {
    const { id } = req.user

    const student = await Studentuserdetails.findOne({ owner: new mongoose.Types.ObjectId(id) })
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while fetching student by id. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact customer support for more details." })
    })

    const evaluation = await Evaluation.find({ program: new mongoose.Types.ObjectId(student.program) })
    .populate("program")
    .populate("schoolyear")
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while fetching evaluation by program. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact customer support for more details." })
    })

    if(!evaluation) {
        return res.status(400).json({
            message: "failed", data: "No evaluation found"
        })
    }

    const finaldata = []

    evaluation.forEach(evaluation => {
        finaldata.push({
            id: evaluation._id,
            program: {
                id: evaluation.program._id,
                name: evaluation.program.name
            },
            schoolyear: {
                id: evaluation.schoolyear._id,
                schoolyear: evaluation.schoolyear.startyear + " - " + evaluation.schoolyear.endyear
            },
            sections: evaluation.sections
        })
    })

    return res.status(200).json({
        message: "success", data: finaldata
    })

}