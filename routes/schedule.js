const { createSchedule, getSchedulesByTeacher, getSchedulesBySection, editSchedule, deletschedule, getSchedulesTeacher, getStudentSchedule, getsubjectsectionbyteacherid  } = require("../controllers/schedule")
const { protectsuperadmin, protectteacheradviser, protectstudent } = require("../middleware/middleware")

const router = require("express").Router()

router

// #region SUPERADMIN

.post("/createschedule", protectsuperadmin, createSchedule)
.post("/editschedule", protectsuperadmin, editSchedule)
.get("/getschedulebyteacher", protectsuperadmin, getSchedulesByTeacher)
.get("/getschedulebysection", protectsuperadmin, getSchedulesBySection)
.get("/deleteschedule", protectsuperadmin, deletschedule)
// #endregion


// #region TEACHER

.get("/getteacherschedule", protectteacheradviser, getSchedulesTeacher)
.get("/getsubjectsectionbyteacherid", protectteacheradviser, getsubjectsectionbyteacherid)

// #endregion


//#region STUDENT

.get("/getschedulebysectionst", protectstudent, getSchedulesBySection)
.get("/getstudentschedule", protectstudent, getStudentSchedule)

//#endregion
module.exports = router