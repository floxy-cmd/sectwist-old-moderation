const { EmbedBuilder, PermissionsBitField, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require("discord.js");
const config = require("../config.json");
const ServerSettings = require("../models/serverSettings");

module.exports = {
    name:"isimdegistir",
    description: 'İsim değiştirme işlemi',
    type:1,
    options: [
        {
            name:"kişi",
            description:"Kullanıcı ismi değiştirilecek kullanıcıyı seçin!",
            type:6,
            required:true
        }
    ],
    run: async(client, interaction) => {

        const serverSettings = await ServerSettings.findOne({ guildId: interaction.guild.id });

        if (!serverSettings) {
            return interaction.reply({ content: "Sunucu ayarları bulunamadı. Lütfen kurulumunuzu kontrol edin.", ephemeral: true });
        }

        const yetkinyetersizdostum = new EmbedBuilder()
            .setAuthor({ name: `${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true}) })
            .setDescription(`・ *\**Uyarı:\** Bu komutu kullanmak için gerekli yetkiyi barındırmıyorsun.*`)
            .setTimestamp();

        if(!interaction.member.roles.cache.get(serverSettings.yetkiliRol) && !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ embeds: [yetkinyetersizdostum], ephemeral: true });
        }

        const uye = interaction.options.getUser('kişi');
        if(uye.id === interaction.user.id) {
            const rolvermeoç = new EmbedBuilder()
                .setAuthor({ name: `${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true}) })
                .setDescription(`・ *\**Uyarı:\** Kendinin mi ismini değiştireceksin.*`)
                .setTimestamp();

            return interaction.reply({ embeds: [rolvermeoç], ephemeral: true });
        }

        const kendindenüsterolveremessinannesifallik = new EmbedBuilder()
            .setAuthor({ name: `${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true}) })
            .setDescription(`・ *\**Uyarı:\** Kendinden yüksek kişilerin ismini değiştiremezsin.*`)
            .setTimestamp();

        if (interaction.guild.members.cache.get(uye.id).roles.highest.position >= interaction.member.roles.highest.position) {
            return interaction.reply({ embeds: [kendindenüsterolveremessinannesifallik], ephemeral: true });
        }

        const modal = new ModalBuilder()
            .setCustomId('isimdegistirModal')
            .setTitle('İsim Değiştir')
            .addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('newName')
                        .setLabel('Yeni İsim')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true)
                )
            );

        await interaction.showModal(modal);

        client.once('interactionCreate', async modalInteraction => {
            if (!modalInteraction.isModalSubmit()) return;
            if (modalInteraction.customId !== 'isimdegistirModal') return;

            const newName = modalInteraction.fields.getTextInputValue('newName');

            const başarıisimdeğiştirme = new EmbedBuilder()
                .setColor("Blurple")
                .setAuthor({ name: `${interaction.member.username || "İsim bulunamadı."}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                .setDescription(`<a:1z:1176925311930220635> ・ ${uye} *isimli oyuncunun ismi* \`${newName}\` *diye başarılı bir şekilde değiştirildi*\n\n<a:anancafe:1177717455452377098> ・ \`ʏᴇᴛᴋıʟı:\` ${interaction.user}`);

            const isimlog = new EmbedBuilder()
                .setColor("Red")
                .setAuthor({ name: `${interaction.member.username || "İsim bulunamadı."}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                .setDescription(`<a:1z:1176925311930220635> ・ ${uye} *isimli oyuncunun ismi* \`${newName}\` *diye başarılı bir şekilde değiştirildi*\n\n<a:anancafe:1177717455452377098> ・ \`ʏᴇᴛᴋıʟı:\` ${interaction.user}`);

            await modalInteraction.reply({ embeds: [başarıisimdeğiştirme], ephemeral: true });
            interaction.guild.channels.cache.find(channel => channel.name === "isim-log").send({ embeds: [isimlog] }).catch(e => {});

            interaction.guild.members.cache.get(uye.id).setNickname(newName).catch(console.error);
        });
    }
};
