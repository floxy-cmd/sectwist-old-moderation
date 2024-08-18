const { AuditLogEvent, EmbedBuilder } = require("discord.js");
const config = require("../config.json");
const ServerSettings = require("../models/serverSettings");

module.exports = async (client, oldState, newState) => {
    const guild = client.guilds.cache.get(oldState.guild.id);

    let date = new Date();
    let trDate = date.toLocaleDateString("tr-TR", {
        month: "long",
        year: "numeric",
        day: "numeric"
    });

    if (!oldState.channel && newState.channel) {
        const kanalagirissagladı = new EmbedBuilder()
            .setAuthor({ name: `${newState.member.nickname || "Bulamadım"} - Giriş`, iconURL: newState.member.displayAvatarURL({ dynamic: true }) })
            .setDescription(`📥 ・ \`Kullanıcı:\` <@${newState.member.id}> - \`${newState.member.id}\`\n🎙️ ・ \`Ses Kanalı:\` ${newState.channel}`)
            .setFooter({ text: `${trDate} ${date.getHours()}:${date.getMinutes()}` });

        return guild.channels.cache.find(channel => channel.name === "ses-log").send({ embeds: [kanalagirissagladı] }).catch(console.error);
    }

    if (oldState.channel && !newState.channel) {
        const kanaldancıktı = new EmbedBuilder()
            .setAuthor({ name: `${oldState.member.nickname || "Bulamadım"} - Çıkış`, iconURL: oldState.member.displayAvatarURL({ dynamic: true }) })
            .setDescription(`📤 ・ \`Kullanıcı:\` <@${oldState.member.id}> - \`${oldState.member.id}\`\n🎙️ ・ \`Ses Kanalı:\` ${oldState.channel}`)
            .setFooter({ text: `${trDate} ${date.getHours()}:${date.getMinutes()}` });

        return guild.channels.cache.find(channel => channel.name === "ses-log").send({ embeds: [kanaldancıktı] }).catch(console.error);
    }
};
