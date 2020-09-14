const db = require('./databaseManager');
const bot = require('./botManager');
const tools = require('./tools');

var getUserByNick = function(message, user, callback){
    let guildMembers = message.guild.members.cache
    //search the server for the id of users
    //with either a matching nickname or name
    let UserID = -1;
    guildMembers.forEach(function(guildMember){
        if(guildMember.user.username == user || 
            guildMember.nickname == user){
            UserID = guildMember.id;
        }
    });
    callback(UserID);
}

var getUserByID = function(message, user, callback){
    var statement = "SELECT * FROM users " +
    "WHERE UserID = ?"
    db.executeQuery(statement, user, function(err, results, fields){
        if(err) throw err;
        let row = results[0];
        if(row == undefined){
            callback(undefined, undefined);
            return;
        }
        callback(row.UserHash, row.Score)
    });
}

var getUserData = function(user, callback){
    var statement = "SELECT * FROM users " +
    "WHERE UserHash = ?"
    db.executeQuery(statement, user, function(err, results, fields){
        if(err) throw err;
        let row = results[0];
        if(row == undefined){
            callback(undefined, undefined);
            return;
        }
        callback(row.UserID, row.Score)
    });
}

var getUserVotes = function(user, callback){
    var statement = "SELECT * FROM votes " +
    "WHERE VoterID = ? ORDER BY votes.VoteID Desc"
    db.executeQuery(statement, user, function(err, results, fields){
        if(err) throw err;
        let resultList = []
        results.forEach(function(result, i ){
            resultList.push([result.VoteID, result.UserID]);
        });
        callback(resultList);
        return;
    });
}

global.register = function register(message, args) {
    userExists(message.author.id, function(userExists){
        if(userExists){
            message.reply(tools.error("User Registered",
                "you are already registered"));
            return;
        }else{
            var statement = "INSERT INTO users (UserHash, Score) VALUES (?, 0)";
            db.executeQuery(statement, message.author.id, function(err, result, fields){
                if(err) throw err;
                message.reply("Thank you for registering, you are now eligible " +
                "to be entered into future polls. If you want to opt-out of the "+
                "polling process, please use the !unregister command");           
            });
        }
    })
}

var userExists =  function(user, callback){
    var statement = "SELECT Count(*) as count FROM users WHERE users.UserHash = ?";
    db.executeQuery(statement, user, function(err, results, fields){
        if(err) throw err;
        callback(results[0].count != 0); 
        return;           
    });
}


module.exports = {
	getUserByNick: getUserByNick,
    getUserData: getUserData,
    getUserVotes: getUserVotes,
    getUserByID: getUserByID
}
