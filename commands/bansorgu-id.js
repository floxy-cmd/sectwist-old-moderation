const Ban = require('../models/ban_etiket_sema');
const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const ServerSettings = require("../models/serverSettings");

module.exports = {
  name: "ban-sorgu",
  description: "Banlanan kişinin ID'sini girerek neden banlandığını öğrenebilirsin",
  type: 1,
  options: [
    {
      name: "kullanıcı-id",
      description: "Sorgulamak istediğiniz kullanıcının ID'si",
      type: 3,
      required: true
    },
  ],

  run: async (client, interaction) => {
    const serverSettings = await ServerSettings.findOne({ guildId: interaction.guild.id });

    if (!serverSettings) {
        return interaction.reply({ content: "Sunucu ayarları bulunamadı. Lütfen kurulumunuzu kontrol edin.", ephemeral: true });
    }
    const yetkinyetersizdostum = new EmbedBuilder()
      .setAuthor({ name: `${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
      .setDescription(`<a:ulem:1178582136115171358> ・ *\**Uyarı:\** Bu komutu kullanmak için gerekli yetkiye sahip değilsiniz.*`)
      .setTimestamp();

    if (!interaction.member.roles.cache.get(`${serverSettings.ustyetkiliRol}`) && !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator))
      return interaction.reply({ embeds: [yetkinyetersizdostum], ephemeral: true });

    const bannedUserID = interaction.options.getString('kullanıcı-id');

    try {
      const banData = await Ban.findOne({ bannedUserID: bannedUserID });
      if (!banData) {
        return interaction.reply({ content: `Belirtilen kullanıcı ID ile ilgili bilgi bulunamadı.`, ephemeral: true });
      }

      const bansorguembed = new EmbedBuilder()
        .setAuthor({ name: `Bir Kullanıcıyı Sorguladın!`, iconURL: interaction.guild.iconURL({ dynamic: true }) })
        .setDescription(`<@${interaction.user.id}> Hey bir kullanıcıyı sorguladınız. Sorguladığınız kullanıcı hakkında bilmenizi istediğim bilgiler aşağıda bulunmaktadır!`)
        .addFields(
          { name: `❓ Sorgulanan Ban ID`, value: `**Sorgulanan kişinin ban ID'si:** \`${banData.banID}\``, inline: true },
          { name: `👮‍♂️ İşlemi Uygulayan Yetkili`, value: `Hangi Yetkili Banlamış: ${banData.bannedBy || "**Banlayan Yetkili Bulunamadı**"}`, inline: true },
          { name: `⌚ Kişi Ne Zaman Banlanmış`, value: `**Sorguladığınız kişi** <t:${parseInt(banData.bannedAt / 1000)}:R> **banlanmıştır.**` },
          { name: `🙎‍♂️ Banlanan Kişinin ID'si`, value: `**Banlanan kişinin ID'si:** \`${banData.bannedUserID}\``, inline: true },
          { name: `🙎 Banlanan Kişinin İsmi`, value: `**Banlanan kişinin ismi:** \`${banData.bannedUserName}\``, inline: true },
          { name: `📁 Banlanma Sebebi`, value: `**⇓ Sorguladığınız kişinin banlanma sebebi aşağıda ⇓**\n\`\`\`ansi\n[2;37m${banData.banReason}[0m\`\`\`` }
        )
        .setFooter({ text: `${interaction.guild.name} 💝 Sectwist | 🌐 Sorgulanan Ban ID ${banData.banID}` })
        .setTimestamp();

      interaction.reply({ embeds: [bansorguembed], ephemeral: true });
    } catch (error) {
      interaction.reply({ content: `Ban sorgulanırken bir hata oluştu.\n**↪** ${error}`, ephemeral: true });
    }
  }
};
