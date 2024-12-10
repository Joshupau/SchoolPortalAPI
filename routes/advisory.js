const { createAdvisory, getAdvisory, editAdvisoryTeacher, deleteAdvisory } = require("../controllers/advisory")
const { protectsuperadmin } = require("../middleware/middleware")

const router = require("express").Router()

router
.post("/createadvisory", protectsuperadmin, createAdvisory)
.get("/getadvisory", protectsuperadmin, getAdvisory)
.post("/editadvisoryteacher", protectsuperadmin, editAdvisoryTeacher)
.get("/deleteadvisory", protectsuperadmin, deleteAdvisory)

module.exports = router