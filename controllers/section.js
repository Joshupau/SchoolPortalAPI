const { default: mongoose } = require("mongoose")
const Schoolyear = require("../models/Schoolyear")
const Section = require("../models/Section")
const Gradelevel = require("../models/gradelevel")


exports.createsection = async (req, res) => {
    const { name, gradelevel, program } = req.body

    if(!name || !gradelevel || !program){
        return res.status(400).json({ message: "failed", data: "Please input section name, grade level and program."})
    }

    const isnameExisting = await Section.findOne({ name: { $regex: `^${name}$`, $options: 'i' } })
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while searching for section name. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details."})
    })
   
    if(isnameExisting){
        return res.status(400).json({ message: "failed", data: "Section name has already been used."})
    }

    const currentSchoolYear = await Schoolyear.findOne({ currentstatus: "current" })
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while searching for current school year. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details."})
    })

    await Section.create({
        name: name,
        gradelevel: new mongoose.Types.ObjectId(gradelevel),
        program: new mongoose.Types.ObjectId(program),
        schoolyear: new mongoose.Types.ObjectId(currentSchoolYear._id)
    })
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while creating section. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details."})
    })

    return res.status(200).json({ message: "success"})

}

exports.getAllSections = async (req, res) => {
    const { page, limit, filter, search, status } = req.query

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
    

    console.log(status)


    const matchCondtionPipeline = [
        ...(status ? [ { $match: { status: status }}]: []),
        {
            $lookup: {
                from: "gradelevels",
                localField: "gradelevel",
                foreignField: "_id",
                as: "gradeleveldetails"
            }
        },
        {
            $lookup: {
                from: "advisories",
                localField: "_id",
                foreignField: "section",
                as: "adviser"
            }
        },
        {
            $lookup: {
                from: "programs",
                localField: "program",
                foreignField: "_id",
                as: "programdetails"
            }
        },
        {
            $lookup: {
                from: "staffuserdetails",
                localField: "adviser.teacher",
                foreignField: "owner",
                as: "teacherdetails"
            }
        },
        {
            $unwind: {
                path: "$gradeleveldetails",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $unwind: {
                path: "$programdetails",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $unwind: {
                path: "$adviser",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $unwind: {
                path: "$teacherdetails",
                preserveNullAndEmptyArrays: true,
            }
        },
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
            ...(filter ? [ { $match: filterMatchStage }]: []),
        {
            $project: {
                name: 1,
                status: 1,
                students: 1,
                gradelevel: "$gradeleveldetails.level",
                program: "$programdetails.name",
                teachername: {
                    $concat: [
                        { $ifNull: ["$teacherdetails.firstname", ""] },
                        " ",
                        { $ifNull: ["$teacherdetails.middlename", ""] },
                        " ",
                        { $ifNull: ["$teacherdetails.lastname", ""] }
                    ]
                }
            }
        },
        {
            $skip: pageOptions.page * pageOptions.limit,
        },
        {
            $limit: pageOptions.limit,
        },
    ]


    const sectionDetails = await Section.aggregate(matchCondtionPipeline)
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while aggregating section details. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details."})
    })

    
    const countPipeline = [...matchCondtionPipeline];

    const irrelevantStages = ["$project", "$skip", "$limit"];
    const cleanedPipeline = countPipeline.filter(stage => {
        const key = Object.keys(stage)[0];
        return !irrelevantStages.includes(key);
    });

    cleanedPipeline.push({ $count: "total" });

    const totalDocuments = await Section.aggregate(cleanedPipeline)
        .then(data => (data.length > 0 ? data[0].total : 0)) 
        .catch(err => {
            console.log(`There's a problem encountered while counting section details. Error: ${err}`);
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


    sectionDetails.forEach(temp => {
        finaldata.data.push({
            id: temp._id,
            name: temp.name,
            status: temp.status,
            gradelevel: temp.gradelevel,
            program: temp.program,
            teachername: temp.teachername,
            students: temp.students
        })
    })

    return res.status(200).json({ message: "success", data: finaldata})
}

exports.editSection = async (req, res) => {
    const { id, name } = req.body


    console.log(id)
    if(!id || !name){
        return res.status(400).json({ message: "failed", data: "Please input new section name and Section ID"})
    }

    const isnameExisting = await Section.findOne({ name: { $regex: `^${name}$`, $options: 'i' } })
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while searching for section name. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details."})
    })
   
    if(isnameExisting){
        return res.status(400).json({ message: "failed", data: "Section name has already been used."})
    }

    await Section.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(id)}, { $set: { name: name }})
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while updating section name. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please try again later."})
    })

    return res.status(200).json({ message: "success" })
}

exports.deleteSection = async (req, res) => {
    const { id, status } = req.query

    if(!id){ 
        return res.status(400).json({ message: "failed", data: "Please input Section ID."})
    }

    await Section.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(id)}, { $set: { status: status }})
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered when trying to deactivate section. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details."})
    })

    return res.status(200).json({ message: "success" })
}

exports.getSectionByGradeLevel = async (req, res) => {
    const { level } = req.query;

    let validLevel = null;
    if (level && level.length === 24 && mongoose.Types.ObjectId.isValid(level)) {
        validLevel = new mongoose.Types.ObjectId(level);
    }

    const query = { status: "active" };
    if (validLevel) {
        query.gradelevel = validLevel;
    }

    const sectionData = await Section.find(query)
        .sort({ name: 1 }) 
        .then(data => data)
        .catch(err => {
            console.log(
                `There's a problem encountered while fetching Section data. Error: ${err}`
            );
            return res.status(400).json({
                message: "bad-request",
                data: "There's a problem with the server. Please contact admin for more details.",
            });
        });

    if (!sectionData || sectionData.length === 0) {
        return res.status(400).json({
            message: "failed",
            data: "No existing section data.",
        });
    }   

    const finalData = sectionData.map((section) => ({
        id: section._id,
        name: section.name,
        program: section.program,
        level: section.gradelevel,
        status: section.status,
    }));

    return res.status(200).json({ message: "success", data: finalData });
};
