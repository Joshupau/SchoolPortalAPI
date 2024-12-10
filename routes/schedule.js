const { createSchedule, getSchedulesByTeacher, getSchedulesBySection, editSchedule, deletschedule  } = require("../controllers/schedule")
const { protectsuperadmin } = require("../middleware/middleware")

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



module.exports = router