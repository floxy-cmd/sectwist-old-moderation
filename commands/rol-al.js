const { PermissionsBitField, EmbedBuilder } = require("discord.js");
const ServerSettings = require("../models/serverSettings");

module.exports = {
    name: "rolal",
    description: 'Birinden rol alırsınız!',
    type: 1,
    options: [
        {
            name: "kullanıcı",
            description: "Rolü alınacak kullanıcıyı seçin!",
            type: 6,
            required: true
        },
        {
            name: "rol",
            description: "Lütfen bir rol etiketleyin!",
            type: 8,
            required: true
        },
    ],
    run: async (client, interaction) => {
        const rol = interaction.options.getRole('rol');
        const user = interaction.options.getMember('kullanıcı');

        const serverSettings = await ServerSettings.findOne({ guildId: interaction.guild.id });

        if (!serverSettings) {
            return interaction.reply({ content: "Sunucu ayarları bulunamadı. Lütfen kurulumunuzu kontrol edin.", ephemeral: true });
        }

        // Yetki kontrolü
        if (!interaction.member.roles.cache.has(serverSettings.yetkiliRol) && !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return sendError(interaction, "Bu komutu kullanmak için gerekli yetkiye sahip değilsin.");
        }

        // Kendine rol alma kontrolü
        if (user.id === interaction.user.id) {
            return sendError(interaction, "Kendinden rol alamazsın.");
        }

        // Kendinden yüksek yetkililere rol alma kontrolü
        if (user.roles.highest.position < rol.position) {
            return sendError(interaction, "Kendinden üst yetkililere rol veremezsin.");
        }

        // Kendinden yüksek kişilerden rol alma kontrolü
        if (user.roles.highest.position >= interaction.member.roles.highest.position) {
            return sendError(interaction, "Kendinden yüksek kişilerden rol alamazsın.");
        }

        // Blacklisted rolleri kontrol et
        const blacklistedRoles = [
            '1237521947580039199', // westteamrole
            '1192933914470273105', // slashrol
            '1192983668285780058', // tersslashrol
            '1183577799726997585'  // noktarol
        ];

        if (blacklistedRoles.includes(rol.id)) {
            return sendError(interaction, "Bu rol blacklist'te bulunuyor, bu rolü alamazsın.");
        }

        // Rolü al ve yanıt ver
        await user.roles.remove(rol);

        const rolalembed = new EmbedBuilder()
            .setColor("Blurple")
            .setAuthor({ name: `${user.nickname || user.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
            .setDescription(`✅ ・ ${user} isimli oyuncudan ${rol} rolü başarıyla alındı.\n\n👤 ・ \`Yetkili:\` ${interaction.user}`)
            .setFooter({ text: `${interaction.guild.name} 💝 Sectwist` });

        await interaction.reply({ embeds: [rolalembed] });
    }
};

// Yardımcı fonksiyon: hata mesajı gönder
function sendError(interaction, message) {
    const errorEmbed = new EmbedBuilder()
        .setAuthor({ name: `${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
        .setDescription(`⚠️ ・ **Uyarı:** ${message}`)
        .setTimestamp();

    return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
}
