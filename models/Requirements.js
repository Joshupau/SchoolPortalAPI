const { default: mongoose } = require('mongoose')


const RequirementsSchema  = new mongoose.Schema(
    {
        program: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Program"
        },
        level: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Gradelevel"
        },
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
            firstname: {
                type: String,
            },

            maidenname: {
                type: String,
            },
            contact: {
                type: String,
            }
        },
        father: {
            firstname: {
                type: String,
            },
            lastname: {
                type: String,
            },
            contact: {
                type: String,
            }
        },
        guardian: {
            firstname: {
                type: String,
            },
            lastname: {
                type: String,
            },
            contact: {
                type: String,
            }        
        },
        religion: {
            type: String,
        },
        civilstatus: {
            type: String,
        },
        birthdate: {
            type: Date,
        },
        tor: {
            type: String,
        },
        form137: {
            type: String,
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