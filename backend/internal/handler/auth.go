package handler

import (
	"encoding/json"
	"net/http"

	"github.com/entaku0818/OurCalendar/backend/internal/service"
)

type AuthHandler struct {
	authService *service.AuthService
}

func NewAuthHandler(authService *service.AuthService) *AuthHandler {
	return &AuthHandler{authService: authService}
}

type GoogleAuthRequest struct {
	IDToken string `json:"idToken"`
}

type AuthResponse struct {
	User        interface{} `json:"user"`
	AccessToken string      `json:"accessToken"`
}

type RefreshRequest struct {
	Token string `json:"token"`
}

func (h *AuthHandler) GoogleAuth(w http.ResponseWriter, r *http.Request) {
	var req GoogleAuthRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.IDToken == "" {
		writeError(w, http.StatusBadRequest, "idToken is required")
		return
	}

	user, token, err := h.authService.AuthenticateWithGoogle(r.Context(), req.IDToken)
	if err != nil {
		if err == service.ErrInvalidGoogleToken {
			writeError(w, http.StatusUnauthorized, "invalid google token")
			return
		}
		writeError(w, http.StatusInternalServerError, "authentication failed")
		return
	}

	writeJSON(w, http.StatusOK, AuthResponse{
		User:        user,
		AccessToken: token,
	})
}

func (h *AuthHandler) RefreshToken(w http.ResponseWriter, r *http.Request) {
	var req RefreshRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.Token == "" {
		writeError(w, http.StatusBadRequest, "token is required")
		return
	}

	user, token, err := h.authService.RefreshToken(r.Context(), req.Token)
	if err != nil {
		writeError(w, http.StatusUnauthorized, "invalid or expired token")
		return
	}

	writeJSON(w, http.StatusOK, AuthResponse{
		User:        user,
		AccessToken: token,
	})
}

func writeJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func writeError(w http.ResponseWriter, status int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(map[string]string{"error": message})
}
