const { createsection, getAllSections, editSection, deleteSection, getSectionByGradeLevel } = require("../controllers/section")
const { protectsuperadmin } = require("../middleware/middleware")

const router = require("express").Router()

router
.post("/createsection", protectsuperadmin, createsection)
.get("/getallsections", protectsuperadmin, getAllSections)
.get("/getsectionbygradelevel", protectsuperadmin, getSectionByGradeLevel)
.post("/editsection", protectsuperadmin, editSection)
.get("/deletesection", protectsuperadmin, deleteSection)

module.exports = router