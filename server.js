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

wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.on('close', () => console.log('Client disconnected'));
});
wss.on('connection', (ws) => {
  ws.on('message', message => {
    ws.send(message+"+1="+(parseInt(message)+1));
  })
  ws.send('Welcome! You\'re connected.')
})

//// This is happening on the back end and pushing up!
/*
setInterval(() => {
  wss.clients.forEach((client) => {
    client.send(new Date().toTimeString());
  });
}, 1000);
*/


