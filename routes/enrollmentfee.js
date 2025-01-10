const { initalizeenrollmentfee, updateenrollmentfee, getenrollmentfee, deleteenrollmentfee } = require("../controllers/enrollmentfee");
const { protectstaffusers, protectadmin } = require("../middleware/middleware");


const router = require("express").Router();

router
 .get("/initializefee", initalizeenrollmentfee)
 .post("/updatefee", protectadmin, updateenrollmentfee)
 .get("/getfee", protectstaffusers, getenrollmentfee)
 .get("/deletefee", protectadmin, deleteenrollmentfee)
 
module.exports = router;