package model

import "time"

type Event struct {
	ID           string    `json:"id" db:"id"`
	GroupID      *string   `json:"groupId,omitempty" db:"group_id"`
	Title        string    `json:"title" db:"title"`
	StartAt      time.Time `json:"startAt" db:"start_at"`
	EndAt        time.Time `json:"endAt" db:"end_at"`
	AssigneeID   *string   `json:"assigneeId,omitempty" db:"assignee_id"`
	Memo         *string   `json:"memo,omitempty" db:"memo"`
	IsFromGoogle bool      `json:"isFromGoogle" db:"is_from_google"`
	IsShared     bool      `json:"isShared" db:"is_shared"`
	CreatedBy    string    `json:"createdBy" db:"created_by"`
	CreatedAt    time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt    time.Time `json:"updatedAt" db:"updated_at"`
}
