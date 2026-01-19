package middleware

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/entaku0818/OurCalendar/backend/internal/config"
	"github.com/entaku0818/OurCalendar/backend/internal/model"
	"github.com/entaku0818/OurCalendar/backend/internal/service"
)

func TestGetUserID(t *testing.T) {
	ctx := context.WithValue(context.Background(), UserIDKey, "test-user-id")

	userID := GetUserID(ctx)
	if userID != "test-user-id" {
		t.Errorf("expected 'test-user-id', got '%s'", userID)
	}
}

func TestGetUserID_NotSet(t *testing.T) {
	ctx := context.Background()

	userID := GetUserID(ctx)
	if userID != "" {
		t.Errorf("expected empty string, got '%s'", userID)
	}
}

func TestGetEmail(t *testing.T) {
	ctx := context.WithValue(context.Background(), EmailKey, "test@example.com")

	email := GetEmail(ctx)
	if email != "test@example.com" {
		t.Errorf("expected 'test@example.com', got '%s'", email)
	}
}

func TestGetEmail_NotSet(t *testing.T) {
	ctx := context.Background()

	email := GetEmail(ctx)
	if email != "" {
		t.Errorf("expected empty string, got '%s'", email)
	}
}

func TestAuthMiddleware_MissingHeader(t *testing.T) {
	cfg := &config.Config{JWTSecret: "test-secret"}
	authService := service.NewAuthService(cfg, nil, nil)

	handler := Auth(authService)(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	rec := httptest.NewRecorder()

	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusUnauthorized {
		t.Errorf("expected status %d, got %d", http.StatusUnauthorized, rec.Code)
	}
}

func TestAuthMiddleware_InvalidFormat(t *testing.T) {
	cfg := &config.Config{JWTSecret: "test-secret"}
	authService := service.NewAuthService(cfg, nil, nil)

	handler := Auth(authService)(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	req.Header.Set("Authorization", "InvalidFormat")
	rec := httptest.NewRecorder()

	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusUnauthorized {
		t.Errorf("expected status %d, got %d", http.StatusUnauthorized, rec.Code)
	}
}

func TestAuthMiddleware_InvalidToken(t *testing.T) {
	cfg := &config.Config{JWTSecret: "test-secret"}
	authService := service.NewAuthService(cfg, nil, nil)

	handler := Auth(authService)(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	req.Header.Set("Authorization", "Bearer invalid-token")
	rec := httptest.NewRecorder()

	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusUnauthorized {
		t.Errorf("expected status %d, got %d", http.StatusUnauthorized, rec.Code)
	}
}

func TestAuthMiddleware_ValidToken(t *testing.T) {
	cfg := &config.Config{JWTSecret: "test-secret"}
	authService := service.NewAuthService(cfg, nil, nil)

	// Generate a valid token
	user := &model.User{
		ID:    "test-user-id",
		Email: "test@example.com",
	}
	token, err := authService.GenerateJWT(user)
	if err != nil {
		t.Fatalf("failed to generate token: %v", err)
	}

	var capturedUserID, capturedEmail string
	handler := Auth(authService)(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		capturedUserID = GetUserID(r.Context())
		capturedEmail = GetEmail(r.Context())
		w.WriteHeader(http.StatusOK)
	}))

	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	rec := httptest.NewRecorder()

	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("expected status %d, got %d", http.StatusOK, rec.Code)
	}

	if capturedUserID != user.ID {
		t.Errorf("expected user ID '%s', got '%s'", user.ID, capturedUserID)
	}

	if capturedEmail != user.Email {
		t.Errorf("expected email '%s', got '%s'", user.Email, capturedEmail)
	}
}
