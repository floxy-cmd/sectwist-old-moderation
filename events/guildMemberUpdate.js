const { AuditLogEvent, EmbedBuilder } = require("discord.js");
const config = require("../config.json");
const ServerSettings = require("../models/serverSettings");

module.exports = async (client, newMember, oldMember) => {
    let date = new Date();
    let trDate = date.toLocaleDateString("tr-TR", {
        month: "long",
        year: "numeric",
        day: "numeric"
    });

        const auditLogs = await newMember.guild.fetchAuditLogs({
            type: AuditLogEvent.MemberRoleUpdate
        });
        const entry = auditLogs.entries.first();
        const hedef = entry.target;
        const yapan = entry.executor;

        newMember.roles.cache.forEach(async role => {
            if (!oldMember.roles.cache.has(role.id)) {
                const embed = new EmbedBuilder()
                    .setAuthor({ name: `${newMember.guild.name} - ʀᴏʟᴇ ᴀᴅᴠɪꜱᴏʀ`, iconURL: newMember.guild.iconURL({ dynamic: true }) })
                    .setDescription(`⚠️ ・ *Bir kullanıcıya* | \`${role.name}\` | *isimli rolü bir yetkili tarafından alınmıştır!*\n\n📝 ・ \`ʏᴇᴛᴋıʟı:\` ${yapan}\n🚶 ・ \`ᴏʏᴜɴᴄᴜ:\` ${hedef}\n\n🔽 ・ \`ᴀʟıɴᴀɴ ʀᴏʟ:\` ${role}\n⏰ ・ \`ᴛᴀʀıʜ: ${trDate} ${date.getHours()}:${date.getMinutes()}\``)
                    .setThumbnail(yapan.displayAvatarURL());

                    newMember.guild.channels.cache.find(channel => channel.name === "rol-al-ver-log").send({ embeds: [embed] }).catch(console.error);
            }
        });

        oldMember.roles.cache.forEach(async role => {
            if (!newMember.roles.cache.has(role.id)) {
                const embed = new EmbedBuilder()
                    .setAuthor({ name: `${newMember.guild.name} - ʀᴏʟᴇ ᴀᴅᴠɪꜱᴏʀ`, iconURL: newMember.guild.iconURL({ dynamic: true }) })
                    .setDescription(`⚠️ ・ *Bir kullanıcıya* | \`${role.name}\` | *isimli rol bir yetkili tarafından verilmiştir!*\n\n📝 ・ \`ʏᴇᴛᴋıʟı:\` ${yapan}\n🚶 ・ \`ᴏʏᴜɴᴄᴜ:\` ${hedef}\n\n🔼 ・ \`ᴠᴇʀɪʟᴇɴ ʀᴏʟ:\` ${role}\n⏰ ・ \`ᴛᴀʀıʜ: ${trDate} ${date.getHours()}:${date.getMinutes()}\``)
                    .setThumbnail(hedef.displayAvatarURL());

                    newMember.guild.channels.cache.find(channel => channel.name === "rol-al-ver-log").send({ embeds: [embed] }).catch(console.error);
            }
        });
    }
