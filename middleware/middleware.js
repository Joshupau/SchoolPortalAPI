
const Staffusers = require("../models/Staffusers")
const Ticketusers = require("../models/Ticketusers")
const Studentusers = require("../models/Studentusers")

const fs = require('fs');
const path = require("path");
const publicKey = fs.readFileSync(path.resolve(__dirname, "../keys/public-key.pem"), 'utf-8');
const jsonwebtokenPromisified = require('jsonwebtoken-promisified');

const verifyJWT = async (token) => {
    try {
        const decoded = await jsonwebtokenPromisified.verify(token, publicKey, { algorithms: ['RS256'] });
        return decoded;
    } catch (error) {
        console.error('Invalid token:', error.message);
        throw new Error('Invalid token');
    }
};

exports.protectsuperadmin = async (req, res, next) => {
    const token = req.headers.cookie?.split('; ').find(row => row.startsWith('sessionToken='))?.split('=')[1]

    if (!token){
        return res.status(401).json({ message: 'Unauthorized', data: "You are not authorized to view this page. Please login the right account to view the page." });
    }

    try{
        const decodedToken = await verifyJWT(token);

        if (decodedToken.auth != "superadmin"){
            return res.status(401).json({ message: 'Unauthorized', data: "You are not authorized to view this page. Please login the right account to view the page." });
        }

        const user = await Staffusers.findOne({username: decodedToken.username})
        .then(data => data)

        if (!user){
            res.clearCookie('sessionToken', { path: '/' })
            return res.status(401).json({ message: 'Unauthorized', data: "You are not authorized to view this page. Please login the right account to view the page." });
        }

        if (user.status != "active"){
            res.clearCookie('sessionToken', { path: '/' })
            return res.status(401).json({ message: 'failed', data: `Your account had been ${user.status}! Please contact support for more details.` });
        }

        // if (decodedToken.token != user.webtoken){
        //     res.clearCookie('sessionToken', { path: '/' })
        //     return res.status(401).json({ message: 'duallogin', data: `Your account had been opened on another device! You will now be logged out.` });
        // }

        req.user = decodedToken;
        next();
    }
    catch(ex){
        return res.status(401).json({ message: 'Unauthorized', data: "You are not authorized to view this page. Please login the right account to view the page." });
    }
}

exports.protectadmin = async (req, res, next) => {
    const token = req.headers.cookie?.split('; ').find(row => row.startsWith('sessionToken='))?.split('=')[1]

    if (!token){
        return res.status(401).json({ message: 'Unauthorized', data: "You are not authorized to view this page. Please login the right account to view the page." });
    }

    try{
        const decodedToken = await verifyJWT(token);

        if (decodedToken.auth != "admin"){
            return res.status(401).json({ message: 'Unauthorized', data: "You are not authorized to view this page. Please login the right account to view the page." });
        }

        const user = await Staffusers.findOne({username: decodedToken.username})
        .then(data => data)

        if (!user){
            res.clearCookie('sessionToken', { path: '/' })
            return res.status(401).json({ message: 'Unauthorized', data: "You are not authorized to view this page. Please login the right account to view the page." });
        }

        if (user.status != "active"){
            res.clearCookie('sessionToken', { path: '/' })
            return res.status(401).json({ message: 'failed', data: `Your account had been ${user.status}! Please contact support for more details.` });
        }

        if (decodedToken.token != user.webtoken){
            res.clearCookie('sessionToken', { path: '/' })
            return res.status(401).json({ message: 'duallogin', data: `Your account had been opened on another device! You will now be logged out.` });
        }

        req.user = decodedToken;
        next();
    }
    catch(ex){
        return res.status(401).json({ message: 'Unauthorized', data: "You are not authorized to view this page. Please login the right account to view the page." });
    }
}

