const { Client, EmbedBuilder, PermissionsBitField } = require("discord.js");
const AFK = require("../models/afk_sema"); // MongoDB modeli
const ServerSettings = require("../models/serverSettings");

module.exports = {
  name: "herkesdenrolal",
  description: "Herkesden rol almana yarayan Komut.",
  type: 1,
  options: [
    {
        name:"alinacak-rol",
        description:"Herkesden alacağın rol",
        type:8,
        required:true
    },
  ],

  run: async(client, interaction) => {
    const yetkinyetersizdostum = new EmbedBuilder()
        .setAuthor({ name: `${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true}) })
        .setDescription(`<a:ulem:1178582136115171358> ・ *\**Uyarı:\** Bu komutu kullanmak içi gerekli yetkiyi barındırmıyorsun.*`)
        .setTimestamp()
        
    if(!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply({ embeds: [yetkinyetersizdostum], ephemeral: true });

    const role = interaction.options.getRole(`alinacak-rol`);
    const guild = interaction.guild;
    const members = await guild.members.fetch();
    const membersWithRole = members.filter(member => member.roles.cache.has(role.id));

    let allahyokkk = new EmbedBuilder()
    .setTitle(`${interaction.user.username} - BAŞARILI`)
    .setDescription(`${role} rolünü ${membersWithRole.size} kişiden alıyorum.`)
    .setTimestamp()

    interaction.reply({ embeds: [allahyokkk] });

    membersWithRole.forEach(async member => {
      try {
        await member.roles.remove(role);
      } catch (error) {
        console.error('Rol alınırken bir hata oluştu: ', error);
      }
    });
  }
};
