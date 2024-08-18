const { PermissionsBitField, EmbedBuilder } = require("discord.js");
const ServerSettings = require("../models/serverSettings");

module.exports = {
    name: "rolver",
    description: 'Birine rol verirsiniz!',
    type: 1,
    options: [
        {
            name: "user",
            description: "Rol verilecek kullanıcıyı seçin!",
            type: 6, // USER type
            required: true
        },
        {
            name: "rol",
            description: "Lütfen bir rol etiketleyin!",
            type: 8, // ROLE type
            required: true
        },
    ],
    run: async (client, interaction) => {
        try {
            const rol = interaction.options.getRole('rol');
            const user = interaction.options.getMember('user');
            
            const serverSettings = await ServerSettings.findOne({ guildId: interaction.guild.id });

            if (!serverSettings) {
                return interaction.reply({ content: "Sunucu ayarları bulunamadı. Lütfen kurulumunuzu kontrol edin.", ephemeral: true });
            }

            // Yetki kontrolü
            if (!interaction.member.roles.cache.has(serverSettings.yetkiliRol) && !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                return sendError(interaction, "Bu komutu kullanmak için gerekli yetkiye sahip değilsin.");
            }

            // Kendine rol verme kontrolü
            if (user.id === interaction.user.id) {
                return sendError(interaction, "Kendine rol veremezsin.");
            }

            // Yüksek rol pozisyonu kontrolü
            if (rol.position >= interaction.guild.members.me.roles.highest.position) {
                return sendError(interaction, "Bot kendinden yüksek yetkililere rol veremez.");
            }

            if (rol.position >= interaction.member.roles.highest.position) {
                return sendError(interaction, "Kendinden yüksek yetkililere rol veremezsin.");
            }

            // if (rol.position >= user.roles.highest.position) {
            //     return sendError(interaction, "Bu kullanıcıya bu rolü veremezsin çünkü kullanıcının en yüksek rolü bu rolden daha yüksek veya eşit.");
            // }

            // Kullanıcının rolü zaten var mı kontrolü
            if (user.roles.cache.has(rol.id)) {
                return sendError(interaction, `Bu kullanıcıda zaten ${rol} rolü mevcut!`);
            }

            // Rolü ekle ve yanıt ver
            await user.roles.add(rol);
            const rolverembed = new EmbedBuilder()
                .setColor("Blurple")
                .setAuthor({ name: `${interaction.member.nickname || interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                .setDescription(`✅ ・ ${user} isimli kullanıcıya ${rol} rolü başarıyla verildi.\n\n🎉 ・ \`Yetkili:\` ${interaction.user}`)
                .setFooter({ text: `${interaction.guild.name} 💝 Sectwist` });

            await interaction.reply({ embeds: [rolverembed] });
        } catch (error) {
            console.error("Bir hata oluştu:", error);
            sendError(interaction, "Bir hata oluştu, lütfen tekrar deneyin.");
        }
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
