const { submitrequirement, getrequirements, approvedenyrequirements, viewrequirementsstatus, reapplyRequirements } = require("../controllers/requirements")
const { protectsuperadmin, protectticket, protectadmin } = require("../middleware/middleware")


const upload = require("../middleware/upload")

const fileupload = upload.fields([
    { name: 'form', maxCount: 1}, 
    { name: 'bc', maxCount: 1},
    { name: 'tor', maxCount: 1}
])


const router = require("express").Router()

router

// #region SUPERADMIN
.get("/getrequirements",protectsuperadmin, getrequirements)
.get("/approvedenyrequirement",protectsuperadmin, approvedenyrequirements)
// #endregion


// #region ADMIN
.get("/getrequirementsad", protectadmin, getrequirements)
.get("/approvedenyrequirementad", protectadmin, approvedenyrequirements)
// #endregion


// #region TICKET
.get("/viewrequirementsstatus", protectticket, viewrequirementsstatus)
.post("/submitrequirement", 
    function (req, res, next){
        fileupload(req, res, function(err){
            if(err){
                return res.status(400).send({ message: 'failed', data: err.message})
            }
            next()
        })
 }, submitrequirement) 
 .post("/reapplyrequirement", 
    function (req, res, next){
        fileupload(req, res, function(err){
            if(err){
                return res.status(400).send({ message: 'failed', data: err.message})
            }
            next()
        })
 }, protectticket, reapplyRequirements)
// #endregion
module.exports = router