package repository

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type AchievementWithProgress struct {
	AchievementID string  `json:"achievement_id"`
	Code          string  `json:"code"`
	Title         string  `json:"title"`
	Description   string  `json:"description"`
	IconName      string  `json:"icon"`
	Goal          int     `json:"goal"`
	Progress      int     `json:"progress"`
	Unlocked      bool    `json:"unlocked"`
	UnlockedAt    *string `json:"unlocked_at"`
}

type AchievementRepository struct {
	db *pgxpool.Pool
}

func NewAchievementRepository(db *pgxpool.Pool) *AchievementRepository {
	return &AchievementRepository{db: db}
}

func (r *AchievementRepository) ListWithProgress(ctx context.Context, userID uuid.UUID) ([]AchievementWithProgress, error) {
	if r.db == nil {
		return []AchievementWithProgress{}, nil
	}

	var totalLogs int
	_ = r.db.QueryRow(ctx, `SELECT COUNT(*) FROM glucose_logs WHERE user_id = $1`, userID).Scan(&totalLogs)

	var currentStreak, maxStreak int
	_ = r.db.QueryRow(ctx,
		`SELECT COALESCE(current_streak, 0), COALESCE(max_streak, 0) FROM user_streaks WHERE user_id = $1`,
		userID,
	).Scan(&currentStreak, &maxStreak)
	bestStreak := maxStreak
	if currentStreak > bestStreak {
		bestStreak = currentStreak
	}

	var total7d int
	var tir7d float64
	_ = r.db.QueryRow(ctx, `
		SELECT
			COUNT(*),
			COALESCE(SUM(CASE WHEN value BETWEEN COALESCE(u.target_glucose_min, 70) AND COALESCE(u.target_glucose_max, 180) THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0), 0)
		FROM glucose_logs g
		JOIN users u ON u.id = g.user_id
		WHERE g.user_id = $1 AND g.measured_at >= NOW() - INTERVAL '7 days'
	`, userID).Scan(&total7d, &tir7d)

	query := `
		SELECT
			a.id::text,
			a.code,
			a.title,
			a.description,
			a.icon_name,
			a.goal,
			(ua.user_id IS NOT NULL) AS unlocked,
			CASE WHEN ua.unlocked_at IS NOT NULL THEN to_char(ua.unlocked_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') ELSE NULL END AS unlocked_at
		FROM achievements a
		LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = $1
		ORDER BY a.goal ASC, a.code ASC
	`

	rows, err := r.db.Query(ctx, query, userID)
	if err != nil {
		return nil, fmt.Errorf("erro ao listar conquistas: %w", err)
	}
	defer rows.Close()

	var achievements []AchievementWithProgress
	for rows.Next() {
		var a AchievementWithProgress
		if err := rows.Scan(&a.AchievementID, &a.Code, &a.Title, &a.Description, &a.IconName, &a.Goal, &a.Unlocked, &a.UnlockedAt); err != nil {
			return nil, fmt.Errorf("erro ao escanear conquista: %w", err)
		}

		if a.Unlocked {
			a.Progress = a.Goal
		} else {
			switch a.Code {
			case "FIRST_LOG", "TOTAL_50", "TOTAL_100":
				a.Progress = totalLogs
			case "LOG_STREAK_7", "LOG_STREAK_30":
				a.Progress = bestStreak
			case "TIR_80":
				if total7d >= 5 && tir7d >= 80.0 {
					a.Progress = 1
				} else {
					a.Progress = 0
				}
			default:
				a.Progress = totalLogs
			}
			if a.Progress > a.Goal {
				a.Progress = a.Goal
			}
		}

		achievements = append(achievements, a)
	}

	if achievements == nil {
		achievements = []AchievementWithProgress{}
	}

	return achievements, nil
}

func (r *AchievementRepository) EvaluateAndUnlock(ctx context.Context, userID uuid.UUID) ([]AchievementWithProgress, error) {
	if r.db == nil {
		return []AchievementWithProgress{}, nil
	}

	list, err := r.ListWithProgress(ctx, userID)
	if err != nil {
		return nil, err
	}

	var newlyUnlocked []AchievementWithProgress
	for _, a := range list {
		if !a.Unlocked && a.Progress >= a.Goal {
			aid, parseErr := uuid.Parse(a.AchievementID)
			if parseErr != nil {
				continue
			}
			if unlockErr := r.Unlock(ctx, userID, aid); unlockErr == nil {
				a.Unlocked = true
				newlyUnlocked = append(newlyUnlocked, a)
			}
		}
	}

	if newlyUnlocked == nil {
		newlyUnlocked = []AchievementWithProgress{}
	}
	return newlyUnlocked, nil
}

func (r *AchievementRepository) Unlock(ctx context.Context, userID uuid.UUID, achievementID uuid.UUID) error {
	if r.db == nil {
		return nil
	}

	query := `
		INSERT INTO user_achievements (user_id, achievement_id)
		VALUES ($1, $2)
		ON CONFLICT (user_id, achievement_id) DO NOTHING
	`
	_, err := r.db.Exec(ctx, query, userID, achievementID)
	if err != nil {
		return fmt.Errorf("erro ao desbloquear conquista: %w", err)
	}
	return nil
}
