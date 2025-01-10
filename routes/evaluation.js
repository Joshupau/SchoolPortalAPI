const { createevaluation, getevaluation, getevaluationbyid, deleteevaluation, getstudentevaluationbyprogram } = require("../controllers/evaluation");
const { getevaluationresponse, createevaluationresponse } = require("../controllers/evaluationresponse");
const { protectadmin, protectstudent } = require("../middleware/middleware");

const router = require("express").Router();

router 

// #region ADMIN

.get("/getevaluationad", protectadmin, getevaluation)
.get("/getevaluationbyidad", protectadmin, getevaluationbyid)
.post("/createevaluation", protectadmin, createevaluation)
 .get("/deleteevaluation", protectadmin, deleteevaluation)

 // #endregion


 // #region STUDENT
 
 .get("/getstudentevaluationprogram", protectstudent, getstudentevaluationbyprogram)

 //#endregion

module.exports = router;