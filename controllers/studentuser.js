const { default: mongoose } = require("mongoose")
const Studentusers = require("../models/Studentusers")
const Studentuserdetails = require("../models/Studentuserdetails")



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


exports.getstudentuserdetails = async (req, res) => {
    const { id } = req.user

    const userinfo = await Studentuserdetails.findOne({ owner: new mongoose.Types.ObjectId(id)})
    .populate("level")
    .populate("program")
    .populate("section")
    .then(data => data)
    .catch(err => { 
        console.log(`There's a problem encountered while fetching student user details of user: ${username}. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details."}) 
    })

    if(!userinfo){
        return res.status(400).json({ message: "failed", data: "No student user details found."})
    }

    const finaldata = {
        id: userinfo.owner,
        levelid: userinfo.level._id,
        basicinfo: {
            firstname: userinfo.firstname,
            middlename: userinfo.middlename,
            lastname: userinfo.lastname,
            gender: userinfo.gender,
            phonenumber: userinfo.phonenumber,
            telephonenumber: userinfo.telephonenumber,
            address: userinfo.address,
            religion: userinfo.religion,
            email: userinfo.email,
            civil: userinfo.civilstatus,
            section: userinfo.section?.name || "N/A",
            level: userinfo.level.name,
            program: userinfo.program.name,
        },
        familyinfo: {
            mother: {
                firstname: userinfo.mother.firstname,
                maidenname: userinfo.mother.maidenname,
                contact: userinfo.mother.contact
            },
            father: {
                firstname: userinfo.father.firstname,
                lastname: userinfo.father.lastname,
                contact: userinfo.father.contact
            },
            guardian: {
                firstname: userinfo.guardian.firstname,
                lastname: userinfo.guardian.lastname,
                contact: userinfo.guardian.contact
            }
        },
        requirements: {
            form137: userinfo.form137,
            tor: userinfo.tor,
            birthcertificate: userinfo.birthcertificate,
        }
        
    }

    return res.status(200).json({ message: "success", data: finaldata })
}