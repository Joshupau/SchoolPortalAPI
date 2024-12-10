const { default: mongoose } = require("mongoose");
const Requirements = require("../models/Requirements");
const Ticketusers = require("../models/Ticketusers");
const Entranceexam = require("../models/Entranceexam");

exports.submitrequirement = async (req, res) => {
    const { level, program, gender, firstname, middlename, lastname, address, email, phonenumber, telephonenumber, mother, father  } = req.body

    const files = req.files;
    if (
        !level || !program || !firstname || !lastname || !address || !email ||
        !phonenumber|| !gender || !telephonenumber || !mother || !father
    ) {
        return res.status(400).json({ message: "failed", data: "Incomplete text fields." });
    }

    if (!files || !files.bc || !files.form) {
        return res.status(400).json({ message: "failed", data: "Missing required files." });

    }


    const birthcertificate = files.bc[0].path
    const form137 = files.form[0].path


    await Requirements.create({
        firstname: firstname,
        middlename: middlename,
        lastname: lastname,
        gender: gender,
        address: address,
        level: new mongoose.Types.ObjectId(level),
        program: new mongoose.Types.ObjectId(program),
        email: email,
        phonenumber: phonenumber,
        telephonenumber: telephonenumber,
        mother: mother,
        father: father,
        form137: form137,
        birthcertificate: birthcertificate
    })
    .then(async data => { 
        const ticket = await Ticketusers.create({
            requirements: new mongoose.Types.ObjectId(data._id),
            username: "a",
            password: "test123",
            webtoken: "",
            status: "active"
        })
        .then(data => data)
        .catch(async err => {
            console.log(`There's a problem encountered when creating ticket user for ${id}. Error: ${err}`)
            return res.status(400).json({ message: "failed", data: "There's a problem with the server. Please contact support for more details."})
        })


        return res.status(200).json({ message: "success", data: { username: ticket.username, password: "test123"}})
    })
    .catch(err => {
        console.log(`There's a problem encountered when submitting requirements. Error: ${err}`)

        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact admin for more details."})
    })
}

exports.viewrequirementsstatus = async (req, res) => {
    const { id, username } = req.user

    if(!id){
        return res.status(401).json({ message: 'Unauthorized', data: "You are not authorized to view this page. Please login the right account to view the page." });
    }

    await Ticketusers.findOne({ _id: new mongoose.Types.ObjectId(id) })
    .then(async data => {
        const requirements = await Requirements.findById(data.requirements)
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem when viewing requirement status for ticktet user ${id}. Error: ${err}`)
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact admin for more details."})
        })

        const status = await Entranceexam.findOne({ owner: new mongoose.Types.ObjectId(id)})
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem encountered whil searching entrance exam status in view requirements status for ${username}. Error: ${err}`)
        })

        let value = false
        if(status){
            value = true;
        }

        return res.status(200).json({ 
            message: "success", 
            data: { 
                id: requirements._id, 
                status: requirements.status, 
                denyreason: requirements.denyreason || "",
                hasSchedule: value
            }
        })
    })
    .catch(err => {
        console.log(`There's a problem encountered while fetching requirements id. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact admin for more details."})
    })
}

exports.getrequirements = async (req, res) => {
    const { page, limit, filter } = req.query

    const pageOptions = {
        page: parseInt(page) || 0,
        limit: parseInt(limit) || 10
    }

    let filterMatchStage = {};


    if(filter === 'pending' || filter === 'denied' || filter === 'approved'){
        filterMatchStage = {
            status: filter,
        }
    }


    const matchCondition = [
        {
            $lookup: {
                from: "ticketusers",
                localField: "_id",
                foreignField: "requirements",
                as: "ticketuserDetails",
            },
        },
        {
            $lookup: {
                from: "gradelevels",
                localField: "level",
                foreignField: "_id",
                as: "gradeleveldetails"
            },
        },
        {
            $lookup: {
                from: "programs",
                localField: "program",
                foreignField: "_id",
                as: "programdetails"
            },
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
                path: "$ticketuserDetails",
                preserveNullAndEmptyArrays: true,
            },
        },
        ...(filter ? [ { $match: filterMatchStage }]: []),
        {
            $project: {
                ticketuserDetails: 1,
                firstname: 1,
                middlename: 1,
                lastname: 1,
                gradeleveldetails: 1,
                programdetails: 1,
                gender: 1,
                address: 1,
                email: 1,
                phonenumber: 1,
                telephonenumber: 1,
                mother: 1,
                father: 1,
                form137: 1,
                birthcertificate: 1,
                status: 1,
                denyreason: 1,
                createdAt: 1,
            },
        },
        {
            $skip: pageOptions.page * pageOptions.limit,
        },
        {
            $limit: pageOptions.limit,
        },
        {
            $sort: { createdAt: -1 },
        },
    ];
    
    
    
    
    const requirementsData = await Requirements.aggregate(matchCondition)
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem while fetching requirements data. Error: ${err}`)
        
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details."})
    })

    const totalDocuments = await Requirements.countDocuments(filterMatchStage)

    
    const totalPages = Math.ceil(totalDocuments / pageOptions.limit)
    
    const finaldata = {
        totalPages: totalPages,
        data: []
    }
    requirementsData.forEach(temp => {
        finaldata.data.push({
            id: temp._id,
            ticketid: temp.ticketuserDetails._id,
            ticketusername: temp.ticketuserDetails.username,           
            fullname: `${temp.firstname} ${temp?.middlename} ${temp.lastname}`,
            level: temp.gradeleveldetails.level,
            program: temp.programdetails.name,
            address: temp.address,
            email: temp.email,
            gender: temp?.gender || "",
            phonenumber: temp.phonenumber,
            telephonenumber: temp.telephonenumber,
            mother: temp.mother,
            father: temp.father,
            form137: temp.form137,
            birthcertificate: temp.birthcertificate,
            status: temp.status,
            denyreason: temp?.denyreason || ""
        })
    })

    return res.status(200).json({ message: "success", data: finaldata})
}

