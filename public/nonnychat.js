

/*
To make things simple, we're going to create a WSHOST variable 
that contains a websockets URL based on the URL of our web address, 
which we know will be "/" when we're on our index page.
*/
var WSHOST = location.origin.replace(/^http/, 'ws');

//// Here I'm just initliaizing a number of global variables that will get set later
var username = false;
var room = false;
var sock = false;
var chatlog;
var chatmsg;
var inputroom;
var inputusername;
var btnSendMsg;
var btnPressEnterToSend;
var btni;
var instructions;
var btnJoin;
var vChatLog;

/*
This logout function will close up the websocket (if still open), 
set a bunch of relevant variables back to false or whatever, 
and show and hide a few divs where appropriate to appear logged out
*/
function logout(opts) {
    if (typeof opts == "undefined") {
        opts = {};
    }
    if (typeof opts.closeSocket == "undefined") {
        opts.closeSocket = true;
    }
    if (opts.closeSocket) {
        try {
            sock.close();
        } catch(er) {}        
    }
    sock = false;
    room = false;
    username = false;
    document.querySelector("#login").style.display = "block";
    document.querySelector("#logout").style.display = "none";
    document.querySelector("#output").style.display = "none";
    btnSendMsg.removeEventListener("click", clickSendMessage);
    chatmsg.removeEventListener("keyup", keyupChatMessage);
    inputroom.focus();
}

/*
This is the function that runs if you click the Send button.
It also gets called if the checkbox is checked and you hit Enter.
(You'll see that logic forther down in keyupChatMessage.)
*/
function clickSendMessage() {
    //// Trim the value entered.
    chatmsg.value = chatmsg.value.trim();
    //// If it's not blank, then...
    if (chatmsg.value!="") {
        //// Construct some message data:
        msgdata = {
            action:"chatmsg",
            message: chatmsg.value,
            room: room, 
            username: username
        };
        //// Clear out the chat message input
        chatmsg.value = "";
        //// Re-focus on that input (in case you clicked the button and left it)
        chatmsg.focus();
        //// Send the message through the socket (build further below)
        sock.send(JSON.stringify(msgdata));
    }
};

function keyupChatMessage(e) {
    //// Check if the 'press enter to send' checkbox is checked
    //// AND if the key just pressed was Enter (code 13)
    if (cbPressEnterToSend.checked && e.keyCode==13) {
        //// If so, run that clickSendMessage function from above
        clickSendMessage();
    }
}


/*
This function formats our content's message before logging to the chat
For now, it just turns URLs into clickable links.
*/
function formatContentMessage(x) {
    var up = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
    x = x.replace(up, "<a target='_blank' href='$1'>$1</a>");
    return x;
}
/*
This function is used to manually format our content.
When we use Vue instead, we'll just format it in the component template in HTML
*/
function getDisplayFormat(x) {
    x.message = formatContentMessage(x.message);
    var r = "<em>" + x.timestamp + "</em><br /><strong>" + x.username + ":</strong> " + x.message;
    return r;
}


