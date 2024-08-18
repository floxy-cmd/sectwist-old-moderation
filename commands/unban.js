const { Client, EmbedBuilder, PermissionsBitField } = require("discord.js");
const config = require("../config.json");

module.exports = {
    name: "unban",
    description: 'Kullanıcının yasağını kaldırırsınız!',
    type: 1,
    options: [
        {
            name: "id",
            description: "Kullanıcı ID Girin!",
            type: 3,
            required: true
        },
        {
            name: "sebeb",
            description: "Yasaklamayı kaldırmak için sebep giriniz!",
            type: 3,
            required: true
        },
    ],
    run: async (client, interaction) => {

        const yetkinyetersizdostum = new EmbedBuilder()
            .setAuthor({ name: `${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
            .setDescription(`⚠️ ・ *Yetki hatası:* Bu komutu kullanmak için gerekli yetkiye sahip değilsin.*`)
            .setTimestamp();

        if (!interaction.member.roles.cache.has(serverSettings.yetkiliRol) && !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ embeds: [yetkinyetersizdostum], ephemeral: true });
        }

        const serverSettings = await ServerSettings.findOne({ guildId: interaction.guild.id });

        if (!serverSettings) {
            return interaction.reply({ content: "Sunucu ayarları bulunamadı. Lütfen kurulumunuzu kontrol edin.", ephemeral: true });
        }

        const user = interaction.options.getString('id');
        const sebeb = interaction.options.getString('sebeb');

        let date = new Date();

        let trDate = date.toLocaleDateString("tr-TR", {
            "month": "long",
            "year": "numeric",
            "day": "numeric"
        });

        const banactın = new EmbedBuilder()
            .setAuthor({ name: `${interaction.member.nickname || "Bulamadım"}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
            .setDescription(`🚫 ・ <@${user}> isimli kullanıcının sunucudan yasaklanması \`${sebeb}\` sebebi ile kaldırıldı.\n\n🎉 ・ \`Yetkili:\` ${interaction.user}`);

        const yasakkaldırmalog = new EmbedBuilder()
            .setAuthor({ name: `ᴡᴇsᴛʀᴘ - ʏᴀꜱᴀᴋ ᴋᴀʟᴅıʀᴍᴀ`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
            .setThumbnail(`${interaction.guild.iconURL()}`)
            .setDescription(`📝 ・ \`Yetkili:\` <@${interaction.user.id}>\n🎉 ・ \`Kullanıcı:\` ${user}\n**TARİH:**\n\`\`\`ansi\n[2;34m${trDate} ${date.getHours()}:${date.getMinutes()}[0m\`\`\`\n**YASAK KALDIRILMA BİLGİSİ:**\n\`\`\`ansi\n[2;34m${sebeb}[0m\`\`\``);

        interaction.reply({ embeds: [banactın] });
        interaction.guild.members.unban(user);
        interaction.guild.channels.cache.find(channel => channel.name === "ban-log").send.send({ embeds: [yasakkaldırmalog] });
    }
};
