package model

import "time"

type Event struct {
	ID            string    `json:"id" db:"id"`
	GroupID       *string   `json:"groupId,omitempty" db:"group_id"`
	Title         string    `json:"title" db:"title"`
	StartAt       time.Time `json:"startAt" db:"start_at"`
	EndAt         time.Time `json:"endAt" db:"end_at"`
	AssigneeID    *string   `json:"assigneeId,omitempty" db:"assignee_id"`
	Memo          *string   `json:"memo,omitempty" db:"memo"`
	IsFromGoogle  bool      `json:"isFromGoogle" db:"is_from_google"`
	IsShared      bool      `json:"isShared" db:"is_shared"`
	GoogleEventID *string   `json:"googleEventId,omitempty" db:"google_event_id"`
	CreatedBy     string    `json:"createdBy" db:"created_by"`
	CreatedAt     time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt     time.Time `json:"updatedAt" db:"updated_at"`
}

// CreateEventRequest is the request body for creating an event
type CreateEventRequest struct {
	Title         string  `json:"title" validate:"required"`
	StartAt       string  `json:"startAt" validate:"required"`
	EndAt         string  `json:"endAt" validate:"required"`
	Memo          *string `json:"memo,omitempty"`
	GroupID       *string `json:"groupId,omitempty"`
	AssigneeID    *string `json:"assigneeId,omitempty"`
	IsShared      bool    `json:"isShared"`
	IsFromGoogle  bool    `json:"isFromGoogle"`
	GoogleEventID *string `json:"googleEventId,omitempty"`
}

// UpdateEventRequest is the request body for updating an event
type UpdateEventRequest struct {
	Title      *string `json:"title,omitempty"`
	StartAt    *string `json:"startAt,omitempty"`
	EndAt      *string `json:"endAt,omitempty"`
	Memo       *string `json:"memo,omitempty"`
	AssigneeID *string `json:"assigneeId,omitempty"`
	IsShared   *bool   `json:"isShared,omitempty"`
}
