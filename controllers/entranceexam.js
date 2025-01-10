const { default: mongoose } = require("mongoose")
const Entranceexam = require("../models/Entranceexam")
const Studentusers = require("../models/Studentusers")
const Requirements = require("../models/Requirements")
const Ticketusers = require("../models/Ticketusers")
const Studentuserdetails = require("../models/Studentuserdetails")


exports.entranceexamstatus = async (req, res) => {
    const { id } = req.user

    const entranceexam = await Entranceexam.findOne({ owner: new mongoose.Types.ObjectId(id)})
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while fetching entrance exam status for user ${id}. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please try again later."})
    })

    if(!entranceexam){
        return res.status(400).json({ message: "failed", data: "You have not yet selected a schedule."})
    }

    if(entranceexam.status === 'passed'){
        
    }

    const data = {
        id: entranceexam._id,
        status: entranceexam.status,
        score: entranceexam.score
    }

    return res.status(200).json({ message: "success", data: data })
}

exports.setentranceexamstatus = async (req, res) => {
    const { ticketid, status, score } = req.query

    if(!ticketid || !status || !score){
        return res.status(400).json({ message: "failed", data: "Please input ticketid, status and score"})
    }

    const check = await Studentusers.findOne({ ticketid: new mongoose.Types.ObjectId(ticketid)})
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while checking if ticket user already passed. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details."})
    })
    if(check){
        return res.status(400).json({ message: "failed", data: "User has already been passed and has an account."})
    }
    
    await Entranceexam.findOneAndUpdate(
        { owner: new mongoose.Types.ObjectId(ticketid) },
        { $set: { status: status, score: parseInt(score) }} 
    )
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while updating entrance exam for ticket user ${ticketid}. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please try again later."})
    })


    if(status === 'passed'){

        const ticketuser = await Ticketusers.findOne({ _id: new mongoose.Types.ObjectId(ticketid) })
        .then(data => data)
        .catch(err => {
            console.log(`There's an error encountered while fetching ticket user in entrance exam status passed. Error: ${err}`)
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details."})
        });

        const requirementsdata = await Requirements.findOne({ _id: new mongoose.Types.ObjectId(ticketuser.requirements)})
       const student = await Studentusers.create({
            ticketid: new mongoose.Types.ObjectId(ticketid),
            username: `AAA`,
            password: "temp123",
            webtoken: ""
        })
        .then(async data => {
            await Studentuserdetails.create({
                owner: data._id,
                level: new mongoose.Types.ObjectId(requirementsdata.level),
                program: new mongoose.Types.ObjectId(requirementsdata.program),
                firstname: requirementsdata.firstname,
                middlename: requirementsdata.middlename || "",
                lastname: requirementsdata.lastname,
                gender: requirementsdata.gender,
                phonenumber: requirementsdata.phonenumber,
                religion: requirementsdata.religion,
                civilstatus: requirementsdata.civilstatus,
                tor: requirementsdata.tor,
                telephonenumber: requirementsdata.telephonenumber,
                guardian: {
                    firstname: requirementsdata.guardian.firstname,
                    lastname: requirementsdata.guardian.lastname,
                    contact: requirementsdata.guardian.contact,
                },
                mother: {
                    firstname: requirementsdata.mother.firstname,
                    maidenname: requirementsdata.mother.maidenname,
                    contact: requirementsdata.mother.contact,
                },
                father: {
                    firstname: requirementsdata.father.firstname,
                    lastname: requirementsdata.father.lastname,
                    contact: requirementsdata.father.contact,
                },
                form137: requirementsdata.form137,
                birthcertificate: requirementsdata.birthcertificate,
                // dateofbirth: "",
                address: requirementsdata.address,
                email: requirementsdata.email,
                contact: requirementsdata.contact,
                profilepicture: ""
            })
            .catch(err => {
                console.log(`There's a problem encountered while creating student user details. Error: ${err}`)
                return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please try again later."})
            })
            return res.status(200).json({ message: "success" })
        })
        .catch(err => {
            console.log(`There's an error encoutered while creating student user for ticket user ${ticketid}. Error: ${err}`)
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please try again later."})
        })
    } else {
        return res.status(200).json({ message: "success" })
    }
}

