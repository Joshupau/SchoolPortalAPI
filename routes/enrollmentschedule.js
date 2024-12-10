const { getenrollmentschedule, deleteenrollmentschedule, createenrollmentschedule, editenrollmentschedule } = require("../controllers/enrollmentschedule")
const { protectsuperadmin } = require("../middleware/middleware")

const router = require("express").Router()

router
 .get("/getenrollmentschedule", getenrollmentschedule)
 .get("/deleteenrollmentschedule", protectsuperadmin, deleteenrollmentschedule)
 .post("/createenrollmentschedule", protectsuperadmin, createenrollmentschedule)
 .post("/editenrollmentschedule", protectsuperadmin, editenrollmentschedule)

module.exports = router