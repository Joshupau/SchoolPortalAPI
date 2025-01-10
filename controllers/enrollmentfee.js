const { default: mongoose } = require("mongoose");
const Gradelevel = require("../models/Gradelevel");
const EnrollmentFee = require("../models/Enrollmentfee");



exports.initalizeenrollmentfee = async (req, res) => {


    const gradelevel = await Gradelevel.find({ status: "active" })
    .then(data => data)
    .catch(err => {
        console.log(`Error finding the gradelevel data: ${err}`);
        return;
    });


    gradelevel.forEach(async (grade) => {
        await EnrollmentFee.create({
            gradelevel: new mongoose.Types.ObjectId(grade._id),
            program: new mongoose.Types.ObjectId(grade.program),  
        })
        .catch(err => {
            console.log(`Error saving enrollment fee data: ${err}`);
            return;
        })
    });

    return res.status(200).json({ message: "Enrollment fee data initialized successfully" });
}


exports.updateenrollmentfee = async (req, res) => {
    const { gradelevel, program, tuition } = req.body;


    const enrollmentfee = await EnrollmentFee.findOne({ gradelevel, program })
    .then(data => data)
    .catch(err => {
        console.log(`Error finding the enrollment fee data: ${err}`);
        return;
    });

    if (!enrollmentfee) {
        return res.status(404).json({ message: "Enrollment fee data not found" });
    }

    enrollmentfee.tuition = tuition;

    await enrollmentfee.save()
    .then(data => data)
    .catch(err => {
        console.log(`Error saving enrollment fee data: ${err}`);
        return res.status(500).json({ message: "Error updating the enrollment fee data" });
    });


    return res.status(200).json({ message: "success" })
}


exports.getenrollmentfee = async (req, res) => {
    const enrollmentfee = await EnrollmentFee.aggregate([
        {
            $lookup: {
                from: "gradelevels",
                localField: "gradelevel",
                foreignField: "_id",
                as: "gradelevel"
            }
        },
        {
            $lookup: {
                from: "programs",
                localField: "program",
                foreignField: "_id",
                as: "program"
            }
        },
        {
            $unwind: "$gradelevel"
        },
        {
            $unwind: "$program"
        },
    ])
    .then(data => data)
    .catch(err => {
        console.log(`Error finding the enrollment fee data: ${err}`);
        return;
    });


    const finaldata = []

    enrollmentfee.forEach(temp => {
        const { _id, gradelevel, program, tuition } = temp;
        finaldata.push({ 
            id: _id, 
            gradelevel: gradelevel.name, 
            program: program.name,
            tuition: tuition,
            gradelevelid: gradelevel._id,
            programid: program._id
        })
    })

    return res.status(200).json({ message: "success", data: finaldata });
}

exports.deleteenrollmentfee = async (req, res) => {
    const { id } = req.query;

    const enrollmentfee = await EnrollmentFee.findById(id)
    .then(data => data)
    .catch(err => {
        console.log(`Error finding the enrollment fee data: ${err}`);
        return;
    });

    if (!enrollmentfee) {
        return res.status(404).json({ message: "Enrollment fee data not found" });
    }

    await enrollmentfee.tuition.remove()
    .then(data => data)
    .catch(err => {
        console.log(`Error deleting enrollment fee data: ${err}`);
        return res.status(500).json({ message: "Error deleting the enrollment fee data" });
    });

    return res.status(200).json({ message: "success" });
}