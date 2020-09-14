const mysql = require('mysql');
  
var pool, con;

pool = mysql.createPool({
  connectionLimit : 1,
  host: "remotemysql.com",//remotemysql.com
  user: "sUDJArqyKW",    
  password: process.env.SQLPASS, //process.env.SQLPASS
  database: "sUDJArqyKW" //sUDJArqyKW
});
  
var executeQuery = function(query, parameters, callback){
  pool.getConnection(function(err, connection){
      if (err) {
        connection.release();
        throw err;
      }   
      if(parameters == "null"){
        connection.query(query, function(err, result, fields){
          connection.release();
          if(!err) {
            callback(null, result, fields);
          }           
        });
      }else{
        connection.query(query, parameters, 
          function(err, result, fields){
          connection.release();
          if(!err) {
            callback(null, result, fields);
          }           
        });
      }
      connection.on('error', function(err) {
          if(err.code == 'PROTOCOL_CONNECTION_LOST'){
            return;
          }else{
            throw err;
          }     
      });
  });
}

/*var connect = function() {
  	con = mysql.createConnection({
	  	host: "remotemysql.com",//remotemysql.com
	    user: "sUDJArqyKW",    
	    password: process.env.SQLPASS, //process.env.SQLPASS
	    database: "sUDJArqyKW" //sUDJArqyKW
  	}); 
  	// Recreate the connection, since
    // the old one cannot be reused.

  	con.connect(function(err) {              // The server is either down
  		if(err) {                                     // or restarting (takes a while sometimes).
      		console.log('error when connecting to db:', err);
      		setTimeout(connect, 2000); // We introduce a delay before attempting to reconnect,
    	}                              // to avoid a hot loop, and to allow our node script to
  		else{
  			console.log("Connected to db");
  		}
  	});                                     // process asynchronous requests in the meantime.
  	con.on('error', function(err) {
    	console.log('db error', err);
    	if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      		connect();                         // lost due to either server restart, or a
    	} else {                                      // connnection idle timeout (the wait_timeout
      		throw err;                                  // server variable configures this)
    	}
  	});
}

connect();*/

module.exports = {
	con: con,
  executeQuery: executeQuery
}