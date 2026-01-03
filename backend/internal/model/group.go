package model

import "time"

type MemberRole string

const (
	RoleAdmin  MemberRole = "admin"
	RoleMember MemberRole = "member"
)

type Group struct {
	ID         string    `json:"id" db:"id"`
	Name       string    `json:"name" db:"name"`
	IconURL    *string   `json:"iconUrl,omitempty" db:"icon_url"`
	InviteCode string    `json:"inviteCode" db:"invite_code"`
	CreatedBy  string    `json:"createdBy" db:"created_by"`
	CreatedAt  time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt  time.Time `json:"updatedAt" db:"updated_at"`
}

type GroupMember struct {
	ID       string     `json:"id" db:"id"`
	GroupID  string     `json:"groupId" db:"group_id"`
	UserID   string     `json:"userId" db:"user_id"`
	Role     MemberRole `json:"role" db:"role"`
	JoinedAt time.Time  `json:"joinedAt" db:"joined_at"`
}
