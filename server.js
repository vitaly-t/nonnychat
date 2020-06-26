'use strict';

const express = require('express');
const SocketServer = require('ws').Server;
const path = require('path');

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'index.html');

const server = express()
  .use((req, res) => res.sendFile(INDEX) )
  .listen(PORT, () => console.log("Listening on " + PORT));

const wss = new SocketServer({ server });

let counter = 0;

wss.on('connection', (ws) => {
	ws.on('close', () => console.log('Client disconnected'));
});
wss.on('connection', (ws) => {
	ws.on('message', message => {
		let mdata = JSON.parse(message);
		if (mdata.action=="increment") {
            var m = {action:"counter", content:++counter};            
			ws.send(JSON.stringify(m));
		}
		if (mdata.action=="init") {
            var m = {action:"welcome", content:"Welcome, " + mdata.username + "!"};
			ws.send(JSON.stringify(m));
		}
	})
})

//// This is happening on the back end and pushing up!
setInterval(() => {
    wss.clients.forEach((ws) => {
        let m = {action:"log", content:(new Date()).toTimeString()};
        ws.send(JSON.stringify(m));
    });
}, 1000);

