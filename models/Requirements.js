const { default: mongoose } = require('mongoose')


const RequirementsSchema  = new mongoose.Schema(
    {
        firstname: {
            type: String 
        },
        middlename: {
            type: String 
        },
        lastname: {
            type: String 
        },
        address: {
            type: String
        },
        email: {
            type: String,
        },
        gender: {
            type: String
        },
        phonenumber: {
            type: Number,
        },
        telephonenumber: {
            type: Number,
        },
        mother: {
            type: String,
        },
        father: {
            type: String
        },
        form137: {
            type: String,
        },
        program: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Program"
        },
        level: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Gradelevel"
        },
        birthcertificate: {
            type: String
        },
        status: {
            type: String,
            default: "pending"
        },
        denyreason: {
            type: String,
        }
    },
    {
        timestamps: true,
    }
)

const Requirements = mongoose.model("Requirements", RequirementsSchema)
module.exports = Requirements