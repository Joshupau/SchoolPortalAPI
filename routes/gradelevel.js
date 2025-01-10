const { getAllGradelevels, deletegradelevel, editgradelevel, creategradelevel, gradelevellist, getGradeLevelByProgram } = require("../controllers/gradelevel");
const { protectsuperadmin } = require("../middleware/middleware");

const router = require("express").Router()

router
.get("/getallgradelevel", getAllGradelevels)
.get("/getgradelevelbyprogram", getGradeLevelByProgram)
.get("/getgradelevelbyenrollmentschedule", getGradeLevelByProgram)
.get("/gradelevellist", gradelevellist)


// #region SUPERADMIN
.post("/creategradelevel", protectsuperadmin, creategradelevel)
.post("/editgradelevel", protectsuperadmin, editgradelevel)
.get("/deletegradelevel", protectsuperadmin, deletegradelevel)
.get("/getallgradelevelsa", protectsuperadmin, getAllGradelevels)

module.exports = router;