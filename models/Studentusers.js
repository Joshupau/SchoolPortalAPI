const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const Ticketcounter = require('./Ticketcounter') // Import Ticketcounter model

const StudentUsersSchema = new mongoose.Schema(
    {
        ticketid: {
            type: mongoose.Schema.Types.ObjectId,
            unique: true,
        },
        username: {
            type: String,
            required: true,
            unique: true, // Ensure the username is unique
        },
        password: {
            type: String,
            required: true,
        },
        webtoken: {
            type: String,
        },
        status: {
            type: String,
            default: "active"
        },
    }, 
    {
        timestamps: true,
    }
)

// Pre-save hook to automatically set username and hash the password
StudentUsersSchema.pre("save", async function (next) {
    if (this.isNew) {
        try {
            const counter = await Ticketcounter.findOneAndUpdate(
                { name: "studentUserCounter" }, 
                { $inc: { value: 1 } }, 
                { new: true, upsert: true } 
            );

            this.username = `Studentuser${counter.value}`; 
        } catch (error) {
            return next(error);
        }
    }

    if (this.isModified("password")) {
        this.password = await bcrypt.hashSync(this.password, 10);
    }

    next();
});

StudentUsersSchema.methods.matchPassword = async function(password){
    return await bcrypt.compare(password, this.password);
}

const Studentusers = mongoose.model("Studentusers", StudentUsersSchema);
module.exports = Studentusers;
