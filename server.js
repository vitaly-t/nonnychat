
//// Initiatlize an NPM project and Require a few more libraries that will require installation:
/*
npm init -y
npm install dotenv
npm install express
npm install ws
*/

const {ConnectionString} = require('connection-string');

//// Require the db tools
const db = require('./db/db');

//// Require the (native) path library for generating paths to files
const path = require('path');


//// This line uses the dotenv library to make vars in a .env available (if present)
//// For example, on Heroku, process.env.PORT will be set in the environment for you
//// This line lets you access that value by referencing it that way
require('dotenv').config()
//// Now we'll look for that value, or set a default to 3000 locally if not found
//// (So your app will be hosted at http://localhost:3000 when run locally)
const PORT = process.env.PORT || 3000;

//// Express is a library that provides some convenient routing syntax.
//// Routing basically tells your server how to handle specific URL requests
//// 	and with various parameters included (like ?a=1&b=yes, stuff like that)
const express = require('express');
//// Create a reference to a socket server created by leveraging the 'ws' websockets library
//// This socket server will listen for browser connections and allow you to broadcast messages to them
const socks = require('ws').Server;


//// Now create and start up a server instance with express, with a few specifications:
const server = express()
	//// Specify a 'get' route for the homepage:
	.get('/', function(req, res){
		//// We'll just be serving up the index.html that's in the 'public' folder
		res.sendFile(path.join(__dirname, 'public/index.html'));
	})
	.get('/test', function(req, res) {
		var c = new ConnectionString(process.env.CLEARDB_DATABASE_URL);
		res.json(c);
	})
	.get('/dbSetup', function(req, res) {
		var query = "\
		CREATE TABLE IF NOT EXISTS nonnychat_messages ( \
				id int not null auto_increment primary key \
				, username varchar(50) \
				, roomname varchar(200) \
				, messagetext text \
				, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP \
			); \
		";
		db.query(query, (err, results, fields) => {
			console.log(results);
		});
		res.send(query);
	})
	//// We'll also use the /public directory as a static folder
	//// Anything that goes to /public/whatever. will just serve up whatever.file
	//// This is useful for using external JS and CSS in our index.html file, for example
	.use('/public', express.static('public'))
	//// And finally, let's listen on our PORT so we can visit this app in a browser
	.listen(PORT, () => console.log("Listening on PORT " + PORT))
	;


const wss = new socks({ server });
wss.on('connection', (ws) => {
	ws._data = {}
	ws.on('close', () => console.log('Client disconnected'));
	ws.on('message', message => {
		let mdata = JSON.parse(message);
		if (mdata.action=="chatmsg") {
		    wss.clients.forEach((ws) => {
				if (ws._data.room == mdata.room) {
			        let m = {action:"chatmsg", content: {
						message: mdata.message, username: mdata.username, timestamp: (new Date()).toTimeString()
					}};
				//	console.log(m);
			        ws.send(JSON.stringify(m));					
				}
		    });
		}
		if (mdata.action=="init") {
			ws._data.username = mdata.username;
			ws._data.room = mdata.room;
            var m = {action:"welcome", content:"Welcome, " + mdata.username + "!"};
			ws.send(JSON.stringify(m));
		}
	})
})

