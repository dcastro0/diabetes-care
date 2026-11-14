package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/caio/diabetes-care/backend/internal/middleware"
	"github.com/caio/diabetes-care/backend/internal/model"
	"github.com/caio/diabetes-care/backend/internal/repository"
)

type MeasurementsHandler struct {
	glucoseRepo     *repository.GlucoseRepository
	achievementRepo *repository.AchievementRepository
}

func NewMeasurementsHandler(
	glucoseRepo *repository.GlucoseRepository,
	achievementRepo *repository.AchievementRepository,
) *MeasurementsHandler {
	return &MeasurementsHandler{
		glucoseRepo:     glucoseRepo,
		achievementRepo: achievementRepo,
	}
}

func (h *MeasurementsHandler) Sync(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserIDFromContext(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, "usuário não autenticado")
		return
	}

	var items []model.SyncMeasurementItem
	if err := json.NewDecoder(r.Body).Decode(&items); err != nil {
		writeError(w, http.StatusBadRequest, "payload JSON inválido")
		return
	}

	inserted, err := h.glucoseRepo.BulkInsert(r.Context(), userID, items)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "erro ao sincronizar medições")
		return
	}

	totalOnServer, _ := h.glucoseRepo.CountByUser(r.Context(), userID)

	var unlocked []repository.AchievementWithProgress
	if h.achievementRepo != nil {
		unlocked, _ = h.achievementRepo.EvaluateAndUnlock(r.Context(), userID)
	}

	resp := model.SyncMeasurementsResponse{
		Message:                   "Medições sincronizadas com sucesso!",
		TotalMeasurementsOnServer: totalOnServer,
		InsertedCount:             inserted,
		UnlockedAchievements:      unlocked,
	}

	writeJSON(w, http.StatusOK, resp)
}

func (h *MeasurementsHandler) GetStats(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserIDFromContext(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, "usuário não autenticado")
		return
	}

	daysStr := r.URL.Query().Get("days")
	days := 7
	if d, err := strconv.Atoi(daysStr); err == nil && d > 0 {
		days = d
	}

	useStandard := r.URL.Query().Get("use_standard_target") == "true"

	stats, err := h.glucoseRepo.GetStatsByUser(r.Context(), userID, days, useStandard)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "erro ao calcular estatísticas")
		return
	}

	writeJSON(w, http.StatusOK, stats)
}
