package handler

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
)

// ListGroups returns all groups the user belongs to
func ListGroups(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode([]interface{}{})
}

// CreateGroup creates a new group
func CreateGroup(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Create group not implemented yet",
	})
}

// GetGroup returns a specific group
func GetGroup(w http.ResponseWriter, r *http.Request) {
	groupID := chi.URLParam(r, "groupID")

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"id":      groupID,
		"message": "Get group not implemented yet",
	})
}

// UpdateGroup updates a group
func UpdateGroup(w http.ResponseWriter, r *http.Request) {
	groupID := chi.URLParam(r, "groupID")

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"id":      groupID,
		"message": "Update group not implemented yet",
	})
}

// DeleteGroup deletes a group
func DeleteGroup(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusNoContent)
}

// JoinGroup adds user to a group via invite code
func JoinGroup(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Join group not implemented yet",
	})
}

// LeaveGroup removes user from a group
func LeaveGroup(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusNoContent)
}
