package main

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/websocket"
)

// Session for mapping sdp
type Session struct {
	SDP  string `json:"sdp"`
	Type string `json:"type"`
}

// WsMessage for ws request
type WsMessage struct {
	Session Session         `json:"session"`
	WS      *websocket.Conn `json:"ws"`
}

// Respond for api response
func Respond(w http.ResponseWriter, data map[string]interface{}) {
	/*This is for response*/
	w.Header().Add("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}

// Message for api response
func Message(status bool, message string) map[string]interface{} {
	return map[string]interface{}{"status": status, "message": message}
}
