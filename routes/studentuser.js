const { getStudentusernamepw, getstudentuserdetails } = require("../controllers/studentuser")
const { protectticket, protectstudent } = require("../middleware/middleware")

const router = require("express").Router()

router
.get("/getstudentusernamepw", protectticket, getStudentusernamepw)


.get("/getstudentuserdetails", protectstudent, getstudentuserdetails)

module.exports = router