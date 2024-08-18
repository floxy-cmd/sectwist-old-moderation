const { Schema, model } = require('mongoose');

const oluşumSchema = new Schema({
  isim: { type: String, required: true },
  renk: { type: String, required: true },
  emoji: { type: String, required: true },
  boss: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  davetLinki: { type: String, required: true },
  oluşumRoleId: { type: String },
  ticketKanalId: { type: String },
  başvuruKanalId: { type: String },
});

const Oluşum = model('Oluşum', oluşumSchema);

module.exports = Oluşum;
