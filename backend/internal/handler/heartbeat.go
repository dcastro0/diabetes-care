package handler

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/caio/diabetes-care/backend/internal/middleware"
	"github.com/caio/diabetes-care/backend/internal/repository"
)

type HeartbeatRequest struct {
	LocalDate string `json:"local_date"`
}

type HeartbeatResponse struct {
	StreakCount          int                                  `json:"streak_count"`
	LastActiveDate       string                               `json:"last_active_date"`
	Pontos               int                                  `json:"pontos"`
	TotalMedicoes        int                                  `json:"total_medicoes"`
	UnlockedAchievements []repository.AchievementWithProgress `json:"unlocked_achievements"`
}

type HeartbeatHandler struct {
	streakRepo      *repository.StreakRepository
	glucoseRepo     *repository.GlucoseRepository
	achievementRepo *repository.AchievementRepository
}

func NewHeartbeatHandler(
	streakRepo *repository.StreakRepository,
	glucoseRepo *repository.GlucoseRepository,
	achievementRepo *repository.AchievementRepository,
) *HeartbeatHandler {
	return &HeartbeatHandler{
		streakRepo:      streakRepo,
		glucoseRepo:     glucoseRepo,
		achievementRepo: achievementRepo,
	}
}

func (h *HeartbeatHandler) Heartbeat(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserIDFromContext(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, "usuário não autenticado")
		return
	}

	var req HeartbeatRequest
	_ = json.NewDecoder(r.Body).Decode(&req)

	today := req.LocalDate
	if today == "" {
		today = time.Now().Format("2006-01-02")
	}

	streakCount := 1
	lastActive := today
	if h.streakRepo != nil {
		streak, err := h.streakRepo.RecordActivity(r.Context(), userID, today)
		if err == nil && streak != nil {
			streakCount = streak.CurrentStreak
			if streak.LastActiveDate != nil {
				lastActive = streak.LastActiveDate.Format("2006-01-02")
			}
		}
	}

	totalMedicoes := 0
	if h.glucoseRepo != nil {
		if count, err := h.glucoseRepo.CountByUser(r.Context(), userID); err == nil {
			totalMedicoes = count
		}
	}

	unlocked := []repository.AchievementWithProgress{}
	if h.achievementRepo != nil {
		if newly, err := h.achievementRepo.EvaluateAndUnlock(r.Context(), userID); err == nil {
			unlocked = newly
		}
	}

	pontos := totalMedicoes*10 + streakCount*20

	resp := HeartbeatResponse{
		StreakCount:          streakCount,
		LastActiveDate:       lastActive,
		Pontos:               pontos,
		TotalMedicoes:        totalMedicoes,
		UnlockedAchievements: unlocked,
	}

	writeJSON(w, http.StatusOK, resp)
}
