package repository

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"time"

	"github.com/entaku0818/OurCalendar/backend/internal/model"
	"github.com/jackc/pgx/v5"
)

var (
	ErrGroupNotFound  = errors.New("group not found")
	ErrMemberNotFound = errors.New("member not found")
	ErrAlreadyMember  = errors.New("already a member of this group")
)

type GroupRepository struct {
	db *DB
}

func NewGroupRepository(db *DB) *GroupRepository {
	return &GroupRepository{db: db}
}

func (r *GroupRepository) GetByID(ctx context.Context, id string) (*model.Group, error) {
	var group model.Group
	err := r.db.Pool.QueryRow(ctx, `
		SELECT id, name, icon_url, invite_code, created_by, created_at, updated_at
		FROM groups
		WHERE id = $1
	`, id).Scan(
		&group.ID, &group.Name, &group.IconURL, &group.InviteCode,
		&group.CreatedBy, &group.CreatedAt, &group.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrGroupNotFound
		}
		return nil, err
	}

	return &group, nil
}

func (r *GroupRepository) GetByInviteCode(ctx context.Context, inviteCode string) (*model.Group, error) {
	var group model.Group
	err := r.db.Pool.QueryRow(ctx, `
		SELECT id, name, icon_url, invite_code, created_by, created_at, updated_at
		FROM groups
		WHERE invite_code = $1
	`, inviteCode).Scan(
		&group.ID, &group.Name, &group.IconURL, &group.InviteCode,
		&group.CreatedBy, &group.CreatedAt, &group.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrGroupNotFound
		}
		return nil, err
	}

	return &group, nil
}

func (r *GroupRepository) ListByUserID(ctx context.Context, userID string) ([]model.Group, error) {
	rows, err := r.db.Pool.Query(ctx, `
		SELECT g.id, g.name, g.icon_url, g.invite_code, g.created_by, g.created_at, g.updated_at
		FROM groups g
		INNER JOIN group_members gm ON g.id = gm.group_id
		WHERE gm.user_id = $1
		ORDER BY g.created_at DESC
	`, userID)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var groups []model.Group
	for rows.Next() {
		var group model.Group
		if err := rows.Scan(
			&group.ID, &group.Name, &group.IconURL, &group.InviteCode,
			&group.CreatedBy, &group.CreatedAt, &group.UpdatedAt,
		); err != nil {
			return nil, err
		}
		groups = append(groups, group)
	}

	return groups, nil
}

func (r *GroupRepository) Create(ctx context.Context, group *model.Group) error {
	now := time.Now()
	inviteCode, err := generateInviteCode()
	if err != nil {
		return err
	}

	return r.db.Pool.QueryRow(ctx, `
		INSERT INTO groups (name, icon_url, invite_code, created_by, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id
	`,
		group.Name, group.IconURL, inviteCode, group.CreatedBy, now, now,
	).Scan(&group.ID)
}

func (r *GroupRepository) Update(ctx context.Context, group *model.Group) error {
	group.UpdatedAt = time.Now()
	_, err := r.db.Pool.Exec(ctx, `
		UPDATE groups
		SET name = $1, icon_url = $2, updated_at = $3
		WHERE id = $4
	`, group.Name, group.IconURL, group.UpdatedAt, group.ID)

	return err
}

func (r *GroupRepository) Delete(ctx context.Context, id string) error {
	_, err := r.db.Pool.Exec(ctx, `DELETE FROM groups WHERE id = $1`, id)
	return err
}

func (r *GroupRepository) AddMember(ctx context.Context, groupID, userID string, role model.MemberRole) error {
	now := time.Now()
	_, err := r.db.Pool.Exec(ctx, `
		INSERT INTO group_members (group_id, user_id, role, joined_at)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (group_id, user_id) DO NOTHING
	`, groupID, userID, role, now)

	return err
}

func (r *GroupRepository) RemoveMember(ctx context.Context, groupID, userID string) error {
	result, err := r.db.Pool.Exec(ctx, `
		DELETE FROM group_members
		WHERE group_id = $1 AND user_id = $2
	`, groupID, userID)

	if err != nil {
		return err
	}

	if result.RowsAffected() == 0 {
		return ErrMemberNotFound
	}

	return nil
}

func (r *GroupRepository) GetMember(ctx context.Context, groupID, userID string) (*model.GroupMember, error) {
	var member model.GroupMember
	err := r.db.Pool.QueryRow(ctx, `
		SELECT id, group_id, user_id, role, joined_at
		FROM group_members
		WHERE group_id = $1 AND user_id = $2
	`, groupID, userID).Scan(
		&member.ID, &member.GroupID, &member.UserID, &member.Role, &member.JoinedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrMemberNotFound
		}
		return nil, err
	}

	return &member, nil
}

func (r *GroupRepository) ListMembers(ctx context.Context, groupID string) ([]model.GroupMemberWithUser, error) {
	rows, err := r.db.Pool.Query(ctx, `
		SELECT gm.id, gm.group_id, gm.user_id, gm.role, gm.joined_at,
		       u.id, u.name, u.email, u.avatar_url
		FROM group_members gm
		INNER JOIN users u ON gm.user_id = u.id
		WHERE gm.group_id = $1
		ORDER BY gm.joined_at ASC
	`, groupID)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var members []model.GroupMemberWithUser
	for rows.Next() {
		var member model.GroupMemberWithUser
		var user model.User
		if err := rows.Scan(
			&member.ID, &member.GroupID, &member.UserID, &member.Role, &member.JoinedAt,
			&user.ID, &user.Name, &user.Email, &user.AvatarURL,
		); err != nil {
			return nil, err
		}
		member.User = &user
		members = append(members, member)
	}

	return members, nil
}

func (r *GroupRepository) IsMember(ctx context.Context, groupID, userID string) (bool, error) {
	var exists bool
	err := r.db.Pool.QueryRow(ctx, `
		SELECT EXISTS(
			SELECT 1 FROM group_members WHERE group_id = $1 AND user_id = $2
		)
	`, groupID, userID).Scan(&exists)

	return exists, err
}

func (r *GroupRepository) IsAdmin(ctx context.Context, groupID, userID string) (bool, error) {
	var exists bool
	err := r.db.Pool.QueryRow(ctx, `
		SELECT EXISTS(
			SELECT 1 FROM group_members WHERE group_id = $1 AND user_id = $2 AND role = 'admin'
		)
	`, groupID, userID).Scan(&exists)

	return exists, err
}

func generateInviteCode() (string, error) {
	bytes := make([]byte, 3)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}
