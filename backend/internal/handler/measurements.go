package handler

import (
	"encoding/json"
	"math"
	"net/http"
	"strconv"

	"github.com/caio/diabetes-care/backend/internal/model"
)

type SyncMeasurementItem struct {
	Value float64 `json:"value"`
	Date  string  `json:"date"`
	Note  *string `json:"note"`
}

type SyncMeasurementsResponse struct {
	Message                   string        `json:"message"`
	TotalMeasurementsOnServer int           `json:"total_measurements_on_server"`
	UnlockedAchievements      []interface{} `json:"unlocked_achievements"`
}

type MeasurementsHandler struct{}

func NewMeasurementsHandler() *MeasurementsHandler {
	return &MeasurementsHandler{}
}

func (h *MeasurementsHandler) Sync(w http.ResponseWriter, r *http.Request) {
	var items []SyncMeasurementItem
	if err := json.NewDecoder(r.Body).Decode(&items); err != nil {
		http.Error(w, `{"error":"payload JSON inválido"}`, http.StatusBadRequest)
		return
	}

	resp := SyncMeasurementsResponse{
		Message:                   "Medições sincronizadas com sucesso!",
		TotalMeasurementsOnServer: len(items),
		UnlockedAchievements:      []interface{}{},
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(resp)
}

func (h *MeasurementsHandler) GetStats(w http.ResponseWriter, r *http.Request) {
	daysStr := r.URL.Query().Get("days")
	days := 7
	if d, err := strconv.Atoi(daysStr); err == nil && d > 0 {
		days = d
	}

	// Mock representation / calculated metrics for bootstrap
	avgGlucose := 115.4
	estimatedHbA1c := math.Round(((avgGlucose+46.7)/28.7)*10) / 10

	resp := model.GlucoseStatsResponse{
		TotalReadings:      14,
		AverageGlucose:     avgGlucose,
		EstimatedHbA1c:     estimatedHbA1c,
		TimeInRangePercent: 85.7,
		MinGlucose:         82,
		MaxGlucose:         162,
		DaysPeriod:         days,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(resp)
}
