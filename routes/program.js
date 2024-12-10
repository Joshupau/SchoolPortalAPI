const router = require("express").Router()
const { getAllPrograms, CreateProgram, DeleteProgram, EditProgram, getAllProgramsWithEnrollmentSchedule } = require("../controllers/program");
const { protectsuperadmin } = require("../middleware/middleware");


router
.get("/getallprogram", getAllPrograms)
.get("/getallprogramswithenrollmentschedule", getAllProgramsWithEnrollmentSchedule)
.get("/deleteprogram", protectsuperadmin, DeleteProgram)
.post("/createprogram", protectsuperadmin, CreateProgram)
.post("/editprogram", protectsuperadmin, EditProgram)


module.exports = router;