const version = "0.1.0";
const botName = "Voting Bot";
const authors = ["SeanHardy", "AaditJain", "SeanPan"];
const githubURL = "https://github.com/DiscordBois/VoteTracker";
const fileReader = require('fs');

//imports
const db = require('./databaseManager');
const bot = require('./botManager');
const tools = require('./tools');
const users = require('./userManager');
const votes = require('./voteManager');

//mysql connection
const token = process.env.TOKEN;
const endOfLine = require('os').EOL;

global.info = function info(message, args){
    if((args[0]) === 'version'){
        message.channel.send(botName + ": " + version);
    }else if((args[0]) === 'authors'){
        message.channel.send("Authors: " + authors.join(', '));
    }else if((args[0]) === 'terms'){
        fileReader.readFile('terms-and-conditions.txt', 'utf8', function(err, data) {
            if (err) throw err;
            message.channel.send(data);
        });
    }else{
        message.channel.send(tools.error("Invalid arguments",
         "Options are : version, authors, terms"));
    }
}

global.clearAdmin5629762 = function clear(message, args){
    tools.clear(message, 2);
}

global.displayScoreAdmin4487390 = function clear(message, args){
    tools.clear(message, 1);
    votes.displayWeeklyResults(message.channel);
}

global.changename1555 = function clear(message, args){
    tools.clear(message, 1);
    message.author.setNickname(args[0])
}

global.help = function help(message, args){
    //user commands =========================================
    let commands = "";
    commands += "__**!register**__:\n"+
    "Registers you to vote and be voted for\n";

    commands += "__**!vote**__ username:\n"+
    "Gifts 1 nice point, you can only give 3 points per week. "
    "Username can be the users server nickname or discord username\n";
    commands += "\n";
    
    commands += "__**!myVotes**__:\n"+
    "The bot will DM you your current weekly votes\n";
    commands += "\n";
    
    message.channel.send({embed: {
        color: "#0099E1",
        url: githubURL,
        title: "Commands",
        description: "Here is a list of current commands",
        thumbnail: {
            url: "https://images.vexels.com/media/users/3/152347/isolated/preview/27304b9b14ce9bd8a28ca637ed92070e-blue-circle-question-mark-icon-by-vexels.png",
        },
        fields: [{
            name: "Commands",
            value: commands
        }],
        timestamp: new Date(),
        footer: {
            text: bot.bot.user.username,
            icon_url: bot.bot.user.avatarURL()
        }
    }});
}

votes.weeklyResultsUpdate.start();
votes.monthlyScoreReset.start();
bot.bot.login(process.env.TOKEN);
