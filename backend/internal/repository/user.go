package repository

import (
	"context"
	"errors"
	"time"

	"github.com/entaku0818/OurCalendar/backend/internal/model"
	"github.com/jackc/pgx/v5"
)

var ErrUserNotFound = errors.New("user not found")

type UserRepository struct {
	db *DB
}

func NewUserRepository(db *DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) GetByID(ctx context.Context, id string) (*model.User, error) {
	var user model.User
	err := r.db.Pool.QueryRow(ctx, `
		SELECT id, name, email, avatar_url, google_id, line_id, created_at, updated_at
		FROM users
		WHERE id = $1
	`, id).Scan(
		&user.ID, &user.Name, &user.Email, &user.AvatarURL,
		&user.GoogleID, &user.LineID, &user.CreatedAt, &user.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrUserNotFound
		}
		return nil, err
	}

	return &user, nil
}

func (r *UserRepository) GetByGoogleID(ctx context.Context, googleID string) (*model.User, error) {
	var user model.User
	err := r.db.Pool.QueryRow(ctx, `
		SELECT id, name, email, avatar_url, google_id, line_id, created_at, updated_at
		FROM users
		WHERE google_id = $1
	`, googleID).Scan(
		&user.ID, &user.Name, &user.Email, &user.AvatarURL,
		&user.GoogleID, &user.LineID, &user.CreatedAt, &user.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrUserNotFound
		}
		return nil, err
	}

	return &user, nil
}

func (r *UserRepository) GetByEmail(ctx context.Context, email string) (*model.User, error) {
	var user model.User
	err := r.db.Pool.QueryRow(ctx, `
		SELECT id, name, email, avatar_url, google_id, line_id, created_at, updated_at
		FROM users
		WHERE email = $1
	`, email).Scan(
		&user.ID, &user.Name, &user.Email, &user.AvatarURL,
		&user.GoogleID, &user.LineID, &user.CreatedAt, &user.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrUserNotFound
		}
		return nil, err
	}

	return &user, nil
}

func (r *UserRepository) Create(ctx context.Context, user *model.User) error {
	now := time.Now()
	return r.db.Pool.QueryRow(ctx, `
		INSERT INTO users (name, email, avatar_url, google_id, line_id, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id
	`,
		user.Name, user.Email, user.AvatarURL, user.GoogleID, user.LineID, now, now,
	).Scan(&user.ID)
}

func (r *UserRepository) Update(ctx context.Context, user *model.User) error {
	user.UpdatedAt = time.Now()
	_, err := r.db.Pool.Exec(ctx, `
		UPDATE users
		SET name = $1, avatar_url = $2, updated_at = $3
		WHERE id = $4
	`, user.Name, user.AvatarURL, user.UpdatedAt, user.ID)

	return err
}

func (r *UserRepository) UpsertByGoogleID(ctx context.Context, user *model.User) error {
	now := time.Now()
	return r.db.Pool.QueryRow(ctx, `
		INSERT INTO users (name, email, avatar_url, google_id, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6)
		ON CONFLICT (google_id) DO UPDATE
		SET name = EXCLUDED.name, avatar_url = EXCLUDED.avatar_url, updated_at = EXCLUDED.updated_at
		RETURNING id, created_at, updated_at
	`,
		user.Name, user.Email, user.AvatarURL, user.GoogleID, now, now,
	).Scan(&user.ID, &user.CreatedAt, &user.UpdatedAt)
}
