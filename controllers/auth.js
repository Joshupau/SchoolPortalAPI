
//  Import all mandatory schemas and delete this if necessary
const Staffusers = require("../models/Staffusers")
const Staffuserdetails = require("../models/Staffuserdetails");
const Ticketusers = require("../models/Ticketusers")
const Studentusers = require("../models/Studentusers")

const fs = require('fs')

const bcrypt = require('bcrypt');
const jsonwebtokenPromisified = require('jsonwebtoken-promisified');
const path = require("path");

const privateKey = fs.readFileSync(path.resolve(__dirname, "../keys/private-key.pem"), 'utf-8');
const { default: mongoose } = require("mongoose");

const encrypt = async password => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}

exports.registerStaff = async(req, res) => {

    const { username, password, role, dob, firstname, middlename, lastname, gender, address, email, contact  } = req.body

    if(!username || !password || !role || !dob || !firstname || !middlename || !lastname || !gender || !address || !email || !contact){
        return res.status(400).json({ message: "failed", data: "Incomplete form data."})
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if(!emailRegex.test(email)){
        return res.status(400).json({ message: "failed", data: "Please input a valid email."})
    }
    if(username.length < 5 || username.length > 30){
        return res.status(400).json({ message: "failed", data: "Username must be greater than 5 characters and less than 30 characters."})
    }
    const isExisting = await Staffusers.findOne({ username: { $regex: `^${username}$`, $options: 'i' } })
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while searching for user: ${username} Error: ${err}`)
    })
   
    if(isExisting){
        return res.status(400).json({ message: "bad-request", data: "Username has already been used."})
    }

    const isEmailExisting = await Staffuserdetails.findOne({ email: { $regex: `^${email}$`, $options: 'i' } })
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while searching for email: ${username} Error: ${err}`)
    })
   
    if(isEmailExisting){
        return res.status(400).json({ message: "bad-request", data: "Email has already been used."})
    }

    await Staffusers.create({
        username: username,
        password: password,
        auth: role,
        webtoken: "",
    })
    .then(async data => {
        await Staffuserdetails.create({
            owner: data._id,
            firstname: firstname,
            middlename: middlename,
            lastname: lastname,
            gender: gender,
            dateofbirth: dob,
            address: address,
            email: email,
            contact: contact,
            profilepicture: ""
        })
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem encountered while creating teacher user details. Error: ${err}`)
            return res.status(400).json({ message: "bad-request1", data: "There's a problem with the server. Please contact support for more details."})
        })
        return res.status(200).json({ message: "success"})
    })
    .catch(err => {
        console.log(`There's a problem encountered while creating teacher ${role} user. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details."})
    })
    
}


exports.authlogin = async(req, res) => {
    const { username, password } = req.query;

    Ticketusers.findOne({ username: { $regex: new RegExp('^' + username + '$', 'i') } })
    .then(async user => {
        if (user && (await user.matchPassword(password))){
            if (user.status != "active"){
                return res.status(401).json({ message: 'failed', data: `Your account had been ${user.status}! Please contact support for more details.` });
            }

            const token = await encrypt(privateKey)

            await Ticketusers.findByIdAndUpdate({_id: user._id}, {$set: {webtoken: token}}, { new: true })
            .then(async () => {
                const payload = { id: user._id, username: user.username, status: user.status, token: token, auth: "ticket" }

                let jwtoken = ""

                try {
                    jwtoken = await jsonwebtokenPromisified.sign(payload, privateKey, { algorithm: 'RS256' });
                } catch (error) {
                    console.error('Error signing token:', error.message);
                    return res.status(500).json({ error: 'Internal Server Error', data: "There's a problem signing in! Please contact customer support for more details! Error 004" });
                }

                res.cookie('sessionToken', jwtoken, { secure: true, sameSite: 'None' } )
                return res.json({message: "success", data: {
                    auth: "ticket"
                }})
            })
            .catch(err => res.status(400).json({ message: "bad-request2", data: "There's a problem with your account! There's a problem with your account! Please contact customer support for more details."  + err }))
        }
        else{
            await Staffusers.findOne({ username: { $regex: new RegExp('^' + username + '$', 'i') } })
            .then(async staffuser => {
                if (staffuser && (await staffuser.matchPassword(password))){
                    if (staffuser.status != "active"){
                        return res.status(401).json({ message: 'failed', data: `Your account had been ${staffuser.status}! Please contact support for more details.` });
                    }

                    const token = await encrypt(privateKey)

                    await Staffusers.findByIdAndUpdate({_id: staffuser._id}, {$set: {webtoken: token}}, { new: true })
                    .then(async () => {
                        const payload = { id: staffuser._id, username: staffuser.username, status: staffuser.status, token: token, auth: staffuser.auth }

                        let jwtoken = ""

                        try {
                            jwtoken = await jsonwebtokenPromisified.sign(payload, privateKey, { algorithm: 'RS256' });
                        } catch (error) {
                            console.error('Error signing token:', error.message);
                            return res.status(500).json({ error: 'Internal Server Error', data: "There's a problem signing in! Please contact customer support for more details! Error 004" });
                        }

                        res.cookie('sessionToken', jwtoken, { secure: true, sameSite: 'None' } )
                        return res.json({message: "success", data: {
                                auth: staffuser.auth
                            }
                        })
                    })
                    .catch(err => res.status(400).json({ message: "bad-request2", data: "There's a problem with your account! There's a problem with your account! Please contact customer support for more details."  + err }))
                } else {        
                    await Studentusers.findOne({ username: { $regex: new RegExp('^' + username + '$', 'i') } })
                    .then(async studentuser => {
                        if (studentuser && (await studentuser.matchPassword(password))){
                            if (studentuser.status != "active"){
                                return res.status(401).json({ message: 'failed', data: `Your account had been ${studentuser.status}! Please contact support for more details.` });
                            }

                            const token = await encrypt(privateKey)
        
                            await Studentusers.findByIdAndUpdate({_id: studentuser._id}, {$set: {webtoken: token}}, { new: true })
                            .then(async () => {
                                const payload = { id: studentuser._id, username: studentuser.username, status: studentuser.status, token: token, auth: "student" }
        
                                let jwtoken = ""

                                try {
                                    jwtoken = await jsonwebtokenPromisified.sign(payload, privateKey, { algorithm: 'RS256' });
                                } catch (error) {
                                    console.error('Error signing token:', error.message);
                                    return res.status(500).json({ error: 'Internal Server Error', data: "There's a problem signing in! Please contact customer support for more details! Error 004" });
                                }

                                res.cookie('sessionToken', jwtoken, { secure: true, sameSite: 'None' } )
                                return res.json({message: "success", data: {
                                        auth: "student"
                                    }
                                })
                            })
                            .catch(err => res.status(400).json({ message: "bad-request2", data: "There's a problem with your account! There's a problem with your account! Please contact customer support for more details."  + err }))
                        }
                        else{
                            return res.json({message: "failed", data: "Username/Password does not match! Please try again using the correct credentials!"})
                        }
                    })
                    .catch(err => res.status(400).json({ message: "bad-request1", data: "There's a problem with your account! There's a problem with your account! Please contact customer support for more details." }))
                }
            })
            .catch(err => res.status(400).json({ message: "bad-request1", data: "There's a problem with your account! There's a problem with your account! Please contact customer support for more details." }))
        } 
    })
    .catch(err => res.status(400).json({ message: "bad-request1", data: "There's a problem with your account! There's a problem with your account! Please contact customer support for more details." }))
}

exports.logout = async (req, res) => {
    res.clearCookie('sessionToken', { path: '/' })
    return res.json({message: "success"})
}