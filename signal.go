package main

import (
	"encoding/json"
	"net/http"
)

var offer Session
var answer Session

var SendOffer = func(w http.ResponseWriter, r *http.Request) {
	session := Session{}
	err := json.NewDecoder(r.Body).Decode(&session)

	defer r.Body.Close()

	if err != nil {
		Respond(w, Message(false, "Invalid request"))
		return
	}

	// response
	offer = session
	resp := Message(true, "Send offer successfully !!!")
	Respond(w, resp)
	return
}

var SendAnswer = func(w http.ResponseWriter, r *http.Request) {
	session := Session{}
	err := json.NewDecoder(r.Body).Decode(&session)

	defer r.Body.Close()

	if err != nil {
		Respond(w, Message(false, "Invalid request"))
		return
	}

	// response
	answer = session
	resp := Message(true, "Send answer successfully !!!")
	Respond(w, resp)
	return
}

var GetOffer = func(w http.ResponseWriter, r *http.Request) {
	// response
	resp := Message(true, "get offer successfully !!!")
	resp["offer"] = offer
	Respond(w, resp)
	return
}

var GetAnswer = func(w http.ResponseWriter, r *http.Request) {
	// response
	resp := Message(true, "get answer successfully !!!")
	resp["answer"] = answer
	Respond(w, resp)
	return
}
