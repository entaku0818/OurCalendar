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

// GroupWithMembers is a group with its members
type GroupWithMembers struct {
	Group   `json:"group"`
	Members []GroupMemberWithUser `json:"members"`
}

// GroupMemberWithUser is a group member with user information
type GroupMemberWithUser struct {
	GroupMember
	User *User `json:"user,omitempty"`
}

// CreateGroupRequest is the request body for creating a group
type CreateGroupRequest struct {
	Name    string  `json:"name" validate:"required"`
	IconURL *string `json:"iconUrl,omitempty"`
}

// UpdateGroupRequest is the request body for updating a group
type UpdateGroupRequest struct {
	Name    *string `json:"name,omitempty"`
	IconURL *string `json:"iconUrl,omitempty"`
}

// JoinGroupRequest is the request body for joining a group
type JoinGroupRequest struct {
	InviteCode string `json:"inviteCode" validate:"required"`
}
