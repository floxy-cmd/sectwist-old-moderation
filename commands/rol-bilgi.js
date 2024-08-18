const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const config = require("../config.json");
const ServerSettings = require("../models/serverSettings");

module.exports = {
    name: "rolbilgi",
    type: 1,
    description: "Rol bilgilerini görüntüler.",
    options: [
        {
            name: 'rol',
            description: 'Bilgisini almak istediğiniz rolü seçin.',
            type: 8,
            required: true,
        },
    ],

    run: async (client, interaction) => {

        const serverSettings = await ServerSettings.findOne({ guildId: interaction.guild.id });

        if (!serverSettings) {
            return interaction.reply({ content: "Sunucu ayarları bulunamadı. Lütfen kurulumunuzu kontrol edin.", ephemeral: true });
        }

        const yetkinyetersizdostum = new EmbedBuilder()
            .setAuthor({ name: `${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
            .setDescription(`⚠️ ・ **Uyarı:** Bu komutu kullanmak için gerekli yetkiye sahip değilsin.`)
            .setTimestamp()
            .setFooter({ text: `${interaction.guild.name} 💝 Sectwist`})

        if (!interaction.member.roles.cache.has(serverSettings.yetkiliRol) && !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ embeds: [yetkinyetersizdostum], ephemeral: true });
        }

        const role = interaction.options.getRole('rol');    

        const rolbilgimembed = new EmbedBuilder()
            .setColor("DarkButNotBlack")
            .setAuthor({ name: `${interaction.guild.name} - Rol Bilgi`})
            .setDescription(`${role} - \`${role.name}\`\n**Rol Bilgisi:**\n\n🔵 **Rol Rengi:** \`${role.hexColor}\`\n🔢 **Rol ID:** \`${role.id}\`\n📅 **Rolün Açılma Tarihi:** <t:${(role.createdTimestamp / 1000).toFixed(0)}:f>\n👥 **Roldeki Kişi Sayısı:** \`${role.members.size}\`\n\n**Rol Sahip Kullanıcılar:**\n\n${role.members.size > 60 ? 'Bu rolde çok fazla kişi olduğu için listeyi gösteremiyorum.' : role.members.map(member => `<@${member.user.id}> - (\`${member.user.username}\`)`).join('\n')}`)
            .setFooter({ text: `${interaction.guild.name} 💝 Sectwist`})
            .setThumbnail(`${interaction.guild.iconURL()}`)
            .setTimestamp();

        interaction.reply({ embeds: [rolbilgimembed] });
    }
};
