const mongoose = require('mongoose');

const afkSchema = new mongoose.Schema({
    userID: { type: String, required: true, unique: true },
    sebep: { type: String, required: true },
    gırıszaman: { type: Date, default: Date.now }
});

const AFK = mongoose.model('AFK', afkSchema);

module.exports = AFK;