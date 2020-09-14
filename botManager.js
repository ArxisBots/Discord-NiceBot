const Discord = require ('discord.js');
const bot = new Discord.Client();

const PREFIX = "!";
const endOfLine = require('os').EOL;
const tools = require('./tools');

bot.on("ready", () =>{
    console.log("Bot is ready!");
})
//display welcome message
bot.on("guildMemberAdd", (member) => {
  member.guild.channels.cache.get(process.env.CHANNELID).send(
    `"${member.user.username}" has joined this server.`+
    ` Please use '!help' to figure out how I work, `+
    `and use '!info terms' to agree to the terms of the bot`);
});

//on user message
bot.on("message", message=>{

    let args = message.content.substring(PREFIX.length).split(" ");
    var functionName = args[0];
    //don't reply if the message isn't a command in a server, or if the author is the bot
    if(message.channel.id != process.env.CHANNELID) return;
    if(message.content.charAt(0) != PREFIX) return;
    if(message.author.id == bot.user.id) return;

    //if function is found
    if (functionName in global && typeof global[functionName] === "function") {
        global[functionName](message, args.slice(1));
    }
    //else show user how to get the list of available commands
    else {
        message.channel.send(tools.error("Invalid command",
            "Use " + PREFIX + "help for a list of available commands"));
    }
})  

module.exports = {
	bot: bot
}