exports.approvedenyrequirements = async (req, res) => {
    const { status, denyreason, id } = req.query

    if(!id || !status){
        return res.status(400).json({ message: "failed", data: "Please input requirement ID and status."})
    }

    if(status === 'deny'){
        if(!denyreason){
            return res.status(400).json({ message: "failed", data: "Please input deny reason."})
        }
    }

    if(status === 'approved'){
        await Requirements.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(id)}, { $set: { status: "approved" } } )
        .then(async () => {

            return res.status(200).json({ message: "success" })
        })
        .catch(err => {
            console.log(`There's a problem encountered while approving requirements of ${id}. Error: ${err}`)

            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details."})
        })
    } else if (status === 'deny'){
        await Requirements.findOneAndUpdate(
            { _id: new mongoose.Types.ObjectId(id) }, 
            { $set: { status: "denied", denyreason: denyreason } }
        )
        .then(data => data)
        .catch(async err => {
            console.log(`There's a problem encountered when disapproving requirements of ${id}. Error: ${err}`)
            await Requirements.findOneAndUpdate({ id: new mongoose.Types.ObjectId(id)}, { $set: { status: "pending" } } )
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details."})
        })

        return res.status(200).json({ message: "success"})
        
    } else {
        return res.status(400).json({ message: "failed", data: "Please input the correct status"})
    }

}

exports.reapplyRequirements = async (req, res) => {
    const { id, username } = req.user
    
    const { program, level, gender, firstname, middlename, lastname, address, email, phonenumber, telephonenumber, mother, father  } = req.body

    const files = req.files;
    if (
        !program || !level || !firstname || !lastname || !address || !email ||
        !phonenumber|| !gender || !telephonenumber || !mother || !father
    ) {
        return res.status(400).json({ message: "failed", data: "Incomplete text fields." });
    }

    if (!files || !files.bc || !files.form) {
        return res.status(400).json({ message: "failed", data: "Missing required files." });

    }


    const birthcertificate = files.bc[0].path
    const form137 = files.form[0].path


    const requirementsId = await Ticketusers.findOne({ _id: new mongoose.Types.ObjectId(id)})
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while fetching requirements data in reapply requirements of user: ${username}. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with your account. Please contact admin for more details."})
    })
    await Requirements.findOneAndUpdate({ _id: requirementsId.requirements },
        {
        $set: {
            firstname: firstname,
            middlename: middlename,
            lastname: lastname,
            gender: gender,
            address: address,
            email: email,
            program: new mongoose.Types.ObjectId(program),
            level: new mongoose.Types.ObjectId(level),
            phonenumber: phonenumber,
            telephonenumber: telephonenumber,
            mother: mother,
            father: father,
            form137: form137,
            birthcertificate: birthcertificate,
            status: "pending",
            denyreason: ""
        }
    })
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered when submitting requirements. Error: ${err}`)

        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact admin for more details."})
    })

    return res.status(200).json({ message: "success" })
}