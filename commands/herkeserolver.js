const { Client, EmbedBuilder, PermissionsBitField } = require("discord.js");
const AFK = require("../models/afk_sema"); // MongoDB modeli
const ServerSettings = require("../models/serverSettings");

module.exports = {
  name: "herkeserolver",
  description: "Herkese rol vermene yarayan Komut.",
  type: 1,
  options: [
    {
      name: "verilecek-rol",
      description: "Herkese vereceğin rol",
      type: 8,
      required: true,
    },
  ],

  run: async (client, interaction) => {
    const yetkinyetersizdostum = new EmbedBuilder()
      .setAuthor({
        name: `${interaction.user.username}`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      })
      .setDescription(
        `<a:ulem:1178582136115171358> ・ *\**Uyarı:\** Bu komutu kullanmak için gerekli yetkiyi barındırmıyorsun.*`
      )
      .setTimestamp();

    if (
      !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)
    )
      return interaction.reply({ embeds: [yetkinyetersizdostum], ephemeral: true });

    const role = interaction.options.getRole("verilecek-rol");
    const roleId = role.id;
    const guild = interaction.guild;
    const members = await guild.members.fetch();

    let basariliEmbed = new EmbedBuilder()
      .setTitle(`${interaction.user.username} - BAŞARILI`)
      .setDescription(`${role} rolünü ${interaction.guild.memberCount} kişiye veriyorum.`)
      .setTimestamp();

    interaction.reply({ embeds: [basariliEmbed], ephemeral: true });

    members.forEach((member) => {
      member.roles
        .add(roleId)
        .catch((error) => console.error("Rol verilirken bir hata oluştu:", error));
    });
  },
};
