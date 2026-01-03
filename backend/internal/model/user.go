package model

import "time"

type User struct {
	ID        string    `json:"id" db:"id"`
	Name      string    `json:"name" db:"name"`
	Email     string    `json:"email" db:"email"`
	AvatarURL *string   `json:"avatarUrl,omitempty" db:"avatar_url"`
	GoogleID  *string   `json:"googleId,omitempty" db:"google_id"`
	LineID    *string   `json:"lineId,omitempty" db:"line_id"`
	CreatedAt time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt time.Time `json:"updatedAt" db:"updated_at"`
}
