const { default: mongoose } = require("mongoose")
const Schedule = require("../models/Schedule")
const Schoolyear = require("../models/Schoolyear")
const Subject = require("../models/Subject")


exports.createSubject = async (req, res) => {

    const { name, level } = req.body

    if(!name || !level){
        return res.status(400).json({ message: "failed", data: "Please input subject name."})
    }


    await Subject.create({
        name: name,
        level: new mongoose.Types.ObjectId(level)
    })
    .then(async data => data)
    .catch(err => {
        console.log(`There's a problem encountred when creating subject. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details."})
    })
    return res.status(200).json({ message: "success"})
}

exports.getSubjects = async (req, res) => {
    const { page, limit, search, status } = req.query

    const pageOptions = {
        page: parseInt(page) || 0,
        limit: parseInt(limit) || 10,
    }

    const matchconditionpipeline = [
        ...(search
            ? [
                  {
                      $match: {
                          $or: [
                              { "name": { $regex: search, $options: "i" } },
                          ],
                      },
                  },
              ]
            : []),
        ...(status ? [ { $match: { status: status } }]: []),
        {
            $skip: pageOptions.page * pageOptions.limit   
        },
        {
            $limit: pageOptions.limit
        }
    ]

    const subjectDetails = await Subject.aggregate(matchconditionpipeline)
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while aggregating Subject details. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details."})
    })

    const totalDocuments = await Subject.countDocuments(matchconditionpipeline)
        .then(data => data) 
        .catch(err => {
            console.log(`Error counting documents: ${err}`);
            return res.status(400).json({
                message: "bad-request",
                data: "There's a problem with the server. Please contact support for more details.",
            });
        });

    const totalPages = Math.ceil(totalDocuments / pageOptions.limit)
    
    const finaldata = {
        totalPages: totalPages,
        data: []
    }
    subjectDetails.forEach(temp => {
        finaldata.data.push({
            id: temp._id,
            name: temp.name,
            status: temp.status,
            createdAt: temp.createdAt
        })
    })

    return res.status(200).json({ message: "success", data: finaldata})
}

exports.editsubjects = async (req, res) => {
    const { name, id } = req.query

    if(!id){
        return res.status(400).json({ message: "failed", data: "Please select subject"})
    }

    const isExisting = await Subject.findOne({ name: { $regex: `^${name}$`, $options: 'i' } })
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while searching for existing subject. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details."})
    })

    if(isExisting){
        return res.status(400).json({ message: "failed", data: "Subject name already exists."})
    }

    await Subject.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(id) }, { $set: { name: name }})
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while updating subject ${id}. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details."})
    })

    return res.status(200).json({ message: "success" })

}

exports.deletesubjects = async (req, res) => {
    const { id } = req.query

    if(!id){
        return res.status(400).json({ message: "failed", data: "Please select subject"})
    }

    await Subject.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(id) }, { $set: { status: "inactive" }})
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while deleting subject ${id}. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details."})
    })

    return res.status(200).json({ message: "success" })

}