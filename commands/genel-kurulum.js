const { Client, EmbedBuilder, ButtonBuilder, ActionRowBuilder, PermissionsBitField, ButtonStyle, ChannelType, CategoryChannel } = require("discord.js");
const discord = require("discord.js")
const config = require("../config.json")
const ServerSettings = require("../models/serverSettings");

module.exports = {
    name: "genel-kurulum",
    description: "Kurulum yap",
    type: 1,
    options: [
        {
            name: 'mesaj-kurulum',
            description: 'Kurulum yapacağın mesajı seç',
            type: 3,
            required: true,
            choices: [
                { name: "💾 ⫸ Mülakat", value: "mülagad" },
                { name: "🌐 ⫸ Yetkili Başvuru", value: "ytbasvuru" },
                { name: "✔  ⫸ Log Kanalları Kurulum", value: "logkanalkur" },
            ]
        },
        {
            name: 'kanal',
            description: 'Kurulum yapacağınız kanalı seçin',
            type: 7,
            required: true,
            channel_types: [ChannelType.GuildText]
        }
    ],
    run: async (client, interaction) => {
        const yetki = new EmbedBuilder()
            .setColor("Red")
            .setDescription("<a:hyr:1157698392730910720> | Bu komutu kullanabilmek için `Yönetici` yetkisine sahip olmalısın!");

        const serverSettings = await ServerSettings.findOne({ guildId: interaction.guild.id });

        if (!serverSettings) {
            return interaction.reply({ content: "Sunucu ayarları bulunamadı. Lütfen kurulumunuzu kontrol edin.", ephemeral: true });
        }

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ embeds: [yetki], ephemeral: true });
        }

        const basarili = new EmbedBuilder()
            .setTitle("Başarılı")
            .setDescription("Kurulum başarılı bir şekilde gerçekleşti!");

        const selectedChannel = interaction.options.getChannel('kanal');

        // ticket

        // kayittayim
        const menu = new EmbedBuilder()
            .setColor("#1e90ff")
            .setTitle("SUNUCUMUZA HOŞ GELDİNİZ!")
            .setDescription(`**🎉 Sunucumuza katıldığınız için teşekkürler! 🎉**\n\n > Sunucumuza kayıt olmak için, lütfen sol tarafta yer alan mülakat odalarına giriş yapın.\n\nEğer bir yetkili çağırmanız gerekiyorsa, aşağıdaki Mülakat Çağır butonuna tıklamanız yeterli olacaktır.\n- **📜 Kurallar 📜**\n - Kurallarımızı okumayı unutmayın!\n- Kurallara uyarak topluluğumuza katkıda bulunun.`)
            .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
            .setImage(interaction.guild.bannerURL({ dynamic: true }))
            .setFooter({ text: `${interaction.guild.name} | Sectwist | discord.gg/sectwist`, iconURL: interaction.guild.iconURL({ dynamic: true }) });

        const row11 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setEmoji("💠")
                    .setLabel("Mülakat Odasındayım")
                    .setStyle(discord.ButtonStyle.Danger)
                    .setCustomId("kayıtolustur"),
            );

        // basvuru
        const woolexaytalım = new EmbedBuilder()
            .setColor("#ff69b4")
            .setAuthor({ name: `${interaction.guild.name} | Yetkili Başvuru`, iconURL: interaction.guild.iconURL({ dynamic: true }) })
            .setTitle("🚀 Yetkili Başvuru")
            .setDescription(`**Merhaba!**\n\n**${interaction.guild.name}** sunucumuzda yetkili olmak ister misin? Şartları ve kuralları dikkatlice okumanı tavsiye ederiz. Başvurunu aşağıdaki formu doldurarak yapabilirsin.`)
            .addFields(
                { name: "📝 Başvuru Şartları", value: "Sunucu kurallarına uygun olmalı ve başvuru formunu eksiksiz doldurmalısınız." },
                { name: "📜 Kurallar", value: "Kurallar ve şartlar hakkında daha fazla bilgi için sunucumuzun kural kanalına göz atın." }
            )
            .setFooter({ text: `${interaction.guild.name} | İyi Şanslar!`, iconURL: interaction.guild.iconURL({ dynamic: true }) });

        const woolexarow = new ActionRowBuilder()
            .setComponents(
                new ButtonBuilder()
                    .setLabel("Yetkili Başvuru")
                    .setStyle(discord.ButtonStyle.Primary)
                    .setCustomId("woolexayetkilibasvur")
                    .setEmoji("1150517077921255556")
            );

        const kurulum = interaction.options.getString('mesaj-kurulum');

        if (kurulum === 'mülagad') {
            await selectedChannel.send({ embeds: [menu], components: [row11] });
        } else if (kurulum === 'ytbasvuru') {
            await selectedChannel.send({ embeds: [woolexaytalım], components: [woolexarow] });
        } else if (kurulum === 'logkanalkur') {
            const logCategory = await interaction.guild.channels.create({
                name: 'SECTWİST LOGS',
                type: ChannelType.GuildCategory,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: [PermissionsBitField.Flags.ViewChannel],
                    },
                    {
                        id: interaction.guild.roles.everyone.id,
                        deny: [PermissionsBitField.Flags.SendMessages],
                    },
                    {
                        id: serverSettings.yetkiliRol,
                        allow: [PermissionsBitField.Flags.ViewChannel],
                    },
                ],
            });

            const logChannels = [
                "staff-bildirim",
                "yetkili-başvuru-log",
                "whitelist-log",
                "mesaj-log",
                "ses-log",
                "ceza-log",
                "guard-log",
                "ekip-log",
                "whitelist-ceza-log",
                "ticket-log",
                "ceza-itiraz-log",
                "olusum-log",
                "rol-al-ver-log",
                "ban-log",
                "isim-log",
                "unban-log",
                "mulakat-log",
                "rol-log"
            ];

            for (const channelName of logChannels) {
                await interaction.guild.channels.create({
                    name: channelName,
                    type: ChannelType.GuildText,
                    parent: logCategory.id,
                    permissionOverwrites: [
                        {
                            id: interaction.guild.id,
                            deny: [PermissionsBitField.Flags.ViewChannel],
                        },
                        {
                            id: interaction.guild.roles.everyone.id,
                            deny: [PermissionsBitField.Flags.SendMessages],
                        },
                        {
                            id: serverSettings.yetkiliRol,
                            allow: [PermissionsBitField.Flags.ViewChannel],
                        },
                    ],
                });
            }
            return interaction.reply({ content: 'Log kanallarını başarıyla kurdum.' });
        }

        return interaction.reply({ embeds: [basarili], ephemeral: true }).catch((e) => { });
    }
};
