package handler

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/entaku0818/OurCalendar/backend/internal/middleware"
	"github.com/entaku0818/OurCalendar/backend/internal/model"
	"github.com/entaku0818/OurCalendar/backend/internal/repository"
	"github.com/go-chi/chi/v5"
)

type GroupHandler struct {
	groupRepo *repository.GroupRepository
}

func NewGroupHandler(groupRepo *repository.GroupRepository) *GroupHandler {
	return &GroupHandler{groupRepo: groupRepo}
}

func (h *GroupHandler) ListGroups(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	if userID == "" {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	groups, err := h.groupRepo.ListByUserID(r.Context(), userID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to get groups")
		return
	}

	if groups == nil {
		groups = []model.Group{}
	}

	writeJSON(w, http.StatusOK, groups)
}

func (h *GroupHandler) CreateGroup(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	if userID == "" {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	var req model.CreateGroupRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.Name == "" {
		writeError(w, http.StatusBadRequest, "name is required")
		return
	}

	group := &model.Group{
		Name:      req.Name,
		IconURL:   req.IconURL,
		CreatedBy: userID,
	}

	if err := h.groupRepo.Create(r.Context(), group); err != nil {
		writeError(w, http.StatusInternalServerError, "failed to create group")
		return
	}

	// Add creator as admin member
	if err := h.groupRepo.AddMember(r.Context(), group.ID, userID, model.RoleAdmin); err != nil {
		writeError(w, http.StatusInternalServerError, "failed to add member")
		return
	}

	writeJSON(w, http.StatusCreated, group)
}

func (h *GroupHandler) GetGroup(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	if userID == "" {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	groupID := chi.URLParam(r, "groupID")

	// Check if user is member
	isMember, err := h.groupRepo.IsMember(r.Context(), groupID, userID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to check membership")
		return
	}
	if !isMember {
		writeError(w, http.StatusForbidden, "not a member of this group")
		return
	}

	group, err := h.groupRepo.GetByID(r.Context(), groupID)
	if err != nil {
		if errors.Is(err, repository.ErrGroupNotFound) {
			writeError(w, http.StatusNotFound, "group not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "failed to get group")
		return
	}

	members, err := h.groupRepo.ListMembers(r.Context(), groupID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to get members")
		return
	}

	response := model.GroupWithMembers{
		Group:   *group,
		Members: members,
	}

	writeJSON(w, http.StatusOK, response)
}

func (h *GroupHandler) UpdateGroup(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	if userID == "" {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	groupID := chi.URLParam(r, "groupID")

	// Check if user is admin
	isAdmin, err := h.groupRepo.IsAdmin(r.Context(), groupID, userID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to check admin status")
		return
	}
	if !isAdmin {
		writeError(w, http.StatusForbidden, "admin access required")
		return
	}

	var req model.UpdateGroupRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	group, err := h.groupRepo.GetByID(r.Context(), groupID)
	if err != nil {
		if errors.Is(err, repository.ErrGroupNotFound) {
			writeError(w, http.StatusNotFound, "group not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "failed to get group")
		return
	}

	if req.Name != nil {
		group.Name = *req.Name
	}
	if req.IconURL != nil {
		group.IconURL = req.IconURL
	}

	if err := h.groupRepo.Update(r.Context(), group); err != nil {
		writeError(w, http.StatusInternalServerError, "failed to update group")
		return
	}

	writeJSON(w, http.StatusOK, group)
}

func (h *GroupHandler) DeleteGroup(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	if userID == "" {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	groupID := chi.URLParam(r, "groupID")

	// Check if user is admin
	isAdmin, err := h.groupRepo.IsAdmin(r.Context(), groupID, userID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to check admin status")
		return
	}
	if !isAdmin {
		writeError(w, http.StatusForbidden, "admin access required")
		return
	}

	if err := h.groupRepo.Delete(r.Context(), groupID); err != nil {
		writeError(w, http.StatusInternalServerError, "failed to delete group")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *GroupHandler) JoinGroup(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	if userID == "" {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	var req model.JoinGroupRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.InviteCode == "" {
		writeError(w, http.StatusBadRequest, "inviteCode is required")
		return
	}

	group, err := h.groupRepo.GetByInviteCode(r.Context(), req.InviteCode)
	if err != nil {
		if errors.Is(err, repository.ErrGroupNotFound) {
			writeError(w, http.StatusNotFound, "invalid invite code")
			return
		}
		writeError(w, http.StatusInternalServerError, "failed to find group")
		return
	}

	// Check if already member
	isMember, err := h.groupRepo.IsMember(r.Context(), group.ID, userID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to check membership")
		return
	}
	if isMember {
		writeError(w, http.StatusConflict, "already a member of this group")
		return
	}

	if err := h.groupRepo.AddMember(r.Context(), group.ID, userID, model.RoleMember); err != nil {
		writeError(w, http.StatusInternalServerError, "failed to join group")
		return
	}

	writeJSON(w, http.StatusOK, group)
}

func (h *GroupHandler) LeaveGroup(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	if userID == "" {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	groupID := chi.URLParam(r, "groupID")

	// Check if user is the only admin
	isAdmin, err := h.groupRepo.IsAdmin(r.Context(), groupID, userID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to check admin status")
		return
	}

	if isAdmin {
		// Get all members to check if there are other admins
		members, err := h.groupRepo.ListMembers(r.Context(), groupID)
		if err != nil {
			writeError(w, http.StatusInternalServerError, "failed to get members")
			return
		}

		adminCount := 0
		for _, m := range members {
			if m.Role == model.RoleAdmin {
				adminCount++
			}
		}

		if adminCount == 1 && len(members) > 1 {
			writeError(w, http.StatusBadRequest, "cannot leave group as the only admin, transfer ownership first")
			return
		}
	}

	if err := h.groupRepo.RemoveMember(r.Context(), groupID, userID); err != nil {
		if errors.Is(err, repository.ErrMemberNotFound) {
			writeError(w, http.StatusNotFound, "not a member of this group")
			return
		}
		writeError(w, http.StatusInternalServerError, "failed to leave group")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *GroupHandler) RemoveMember(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	if userID == "" {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	groupID := chi.URLParam(r, "groupID")
	targetUserID := chi.URLParam(r, "userID")

	// Check if user is admin
	isAdmin, err := h.groupRepo.IsAdmin(r.Context(), groupID, userID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to check admin status")
		return
	}
	if !isAdmin {
		writeError(w, http.StatusForbidden, "admin access required")
		return
	}

	// Cannot remove yourself with this endpoint
	if targetUserID == userID {
		writeError(w, http.StatusBadRequest, "use leave endpoint to remove yourself")
		return
	}

	if err := h.groupRepo.RemoveMember(r.Context(), groupID, targetUserID); err != nil {
		if errors.Is(err, repository.ErrMemberNotFound) {
			writeError(w, http.StatusNotFound, "member not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "failed to remove member")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
