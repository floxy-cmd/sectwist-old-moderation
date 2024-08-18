const { EmbedBuilder, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const ServerSettings = require("../models/serverSettings");

module.exports = {
    name: "sunucu",
    type: 1,
    description: "Sunucu durumunu seç!",
    options: [
        {
            name: 'durumu',
            description: 'Sunucu durumu seçiniz Aktif,Bakım,Restart',
            type: 3,
            required: true,
            choices: [
                { name: "🔥 ⫸ Aktif", value: "aktifat" },
                { name: "🔧 ⫸ Bakım", value: "bakım" },
                { name: "🔄 ⫸ Restart", value: "restart" },
            ]
        },
    ],

    run: async (client, interaction) => {
        const serverSettings = await ServerSettings.findOne({ guildId: interaction.guild.id });

        if (!serverSettings) {
            return interaction.reply({ content: "Sunucu ayarları bulunamadı. Lütfen kurulumunuzu kontrol edin.", ephemeral: true });
        }

        const yetkinyok = new EmbedBuilder()
            .setColor("#FF0000")
            .setDescription(`🚫 <@${interaction.user.id}> **Bu Komutu Kullanmak için <@&${serverSettings.ustyetkiliRol}> Rolün Yok!**`);

        if (!interaction.member.roles.cache.has(serverSettings.ustyetkiliRol) && !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ embeds: [yetkinyok], ephemeral: true });
        }

        const aktifembed = new EmbedBuilder()
            .setColor("#00FF00")
            .setTitle(`🎉 ${interaction.guild.name}`)
            .setDescription(`🚀 **Sunucumuz AKTIF durumuna geçmiştir!** Aşağıdaki link ve butonlardan sunucumuza bağlanabilirsiniz. İyi oyunlar, iyi eğlenceler!\n\n**Durum:** 🟢 **Aktif**\n\n**FiveM:** \`connect ${serverSettings.serverIp}\`\ \n[Discord](https://discord.gg/mzrp) | [FiveM](https://servers.fivem.net/servers/detail/${serverSettings.cfxKodu})`)
            .setImage(serverSettings.aktifResim)
            .setThumbnail(interaction.guild.iconURL())
            .setTimestamp();

        const aktifrow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Sunucuya Bağlan')
                    .setEmoji('🎮')
                    .setURL('https://example.com') // Use a valid URL or remove this line
                    .setStyle(ButtonStyle.Link)
            );

        const bakımembed = new EmbedBuilder()
            .setColor("#FFA500")
            .setTitle(`🔧 ${interaction.guild.name}`)
            .setDescription(`🚧 **Sunucumuz BAKIM durumuna geçmiştir.** Aşağıdaki link ve butonlardan güncellemeler hakkında bilgi alabilirsiniz.\n\n**Durum:** 🔴 **Bakım**\n**Kurulum:** [Link](https://discord.com/channels/1234894360521347092/1237522081986514985)\n\n**FiveM:** \`connect ${serverSettings.serverIp}\`\ \n\n[Discord](https://discord.gg/mzrp) | [FiveM](https://servers.fivem.net/servers/detail/${serverSettings.cfxKodu})`)
            .setImage(serverSettings.bakimResim)
            .setThumbnail(interaction.guild.iconURL())
            .setTimestamp();

        const restartembed = new EmbedBuilder()
            .setColor("#FFFF00")
            .setTitle(`🔄 ${interaction.guild.name}`)
            .setDescription(`🔄 **Sunucumuz RESTART durumuna geçmiştir ve birazdan AKTİF olacaktır.** Kısa bir süre içinde tekrar bağlanabilirsiniz. İyi oyunlar, iyi eğlenceler!\n\n**Durum:** 🔄 **Restart**\n\n**FiveM:** \`connect ${serverSettings.serverIp}\`\ \n\n[Discord](https://discord.gg/mzrp) | [FiveM](https://servers.fivem.net/servers/detail/${serverSettings.cfxKodu})`)
            .setImage(serverSettings.restartResim)
            .setThumbnail(interaction.guild.iconURL())
            .setTimestamp();

        const basarili = new EmbedBuilder()
            .setColor("#00FF00")
            .setTitle("✅ Başarılı")
            .setDescription("Sunucu durumu başarıyla güncellendi!");

        const status = interaction.options.getString('durumu');
        let embed, row;

        if (status === 'aktifat') {
            embed = aktifembed;
            row = aktifrow;
        } else if (status === 'bakım') {
            embed = bakımembed;
        } else if (status === 'restart') {
            embed = restartembed;
            row = aktifrow;
        }

        interaction.channel.send({ content: `||@everyone||&||@here||`, embeds: [embed], components: row ? [row] : [] });
        return interaction.reply({ embeds: [basarili], ephemeral: true }).catch((e) => { console.error(e); });
    }
};
