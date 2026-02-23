package handler

import (
	"encoding/json"
	"errors"
	"net/http"
	"time"

	"github.com/entaku0818/OurCalendar/backend/internal/middleware"
	"github.com/entaku0818/OurCalendar/backend/internal/model"
	"github.com/entaku0818/OurCalendar/backend/internal/repository"
	"github.com/go-chi/chi/v5"
)

type EventHandler struct {
	eventRepo *repository.EventRepository
	groupRepo *repository.GroupRepository
}

func NewEventHandler(eventRepo *repository.EventRepository, groupRepo *repository.GroupRepository) *EventHandler {
	return &EventHandler{
		eventRepo: eventRepo,
		groupRepo: groupRepo,
	}
}

func (h *EventHandler) ListEvents(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	if userID == "" {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	filter := repository.ListEventsFilter{
		UserID: userID,
	}

	// Parse query parameters
	if groupID := r.URL.Query().Get("groupId"); groupID != "" {
		filter.GroupID = &groupID
	}

	if startDate := r.URL.Query().Get("startDate"); startDate != "" {
		t, err := time.Parse(time.RFC3339, startDate)
		if err == nil {
			filter.StartDate = &t
		}
	}

	if endDate := r.URL.Query().Get("endDate"); endDate != "" {
		t, err := time.Parse(time.RFC3339, endDate)
		if err == nil {
			filter.EndDate = &t
		}
	}

	events, err := h.eventRepo.List(r.Context(), filter)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to get events")
		return
	}

	if events == nil {
		events = []model.Event{}
	}

	writeJSON(w, http.StatusOK, events)
}

func (h *EventHandler) CreateEvent(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	if userID == "" {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	var req model.CreateEventRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.Title == "" {
		writeError(w, http.StatusBadRequest, "title is required")
		return
	}

	startAt, err := time.Parse(time.RFC3339, req.StartAt)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid startAt format, use RFC3339")
		return
	}

	endAt, err := time.Parse(time.RFC3339, req.EndAt)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid endAt format, use RFC3339")
		return
	}

	if endAt.Before(startAt) {
		writeError(w, http.StatusBadRequest, "endAt must be after startAt")
		return
	}

	// If groupId is provided, check if user is member
	if req.GroupID != nil {
		isMember, err := h.groupRepo.IsMember(r.Context(), *req.GroupID, userID)
		if err != nil {
			writeError(w, http.StatusInternalServerError, "failed to check membership")
			return
		}
		if !isMember {
			writeError(w, http.StatusForbidden, "not a member of this group")
			return
		}
	}

	event := &model.Event{
		Title:         req.Title,
		StartAt:       startAt,
		EndAt:         endAt,
		Memo:          req.Memo,
		GroupID:       req.GroupID,
		AssigneeID:    req.AssigneeID,
		IsShared:      req.IsShared,
		IsFromGoogle:  req.IsFromGoogle,
		GoogleEventID: req.GoogleEventID,
		CreatedBy:     userID,
	}

	var dbErr error
	if req.GoogleEventID != nil {
		dbErr = h.eventRepo.UpsertGoogleEvent(r.Context(), event)
	} else {
		dbErr = h.eventRepo.Create(r.Context(), event)
	}
	if dbErr != nil {
		writeError(w, http.StatusInternalServerError, "failed to create event")
		return
	}

	writeJSON(w, http.StatusCreated, event)
}

func (h *EventHandler) GetEvent(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	if userID == "" {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	eventID := chi.URLParam(r, "eventID")

	// Check if user can access this event
	canAccess, err := h.eventRepo.CanUserAccess(r.Context(), eventID, userID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to check access")
		return
	}
	if !canAccess {
		writeError(w, http.StatusForbidden, "no access to this event")
		return
	}

	event, err := h.eventRepo.GetByID(r.Context(), eventID)
	if err != nil {
		if errors.Is(err, repository.ErrEventNotFound) {
			writeError(w, http.StatusNotFound, "event not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "failed to get event")
		return
	}

	writeJSON(w, http.StatusOK, event)
}

func (h *EventHandler) UpdateEvent(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	if userID == "" {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	eventID := chi.URLParam(r, "eventID")

	// Check if user is owner
	isOwner, err := h.eventRepo.IsOwner(r.Context(), eventID, userID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to check ownership")
		return
	}
	if !isOwner {
		writeError(w, http.StatusForbidden, "only event owner can update")
		return
	}

	var req model.UpdateEventRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	event, err := h.eventRepo.GetByID(r.Context(), eventID)
	if err != nil {
		if errors.Is(err, repository.ErrEventNotFound) {
			writeError(w, http.StatusNotFound, "event not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "failed to get event")
		return
	}

	if req.Title != nil {
		event.Title = *req.Title
	}
	if req.StartAt != nil {
		startAt, err := time.Parse(time.RFC3339, *req.StartAt)
		if err != nil {
			writeError(w, http.StatusBadRequest, "invalid startAt format, use RFC3339")
			return
		}
		event.StartAt = startAt
	}
	if req.EndAt != nil {
		endAt, err := time.Parse(time.RFC3339, *req.EndAt)
		if err != nil {
			writeError(w, http.StatusBadRequest, "invalid endAt format, use RFC3339")
			return
		}
		event.EndAt = endAt
	}
	if req.Memo != nil {
		event.Memo = req.Memo
	}
	if req.AssigneeID != nil {
		event.AssigneeID = req.AssigneeID
	}
	if req.IsShared != nil {
		event.IsShared = *req.IsShared
	}

	if event.EndAt.Before(event.StartAt) {
		writeError(w, http.StatusBadRequest, "endAt must be after startAt")
		return
	}

	if err := h.eventRepo.Update(r.Context(), event); err != nil {
		writeError(w, http.StatusInternalServerError, "failed to update event")
		return
	}

	writeJSON(w, http.StatusOK, event)
}

func (h *EventHandler) DeleteEvent(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	if userID == "" {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	eventID := chi.URLParam(r, "eventID")

	// Check if user is owner
	isOwner, err := h.eventRepo.IsOwner(r.Context(), eventID, userID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to check ownership")
		return
	}
	if !isOwner {
		writeError(w, http.StatusForbidden, "only event owner can delete")
		return
	}

	if err := h.eventRepo.Delete(r.Context(), eventID); err != nil {
		if errors.Is(err, repository.ErrEventNotFound) {
			writeError(w, http.StatusNotFound, "event not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "failed to delete event")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
