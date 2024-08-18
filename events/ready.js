const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");
const { TOKEN } = require("../config.json");
const { Client, GatewayIntentBits, Partials, ActivityType } = require("discord.js");
const INTENTS = Object.values(GatewayIntentBits);
const PARTIALS = Object.values(Partials);
const config = require(`../config.json`);
const Ceza = require("../models/ceza");
const ServerSettings = require("../models/serverSettings");

const client = new Client({
  intents: INTENTS,
  allowedMentions: {
    parse: ["users"]
  },
  partials: PARTIALS,
  retryLimit: 3
});

module.exports = async (client) => {
  const rest = new REST({ version: "10" }).setToken(TOKEN || process.env.token);
  try {
    await rest.put(Routes.applicationCommands(client.user.id), {
      body: client.commands,
    });
  } catch (error) {
    console.error(error);
  }

  console.log(`
  ██▓███   ▄▄▄       ██▀███   ▄▄▄      ▓█████▄  ▒█████   ██ ▄█▀  ██████ 
  ▓██░  ██▒▒████▄    ▓██ ▒ ██▒▒████▄    ▒██▀ ██▌▒██▒  ██▒ ██▄█▒ ▒██    ▒ 
  ▓██░ ██▓▒▒██  ▀█▄  ▓██ ░▄█ ▒▒██  ▀█▄  ░██   █▌▒██░  ██▒▓███▄░ ░ ▓██▄   
  ▒██▄█▓▒ ▒░██▄▄▄▄██ ▒██▀▀█▄  ░██▄▄▄▄██ ░▓█▄   ▌▒██   ██░▓██ █▄   ▒   ██▒
  ▒██▒ ░  ░ ▓█   ▓██▒░██▓ ▒██▒ ▓█   ▓██▒░▒████▓ ░ ████▓▒░▒██▒ █▄▒██████▒▒
  ▒▓▒░ ░  ░ ▒▒   ▓▒█░░ ▒▓ ░▒▓░ ▒▒   ▓▒█░ ▒▒▓  ▒ ░ ▒░▒░▒░ ▒ ▒▒ ▓▒▒ ▒▓▒ ▒ ░
  ░▒ ░       ▒   ▒▒ ░  ░▒ ░ ▒░  ▒   ▒▒ ░ ░ ▒  ▒   ░ ▒ ▒░ ░ ░▒ ▒░░ ░▒  ░ ░
  ░░         ░   ▒     ░░   ░   ░   ▒    ░ ░  ░ ░ ░ ░ ▒  ░ ░░ ░ ░  ░  ░  
                 ░  ░   ░           ░  ░   ░        ░ ░  ░  ░         ░  
                                         ░                               

`.red);

setInterval(async () => {
    const activities = ["MZRP ❤️ Sectwist"];
    const random = activities[Math.floor(Math.random() * activities.length)];
    client.user.setPresence({ activities: [{ name: random, type: ActivityType.Playing }], status: "dnd" });
}, 45000);

  setInterval(async () => {
    const now = new Date();

    const cezalar = await Ceza.find({ cezaBitis: { $lt: now } });

    for (const ceza of cezalar) {
      const guild = client.guilds.cache.get(ceza.guildId);
      if (!guild) continue;

      const member = guild.members.cache.get(ceza.userId);
      if (!member) continue;

      const serverSettings = await ServerSettings.findOne({ guildId: guild.id });
      if (!serverSettings) continue;

      const wlcezarol = guild.roles.cache.get(serverSettings.wlcezaRol);

      await member.roles.remove(wlcezarol);
      for (const roleId of ceza.roles) {
        const role = guild.roles.cache.get(roleId);
        if (role) await member.roles.add(role);
      }
      await Ceza.findByIdAndDelete(ceza._id);
    }
  }, 60000); // Her dakika kontrol ediyoruz.
};
