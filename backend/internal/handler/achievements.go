package handler

import (
	"net/http"

	"github.com/caio/diabetes-care/backend/internal/middleware"
	"github.com/caio/diabetes-care/backend/internal/repository"
)

type AchievementsHandler struct {
	repo *repository.AchievementRepository
}

func NewAchievementsHandler(repo *repository.AchievementRepository) *AchievementsHandler {
	return &AchievementsHandler{repo: repo}
}

func (h *AchievementsHandler) List(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserIDFromContext(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, "usuário não autenticado")
		return
	}

	if h.repo != nil {
		_, _ = h.repo.EvaluateAndUnlock(r.Context(), userID)
		achievements, err := h.repo.ListWithProgress(r.Context(), userID)
		if err != nil {
			writeError(w, http.StatusInternalServerError, "erro ao listar conquistas")
			return
		}
		writeJSON(w, http.StatusOK, achievements)
		return
	}

	writeJSON(w, http.StatusOK, []repository.AchievementWithProgress{})
}
