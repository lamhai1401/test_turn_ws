package main

import (
	"fmt"
	"net/http"

	"github.com/gorilla/websocket"
)

// Configure the upgrader
var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

var broadcast = make(chan *WsMessage)
var viewer = make(chan *WsMessage)
var wsList = make(map[string]*websocket.Conn)

func handleBroadcast(w http.ResponseWriter, r *http.Request) {
	// Upgrade initial GET request to a websocket
	ws, err := upgrader.Upgrade(w, r, nil)

	wsList["broadcast"] = ws

	if err != nil {
		fmt.Print(err)
	}

	defer ws.Close()

	for {
		msg := new(WsMessage)
		session := new(Session)
		if err := ws.ReadJSON(session); err != nil {
			fmt.Printf("error: %v", err)
			break
		}

		conn, ok := wsList["viewer"]
		if ok {
			msg.Session = *session
			msg.WS = conn
			// Send the newly received message to the broadcast channel
			broadcast <- msg
		}
	}
}

func viewerMessage() {
	for {
		msg := <-broadcast
		if err := msg.WS.WriteJSON(msg.Session); err != nil {
			fmt.Printf("error: %v", err)
			return
		}
	}
}

func handleViewer(w http.ResponseWriter, r *http.Request) {
	// Upgrade initial GET request to a websocket
	ws, err := upgrader.Upgrade(w, r, nil)
	wsList["viewer"] = ws
	if err != nil {
		fmt.Print(err)
	}

	defer ws.Close()

	for {
		msg := new(WsMessage)
		session := new(Session)
		if err := ws.ReadJSON(session); err != nil {
			fmt.Printf("error: %v", err)
			break
		}
		conn, ok := wsList["broadcast"]
		if ok {
			msg.Session = *session
			msg.WS = conn
			// Send the newly received message to the broadcast channel
			viewer <- msg
		}
	}
}

func broadcastMessage() {
	for {
		msg := <-viewer
		if err := msg.WS.WriteJSON(msg.Session); err != nil {
			fmt.Printf("error: %v", err)
			return
		}
	}
}