/*
This is the big kahuna... 
This function will initialize a websocket connection to the server
and set a few listeners to handle messages that come back from it.
*/
function joingame(username,room) {

    //// First make sure neither is blank
    if (username!="" && room !="") {

        //// Set our 'sock' variable to a new websocket connection to that WSHOST url from above
        sock = new WebSocket(WSHOST);
        //// Specify that if the connection were to close, we should log out
        //// Note that I included an optional 'closeSocket' boolean in the options
        //// If that's false, which it is here, it won't try to close the socket
        //// because it's already closed. This prevents an awkward (endless?) loop.
        sock.onclose = function(e) {
            logout({closeSocket:false});
        };

        //// Now that we're logging in, let's toggle our login closed and the logout/output open
        document.querySelector("#login").style.display = "none";
        document.querySelector("#logout").style.display = "block";
        document.querySelector("#output").style.display = "block";

        //// Since we're showing a few things now, let's make sure we have global references to them
        chatlog = document.querySelector("#chatlog");
        chatmsg = document.querySelector("#chatmsg");
        btnSendMsg = document.querySelector("#btnSendMessage");
        cbPressEnterToSend = document.querySelector("#cbPressEnterToSend");


        //// Initialize a Vue component for the chatlog
        vChatLog = new Vue({
          el: '#chatlog',
          data: {
            cms:[]
          }
        })


        //// Let's place the user's cursor in that chat message box to start.
        chatmsg.focus();
        //// We'll add a listener to the Send button that runs clickSendMessage
        btnSendMsg.addEventListener("click", clickSendMessage);
        //// And likewise a listener to the Chat message box that runs keyupChatMessage
        chatmsg.addEventListener("keyup", keyupChatMessage);

        //// Now let's add a few listeners to our websocket:
        //// Listen for when the socket is open and ready to receive/send events
        sock.onopen = (e) => {
            //// We'll package an initial message with the info they entered
            msgdata = {
                action:"init",
                username:username,
                room:room
            };
            // // ... and send that info to the server to initialize things (see server.js notes)
            e.target.send(JSON.stringify(msgdata));
        }

        /// When a message is received from the server...
        sock.onmessage = function(m){
            //// Look for a 'data' string on it (I'm sending that, so it should be there)
            //// We'll create a variable called 'x' that corresponds to the JSON in 'm.data'
            var x = JSON.parse(m.data);
            //// If the 'action' value sent in the message is "log", 
            if (x.action=="log") {
                //// ... then let's just log it to our console.
                console.log(x.content);
            }
            //// If the action value is 'chatmsg', let's log the message to our chat log div
            if (x.action=="chatmsg") {

                /*
                //// Let's create a new container to hold our message (we'll append to our chat log)
                var cm = document.createElement("div");            
                ///// Give it a class name
                cm.className = "chatmsg";
                //// Construct the message using that getDisplayFormat function above)
                cm.innerHTML = getDisplayFormat(x.content);
                ///// Append this div to our chat log
                chatlog.appendChild(cm);
                */

                //// Format our content using that function above
                x.content.message = formatContentMessage(x.content.message);
                //// Push that content to our div
                vChatLog.cms.push({content:x.content});


                //// Scroll the chatlog as far down as possible so we see our new message at the bottom.
                chatlog.scrollTop = chatlog.scrollHeight
            }
        }

    }



}


/*
Once our window loads, we'll want to initialize a few things
like references to various DOM elements in the page that
we'll reference multiple times throughout our code.
*/
window.onload = function() {

    btni = document.querySelector("#btnToggleInstructions");
    instructions = document.querySelector("#instructions");
    btnJoin = document.querySelector("#joingame");
    inputroom = document.querySelector("#room");
    inputusername = document.querySelector("#username");

    inputroom.focus();

    //// Add an "_open" boolean flag to our instructions div
    instructions._open = false;
    //// Add a click listener to our instructions toggler
    btni.addEventListener("click", function() {
        if (!instructions._open) {
            //// If that boolean flag is false, then
            //// set it to true
            instructions._open = true;
            //// Show the instructions
            instructions.style.display = "block";
            //// Change the innerHTML to what looks like an [X] to close it
            btni.innerHTML = "[X]";
        } else {
            //// Otherwise do the opposite...
            //// Set the flag to false
            instructions._open = false;
            //// HIDE the instructions
            instructions.style.display = "none";
            //// Replace that [X] with the words again
            btni.innerHTML = "Info / Instructions";
        }
    });

    //// Here we're adding a click listener to our Join button to 
    //// initialize a chat using the joingame function
    btnJoin.addEventListener("click", () => {
        //// Grab the username and room values that the entered
        username = document.querySelector("#username").value.trim();
        room = document.querySelector("#room").value.trim();
        //// Run the joingame function using those two values
        joingame(username, room);
    });

    if (CHATROOM!='' && USERNAME!='') {
        username = USERNAME;
        room = CHATROOM;
        joingame(username, room);            
    }

}

