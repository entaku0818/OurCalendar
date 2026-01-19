package repository

import (
	"context"
	"errors"
	"time"

	"github.com/entaku0818/OurCalendar/backend/internal/model"
	"github.com/jackc/pgx/v5"
)

var ErrEventNotFound = errors.New("event not found")

type EventRepository struct {
	db *DB
}

func NewEventRepository(db *DB) *EventRepository {
	return &EventRepository{db: db}
}

func (r *EventRepository) GetByID(ctx context.Context, id string) (*model.Event, error) {
	var event model.Event
	err := r.db.Pool.QueryRow(ctx, `
		SELECT id, group_id, title, start_at, end_at, assignee_id, memo,
		       is_from_google, is_shared, google_event_id, created_by, created_at, updated_at
		FROM events
		WHERE id = $1
	`, id).Scan(
		&event.ID, &event.GroupID, &event.Title, &event.StartAt, &event.EndAt,
		&event.AssigneeID, &event.Memo, &event.IsFromGoogle, &event.IsShared,
		&event.GoogleEventID, &event.CreatedBy, &event.CreatedAt, &event.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrEventNotFound
		}
		return nil, err
	}

	return &event, nil
}

type ListEventsFilter struct {
	UserID    string
	GroupID   *string
	StartDate *time.Time
	EndDate   *time.Time
}

func (r *EventRepository) List(ctx context.Context, filter ListEventsFilter) ([]model.Event, error) {
	query := `
		SELECT DISTINCT e.id, e.group_id, e.title, e.start_at, e.end_at, e.assignee_id, e.memo,
		       e.is_from_google, e.is_shared, e.google_event_id, e.created_by, e.created_at, e.updated_at
		FROM events e
		LEFT JOIN groups g ON e.group_id = g.id
		LEFT JOIN group_members gm ON g.id = gm.group_id
		WHERE (e.created_by = $1 OR gm.user_id = $1)
	`
	args := []interface{}{filter.UserID}
	argNum := 2

	if filter.GroupID != nil {
		query += ` AND e.group_id = $` + string(rune('0'+argNum))
		args = append(args, *filter.GroupID)
		argNum++
	}

	if filter.StartDate != nil {
		query += ` AND e.start_at >= $` + string(rune('0'+argNum))
		args = append(args, *filter.StartDate)
		argNum++
	}

	if filter.EndDate != nil {
		query += ` AND e.end_at <= $` + string(rune('0'+argNum))
		args = append(args, *filter.EndDate)
		argNum++
	}

	query += ` ORDER BY e.start_at ASC`

	rows, err := r.db.Pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var events []model.Event
	for rows.Next() {
		var event model.Event
		if err := rows.Scan(
			&event.ID, &event.GroupID, &event.Title, &event.StartAt, &event.EndAt,
			&event.AssigneeID, &event.Memo, &event.IsFromGoogle, &event.IsShared,
			&event.GoogleEventID, &event.CreatedBy, &event.CreatedAt, &event.UpdatedAt,
		); err != nil {
			return nil, err
		}
		events = append(events, event)
	}

	return events, nil
}

func (r *EventRepository) Create(ctx context.Context, event *model.Event) error {
	now := time.Now()
	return r.db.Pool.QueryRow(ctx, `
		INSERT INTO events (group_id, title, start_at, end_at, assignee_id, memo,
		                    is_from_google, is_shared, google_event_id, created_by, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
		RETURNING id
	`,
		event.GroupID, event.Title, event.StartAt, event.EndAt, event.AssigneeID, event.Memo,
		event.IsFromGoogle, event.IsShared, event.GoogleEventID, event.CreatedBy, now, now,
	).Scan(&event.ID)
}

func (r *EventRepository) Update(ctx context.Context, event *model.Event) error {
	event.UpdatedAt = time.Now()
	_, err := r.db.Pool.Exec(ctx, `
		UPDATE events
		SET title = $1, start_at = $2, end_at = $3, assignee_id = $4, memo = $5,
		    is_shared = $6, updated_at = $7
		WHERE id = $8
	`, event.Title, event.StartAt, event.EndAt, event.AssigneeID, event.Memo,
		event.IsShared, event.UpdatedAt, event.ID)

	return err
}

func (r *EventRepository) Delete(ctx context.Context, id string) error {
	result, err := r.db.Pool.Exec(ctx, `DELETE FROM events WHERE id = $1`, id)
	if err != nil {
		return err
	}

	if result.RowsAffected() == 0 {
		return ErrEventNotFound
	}

	return nil
}

func (r *EventRepository) CanUserAccess(ctx context.Context, eventID, userID string) (bool, error) {
	var canAccess bool
	err := r.db.Pool.QueryRow(ctx, `
		SELECT EXISTS(
			SELECT 1 FROM events e
			LEFT JOIN group_members gm ON e.group_id = gm.group_id
			WHERE e.id = $1 AND (e.created_by = $2 OR gm.user_id = $2)
		)
	`, eventID, userID).Scan(&canAccess)

	return canAccess, err
}

func (r *EventRepository) IsOwner(ctx context.Context, eventID, userID string) (bool, error) {
	var isOwner bool
	err := r.db.Pool.QueryRow(ctx, `
		SELECT EXISTS(
			SELECT 1 FROM events WHERE id = $1 AND created_by = $2
		)
	`, eventID, userID).Scan(&isOwner)

	return isOwner, err
}