exports.protectticket = async (req, res, next) => {
    const token = req.headers.cookie?.split('; ').find(row => row.startsWith('sessionToken='))?.split('=')[1]

    if (!token){
        return res.status(401).json({ message: 'Unauthorized', data: "You are not authorized to view this page. Please login the right account to view the page." });
    }

    try{
        const decodedToken = await verifyJWT(token);

        if (decodedToken.auth != "ticket"){
            return res.status(401).json({ message: 'Unauthorized', data: "You are not authorized to view this page. Please login the right account to view the page." });
        }

        const user = await Ticketusers.findOne({username: decodedToken.username})
        .then(data => data)

        if (!user){
            res.clearCookie('sessionToken', { path: '/' })
            return res.status(401).json({ message: 'Unauthorized', data: "You are not authorized to view this page. Please login the right account to view the page." });
        }

        if (user.status != "active"){
            res.clearCookie('sessionToken', { path: '/' })
            return res.status(401).json({ message: 'failed', data: `Your account had been ${user.status}! Please contact support for more details.` });
        }

        if (decodedToken.token != user.webtoken){
            res.clearCookie('sessionToken', { path: '/' })
            return res.status(401).json({ message: 'duallogin', data: `Your account had been opened on another device! You will now be logged out.` });
        }

        req.user = decodedToken;
        next();
    }
    catch(ex){
        return res.status(401).json({ message: 'Unauthorized', data: "You are not authorized to view this page. Please login the right account to view the page." });
    }
}
exports.protectstudent = async (req, res, next) => {
    const token = req.headers.cookie?.split('; ').find(row => row.startsWith('sessionToken='))?.split('=')[1]

    if (!token){
        return res.status(401).json({ message: 'Unauthorized', data: "You are not authorized to view this page. Please login the right account to view the page." });
    }

    try{
        const decodedToken = await verifyJWT(token);

        if (decodedToken.auth != "student"){
            return res.status(401).json({ message: 'Unauthorized', data: "You are not authorized to view this page. Please login the right account to view the page." });
        }

        const user = await Studentusers.findOne({username: decodedToken.username})
        .then(data => data)

        if (!user){
            res.clearCookie('sessionToken', { path: '/' })
            return res.status(401).json({ message: 'Unauthorized', data: "You are not authorized to view this page. Please login the right account to view the page." });
        }

        if (user.status != "active"){
            res.clearCookie('sessionToken', { path: '/' })
            return res.status(401).json({ message: 'failed', data: `Your account had been ${user.status}! Please contact support for more details.` });
        }

        if (decodedToken.token != user.webtoken){
            res.clearCookie('sessionToken', { path: '/' })
            return res.status(401).json({ message: 'duallogin', data: `Your account had been opened on another device! You will now be logged out.` });
        }

        req.user = decodedToken;
        next();
    }
    catch(ex){
        return res.status(401).json({ message: 'Unauthorized', data: "You are not authorized to view this page. Please login the right account to view the page." });
    }
}

exports.protectteacheradviser = async (req, res, next) => {
    const token = req.headers.cookie?.split('; ').find(row => row.startsWith('sessionToken='))?.split('=')[1]

    if (!token){
        return res.status(401).json({ message: 'Unauthorized', data: "You are not authorized to view this page. Please login the right account to view the page." });
    }

    try{
        const decodedToken = await verifyJWT(token);

        if (decodedToken.auth != "teacher" && decodedToken.auth != "adviser" ){
            return res.status(401).json({ message: 'Unauthorized', data: "You are not authorized to view this page. Please login the right account to view the page." });
        }

        const user = await Staffusers.findOne({username: decodedToken.username})
        .then(data => data)

        if (!user){
            res.clearCookie('sessionToken', { path: '/' })
            return res.status(401).json({ message: 'Unauthorized', data: "You are not authorized to view this page. Please login the right account to view the page." });
        }

        if (user.status != "active"){
            res.clearCookie('sessionToken', { path: '/' })
            return res.status(401).json({ message: 'failed', data: `Your account had been ${user.status}! Please contact support for more details.` });
        }

        if (decodedToken.token != user.webtoken){
            res.clearCookie('sessionToken', { path: '/' })
            return res.status(401).json({ message: 'duallogin', data: `Your account had been opened on another device! You will now be logged out.` });
        }

        req.user = decodedToken;
        next();
    }
    catch(ex){
        return res.status(401).json({ message: 'Unauthorized', data: "You are not authorized to view this page. Please login the right account to view the page." });
    }
}

