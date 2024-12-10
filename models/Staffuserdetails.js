const { default: mongoose } = require('mongoose')


const StaffUserDetailsSchema = new mongoose.Schema(
    {
        // idnumber: {
        //     type: String,
        //     unique: true,
        // },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Staffusers"
        },
        firstname: {
            type: String,
        },
        middlename: {
            type: String,
        },
        lastname: {
            type: String,
        },
        gender: {
            type: String
        },
        dateofbirth: {
            type: Date
        },
        address: {
            type: String
        },
        email: {
            type: String
        },
        contact: {
            type: Number
        },
        profilepicture: {
            type: String,
        }
    }, 
    {
        timestamps: true,
    }
)


const Staffuserdetails = mongoose.model("Staffuserdetails", StaffUserDetailsSchema)
module.exports = Staffuserdetails