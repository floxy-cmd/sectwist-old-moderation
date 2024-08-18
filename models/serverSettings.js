
const mongoose = require('mongoose');

const serverSettingsSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  serverName: { type: String, required: true },
  serverIp: { type: String, required: true },
  cfxCode: { type: String, required: true },
  yetkiliRol: { type: String, required: false },
  blacklistRol: { type: String, required: false },
  whitelistRol: { type: String, required: false },
  nonwhRol: { type: String, required: false },
  ustyetkiliRol: { type: String, required: false },
  wlcezaRol: { type: String, required: false },
  bossRol: { type: String, required: false },
  ticketKategoriID: { type: String, required: false },
  ticketkat: { type: String, required: false },
  ekipbosuKategoriID: { type: String, required: false },
  aktifResim: { type: String, required: false },
  bakimResim: { type: String, required: false },
  restartResim: { type: String, required: false },
});

const ServerSettings = mongoose.model('ServerSettings', serverSettingsSchema);

module.exports = ServerSettings;