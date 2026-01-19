package handler

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/entaku0818/OurCalendar/backend/internal/middleware"
	"github.com/entaku0818/OurCalendar/backend/internal/model"
	"github.com/entaku0818/OurCalendar/backend/internal/repository"
)

type UserHandler struct {
	userRepo     *repository.UserRepository
	settingsRepo *repository.SettingsRepository
}

func NewUserHandler(userRepo *repository.UserRepository, settingsRepo *repository.SettingsRepository) *UserHandler {
	return &UserHandler{
		userRepo:     userRepo,
		settingsRepo: settingsRepo,
	}
}

func (h *UserHandler) GetCurrentUser(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	if userID == "" {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	user, err := h.userRepo.GetByID(r.Context(), userID)
	if err != nil {
		if errors.Is(err, repository.ErrUserNotFound) {
			writeError(w, http.StatusNotFound, "user not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "failed to get user")
		return
	}

	writeJSON(w, http.StatusOK, user)
}

func (h *UserHandler) UpdateUser(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	if userID == "" {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	var req model.UpdateUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	user, err := h.userRepo.GetByID(r.Context(), userID)
	if err != nil {
		if errors.Is(err, repository.ErrUserNotFound) {
			writeError(w, http.StatusNotFound, "user not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "failed to get user")
		return
	}

	// Update fields if provided
	if req.Name != nil {
		user.Name = *req.Name
	}
	if req.AvatarURL != nil {
		user.AvatarURL = req.AvatarURL
	}

	if err := h.userRepo.Update(r.Context(), user); err != nil {
		writeError(w, http.StatusInternalServerError, "failed to update user")
		return
	}

	writeJSON(w, http.StatusOK, user)
}

func (h *UserHandler) GetSettings(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	if userID == "" {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	settings, err := h.settingsRepo.GetByUserID(r.Context(), userID)
	if err != nil {
		if errors.Is(err, repository.ErrSettingsNotFound) {
			// Return default settings if not found
			settings = model.DefaultUserSettings(userID)
		} else {
			writeError(w, http.StatusInternalServerError, "failed to get settings")
			return
		}
	}

	writeJSON(w, http.StatusOK, settings)
}

func (h *UserHandler) UpdateSettings(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	if userID == "" {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	var req model.UpdateSettingsRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	// Get existing settings or create default
	settings, err := h.settingsRepo.GetByUserID(r.Context(), userID)
	if err != nil {
		if errors.Is(err, repository.ErrSettingsNotFound) {
			settings = model.DefaultUserSettings(userID)
		} else {
			writeError(w, http.StatusInternalServerError, "failed to get settings")
			return
		}
	}

	// Update fields if provided
	if req.PushEnabled != nil {
		settings.PushEnabled = *req.PushEnabled
	}
	if req.EventReminder != nil {
		settings.EventReminder = *req.EventReminder
	}
	if req.ReminderMinutes != nil {
		settings.ReminderMinutes = *req.ReminderMinutes
	}

	if err := h.settingsRepo.Upsert(r.Context(), settings); err != nil {
		writeError(w, http.StatusInternalServerError, "failed to update settings")
		return
	}

	writeJSON(w, http.StatusOK, settings)
}
