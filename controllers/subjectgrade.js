const { default: mongoose } = require("mongoose")
const Subjectgrade = require("../models/Subjectgrade")
const Schedule = require("../models/Schedule")
const Studentuserdetails = require("../models/Studentuserdetails")
const Schoolyear = require("../models/Schoolyear")
const Staffusers = require("../models/Staffusers")
const GradingPeriod = require("../models/Gradingperiod")
const Section = require("../models/Section")
const Subject = require("../models/Subject")




exports.createsubjectgrade = async (req, res) => {
    const { id } = req.user; // Teacher or admin ID
    const { newgrades } = req.body; // Input data

    // Normalize grades into an array
    const grades = Array.isArray(newgrades) ? newgrades : [newgrades];

    if (!grades || grades.length === 0) {
        return res.status(400).json({ message: "failed", data: "Grades data must be provided." });
    }

    const findCurrentSchoolYear = await Schoolyear.findOne({ currentstatus: "current" })
        .then((data) => data)
        .catch((err) => {
            console.log(`Error fetching current school year: ${err}`);
            return res.status(400).json({
                message: "bad-request",
                data: "There's a problem with the server. Please contact support for more details.",
            });
        });

    if (!findCurrentSchoolYear) {
        return res.status(400).json({ message: "failed", data: "Current school year not found." });
    }

    const subjectGrades = [];
    for (const gradeEntry of grades) {
        const { subject, student, quarter, grade, remarks } = gradeEntry;

        if (!subject || !student || !quarter || !grade || !remarks) {
            return res.status(400).json({ 
                message: "failed", 
                data: "Each grade entry must include subject, student, quarter, grade, and remarks." 
            });
        }

        const checkIsGraded = await Subjectgrade.findOne({
            subject: new mongoose.Types.ObjectId(subject),
            student: new mongoose.Types.ObjectId(student),
            quarter: { $regex: `^${quarter}$`, $options: "i" }
        });
        
        if (checkIsGraded) {
            return res.status(400).json({ message: "failed", data: "Duplicate quarter grade not allowed" });
        }

        const checkgradingperiod = await GradingPeriod.findOne()
        
        if(checkgradingperiod.quarter.toLowerCase() !== quarter.toLowerCase()){
            return res.status(400).json({ message: "failed", data: "Please update the current grading period."})
        }

        const getstudentsection = await Studentuserdetails.findOne({ owner: new mongoose.Types.ObjectId(student) })
            .catch((err) => {
                console.log(`Error fetching student section: ${err}`);
                return null;
            });

        if (!getstudentsection) {
            return res.status(400).json({ 
                message: "failed", 
                data: `Student section not found for student ID: ${student}` 
            });
        }

        const checksubjectbyschedule = await Schedule.findOne({
            teacher: new mongoose.Types.ObjectId(id),
            subject: new mongoose.Types.ObjectId(subject),
            section: new mongoose.Types.ObjectId(getstudentsection.section),
        }).catch((err) => {
            console.log(`Error checking subject schedule: ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact support for more details."});
        });

        const getsuperadmin = await Staffusers.findOne({ _id: new mongoose.Types.ObjectId(id) });

        if (!checksubjectbyschedule && getsuperadmin.auth !== "superadmin") {
            return res.status(403).json({
                message: "failed",
                data: `Teacher is not authorized to grade student ID: ${student} for subject ID: ${subject}.`,
            });
        }

        subjectGrades.push({
            subject: new mongoose.Types.ObjectId(subject),
            student: new mongoose.Types.ObjectId(student),
            schoolyear: findCurrentSchoolYear._id,
            quarter: quarter,
            grade: grade,
            remarks: remarks,
        });
    }

    await Subjectgrade.insertMany(subjectGrades)
        .then((data) => {
            return res.status(200).json({ message: "success", data });
        })
        .catch((err) => {
            console.log(`Error creating subject grades: ${err}`);
            return res.status(400).json({ 
                message: "bad-request", 
                data: "There's a problem with the server. Please contact support for more details." 
            });
        });
};

exports.editsubjectgrade = async (req, res) => {

    const { id } = req.user

    const { subjectgrade, remarks, grade } = req.body

    
    if(!subjectgrade) {
        return res.status(400).json({
            message: "failed", data: "Subject grade ID is required"
        })
    }

    if(!grade){
        return res.status(400).json({
            message: "failed", data: "Grade is required"
        })
    }

    const checkgradingperiod = await GradingPeriod.findOne()
        
    if(checkgradingperiod.quarter.toLowerCase() !== quarter.toLowerCase()){
        return res.status(400).json({ message: "failed", data: "Please update the current grading period."})
    }

    const { student, subject } = await Subjectgrade.findOne({ _id: new mongoose.Types.ObjectId(subjectgrade) })

    const getstudentsection = await Studentuserdetails.findOne({ owner: new mongoose.Types.ObjectId(student) })
        .catch((err) => {
            console.log(`Error fetching student section: ${err}`);
            return null;
        });

    if (!getstudentsection) {
        return res.status(400).json({ 
            message: "failed", 
            data: `Student section not found for student ID: ${student}` 
        });
    }

    const checksubjectbyschedule = await Schedule.findOne({
        teacher: new mongoose.Types.ObjectId(id),
        subject: new mongoose.Types.ObjectId(subject),
        section: new mongoose.Types.ObjectId(getstudentsection.section),
    }).catch((err) => {
        console.log(`Error checking subject schedule: ${err}`);
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact support for more details."});
    });

    const getsuperadmin = await Staffusers.findOne({ _id: new mongoose.Types.ObjectId(id) });

    if (!checksubjectbyschedule && getsuperadmin.auth !== "superadmin") {
        return res.status(403).json({
            message: "failed",
            data: `Teacher is not authorized to grade student ID: ${student} for subject ID: ${subject}.`,
        });
    }

    await Subjectgrade.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(subjectgrade) }, { $set: { grade, remarks } })
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while updating subject grade. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details."})
    })

    return res.status(200).json({ message: "success" })
}

exports.deletesubjectgrade = async (req, res) => {

    const { id } = req.user

    const { subjectgrade } = req.body
    
    if(!subjectgrade) {
        return res.status(400).json({
            message: "failed", data: "Subject grade ID is required"
        })
    }


    await Subjectgrade.findOneAndDelete({ _id: new mongoose.Types.ObjectId(subjectgrade) })
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while updating subject grade. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details."})
    })

    return res.status(200).json({ message: "success" })
}

exports.getstudentsubjectgrade = async (req, res) => {
        const { student } = req.query

        if(!student) {
            return res.status(400).json({
                message: "failed", data: "Student ID is required"
            })
        }

        const studentgrades = await Subjectgrade.aggregate([
            {
                $match: { student: new mongoose.Types.ObjectId(student) },
            },
            {
                $lookup: {
                    from: "studentuserdetails",
                    localField: "student",
                    foreignField: "owner",
                    as: "studentdetails",
                },
            },
            {
                $unwind: "$studentdetails",
            },
            {
                $lookup: {
                    from: "subjects",
                    localField: "subject",
                    foreignField: "_id",
                    as: "subjectdetails",
                },
            },
            {
                $unwind: "$subjectdetails",
            },
        ])
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem encoutered while fetching student grade. Error: ${err}`)
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details."})
        })


        const finaldata = []

        studentgrades.forEach(grade => {
            finaldata.push({
                student: {
                    id: grade.studentdetails.owner,
                    name: `${grade.studentdetails.firstname} ${grade.studentdetails.lastname}`,
                    email: grade.studentdetails.email,
                },
                subject: {
                    id: grade.subjectdetails._id,
                    name: grade.subjectdetails.name,
                },
                grades: {
                    quarter: grade.quarter,
                    grade: grade.grade || [],
                    remarks: grade.remarks || "N/A",
                }
            })
        })

    return res.status(200).json({ message: "success", data: finaldata})
}


exports.getsubjectgradestudent = async (req, res) => {
 
    const { id: studentid } = req.user

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


    subjectlist.forEach(temp => {

        finaldata.details.push({
            studentname: `${temp.studentDetails.firstname} ${temp.studentDetails.lastname}`,
            lvlsection: `${temp.gleveldetails[0].level} - ${temp.sectionName}`,
            adviser: `${temp.advdetails[0].firstname} ${temp.advdetails[0].lastname}`,
            schoolyear: `${temp.sydetails[0].startyear} - ${temp.sydetails[0].endyear}`
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

exports.getsubjectgradebystudentid = async (req, res) => {

    const { id } = req.user

    const { studentid } = req.query

    const studentgrades = await Subjectgrade.aggregate([
        {
            $match: { student: new mongoose.Types.ObjectId(studentid) },
        },
        {
            $lookup: {
                from: "studentuserdetails",
                localField: "student",
                foreignField: "owner",
                as: "studentdetails",
            },
        },
        {
            $unwind: "$studentdetails",
        },
        {
            $lookup: {
                from: "subjects",
                localField: "subject",
                foreignField: "_id",
                as: "subjectdetails",
            },
        },
        {
            $unwind: "$subjectdetails",
        },
    ])
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encoutered while fetching student grade. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details."})
    })


    const finaldata = []

    studentgrades.forEach(grade => {
        finaldata.push({
            student: {
                id: grade.studentdetails.owner,
                name: `${grade.studentdetails.firstname} ${grade.studentdetails.lastname}`,
                email: grade.studentdetails.email,
            },
            subject: {
                id: grade.subjectdetails._id,
                name: grade.subjectdetails.name,
            },
            grades: {
                quarter: grade.quarter,
                grade: grade.grade || [],
                remarks: grade.remarks || "N/A",
            }
        })
    })

}

//get teacher subjects
exports.getteachersubjects = async (req, res) => {
    const { id } = req.user
    const { student } = req.query

    const schedules = await Schedule.find({ teacher: new mongoose.Types.ObjectId(id) })

    const subjectlist = [...new Set(schedules.map(schedule => schedule.subject.toString()))];

    const subjectdata = await Promise.all(
        subjectlist.map(async (subjectId) => {
            const subject = await Subject.findOne({ _id: new mongoose.Types.ObjectId(subjectId) });
            return {
                id: subject._id,
                name: subject.name
            };
        })
    );


    return res.status(200).json({ message: "success", data: subjectdata})
}

exports.getteachersubjectsection = async (req, res) => {
    const { id } = req.user

    const { subjectid } = req.query

    const schedules = await Schedule.find({ teacher: new mongoose.Types.ObjectId(id), subject: new mongoose.Types.ObjectId(subjectid)})

    console.log(schedules)

    const subjectlist = [...new Set(schedules.map(schedule => schedule.section.toString()))];

    const subjectdata = await Promise.all(
        subjectlist.map(async (sectionid) => {
            const subject = await Section.findOne({ _id: new mongoose.Types.ObjectId(sectionid)  });
            return {
                id: subject._id,
                name: subject.name
            };
        })
    );


    return res.status(200).json({ message: "success", data: subjectdata})
}