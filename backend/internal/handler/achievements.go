package handler

import (
	"encoding/json"
	"net/http"
)

type AchievementResponse struct {
	AchievementID int     `json:"achievement_id"`
	Code          string  `json:"code"`
	Title         string  `json:"title"`
	Description   string  `json:"description"`
	Icon          *string `json:"icon"`
	Goal          int     `json:"goal"`
	PointsReward  int     `json:"points_reward"`
	Progress      int     `json:"progress"`
	Unlocked      bool    `json:"unlocked"`
	UnlockedAt    *string `json:"unlocked_at"`
	UserID        int     `json:"user_id"`
}

type AchievementsHandler struct{}

func NewAchievementsHandler() *AchievementsHandler {
	return &AchievementsHandler{}
}

func (h *AchievementsHandler) List(w http.ResponseWriter, r *http.Request) {
	achievements := []AchievementResponse{
		{
			AchievementID: 1,
			Code:          "FIRST_LOG",
			Title:         "Primeiro Registro",
			Description:   "Registre sua primeira medição de glicemia",
			Goal:          1,
			PointsReward:  50,
			Progress:      1,
			Unlocked:      true,
		},
		{
			AchievementID: 2,
			Code:          "LOG_STREAK_7",
			Title:         "Semana de Foco",
			Description:   "Registre a glicemia por 7 dias seguidos",
			Goal:          7,
			PointsReward:  200,
			Progress:      1,
			Unlocked:      false,
		},
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(achievements)
}
