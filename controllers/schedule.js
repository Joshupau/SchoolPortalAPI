

const { default: mongoose } = require("mongoose");
const Schedule = require("../models/Schedule");
const Schoolyear = require("../models/Schoolyear");

exports.createSchedule = async (req, res) => {
    const { teacher, subject, section, day, starttime, endtime } = req.body

    if(!teacher || !subject || !section || !day || !starttime || !endtime){
        return res.status(400).json({ message: "failed", data: "Incomplete form data."})
    }

    const existingsubject = await Schedule.findOne({ section: section, subject: subject, day: day });

    if (existingsubject) {
        return res.status(400).json({
            message: "failed",
            data: "Duplicate schedule error: This subject is already scheduled for this section on the same day."
        });
    }

    const conflictingSchedule = await Schedule.findOne({
        teacher: teacher,
        day: day,
        $or: [
            { starttime: { $gte: starttime, $lt: endtime } }, 
            { endtime: { $gt: starttime, $lte: endtime } },  
            {
                $and: [
                    { starttime: { $lte: starttime } },        
                    { endtime: { $gte: endtime } },           
                ],
            },
        ],
    });

    if (conflictingSchedule) {
        return res.status(400).json({
            message: "failed",
            data: "Duplicate schedule error: The teacher is already scheduled at the same time on the same day.",
        });
    }

    const existingSchedule = await Schedule.findOne({
        section,
        day,
        $or: [
            { starttime: starttime },
            { endtime: endtime },
            {
                $and: [
                    { starttime: { $lte: starttime } },
                    { endtime: { $gte: endtime } },
                ],
            },
        ],
    });
    
    if (existingSchedule) {
        return res.status(400).json({
            message: "failed",
            data: `Duplicate schedule error: A schedule has already been created on the same time and of the same day.`
        });
    }

    const currentSchoolYear = await Schoolyear.findOne({ currentstatus: "current" })
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while searching for current school year. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details."})
    })

    if (!currentSchoolYear) {
        return res.status(400).json({
            message: "failed",
            data: "No current school year found. Please set a current school year."
        });
    }

    await Schedule.create({
        teacher: new mongoose.Types.ObjectId(teacher),
        subject: new mongoose.Types.ObjectId(subject),
        section: new mongoose.Types.ObjectId(section),
        schoolyear: currentSchoolYear._id,
        day: day,
        starttime: starttime,
        endtime: endtime
    })
    .then(data => data)
    .catch(err => { 
        console.log(`There's a problem encountered while creating schedule. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details."})
    })

    return res.status(200).json({ message: "success" })
}

exports.editSchedule = async (req, res) => {
    const { schedule, teacher, subject, section, day, starttime, endtime } = req.body;
  
    if (!teacher || !schedule || !subject || !section || !day || !starttime || !endtime) {
      return res.status(400).json({ message: "failed", data: "Incomplete form data." });
    }
  
    const currentSchedule = await Schedule.findById(schedule);
    if (!currentSchedule) {
      return res.status(404).json({ message: "failed", data: "Schedule not found." });
    }
  
    if (
      teacher === currentSchedule.teacher.toString() &&
      subject === currentSchedule.subject.toString() &&
      section === currentSchedule.section.toString() &&
      day === currentSchedule.day &&
      starttime === currentSchedule.starttime &&
      endtime === currentSchedule.endtime
    ) {
      return res.status(200).json({ message: "success", data: "No changes detected in the schedule." });
    }
  
    const existingSubject = await Schedule.findOne({
        section: new mongoose.Types.ObjectId(section),
        subject: new mongoose.Types.ObjectId(subject),
        day,
        _id: { $ne: new mongoose.Types.ObjectId(schedule) }, 
    });
  
    if (existingSubject) {
      return res.status(400).json({
        message: "failed",
        data: "Duplicate schedule error: This subject is already scheduled for this section on the same day.",
      });
    }
  
    const conflictingSchedule = await Schedule.findOne({
      _id: { $ne: schedule },
      teacher: new mongoose.Types.ObjectId(teacher),
      day,
      $or: [
        { starttime: { $gte: starttime, $lt: endtime } },
        { endtime: { $gt: starttime, $lte: endtime } },
        {
          $and: [
            { starttime: { $lte: starttime } },
            { endtime: { $gte: endtime } },
          ],
        },
      ],
    });
  
    if (conflictingSchedule) {
      return res.status(400).json({
        message: "failed",
        data: "Duplicate schedule error: The teacher is already scheduled at the same time on the same day.",
      });
    }
  
    const sectionConflict = await Schedule.findOne({
      _id: { $ne: schedule }, 
      section: new mongoose.Types.ObjectId(section),
      day,
      $or: [
        { starttime: { $gte: starttime, $lt: endtime } },
        { endtime: { $gt: starttime, $lte: endtime } },
        {
          $and: [
            { starttime: { $lte: starttime } },
            { endtime: { $gte: endtime } },
          ],
        },
      ],
    });
  
    if (sectionConflict) {
      return res.status(400).json({
        message: "failed",
        data: `Duplicate schedule error: A conflicting schedule for ${section} already exists.`,
      });
    }
  
    const currentSchoolYear = await Schoolyear.findOne({ currentstatus: "current" }).catch((err) => {
      console.log(`There's a problem encountered while searching for current school year. Error: ${err}`);
      return res.status(400).json({
        message: "bad-request",
        data: "There's a problem with the server. Please contact support for more details.",
      });
    });
  
    if (!currentSchoolYear) {
      return res.status(400).json({
        message: "failed",
        data: "No current school year found. Please set a current school year.",
      });
    }
  
    await Schedule.findByIdAndUpdate(
      schedule,
      {
        teacher: new mongoose.Types.ObjectId(teacher),
        subject: new mongoose.Types.ObjectId(subject),
        section: new mongoose.Types.ObjectId(section),
        schoolyear: currentSchoolYear._id,
        day,
        starttime,
        endtime,
      },
    )
      .then((data) => res.status(200).json({ message: "success", data }))
      .catch((err) => {
        console.log(`There's a problem encountered while updating the schedule. Error: ${err}`);
        return res.status(400).json({
          message: "bad-request",
          data: "There's a problem with the server. Please contact support for more details.",
        });
      });
};

