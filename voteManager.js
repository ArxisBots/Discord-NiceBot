const dateFormat = require('dateformat');
const cron = require('node-cron');

const db = require('./databaseManager');
const bot = require('./botManager');
const tools = require('./tools');
const users = require('./userManager');

var weeklyResultsUpdate = cron.schedule("0 0 8 * * 1", function(){
    var channel = bot.bot.channels.cache.get(process.env.CHANNELID);
    addLastWeeksScore(function(){
        addVotes(function(){
            displayWeeklyResults(channel);
        });
    });
});

var monthlyScoreReset = cron.schedule("0 0 8 * Jan,Jun 1", function(){
    var channel = bot.bot.channels.cache.get(process.env.CHANNELID);
    addVotes(function(){
        addLastWeeksScore(function(){
            displayFinalResults(channel, function(){
                var statement = "UPDATE users SET Score = 0 WHERE 1";
                db.executeQuery(statement, userID, 
                    function(err, results, fields){
                    if(err) throw err;
                    channel.send("Scores have now been reset");
                });
            });
        });
    });
});

global.myVotes = function myVotes(message, args) {
    tools.clear(message, 1)
    users.getUserData(message.author.id, function(userID, score){
        users.getUserVotes(userID, function(votesList){
            if(votesList == undefined || votesList.length == 0){
                message.author.send("You have not made any votes this week");
            }else{
                let votes = []
                votesList.forEach(function(vote, i){
                    users.getUserByID(message, vote[1], function(userHash){
                        let member = message.channel.guild.member(userHash);
                        let nickname = member.displayName == null ? member.name : member.displayName;
                        votes.push(nickname);
                        if(i == votesList.length-1){
                            message.author.send("Your Votes: " + votes.join(", "));
                        }
                    });
                });
            }
        });
    });
}

global.vote = function vote(message, args) {
    tools.clear(message, 1)
    if(args.length == 0){
        message.channel.send(tools.error("Invalid Arguments", 
        "Please enter an argument specifying the poll you want to vote for"));
        return;
    }
    let name = message.content.substr(message.content.indexOf(' ')+1);

    users.getUserByNick(message, name, function(userHash){
        if(userHash == -1){
            message.reply(tools.error("Invalid user", 
                "The person you voted for does not exist")); 
            return;  
        }else if(userHash == message.author.id){
            message.reply(tools.error("Invalid User", 
                "You cannot vote for yourself -1 nice points!!! jk i still love you <3")); 
            return;  
        }
        users.getUserData(userHash, function(userID, score){
            if(userID == undefined){
                message.reply(tools.error("Invalid user", 
                        "The person you voted for does not exist")); 
                return;  
            }
            castVote(message, userID, args);
        });
    });
}

var addLastWeeksScore = function(callback){
    var statement = "UPDATE users SET Score = Score + WeeklyScore, WeeklyScore = 0";
    db.executeQuery(statement, "null", function(err, results, fields){
        if(err) throw err;
        callback();
    });
}

var displayWeeklyResults = function(channel){
    var statement = "SELECT * FROM users WHERE 1 ORDER BY WeeklyScore Desc, Score Asc";
    db.executeQuery(statement, "null", function(err, results, fields){
        if(err) throw err;
        let usersList = [];
        let votesList = [];

        results.forEach(function(result, i){
            let member = channel.guild.member(result.UserHash);
            let nickname = member.displayName == null ? member.name : member.displayName;
            usersList.push(nickname.replace(/ /g, "_"));
            votesList.push(result.WeeklyScore);
        });
        
        usersList = usersList.slice(0,3);
        votesList = votesList.slice(0,3);

        chartConfig = "{type:'bar',data:{labels:['"+ usersList.join("','") +"'],"+
            "datasets:[{label:'Votes',data:["+ votesList.join(",") +"],"+
            "fontColor:'white'}]}}";
        let url = "https://quickchart.io/chart?c="+chartConfig;
        channel.send({embed: {
            color: "#fcd049",
            title: "Leaderboard of Niceness",
            thumbnail : {
                url: "https://cdn4.iconfinder.com/data/icons/social-messaging-ui-color-and-shapes-6/177800/252-512.png",
            },
            description: "Here are this weeks results for the nicest member of the server",
            image: {
                url: url
            },
            timestamp: new Date(),
            footer: {
                text: bot.bot.user.username,
                icon_url: bot.bot.user.avatarURL()
            }
        }});
    });
}

