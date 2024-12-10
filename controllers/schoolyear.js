const { default: mongoose } = require("mongoose")
const Schoolyear = require("../models/Schoolyear")
const Ticketusers = require("../models/Ticketusers")
const Schedule = require("../models/Schedule")
const Requirements = require("../models/Requirements")

exports.createschoolyear = async (req, res) => {
    const { id } = req.user
    const { startyear, endyear } = req.body

    if(!startyear || !endyear){
        return res.status(400).json({ message: "failed", data: "Please input start year and end year"})
    }

    const isExisting = await Schoolyear.findOne({ startyear: parseInt(startyear), endyear: parseInt(endyear) });

    if (isExisting) {
        return res.status(400).json({
            message: "failed",
            data: "School year already exists",
        });
    }
    await Schoolyear.create({
        owner: new mongoose.Types.ObjectId(id),
        startyear: startyear,
        endyear: endyear,
        currentstatus: "inactive"
    })
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem while creating school year. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details."})
    })

    return res.status(200).json({ message: "success" })
}

exports.getSchoolYear = async (req, res) => {

    const { page, limit } = req.query
    const pageOptions = {
        page: parseInt(page) || 0,
        limit: parseInt(limit) || 10
    }

    const schoolyeardata = await Schoolyear.find()
    .skip(pageOptions.page * pageOptions.limit)
    .limit(pageOptions.limit)
    .sort({ createdAt: -1 })  
    .then(data => data)
    .catch(err => {
      console.log(`There's a problem while fetching school year. Error: ${err}`);
      return res.status(400).json({
        message: "bad-request",
        data: "There's a problem with the server. Please contact support for more details."
      });
    });

    const totalDocuments = await Schoolyear.countDocuments();

    const totalPages = Math.ceil(totalDocuments / pageOptions.limit);

    const data = {
        totalpages: totalPages,
        data: schoolyeardata
    }

    return res.status(200).json({ message: "success", data: data})
}

exports.getCurrentSchoolYear = async (req, res) => {

    const schoolyeardata = await Schoolyear.findOne({ currentstatus: "current"})
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem while fetching school year. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details."})
    })

    return res.status(200).json({ message: "success", data: schoolyeardata})
}



exports.setCurrentSchoolYear = async (req, res) => {
    const { id } = req.query

    await Ticketusers.deleteMany()
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while deleting ticket users. Error ${err}`)
        return res.status(400).json({ message: "bad-request",  data: "There's a problem with the server. Please try again later."})
    })

    await Schedule.updateMany({}, { $set: { status: "inactive" } })
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while updating status of schedule in current school year. Error ${err}`)
        return res.status(400).json({ message: "bad-request",  data: "There's a problem with the server. Please try again later."})
    })

    await Requirements.deleteMany()
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while deleting requirements. Error ${err}`)
        return res.status(400).json({ message: "bad-request",  data: "There's a problem with the server. Please try again later."})
    })

    await Schoolyear.findOneAndUpdate(
        { currentstatus: "current" },
        { $set: { currentstatus: "inactive" } },
        { new: true } 
    )
    .catch(err => {
        console.log(`There's a problem while updating the previous school year to inactive. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details."})
    })

    await Schoolyear.findByIdAndUpdate(
            id,
            { $set: { currentstatus: "current" } },
            { new: true } 
        )
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem while updating the new current school year. Error ${err}`)
            return res.status(404).json({ message: "failed", data: "School year with the provided ID not found." });
        })

    return res.status(200).json({ message: "success" })
}
