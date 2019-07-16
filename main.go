package main

import (
	"fmt"
	"net/http"
	"os"

	"github.com/gorilla/mux"
)

func main() {
	router := mux.NewRouter()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// turn on user api
	router.
		HandleFunc("/1", broadcastHandler)
	router.
		HandleFunc("/broadcast.js", broadcastJSHandler)
	router.
		HandleFunc("/2", viewerHandler)
	router.
		HandleFunc("/viewer.js", viewerJSHandler)

	// turn on server api
	router.
		HandleFunc("/sendoffer", SendOffer).Methods("POST")
	router.
		HandleFunc("/sendanswer", SendAnswer).Methods("POST")

	router.
		HandleFunc("/getoffer", GetOffer).Methods("GET")
	router.
		HandleFunc("/getanswer", GetAnswer).Methods("GET")

	// turn on websocket
	router.
		HandleFunc("/ws/broadcast", handleBroadcast)
	router.
		HandleFunc("/ws/viewer", handleViewer)

	go broadcastMessage()
	go viewerMessage()

	err := http.ListenAndServeTLS(fmt.Sprintf(":%s", port), "server.crt", "server.key", router)
	// err := http.ListenAndServe(fmt.Sprintf(":%s", port), router)

	if err != nil {
		fmt.Print(err)
	}
}
