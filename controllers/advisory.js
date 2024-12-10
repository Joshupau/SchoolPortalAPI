const { default: mongoose } = require("mongoose")
const Advisory = require("../models/Advisory")
const Staffusers = require("../models/Staffusers")

exports.createAdvisory = async (req, res) => {
    const { program, gradelevel, section, teacher } = req.body

    if(!program || !gradelevel || !section || !teacher ) {
        return res.status(400).json({ message: "failed", data: "Please select a program, grade level, section and teacher."})
    }

    const checkrole = await Staffusers.findOne({ _id: new mongoose.Types.ObjectId(teacher) })
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while checking teacher role. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details."})
    })

    if (checkrole.auth !== 'adviser') {
        return res.status(400).json({
            message: "failed",
            data: "Teacher role is not an advisor."
        });
    }

    const checkTeacher = await Advisory.findOne({
        teacher:  new mongoose.Types.ObjectId(teacher)
    })
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while checking if teacher already has advisory. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please try again later."})
    })

    if (checkTeacher) {
        return res.status(400).json({
            message: "failed",
            data: "The teacher already has an advisory."
        });
    }


    const checkSection = await Advisory.findOne({ section: new mongoose.Types.ObjectId(section) })
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while checking if teacher already has advisory. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please try again later."})
    })
    if (checkSection) {
        return res.status(400).json({
            message: "failed",
            data: "The section already has an advisory."
        });
    } 

    await Advisory.create({
        program: new mongoose.Types.ObjectId(program),
        level:  new mongoose.Types.ObjectId(gradelevel),
        section:  new mongoose.Types.ObjectId(section),
        teacher:  new mongoose.Types.ObjectId(teacher)
    })
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while creating advisory. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details."})
    })

    return res.status(200).json({ message: "success" } )
}

exports.getAdvisory = async (req, res) => {

    const { page, limit, filter, search, status = "active" } = req.query

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
            ]
        };

    }

    const validFilters = [
        "Pre-Nursery", "Nursery", "Pre-kindergarten", "Kindergarten 1", "Kindergarten 2",
        "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6",
        "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12",
        "Pre-school", "Elementary", "Junior High-School", "Senior High-School"
    ];
    
    if (validFilters.includes(filter)) {
        filterMatchStage = {
            $or: [
                { "programdetails.name": { $regex: filter, $options: "i" } },
                { "gradeleveldetails.level": { $regex: filter, $options: "i" } },
            ],
        };
    }
    


    const matchConditionPipeline = [
        {
            $lookup: {
                from: "gradelevels",
                localField: "level",
                foreignField: "_id",
                as: "gradeleveldetails",
            },
        },
        {
            $unwind: {
                path: "$gradeleveldetails",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $lookup: {
                from: "programs",
                localField: "program",
                foreignField: "_id",
                as: "programdetails",
            },
        },
        {
            $unwind: {
                path: "$programdetails",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $lookup: {
                from: "sections",
                localField: "section",
                foreignField: "_id",
                as: "sectiondetails",
            },
        },
        {
            $unwind: {
                path: "$sectiondetails",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $lookup: {
                from: "staffusers",
                localField: "teacher", // Assuming this is the reference to the teacher's _id
                foreignField: "_id",
                as: "teacherdetails",
            },
        },
        {
            $unwind: {
                path: "$teacherdetails",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $lookup: {
                from: "staffuserdetails",
                localField: "teacherdetails._id",
                foreignField: "owner", 
                as: "staffuserdetails",
            },
        },
        {
            $unwind: {
                path: "$staffuserdetails",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $addFields: {
                "staffuserdetails.fullName": {
                    $trim: {
                        input: {
                            $concat: [
                                { $ifNull: ["$staffuserdetails.firstname", ""] },
                                " ",
                                { $ifNull: ["$staffuserdetails.middlename", ""] },
                                " ",
                                { $ifNull: ["$staffuserdetails.lastname", ""] },
                            ],
                        },
                    },
                },
            },
        },
        ...(search
            ? [
                  {
                      $match: {
                          $or: [
                              { "teacherdetails.username": { $regex: search, $options: "i" } },
                              { "staffuserdetails.fullName": { $regex: search, $options: "i" } }, // Search by full name
                          ],
                      },
                  },
              ]
            : []),
        ...(status ? [ { $match: { status: status }}]: []),
        ...(filter ? [{ $match: filterMatchStage }] : []),
        {
            $project: {
                name: 1,
                status: 1,
                students: 1,
                sectionname: "$sectiondetails.name",
                gradelevel: "$gradeleveldetails.level",
                program: "$programdetails.name",
                teacher: {
                    username: "$teacherdetails.username",
                    email: "$staffuserdetails.email",
                    fullName: "$staffuserdetails.fullName", 
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
    
    const advisoryDetails = await Advisory.aggregate(matchConditionPipeline)
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while aggregating Advisory details. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details."})
    })

    const countPipeline = [...matchConditionPipeline];

    const irrelevantStages = ["$project", "$skip", "$limit"];
    const cleanedPipeline = countPipeline.filter(stage => {
        const key = Object.keys(stage)[0];
        return !irrelevantStages.includes(key);
    });

    cleanedPipeline.push({ $count: "total" });

    const totalDocuments = await Advisory.aggregate(cleanedPipeline)
        .then(data => (data.length > 0 ? data[0].total : 0)) // Extract total count
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

    advisoryDetails.forEach(temp => {
        finaldata.data.push({
            id: temp._id,
            teacherusername: temp.teacher.username,
            teacheremail: temp.teacher.email,
            teacherfullname: temp.teacher.fullname,
            sectionname: temp.sectionname,
            gradelevel: temp.gradelevel,
            program: temp.program
        })
    })

    return res.status(200).json({ message: "success", data: finaldata})

}

exports.editAdvisoryTeacher = async (req, res) => {
    const { id, teacher } = req.body

    if(!teacher || !id){
        return res.status(400).json({ message: "failed", data: "Please select Advisory and Teacher."})
    }

    const checkTeacher = await Advisory.findOne({
        teacher:  new mongoose.Types.ObjectId(teacher)
    })
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while checking if teacher already has advisory. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please try again later."})
    })

    if (checkTeacher) {
        return res.status(400).json({
            message: "failed",
            data: "The teacher already has an advisory."
        });
    }

    await Advisory.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(id) }, { $set: { teacher: new mongoose.Types.ObjectId(teacher)}})
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered when editing advisory teacher. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details."})
    })

    return res.status(200).json({ message: "success" } )


}

exports.deleteAdvisory = async (req, res) => {
    const { id, status } = req.query

    if(!id || !status){
        return res.status(400).json({ message: "failed", data: "Please input advisory ID and status."})
    }

    await Advisory.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(id)}, { $set: { status: status } } )
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while deleting advisory. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details."})
    })

    return res.status(200).json({ message: "success" })
}