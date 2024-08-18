const { ButtonStyle, Client, EmbedBuilder, PermissionsBitField, AttachmentBuilder, ButtonBuilder, ActionRowBuilder } = require("discord.js");
const canvafy = require("canvafy");
const ServerSettings = require("../models/serverSettings");

module.exports = {
  name: "ekip-ban",
  description: "Ekibi banlamak için kullanılır",
  type: 1,
  options: [
    {
      name: "role",
      description: "Banlanacak ekip rolünü belirtin.",
      type: 8,
      required: true
    },
  ],

  run: async (client, interaction) => {
    // Banlama yetkisi kontrolü
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return interaction.followUp({
        embeds: [
          new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('Yetki Hatası')
            .setDescription('Bu komutu kullanabilmek için yeterli yetkilere sahip değilsiniz.')
        ],
        ephemeral: true
      });
    }

    const rol = interaction.options.getRole('role');
    const guild = interaction.guild;
    const members = await guild.members.fetch();
    const membersWithRole = members.filter(member => member.roles.cache.has(rol.id));

    try {
      for (const member of membersWithRole.values()) {
        await member.ban({ reason: 'Bir yetkili tarafından ekip banlandı.' });
      }

      await rol.delete();

      const welcomeImage = await new canvafy.WelcomeLeave()
        .setBackground("image", "https://cdn.discordapp.com/attachments/1237739949181370462/1237768118294810645/image.png?ex=663cd8e4&is=663b8764&hm=308e493f0c5643c80cf0063f61367f3ff4bdfc152acb1bbd4aadcae4db2d6f2b&")
        .setTitle(`EKİP BAN`)
        .setDescription(`Ekipdeki ${membersWithRole.size} kişi banlandı ve rol silindi!`)
        .setBorder("#2a2e35")
        .setAvatarBorder("#2a2e35")
        .setOverlayOpacity(0.3)
        .build();

      const welcomeImageAttachment = new AttachmentBuilder(welcomeImage, { name: `ekip-ban.png` });

      const embed = new EmbedBuilder()
        .setColor(0x00FF00)
        .setTitle(`${interaction.user.username} - EKİP BAN`)
        .setDescription(`**${rol.name}** ekibindeki tüm kullanıcılar başarıyla banlandı ve rol silindi.`)
        .setImage(`attachment://ekip-ban.png`);

      const unbanButton = new ButtonBuilder()
        .setLabel("Banları Geri Aç")
        .setStyle(ButtonStyle.Danger)
        .setCustomId("unban_team");

      const actionRow = new ActionRowBuilder().addComponents(unbanButton);

      await interaction.reply({
        embeds: [embed],
        files: [welcomeImageAttachment],
        components: [actionRow]
      });

    } catch (error) {
      console.error('Bir hata oluştu:', error);
      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('Bir Hata Oluştu')
            .setDescription('Bir sorunla karşılaşıldı. Lütfen bir geliştiriciye veya sunucu yöneticisine bildirin.')
        ],
        ephemeral: true
      });
    }
  }
};

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;

  if (interaction.customId === "unban_team") {
    const bans = await interaction.guild.bans.fetch();
    bans.forEach(async (ban) => {
      if (membersWithRole.some(member => member.id === ban.user.id)) {
        await interaction.guild.members.unban(ban.user.id, `${interaction.user.username} tarafından ban geri alındı.`);
      }
    });

    await interaction.followUp({
      content: 'Tüm ekip üyelerinin banları başarıyla geri acıldı!',
      ephemeral: true
    });
  }
});
