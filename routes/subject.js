const { createSubject, getSubjects, deletesubjects, editsubjects } = require("../controllers/subject")
const { protectsuperadmin } = require("../middleware/middleware")

const router = require("express").Router()

router
.post("/createsubject", protectsuperadmin, createSubject)
.get("/getsubjects", protectsuperadmin, getSubjects)
.get("/editsubjects", protectsuperadmin, editsubjects)
.get("/deletesubjects", protectsuperadmin, deletesubjects)

module.exports = router

