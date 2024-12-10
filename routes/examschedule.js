const { CreateExamSchedule, getExamSchedules, selectExamSchedules, EditExamSchedule, deleteSchedule, getSelectedExamSchedule } = require("../controllers/examschedule")
const { protectticket, protectsuperadmin } = require("../middleware/middleware")

const router = require("express").Router()

router
.post("/createexamschedule", protectsuperadmin, CreateExamSchedule)
.post("/editexamschedule", protectsuperadmin, EditExamSchedule)
.get("/deleteschedule", protectsuperadmin, deleteSchedule)
.get("/getexamschedule", getExamSchedules)
.get("/selectexamschedule", protectticket, selectExamSchedules)
.get("/getselectedexamschedule", protectticket, getSelectedExamSchedule)
module.exports = router