const mongoose = require('mongoose');

const SayılarSchema = new mongoose.Schema({
    openedTicketCount: { type: Number, default: 0 },
    bannedUserCount: { type: Number, default: 0 }
});

const Sayılar = mongoose.model('Sayılar', SayılarSchema);

module.exports = Sayılar;