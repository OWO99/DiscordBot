require("dotenv").config();
const { REST, Routes, ApplicationCommandOptionType } = require("discord.js");
const commands = [
  {
    name: "play",
    description: "play :) music",
    options: [
      {
        name: "link",
        description: "Music Link",
        type: ApplicationCommandOptionType.String,
        require: false,
      },
    ],
  },
  {
    name: "stop",
    description: "stop the music",
  },
  {
    name: "pause",
    description: "pause the music",
  },
  {
    name: "kill",
    description: "Bot quit and Clean the queue",
  },
];

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    await rest.put(
      Routes.applicationGuildCommands(process.env.BOT_ID, process.env.GUILD_ID),
      { body: commands }
    );
  } catch (err) {
    //console.log(`There was an error: ${err}`);
  }
})();
