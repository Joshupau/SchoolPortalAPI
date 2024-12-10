const { default: mongoose } = require("mongoose")
const Examschedule = require("../models/Examschedule")
const Schoolyear = require("../models/Schoolyear")
const Ticketusers = require("../models/Ticketusers")
const Requirements = require("../models/Requirements")
const Entranceexam = require("../models/Entranceexam")


exports.CreateExamSchedule = async (req, res) => {
    const { starttime, endtime, date } = req.body

    if(!starttime || !endtime || !date){
        return res.status(400).json({ message: "failed", data: "Please input start time, end time and date"})
    }

    const currentschoolyear = await Schoolyear.findOne({ currentstatus: "current" })
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem while fetching the current school year for exam schedule. Error: ${err}`)
        return res.status(400).json({ message: "failed", data: "There's a problem with the server. Please try again later."})
    })

    if(!currentschoolyear){
        return res.status(400).json({ message: "failed", data: "There's no existing school year."})
    }

    const isExisting = await Examschedule.findOne({
        starttime,
        endtime,
        date,
        schoolyear: currentschoolyear._id
    })

    if(!isExisting){
        return res.status(400).json({ message: "failed", data: "There's already a schedule created at the same time and at the same day."})
    }

    await Examschedule.create({
        starttime: starttime,
        endtime: endtime,
        date: date,
        schoolyear: currentschoolyear._id
    })
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem while creating exam schedule. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details."})
    })

    return res.status(200).json({ message: "success" })
}

exports.EditExamSchedule = async (req, res) => {
    const { examid, starttime, endtime, date } = req.body

    if(!starttime || !endtime || !date || !examid){
        return res.status(400).json({ message: "failed", data: "Please input start time, end time and date"})
    }
    await Examschedule.findOneAndUpdate(
        {
            _id: new mongoose.Types.ObjectId(examid)
        },
        { 
            $set: {
                starttime: starttime,
                endtime: endtime,
                date: date,
            }
        }
    )
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem while creating exam schedule. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details."})
    })

    return res.status(200).json({ message: "success" })
}

exports.getExamSchedules = async (req, res) => {
    const { page, limit } = req.query

    const pageOptions = {
        page: parseInt(page) || 0,
        limit: parseInt(limit) || 10
    }
    const matchCondition = [
        {
            $lookup: {
                from: "schoolyears", 
                localField: "schoolyear",
                foreignField: "_id",
                as: "schoolyearDetails"
            }
        },
        {
            $lookup: {
                from: "ticketusers", 
                localField: "examtakers.ticketuser",
                foreignField: "_id",
                as: "examtakerDetails"
            }
        },
        {
            $project: {
                starttime: 1,
                endtime: 1,
                date: 1,
                schoolyear: 1,
                schoolyearDetails: 1, 
                _id: 1,
                examtakers: 1,
                examtakerDetails: 1 
            },
        },
        {
            $skip: pageOptions.page * pageOptions.limit, 
        },
        {
            $limit: pageOptions.limit,
        },
    ];
    

    const examSchedulesData = await Examschedule.aggregate(matchCondition)
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem while fetching requirements data. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details."})
    })

    const totalDocuments = await Examschedule.countDocuments(matchCondition)

    
    const totalPages = Math.ceil(totalDocuments / pageOptions.limit)
    
    const finaldata = {
        totalPages: totalPages,
        data: []
    }

    examSchedulesData.forEach(temp => {
        const { _id, starttime, endtime, date, examtakers, schoolyearDetails, examtakerDetails} = temp
        
        const examdetails = []

        examtakerDetails.forEach(data => {
            examdetails.push({
                id: data._id
            })
        })
        finaldata.data.push({
            id: _id,
            starttime: starttime,
            endtime: endtime,
            date: date,
            schoolyear: {
                startyear: schoolyearDetails[0].startyear,
                endyear: schoolyearDetails[0].endyear
            },
            examtakers: examdetails
        })
    
    })

    return res.status(200).json({ message: "success", data: finaldata})

}

exports.selectExamSchedules = async (req, res) => {
    const { id } = req.user
    const { examid } = req.query

    if(!id){
        return res.status(400).json({ message: "failed", data: "You are unauthorized! Please login to the right account! "})
    }    
    if(!examid){
        return res.status(400).json({ message: "failed", data: "Please select Exam Schedule."})
    }

    const Ticketuser = await Ticketusers.findOne({ _id: new mongoose.Types.ObjectId(id)})
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while checking for using requirements. Error: ${err} `)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with your account. Please contact support for more details." })
    })
    
    const isApproved = await Requirements.findOne({ _id: new mongoose.Types.ObjectId(Ticketuser.requirements)})

    if(isApproved.status === 'denied'){
        return res.status(400).json({ message: "failed", data: "Ticket user requirements has been denied. Please check why your application is denied."})
    }  
    if(isApproved.status !== 'approved'){
        return res.status(400).json({ message: "failed", data: "Ticket user requirements has not yet been approved."})
    }
    const existingExam = await Examschedule.findOne({
        "examtakers.ticketuser": new mongoose.Types.ObjectId(id),
    });

    if (existingExam) {
        return res
            .status(400)
            .json({ message: "failed", data: "You have already selected an exam schedule." });
    }
    
   await Examschedule.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(examid) },
        { $push: { examtakers: { ticketuser: new mongoose.Types.ObjectId(id) } } } // Push the user ID to examtakers
        )
        .then(data => data)
        .catch((err) => {
            console.error(`Error updating Examschedule for exam ${examid}. Error: ${err}`);
            return res.status(400).json({ 
                message: "bad-request1", 
                data: "There's a problem with the server. Please contact support for more details" 
            });
        });
    
        await Entranceexam.create({ owner: new mongoose.Types.ObjectId(id), schedule: new mongoose.Types.ObjectId(examid) })
        .catch(async err => {
            await Examschedule.findOneAndUpdate(
                { id: new mongoose.Types.ObjectId(examid) },
                { $pull: { examtakers: { ticketuser: new mongoose.Types.ObjectId(id) } } }
            ).catch(pullErr => {
                console.error(`Failed to remove ticket user ${id} from examtakers. Error: ${pullErr}`);
            });

            return res.status(400).json({ 
                message: "bad-request2", 
                data: "There's a problem with the server. Please contact support for more details" 
            });
        });

    return res.status(200).json({ message: "success" });
    
}

