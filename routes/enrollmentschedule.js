const { getenrollmentschedule, deleteenrollmentschedule, createenrollmentschedule, editenrollmentschedule } = require("../controllers/enrollmentschedule")
const { protectsuperadmin, protectadmin } = require("../middleware/middleware")

const router = require("express").Router()

router
 
 .get("/getenrollmentschedule", getenrollmentschedule)

 
 // #region SUPERADMIN
 .get("/deleteenrollmentschedule", protectsuperadmin, deleteenrollmentschedule)
 .post("/createenrollmentschedule", protectsuperadmin, createenrollmentschedule)
 .post("/editenrollmentschedule", protectsuperadmin, editenrollmentschedule)
// #endregion


 // #region ADMIN
 .get("/deleteenrollmentschedulead", protectadmin, deleteenrollmentschedule)
 .post("/createenrollmentschedulead", protectadmin, createenrollmentschedule)
 .post("/editenrollmentschedulead", protectadmin, editenrollmentschedule)
// #endregion

module.exports = router