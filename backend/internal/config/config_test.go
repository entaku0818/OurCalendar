package config

import (
	"os"
	"testing"
)

func TestLoad_DefaultValues(t *testing.T) {
	// Clear any existing env vars
	os.Unsetenv("PORT")
	os.Unsetenv("ENV")
	os.Unsetenv("SUPABASE_URL")
	os.Unsetenv("SUPABASE_KEY")
	os.Unsetenv("JWT_SECRET")
	os.Unsetenv("GOOGLE_CLIENT_ID")

	cfg := Load()

	if cfg.Port != "8080" {
		t.Errorf("expected default port '8080', got '%s'", cfg.Port)
	}

	if cfg.Env != "development" {
		t.Errorf("expected default env 'development', got '%s'", cfg.Env)
	}

	if cfg.SupabaseURL != "" {
		t.Errorf("expected empty SupabaseURL, got '%s'", cfg.SupabaseURL)
	}

	if cfg.JWTSecret != "your-secret-key-change-in-production" {
		t.Errorf("expected default JWT secret, got '%s'", cfg.JWTSecret)
	}
}

func TestLoad_CustomValues(t *testing.T) {
	os.Setenv("PORT", "3000")
	os.Setenv("ENV", "production")
	os.Setenv("SUPABASE_URL", "postgres://test")
	os.Setenv("JWT_SECRET", "custom-secret")
	os.Setenv("GOOGLE_CLIENT_ID", "test-client-id")

	defer func() {
		os.Unsetenv("PORT")
		os.Unsetenv("ENV")
		os.Unsetenv("SUPABASE_URL")
		os.Unsetenv("JWT_SECRET")
		os.Unsetenv("GOOGLE_CLIENT_ID")
	}()

	cfg := Load()

	if cfg.Port != "3000" {
		t.Errorf("expected port '3000', got '%s'", cfg.Port)
	}

	if cfg.Env != "production" {
		t.Errorf("expected env 'production', got '%s'", cfg.Env)
	}

	if cfg.SupabaseURL != "postgres://test" {
		t.Errorf("expected SupabaseURL 'postgres://test', got '%s'", cfg.SupabaseURL)
	}

	if cfg.JWTSecret != "custom-secret" {
		t.Errorf("expected JWT secret 'custom-secret', got '%s'", cfg.JWTSecret)
	}

	if cfg.GoogleClientID != "test-client-id" {
		t.Errorf("expected GoogleClientID 'test-client-id', got '%s'", cfg.GoogleClientID)
	}
}

func TestIsProduction(t *testing.T) {
	tests := []struct {
		env      string
		expected bool
	}{
		{"production", true},
		{"development", false},
		{"staging", false},
		{"", false},
	}

	for _, tt := range tests {
		cfg := &Config{Env: tt.env}
		if cfg.IsProduction() != tt.expected {
			t.Errorf("IsProduction() for env '%s': expected %v, got %v", tt.env, tt.expected, cfg.IsProduction())
		}
	}
}
