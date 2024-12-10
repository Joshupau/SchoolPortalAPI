const { default: mongoose } = require("mongoose");
const Staffusers = require("../models/Staffusers");
const Staffuserdetails = require("../models/Staffuserdetails");


exports.staffuserlist = async (req, res) => {
    const { page, limit, status, search, filter } = req.query;

    const pageOptions = {
        page: parseInt(page) || 0,
        limit: parseInt(limit) || 10,
    };
    
    let filterMatchStage = {};
    let statusMatchStage = {};
    let searchMatchStage = {};
    
    if (search) {
        searchMatchStage = {
            $or: [
                { username: { $regex: search, $options: 'i' } },
                { "staffuserdetails.email": { $regex: search, $options: 'i' } },
                { "staffuserdetails.lastname": { $regex: search, $options: 'i' } },
                { "staffuserdetails.firstname": { $regex: search, $options: 'i' } },
            ],
        };
    }
    
    if (filter === 'admin' || filter === 'superadmin' || filter === 'finance' || filter === 'registrar' || filter === 'adviser' || filter === 'teacher') {
        filterMatchStage = { auth: filter };
    }
    
    if (status === 'active' || status === 'inactive') {
        statusMatchStage = { status: status };
    }
    
    const matchConditionPipeline = [
        {
            $lookup: {
                from: "staffuserdetails",
                localField: "_id",
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
        ...(search ? [{ $match: searchMatchStage }] : []),
        ...(filter ? [{ $match: filterMatchStage }] : []),
        ...(status ? [{ $match: statusMatchStage }] : []),
        {
            $project: {
                username: 1,
                status: 1,
                _id: 1,
                auth: 1,
                fullname: {
                    $concat: [
                        "$staffuserdetails.firstname",
                        " ",
                        "$staffuserdetails.middlename",
                        " ",
                        "$staffuserdetails.lastname",
                    ],
                },
                contact: "$staffuserdetails.contact",
                address: "$staffuserdetails.address",
                email: "$staffuserdetails.email",
                dateofbirth: "$staffuserdetails.dateofbirth",
                gender: "$staffuserdetails.gender",
            },
        },
        {
            $skip: pageOptions.page * pageOptions.limit,
        },
        {
            $limit: pageOptions.limit,
        },
    ];
    
    const staffuserlist = await Staffusers.aggregate(matchConditionPipeline);
    
    const countPipeline = [
        {
            $lookup: {
                from: "staffuserdetails",
                localField: "_id",
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
        ...(search ? [{ $match: searchMatchStage }] : []),
        ...(filter ? [{ $match: filterMatchStage }] : []),
        ...(status ? [{ $match: statusMatchStage }] : []),
        {
            $count: "total",
        },
    ];
    
    const totalstaffusersResult = await Staffusers.aggregate(countPipeline);
    const totalstaffusers = totalstaffusersResult.length > 0 ? totalstaffusersResult[0].total : 0;
    
    const finalpages = Math.ceil(totalstaffusers / pageOptions.limit);
    
    const finaldata = staffuserlist.map((temp) => ({
        id: temp._id,
        username: temp.username,
        fullname: temp.fullname,
        status: temp.status,
        contact: temp.contact,
        address: temp.address,
        email: temp.email,
        dateofbirth: temp.dateofbirth,
        gender: temp.gender,
        role: temp.auth,
    }));
    
    const data = {
        totalPages: finalpages,
        data: finaldata,
    };
    
    return res.json({ message: "success", data });
    

} 

exports.editStaffUserDetails = async (req, res) => {
    const { id, firstname, middlename, lastname, address, contact, email, dob, gender } = req.body

    if(!dob || !firstname || !middlename || !lastname || !gender || !address || !email || !contact || !id){
        return res.status(400).json({ message: "failed", data: "Incomplete form data."})
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if(!emailRegex.test(email)){
        return res.status(400).json({ message: "failed", data: "Please input a valid email."})
    }

    const isEmailExisting = await Staffuserdetails.findOne({ 
        email: { $regex: `^${email}$`, $options: 'i' }, 
        owner: { $ne: new mongoose.Types.ObjectId(id) }, 
    })
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while searching for email: ${username} Error: ${err}`)
    })

   
    if(isEmailExisting){
        return res.status(400).json({ message: "bad-request", data: "Email has already been used."})
    }

    await Staffuserdetails.findOneAndUpdate({ owner: new mongoose.Types.ObjectId(id) }, {
        firstname: firstname,
        middlename: middlename,
        lastname: lastname,
        address: address,
        contact: contact,
        email: email,
        dateofbirth: dob,
        gender: gender,
    })
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while updating staff user details. Error: ${err}`)
    })

    return res.status(200).json({ message: "success" })
}

exports.banunbanstaffuser = async (req, res) => {
    const { status, id } = req.query

    if(!status || !id){
        return res.status(400).json({ message: "failed", data: "Please input staff user id and status"})
    }

    await Staffusers.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(id)}, { status: status })
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while changing the status of user id: ${id}. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please try again later."})
    })

    return res.status(200).json({ message: "success" })
}

