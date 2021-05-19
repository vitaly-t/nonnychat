


var WSHOST = location.origin.replace(/^http/, 'ws');

var username = false;
var room = false;
var chatlog;
var chatmsg;
var inputroom;
var inputusername;
var btnSendMsg;
var btnPressEnterToSend;
var sock = false;


var btni;
var instructions;
var btnJoin;


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


function clickSendMessage() {
    chatmsg.value = chatmsg.value.trim();
    if (chatmsg.value!="") {
        msgdata = {
            action:"chatmsg",
            message: chatmsg.value,
            room: room, 
            username: username
        };
        chatmsg.value = "";
        chatmsg.focus();
        sock.send(JSON.stringify(msgdata));
    }
};

function keyupChatMessage(e) {
    if (cbPressEnterToSend.checked && e.keyCode==13) {
        clickSendMessage();
    }
}


function getDisplayFormat(x) {
    var up = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
    x = x.replace(up, "<a target='_blank' href='$1'>$1</a>");
    return x;
}

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


window.onload = function() {

    btni = document.querySelector("#btnToggleInstructions");
    instructions = document.querySelector("#instructions");
    btnJoin = document.querySelector("#joingame");


    btni.addEventListener("click", function() {
        if (!instructions._open) {
            instructions._open = true;
            instructions.style.display = "block";
            btni.innerHTML = "[X]";
        } else {
            instructions._open = false;
            instructions.style.display = "none";
            btni.innerHTML = "Info / Instructions";
        }
    });

    instructions._open = false;
    btnJoin.addEventListener("click", () => {
        var un = document.querySelector("#username");
        username = un.value;
        var rm = document.querySelector("#room");
        room = rm.value;
        joingame(username, room);
    });
}
