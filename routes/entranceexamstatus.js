const { entranceexamstatus, setentranceexamstatus, getentranceexamstatus } = require("../controllers/entranceexam")
const { protectticket, protectsuperadmin, protectadmin } = require("../middleware/middleware")

const router = require("express").Router()

router
// #region SUPERADMIN
.get("/setentranceexamstatus", protectsuperadmin, setentranceexamstatus)
.get("/getentranceexamstatus", protectsuperadmin, getentranceexamstatus)
// #endregion

// #region Admin
.get("/setentranceexamstatusad", protectadmin, setentranceexamstatus)
.get("/getentranceexamstatusad", protectadmin, getentranceexamstatus)
// #endregion

// #region TICKET USER
.get("/entranceexamstatus", protectticket, entranceexamstatus)
// #endregion

module.exports = router