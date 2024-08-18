// Discord
const { PermissionsBitField, StringSelectMenuBuilder, AuditLogEvent, EmbedBuilder, Events, ButtonStyle, Client, GatewayIntentBits, ChannelType, Partials, ActionRowBuilder, SelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, InteractionType, SelectMenuInteraction, ButtonBuilder} = require("discord.js");
const ms = require("ms")
const { joinVoiceChannel, createAudioPlayer, NoSubscriberBehavior, createAudioResource, StreamType, AudioPlayerStatus,  } = require('@discordjs/voice');
const canvafy = require("canvafy");
const fs = require("fs");
const path = require('path');
// İNTENTS
const client = new Client({ intents: Object.values(GatewayIntentBits), shards: "auto", partials: [Partials.Message, Partials.Channel, Partials.GuildMember, Partials.Reaction, Partials.GuildScheduledEvent, Partials.User, Partials.ThreadMember, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages,GatewayIntentBits.MessageContent,] });
const PARTIALS = Object.values(Partials);
const Discord = require("discord.js")
const config = require("./config.json");
const moment = require("moment");
const mongoConnect = require("./utils/mongoConnect.js")
require("moment-duration-format");
moment.locale('tr')
// Database
mongoConnect()
const db = require("croxydb")
const AFK = require('./models/afk_sema.js');
const Ticket = require('./models/ticket_sema.js');
const Donate = require('./models/donate_sema'); 
const ayarlamalar = require('./models/ayarlamalar'); 

//Slash Commands Register\\
global.config = config;
global.client = client;
client.setMaxListeners(0);
client.commands = (global.commands = []);
const { readdirSync } = require("fs")
const { TOKEN } = require("./config.json");
const ServerSettings = require("./models/serverSettings.js");
const { ServerResponse } = require("http");

const commandsPath = path.resolve(__dirname, 'commands');
fs.readdirSync(commandsPath).forEach(f => {
    if (!f.endsWith('.js')) return;

    const props = require(path.join(commandsPath, f));

    if (props.type === 2 || props.type === 3) {
        client.commands.push({
            name: props.name.toLowerCase(),
            type: props.type
        });
    } else {
        client.commands.push({
            name: props.name.toLowerCase(),
            description: props.description,
            options: props.options,
            dm_permission: false,
            type: props.type || 1
        });
    }

    console.log(`[Command] ${props.name} command loaded.`);
});

// Load Events
const eventsPath = path.resolve(__dirname, 'events');
fs.readdirSync(eventsPath).forEach(e => {
    if (!e.endsWith('.js')) return;

    const eve = require(path.join(eventsPath, e));
    const name = e.split('.')[0];

    client.on(name, (...args) => {
        try {
            eve(client, ...args);
        } catch (err) {
            console.error(`Error handling event ${name}:`, err);
        }
    });

    console.log(`[EVENT] ${name} event loaded.`);
});

client.login(TOKEN)

process.on("unhandledRejection", (reason, p) => {
    console.log(" [Error] :: Unhandled Rejection/Catch");
    console.log(reason, p);
});
process.on("uncaughtException", (err, origin) => {
    console.log(" [Error] :: Uncaught Exception/Catch");
    console.log(err, origin);
});
process.on("uncaughtExceptionMonitor", (err, origin) => {
    console.log(" [Error] :: Uncaught Exception/Catch (MONITOR)");
    console.log(err, origin);
});


client.on(Events.MessageCreate, async message => {
  if (message.author.bot) return;
  if (message.channel.id !== "1267085271808217207") return;

  // Fetch guild settings
  const guildSettings = await ayarlamalar.findOne({ guildID: message.guild.id });
  if (!guildSettings || !guildSettings.icnamesistem) return;

  const regex = /^[a-zA-Z]+\s[a-zA-Z]+$/;
  if (!regex.test(message.content)) {
      return;
  }

  try {
      await message.react('✅');
      await message.react('❌');
  } catch (error) {
      console.error('Emoji ekleme hatası:', error);
  }
});

