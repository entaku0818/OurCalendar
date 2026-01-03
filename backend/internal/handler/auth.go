package handler

import (
	"encoding/json"
	"net/http"
)

type AuthRequest struct {
	Token string `json:"token"`
}

type AuthResponse struct {
	User        interface{} `json:"user"`
	AccessToken string      `json:"accessToken"`
}

// GoogleAuth handles Google OAuth authentication
func GoogleAuth(w http.ResponseWriter, r *http.Request) {
	var req AuthRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// TODO: Verify Google token and create/get user
	// 1. Verify token with Google
	// 2. Extract user info
	// 3. Create or update user in database
	// 4. Generate JWT token

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Google auth not implemented yet",
	})
}

// LineAuth handles LINE OAuth authentication
func LineAuth(w http.ResponseWriter, r *http.Request) {
	var req AuthRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// TODO: Verify LINE token and create/get user

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "LINE auth not implemented yet",
	})
}
