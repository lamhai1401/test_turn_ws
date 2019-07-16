package main

import (
	"fmt"
	"net/http"
)

func broadcastHandler(w http.ResponseWriter, r *http.Request) {
	path := fmt.Sprintf("templates/html/broadcast.html")
	fmt.Println(path)
	http.ServeFile(w, r, path)
}
func broadcastJSHandler(w http.ResponseWriter, r *http.Request) {
	path := fmt.Sprintf("templates/js/broadcast.js")
	fmt.Println(path)
	http.ServeFile(w, r, path)
}

func viewerHandler(w http.ResponseWriter, r *http.Request) {
	path := fmt.Sprintf("templates/html/viewer.html")
	fmt.Println(path)
	http.ServeFile(w, r, path)
}
func viewerJSHandler(w http.ResponseWriter, r *http.Request) {
	path := fmt.Sprintf("templates/js/viewer.js")
	fmt.Println(path)
	http.ServeFile(w, r, path)
}