exports.deleteSchedule = async (req, res) => {
    const { examid } = req.query

    if(!examid){
        return res.status(400).json({ message: "failed", data: "Please input exam ID."})
    }

    await Examschedule.findOneAndDelete({ _id: new mongoose.Types.ObjectId(examid)})
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered when trying to delete schedule. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details."})
    })

    return res.status(200).json({ message: "success" })
}


exports.getSelectedExamSchedule = async (req, res) => {
    const { id, username } = req.user

    const examData = await Ticketusers.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(id), 
            },
        },
        {
            $lookup: {
                from: "examschedules",
                localField: "_id",
                foreignField: "examtakers.ticketuser",
                as: "examSchedules",
            },
        },
        {
            $lookup: {
                from: "requirements",
                localField: "requirements",
                foreignField: "_id", 
                as: "requirements"
            }
        },
        {
            $unwind: {
                path: "$requirements",
                preserveNullAndEmptyArrays: true,
            }
        },
        {
            $unwind: {
                path: "$examSchedules",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $project: {
                _id: 1,
                username: 1,
                examstart: "$examSchedules.starttime",
                examend: "$examSchedules.endtime",
                date: "$examSchedules.date",
                fullname: {
                    $concat: [
                        "$requirements.firstname",
                        " ",
                        "$requirements.middlename",
                        " ",
                        "$requirements.lastname"
                    ]
                }
            }
        }
    ])
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while fetching ticket user exam schedule of user ${username}. Error: ${err}`)
        return res.status(400).json({ message: "success", data: "There's a problem with your account. Please contact admin for more details."})
    })


    return res.status(200).json({ message: "success", data: examData})
}