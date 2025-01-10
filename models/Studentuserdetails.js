const { default: mongoose } = require('mongoose')


const StudentUserDetailsSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Studentusers"
        },
        level: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Gradelevel"
        },
        program: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Program"
        },
        section: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Section"
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
            middlename: {
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
        form137: {
            type: String,
        },
        tor: {
            type: String,
        },
        birthcertificate: {
            type: String
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


const Studentuserdetails = mongoose.model("Studentuserdetails", StudentUserDetailsSchema)
module.exports = Studentuserdetails