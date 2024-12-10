const { createevent, editevent, deleteevent, getevents } = require("../controllers/Events")
const { protectadmin, protectsuperadmin } = require("../middleware/middleware")

const router = require("express").Router()
const upload = require("../middleware/upload")

const uploadimg = upload.single("image")


router
 .post("/createevent", protectsuperadmin, function (req, res, next){
    uploadimg(req, res, function(err){
        if(err){
            return res.status(400).send({ message: "failed", data: err.message })
        }
        next()
    })},
    createevent)
 .post("/editevent", protectsuperadmin, function (req, res, next){
    uploadimg(req, res, function(err){
        if(err){
            return res.status(400).send({ message: "failed", data: err.message })
        }
        next()
    })},
    editevent)
 .get("/deleteevent", protectsuperadmin, deleteevent)
 .get("/getevents", getevents)

module.exports = router