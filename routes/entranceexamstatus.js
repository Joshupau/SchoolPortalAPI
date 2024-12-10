const { entranceexamstatus, setentranceexamstatus, getentranceexamstatus } = require("../controllers/entranceexam")
const { protectticket, protectsuperadmin } = require("../middleware/middleware")

const router = require("express").Router()

router
 .get("/entranceexamstatus", protectticket, entranceexamstatus)
 .get("/setentranceexamstatus", protectsuperadmin, setentranceexamstatus)
 .get("/getentranceexamstatus", protectsuperadmin, getentranceexamstatus)
 
module.exports = router