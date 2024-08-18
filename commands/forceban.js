const { PermissionsBitField, EmbedBuilder } = require("discord.js");
const db = require("croxydb")
const config = require("../config.json")
const ServerSettings = require("../models/serverSettings");

module.exports = {
    name:"forceban",
    description: 'ID ile kullanıcı yasaklarsın!',
    type:1,
    options: [
        {
            name:"id",
            description:"Lütfen bir kullanıcı ID girin!",
            type:3,
            required:true
        },
        {
          name:"sebep",
          description:"Lütfen bir sebep giriniz",
          type:3,
          required:true
      },
       
       
    ],
  run: async(client, interaction) => {
    const serverSettings = await ServerSettings.findOne({ guildId: interaction.guild.id });

    if (!serverSettings) {
        return interaction.reply({ content: "Sunucu ayarları bulunamadı. Lütfen kurulumunuzu kontrol edin.", ephemeral: true });
    }
    const yetkinyetersizdostum = new EmbedBuilder()
        .setAuthor({ name: `${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true}) })
        .setDescription(`<a:ulem:1178582136115171358> ・ *\**Uyarı:\** Bu komutu kullanmak içi gerekli yetkiyi barındırmıyorsun.*`)
        .setTimestamp()
        
  
        if(!interaction.member.roles.cache.get(`${serverSettings.ustyetkiliRol}`) && !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply({ embeds: [yetkinyetersizdostum], ephemeral: true });

    const id = interaction.options.getString('id')
    const sebep = interaction.options.getString('sebeb');

    const kendindenüsterolveremessinannesifallik = new EmbedBuilder()
    .setAuthor({ name: `${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true}) })
    .setDescription(`<a:ulem:1178582136115171358> ・ *\**Uyarı:\** Kendinden üst kişileri banlayamassın*`)
    .setTimestamp()

    if (user.roles.highest.position >= interaction.member.roles.highest.position) return interaction.reply({ embeds: [kendindenüsterolveremessinannesifallik], ephemeral: true })

    let date = new Date();

    let trDate = date.toLocaleDateString("tr-TR", {
        "month": "long",
        "year": "numeric",
        "day": "numeric"
    });

    const banreply = new EmbedBuilder()
    .setAuthor({ name: `${interaction.member.nickname || "Bulamadım"}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
    .setDescription(`<:banned:1178001845906579576> ・ **${id}** *id'li oyuncu sunucudan başarılı bir şekilde* \`${sebep}\` *sebebi ile yasaklandı.*\n\n<:s2s:1176927304082018357> ・ \`ʏᴇᴛᴋıʟı:\` <@${interaction.user.id}>`)
    .setFooter({ text: `${trDate} ${date.getHours()}:${date.getMinutes()}`})

    const yasakkaldırmalog = new EmbedBuilder()
    .setAuthor({ name: `ᴡᴇsᴛʀᴏʟᴇᴘʟᴀʏ - ʏᴀsᴀᴋʟᴀᴍᴀ`, iconURL: interaction.user.displayAvatarURL({ dynamic: true}) })
    .setThumbnail(`${interaction.guild.iconURL()}`)
    .setDescription(`<:kiralsin:1178009128296263831> ・ \`ʏᴇᴛᴋɪʟɪ:\` <@${interaction.user.id}>\n<a:anancafe:1177717455452377098> ・ \`ᴏʏᴜɴᴄᴜ:\` ${id}\n**TARIH:**\n\`\`\`ansi\n[2;34m${trDate} ${date.getHours()}:${date.getMinutes()}[0m\`\`\`\n**YASAKLAMA BILGISI:**\n\`\`\`ansi\n[2;34m${sebep}[0m\`\`\``)

    interaction.guild.channels.cache.find(channel => channel.name === "banlog").send({ embeds: [yasakkaldırmalog]});
    interaction.reply({ embeds: [banreply]});
    interaction.guild.members.ban(id).catch(() => {})
}

};
