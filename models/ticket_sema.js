const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
    whOpen: { type: String, required: true },
    date: { type: Date, default: Date.now },
    odanınismi: { type: String },
    desteginkonusu: { type: String }
});

const Ticket = mongoose.model('Ticket', TicketSchema);

module.exports = Ticket;
