const { Client, EmbedBuilder, PermissionsBitField } = require("discord.js");
const Uyarı = require("../models/uyarı_sema");
const ServerSettings = require("../models/serverSettings");

module.exports = { 
  name: "uyarı",
  description: "Birine uyarımı vermek istiyorsun ozaman hoş geldin",
  type: 1,
  options: [
    {
        name:"kullanıcı",
        description:"Uyarı verilecek kullanıcıyı seçiniz!",
        type:6,
        required:true
    },
    {
        name:"kaç-x-verilecek",
        description:"Bir uyarı sayısı seç",
        type:3,
        required:true,
        choices: [
            { name: "❗ 1 X UYARI", value: "1x" },
            { name: "❗ 2 X UYARI", value: "2x" },
            { name: "❗ 3 X UYARI", value: "3x" },
          ]
    },
  ],

  run: async(client, interaction) => {  
    const user = interaction.options.getMember('kullanıcı');
    const kacx = interaction.options.getString('kaç-x-verilecek');
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

    const uyarıverdinembed = new EmbedBuilder()
    .setAuthor({ name: `${user.user.username} Kullanıcısına başarıyla uyarı verdin!`, iconURL: interaction.guild.iconURL({ dynamic: true}) })
    .setDescription(`
    📋 ・ **Başarıyla ${user} kullanıcısına ${parseInt(kacx.charAt(0))}x uyarı verdin**

    🎉 ・ \`Yetkili:\` ${interaction.user}
    👤 ・ \`Kullanıcı:\` ${user}
    `)
    .setThumbnail(`${interaction.user.displayAvatarURL()}`)
    
    let eskiUyarı = await Uyarı.findOne({ uyarıverilen: user.id });

    let toplamUyarı = 0;
    
    if (eskiUyarı) {
      toplamUyarı += parseInt(eskiUyarı.kacxeyedi.charAt(0));
      toplamUyarı += parseInt(kacx.charAt(0));

      const uyarıverdinembed02 = new EmbedBuilder()
      .setAuthor({ name: `${user.user.username} Kullanıcısının uyarısı arttı!`, iconURL: interaction.guild.iconURL({ dynamic: true}) })
      .setDescription(`
      📋 ・ **Kullanıcı daha önce uyarı almaya hak kazanmış ve bu yüzden uyarısı arttırıldı. Verilen uyarı sayısı:** \`${parseInt(kacx.charAt(0))}\`

      🔼 ・ \`Daha Önce Sahip Olduğu Uyarı Sayısı:\` **${parseInt(eskiUyarı.kacxeyedi.charAt(0))}**
      ⬆️ ・ \`Yeni Toplam Uyarı Sayısı:\` **${toplamUyarı}**

      🎉 ・ \`Yetkili:\` ${interaction.user}
      👤 ・ \`Kullanıcı:\` ${user}
      `)
      .setThumbnail(`${interaction.user.displayAvatarURL()}`)

      eskiUyarı.kacxeyedi = `${toplamUyarı}x`;
      eskiUyarı.type = toplamUyarı;
      await eskiUyarı.save();
      
      interaction.reply({ embeds: [uyarıverdinembed02] });
    } else {
      const yeniUyarıKaydı = new Uyarı({
        uyarıverilen: user.id,
        yetkili: interaction.user.id,
        kacxeyedi: kacx,
        type: parseInt(kacx.charAt(0)),
      });
      await yeniUyarıKaydı.save();
      
      interaction.reply({ embeds: [uyarıverdinembed] });
    }

    const ytstat = require("../models/yetkili_stats_sema");

    try {
        await ytstat.findOneAndUpdate({ yetkiliid: interaction.user.id }, { $inc: { KactaneUyarıVermis: 1 } }, { upsert: true, new: true });
    } catch (err) { 
        return interaction.reply({ content: `Ban Komutunu Kullanırken Database İle İlgili Bir Problem Oluştu\n**↪** ${err}`, ephemeral: true });
    }
  }
}
