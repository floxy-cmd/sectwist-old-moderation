const { EmbedBuilder, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const config = require("../config.json");
const db = require("croxydb");
const Sayılar = require("../models/sunucu_ticket_ban_veri");
const Ban = require("../models/ban_etiket_sema");
const ServerSettings = require("../models/serverSettings");

module.exports = {
    name: "ban",
    description: 'Kullanıcıyı Sunucudan Yasaklarsın.',
    type: 1,
    options: [
        {
            name: "kullanıcı",
            description: "Yasaklanacak kullanıcıyı seçin.",
            type: 6,
            required: true
        },
        {
            name: "sebep",
            description: "Hangi sebepten dolayı yasaklanacak?",
            type: 3,
            required: true
        },
    ],
    run: async (client, interaction) => {
        const serverSettings = await ServerSettings.findOne({ guildId: interaction.guild.id });

        if (!serverSettings) {
            return interaction.reply({ content: "Sunucu ayarları bulunamadı. Lütfen kurulumunuzu kontrol edin.", ephemeral: true });
        }

        // Kullanıcının yetkilerini kontrol et
        const yetkinyetersizdostum = new EmbedBuilder()
            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
            .setDescription("⚠️ ・ **Uyarı:** Bu komutu kullanmak için gerekli yetkiye sahip değilsin.")
            .setTimestamp();

        if (!interaction.member.roles.cache.has(serverSettings.ustyetkiliRol) && !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ embeds: [yetkinyetersizdostum], ephemeral: true });
        }

        const user = interaction.options.getMember('kullanıcı');
        const sebep = interaction.options.getString('sebep');

        // Kendinden üst kişileri yasaklayamama kontrolü
        const kendindenüsterolveremessinannesifallik = new EmbedBuilder()
            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
            .setDescription("⚠️ ・ **Uyarı:** Kendinden üst kişileri yasaklayamazsın.")
            .setTimestamp();

        if (user.roles.highest.position >= interaction.member.roles.highest.position) {
            return interaction.reply({ embeds: [kendindenüsterolveremessinannesifallik], ephemeral: true });
        }

        let date = new Date();
        let trDate = date.toLocaleDateString("tr-TR", {
            "month": "long",
            "year": "numeric",
            "day": "numeric"
        });

        const kullanıcıbildiri = new EmbedBuilder()
            .setAuthor({ name: `${interaction.guild.name} - SUNUCUDAN YASAKLANDINIZ`, iconURL: interaction.guild.iconURL({ dynamic: true }) })
            .setThumbnail(`${interaction.guild.iconURL()}`)
            .setDescription("🔒 ・ `YETKILI:` <@${interaction.user.id}>\n🔎 ・ `SEBEP: ${sebep}`\n🚫 ・ `CEZA ID: ${lvl}`\n\n🌐 [DISCORD](https://discord.gg/sᴛᴏʀɪᴀᴠ)\n\n`🌐 ${interaction.guild.name}・${trDate} ${date.getHours()}:${date.getMinutes()}`")
            .setImage("https://cdn.discordapp.com/attachments/1075817734773940255/1130913846685618337/logoo.gif")
            .setFooter({ text: `🌐 Ceza ID: ${lvl}` });

        const kullanıcıbildirirow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setEmoji("📅")
                    .setLabel("BAN ITIRAZ FORMALARI BELIRLI ARALIKLARLA OKUNMAKTADIR")
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId("sexflnfldfsadf")
                    .setDisabled(true)
            );

        const banreply = new EmbedBuilder()
            .setAuthor({ name: `${interaction.member.nickname || "Bulamadım"}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
            .setDescription("🔨 ・ ${user} *isimli oyuncu sunucudan başarılı bir şekilde* `${sebep}` *sebebi ile yasaklandı.*\n\n📝 ・ `YETKILI:` <@${interaction.user.id}>\n🔒 ・ `CEZA ID: #${lvl}`")
            .setFooter({ text: `${trDate} ${date.getHours()}:${date.getMinutes()}` });

        const yasakkaldırmalog = new EmbedBuilder()
            .setAuthor({ name: `WESᴛʀᴏʟᴇᴘʟᴀʏ - YASAKLAMA`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
            .setThumbnail(`${interaction.guild.iconURL()}`)
            .setDescription("🔒 ・ `YETKILI:` <@${interaction.user.id}>\n🔎 ・ `OYUNCU:` ${user}\n`CEZA ID: #${lvl}`\n**TARIH:**\n```ansi\n[2;34m${trDate} ${date.getHours()}:${date.getMinutes()}[0m```\n**YASAKLAMA BILGISI:**\n```ansi\n[2;34m${sebep}[0m```");

        const banData = new Ban({
            banID: lvl,
            bannedBy: interaction.user.id,
            bannedAt: Date.now(),
            bannedUserID: user.id,
            bannedUserName: user.user.username,
            banReason: sebep
        });

        try {
            await banData.save();
        } catch (err) {
            return interaction.reply({ content: `Ban Komutunu Kullanırken Database İle İlgili Bir Problem Oluştu\n**↪** ${err}`, ephemeral: true });
        }

        user.send({ embeds: [kullanıcıbildiri], components: [kullanıcıbildirirow] });

        setTimeout(() => {
            user.ban({ reason: `Banlayan Kişi: ${interaction.user.username} - Sebep: ${sebep}` });
        }, 1500);

        interaction.guild.channels.cache.find(channel => channel.name === "ban-log").send({ embeds: [yasakkaldırmalog] });
        interaction.reply({ embeds: [banreply] });

        const ytstat = require("../models/yetkili_stats_sema");

        try {
            await ytstat.findOneAndUpdate({ yetkiliid: interaction.user.id }, { $inc: { KacKullanıcıBanlamıs: 1 } }, { upsert: true, new: true });
        } catch (err) {
            return interaction.reply({ content: `Ban Komutunu Kullanırken Database İle İlgili Bir Problem Oluştu\n**↪** ${err}`, ephemeral: true });
        }
    }
};
