const mongoose = require('mongoose');

const uyarıŞema = new mongoose.Schema({
    uyarıverilen: { type: String, required: true },
    yetkili: { type: String, required: true },
    date: { type: Date, default: Date.now },
    kacxeyedi: { type: String, default: "Şuanda Yok" },
    type: { type: Number, required: true }, // 1x, 2x, 3x
});

const Uyarı = mongoose.model('Uyarı', uyarıŞema);

module.exports = Uyarı;
