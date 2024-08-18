const Discord = require("discord.js");
const mongoose = require("mongoose");
const config = require("../config.json");
const Ceza = require("../models/ceza");
const ServerSettings = require("../models/serverSettings");

module.exports = {
    name: "wlceza",
    description: "Birine uyarı vermek istiyorsun o zaman hoş geldin",
    type: 1,
    options: [
        {
            name: "kullanıcı",
            description: "Uyarı verilecek kullanıcıyı seçiniz!",
            type: 6,
            required: true
        },
    ],

    run: async (client, interaction) => {
        const allah = interaction.options.getMember('kullanıcı');

        const serverSettings = await ServerSettings.findOne({ guildId: interaction.guild.id });

        if (!serverSettings) {
            return interaction.reply({ content: "Sunucu ayarları bulunamadı. Lütfen kurulumunuzu kontrol edin.", ephemeral: true });
        }

        const yetkinyetersizdostum = new Discord.EmbedBuilder()
            .setAuthor({ name: `${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
            .setDescription(`⚠️ ・ **Uyarı:** Bu komutu kullanmak için gerekli yetkiye sahip değilsin.`)
            .setTimestamp();

        if (!interaction.member.roles.cache.has(serverSettings.yetkiliRol) && !interaction.member.permissions.has(Discord.PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ embeds: [yetkinyetersizdostum], ephemeral: true });
        }

        let embedallah = new Discord.EmbedBuilder()
            .setTitle(`${allah.user.username} - WLCEZA`)
            .setDescription(`\`\`>\`\` ${allah} kullanıcısına kaç gün whitelist cezası vereceksin?`);

        let userrrr = interaction.user.id;

        const allahınıbentekrarsikem = new Discord.ActionRowBuilder()
            .addComponents(
                new Discord.StringSelectMenuBuilder()
                    .setCustomId('wlcezababapro')
                    .setPlaceholder('Kaç Gün Wlceza vereceksin.')
                    .addOptions([
                        { label: '1 GÜN', description: '1 gün whitelist ceza', value: 'onegun' },
                        { label: '2 GÜN', description: '2 gün whitelist ceza', value: 'twogun' },
                        { label: '3 GÜN', description: '3 gün whitelist ceza', value: 'threegun' },
                        { label: '4 GÜN', description: '4 gün whitelist ceza', value: 'fourgun' },
                        { label: 'DAHA FAZLA', description: 'Daha fazla gün whitelist ceza', value: 'morethanfour' }
                    ])
            );

        await interaction.reply({ embeds: [embedallah], components: [allahınıbentekrarsikem] });

        const filter = i => i.customId === 'wlcezababapro' && i.user.id === userrrr;

        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async i => {
            const selectedValue = i.values[0];

            if (selectedValue !== 'morethanfour') {
                const msInDay = 86400000;
                let cezaSuresi;

                if (selectedValue === 'onegun') cezaSuresi = msInDay;
                else if (selectedValue === 'twogun') cezaSuresi = 2 * msInDay;
                else if (selectedValue === 'threegun') cezaSuresi = 3 * msInDay;
                else if (selectedValue === 'fourgun') cezaSuresi = 4 * msInDay;

                await applyCeza(interaction, allah, cezaSuresi);

            } else {
                const modal = new Discord.ModalBuilder()
                    .setCustomId('cezaModal')
                    .setTitle('Kaç Gün Ceza Verilecek?')
                    .addComponents(
                        new Discord.ActionRowBuilder().addComponents(
                            new Discord.TextInputBuilder()
                                .setCustomId('cezaSuresiInput')
                                .setLabel('Gün sayısını girin:')
                                .setStyle(Discord.TextInputStyle.Short)
                                .setRequired(true)
                        )
                    );

                await i.showModal(modal);
            }
        });

        client.on('interactionCreate', async interaction => {
            if (!interaction.isModalSubmit()) return;

            if (interaction.customId === 'cezaModal') {
                const cezaSuresiInput = interaction.fields.getTextInputValue('cezaSuresiInput');
                const cezaSuresi = parseCezaSuresi(cezaSuresiInput);
                if (cezaSuresi) {
                    await applyCeza(interaction, allah, cezaSuresi);
                } else {
                    await interaction.reply({ content: 'Geçersiz ceza süresi girdiniz.', ephemeral: true });
                }
            }
        });

        const ytstat = require("../models/yetkili_stats_sema");

        try {
            await ytstat.findOneAndUpdate({ yetkiliid: interaction.user.id }, { $inc: { KactaneWhcezaVermis: 1 } }, { upsert: true, new: true });
        } catch (err) {
            return interaction.reply({ content: `Ban Komutunu Kullanırken Database İle İlgili Bir Problem Oluştu\n**↪** ${err}`, ephemeral: true });
        }
    }
};

async function applyCeza(interaction, member, cezaSuresi) {
    const serverSettings = await ServerSettings.findOne({ guildId: interaction.guild.id });

    if (!serverSettings) {
        return interaction.reply({ content: "Sunucu ayarları bulunamadı. Lütfen kurulumunuzu kontrol edin.", ephemeral: true });
    }
    const whitelist = interaction.guild.roles.cache.get(serverSettings.whitelistRol);
    const wlcezarol = interaction.guild.roles.cache.get(serverSettings.wlcezaRol);

    if (!whitelist || !wlcezarol) {
        return interaction.reply({ content: "Whitelist veya WLCEZA rolü bulunamadı. Lütfen sunucu ayarlarınızı kontrol edin.", ephemeral: true });
    }

    const userRoles = member.roles.cache;
    const rolesArray = userRoles.map(role => role.id);

    await member.setNickname("Whitelist Ceza");
    await member.roles.remove(whitelist.id);
    await member.roles.add(wlcezarol.id);

    const cezaBitis = new Date(Date.now() + cezaSuresi);

    await Ceza.create({
        userId: member.id,
        guildId: interaction.guild.id,
        roles: rolesArray,
        cezaBitis: cezaBitis
    });

    let cezaMesaji = new Discord.EmbedBuilder()
        .setTitle(`${member.user.username} - WLCEZA`)
        .setDescription(`<a:1126192573439017000Kopya:1221160964859236447> ${member} kişisine **${Math.round(cezaSuresi / 86400000)} GÜN** Whitelist cezası başarıyla verildi.`);

    interaction.followUp({ embeds: [cezaMesaji] });
}

function parseCezaSuresi(input) {
    const daysRegex = /(\d+)/;
    const matches = input.match(daysRegex);
    if (matches) {
        const days = parseInt(matches[1]);
        return days * 86400000;
    }
    return null;
}
