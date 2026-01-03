package handler

import (
	"encoding/json"
	"net/http"
)

// GetCurrentUser returns the authenticated user's profile
func GetCurrentUser(w http.ResponseWriter, r *http.Request) {
	// TODO: Get user from JWT token in Authorization header

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Get current user not implemented yet",
	})
}

// UpdateUser updates the authenticated user's profile
func UpdateUser(w http.ResponseWriter, r *http.Request) {
	// TODO: Update user profile

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Update user not implemented yet",
	})
}
