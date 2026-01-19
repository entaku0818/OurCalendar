package model

import "time"

type UserSettings struct {
	UserID          string    `json:"userId" db:"user_id"`
	PushEnabled     bool      `json:"pushEnabled" db:"push_enabled"`
	EventReminder   bool      `json:"eventReminder" db:"event_reminder"`
	ReminderMinutes int       `json:"reminderMinutes" db:"reminder_minutes"`
	UpdatedAt       time.Time `json:"updatedAt" db:"updated_at"`
}

// UpdateSettingsRequest is the request body for updating user settings
type UpdateSettingsRequest struct {
	PushEnabled     *bool `json:"pushEnabled,omitempty"`
	EventReminder   *bool `json:"eventReminder,omitempty"`
	ReminderMinutes *int  `json:"reminderMinutes,omitempty"`
}

// DefaultUserSettings returns default settings for a new user
func DefaultUserSettings(userID string) *UserSettings {
	return &UserSettings{
		UserID:          userID,
		PushEnabled:     true,
		EventReminder:   true,
		ReminderMinutes: 30,
	}
}
