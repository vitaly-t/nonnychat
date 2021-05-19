'use strict';

const { v4: uuidv4 } = require('uuid');

const express = require('express');
const SocketServer = require('ws').Server;
const path = require('path');

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'index.html');



const app = express()
app.get('/', function(req, res){
	res.sendFile(path.join(__dirname, 'public/index.html'));
});
app.use('/public', express.static('public'));
//app.use((req, res) => res.sendFile(INDEX))
let server = app.listen(PORT, () => console.log("Listening on PORT " + PORT));



/*
const app = express();
app.get('/', function(req, res){
	res.sendFile(path.join(__dirname, 'index.html'));
});
app.use('/public', express.static('public'));
app.listen(PORT, () => {
	console.log("Listening on PORT " + PORT)
});
*/

const wss = new SocketServer({ server });
wss.on('connection', (ws) => {
	ws._data = {
		uuid: uuidv4()
	}
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

