const { default: mongoose } = require("mongoose")
const Evaluationresponse = require("../models/Evaluationresponse")
const Schoolyear = require("../models/Schoolyear")



exports.createevaluationresponse = async (req, res) => {

    const { id } = req.user
    const { evaluation, teacher, program, sections } = req.body

    if(!evaluation || !teacher ||  !program, sections) {
        return res.status(400).json({
           message: "failed", data: "All fields are required"
        })
    }

    const schoolyear = await Schoolyear.findOne({ status: "current" })
    .then(data => data)
    .catch(error => {
        console.log(`There was an error encountered while fetching schoolyear. Error: ${error}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact customer support for more details." })
    })

    if(!schoolyear) {
        return res.status(400).json({
            message: "failed", data: "No schoolyear found"
        })
    }

    await Evaluationresponse.create({
        student: new mongoose.Types.ObjectId(id),
        program,
        evaluation,
        sections,
        teacher,
        sections,
        schoolyear: schoolyear._id
    })
    .then(data => data)
    .catch(error => {
        console.log(`There was an error encountered while creating evaluation response. Error: ${error}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact customer support for more details." })
    })

    res.status(200).json({
        message: "success"
    })

}

exports.getevaluationresponse = async (req, res) => {
    const { id } = req.user;
    const { page, limit, search } = req.query;

    const pageOptions = {
        page: parseInt(page) || 0,
        limit: parseInt(limit) || 10,
    };

    const evaluationresponse = await Evaluationresponse.aggregate([
        {
            $lookup: {
                from: "programs",
                localField: "program",
                foreignField: "_id",
                as: "program",
            },
        },
        {
            $unwind: "$program",
        },
        {
            $lookup: {
                from: "schoolyears",
                localField: "schoolyear",
                foreignField: "_id",
                as: "schoolyear",
            },
        },
        {
            $unwind: "$schoolyear",
        },
        {
            $lookup: {
                from: "teacherusers",
                localField: "teacher",
                foreignField: "_id",
                as: "teacher",
            },
        },
        {
            $unwind: "$teacher",
        },
        {
            $lookup: {
                from: "studentusers",
                localField: "student",
                foreignField: "_id",
                as: "student",
            },
        },
        {
            $unwind: "$student",
        },
        {
            $lookup: {
                from: "staffuserdetails",
                localField: "teacher._id",
                foreignField: "owner",
                as: "teacherdetails",
            },
        },
        { $unwind: "$teacherdetails" },
        {
            $lookup: {
                from: "Studentuserdetails",
                localField: "student._id",
                foreignField: "owner",
                as: "studentdetails",
            },
        },
        { $unwind: "$studentdetails" },
        ...(search
            ? [
                  {
                      $match: {
                          $or: [
                              { "program.name": { $regex: search, $options: "i" } }, // Search in program name
                              { "sections.title": { $regex: search, $options: "i" } }, // Search in section title
                          ],
                      },
                  },
              ]
            : []),
        {
            $sort: {
                createdAt: -1,
            },
        },
        {
            $skip: pageOptions.page * pageOptions.limit,
        },
        {
            $limit: pageOptions.limit,
        },
    ]);

    if (!evaluationresponse.length) {
        return res.status(400).json({
            message: "failed",
            data: "No evaluation response found",
        });
    }

    const totalDocuments = await Evaluationresponse.countDocuments(
        search
            ? {
                  $or: [
                      { "program.name": { $regex: search, $options: "i" } },
                      { "sections.title": { $regex: search, $options: "i" } },
                  ],
              }
            : {}
    );

    const totalpages = Math.ceil(totalDocuments / pageOptions.limit);

    const finaldata = {
        totalpages,
        data: [],
    };

    evaluationresponse.forEach((evaluationresponse) => {
        finaldata.data.push({
            id: evaluationresponse._id,
            program: {
                id: evaluationresponse.program._id,
                name: evaluationresponse.program.name,
            },
            schoolyear: {
                id: evaluationresponse.schoolyear._id,
                schoolyear: `${evaluationresponse.schoolyear.startyear} - ${evaluationresponse.schoolyear.endyear}`,
            },
            teacher: evaluationresponse.teacherdetails.firstname + " " + evaluationresponse.teacherdetails.lastname,
            student: evaluationresponse.studentdetails.firstname + " " + evaluationresponse.studentdetails.lastname,
            sections: evaluationresponse.sections,
        });
    });

    res.status(200).json({
        message: "success",
        data: finaldata,
    });
};
