const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const Ticketcounter = require('./Ticketcounter');

const TicketusersSchema = new mongoose.Schema(
    {
        requirements: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Requirements",
        },
        username: {
            type: String,
            required: true,
            unique: true, 
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
            default: "active",
        },
    },
    {
        timestamps: true,
    }
);

TicketusersSchema.pre("save", async function (next) {
    if (this.isNew) {
        try {
            const counter = await Ticketcounter.findOneAndUpdate(
                { name: "ticketUserCounter" }, 
                { $inc: { value: 1 } },       
                { new: true, upsert: true }   
            );

            this.username = `Ticketuser${counter.value}`; 
        } catch (error) {
            return next(error);
        }
    }

    if (this.isModified("password")) {
        this.password = bcrypt.hashSync(this.password, 10);
    }

    next();
});

TicketusersSchema.methods.matchPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

const Ticketusers = mongoose.model("Ticketusers", TicketusersSchema);
module.exports = Ticketusers;
