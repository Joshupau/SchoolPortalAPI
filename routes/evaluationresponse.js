const { getevaluationresponse, createevaluationresponse } = require("../controllers/evaluationresponse");
const { protectadmin, protectstudent } = require("../middleware/middleware");

const router = require("express").Router();

router
 // #region ADMIN
 
.get("/getevaluationresponse", protectadmin, getevaluationresponse)
 
// #endregion
  
.post("/createevaluationresponse", protectstudent, createevaluationresponse)
 
// #endregion


module.exports = router;