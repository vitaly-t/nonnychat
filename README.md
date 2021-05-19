# NonnyChat

## About

This is an anonymous chat app that allows users to create a 'room' of any name, assume a 'username' of their choice, and then have real-time websockets-driven chat with someone else in the same 'room'. I'm developing this in my spare time to practice with Node, Express, Websockets and Vue. So far each of them is used a little, and I'll expand on it as I beef up the app.


## Installation

Clone this repo and enter it. Then...
```
$ npm install
$ npm start
```
... Then visit localhost:3000 in your browser.

## Demo Usage

1. Type a 'username' and 'room' (any values) into the login fields
1. Click 'Join' button.
1. Now type messages and click Send to see them log to the gray area
1. Anyone else who enters using the same 'room' value will see those in their log too

No database storage is used. These messages are simply broadcast out through websockets and then discarded. So this is a real-time-updated anonymous non-stored chat between people who use the same room and any name they choose. "Room" is also arbitrary. It basically just sends a message out to any connected client that has chosen the same room value.