// Message reaction add event handler
client.on(Events.MessageReactionAdd, async (reaction, user) => {
  if (user.bot) return;

  if (reaction.message.channel.id !== "1267085271808217207") return;

  if (reaction.partial) {
      try {
          await reaction.fetch();
      } catch (error) {
          console.error('Mesaj yükleme hatası:', error);
          return;
      }
  }

  // Fetch guild settings
  const guildSettings = await ayarlamalar.findOne({ guildID: reaction.message.guild.id });
  if (!guildSettings || !guildSettings.icnamesistem) return;

  const member = reaction.message.guild.members.cache.get(user.id);

  if (!member.roles.cache.has("1267085271011168274")) {
      try {
          await reaction.users.remove(user.id);
      } catch (error) {
          console.error('Reaksiyonu kaldırma hatası:', error);
      }
      return;
  }

  const targetMember = reaction.message.guild.members.cache.get(reaction.message.author.id);

  if (reaction.emoji.name === '✅') {
      const nameParts = reaction.message.content.split(' ');
      const nickname = `${nameParts[0]} ${nameParts[1]}`;

      try {
          await targetMember.setNickname(nickname);
          await targetMember.roles.add("1267085270969356357");
          await targetMember.send('İsminiz onaylanmıştır!');
      } catch (error) {
          console.error('İsim değiştirme veya rol verme hatası:', error);
      }
  } else if (reaction.emoji.name === '❌') {
      const reasonMessage = await reaction.message.channel.send('İsmi reddetme sebebini giriniz:');

      const filter = response => response.author.id === user.id;
      const collector = reaction.message.channel.createMessageCollector({ filter, time: 60000, max: 1 });

      collector.on('collect', async collected => {
          const reason = collected.content;

          try {
              await targetMember.send(`İsminiz reddedilmiştir. Sebep: ${reason}`);
              await reasonMessage.delete();
              await collected.delete();
          } catch (error) {
              console.error('DM gönderme veya mesaj silme hatası:', error);
          }
      });

      collector.on('end', collected => {
          if (collected.size === 0) {
              reasonMessage.delete().catch(console.error);
          }
      });
  }
});

