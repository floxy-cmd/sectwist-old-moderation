const { Client, EmbedBuilder, PermissionsBitField } = require("discord.js");
const ytstat = require("../models/yetkili_stats_sema");
const canvafy = require("canvafy")
const ServerSettings = require("../models/serverSettings");

module.exports = {
  name: "yetkili-bilgi",
  description: "Yetkili bilgi sistemi",
  type: 1,
  options: [
    {
      name:"yetkili",
      description:"Bir yetkili seçiniz",
      type:6,
        required:true
    },
  ],

  run: async(client, interaction) => {
    const yetkili = interaction.options.getMember('yetkili');

    const serverSettings = await ServerSettings.findOne({ guildId: interaction.guild.id });

    if (!serverSettings) {
        return interaction.reply({ content: "Sunucu ayarları bulunamadı. Lütfen kurulumunuzu kontrol edin.", ephemeral: true });
    }


    const yetkinyetersizdostum = new EmbedBuilder()
    .setAuthor({ name: `${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
    .setDescription(`⚠️ ・ **Uyarı:** Bu komutu kullanmak için gerekli yetkiye sahip değilsin.`)
    .setTimestamp();

if (!interaction.member.roles.cache.has(serverSettings.yetkiliRol) && !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    return interaction.reply({ embeds: [yetkinyetersizdostum], ephemeral: true });
}

    const defaultValues = { KactaneWhVermis: 0, KactaneOlusumAcmıs: 0, KactaneUyarıVermis: 0, KacTicketBakmıs: 0 , KactaneWhcezaVermis: 0};
    const ytbilgialma = await ytstat.findOneAndUpdate(
      { yetkiliid: yetkili.id },
      { $setOnInsert: defaultValues },
      { upsert: true, new: true }
    );    
    
  const profile = await new canvafy.Profile()
    .setUser(`${yetkili.id}`)
    .setBorder("#f0f0f0")
    .setActivity({activity:{
      name:  `» Whitelist Verme: ${ytbilgialma.KactaneWhVermis || '0'}                      » Kullanıcı Banlama: ${ytbilgialma.KactaneWhVermis || '0'}`,
      name2: `» Oluşum Oluşturma: ${ytbilgialma.KactaneOlusumAcmıs || '0'}             » Uyarı Verme: ${ytbilgialma.KactaneUyarıVermis || '0'}`,
      name3: `» Whitelist Ceza Verme: ${ytbilgialma.KactaneWhcezaVermis || '0'}        » Ticket Bakma: ${ytbilgialma.KacTicketBakmıs || '0'}`, 
      type: 0,
      url: null,
      applicationId: '1237811782614253630',
      party: null,},
    })
    .build();

    // interaction.reply({ files: [{ attachment: top, name: `allahınmk.png` }]})
    interaction.reply({ files: [{
      attachment: profile,
      name: `profile.png`
    }] })
    
  }
};
