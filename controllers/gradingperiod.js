const { default: mongoose } = require("mongoose")
const GradingPeriod = require("../models/Gradingperiod")


exports.getgradingperiod = async (req, res) => {

    const data = await GradingPeriod.find()
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encounterd while fetching grading period. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact support for more details."})
    })

    return res.status(200).json({ message: "success", data: data})
}

exports.updategradingperiod = async (req, res) => {

    const { gradingperiod, quarter } = req.body


    if(!gradingperiod){
        return res.status(400).json({ message: "failed", data: "Please create/select grading period ID."})
    }

    await GradingPeriod.findOneAndUpdate({
        _id: new mongoose.Types.ObjectId(gradingperiod)
    },{ $set: { quarter: quarter}})
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while updating grading period. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details."})
    })

    return res.status(200).json({ message: "sucess"})
}