exports.editStaffRole = async (req, res) => {
    const { role, id } = req.body

    if(!id || !role){
        return res.status(400).json({ message: "failed", data: "Please select a staff and user role."})
    }

    await Staffusers.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(id)}, { $set: { auth: role }})
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while changing user role. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please try again later."})
    })

    return res.status(200).json({ message: "success" })
}

exports.getteacherlist = async (req, res) => {
    const { page, limit, status, search } = req.query;

    const pageOptions = {
        page: parseInt(page) || 0,
        limit: parseInt(limit) || 10,
    };
    
    let statusMatchStage = {};
    let searchMatchStage = {};
    
    if (search) {
        searchMatchStage = {
            $or: [
                { username: { $regex: search, $options: 'i' } },
                { "staffuserdetails.email": { $regex: search, $options: 'i' } },
                { "staffuserdetails.lastname": { $regex: search, $options: 'i' } },
                { "staffuserdetails.firstname": { $regex: search, $options: 'i' } },
            ],
        };
    }
    
    if (status === 'active' || status === 'inactive') {
        statusMatchStage = { status: status };
    }
    
    const matchConditionPipeline = [
        {
            $lookup: {
                from: "staffuserdetails",
                localField: "_id",
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
            $match: {
                $or: [
                    { auth: "teacher" },
                    { auth: "adviser" },
                ],
            },
        },
        ...(search ? [{ $match: searchMatchStage }] : []),
        ...(status ? [{ $match: statusMatchStage }] : []),
        {
            $project: {
                username: 1,
                status: 1,
                _id: 1,
                auth: 1,
                fullname: {
                    $concat: [
                        "$staffuserdetails.firstname",
                        " ",
                        "$staffuserdetails.middlename",
                        " ",
                        "$staffuserdetails.lastname",
                    ],
                },
                contact: "$staffuserdetails.contact",
                address: "$staffuserdetails.address",
                email: "$staffuserdetails.email",
                dateofbirth: "$staffuserdetails.dateofbirth",
                gender: "$staffuserdetails.gender",
            },
        },
        {
            $skip: pageOptions.page * pageOptions.limit,
        },
        {
            $limit: pageOptions.limit,
        },
    ];
    
    const staffuserlist = await Staffusers.aggregate(matchConditionPipeline);
    
    const countPipeline = [
        {
            $lookup: {
                from: "staffuserdetails",
                localField: "_id",
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
            $match: {
                $or: [
                    { auth: "teacher" },
                    { auth: "adviser" },
                ],
            },
        },
        ...(search ? [{ $match: searchMatchStage }] : []),
        ...(status ? [{ $match: statusMatchStage }] : []),
        {
            $count: "total",
        },
    ];
    
    const totalstaffusersResult = await Staffusers.aggregate(countPipeline);
    const totalstaffusers = totalstaffusersResult.length > 0 ? totalstaffusersResult[0].total : 0;
    
    const finalpages = Math.ceil(totalstaffusers / pageOptions.limit);
    
    const finaldata = staffuserlist.map((temp) => ({
        id: temp._id,
        username: temp.username,
        fullname: temp.fullname,
        status: temp.status,
        contact: temp.contact,
        address: temp.address,
        email: temp.email,
        dateofbirth: temp.dateofbirth,
        gender: temp.gender,
        role: temp.auth,
    }));
    
    const data = {
        totalPages: finalpages,
        data: finaldata,
    };
    
    return res.json({ message: "success", data });
    

} 
