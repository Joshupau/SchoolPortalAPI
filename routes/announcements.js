const { createannouncement, editannouncement, deleteannouncement, getannouncement } = require("../controllers/announcement")
const { protectadmin, protectsuperadmin } = require("../middleware/middleware")

const router = require("express").Router()
const upload = require("../middleware/upload")

const uploadimg = upload.single("image")


router
 .post("/createannouncement", protectsuperadmin, function (req, res, next){
    uploadimg(req, res, function(err){
        if(err){
            return res.status(400).send({ message: "failed", data: err.message })
        }
        next()
    })},
    createannouncement)
 .post("/editannouncement", protectsuperadmin, function (req, res, next){
    uploadimg(req, res, function(err){
        if(err){
            return res.status(400).send({ message: "failed", data: err.message })
        }
        next()
    })},
    editannouncement)
 .get("/deleteannouncement", protectsuperadmin, deleteannouncement)
 .get("/getannouncement", getannouncement)

module.exports = router