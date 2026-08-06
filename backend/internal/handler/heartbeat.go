package handler

import (
	"encoding/json"
	"net/http"
	"time"
)

type HeartbeatRequest struct {
	LocalDate string `json:"local_date"`
}

type HeartbeatResponse struct {
	StreakCount          int           `json:"streak_count"`
	LastActiveDate       string        `json:"last_active_date"`
	Pontos               int           `json:"pontos"`
	TotalMedicoes        int           `json:"total_medicoes"`
	UnlockedAchievements []interface{} `json:"unlocked_achievements"`
}

type HeartbeatHandler struct{}

func NewHeartbeatHandler() *HeartbeatHandler {
	return &HeartbeatHandler{}
}

func (h *HeartbeatHandler) Heartbeat(w http.ResponseWriter, r *http.Request) {
	var req HeartbeatRequest
	_ = json.NewDecoder(r.Body).Decode(&req)

	today := req.LocalDate
	if today == "" {
		today = time.Now().Format("2006-01-02")
	}

	resp := HeartbeatResponse{
		StreakCount:          1,
		LastActiveDate:       today,
		Pontos:               100,
		TotalMedicoes:        0,
		UnlockedAchievements: []interface{}{},
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(resp)
}
