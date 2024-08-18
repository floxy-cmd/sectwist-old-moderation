const mongoose = require('mongoose');

// Şema oluştur
const donateSchema = new mongoose.Schema({
  isim: {
    type: String,
    required: true
  },
  fiyat: {
    type: String,
    required: true
  },
  açıklama: {
    type: String,
    required: true
  },
  görsel: {
    type: String,
    required: true
  }
});

// Model oluştur
const Donate = mongoose.model('Donate', donateSchema);

module.exports = Donate;