exports.protectfinance = async (req, res, next) => {
    const token = req.headers.cookie?.split('; ').find(row => row.startsWith('sessionToken='))?.split('=')[1]

    if (!token){
        return res.status(401).json({ message: 'Unauthorized', data: "You are not authorized to view this page. Please login the right account to view the page." });
    }

    try{
        const decodedToken = await verifyJWT(token);

        if (decodedToken.auth != "finance" ){
            return res.status(401).json({ message: 'Unauthorized', data: "You are not authorized to view this page. Please login the right account to view the page." });
        }

        const user = await Staffusers.findOne({username: decodedToken.username})
        .then(data => data)

        if (!user){
            res.clearCookie('sessionToken', { path: '/' })
            return res.status(401).json({ message: 'Unauthorized', data: "You are not authorized to view this page. Please login the right account to view the page." });
        }

        if (user.status != "active"){
            res.clearCookie('sessionToken', { path: '/' })
            return res.status(401).json({ message: 'failed', data: `Your account had been ${user.status}! Please contact support for more details.` });
        }

        if (decodedToken.token != user.webtoken){
            res.clearCookie('sessionToken', { path: '/' })
            return res.status(401).json({ message: 'duallogin', data: `Your account had been opened on another device! You will now be logged out.` });
        }

        req.user = decodedToken;
        next();
    }
    catch(ex){
        return res.status(401).json({ message: 'Unauthorized', data: "You are not authorized to view this page. Please login the right account to view the page." });
    }
}

exports.protectregistrar = async (req, res, next) => {
    const token = req.headers.cookie?.split('; ').find(row => row.startsWith('sessionToken='))?.split('=')[1]

    if (!token){
        return res.status(401).json({ message: 'Unauthorized', data: "You are not authorized to view this page. Please login the right account to view the page." });
    }

    try{
        const decodedToken = await verifyJWT(token);

        if (decodedToken.auth != "registrar" ){
            return res.status(401).json({ message: 'Unauthorized', data: "You are not authorized to view this page. Please login the right account to view the page." });
        }

        const user = await Staffusers.findOne({username: decodedToken.username})
        .then(data => data)

        if (!user){
            res.clearCookie('sessionToken', { path: '/' })
            return res.status(401).json({ message: 'Unauthorized', data: "You are not authorized to view this page. Please login the right account to view the page." });
        }

        if (user.status != "active"){
            res.clearCookie('sessionToken', { path: '/' })
            return res.status(401).json({ message: 'failed', data: `Your account had been ${user.status}! Please contact support for more details.` });
        }

        if (decodedToken.token != user.webtoken){
            res.clearCookie('sessionToken', { path: '/' })
            return res.status(401).json({ message: 'duallogin', data: `Your account had been opened on another device! You will now be logged out.` });
        }

        req.user = decodedToken;
        next();
    }
    catch(ex){
        return res.status(401).json({ message: 'Unauthorized', data: "You are not authorized to view this page. Please login the right account to view the page." });
    }
}
exports.protectstaffusers = async (req, res, next) => {
    const token = req.headers.cookie?.split('; ').find(row => row.startsWith('sessionToken='))?.split('=')[1]

    if (!token){
        return res.status(401).json({ message: 'Unauthorized', data: "You are not authorized to view this page. Please login the right account to view the page." });
    }

    try{
        const allowedRoles = ["registrar", "adviser", "admin", "superadmin", "teacher", "finance"];

        const decodedToken = await verifyJWT(token);
        
        if (!allowedRoles.includes(decodedToken.auth)) {
            return res.status(401).json({
                message: 'Unauthorized',
                data: "You are not authorized to view this page. Please login with the right account to view the page."
            });
        }

        const user = await Staffusers.findOne({username: decodedToken.username})
        .then(data => data)

        if (!user){
            res.clearCookie('sessionToken', { path: '/' })
            return res.status(401).json({ message: 'Unauthorized', data: "You are not authorized to view this page. Please login the right account to view the page." });
        }

        if (user.status != "active"){
            res.clearCookie('sessionToken', { path: '/' })
            return res.status(401).json({ message: 'failed', data: `Your account had been ${user.status}! Please contact support for more details.` });
        }

        if (decodedToken.token != user.webtoken){
            res.clearCookie('sessionToken', { path: '/' })
            return res.status(401).json({ message: 'duallogin', data: `Your account had been opened on another device! You will now be logged out.` });
        }

        req.user = decodedToken;
        next();
    }
    catch(ex){
        return res.status(401).json({ message: 'Unauthorized', data: "You are not authorized to view this page. Please login the right account to view the page." });
    }
}