exports.getSchedulesByTeacher = async (req, res) => {
    const { teacherId } = req.query;

    if (!teacherId) {
        return res.status(400).json({ message: "Teacher ID is required." });
    }

    const matchconditionpipeline = [
        {
            $match: {
                teacher: new mongoose.Types.ObjectId(teacherId),
            },
        },
        {
            $lookup: {
                from: "staffusers",
                localField: "teacher",
                foreignField: "_id",
                as: "Teacherdetails",
            },
        },
        {
            $unwind: { path: "$Teacherdetails", preserveNullAndEmptyArrays: true },
        },
        {
            $lookup: {
                from: "subjects",
                localField: "subject",
                foreignField: "_id",
                as: "Subjectdetails",
            },
        },
        {
            $unwind: { path: "$Subjectdetails", preserveNullAndEmptyArrays: true },
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
            $unwind: { path: "$Sectiondetails", preserveNullAndEmptyArrays: true },
        },
        {
            $lookup: {
                from: "schoolyears",
                localField: "schoolyear",
                foreignField: "_id",
                as: "Schoolyeardetails",
            },
        },
        {
            $unwind: { path: "$Schoolyeardetails", preserveNullAndEmptyArrays: true },
        },
        {
            $project: {
                teacher: "$Teacherdetails.username",
                subject: "$Subjectdetails.name",
                section: "$Sectiondetails.name",
                schoolyear: "$Schoolyeardetails.year",
                day: 1,
                starttime: 1,
                endtime: 1,
            },
        },
        {
            $addFields: {
                starttimeMinutes: {
                    $add: [
                        { $multiply: [{ $toInt: { $substr: ["$starttime", 0, 2] } }, 60] }, // Convert hours to minutes
                        { $toInt: { $substr: ["$starttime", 3, 2] } } // Convert minutes to integer
                    ],
                },
                endtimeMinutes: {
                    $add: [
                        { $multiply: [{ $toInt: { $substr: ["$endtime", 0, 2] } }, 60] }, // Convert hours to minutes
                        { $toInt: { $substr: ["$endtime", 3, 2] } } // Convert minutes to integer
                    ],
                },
            },
        },
        {
            $sort: { day: 1, starttimeMinutes: 1, endtimeMinutes: 1 },
        },
    ];

    const schedules = await Schedule.aggregate(matchconditionpipeline)
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while fetching schedule of teacher: ${teacherId}. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please try again later."})
    })

    console.log(schedules)

    const finaldata = []

    schedules.forEach(temp => {
        finaldata.push({
            id: temp._id,
            day: temp.day,
            starttime: temp.starttime,
            endtime: temp.endtime,
            teacher: temp.teacher,
            subject: temp.subject,
            section: temp.section
        })
    })

    return res.status(200).json({ message: "success", data: finaldata })
}

