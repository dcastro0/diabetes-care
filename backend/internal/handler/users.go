package handler

import (
	"encoding/json"
	"net/http"

	"github.com/caio/diabetes-care/backend/internal/middleware"
	"github.com/caio/diabetes-care/backend/internal/model"
	"github.com/caio/diabetes-care/backend/internal/repository"
)

type UsersHandler struct {
	userRepo *repository.UserRepository
}

func NewUsersHandler(userRepo *repository.UserRepository) *UsersHandler {
	return &UsersHandler{userRepo: userRepo}
}

func (h *UsersHandler) GetMe(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserIDFromContext(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, "usuário não autenticado")
		return
	}

	user, err := h.userRepo.GetByID(r.Context(), userID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "erro ao buscar perfil do usuário")
		return
	}
	if user == nil {
		writeError(w, http.StatusNotFound, "usuário não encontrado")
		return
	}

	writeJSON(w, http.StatusOK, user)
}

func (h *UsersHandler) UpdateMe(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserIDFromContext(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, "usuário não autenticado")
		return
	}

	r.Body = http.MaxBytesReader(w, r.Body, 1<<20)
	var req model.UpdateProfileRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "payload JSON inválido")
		return
	}

	if (req.TargetGlucoseMin > 0 || req.TargetGlucoseMax > 0) &&
		(req.TargetGlucoseMin < 40 || req.TargetGlucoseMax > 400 || req.TargetGlucoseMin >= req.TargetGlucoseMax) {
		writeError(w, http.StatusBadRequest, "faixa de meta glicêmica inválida (40 <= min < max <= 400)")
		return
	}

	updated, err := h.userRepo.UpdateProfile(r.Context(), userID, req)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "erro ao atualizar perfil do usuário")
		return
	}

	writeJSON(w, http.StatusOK, updated)
}
