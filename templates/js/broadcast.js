
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
    socket = new WebSocket("wss://localhost:8080/ws/broadcast");

let log = msg => {
    document.getElementById('logs').innerHTML += msg + '<br>'
}

let displayVideo = video => {
    var el = document.createElement('video')
    el.srcObject = video
    el.autoplay = true
    el.muted = true
    el.width = 160
    el.height = 120

    document.getElementById('localVideos').appendChild(el)
    return video
}

pc.oniceconnectionstatechange = e => log(pc.iceConnectionState)

pc.onicecandidate = event => {
    if (event.candidate === null) {
        socket.send(JSON.stringify(pc.localDescription))
    }
}

navigator.mediaDevices.getUserMedia({ video: true, audio: true })
.then(stream => {
    pc.addStream(displayVideo(stream))
    return pc.createOffer()
    .then(offer => pc.setLocalDescription(offer))
})
.then(() => {
    d = pc.localDescription
    return fetch('/sendoffer', {
        body: JSON.stringify({
            "sdp": d.sdp,
            "type": d.type,
        }),
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'POST'
    })
})
.then(resp => resp.json())
.then(resp => console.log(resp))
.catch(log)

function start() {
    return fetch('/getanswer', {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'GET'
    })
    .then(resp => resp.json())
    .then(resp => {
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
        answer = resp['answer']
        console.log("client3 answer", answer.sdp)
        return pc.setRemoteDescription(new RTCSessionDescription(answer))
    })
    .catch(err => alert(err))
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