var displayFinalResults = function(channel, callback){
    var statement = "SELECT * FROM users WHERE 1";
    db.executeQuery(statement, "null", function(err, results, fields){
        if(err) throw err;
        let usersList = [];
        let votesList = [];

        results.forEach(function(result, i){
            let member = channel.guild.member(result.UserHash);
            let nickname = member.displayName == null ? member.name : member.displayName;
            usersList.push(nickname.replace(/ /g, "_"));
            votesList.push(result.Score);
        });

        chartConfig = "{type:'bar',data:{labels:['"+ usersList.join("','") +"'],"+
            "datasets:[{label:'Votes',data:["+ votesList.join(",") +"],"+
            "fontColor:'white'}]}}";
        let url = "https://quickchart.io/chart?c="+chartConfig;
        channel.send({embed: {
            color: "#fcd049",
            title: "FINAL NICENESS SCORES THIS SEASON",
            thumbnail : {
                url: "https://cdn4.iconfinder.com/data/icons/social-messaging-ui-color-and-shapes-6/177800/252-512.png",
            },
            description: "Here are the niceness scores for this season",
            image: {
                url: url
            },
            timestamp: new Date(),
            footer: {
                text: bot.bot.user.username,
                icon_url: bot.bot.user.avatarURL()
            }
        }});
    });
}

var castVote = function (message, userVotedFor, args){
    users.getUserData(message.author.id, function(authorID, score){
        users.getUserVotes(authorID, function(votesList){
            if(votesList.length == 3){
                removeVote(votesList[2][0]);
            }
            var statement = "INSERT INTO votes " +
                    "(VoterID, UserID) " +
                    "VALUES (?, ?)";
            db.executeQuery(statement, [authorID, userVotedFor], 
                function(err, results, fields){
                if(err) throw err;
                let votesLeft = Math.max(3-(votesList.length+1), 0);
                message.author.send("Vote cast. You now have " + votesLeft + " unused votes");
                myVotes(message, args);
            });
        });
    });
}


var addVotes = function(callback){
    var statement = "SELECT * FROM votes WHERE 1";
    db.executeQuery(statement, "null", function(err, results, fields){
        if(err) throw err;
        if(results == undefined || results.length == 0){
            callback();
            return;
        }
        let resultsLength = results.length;
        if(resultsLength > 0){
            results.forEach(function(result, i){
                addVoteToScore(result.UserID, function(){
                    removeVote(result.VoteID, function(){
                        if(0 === --resultsLength){
                            callback();
                            return;
                        }
                    });
                });
            });
        }
    });
}

var removeVote = function(voteID, callback){
    var statement = "DELETE FROM votes " +
            "WHERE VoteID = ?";
    db.executeQuery(statement, voteID, 
        function(err, results, fields){
        if(err) throw err;
        if(callback != undefined){
            callback();
        }
    });
}

var addVoteToScore = function(userID, callback){
    var statement = "UPDATE users SET WeeklyScore = WeeklyScore + 1 WHERE UserID = ?";
    db.executeQuery(statement, userID, 
        function(err, results, fields){
        if(err) throw err;
        callback();
    });
}

module.exports = {
    weeklyResultsUpdate: weeklyResultsUpdate,
    monthlyScoreReset: monthlyScoreReset,
    displayWeeklyResults: displayWeeklyResults
}