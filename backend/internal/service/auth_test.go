package service

import (
	"testing"
	"time"

	"github.com/entaku0818/OurCalendar/backend/internal/config"
	"github.com/entaku0818/OurCalendar/backend/internal/model"
	"github.com/golang-jwt/jwt/v5"
)

func TestGenerateJWT(t *testing.T) {
	cfg := &config.Config{
		JWTSecret: "test-secret-key-for-testing",
	}
	authService := NewAuthService(cfg, nil, nil)

	user := &model.User{
		ID:    "test-user-id",
		Email: "test@example.com",
		Name:  "Test User",
	}

	token, err := authService.GenerateJWT(user)
	if err != nil {
		t.Fatalf("failed to generate JWT: %v", err)
	}

	if token == "" {
		t.Error("expected non-empty token")
	}
}

func TestValidateJWT_ValidToken(t *testing.T) {
	cfg := &config.Config{
		JWTSecret: "test-secret-key-for-testing",
	}
	authService := NewAuthService(cfg, nil, nil)

	user := &model.User{
		ID:    "test-user-id",
		Email: "test@example.com",
		Name:  "Test User",
	}

	token, err := authService.GenerateJWT(user)
	if err != nil {
		t.Fatalf("failed to generate JWT: %v", err)
	}

	claims, err := authService.ValidateJWT(token)
	if err != nil {
		t.Fatalf("failed to validate JWT: %v", err)
	}

	if claims.UserID != user.ID {
		t.Errorf("expected user ID %s, got %s", user.ID, claims.UserID)
	}

	if claims.Email != user.Email {
		t.Errorf("expected email %s, got %s", user.Email, claims.Email)
	}
}

func TestValidateJWT_InvalidToken(t *testing.T) {
	cfg := &config.Config{
		JWTSecret: "test-secret-key-for-testing",
	}
	authService := NewAuthService(cfg, nil, nil)

	_, err := authService.ValidateJWT("invalid-token")
	if err == nil {
		t.Error("expected error for invalid token")
	}

	if err != ErrInvalidToken {
		t.Errorf("expected ErrInvalidToken, got %v", err)
	}
}

func TestValidateJWT_ExpiredToken(t *testing.T) {
	cfg := &config.Config{
		JWTSecret: "test-secret-key-for-testing",
	}
	authService := NewAuthService(cfg, nil, nil)

	// Create an expired token manually
	claims := Claims{
		UserID: "test-user-id",
		Email:  "test@example.com",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(-1 * time.Hour)), // Expired 1 hour ago
			IssuedAt:  jwt.NewNumericDate(time.Now().Add(-2 * time.Hour)),
			NotBefore: jwt.NewNumericDate(time.Now().Add(-2 * time.Hour)),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(cfg.JWTSecret))
	if err != nil {
		t.Fatalf("failed to create test token: %v", err)
	}

	_, err = authService.ValidateJWT(tokenString)
	if err == nil {
		t.Error("expected error for expired token")
	}

	if err != ErrTokenExpired {
		t.Errorf("expected ErrTokenExpired, got %v", err)
	}
}

func TestValidateJWT_WrongSecret(t *testing.T) {
	cfg1 := &config.Config{
		JWTSecret: "secret-1",
	}
	cfg2 := &config.Config{
		JWTSecret: "secret-2",
	}
	authService1 := NewAuthService(cfg1, nil, nil)
	authService2 := NewAuthService(cfg2, nil, nil)

	user := &model.User{
		ID:    "test-user-id",
		Email: "test@example.com",
		Name:  "Test User",
	}

	// Generate token with service1
	token, err := authService1.GenerateJWT(user)
	if err != nil {
		t.Fatalf("failed to generate JWT: %v", err)
	}

	// Try to validate with service2 (different secret)
	_, err = authService2.ValidateJWT(token)
	if err == nil {
		t.Error("expected error when validating with wrong secret")
	}
}
