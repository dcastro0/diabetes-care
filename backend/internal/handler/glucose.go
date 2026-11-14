package handler

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/caio/diabetes-care/backend/internal/middleware"
	"github.com/caio/diabetes-care/backend/internal/model"
	"github.com/caio/diabetes-care/backend/internal/repository"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

type GlucoseHandler struct {
	repo *repository.GlucoseRepository
}

func NewGlucoseHandler(repo *repository.GlucoseRepository) *GlucoseHandler {
	return &GlucoseHandler{repo: repo}
}

func (h *GlucoseHandler) ListLogs(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserIDFromContext(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, "usuário não autenticado")
		return
	}

	logs, err := h.repo.ListByUser(r.Context(), userID, 50)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "erro ao buscar registros de glicose")
		return
	}

	writeJSON(w, http.StatusOK, logs)
}

func (h *GlucoseHandler) CreateLog(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserIDFromContext(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, "usuário não autenticado")
		return
	}

	r.Body = http.MaxBytesReader(w, r.Body, 1<<20)
	var req model.CreateGlucoseRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "payload JSON inválido")
		return
	}

	if req.Value < 20 || req.Value > 600 || req.Context == "" {
		writeError(w, http.StatusBadRequest, "valor da glicemia (20–600 mg/dL) e contexto são obrigatórios")
		return
	}

	if req.MeasuredAt.IsZero() {
		req.MeasuredAt = time.Now()
	}

	log := model.GlucoseLog{
		ID:         uuid.New(),
		UserID:     userID,
		Value:      req.Value,
		Context:    req.Context,
		Notes:      req.Notes,
		MeasuredAt: req.MeasuredAt,
		CreatedAt:  time.Now(),
	}

	if err := h.repo.Create(r.Context(), &log); err != nil {
		writeError(w, http.StatusInternalServerError, "erro ao salvar registro de glicose")
		return
	}

	writeJSON(w, http.StatusCreated, log)
}

func (h *GlucoseHandler) DeleteLog(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserIDFromContext(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, "usuário não autenticado")
		return
	}

	idStr := chi.URLParam(r, "id")
	logID, err := uuid.Parse(idStr)
	if err != nil {
		writeError(w, http.StatusBadRequest, "id do registro inválido")
		return
	}

	if err := h.repo.DeleteByUserAndID(r.Context(), userID, logID); err != nil {
		writeError(w, http.StatusInternalServerError, "erro ao remover registro de glicose")
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"message": "registro removido com sucesso"})
}
