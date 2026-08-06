package handler

import (
	"encoding/json"
	"net/http"
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
