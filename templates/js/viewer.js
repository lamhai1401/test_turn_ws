
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

socket.onopen = function () {
    output.innerHTML += "Status: Connected\n";
};

socket.onmessage = function (e) {
    let resp = JSON.parse(e.data)
    output.innerHTML += "Receive Server message \n. SDP: "  + resp.sdp + "\n. Type: " + resp.type;

    pc.setRemoteDescription(resp)
    .then(() => {
        console.log("Set remote by ws success")
    })
    .catch(log)
    // do something with new sdp here
};

fetch('/getoffer', {
    headers: {
        'Content-Type': 'application/json'
    },
    method: 'GET'
})
.then(resp => resp.json())
.then(resp => {
    offer = resp['offer']
    console.log("offer", offer)

    // register some listeners to help debugging
    pc.addEventListener('icegatheringstatechange', function() {
        iceGatheringLog.textContent += ' -> ' + pc.iceGatheringState;
    }, false);
    iceGatheringLog.textContent = pc.iceGatheringState;

    pc.addEventListener('iceconnectionstatechange', function() {
        iceConnectionLog.textContent += ' -> ' + pc.iceConnectionState;
    }, false);
    iceConnectionLog.textContent = pc.iceConnectionState;

    pc.addEventListener('signalingstatechange', function() {
        signalingLog.textContent += ' -> ' + pc.signalingState;
    }, false);
    signalingLog.textContent = pc.signalingState;

     // connect audio / video
    pc.addEventListener('track', function (evt) {
        console.log("Track event: ", evt)
        if (evt.track.kind == 'video')
          document.getElementById('video').srcObject = evt.streams[0];
        else
          document.getElementById('audio').srcObject = evt.streams[0];
    });

    return pc.setRemoteDescription(offer)
    .then(() => pc.createAnswer())
    .then(answer => {
        return pc.setLocalDescription(answer)
    })
    .then(() => {
        answer = pc.localDescription
        console.log("client4 answer", answer.sdp)
        fetch('/sendanswer', {
            body: JSON.stringify({
                "sdp": answer.sdp,
                "type": answer.type,
            }),
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'POST'
        })
        .then(resp => {
            console.log(resp.json())
        })
        .catch(err => log(err))
    })
    .catch(err => log(err))
})
.catch(err => log(err))