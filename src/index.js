//imoprt discord.js api like Import xxx in any other languages
require("dotenv").config();
const path = require("path");
const { Client, GatewayIntentBits, Guild } = require("discord.js");
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayer,
} = require("@discordjs/voice");
const { generateDependencyReport } = require("@discordjs/voice");
const ytdl = require("ytdl-core");
const YoutubeMusicApi = require("youtube-music-api");
const api = new YoutubeMusicApi();
api.initalize();
const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
  ],
});
const botid = process.env.BOT_ID;
var timeSet = 60000;
var globalvoice;
//Get PLaylist id
function youtube_playlist_parser(url) {
  var reg = new RegExp("[&?]list=([a-z0-9_&=-]+)", "i");
  var match = reg.exec(url);

  if (match && match[1].length > 0) {
    return match[1];
  } else {
    return false;
  }
}
//timeout
function maybeTimeout(voice, interaction) {
  setTimeout(() => {
    voice.disconnect();
    console.log(`Disconnected from voice channel timeset is ${timeSet}`);
    timeSet = 60000;
    // Send a message to a channel
    const channelId = interaction.channelId; // Replace with your channel ID
    const channel = interaction.guild.channels.cache.get(channelId);

    if (channel) {
      channel.send(`Disconnected from voice channel. ૮꒰⸝⸝>  ̫ <⸝⸝꒱ა`);
    } else {
      console.error(`Channel with ID ${channelId} not found.`);
    }
  }, timeSet);
}
//Function PlayMusic
function playmusic(voice, interaction) {
  console.log(queue);
  if (queue.length > 0) {
    const ytdlProcess = ytdl(queue[0], {
      filter: "audioonly",
      quality: "highestaudio",
      highWaterMark: 1 << 25,
    });
    const audioResource = createAudioResource(ytdlProcess);
    audioPlayer.play(audioResource);
    voice.subscribe(audioPlayer);
    var song = queue.shift();
    console.log(audioPlayer.state.status);

    //const filePath = path.join(__dirname, "2.mp3"); Test local audio file
    //Waiting for next song
    audioPlayer.once("idle", () => {
      console.log(queue.length);
      if (queue.length > 0) {
        playmusic(voice, interaction);
      } else {
        maybeTimeout(voice, interaction);
      }
    });
  }
}

var queue = [];
var quitdetect = false;
bot.on("error", (error) => {
  console.error(`An error occurred:${error}}`);
});
bot.on("ready", () => {
  console.log("Bot is ready");
});
//handle slash command with play; skip; pause; stop
const audioPlayer = createAudioPlayer();

bot.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName === "play") {
    const serverId = interaction.guildId;
    const voice_channel_id = interaction.guild.members.cache.get(
      interaction.member.user.id
    ).voice.channelId;
    //rejoin
    if (voice_channel_id) {
      if (audioPlayer.state.status === "autopaused") {
        voice = joinVoiceChannel({
          channelId: voice_channel_id,
          guildId: serverId,
          adapterCreator: interaction.guild.voiceAdapterCreator,
        });
      }
      let link = interaction.options.getString("link");
      const playlistid = youtube_playlist_parser(link);
      console.log(playlistid);
      try {
        var list = await api.getPlaylist(playlistid);
      } catch (error) {
        console.log("This is not a list");
      }

      if (link) {
        if (!ytdl.validateURL(link) && !playlistid) {
          interaction.reply(
            "This is not a YOUTUBE link or your link is bad ( ｡ •̀ ᴖ •́ ｡)"
          );
        } else {
          const voice = joinVoiceChannel({
            channelId: voice_channel_id,
            guildId: serverId,
            adapterCreator: interaction.guild.voiceAdapterCreator,
          });
          globalvoice = voice;

          //check if list are exist, push all id into
          if (list) {
            list.content.forEach((item) => {
              let videoURL = `https://www.youtube.com/watch?v=${item.videoId}`;
              queue.push(videoURL);
            });
          } else {
            queue.push(link);
          }

          let hold = queue.length;
          //check if it need to be added to the queue
          if (audioPlayer.state.status === "playing") {
            await interaction.reply(
              `Add to queue, you are on ${hold} ૮꒰ ˶• ༝ •˶꒱ა ♡`
            );
            console.log(queue);
          }
          console.log(audioPlayer.state.status);
          //if bot is not playing any music
          if (
            audioPlayer.state.status === "idle" ||
            audioPlayer.state.status === "autopaused"
          ) {
            playmusic(voice, interaction);
            await interaction.reply("Heyaaa ☀(▀U ▀-͠)");
          }
        }
      } else {
        audioPlayer.unpause();
        await interaction.reply("Music Replay! °˖✧◝(⁰▿⁰)◜✧˖°");
      }
    } else {
      await interaction.reply(
        "You have to in the voice chat!! \n ⁽⁽(੭ꐦ •̀Д•́ )੭*⁾⁾"
      );
    }
  }
  if (interaction.commandName === "pause") {
    audioPlayer.pause();
    await interaction.reply("Music Paused (ಥ﹏ಥ)");
  }
  if (interaction.commandName === "stop") {
    audioPlayer.stop();
    let hold = queue.length - 1;
    if (hold > 0) {
      await interaction.reply(`We have ${hold} Song Left ˖ ࣪‧₊˚⋆✩٩(ˊᗜˋ*)و ✩`);
    } else if (!quitdetect & (queue.length != 0)) {
      console.log(audioPlayer.state.status);
      await interaction.reply(
        "Nooooooooooo more song left, this is the last one. \n Enjoy (❀❛ ֊ ❛„)♡"
      );
      quitdetect = true;
    } else {
      timeSet = 2000;
      quitdetect = false;
      await interaction.reply("Bye Bye~ ε(´｡•᎑•`)っ 💕");
    }
  }
  if (interaction.commandName === "kill") {
    queue = [];
    globalvoice.disconnect();
    await interaction.reply(" Bye Bye~ ε(´｡•᎑•`)っ 💕");
  }
});

bot.login(process.env.TOKEN);