exports.getSchedulesBySection = async (req, res) => {
    const { section } = req.query;

    if (!section) {
        return res.status(400).json({ message: "Section ID is required." });
    }

    const matchconditionpipeline = [
        {
            $match: {
                section: new mongoose.Types.ObjectId(section),
            },
        },
        {
            $lookup: {
                from: "staffusers",
                localField: "teacher",
                foreignField: "_id",
                as: "Teacherdetails",
            },
        },
        {
            $unwind: { path: "$Teacherdetails", preserveNullAndEmptyArrays: true },
        },
        {
            $lookup: {
                from: "subjects",
                localField: "subject",
                foreignField: "_id",
                as: "Subjectdetails",
            },
        },
        {
            $unwind: { path: "$Subjectdetails", preserveNullAndEmptyArrays: true },
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
            $unwind: { path: "$Sectiondetails", preserveNullAndEmptyArrays: true },
        },
        {
            $lookup: {
                from: "schoolyears",
                localField: "schoolyear",
                foreignField: "_id",
                as: "Schoolyeardetails",
            },
        },
        {
            $unwind: { path: "$Schoolyeardetails", preserveNullAndEmptyArrays: true },
        },
        {
            $project: {
                teacher: "$Teacherdetails.username",
                subject: "$Subjectdetails.name",
                section: "$Sectiondetails.name",
                schoolyear: "$Schoolyeardetails.year",
                day: 1,
                starttime: 1,
                endtime: 1,
            },
        },
        {
            $addFields: {
                starttimeMinutes: {
                    $add: [
                        { $multiply: [{ $toInt: { $substr: ["$starttime", 0, 2] } }, 60] }, // Convert hours to minutes
                        { $toInt: { $substr: ["$starttime", 3, 2] } } // Convert minutes to integer
                    ],
                },
                endtimeMinutes: {
                    $add: [
                        { $multiply: [{ $toInt: { $substr: ["$endtime", 0, 2] } }, 60] }, // Convert hours to minutes
                        { $toInt: { $substr: ["$endtime", 3, 2] } } // Convert minutes to integer
                    ],
                },
            },
        },
        {
            $sort: { day: 1, starttimeMinutes: 1, endtimeMinutes: 1 },
        },
    ];

    const schedules = await Schedule.aggregate(matchconditionpipeline)
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while fetching schedule of teacher: ${teacherId}. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please try again later."})
    })

    console.log(schedules)

    const finaldata = []

    schedules.forEach(temp => {
        finaldata.push({
            id: temp._id,
            day: temp.day,
            starttime: temp.starttime,
            endtime: temp.endtime,
            teacher: temp.teacher,
            subject: temp.subject,
            section: temp.section
        })
    })

    return res.status(200).json({ message: "success", data: finaldata })
}

exports.deletschedule = async (req, res) => {
    const { id, username } = req.user
    const { scheduleid } = req.query

    if(!scheduleid){
        return res.status(400).json({ message: "failed", data: "Please select an event to delete."})
    }

    await Schedule.findOneAndDelete({ _id: new mongoose.Types.ObjectId(scheduleid)})
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while deleting schedule. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details."})
    })

    return res.status(200).json({ message: "success" })
}
