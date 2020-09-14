
var error = function(type, error){
    return "```asciidoc\nERROR :: " + type + "\n"+error+"\n```";
}

var colour = function(string, colour){
    if(colour == "green"){
        return "```css\n"+string+"\n```";
    }else if(colour == "red"){
        return "```diff\n-"+string+"\n```";
    }else if(colour == "blue"){
        return "```ini\n["+string+"]\n```";
    }else if(colour == "orange"){
        return "```fix\n"+string+"\n```";
    }else{
        return string;
    }
}

var clear = function(message, numMessages){
    if(numMessages == undefined) throw new Error("Number of messages "+
        "to clear cannot be undefined");
    if(1 <= numMessages && numMessages <= 10){
        message.channel.bulkDelete(numMessages);
    }else{
        throw new RangeError("The clear limit is between 1 and 10 messages");
    } 
}

module.exports = {
	colour: colour,
	error: error,
	clear: clear
}