exports.getentranceexamstatus = async (req, res) => {
    const { page, limit, search, filter } = req.query

    const pageOptions = {
        page: parseInt(page) || 0,
        limit: parseInt(limit) || 10
    }

    let searchMatchStage = {};
    let filterMatchStage = {};

    if(search){
        searchMatchStage = {
            $or: [
                { username: { $regex: search, $options: 'i' }},
                { "details.email": { $regex: search, $options: 'i' } }
            ]
        };

    }

    if(filter === 'pending' || filter === 'failed' || filter === 'passed'){
        filterMatchStage = {
            status: filter,
        }
    }

    const matchCondition = [
        {
            $lookup: {
                from: "ticketusers", 
                localField: "owner",
                foreignField: "_id",
                as: "ticketuserDetails",
            },
        },
        {
            $lookup: {
                from: "examschedules", 
                localField: "schedule",
                foreignField: "_id",
                as: "scheduleDetails",
            },
        },
        {
            $lookup: {
                from: "requirements", // Lookup associated requirements
                localField: "ticketuserDetails.requirements",
                foreignField: "_id",
                as: "requirementsDetails",
            },
        },
        {
            $unwind: {
                path: "$ticketuserDetails",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $unwind: {
                path: "$scheduleDetails",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $unwind: {
                path: "$requirementsDetails",
                preserveNullAndEmptyArrays: true,
            },
        },
        ...(search
            ? [
                  {
                      $match: {
                          $or: [
                              { "ticketuserDetails.username": { $regex: search, $options: "i" } },
                              { "requirementsDetails.email": { $regex: search, $options: "i" } },
                              { "requirementsDetails.lastname": { $regex: search, $options: "i" } },
                              { "requirementsDetails.firstname": { $regex: search, $options: "i" } },
                          ],
                      },
                  },
              ]
            : []),
            ...(filter ? [ { $match: filterMatchStage }]: []),
        {
            $project: {
                _id: 1,
                owner: "$ticketuserDetails._id",
                username: "$ticketuserDetails.username",
                status: 1,
                score: 1,
                scheduleid: "$scheduleDetails._id",
                starttime: "$scheduleDetails.starttime",
                endtime: "$scheduleDetails.endtime",
                date: "$scheduleDetails.date",
                requirements: {
                    fullname: {
                        $concat: [
                            "$requirementsDetails.firstname",
                            " ",
                            "$requirementsDetails.middlename",
                            " ",
                            "$requirementsDetails.lastname"
                        ],
                    },
                    email: "$requirementsDetails.email",
                    address: "$requirementsDetails.address",
                    gender: "$requirementsDetails.gender",
                },
            },            
        },
        {
            $skip: pageOptions.page * pageOptions.limit,
        },
        {
            $limit: pageOptions.limit,
        },
    ];

    const entranceexam = await Entranceexam.aggregate(matchCondition)
    const totalTakers = await Entranceexam.countDocuments(matchCondition)
  
    const finalpages = Math.ceil(totalTakers / pageOptions.limit)


    const finaldata = []

    await entranceexam.forEach(temp =>{
        const { _id, status, score, owner, username, scheduleid, requirements, starttime, endtime, date } = temp

            finaldata.push({
                id: _id,
                ticketid: owner,
                username: username,
                examstatus: status,
                examscore: score,
                fullname: requirements.fullname,
                gender: requirements.gender,
                email: requirements.email,
                address: requirements.address,
                schedule: {
                    scheduleid: scheduleid,
                    starttime: starttime,
                    endtime: endtime,
                    date: date
                }
            })
    })

    const data = {
        "totalPages": finalpages,
        "data": finaldata,
    }


    return res.json({ message: "success", data: data});

}

