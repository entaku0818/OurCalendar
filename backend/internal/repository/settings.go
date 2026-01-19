package repository

import (
	"context"
	"errors"
	"time"

	"github.com/entaku0818/OurCalendar/backend/internal/model"
	"github.com/jackc/pgx/v5"
)

var ErrSettingsNotFound = errors.New("settings not found")

type SettingsRepository struct {
	db *DB
}

func NewSettingsRepository(db *DB) *SettingsRepository {
	return &SettingsRepository{db: db}
}

func (r *SettingsRepository) GetByUserID(ctx context.Context, userID string) (*model.UserSettings, error) {
	var settings model.UserSettings
	err := r.db.Pool.QueryRow(ctx, `
		SELECT user_id, push_enabled, event_reminder, reminder_minutes, updated_at
		FROM user_settings
		WHERE user_id = $1
	`, userID).Scan(
		&settings.UserID, &settings.PushEnabled, &settings.EventReminder,
		&settings.ReminderMinutes, &settings.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrSettingsNotFound
		}
		return nil, err
	}

	return &settings, nil
}

func (r *SettingsRepository) Create(ctx context.Context, settings *model.UserSettings) error {
	settings.UpdatedAt = time.Now()
	_, err := r.db.Pool.Exec(ctx, `
		INSERT INTO user_settings (user_id, push_enabled, event_reminder, reminder_minutes, updated_at)
		VALUES ($1, $2, $3, $4, $5)
	`, settings.UserID, settings.PushEnabled, settings.EventReminder, settings.ReminderMinutes, settings.UpdatedAt)

	return err
}

func (r *SettingsRepository) Update(ctx context.Context, settings *model.UserSettings) error {
	settings.UpdatedAt = time.Now()
	_, err := r.db.Pool.Exec(ctx, `
		UPDATE user_settings
		SET push_enabled = $1, event_reminder = $2, reminder_minutes = $3, updated_at = $4
		WHERE user_id = $5
	`, settings.PushEnabled, settings.EventReminder, settings.ReminderMinutes, settings.UpdatedAt, settings.UserID)

	return err
}

func (r *SettingsRepository) Upsert(ctx context.Context, settings *model.UserSettings) error {
	settings.UpdatedAt = time.Now()
	_, err := r.db.Pool.Exec(ctx, `
		INSERT INTO user_settings (user_id, push_enabled, event_reminder, reminder_minutes, updated_at)
		VALUES ($1, $2, $3, $4, $5)
		ON CONFLICT (user_id) DO UPDATE
		SET push_enabled = EXCLUDED.push_enabled,
		    event_reminder = EXCLUDED.event_reminder,
		    reminder_minutes = EXCLUDED.reminder_minutes,
		    updated_at = EXCLUDED.updated_at
	`, settings.UserID, settings.PushEnabled, settings.EventReminder, settings.ReminderMinutes, settings.UpdatedAt)

	return err
}
