const {
  PermissionsBitField,
  StringSelectMenuBuilder,
  AuditLogEvent,
  EmbedBuilder,
  ButtonStyle,
  Client,
  GatewayIntentBits,
  ChannelType,
  Partials,
  ActionRowBuilder,
  SelectMenuBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  InteractionType,
  SelectMenuInteraction,
  ButtonBuilder
} = require("discord.js");
const db = require("croxydb");
const { readdirSync } = require("fs");
const path = require('path'); // Correctly require path module
const config = require("../config.json");
const ms = require("ms");
const moment = require("moment");
require("moment-duration-format");
moment.locale('tr');

// Woolexa BABAPİRO\\
module.exports = async (client, interaction) => {

  if (interaction.isChatInputCommand()) {
    if (!interaction.guildId) return;

    const commandsPath = path.resolve(__dirname, '..', 'commands'); // Correct path resolution

    readdirSync(commandsPath).forEach(f => {
      if (!f.endsWith('.js')) return; // Only process JavaScript files

      const cmdPath = path.join(commandsPath, f);
      const cmd = require(cmdPath);

      if (interaction.commandName.toLowerCase() === cmd.name.toLowerCase()) {
        try {
          return cmd.run(client, interaction, db);
        } catch (err) {
          console.error(`komutta hata ${cmd.name}:`, err);
          // Optionally, you can send an error message to the user
          interaction.reply({ content: 'komudu kullanırken hata olustu yarram', ephemeral: true });
        }
      }
    });
  }
};
