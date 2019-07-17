
var config = {
    sdpSemantics: 'unified-plan',
    iceServers: [
        {
            urls: ['stun:stun.l.google.com:19302']
        },
        {
            urls: ["turn:35.247.173.254:3478"],
            username: "username",
            credential: "password"
        },
        {
            urls: ["turn:numb.viagenie.ca"],
            credential: "muazkh",
            username: "webrtc@live.com"
        }
    ]
};


var pc = new RTCPeerConnection(config)

var iceConnectionLog = document.getElementById('ice-connection-state'),
    iceGatheringLog = document.getElementById('ice-gathering-state'),
    signalingLog = document.getElementById('signaling-state'),
    output = document.getElementById("output"),
    socket = new WebSocket("wss://34.87.44.249:8080/ws/viewer");

let log = msg => {
    document.getElementById('logs').innerHTML += msg + '<br>'
}

pc.oniceconnectionstatechange = e => log(pc.iceConnectionState)

pc.onicecandidate = event => {
    if (event.candidate === null) {
        socket.send(JSON.stringify(pc.localDescription))
    }
}

// register some listeners to help debugging
pc.addEventListener('icegatheringstatechange', function () {
    iceGatheringLog.textContent += ' -> ' + pc.iceGatheringState;
}, false);
iceGatheringLog.textContent = pc.iceGatheringState;

pc.addEventListener('iceconnectionstatechange', function () {
    iceConnectionLog.textContent += ' -> ' + pc.iceConnectionState;
}, false);
iceConnectionLog.textContent = pc.iceConnectionState;

pc.addEventListener('signalingstatechange', function () {
    signalingLog.textContent += ' -> ' + pc.signalingState;
}, false);
signalingLog.textContent = pc.signalingState;

pc.addEventListener('track', function (evt) {
    console.log("Track event: ", evt)
    if (evt.track.kind == 'video')
      document.getElementById('video').srcObject = evt.streams[0];
    else
      document.getElementById('audio').srcObject = evt.streams[0];
});

socket.onopen = function () {
    output.innerHTML += "Status: Connected\n";
};

socket.onmessage = function (e) {
    let resp = JSON.parse(e.data)
    output.innerHTML += "Receive Server message \n. SDP: "  + resp.sdp + "\n. Type: " + resp.type;
    console.log("On message resp \n")
    console.log(resp.type)
    pc.setRemoteDescription(resp)
    .then(() => {
        pc.createAnswer()
        .then(answer => pc.setLocalDescription(answer))
        .then(() =>{
            console.log("Set local done send to ws")
            socket.send(JSON.stringify(pc.localDescription))
        })
    })
    .catch(log)
    // do something with new sdp here
};