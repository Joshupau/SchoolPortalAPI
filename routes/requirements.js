const { submitrequirement, getrequirements, approvedenyrequirements, viewrequirementsstatus, reapplyRequirements } = require("../controllers/requirements")
const { protectsuperadmin, protectticket } = require("../middleware/middleware")


const upload = require("../middleware/upload")

const fileupload = upload.fields([
    { name: 'form', maxCount: 1}, 
    { name: 'bc', maxCount: 1}
])


const router = require("express").Router()

router
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
 .get("/getrequirements",protectsuperadmin, getrequirements)
 .get("/approvedenyrequirement",protectsuperadmin, approvedenyrequirements)
 .get("/viewrequirementsstatus", protectticket, viewrequirementsstatus)
module.exports = router