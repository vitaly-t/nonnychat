
var mysql = require('mysql');
require('dotenv').config()
const {ConnectionString} = require('connection-string');

var db = {
	query: (query, callback) => {
		var c = new ConnectionString(process.env.CLEARDB_DATABASE_URL);
		var connection = mysql.createConnection({
		  host     : c.hosts[0].name,
		  user     : c.user,
		  password : c.password,
		  database : c.path
		});
		connection.connect();
//		connection.query(query, function (error, results, fields) {
//			//
//		});
		connection.query(query, callback);
		connection.end();
	}
	,
	test: () => {
		console.log("test");
	}
}

module.exports = db;