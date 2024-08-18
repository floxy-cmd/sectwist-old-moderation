const { Client, EmbedBuilder, PermissionsBitField } = require('discord.js');
const ServerSettings = require("../models/serverSettings");
module.exports = {
  name: 'setup',
  description: 'Kurulumları yapmaya başlayın.',
  type: 1,

  options: [
    {
      name: 'sunucu-ismi',
      description: 'Sunucu ismi ayarlanır.',
      type: 3,
      required: true
    },
    {
      name: 'sunucu-ip',
      description: 'Sunucu ip ayarlar.',
      type: 3,
      required: true
    },
    {
      name: 'cfx-kodu',
      description: 'Cfx kodunu ayarlar.',
      type: 3,
      required: true
    },
    
    // ROLLER
    {
        name: 'yetkili-rol',
        description: 'Yetkili rol ayarları.',
        type: 8,
        required: false
    },
    {
        name: 'blacklist-rol',
        description: 'Blacklist rol ayarları.',
        type: 8,
        required: false
    },
    {
        name: 'whitelist-rol',
        description: 'Yetkili rol ayarları.',
        type: 8,
        required: false
    },
    {
        name: 'nonwh-rol',
        description: 'Yetkili rol ayarları.',
        type: 8,
        required: false
    },
    {
        name: 'ustyetkili-rol',
        description: 'Yetkili rol ayarları.',
        type: 8,
        required: false
    },
    {
        name: 'wlceza-rol',
        description: 'Yetkili rol ayarları.',
        type: 8,
        required: false
    },
    {
      name: 'boss-rol',
      description: 'Boss rol ayarları.',
      type: 8,
      required: false
    },
  
    //roller bitiş

    // kanallar

    {
      name: 'sinirsizticket-kategori',
      description: 'Ticket kategorisi ayarları.',
      type: 7,
      required: false
    },
    {
      name: 'ticket-kategori',
      description: 'Ticket kategorisi ayarları.',
      type: 7,
      required: false
    },
    {
      name: 'ekipbaşvuru-kategori',
      description: 'Ekip başvuru kategorisi ayarları.',
      type: 7,
      required: false
    },

    // kanallar bitiş
    {
      name: 'aktif-resim',
      description: 'Aktif resmi ayarları.',
      type: 3,
      required: false
    },
    {
      name: 'bakim-resim',
      description: 'Bakım resmi ayarları.',
      type: 3,
      required: false
    },
    {
      name: 'restart-resim',
      description: 'Restart resmi ayarları.',
      type: 3,
      required: false
    },
  ],

  run: async(client, interaction) => {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({
        content: 'Bu komutu kullanmak için admin yetkisine sahip olmalısınız.',
        ephemeral: true
      });
    }

    const options = interaction.options;
    const guildId = interaction.guildId;
    const serverName = options.getString('sunucu-ismi');
    const serverIp = options.getString('sunucu-ip');
    const cfxCode = options.getString('cfx-kodu');
    const yetkiliRol = options.getRole('yetkili-rol');
    const blacklistRol = options.getRole('blacklist-rol');
    const whitelistRol = options.getRole('whitelist-rol');
    const nonwhRol = options.getRole('nonwh-rol');
    const ustyetkiliRol = options.getRole('ustyetkili-rol');
    const wlcezaRol = options.getRole('wlceza-rol');
    const bossRol = options.getRole('boss-rol');
    const ticketKategoriID = options.getChannel('sinirsizticket-kategori');
    const ticketkat = options.getChannel('ticket-kategori');
    const ekipbosuKategoriID = options.getChannel('ekipbaşvuru-kategori');
    const aktifResim = options.getString('aktif-resim');
    const bakimResim = options.getString('bakim-resim');
    const restartResim = options.getString('restart-resim');

    try {
      const settings = new ServerSettings({
        guildId,
        serverName,
        serverIp,
        cfxCode,
        yetkiliRol: yetkiliRol?.id,
        blacklistRol: blacklistRol?.id,
        whitelistRol: whitelistRol?.id,
        nonwhRol: nonwhRol?.id,
        ustyetkiliRol: ustyetkiliRol?.id,
        bossRol: bossRol?.id,
        wlcezaRol: wlcezaRol?.id,
        ticketKategoriID: ticketKategoriID?.id,
        ticketkat: ticketkat?.id,
        ekipbosuKategoriID: ekipbosuKategoriID?.id,
        aktifResim,
        bakimResim,
        restartResim,
      });
      await settings.save();

      const embedDescription = `
      \`SUNUCU AYARLARI\`
      **Sunucu İsmi:** ${serverName}
      **Sunucu IP:** ${serverIp}
      **CFX Kodu:** ${cfxCode}

      \`ROL AYARLARI\`
      **Yetkili Rol:** ${yetkiliRol || 'Belirtilmedi'}
      **Blacklist Rol:** ${blacklistRol || 'Belirtilmedi'}
      **Whitelist Rol:** ${whitelistRol || 'Belirtilmedi'}
      **Nonwh Rol:** ${nonwhRol || 'Belirtilmedi'}
      **Üst Yetkili Rol:** ${ustyetkiliRol|| 'Belirtilmedi'}
      **WL Ceza Rol:** ${wlcezaRol || 'Belirtilmedi'}
      **Boss Rol:** ${bossRol || 'Belirtilmedi'}

      \`KANALLAR\`
      **Ticket Kategori:** ${ticketKategoriID? `<#${ticketKategoriID}>` : 'Belirtilmedi'}
      **Ekip Başvuru Kategori:** ${ekipbosuKategoriID? `<#${ekipbosuKategoriID}>` : 'Belirtilmedi'}

      \`RESİMLER\`
      **Aktif Resim:** ${aktifResim || 'Belirtilmedi'}
      **Bakım Resim:** ${bakimResim || 'Belirtilmedi'}
      **Restart Resim:** ${restartResim || 'Belirtilmedi'}
      `;

      const embed = new EmbedBuilder()
        .setDescription(embedDescription)

      return interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error('Kurulum sırasında bir hata oluştu:', error);
      return interaction.reply({
        content: 'Kurulum sırasında bir hata oluştu. Lütfen tekrar deneyin.',
        ephemeral: true
      });
    }
  }
};
