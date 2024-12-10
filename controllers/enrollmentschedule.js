const { default: mongoose } = require("mongoose")
const EnrollmentSchedule = require("../models/Enrollmentschedule")



exports.createenrollmentschedule = async (req, res) => {
    const { program, startdate, enddate } = req.body

    if(!program){
        return res.status(400).json({ message: "failed", data: "Please select a program to create enrollment schedule."})
    }

    if(!startdate || !enddate){
        return res.status(400).json({ message: "failed", data: "Please select start date and end date for enrollment."})
    }

    const isExisting = await EnrollmentSchedule.findOne({ program: new mongoose.Types.ObjectId(program)})

    if(isExisting){
        return res.status(400).json({ message: "failed", data: "There's already an existing enrollment schedule on this program."})    
    }

    await EnrollmentSchedule.create({
        program: program,
        startdate: startdate,
        enddate: enddate,
    })
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while creating enrollment schedule. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details."})
    })

    return res.status(200).json({ message: "success" })
}

exports.getenrollmentschedule = async (req, res) => {
    const { page, limit, search } = req.query;

    const pageOptions = {
        page: parseInt(page) || 0,
        limit: parseInt(limit) || 10,
    };

    const currentDate = new Date();

    const matchconditionpipeline = [
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
            $addFields: {
                startdateConverted: { $dateFromString: { dateString: "$startdate" } },
                enddateConverted: { $dateFromString: { dateString: "$enddate" } },
            },
        },
        {
            $match: {
                startdateConverted: { $lte: currentDate },
                enddateConverted: { $gte: currentDate },
            },
        },
        ...(search
            ? [
                  {
                      $match: {
                          "programdetails.name": { $regex: search, $options: "i" },
                      },
                  },
              ]
            : []),
        {
            $project: {
                _id: 1,
                startdate: 1,
                enddate: 1,
                program: "$programdetails.name",
            },
        },
        {
            $skip: pageOptions.page * pageOptions.limit,
        },
        {
            $limit: pageOptions.limit,
        },
    ];

    const esched = await EnrollmentSchedule.aggregate(matchconditionpipeline)
        .then((data) => data)
        .catch((err) => {
            console.log(
                `There's a problem encountered while fetching Enrollment Schedule. Error: ${err}`
            );
            return res
                .status(400)
                .json({
                    message: "bad-request",
                    data: "There's a problem with the server. Please contact support for more details.",
                });
        });

    const totalDocuments = await EnrollmentSchedule.aggregate([
        {
            $addFields: {
                startdateConverted: { $dateFromString: { dateString: "$startdate" } },
                enddateConverted: { $dateFromString: { dateString: "$enddate" } },
            },
        },
        {
            $match: {
                startdateConverted: { $lte: currentDate },
                enddateConverted: { $gte: currentDate },
            },
        },
    ])
        .then((data) => data.length)
        .catch((err) => {
            console.log(
                `There's a problem encountered while counting total enrollment schedules. Error: ${err}`
            );
            return res
                .status(400)
                .json({
                    message: "bad-request",
                    data: "There's a problem with the server. Please contact support for more details.",
                });
        });

    const totalPages = Math.ceil(totalDocuments / pageOptions.limit);

    const data = {
        totalpages: totalPages,
        data: [],
    };

    esched.forEach((temp) => {
        const { _id, startdate, enddate, program } = temp;

        data.data.push({
            id: _id,
            startdate: startdate,
            enddate: enddate,
            program: program,
        });
    });
    return res.status(200).json({ message: "success", data: data });
};

exports.editenrollmentschedule = async (req, res) => {
    const { startdate, enddate, id } = req.body

    if(!id){
        return res.status(400).json({ message: "failed", data: "Please select an enrollment schedule to edit."})
    }
    if(!startdate || !enddate){
        return res.status(400).json({ message: "failed", data: "Please input the new enrollment start and end date."})

    }
    await EnrollmentSchedule.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(id)}, 
        {
            $set: {
                startdate: startdate,
                enddate: enddate
            }
        }
    )
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while editting enrollment schedule. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details."})
    })

    return res.status(200).json({ message: "success" })
}

exports.deleteenrollmentschedule = async (req, res) => {
    const { id } = req.query

    if(!id){
        return res.status(400).json({ message: "failed", data: "Please select an enrollment schedule to delete."})
    }

    await EnrollmentSchedule.findOneAndDelete({ _id: new mongoose.Types.ObjectId(id) })
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while deleting enrollment schedule. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details."})
    })

    return res.status(200).json({ message: "success" })
}