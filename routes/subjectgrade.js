const { getstudentsubjectgrade, createsubjectgrade, getsubjectgradestudent, getsubjectgradebystudentid, editsubjectgrade, deletesubjectgrade, getteachersubjects, getteachersubjectsection } = require("../controllers/subjectgrade")
const { protectteacheradviser, protectstudent, protectsuperadmin } = require("../middleware/middleware")

const router = require("express").Router()

router
 .get("/getstudentsubjectgrade", protectteacheradviser, getstudentsubjectgrade)
 .post("/createsubjectgrade", protectsuperadmin, createsubjectgrade)
 .post("/updatesubjectgrade", protectsuperadmin, editsubjectgrade)
 .post("/deletesubjectgrade", protectsuperadmin, deletesubjectgrade)
 .get("/getsubjectgradebystudentidta", protectteacheradviser, getsubjectgradebystudentid)

 .get("/getsubjectgradestudent", protectstudent, getsubjectgradestudent)

 .get("/getsubjectgradebystudentidsa", protectsuperadmin, getsubjectgradebystudentid)

 //teacher
 .get("/getsubjectteacher", protectteacheradviser, getteachersubjects)
 .get("/getsubjectsectionteacher", protectteacheradviser, getteachersubjectsection)
 .post("/createsubjectgradeteacher", protectteacheradviser, createsubjectgrade)




module.exports = router