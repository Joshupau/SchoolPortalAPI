const { default: mongoose } = require("mongoose")
const Schoolyear = require("../models/Schoolyear")
const Section = require("../models/Section")
const Gradelevel = require("../models/gradelevel")
const Studentuserdetails = require("../models/Studentuserdetails")
const Schedule = require("../models/Schedule")
const Subjectgrade = require("../models/Subjectgrade")
const GradingPeriod = require("../models/Gradingperiod")


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


// #region STUDENTS

exports.selectSection = async (req, res) => {
    const { id } = req.user

    const { sectionid } = req.body

    if(!sectionid){
        return res.status(400).json({ message: "failed", data: "Please select a section."})
    }

    const studentinfo = await Studentuserdetails.findOne({ owner: new mongoose.Types.ObjectId(id)})
    .catch(err => {
        console.log(`There's a problem encountered while fetching student user info in select section. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details."})
    })

    if(!studentinfo){
        return res.status(400).json({ message: "failed", data: "Student details not found." });
    }

    if(studentinfo.section){
        return res.status(400).json({ message: "failed", data: "Student already has a section." });
    }

    const section = await Section.findOne({ _id: new mongoose.Types.ObjectId(sectionid)}).populate("students");

    if (!section) {
        return res.status(404).json({ message: "failed", data: "Section not found." });
    }

    const maleCount = await Studentuserdetails.countDocuments({
        _id: { $in: section.students },
        gender: "male",
    });

    const femaleCount = await Studentuserdetails.countDocuments({
        _id: { $in: section.students },
        gender: "female",
    });

    const studentGender = studentinfo.gender.toLowerCase();

    if ((studentGender === "male" && maleCount >= 15) || (studentGender === "female" && femaleCount >= 15)) {
        return res.status(400).json({ message: "failed", data: "Selected section is full for your gender." });
    }

    if(section.students.length >= 30){
        return res.status(400).json({ message: "failed", data: "Selected section is full." });
    }

    section.students.push(new mongoose.Types.ObjectId(id));


    
    await section.save().catch(err =>{
        console.log(`There's a problem encountered while selecting section. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details"})
    })

    studentinfo.section = new mongoose.Types.ObjectId(sectionid);
    await studentinfo.save().catch(err =>{
        console.log(`There's a problem encountered while selecting section. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details"})
    })

    return res.status(200).json({ message: "success" })
}


// #endregion


exports.getstudentlistbysubjectsection = async (req, res) => {
    const { subjectid, sectionid } = req.query

    if (!subjectid || !sectionid) {
        return res.status(400).json({ error: "Subject ID and Section ID are required." });
    }

    const data = await Schedule.aggregate([
        {
            $match: { 
                section: new mongoose.Types.ObjectId(sectionid), 
                subject: new mongoose.Types.ObjectId(subjectid)
            }
        },
        {
            $lookup: {
                from: "sections",
                localField: "section",
                foreignField: "_id",
                as: "Sectiondetails"
            }
        },
        {
            $unwind: "$Sectiondetails" 
        },
        {
            $lookup: {
                from: "studentuserdetails",
                localField: "Sectiondetails.students",
                foreignField: "owner",
                as: "Studentuserdetails"
            }
        },
        {
            $unwind: "$Studentuserdetails"
        }
    ]);

    console.log(data);



    return res.status(200).json(data);
}



exports.sectionlistofteacher = async (req, res) => {

    const { id, username } = req.user

    const data = await Schedule.aggregate([
        {
            $match: { 
                teacher: new mongoose.Types.ObjectId(id),
            },
        },
        {
            $lookup: {
                from: "sections",
                localField: "section",
                foreignField: "_id",
                as: "Sectiondetails",
            },
        },
        {
            $unwind: "$Sectiondetails",
        },
        {
            $lookup: {
                from: "gradelevels", 
                localField: "Sectiondetails.gradelevel", 
                foreignField: "_id", 
                as: "gleveldetails",
            },
        },
        {
            $unwind: "$gleveldetails",
        },
        {
            $project: {
                _id: 0, 
                sectionid: "$Sectiondetails._id",
                sectionName: "$Sectiondetails.name", 
                gradeLevelName: "$gleveldetails.level",
            },
        },
    ])
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while fetching section list of teacher: ${username}. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details."})
    })
    
    return res.status(200).json({ message: "success", data: data})

}


exports.studentlistbysectionid = async (req, res) => {
    const { id } = req.user

    const { page, limit, search, sectionid } = req.query

    const pageOptions = {
        page: parseInt(page) || 0,
        limit: parseInt(limit) || 10,
    }

    let searchMatchStage = {};
    
    if (search) {
        searchMatchStage = {
            $or: [
                { "SUDetails.email": { $regex: search, $options: 'i' } },
                { "SUDetails.lastname": { $regex: search, $options: 'i' } },
                { "SUDetails.firstname": { $regex: search, $options: 'i' } },
            ],
        };
    }

    const aggregationpipeline = [
        {
            $match: { 
                _id: new mongoose.Types.ObjectId(sectionid),
               

            },
        },
        {
            $lookup: {
                from: "studentuserdetails",
                localField: "students",
                foreignField: "owner",
                as: "SUDetails"
            }
        },
        ...(search ? [{ $match: searchMatchStage }] : []),
        {
            $unwind: {
                path: "$SUDetails",
                preserveNullAndEmptyArrays: true,
            },        
        },
        {
            $skip: pageOptions.page * pageOptions.limit,
        },
        {
            $limit: pageOptions.limit,
        },
    ]

    const newdata = await Section.aggregate(aggregationpipeline)
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while fetching student list by section id. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details"})
    });

    const totalDocuments = await Section.countDocuments(aggregationpipeline)
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while counting student list by section id. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details"})
    });

    if(!newdata.length > 0){
        return res.status(400).json({ message: "failed", data: "Section data not found."})
    }

    const totalpages = Math.ceil(totalDocuments / pageOptions.limit)

    const finaldata = {
        totalpages, 
        students: [],
        section: [],
    }

    newdata.forEach(temp => {
        finaldata.section.push({
            id: temp._id,
            name: temp.name,
            status: temp.status,
        })

        if(!temp.SUDetails.length > 1){
            temp.SUDetails.forEach(student => {
                finaldata.students.push({
                    id: temp.SUDetails._id,
                    fullname: `${student.firstname} ${student.lastname}`,
                    gender: student.gender,
                    email: student.email
                })
            })
        } else if (temp.SUDetails) {
            finaldata.students.push({
                id: temp.SUDetails.owner,
                fullname: `${temp.SUDetails.firstname} ${temp.SUDetails.lastname}`,
                gender: temp.SUDetails.gender,
                email: temp.SUDetails.email
            })
        } else {
            return
        }
    })

    return res.status(200).json({ message: "success", data: finaldata})
}

exports.studentlistbysectionidteacher = async (req, res) => {
    const { id } = req.user

    const { page, limit, search, sectionid, subjectid } = req.query

    const pageOptions = {
        page: parseInt(page) || 0,
        limit: parseInt(limit) || 10,
    }

    let searchMatchStage = {};
    
    if (search) {
        searchMatchStage = {
            $or: [
                { "SUDetails.email": { $regex: search, $options: 'i' } },
                { "SUDetails.lastname": { $regex: search, $options: 'i' } },
                { "SUDetails.firstname": { $regex: search, $options: 'i' } },
            ],
        };
    }

    const aggregationpipeline = [
        {
            $match: { 
                _id: new mongoose.Types.ObjectId(sectionid),
                subjects: { $in: [new mongoose.Types.ObjectId(subjectid)] }

            },
        },
        {
            $lookup: {
                from: "studentuserdetails",
                localField: "students",
                foreignField: "owner",
                as: "SUDetails"
            }
        },
        ...(search ? [{ $match: searchMatchStage }] : []),
        {
            $unwind: {
                path: "$SUDetails",
                preserveNullAndEmptyArrays: true,
            },        
        },
        {
            $skip: pageOptions.page * pageOptions.limit,
        },
        {
            $limit: pageOptions.limit,
        },
    ]

    const newdata = await Section.aggregate(aggregationpipeline)
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while fetching student list by section id. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details"})
    });

    const totalDocuments = await Section.countDocuments(aggregationpipeline)
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while counting student list by section id. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details"})
    });

    if(!newdata.length > 0){
        return res.status(400).json({ message: "failed", data: "Section data not found."})
    }

    const totalpages = Math.ceil(totalDocuments / pageOptions.limit)

    const finaldata = {
        totalpages, 
        students: [],
        section: [],
    }

    newdata.forEach(temp => {
        finaldata.section.push({
            id: temp._id,
            name: temp.name,
            status: temp.status,
        })

        if(!temp.SUDetails.length > 1){
            temp.SUDetails.forEach(student => {
                finaldata.students.push({
                    id: temp.SUDetails._id,
                    fullname: `${student.firstname} ${student.lastname}`,
                    gender: student.gender,
                    email: student.email
                })
            })
        } else if (temp.SUDetails) {
            finaldata.students.push({
                id: temp.SUDetails.owner,
                fullname: `${temp.SUDetails.firstname} ${temp.SUDetails.lastname}`,
                gender: temp.SUDetails.gender,
                email: temp.SUDetails.email
            })
        } else {
            return
        }
    })

    return res.status(200).json({ message: "success", data: finaldata})
}


exports.getstudentsubjects = async (req, res) => {
 
    const { studentid } = req.query

    if(!studentid){
        return res.status(400).json({ message: "failed", data: "Please select a student."})
    }

    if (!mongoose.Types.ObjectId.isValid(studentid)) {
        return res.status(400).json({ message: "failed", data: "Invalid Student ID format." });
    }

    const subjectlist = await Section.aggregate([
        {
            $match: { 
                students: new mongoose.Types.ObjectId(studentid) 
            }
        },
        {
            $lookup: {
                from: "subjects", 
                localField: "subjects",
                foreignField: "_id",
                as: "subjectDetails",
            },
        },
        {
            $lookup: {
                from: "schoolyears",
                localField: "schoolyear",
                foreignField: "_id",
                as: "sydetails"
            }
        },
        {
            $lookup: {
                from: "gradelevels",
                localField: "gradelevel",
                foreignField: "_id",
                as: "gleveldetails"
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
                from: "staffuserdetails",
                localField: "adviser.teacher",
                foreignField: "owner",
                as: "advdetails"
            }
        },
        {
            $lookup: {
                from: "subjectgrades",
                let: { 
                    sectionSubjects: "$subjects", 
                    studentId: new mongoose.Types.ObjectId(studentid) 
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $in: ["$subject", "$$sectionSubjects"] }, // Match section's subjects
                                    { $eq: ["$student", "$$studentId"] }      // Match the specific student
                                ]
                            }
                        }
                    },
                    {
                        $project: {
                            subject: 1,
                            quarter: 1,
                            grade: 1,
                            remarks: 1,
                            createdAt: 1,
                            updatedAt: 1,
                        },
                    },
                ],
                as: "studentGrades",
            },
        },
        {
            $lookup: {
                from: "studentuserdetails", 
                let: { studentId: new mongoose.Types.ObjectId(studentid) },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ["$owner", "$$studentId"], 
                            },
                        },
                    },
                    {
                        $project: {
                            _id: 0,
                            firstname: 1,
                            lastname: 1,
                            gender: 1,
                            email: 1,
                            contact: 1,
                            address: 1,
                            profilepicture: 1,
                        },
                    },
                ],
                as: "studentDetails",
            },
        },
        {
            $project: {
                _id: 1,
                sectionName: "$name",
                advdetails: 1,
                sydetails: 1,
                gleveldetails: 1,
                studentGrades: {
                    $map: {
                        input: "$subjectDetails",
                        as: "subject",
                        in: {
                            subject: "$$subject",
                            grades: {
                                $sortArray: {
                                    input: {
                                        $filter: {
                                            input: "$studentGrades",
                                            as: "grade",
                                            cond: { $eq: ["$$grade.subject", "$$subject._id"] },
                                        },
                                    },
                                    sortBy: { quarter: 1 }, // Ascending sort by quarter
                                },
                            },
                        },
                    },
                },
                studentDetails: { $arrayElemAt: ["$studentDetails", 0] },
            },
        }        
    ])
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while fetching student's subjects. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! please contact support for more details."})
    })

    if (!subjectlist || subjectlist.length === 0) {
        return res.status(400).json({ message: "failed", data: "No sections found for the given student." });
    }

    const finaldata = {
        details: [],
        grade: [],
    }

    const { quarter } = await GradingPeriod.findOne()
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while fetching grading period in get student subjects. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact support for more details."})
    })



    subjectlist.forEach(temp => {

        finaldata.details.push({
            studentname: `${temp.studentDetails.firstname} ${temp.studentDetails.lastname}`,
            lvlsection: `${temp.gleveldetails[0].level} - ${temp.sectionName}`,
            adviser: `${temp.advdetails[0].firstname} ${temp.advdetails[0].lastname}`,
            schoolyear: `${temp.sydetails[0].startyear} - ${temp.sydetails[0].endyear}`,
            quarter: quarter
        })

        temp.studentGrades.forEach(data => {
            finaldata.grade.push({
                id: data.subject._id,
                subject: data.subject.name,
                grades: data.grades
            })
        })
    })


    return res.status(200).json({ message: "success", data: finaldata})

    
}

exports.getstudentsubjectsteacher = async (req, res) => {
 
    const { studentid, subjectid } = req.query

    if(!studentid){
        return res.status(400).json({ message: "failed", data: "Please select a student."})
    }

    if (!mongoose.Types.ObjectId.isValid(studentid)) {
        return res.status(400).json({ message: "failed", data: "Invalid Student ID format." });
    }

    const subjectlist = await Section.aggregate([
        {
            $match: { 
                students: new mongoose.Types.ObjectId(studentid),
                subjects: {
                    $filter: {
                        input: "$subjects",
                        as: "subject",
                        cond: { $eq: ["$$subject._id", new mongoose.Types.ObjectId(subjectid)] }
                    }
                }

            }
        },
        {
            $lookup: {
                from: "subjects", 
                localField: "subjects",
                foreignField: "_id",
                as: "subjectDetails",
            },
        },
        {
            $lookup: {
                from: "schoolyears",
                localField: "schoolyear",
                foreignField: "_id",
                as: "sydetails"
            }
        },
        {
            $lookup: {
                from: "gradelevels",
                localField: "gradelevel",
                foreignField: "_id",
                as: "gleveldetails"
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
                from: "staffuserdetails",
                localField: "adviser.teacher",
                foreignField: "owner",
                as: "advdetails"
            }
        },
        {
            $lookup: {
                from: "subjectgrades",
                let: { 
                    sectionSubjects: "$subjects", 
                    studentId: new mongoose.Types.ObjectId(studentid) 
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $in: ["$subject", "$$sectionSubjects"] }, // Match section's subjects
                                    { $eq: ["$student", "$$studentId"] }      // Match the specific student
                                ]
                            }
                        }
                    },
                    {
                        $project: {
                            subject: 1,
                            quarter: 1,
                            grade: 1,
                            remarks: 1,
                            createdAt: 1,
                            updatedAt: 1,
                        },
                    },
                ],
                as: "studentGrades",
            },
        },
        {
            $lookup: {
                from: "studentuserdetails", 
                let: { studentId: new mongoose.Types.ObjectId(studentid) },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ["$owner", "$$studentId"], 
                            },
                        },
                    },
                    {
                        $project: {
                            _id: 0,
                            firstname: 1,
                            lastname: 1,
                            gender: 1,
                            email: 1,
                            contact: 1,
                            address: 1,
                            profilepicture: 1,
                        },
                    },
                ],
                as: "studentDetails",
            },
        },
        {
            $project: {
                _id: 1,
                sectionName: "$name",
                advdetails: 1,
                sydetails: 1,
                gleveldetails: 1,
                studentGrades: {
                    $map: {
                        input: "$subjectDetails",
                        as: "subject",
                        in: {
                            subject: "$$subject",
                            grades: {
                                $sortArray: {
                                    input: {
                                        $filter: {
                                            input: "$studentGrades",
                                            as: "grade",
                                            cond: { $eq: ["$$grade.subject", "$$subject._id"] },
                                        },
                                    },
                                    sortBy: { quarter: 1 }, // Ascending sort by quarter
                                },
                            },
                        },
                    },
                },
                studentDetails: { $arrayElemAt: ["$studentDetails", 0] },
            },
        }        
    ])
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while fetching student's subjects. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! please contact support for more details."})
    })
    

    if (!subjectlist || subjectlist.length === 0) {
        return res.status(400).json({ message: "failed", data: "No sections found for the given student." });
    }

    const finaldata = {
        details: [],
        grade: [],
    }

    const { quarter } = await GradingPeriod.findOne()
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while fetching grading period in get student subjects. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact support for more details."})
    })



    subjectlist.forEach(temp => {

        finaldata.details.push({
            studentname: `${temp.studentDetails.firstname} ${temp.studentDetails.lastname}`,
            lvlsection: `${temp.gleveldetails[0].level} - ${temp.sectionName}`,
            adviser: `${temp.advdetails[0].firstname} ${temp.advdetails[0].lastname}`,
            schoolyear: `${temp.sydetails[0].startyear} - ${temp.sydetails[0].endyear}`,
            quarter: quarter
        })

        temp.studentGrades.forEach(data => {
            finaldata.grade.push({
                id: data.subject._id,
                subject: data.subject.name,
                grades: data.grades
            })
        })
    })


    return res.status(200).json({ message: "success", data: finaldata})

    
}


