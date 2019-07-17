package main

import (
	"fmt"
	"net/http"

	"github.com/gorilla/websocket"
)

var broadcastSDP = Session{}
var viewerSDP = Session{}

var broadcast = make(chan *WsMessage)
var viewer = make(chan *WsMessage)

var broadcastConn *websocket.Conn
var viewerConn *websocket.Conn

// Configure the upgrader
var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func handleBroadcast(w http.ResponseWriter, r *http.Request) {
	// Upgrade initial GET request to a websocket
	ws, err := upgrader.Upgrade(w, r, nil)

	broadcastConn = ws
	if err != nil {
		fmt.Print(err)
	}

	defer func() {
		ws.Close()
	}()

	for {
		if err := ws.ReadJSON(&broadcastSDP); err != nil {
			fmt.Printf("error: %v", err)
			break
		}
		if viewerConn != nil {
			msg := new(WsMessage)
			msg.Session = broadcastSDP
			msg.WS = viewerConn
			broadcast <- msg
		}
	}
}

func viewerMessage() {
	for {
		ws := <-broadcast
		if err := ws.WS.WriteJSON(ws.Session); err != nil {
			fmt.Printf("error: %v", err)
			continue
		}
	}
}

func handleViewer(w http.ResponseWriter, r *http.Request) {
	// Upgrade initial GET request to a websocket
	ws, err := upgrader.Upgrade(w, r, nil)

	viewerConn = ws
	if err != nil {
		fmt.Print(err)
	}

	defer func() {
		ws.Close()
	}()

	msg1 := new(WsMessage)
	msg1.Session = broadcastSDP
	msg1.WS = ws
	broadcast <- msg1

	for {
		if err := ws.ReadJSON(&viewerSDP); err != nil {
			fmt.Printf("error: %v", err)
			break
		}
		if broadcastConn != nil {
			msg := new(WsMessage)
			msg.Session = viewerSDP
			msg.WS = broadcastConn
			viewer <- msg
		}
	}
}

func broadcastMessage() {
	for {
		ws := <-viewer
		if err := ws.WS.WriteJSON(ws.Session); err != nil {
			fmt.Printf("error: %v", err)
			continue
		}
	}
}
