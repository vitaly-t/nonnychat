
var mysql = require('mysql');
require('dotenv').config()

var db = {
	query: (query, callback) => {
		var connection = mysql.createConnection({
		  host     : process.env.DB_HOST,
		  user     : process.env.DB_USER,
		  password : process.env.DB_PASSWORD,
		  database : process.env.DB_DATABASE
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