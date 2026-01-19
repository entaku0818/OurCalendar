package service

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"time"

	"github.com/entaku0818/OurCalendar/backend/internal/config"
	"github.com/entaku0818/OurCalendar/backend/internal/model"
	"github.com/entaku0818/OurCalendar/backend/internal/repository"
	"github.com/golang-jwt/jwt/v5"
)

var (
	ErrInvalidToken     = errors.New("invalid token")
	ErrTokenExpired     = errors.New("token expired")
	ErrInvalidGoogleToken = errors.New("invalid google token")
)

type AuthService struct {
	cfg          *config.Config
	userRepo     *repository.UserRepository
	settingsRepo *repository.SettingsRepository
}

func NewAuthService(cfg *config.Config, userRepo *repository.UserRepository, settingsRepo *repository.SettingsRepository) *AuthService {
	return &AuthService{
		cfg:          cfg,
		userRepo:     userRepo,
		settingsRepo: settingsRepo,
	}
}

type GoogleTokenInfo struct {
	Sub           string `json:"sub"`
	Email         string `json:"email"`
	EmailVerified string `json:"email_verified"`
	Name          string `json:"name"`
	Picture       string `json:"picture"`
	Aud           string `json:"aud"`
}

type Claims struct {
	UserID string `json:"userId"`
	Email  string `json:"email"`
	jwt.RegisteredClaims
}

func (s *AuthService) VerifyGoogleToken(ctx context.Context, idToken string) (*GoogleTokenInfo, error) {
	url := fmt.Sprintf("https://oauth2.googleapis.com/tokeninfo?id_token=%s", idToken)

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, ErrInvalidGoogleToken
	}

	var tokenInfo GoogleTokenInfo
	if err := json.NewDecoder(resp.Body).Decode(&tokenInfo); err != nil {
		return nil, err
	}

	// Verify audience matches our client ID
	if tokenInfo.Aud != s.cfg.GoogleClientID {
		return nil, ErrInvalidGoogleToken
	}

	return &tokenInfo, nil
}

func (s *AuthService) AuthenticateWithGoogle(ctx context.Context, idToken string) (*model.User, string, error) {
	tokenInfo, err := s.VerifyGoogleToken(ctx, idToken)
	if err != nil {
		return nil, "", err
	}

	// Find or create user
	user := &model.User{
		GoogleID:  &tokenInfo.Sub,
		Email:     tokenInfo.Email,
		Name:      tokenInfo.Name,
		AvatarURL: &tokenInfo.Picture,
	}

	if err := s.userRepo.UpsertByGoogleID(ctx, user); err != nil {
		return nil, "", err
	}

	// Create default settings if not exists
	_, err = s.settingsRepo.GetByUserID(ctx, user.ID)
	if errors.Is(err, repository.ErrSettingsNotFound) {
		defaultSettings := model.DefaultUserSettings(user.ID)
		if err := s.settingsRepo.Create(ctx, defaultSettings); err != nil {
			return nil, "", err
		}
	}

	// Generate JWT
	jwtToken, err := s.GenerateJWT(user)
	if err != nil {
		return nil, "", err
	}

	return user, jwtToken, nil
}

func (s *AuthService) GenerateJWT(user *model.User) (string, error) {
	claims := Claims{
		UserID: user.ID,
		Email:  user.Email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * 7 * time.Hour)), // 1 week
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.cfg.JWTSecret))
}

func (s *AuthService) ValidateJWT(tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(s.cfg.JWTSecret), nil
	})

	if err != nil {
		if errors.Is(err, jwt.ErrTokenExpired) {
			return nil, ErrTokenExpired
		}
		return nil, ErrInvalidToken
	}

	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}

	return nil, ErrInvalidToken
}

func (s *AuthService) RefreshToken(ctx context.Context, tokenString string) (*model.User, string, error) {
	claims, err := s.ValidateJWT(tokenString)
	if err != nil && !errors.Is(err, ErrTokenExpired) {
		return nil, "", err
	}

	user, err := s.userRepo.GetByID(ctx, claims.UserID)
	if err != nil {
		return nil, "", err
	}

	newToken, err := s.GenerateJWT(user)
	if err != nil {
		return nil, "", err
	}

	return user, newToken, nil
}
