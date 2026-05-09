require("dotenv").config();

const express = require("express");
const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  PermissionsBitField,
  ChannelType,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

const app = express();

app.get("/", (req, res) => {
  res.send("Bot działa");
});

app.listen(3000, () => {
  console.log("Serwer HTTP działa");
});

const VERIFIED_ROLE_ID = "1499847440910516464";

const ticketNames = {
  zakup: "zakup",
  partnerstwo: "partnerstwo",
  pomoc: "pomoc",
};

const konkursUczestnicy = new Set();
let konkursAktywny = false;

function cleanName(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 20);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

client.once("ready", () => {
  console.log(`Zalogowano jako ${client.user.tag}`);
});

client.on("interactionCreate", async (interaction) => {
  console.log(
    "Interaction:",
    interaction.type,
    interaction.commandName || interaction.customId
  );

  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === "konkurs") {
      konkursUczestnicy.clear();
      konkursAktywny = true;

      const joinButton = new ButtonBuilder()
        .setCustomId("konkurs_join")
        .setLabel("Weź udział")
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder().addComponents(joinButton);

      return interaction.reply({
        content: `🎉 **KONKURS!**

Kliknij przycisk poniżej, aby wziąć udział.`,
        components: [row],
      });
    }

    if (interaction.commandName === "losuj") {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return interaction.reply({
          content: "Nie masz permisji do losowania zwycięzcy.",
          ephemeral: true,
        });
      }

      if (!konkursAktywny) {
        return interaction.reply({
          content: "Nie ma aktywnego konkursu.",
          ephemeral: true,
        });
      }

      if (konkursUczestnicy.size === 0) {
        return interaction.reply({
          content: "Nikt nie dołączył do konkursu.",
          ephemeral: true,
        });
      }

      const uczestnicy = Array.from(konkursUczestnicy);
      const zwyciezcaId = uczestnicy[Math.floor(Math.random() * uczestnicy.length)];

      konkursAktywny = false;
      konkursUczestnicy.clear();

      return interaction.reply({
        content: `🎉 Zwycięzca konkursu to <@${zwyciezcaId}>!`,
      });
    }

    if (interaction.commandName === "drop") {
      await interaction.deferReply({ ephemeral: true });

      const wygrana = Math.random() < 0.025;

      if (wygrana) {
        return interaction.editReply({
          content: "Gratulacje! Wylosowałeś **1 zł zniżki**!",
        });
      }

      return interaction.editReply({
        content: "Niestety, tym razem nic nie wypadło. Spróbuj ponownie później.",
      });
    }

    if (interaction.commandName === "weryfikacja") {
      const verifyButton = new ButtonBuilder()
        .setCustomId("verify")
        .setLabel("Zweryfikuj się")
        .setStyle(ButtonStyle.Success);

      const row = new ActionRowBuilder().addComponents(verifyButton);

      return interaction.reply({
        content: "ᴋʟɪᴋɴɪᴊ ᴘʀᴢʏᴄɪꜱᴋ ᴘᴏɴɪᴢ̇ᴇᴊ, ᴀʙʏ ꜱɪᴇ̨ ᴢᴡᴇʀʏꜰɪᴋᴏᴡᴀᴄ́.",
        components: [row],
      });
    }

    if (interaction.commandName === "cennik") {
      const menu = new StringSelectMenuBuilder()
        .setCustomId("my_dropdown")
        .setPlaceholder("ᴡʏʙɪᴇʀᴢ ᴍᴇᴛᴏᴅᴇ̨ ᴘᴌᴀᴛɴᴏꜱ́ᴄɪ")
        .addOptions([
          {
            label: "ʙʟɪᴋ",
            description: "ʙʟɪᴋ",
            value: "opcja_1",
            emoji: { id: "1500038782076846232", name: "emoji_4" },
          },
          {
            label: "ᴘᴀʏᴘᴀʟ",
            description: "ᴘᴀʏᴘᴀʟ",
            value: "opcja_2",
            emoji: { id: "1500037911356379237", name: "emoji_3" },
          },
          {
            label: "ᴘsᴄ",
            description: "ᴘsᴄ",
            value: "opcja_3",
            emoji: { id: "1500038810719883346", name: "emoji_5" },
          },
          {
            label: "ʟᴛᴄ",
            description: "ʟᴛᴄ",
            value: "opcja_4",
            emoji: { id: "1500037881564233758", name: "emoji_2" },
          },
        ]);

      const row = new ActionRowBuilder().addComponents(menu);

      return interaction.reply({
        content: "ᴡʏʙɪᴇʀᴢ ᴍᴇᴛᴏᴅᴇ̨ ᴘᴌᴀᴛɴᴏꜱ́ᴄɪ ᴢ ʟɪꜱᴛʏ ᴘᴏɴɪᴢ̇ᴇᴊ:",
        components: [row],
      });
    }

    if (interaction.commandName === "tickets") {
      const menu = new StringSelectMenuBuilder()
        .setCustomId("ticket_select")
        .setPlaceholder("ᴡʏʙɪᴇʀᴢ ᴋᴀᴛᴇɢᴏʀɪᴇ̨")
        .addOptions([
          { label: "Zakup", value: "zakup" },
          { label: "Partnerstwo", value: "partnerstwo" },
          { label: "Pomoc", value: "pomoc" },
        ]);

      const row = new ActionRowBuilder().addComponents(menu);

      return interaction.reply({
        content: `👋 ᴡɪᴛᴀᴊ! ᴄʜᴄᴇꜱᴢ ᴢᴀᴋᴜᴘɪᴄ́ ʀᴏʙᴜxʏ?
⭐ ᴏᴛᴡᴏ́ʀᴢ ᴛɪᴄᴋᴇᴛ, ᴀʙʏ ᴜᴢʏꜱᴋᴀᴄ́ ᴘᴏᴍᴏᴄ ᴏᴅ ᴀᴅᴍɪɴɪꜱᴛʀᴀᴄᴊɪ.
➡️ ᴡʏʙɪᴇʀᴢ ᴋᴀᴛᴇɢᴏʀɪᴇ̨ ᴘᴏɴɪᴢ̇ᴇᴊ:`,
        components: [row],
      });
    }
  }

  if (interaction.isStringSelectMenu()) {
    if (interaction.customId === "my_dropdown") {
      const choice = interaction.values[0];

      if (choice === "opcja_1") {
        return interaction.reply({
          content:
            "𝟷ᴋ <:emoji_1:1500036544461803540> = 19ᴢł <:emoji_4:1500038782076846232>",
          ephemeral: true,
        });
      }

      if (choice === "opcja_2") {
        return interaction.reply({
          content:
            "𝟷ᴋ <:emoji_1:1500036544461803540> = 18ᴢł <:emoji_3:1500037911356379237>",
          ephemeral: true,
        });
      }

      if (choice === "opcja_3") {
        return interaction.reply({
          content:
            "𝟷ᴋ <:emoji_1:1500036544461803540> = 18ᴢł <:emoji_5:1500038810719883346>",
          ephemeral: true,
        });
      }

      if (choice === "opcja_4") {
        return interaction.reply({
          content:
            "𝟷ᴋ <:emoji_1:1500036544461803540> = 18ᴢł <:emoji_2:1500037881564233758>",
          ephemeral: true,
        });
      }
    }

    if (interaction.customId !== "ticket_select") return;
    if (!interaction.guild) return;

    const choice = interaction.values[0];
    const categoryName = ticketNames[choice] || "ticket";
    const userName = cleanName(interaction.user.username);

    const existing = interaction.guild.channels.cache.find(
      (c) => c.name === `ticket-${categoryName}-${userName}`
    );

    if (existing) {
      return interaction.reply({
        content: "❌ ᴍᴀꜱᴢ ᴊᴜᴢ̇ ᴏᴛᴡᴀʀᴛʏ ᴛɪᴄᴋᴇᴛ!",
        ephemeral: true,
      });
    }

    try {
      const channel = await interaction.guild.channels.create({
        name: `ticket-${categoryName}-${userName}`,
        type: ChannelType.GuildText,
        topic: `Ticket: ${choice} | User: ${interaction.user.id}`,
        permissionOverwrites: [
          {
            id: interaction.guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel],
          },
          {
            id: interaction.user.id,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages,
              PermissionsBitField.Flags.ReadMessageHistory,
            ],
          },
        ],
      });

      const closeButton = new ButtonBuilder()
        .setCustomId("ticket_close")
        .setLabel("Zamknij ticket")
        .setStyle(ButtonStyle.Danger);

      const closeRow = new ActionRowBuilder().addComponents(closeButton);

      await channel.send({
        content: `🎫 **ᴛɪᴄᴋᴇᴛ ᴜᴛᴡᴏʀᴢᴏɴʏ!**
👤 ᴀᴜᴛᴏʀ: ${interaction.user}
📂 ᴋᴀᴛᴇɢᴏʀɪᴀ: **${choice}**
@everyone`,
        components: [closeRow],
      });

      return interaction.reply({
        content: `🎫 ᴛɪᴄᴋᴇᴛ ᴜᴛᴡᴏʀᴢᴏɴʏ: ${channel}`,
        ephemeral: true,
      });
    } catch (err) {
      console.error(err);

      return interaction.reply({
        content: "❌ Wystąpił błąd przy tworzeniu ticketa.",
        ephemeral: true,
      });
    }
  }

  if (interaction.isButton()) {
    if (interaction.customId === "konkurs_join") {
      if (!konkursAktywny) {
        return interaction.reply({
          content: "Ten konkurs już się zakończył.",
          ephemeral: true,
        });
      }

      if (konkursUczestnicy.has(interaction.user.id)) {
        return interaction.reply({
          content: "Już bierzesz udział w konkursie.",
          ephemeral: true,
        });
      }

      konkursUczestnicy.add(interaction.user.id);

      return interaction.reply({
        content: "Dołączyłeś do konkursu!",
        ephemeral: true,
      });
    }

    if (interaction.customId === "verify") {
      const member = interaction.member;
      const role = await interaction.guild.roles
        .fetch(VERIFIED_ROLE_ID)
        .catch(() => null);

      if (!role) {
        return interaction.reply({
          content:
            "Nie znaleziono roli weryfikacyjnej. Sprawdź ID roli i czy bot jest na dobrym serwerze.",
          ephemeral: true,
        });
      }

      if (member.roles.cache.has(VERIFIED_ROLE_ID)) {
        return interaction.reply({
          content: "Już jesteś zweryfikowany.",
          ephemeral: true,
        });
      }

      await member.roles.add(role);

      return interaction.reply({
        content: "Zostałeś zweryfikowany!",
        ephemeral: true,
      });
    }

    if (interaction.customId === "ticket_close") {
      if (!interaction.channel.name.startsWith("ticket-")) {
        return interaction.reply({
          content: "❌ To nie jest ticket!",
          ephemeral: true,
        });
      }

      await interaction.reply({
        content: "🗑️ Ticket zostanie zamknięty za 3 sekundy...",
        ephemeral: true,
      });

      setTimeout(() => {
        interaction.channel.delete().catch(console.error);
      }, 3000);
    }
  }
});

client.login(process.env.TOKEN);
