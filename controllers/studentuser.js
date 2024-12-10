const { default: mongoose } = require("mongoose")
const Studentusers = require("../models/Studentusers")



exports.getStudentusernamepw = async (req, res) => {
    const { id, username } = req.user

    const studentData = await Studentusers.findOne({ ticketid: new mongoose.Types.ObjectId(id)})
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while fetching for student username and password from ticket user: ${username}. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with your account. Please contact admin for more details."})
    })
    if(!studentData){
        return res.status(400).json({ message: "failed", data: "User account has not yet passed the exam."})
    }

    return res.status(200).json({ message: "success", data: { username: studentData.username, password: 'temp123'}})

}