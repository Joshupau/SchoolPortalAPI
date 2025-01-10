const { staffuserlist, getteacherlist, banunbanstaffuser, editStaffUserDetails, editStaffRole, getUserDetails, changepassword } = require("../controllers/staffuser")
const { protectsuperadmin, protectstaffusers } = require("../middleware/middleware")

const router = require("express").Router()

router

// #region SUPERADMIN
 .get("/staffuserlist", protectsuperadmin, staffuserlist)
 .get("/banunbanstaffuser", protectsuperadmin, banunbanstaffuser)
 .post("/editstaffuserdetails", protectsuperadmin, editStaffUserDetails)
 .post("/editstaffrole", protectsuperadmin, editStaffRole)
 .get("/getteacherlist", protectsuperadmin, getteacherlist)
// #endregion

 
// #region STAFFUSERS
 .get("/getuserdetails", protectstaffusers, getUserDetails)
 .get("/changepassword", protectstaffusers, changepassword)
// #endregion
module.exports = router