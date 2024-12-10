const { getStudentusernamepw } = require("../controllers/studentuser")
const { protectticket } = require("../middleware/middleware")

const router = require("express").Router()

router
 .get("/getstudentusernamepw", protectticket, getStudentusernamepw)

module.exports = router