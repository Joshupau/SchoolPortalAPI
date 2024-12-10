const { getTicketuserinfo } = require("../controllers/ticketuser")
const { protectticket } = require("../middleware/middleware")

const router = require("express").Router()

router
 .get("/getticketuserinfo", protectticket, getTicketuserinfo)

module.exports = router