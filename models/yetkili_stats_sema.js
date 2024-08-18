const mongoose = require('mongoose');

const yetkilistatsSchema = new mongoose.Schema({
    yetkiliid: { type: String, required: true},
    KactaneWhVermis: { type: Number, default: 0 },
    KactaneUyarıVermis: { type: Number, default: 0 },
    KactaneWhcezaVermis: { type: Number, default: 0 },
    KacKullanıcıBanlamıs: { type: Number, default: 0 },
    KacTicketBakmıs: { type: Number, default: 0 },
    KactaneOlusumAcmıs: { type: Number, default: 0 }
});

const YetkiliStats = mongoose.model('YetkiliStats', yetkilistatsSchema);

module.exports = YetkiliStats;