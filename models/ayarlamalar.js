const mongoose = require('mongoose');

const ayarlamaSchema = new mongoose.Schema({
  guildID: { type: String, required: true },
  blacklistSistem: { type: Boolean, default: false },
  gorevSistem: { type: Boolean, default: false },
  icnamesistem: { type: Boolean, default: false }

});

const Ayarlamalar = mongoose.model('Ayarlamalar', ayarlamaSchema);

module.exports = Ayarlamalar;
