package handler

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/caio/diabetes-care/backend/internal/middleware"
	"github.com/caio/diabetes-care/backend/internal/model"
	"github.com/google/uuid"
)

type GlucoseHandler struct{}

func NewGlucoseHandler() *GlucoseHandler {
	return &GlucoseHandler{}
}

func (h *GlucoseHandler) ListLogs(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserIDFromContext(r.Context())
	if !ok {
		http.Error(w, `{"error":"usuário não autenticado"}`, http.StatusUnauthorized)
		return
	}

	// Mock representation for bootstrap
	logs := []model.GlucoseLog{
		{
			ID:         uuid.New(),
			UserID:     userID,
			Value:      110,
			Context:    "jejum",
			Notes:      "Medição matinal",
			MeasuredAt: time.Now().Add(-2 * time.Hour),
			CreatedAt:  time.Now().Add(-2 * time.Hour),
		},
		{
			ID:         uuid.New(),
			UserID:     userID,
			Value:      145,
			Context:    "pos_refeicao",
			Notes:      "Almoço com carboidrato controlado",
			MeasuredAt: time.Now().Add(-6 * time.Hour),
			CreatedAt:  time.Now().Add(-6 * time.Hour),
		},
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(logs)
}

func (h *GlucoseHandler) CreateLog(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserIDFromContext(r.Context())
	if !ok {
		http.Error(w, `{"error":"usuário não autenticado"}`, http.StatusUnauthorized)
		return
	}

	var req model.CreateGlucoseRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"payload JSON inválido"}`, http.StatusBadRequest)
		return
	}

	if req.Value <= 0 || req.Context == "" {
		http.Error(w, `{"error":"valor da glicemia e contexto são obrigatórios"}`, http.StatusBadRequest)
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

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(log)
}
