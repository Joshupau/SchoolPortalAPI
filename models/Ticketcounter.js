const mongoose = require('mongoose');

const TicketCounterSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    value: { type: Number, default: 0 },
});

const Ticketcounter = mongoose.model("Ticketcounter", TicketCounterSchema);

module.exports = Ticketcounter;
