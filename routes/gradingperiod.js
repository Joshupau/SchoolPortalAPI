const { getgradingperiod, updategradingperiod } = require("../controllers/gradingperiod")
const { protectsuperadmin } = require("../middleware/middleware")

const router = require("express").Router()


router
 .get("/getgradingperiod", getgradingperiod)
 .post("/updategradingperiod", protectsuperadmin, updategradingperiod)


module.exports = router