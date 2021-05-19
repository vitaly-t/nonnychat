

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


//// This just formats each message text a little/
//// Right now all it does is turn URLs into clickable links
function getDisplayFormat(x) {
    var up = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
    x = x.replace(up, "<a target='_blank' href='$1'>$1</a>");
    return x;
}


/*
This is the big kahuna...
*/
function joingame(username,room) {

    if (username!="" && room !="") {

        sock = new WebSocket(WSHOST);
        sock.onclose = function(e) {
            logout({closeSocket:false});
        };

        document.querySelector("#login").style.display = "none";
        document.querySelector("#logout").style.display = "block";
        document.querySelector("#output").style.display = "block";

        chatlog = document.querySelector("#chatlog");
        chatmsg = document.querySelector("#chatmsg");
        inputroom = document.querySelector("#inputroom");
        inputusername = document.querySelector("#inputusername");
        btnSendMsg = document.querySelector("#btnSendMessage");
        cbPressEnterToSend = document.querySelector("#cbPressEnterToSend");

        chatmsg.focus();

        console.log(btnSendMsg);
        btnSendMsg.addEventListener("click", clickSendMessage);
        chatmsg.addEventListener("keyup", keyupChatMessage);

        // When the socket is open and ready to receive/send events
        sock.onopen = (e) => {
        //  console.log(e);
            msgdata = {
                action:"init",
                username:username,
                room:room
            };
            // sent the JSON for the msgdata object to the target (above)
            e.target.send(JSON.stringify(msgdata));
        }

        // When a message is received (from the url above):
        sock.onmessage = function(m){
            var x = JSON.parse(m.data);
            if (x.action=="welcome") {
//                document.querySelector("#welcome").innerHTML = x.content;
            }
            if (x.action=="log") {
                console.log(x.content);
            }
            if (x.action=="chatmsg") {
                var cm = document.createElement("div");            
                cm.className = "chatmsg";
                cm.innerHTML = "<em>" + x.content.timestamp + "</em><br /><strong>" + x.content.username + ":</strong> " + getDisplayFormat(x.content.message);
                chatlog.appendChild(cm);
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
        username = document.querySelector("#username").value;
        room = rdocument.querySelector("#room").value;
        //// Run the joingame function using those two values
        joingame(username, room);
    });
}
