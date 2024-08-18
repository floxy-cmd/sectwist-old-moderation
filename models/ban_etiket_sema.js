const mongoose = require('mongoose');

// Ban Şeması Tanımı
const banSchema = new mongoose.Schema({
    banID: { type: Number, required: true, unique: true },
    bannedBy: { type: String, required: true },
    bannedAt: { type: Date, default: Date.now() },
    bannedUserID: { type: String, required: true },
    bannedUserName: { type: String, required: true },
    banReason: { type: String, required: true }
});

// Ban Modeli Oluşturma
const Ban = mongoose.model('Ban', banSchema);

module.exports = Ban;