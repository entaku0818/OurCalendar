package model

import (
	"testing"
)

func TestDefaultUserSettings(t *testing.T) {
	userID := "test-user-id"
	settings := DefaultUserSettings(userID)

	if settings.UserID != userID {
		t.Errorf("expected UserID '%s', got '%s'", userID, settings.UserID)
	}

	if !settings.PushEnabled {
		t.Error("expected PushEnabled to be true by default")
	}

	if !settings.EventReminder {
		t.Error("expected EventReminder to be true by default")
	}

	if settings.ReminderMinutes != 30 {
		t.Errorf("expected ReminderMinutes to be 30, got %d", settings.ReminderMinutes)
	}
}
