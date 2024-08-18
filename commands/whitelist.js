const { PermissionsBitField, EmbedBuilder } = require("discord.js");
const config = require("../config.json");
const ServerSettings = require("../models/serverSettings");
const ytstat = require("../models/yetkili_stats_sema");

module.exports = {
    name: "whitelist",
    description: "Whitelist ver",
    type: 1,
    options: [
        {
            name: "kullanıcı",
            description: "Whitelist verilecek kullanıcıyı etiketle!",
            type: 6,
            required: true
        },
    ],
    run: async (client, interaction) => {
        try {
            // Etkileşimi hemen erteleyin
            await interaction.deferReply({ ephemeral: true });

            // Sunucu ayarlarını MongoDB'den çek
            const serverSettings = await ServerSettings.findOne({ guildId: interaction.guild.id });

            if (!serverSettings) {
                return interaction.editReply({ content: "Sunucu ayarları bulunamadı. Lütfen kurulumunuzu kontrol edin." });
            }

            const yetkiliRoleId = serverSettings.yetkiliRol;
            const whitelistRoleId = serverSettings.whitelistRol;
            const kayıtsızRoleId = serverSettings.nonwhRol;

            const yetkinyetersizdostum = new EmbedBuilder()
                .setColor("#FF0000")
                .setAuthor({ name: `${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                .setDescription(`<a:ulem:1178582136115171358> **Uyarı:** Bu komutu kullanmak için gerekli yetkiye sahip değilsiniz.`)
                .setTimestamp();

            if (!interaction.member.roles.cache.get(yetkiliRoleId) && !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                return interaction.editReply({ embeds: [yetkinyetersizdostum] });
            }

            const user = interaction.options.getMember('kullanıcı');
            const whitelistRole = interaction.guild.roles.cache.get(whitelistRoleId);
            const kayıtsızRole = interaction.guild.roles.cache.get(kayıtsızRoleId);

            if (!whitelistRole) {
                return interaction.editReply({ content: "Whitelist rolü bulunamadı. Lütfen kurulumunuzu kontrol edin." });
            }

            await user.roles.add(whitelistRole);
            await user.setNickname("IC İSİM");
            await user.roles.remove(kayıtsızRole);

            await interaction.editReply({ content: `✅ Başarıyla ${user} kullanıcısına **Whitelist** verildi.` });

            const log = new EmbedBuilder()
                .setColor("#000000")
                .setTitle(`📋 Whitelist Verildi`)
                .setDescription(`<@${interaction.user.id}> isimli yetkili, başarılı bir şekilde ${user} isimli kullanıcıya whitelist verdi.`)
                .setTimestamp();

            const logChannel = interaction.guild.channels.cache.find(channel => channel.name === "whitelist-log");
            if (logChannel) {
                logChannel.send({ embeds: [log] }).catch(e => console.error("Log kanalı bulunamadı veya mesaj gönderilemedi:", e));
            } else {
                console.error("Log kanalı bulunamadı.");
            }

            await ytstat.findOneAndUpdate(
                { yetkiliid: interaction.user.id },
                { $inc: { KactaneWhVermis: 1 } },
                { upsert: true, new: true }
            );
        } catch (err) {
            console.error('Bir hata oluştu:', err);
            if (!interaction.replied) {
                await interaction.editReply({ content: `Whitelist komutunu kullanırken bir hata oluştu:\n**↪** ${err}` });
            }
        }
    }
};
