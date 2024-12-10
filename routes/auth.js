const router = require("express").Router()
const { authlogin, register, registerstaffs, logout, registerTeacher, registerAdmin, registerStaff } = require("../controllers/auth")
// const { protectsuperadmin } = require("../middleware/middleware")

router
.get("/login", authlogin)
.get("/logout", logout)
.post("/registerstaff", registerStaff)

module.exports = router;
