const { Client, GatewayIntentBits, Partials, EmbedBuilder, AttachmentBuilder } = require("discord.js");
const config = require('../config.json');
const canvafy = require("canvafy");
const moment = require("moment");
require("moment-duration-format");
moment.locale('tr');
const ServerSettings = require("../models/serverSettings");

/**
 * 
 * @param {import('discord.js').Client} client 
 * @param {import('discord.js').GuildMember} member
 */
module.exports = async (client, member) => {

  const serverSettings = await ServerSettings.findOne({ guildId: member.guild.id });

  const bannerURL = member.guild.bannerURL({ dynamic: true, size: 1024 }) || 'https://cdn.wallpapersafari.com/43/87/PUW0YZ.png';

  // Görseli oluştur
  const welcome = await new canvafy.WelcomeLeave()
    .setAvatar(member.user.displayAvatarURL({ forceStatic: true, extension: "png" }))
    .setBackground("image", bannerURL)
    .setTitle(`${member.user.tag}`)
    .setDescription("Sunucumuza Hoşgeldin! Kayıt Olmak İçin Mülakat Odalarına Geçebilirsin!")
    .setBorder("#2a2e35")
    .setAvatarBorder("#2a2e35")
    .setOverlayOpacity(0.3)
    .build();

  // Görseli AttachmentBuilder ile dosya olarak oluştur
  const attachment = new AttachmentBuilder(welcome, { name: `welcome-${member.id}.png` });

  let memberDay = moment(member.user.createdAt).format("DD");
  let memberDate = moment(member.user.createdAt).format("YYYY HH:mm:ss");
  let memberMonth = moment(member.user.createdAt).format("MM")
    .replace("01", "Ocak")
    .replace("02", "Şubat")
    .replace("03", "Mart")
    .replace("04", "Nisan")
    .replace("05", "Mayıs")
    .replace("06", "Haziran")
    .replace("07", "Temmuz")
    .replace("08", "Ağustos")
    .replace("09", "Eylül")
    .replace("10", "Ekim")
    .replace("11", "Kasım")
    .replace("12", "Aralık");
  let memberCount = member.guild.members.cache.size.toString().replace(/ /g, "    ");

  const güvenligüvensizkontroltime = 604800000;
  const kontrol = new Date().getTime() - member.user.createdAt.getTime() < güvenligüvensizkontroltime
    ? `🔒 Güvenilirlik: Hayır`
    : `🔓 Güvenilirlik: Evet`;

  const girisEmbed = new EmbedBuilder()
    .setAuthor({ name: `${member.guild.name} - Sunucumuza Hoş Geldiniz`, iconURL: member.guild.iconURL({ dynamic: true }) })
    .setDescription(`
**👤 Kullanıcı:** ${member} - \`${member.user.username}\`
**🆔 Kullanıcı ID:** \`${member.user.id}\`

**📅 Hesap Oluşturulma Tarihi:** \`${memberDay} ${memberMonth} ${memberDate}\`
**👥 Sunucudaki Kişi Sayısı:** \`${memberCount}\`

${kontrol}

🎉 Merhaba, sunucumuza hoş geldin! Sana başarıyla \`Kayıtsız Üye\` rolünü verdik. Keyifli vakit geçirmeni dileriz!
`)
    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
    .setImage(`attachment://welcome-${member.id}.png`)
    .setColor("#5865F2")
    .setFooter({ text: "Sunucumuzda eğlenceli vakitler dileriz!", iconURL: member.guild.iconURL({ dynamic: true }) });

  member.roles.add(serverSettings.nonwhRol).catch(console.error);

  member.send({
    embeds: [girisEmbed],
    files: [attachment]
  }).catch(console.error);
}
