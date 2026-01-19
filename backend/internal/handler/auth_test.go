package handler

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/entaku0818/OurCalendar/backend/internal/config"
	"github.com/entaku0818/OurCalendar/backend/internal/service"
)

func TestGoogleAuth_EmptyToken(t *testing.T) {
	cfg := &config.Config{JWTSecret: "test-secret"}
	authService := service.NewAuthService(cfg, nil, nil)
	handler := NewAuthHandler(authService)

	body := GoogleAuthRequest{IDToken: ""}
	jsonBody, _ := json.Marshal(body)

	req := httptest.NewRequest(http.MethodPost, "/auth/google", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	handler.GoogleAuth(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Errorf("expected status %d, got %d", http.StatusBadRequest, rec.Code)
	}
}

func TestGoogleAuth_InvalidBody(t *testing.T) {
	cfg := &config.Config{JWTSecret: "test-secret"}
	authService := service.NewAuthService(cfg, nil, nil)
	handler := NewAuthHandler(authService)

	req := httptest.NewRequest(http.MethodPost, "/auth/google", bytes.NewBufferString("invalid json"))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	handler.GoogleAuth(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Errorf("expected status %d, got %d", http.StatusBadRequest, rec.Code)
	}
}

func TestRefreshToken_EmptyToken(t *testing.T) {
	cfg := &config.Config{JWTSecret: "test-secret"}
	authService := service.NewAuthService(cfg, nil, nil)
	handler := NewAuthHandler(authService)

	body := RefreshRequest{Token: ""}
	jsonBody, _ := json.Marshal(body)

	req := httptest.NewRequest(http.MethodPost, "/auth/refresh", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	handler.RefreshToken(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Errorf("expected status %d, got %d", http.StatusBadRequest, rec.Code)
	}
}

func TestWriteJSON(t *testing.T) {
	rec := httptest.NewRecorder()
	data := map[string]string{"key": "value"}

	writeJSON(rec, http.StatusOK, data)

	if rec.Code != http.StatusOK {
		t.Errorf("expected status %d, got %d", http.StatusOK, rec.Code)
	}

	contentType := rec.Header().Get("Content-Type")
	if contentType != "application/json" {
		t.Errorf("expected Content-Type application/json, got %s", contentType)
	}
}

func TestWriteError(t *testing.T) {
	rec := httptest.NewRecorder()

	writeError(rec, http.StatusBadRequest, "test error")

	if rec.Code != http.StatusBadRequest {
		t.Errorf("expected status %d, got %d", http.StatusBadRequest, rec.Code)
	}

	var response map[string]string
	json.NewDecoder(rec.Body).Decode(&response)

	if response["error"] != "test error" {
		t.Errorf("expected error 'test error', got '%s'", response["error"])
	}
}
