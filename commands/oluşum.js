const { PermissionsBitField, EmbedBuilder, ChannelType, ButtonStyle, ActionRowBuilder, ButtonBuilder, UserSelectMenuBuilder, Events } = require('discord.js');
const config = require("../config.json");
const ServerSettings = require("../models/serverSettings");
const ytstat = require("../models/yetkili_stats_sema");

module.exports = {
  name: 'oluşum',
  description: 'Özel oluşum oluşturur',
  type: 1,
  options: [
    {
      name: 'isim',
      description: 'Oluşum adını girin',
      type: 3,
      required: true,
    },
    {
      name: 'renk',
      description: 'Oluşum rengini girin (#0000) tarzında',
      type: 3,
      required: true,
    },
    {
      name: 'emoji',
      description: 'Oluşumun başvuru emojisi',
      type: 3,
      required: true,
    },
    {
      name: 'boss',
      description: 'Oluşumun bossunu girin',
      type: 6,
      required: true,
    }
  ],
  run: async (client, interaction) => {
    let replySent = false;


    try {
      const serverSettings = await ServerSettings.findOne({ guildId: interaction.guild.id });

      if (!serverSettings) {
        if (!replySent) {
          await interaction.reply({ content: "Sunucu ayarları bulunamadı. Lütfen kurulumunuzu kontrol edin.", ephemeral: true });
          replySent = true;
        }
        return;
      }

      const isim = interaction.options.getString('isim');
      const renk = interaction.options.getString('renk');
      // const emoji = interaction.options.getString('emoji');
      const ekipBos = interaction.options.getMember('boss');
      const yetkiliRoleId = serverSettings.yetkiliRol;
      const ticketKategoriID = serverSettings.ticketKategoriID;
      const başvuru12Id = serverSettings.ekipbosuKategoriID;
      const whitelistId = serverSettings.whitelistRol;
      const bossRoleId = serverSettings.bossRol;

      const yetkinyetersizdostum = new EmbedBuilder()
        .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
        .setDescription('⚠️ ・ **Uyarı:** Bu komutu kullanmak için gerekli yetkiye sahip değilsin.')
        .setTimestamp()
        .setColor('#FF0000');

      if (!interaction.member.roles.cache.has(yetkiliRoleId) && !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        if (!replySent) {
          await interaction.reply({ embeds: [yetkinyetersizdostum], ephemeral: true });
          replySent = true;
        }
        return;
      }

      if (!/^#[0-9a-fA-F]{6}$/.test(renk)) {
        const renkHataEmbed = new EmbedBuilder()
          .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
          .setDescription('⚠️ ・ **Uyarı:** Lütfen geçerli bir renk hex kodu giriniz. Örnek: `#ff0000`')
          .setTimestamp()
          .setColor('#FF0000');
        if (!replySent) {
          await interaction.reply({ embeds: [renkHataEmbed], ephemeral: true });
          replySent = true;
        }
        return;
      }

      const oluşumRole = await interaction.guild.roles.create({
        name: isim,
        color: renk,
        mentionable: true,
        permissions: [],
        hoist: true,
      }).catch(async err => {
        console.error('Rol oluşturma hatası:', err);
        if (!replySent) {
          await interaction.reply({ content: 'Rol oluşturulurken bir hata meydana geldi.', ephemeral: true });
          replySent = true;
        }
        return;
      });

      const successEmbed = new EmbedBuilder()
        .setTitle(`${isim} - Oluşum Log`)
        .setDescription(`<@&${oluşumRole.id}> adlı oluşum başarıyla oluşturuldu. Oluşturan Yetkili: <@${interaction.user.id}>`)
        .setColor('#00FF00')
        .setTimestamp();

      if (!replySent) {
        await interaction.reply({ embeds: [successEmbed], ephemeral: true });
        replySent = true;
      }

      await ekipBos.roles.add(bossRoleId).catch(err => {
        console.error('Boss role ekleme hatası:', err);
      });
      await ekipBos.roles.add(oluşumRole.id).catch(err => {
        console.error('Oluşum role ekleme hatası:', err);
      });

      const ticketKanal = await interaction.guild.channels.create({
        name: `│🔫│${isim}`,
        topic: `Sınırsız Ticket: ${isim} | Tarih: ${new Date().toLocaleDateString("tr-TR", { month: "long", year: "numeric", day: "numeric" })} ${new Date().toLocaleTimeString("tr-TR")}`,
        type: ChannelType.GuildText,
        parent: ticketKategoriID,
        permissionOverwrites: [
          { id: interaction.guild.roles.everyone.id, deny: [PermissionsBitField.Flags.ViewChannel] },
          { id: oluşumRole.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]},
          { id: yetkiliRoleId, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
          { id: ekipBos.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
        ],
      });

      // const başvuruKanal = await interaction.guild.channels.create({
      //   name: `│${emoji}│${isim}-başvuru`,
      //   topic: `${isim} ekibinin başvuru kanalı.`,
      //   type: ChannelType.GuildText,
      //   parent: başvuru12Id,
      //   permissionOverwrites: [
      //     { id: interaction.guild.roles.everyone.id, deny: [PermissionsBitField.Flags.ViewChannel] },
      //     { id: yetkiliRoleId, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
      //     { id: whitelistId, allow: [PermissionsBitField.Flags.ViewChannel], deny: [PermissionsBitField.Flags.SendMessages] },
      //     { id: ekipBos.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
      //   ],
      // });

      const embed = new EmbedBuilder()
        .setTitle(`${isim} - Sınırsız Ticket`)
        .setDescription(`Sunucumuza hoşgeldiniz! Bu sizin sınırsız ticket'ınız. Buradan eksiklerinizi veya sıkıntılarınızı yazarsanız, yetkili ekibimiz sizinle ilgilenecektir.\n\n \`-\`\ Oluşum: <@&${oluşumRole.id}>`)
        .setColor('#2E8B57')
        .setTimestamp();

      const oyuncuek = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setLabel('Oyuncu Ekle')
            .setEmoji('🎮')
            .setCustomId(`oyuncuekleseneaminoglu_${oluşumRole.id}`)
            .setStyle(ButtonStyle.Success)
        );

      await ticketKanal.send({ content: `<@&${oluşumRole.id}>`, embeds: [embed], components: [oyuncuek] });

      const logEmbed = new EmbedBuilder()
        .setTitle(`${isim} - Oluşum Açıldı`)
        .setDescription(`<@${interaction.user.id}> isimli yetkili, <@&${oluşumRole.id}> isimli ekibi başarıyla oluşturdu.`)
        .setColor('#2E8B57')
        .setTimestamp();

      const logChannel = interaction.guild.channels.cache.find(channel => channel.name === "olusum-log");
      if (logChannel) {
        await logChannel.send({ embeds: [logEmbed] });
      } else {
        console.log('Log kanalı bulunamadı.');
      }

      client.on(Events.InteractionCreate, async i => {
        if (i.isButton()) {
          const { customId } = i;

          if (customId.startsWith('oyuncuekleseneaminoglu_')) {
            const roleId = customId.split('_')[1];
            const oluşumRole = i.guild.roles.cache.get(roleId);

            if (!oluşumRole) {
              await i.reply({ content: 'Oluşum rolü bulunamadı.', ephemeral: true });
              return;
            }

            const selectMenu = new ActionRowBuilder()
              .addComponents(
                new UserSelectMenuBuilder()
                  .setCustomId('select-member')
                  .setPlaceholder('Bir kullanıcı seçin')
              );

            await i.reply({ content: 'Bir kullanıcı seçin:', components: [selectMenu], ephemeral: true });
          }
        } else if (i.isUserSelectMenu()) {
          const { customId, values } = i;

          if (customId === 'select-member') {
            if (values.length === 0) {
              await i.reply({ content: 'Bir kullanıcı seçmediniz.', ephemeral: true });
              return;
            }

            const selectedMemberId = values[0];
            const selectedMember = i.guild.members.cache.get(selectedMemberId);

            if (!selectedMember) {
              await i.reply({ content: 'Seçilen kullanıcı bulunamadı.', ephemeral: true });
              return;
            }

            await selectedMember.roles.add(oluşumRole)
            const embed = new EmbedBuilder()
              .setTitle('Üye Ekleme')
              .setDescription(`${selectedMember} isimli üye başarıyla eklendi!`)
              .setColor('#00FF00')
              .setTimestamp();

            await i.reply({ embeds: [embed], ephemeral: true });
          }
        }
      });

    } catch (err) {
      console.error('Komut çalıştırma hatası:', err);
      if (!replySent) {
        await interaction.reply({ content: 'Bir hata meydana geldi.', ephemeral: true });
        replySent = true;
      }
    }
  }
};