client.on("messageCreate", async message => {
  const afkData = await AFK.findOne({ userID: message.author.id });

  if (afkData) {
    const sonuc = Date.now() - afkData.gırıszaman;
    await AFK.findOneAndDelete({ userID: message.author.id });

    const afkçıkışembed = new EmbedBuilder()
      .setAuthor({ name: `${message.member.nickname || "Bulamadım"}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
      .setDescription(`📰・${message.author}, \`${afkData.sebep}\` *sebebiyle, girdiğiniz afk modundan çıktınız* \`${moment.duration(sonuc).format("H [saat], m [dakika], s [saniye]")}\` *süredir afk moduna idiniz.*`)
      .setFooter({ text: `🌐 ${message.guild.name}`})
      .setTimestamp();

    message.reply({ embeds: [afkçıkışembed] }).then(x => setTimeout(() => x.delete(), 10000));
  }

  const mentionedUser = message.mentions.users.first();
  if (mentionedUser) {
      const afkDataMentioned = await AFK.findOne({ userID: mentionedUser.id });
      if (afkDataMentioned) {
          const sebep = afkDataMentioned.sebep;

          const afkEmbedMentioned = new EmbedBuilder()
              .setAuthor({ name: `${message.member.nickname || "Bulamadım"} Kişisi şuanda afk!`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
              .setDescription(`<a:ulem:1178582136115171358> ・Etiketlediğin kişi \`${sebep}\` sebebi ile afk modunda!`)
              .setTimestamp();

          message.reply({ embeds: [afkEmbedMentioned] }).then(x => setTimeout(() => x.delete(), 10000));
      }  
    }
});

// Log Sistemi\\

client.on("messageDelete", async (message) => {
  const guild = client.guilds.cache.get(message.guild.id);

    await message.guild.fetchAuditLogs({
        type: AuditLogEvent.messageDelete
      }).then(async (audit) => {
    let ayar = audit.entries.first()
    let yapan = ayar.executor

    const mesajsilindioc = new EmbedBuilder()
    .setAuthor({ name: `Sunucuda Bir Mesaj Silindi`, iconURL: message.guild.iconURL({ dynamic: true}) })
    .setDescription(`<a:ulem:1178582136115171358> ・ *Bir yetkili veya kullanıcı tarafından* | \`${message.channel.name}\` | *isimli kanalda mesaj silindi!*\n\n<:kiralsin:1178009128296263831> ・ \`ʏᴇᴛᴋɪʟɪ:\` | <@${yapan.id}> |\n<a:anancafe:1221160970525868102> ・ \`ᴍᴇsᴀᴊ sᴀʜıʙı:\` | ${message.author} |\n\n**Silinen Mesaj**\n\`\`\`ansi\n[2;34m${message.content}[0m\`\`\``)
    .setFooter({ text: `${message.guild.name} 💝 Sectwist`})
    .setTimestamp()


    
    guild.channels.cache.find(channel => channel.name === "mesaj-log").send({embeds: [mesajsilindioc]})
    })
})
  
/*client.on("messageUpdate", async (oldMessage, newMessage) => {
  const guild = client.guilds.cache.get(config.GUİLD);
    let date = new Date();

    let trDate = date.toLocaleDateString("tr-TR", {
        "month": "long",
        "year": "numeric",
        "day": "numeric"
    });

    const mesajduzenlendioc = new EmbedBuilder()
    .setAuthor({ name: `Hey Sunucuda Birisi Mesajını Düzenledi`, iconURL: newMessage.guild.iconURL({ dynamic: true}) })
    .setDescription(`<a:ulem:1178582136115171358> ・ *Bir kullanıcı* | \`${newMessage.channel.name}\` | *isimli kanalda kendi mesajını güncelledi!*\n\n<a:anancafe:1221160970525868102> ・ \`ᴍᴇsᴀᴊ sᴀʜɪɴʙɪ:\` | <@${newMessage.author.id}>\n\n**Eski Mesaj:**\n\`\`\`ansi\n[2;35m${oldMessage.content}[0m\`\`\`\n\n**Yeni Mesaj:**\n\`\`\`ansi\n[2;35m${newMessage.content}[0m\`\`\``)
    .setFooter({ text: `${trDate} ${date.getHours()}:${date.getMinutes()}`})

    guild.channels.cache.get(config.mesajlog).send({embeds: [mesajduzenlendioc],});
});*/
  
  client.on("roleCreate", async (roleMention) => {
    const guild = client.guilds.cache.get(roleMention.guild.id);
      let date = new Date();
  
      let trDate = date.toLocaleDateString("tr-TR", {
          "month": "long",
          "year": "numeric",
          "day": "numeric"
      });
  
      await guild.fetchAuditLogs({
          type: AuditLogEvent.roleCreate
        }).then(async (audit) => {
      let ayar = audit.entries.first()
      let yapan = ayar.executor
  
      const rololusturulduamksalagı = new EmbedBuilder()
      .setAuthor({ name: `${yapan.username} - ROL ACILDI`, iconURL: roleMention.guild.iconURL({ dynamic: true})})
      .setDescription(`<a:ulem:1178582136115171358> ・ *Bir yetkili tarafından* | \`${roleMention.name}\` | *isimli rol oluşturuldu.*\n\n<:kiralsin:1178009128296263831> ・ \`ʏᴇᴛᴋɪʟɪ:\` | ${yapan} |\n<a:anancafe:1221160970525868102> ・ \`ᴀᴄıʟᴀɴ ʀᴏʟ:\` | <@&${roleMention.id}> |\n\n<a:ayarlar31:1221371710524362763> ・ \`ᴛᴀʀıʜ: ${trDate} ${date.getHours()}:${date.getMinutes()}\``)
      .setFooter({ text: `${guild.name} 💝 Sectwist`})
  
      guild.channels.cache.find(channel => channel.name === "rol-log").send({
        embeds: [rololusturulduamksalagı],
        });
 })
})

//.İP .TS\\
client.on("messageCreate", async message => {
  if (message.guild) {  // Sunucudan gönderildiğini kontrol edin
      const ipkembed = new EmbedBuilder()
          .setAuthor({name: "Sunucu ip adresimiz aşağıda yazmaktadır"})
          .setDescription(`Merhaba sanırsam sunucumuzun İP'sini adresimizi bulmaya çalışıyorsun\n\nİşte sunucumuzun İP Adresi » ${ServerSettings.serverIp} `)
          .setFooter({ text: `${message.guild.name} 💝 Sectwist`})
          .setTimestamp();
      
      let ipkembed31 = [
          ".ip",
          "!ip",
      ];
      if (ipkembed31.includes(message.content)) {
          message.reply({embeds: [ipkembed]}).then(x => setTimeout(() => x.delete(), 30000));
      }
  } else {
      console.log("Bu mesaj bir sunucudan gelmiyor.");
  }
});


// Kayıttayım

const cooldowns = {};

client.on("interactionCreate", async interaction => {
  if (interaction.customId === 'kayıtolustur') {
    const userId = interaction.user.id;

    if (!cooldowns[userId] || cooldowns[userId] <= Date.now()) {
      const channel = interaction.guild.channels.cache.find(channel => channel.name === "mulakat-log")

      const cooldownTime = Date.now() + (5 * 60 * 1000);

      cooldowns[userId] = cooldownTime;

        interaction.reply({ content: `- Mülkatta olduğunu yetkililerimize bildirmiş durumdasın lütfen https://discord.com/channels/1234894360521347092/1237522171270660106 kanalına geçiniz`, ephemeral: true });

      channel.send(`<@${userId}> **Mülakatta olduğunu belirtti**\n\n||<@&${ServerSettings.yetkiliRol}>|| `)
        .then(x => setTimeout(() => x.delete(), 30000));
    } else {
      const remainingTime = Math.ceil((cooldowns[userId] - Date.now()) / 1000 / 60);
      interaction.reply({ content: `Bu eylemi tekrar gerçekleştirmek için ${remainingTime} dakika beklemelisin.`, ephemeral: true });
    }
  }
});

// Kayıttayım son

// Taşşaklı ticket \\
client.on("interactionCreate", async interaction => {

    const Sayılar = require("./models/sunucu_ticket_ban_veri");

    let date = new Date();
  
    let trDate = date.toLocaleDateString("tr-TR", {
        "month": "long",
        "year": "numeric",
        "day": "numeric"
    });

    const destekrow = new ActionRowBuilder()
    .addComponents(
        new StringSelectMenuBuilder()
            .setCustomId(`destekyönet`)
            .setPlaceholder('ᴅᴇsᴛᴇᴋ ᴛᴀʟᴇʙɪ̇ɴᴇ ᴜʏɢᴜʟᴀᴍᴀᴋ ɪ̇sᴛᴇᴅɪ̇ɢ̆ɪ̇ɴɪ̇ᴢ ɪ̇şʟᴇᴍɪ̇ sᴇᴄ̧ɪ̇ɴ̧')
            .setMinValues(1)
            .setMaxValues(1)
            .addOptions([
              {
                  label: "Desteği kapat",
                  description: "Destek talebini mesajları kaydedip kapatır",
                  emoji: "1227282122486845552",
                  value: "kaydetvesg"
              },
  
              {
                  label: "Destek Yedeği",
                  description: "Destek yedeği al!",
                  emoji: "1221160970525868102",
                  value: "destekydk"
              },
              {
                  label: "Seçimi İptal Et",
                  description: "Yapmış olduğun seçimi iptal et",
                  emoji: "1227282122486845552",
                  value: "secimiptal"
              }
          ]));
  
      if(interaction.customId === 'woolexaticketcreate') {
  
        const lvl = (await Sayılar.findOne({})).openedTicketCount;
  
          try {
            await Sayılar.findOneAndUpdate({}, { $inc: { openedTicketCount: 1 } }, { upsert: true, new: true });
        } catch (err) { 
            return interaction.reply({ content: `Ticket Komutunu Kullanırken Database İle İlgili Bir Problem Oluştu\n**↪** ${err}`, ephemeral: true });
        }
  
          const channel = await interaction.guild.channels.create({
              name: `│${lvl}│${interaction.user.username}`,
              type: Discord.ChannelType.GuildText,
              parent: ServerSettings.ticketkat,
              topic: `Hey ${interaction.user.username} başarıyla destek talebini oluşturdun lütfen aşağıdan destek almak istediğin konuyu seç!`,
              permissionOverwrites: [
                  {
                    id: interaction.guild.id,
                    deny: [Discord.PermissionsBitField.Flags.ViewChannel, Discord.PermissionsBitField.Flags.SendMessages],
                  },
                   {
                    id: interaction.user.id,
                    allow: [Discord.PermissionsBitField.Flags.ViewChannel,],
                  },
                  {
                   id: ServerSettings.yetkiliRol,
                   allow: [Discord.PermissionsBitField.Flags.ViewChannel, Discord.PermissionsBitField.Flags.SendMessages],
                  },
                ],
            });
  
            const tickecreatembed = new EmbedBuilder()
            .setColor("DarkButNotBlack")
            .setThumbnail(`${interaction.user.displayAvatarURL()}`)
            .setAuthor({ name: `sᴛᴏʀɪᴀᴠ - ᴅᴇꜱᴛᴇᴋ ꜱıꜱᴛᴇᴍı`, iconURL: interaction.guild.iconURL({ dynamic: true }) })
            .setDescription(`<a:anancafe:1221160970525868102> ・ Lütfen hangi kategoride destek alıcaksanız seçiminiz ona göre yapınız.\n\n<a:kalp:1221160952611868732> ・ Destek talebini gereksiz kullanmak ceza-i işlem uygulancaktır bu yüzden destek iptal butonu bulunmaktadır.\n\n<:bagranadam:1221371712214536252> ・ \`ᴅᴇꜱᴛᴇᴋ ᴀᴄᴀɴ:\` <@${interaction.user.id}>\n<a:1z:1221371710524362763> ・ \`ᴛᴀʀıʜ: ${trDate} ${date.getHours()}:${date.getMinutes()}\``)
            .setImage(`https://cdn.discordapp.com/attachments/1075817734773940255/1130913846685618337/logoo.gif?ex=663c5ed8&is=663b0d58&hm=8ef15b9d246448f6f51ef9e13d406eabc09dcd95533e328a5b0fd874fcdedde4&`)
            
            const ticketselect = new ActionRowBuilder()
  
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId(`kategorisec`)
                    .setPlaceholder('🎫 ᴅᴇsᴛᴇᴋ ᴋᴀᴛᴇɢᴏʀɪ sᴇᴄɪᴍɪ̧')
                    .setMinValues(1)
                    .setMaxValues(1)
                    .addOptions([
                        {
                            label: "ıᴄ ᴅᴇsᴛᴇᴋ",
                            emoji: "1221160978851561544",
                            value: "ic"
                        },
                        {
                          label: "ᴏᴄᴄ ᴅᴇsᴛᴇᴋ",
                          emoji: "1221160976439705641",
                          value: "occ"
                      },
                      {
                          label: "sıᴋᴀʏᴇᴛ ᴅᴇsᴛᴇᴋ",
                          emoji: "1221371710524362763",
                          value: "genel"
                      },
                      {
                          label: "ʙᴜɢ ʀᴇᴘᴏʀᴛ",
                          emoji: "1227279676494450759",
                          value: "bugreport"
                      },
                      {
                          label: "ᴅᴇsᴛᴇᴋ ɪᴘᴛᴀʟ",
                          emoji: "1227282122486845552",
                          value: "destekiptal"
                      }
                    ]));
  
                    const ticketolusturdun = new EmbedBuilder()
                    .setAuthor({name: `sᴛᴏʀɪᴀᴠ - ᴅᴇsᴛᴇᴋ sɪsᴛᴇᴍɪ`, iconURL: interaction.guild.iconURL({ dynamic: true }) })
                    .setDescription(`<a:anancafe:1221160970525868102> ・ \`ᴅᴇsᴛᴇᴋ ᴀᴄᴀɴ:\` <@${interaction.user.id}>\n<a:1z:1221371710524362763> ・ \`ᴅᴇsᴛᴇᴋ ᴋᴀɴᴀʟı:\` ${channel}\n<a:ayarlar31:1221371710524362763> ・ \`ᴛᴀʀɪʜ: ${trDate} ${date.getHours()}:${date.getMinutes()}\``)
  
                    const newTicket = new Ticket({
                        whOpen: interaction.user.id,
                        date: Date.now(),
                        odanınismi: `│${lvl}│${interaction.user.username}`,
                        desteginkonusu: 'Şimdilik Yok'
                    });
                    
                    // Ticket'i veritabanına kaydet
                    newTicket.save()
                        .catch(error => {
                            interaction.reply({ content: `Ticket kayıt edilirken bir problemle karşılaşıldı\nProblem: \`${error}\``})
                            // Hata yönetimi burada yapılabilir
                        });
  
            channel.send({embeds: [tickecreatembed], components: [ticketselect] })
            channel.send({content:`<@${interaction.user.id}>`}).then(x => setTimeout(() => x.delete(), 500));
            interaction.reply({embeds: [ticketolusturdun], ephemeral: true})
      
  }
  if (interaction.values == 'ic') {

    const odaisim = interaction.channel.name;

    const yeniVeri = {
      desteginkonusu: `İc Destek`
    };
    
    const sonuc = await Ticket.findOneAndUpdate(
      { odanınismi: odaisim }, 
      yeniVeri, 
      { new: true } 
    );


    icticket = new EmbedBuilder()
.setThumbnail(`${interaction.user.displayAvatarURL()}`)
.setAuthor({ name: `sᴛᴏʀɪᴀᴠ - ᴅᴇsᴛᴇᴋ sɪsᴛᴇᴍɪ`, iconURL: interaction.guild.iconURL({dynamic: true})})
.setDescription(`<a:kalp:1221160952611868732> ・ *Lütfen yetkililerimizin mesaj yazmasını beklemeden sorununuzu anlatınız.*\n\n<:bagranadam:1221371712214536252> ・ \`ᴅᴇꜱᴛᴇᴋ ᴀᴄᴀɴ:\` ${interaction.user}\n\n<a:anancafe:1221160970525868102> ・ \`ᴅᴇꜱᴛᴇᴋ ᴋᴀᴛᴇɢᴏʀɪꜱɪ: ɪᴄ ᴅᴇꜱᴛᴇᴋ\`\n<a:ayarlar31:1221371710524362763> ・ \`ᴛᴀʀıʜ: ${trDate} ${date.getHours()}:${date.getMinutes()}\``)
.setImage(`https://cdn.discordapp.com/attachments/1075818396605755552/1130915354336571443/Server_List.gif?ex=663c603f&is=663b0ebf&hm=02e44c2c6e5e3f47b434b3bd1912c56be29798ec5c26c4149afa12177b02c3e5&`)
.setTimestamp()

await interaction.reply({ content: `- *Başarılı bir şekilde*\n**IC** *kategoriside destek talebiniz açılmıştır.*`, ephemeral: true})
await interaction.message.edit({embeds: [icticket], components: [destekrow]})
interaction.channel.setTopic(`Hey ${interaction.user.username} başarıyla destek konusuu **Oyun İçi Destek** olarak değiştirdin`)
interaction.channel.permissionOverwrites.set([
    {
        id: interaction.guild.id,
        deny: [Discord.PermissionsBitField.Flags.ViewChannel],
      },
       {
        id: interaction.user.id,
        allow: [Discord.PermissionsBitField.Flags.ViewChannel, Discord.PermissionsBitField.Flags.SendMessages],
      },
      {
       id: ServerSettings.yetkiliRol,
       allow: [Discord.PermissionsBitField.Flags.ViewChannel, Discord.PermissionsBitField.Flags.SendMessages],
      },
  ]);
}

  if (interaction.values == 'occ') {

    const odaisim = interaction.channel.name;

    const yeniVeri = {
      desteginkonusu: `Occ Destek`
    };
    
    const sonuc = await Ticket.findOneAndUpdate(
      { odanınismi: odaisim }, 
      yeniVeri, 
      { new: true } 
    );

          occticket = new EmbedBuilder()
          .setThumbnail(`${interaction.user.displayAvatarURL()}`)
          .setAuthor({ name: `sᴛᴏʀɪᴀᴠ - ᴅᴇsᴛᴇᴋ sɪsᴛᴇᴍɪ`, iconURL: interaction.guild.iconURL({dynamic: true})})
          .setDescription(`<a:kalp:1221160952611868732> ・ *Lütfen yetkililerimizin mesaj yazmasını beklemeden sorununuzu anlatınız.*\n\n<:bagranadam:1221371712214536252> ・ \`ᴅᴇꜱᴛᴇᴋ ᴀᴄᴀɴ:\` ${interaction.user}\n\n<a:anancafe:1221160970525868102> ・ \`ᴅᴇꜱᴛᴇᴋ ᴋᴀᴛᴇɢᴏʀɪꜱɪ: ᴏᴏᴄ ᴅᴇꜱᴛᴇᴋ\`\n<a:ayarlar31:1221371710524362763> ・ \`ᴛᴀʀıʜ: ${trDate} ${date.getHours()}:${date.getMinutes()}\``)
          .setImage(`https://cdn.discordapp.com/attachments/1075818396605755552/1130915354336571443/Server_List.gif?ex=663c603f&is=663b0ebf&hm=02e44c2c6e5e3f47b434b3bd1912c56be29798ec5c26c4149afa12177b02c3e5&`)
          .setTimestamp()


    await interaction.reply({ content: `- *Başarılı bir şekilde*\n**OCC** *kategoriside destek talebiniz açılmıştır.*`, ephemeral: true})
    await interaction.message.edit({embeds: [occticket], components: [destekrow]})
    interaction.channel.setTopic(`Hey ${interaction.user.username} başarıyla destek konusuu **Oyun Dışı Destek** olarak değiştirdin`)
    interaction.channel.permissionOverwrites.set([
    {
        id: interaction.guild.id,
        deny: [Discord.PermissionsBitField.Flags.ViewChannel],
      },
    {
        id: interaction.user.id,
        allow: [Discord.PermissionsBitField.Flags.ViewChannel, Discord.PermissionsBitField.Flags.SendMessages],
      },
    {
       id: ServerSettings.yetkiliRol,
       allow: [Discord.PermissionsBitField.Flags.ViewChannel, Discord.PermissionsBitField.Flags.SendMessages],
      },
  ]);
}


if (interaction.values == 'genel') {

    const odaisim = interaction.channel.name;

    const yeniVeri = {
      desteginkonusu: `Şikayet Destek`
    };
    
    const sonuc = await Ticket.findOneAndUpdate(
      { odanınismi: odaisim }, 
      yeniVeri, 
      { new: true } 
    );

    sikayetticket = new EmbedBuilder()
.setThumbnail(`${interaction.user.displayAvatarURL()}`)
.setAuthor({ name: `sᴛᴏʀɪᴀᴠ - ᴅᴇsᴛᴇᴋ sɪsᴛᴇᴍɪ`, iconURL: interaction.guild.iconURL({dynamic: true})})
.setDescription(`<a:kalp:1221160952611868732> ・ *Lütfen yetkililerimizin mesaj yazmasını beklemeden sorununuzu anlatınız.*\n\n<:bagranadam:1221371712214536252> ・ \`ᴅᴇꜱᴛᴇᴋ ᴀᴄᴀɴ:\` ${interaction.user}\n\n<a:anancafe:1221160970525868102> ・ \`ᴅᴇꜱᴛᴇᴋ ᴋᴀᴛᴇɢᴏʀɪꜱɪ: ꜱıᴋᴀʏᴇᴛ ᴅᴇꜱᴛᴇᴋ\`\n<a:ayarlar31:1221371710524362763> ・ \`ᴛᴀʀıʜ: ${trDate} ${date.getHours()}:${date.getMinutes()}\``)
.setImage(`https://cdn.discordapp.com/attachments/1075818396605755552/1130915354336571443/Server_List.gif?ex=663c603f&is=663b0ebf&hm=02e44c2c6e5e3f47b434b3bd1912c56be29798ec5c26c4149afa12177b02c3e5&`)
.setTimestamp()


await interaction.reply({ content: `- *Başarılı bir şekilde*\n**Şikayet** *kategoriside destek talebiniz açılmıştır.*`, ephemeral: true})
await interaction.message.edit({embeds: [sikayetticket], components: [destekrow]})
interaction.channel.setTopic(`Hey ${interaction.user.username} başarıyla destek konusuu **Genel Sorunlar** olarak değiştirdin`)  
interaction.channel.permissionOverwrites.set([
      {
        id: interaction.guild.id,
        deny: [Discord.PermissionsBitField.Flags.ViewChannel],
      },
       {
        id: interaction.user.id,
        allow: [Discord.PermissionsBitField.Flags.ViewChannel, Discord.PermissionsBitField.Flags.SendMessages],
      },
      {
       id: ServerSettings.yetkiliRol,
       allow: [Discord.PermissionsBitField.Flags.ViewChannel, Discord.PermissionsBitField.Flags.SendMessages],
      },
  ])};

  if (interaction.values == 'bugreport') {
  
    const odaisim = interaction.channel.name;

    const yeniVeri = {
      desteginkonusu: `Bug Report`
    };
    
    const sonuc = await Ticket.findOneAndUpdate(
      { odanınismi: odaisim }, 
      yeniVeri, 
      { new: true } 
    );

    bugticket = new EmbedBuilder()
.setThumbnail(`${interaction.user.displayAvatarURL()}`)
.setAuthor({ name: `sᴛᴏʀɪᴀᴠ - ᴅᴇsᴛᴇᴋ sɪsᴛᴇᴍɪ`, iconURL: interaction.guild.iconURL({dynamic: true})})
.setDescription(`<a:kalp:1221160952611868732> ・ *Lütfen yetkililerimizin mesaj yazmasını beklemeden sorununuzu anlatınız.*\n\n<:bagranadam:1221371712214536252> ・ \`ᴅᴇꜱᴛᴇᴋ ᴀᴄᴀɴ:\` ${interaction.user}\n\n<a:anancafe:1221160970525868102> ・ \`ᴅᴇꜱᴛᴇᴋ ᴋᴀᴛᴇɢᴏʀɪꜱɪ: ʙᴜɢ ᴅᴇꜱᴛᴇᴋ\`\n<a:ayarlar31:1221371710524362763> ・ \`ᴛᴀʀıʜ: ${trDate} ${date.getHours()}:${date.getMinutes()}\``)
.setImage(`https://cdn.discordapp.com/attachments/1075818396605755552/1130915354336571443/Server_List.gif?ex=663c603f&is=663b0ebf&hm=02e44c2c6e5e3f47b434b3bd1912c56be29798ec5c26c4149afa12177b02c3e5&`)
.setTimestamp()

await interaction.reply({ content: `- *Başarılı bir şekilde*\n**BUG** *kategoriside destek talebiniz açılmıştır.*`, ephemeral: true})
await interaction.message.edit({embeds: [bugticket], components: [destekrow]})
interaction.channel.setTopic(`Hey ${interaction.user.username} başarıyla destek konusuu **Bug Report** olarak değiştirdin`)
interaction.channel.permissionOverwrites.set([
    {
        id: interaction.guild.id,
        deny: [Discord.PermissionsBitField.Flags.ViewChannel],
      },
       {
        id: interaction.user.id,
        allow: [Discord.PermissionsBitField.Flags.ViewChannel, Discord.PermissionsBitField.Flags.SendMessages],
      },
      {
       id: ServerSettings.yetkiliRol,
       allow: [Discord.PermissionsBitField.Flags.ViewChannel, Discord.PermissionsBitField.Flags.SendMessages],
      },
  ])};
  
  if (interaction.values == `destekiptal`) {
    const sexyembedsex = new EmbedBuilder()
    .setAuthor({ name: `ᴅᴇsᴛᴇᴋ ᴛᴀʟᴇʙɪ ɪᴘᴛᴀʟ ᴇᴅɪʟᴅɪ`, iconURL: interaction.guild.iconURL({ dynamic: true}) })
    .setDescription(`Bu destek talebi <@${interaction.user.id}> tarafından iptal edilmiştir.\nDestek talebi **5** saniye sonra kapatılacaktır\nDesteği iptal eden yetkili: ${interaction.user}`)
    .setFooter({ text: `${interaction.guild.name} 💝 Sectwist`})

    interaction.reply({ embeds: [sexyembedsex] })
    interaction.channel.setName(`ᴅᴇsᴛᴇᴋ-ᴋᴀᴘᴀᴛıʟıʏᴏʀ`)

  setTimeout(() => {
    interaction.channel.delete();

  }, 5000);
}

if (interaction.values == 'secimiptal') {
    woolexasecim = new EmbedBuilder()
    .setAuthor({name: `Seçim iptal edildi`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
    .setDescription(`Hey yapmış olduğun seçimi iptal ettin`)
    .setTimestamp()
    await interaction.reply({embeds: [woolexasecim], ephemeral: true})
}

if (interaction.values == 'destekydk') {

      const d = await Ticket.findOne({ odanınismi: odaisim });
    
      let mesaj = interaction.channel.messages.cache.map(x => `${x.author.tag} : ${x.content}`).join("\n")
      await interaction.reply({files: [{attachment: Buffer.from(mesaj) , name: `${d.whOpen}-destek-talebi.txt`}], ephemeral: true})
}

if (interaction.values == 'kaydetvesg') {
    const odaisim = interaction.channel.name

    const d = await Ticket.findOne({ odanınismi: odaisim });
    const adam = await interaction.guild.members.cache.find(user => user.id === d.whOpen);

    const now = new Date();
    const timeString = now.toLocaleTimeString();
    const günler = now.toLocaleDateString();

    const logmesaj = new EmbedBuilder()
    .setAuthor({ name: `${adam.username} Adlı kişinin destek verileri`, iconURL: adam.user.displayAvatarURL({ dynamic: true }) })
    .setTitle("**Bir Destek Talebi Kapatıldı!**")
    .setDescription(`🎫 **»** \`ᴅᴇsᴛᴇɢ̆ɪ ᴋᴀᴘᴀᴛᴀɴ ʏᴇᴛᴋɪʟɪ\`: <@${interaction.user.id}>\n\n💎 **»** \`ᴅᴇsᴛᴇɢ̆ɪ ᴏʟᴜşᴛᴜʀᴀɴ ᴋɪşɪ\`: <@${d.whOpen}>\n\n💾 **»** \`ᴅᴇsᴛᴇɢ̆ɪɴ ᴏʟᴜşᴛᴜʀᴜʟᴍᴀ ᴛᴀʀɪʜɪ\`: <t:${parseInt(d.date / 1000)}:R>\n\n**» DESTEK KANALINI ⇓**\n\`\`\`ansi\n[2;32m${d.odanınismi}[0m\`\`\`\n**DESTEK KATEGORİSİ ⇓**\n\`\`\`ansi\n[2;32m${d.desteginkonusu}[0m\`\`\``)
    .setFooter({text: `Desteğin kapatılma saati » ${günler} ${timeString} `})

    const destekkapatıldı = new EmbedBuilder()
    .setColor("DarkRed")
    .setTitle("Destek talebi kapatılıyor")
    .setDescription(`Destek talebi 5 saniye içerisinde silinecektir\nSilen Yetkili: <@${interaction.user.id}>`)
    .setTimestamp()
                                                  
  await interaction.reply({embeds: [destekkapatıldı], })
  let mesaj = interaction.channel.messages.cache.map(x => `${x.author.tag} : ${x.content}`).join("\n")
  await guild.channels.cache.find(channel => channel.name === "ticket-log").send({embeds: [logmesaj]})
  await guild.channels.cache.find(channel => channel.name === "ticket-log").send({ files: [{attachment: Buffer.from(mesaj) , name: `${d.odanınismi}-destek-talebi.txt`}]})

  await Ticket.findOneAndDelete({ odanınismi: odaisim });
  
interaction.channel.setName(`ᴅᴇsᴛᴇᴋ-ᴋᴀᴘᴀᴛıʟıʏᴏʀ`)

  setTimeout(() => {
    interaction.channel.delete();

  }, 5000);

  const ytstat = require("./models/yetkili_stats_sema");

  try {
      await ytstat.findOneAndUpdate({ yetkiliid: interaction.user.id }, { $inc: { KacTicketBakmıs: 1 } }, { upsert: true, new: true });
  } catch (err) { 
      return interaction.reply({ content: `Ban Komutunu Kullanırken Database İle İlgili Bir Problem Oluştu\n**↪** ${err}`, ephemeral: true });
  }


  }

})