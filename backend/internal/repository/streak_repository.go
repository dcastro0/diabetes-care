package repository

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type UserStreak struct {
	UserID         uuid.UUID  `json:"user_id"`
	CurrentStreak  int        `json:"current_streak"`
	MaxStreak      int        `json:"max_streak"`
	LastActiveDate *time.Time `json:"last_active_date"`
	UpdatedAt      time.Time  `json:"updated_at"`
}

type StreakRepository struct {
	db *pgxpool.Pool
}

func NewStreakRepository(db *pgxpool.Pool) *StreakRepository {
	return &StreakRepository{db: db}
}

func (r *StreakRepository) GetOrCreate(ctx context.Context, userID uuid.UUID) (*UserStreak, error) {
	if r.db == nil {
		return &UserStreak{UserID: userID, CurrentStreak: 0, MaxStreak: 0}, nil
	}

	query := `SELECT user_id, current_streak, max_streak, last_active_date, updated_at FROM user_streaks WHERE user_id = $1`

	var s UserStreak
	err := r.db.QueryRow(ctx, query, userID).Scan(&s.UserID, &s.CurrentStreak, &s.MaxStreak, &s.LastActiveDate, &s.UpdatedAt)
	if err != nil {
		if err == pgx.ErrNoRows {
			insertQuery := `
				INSERT INTO user_streaks (user_id, current_streak, max_streak, last_active_date, updated_at)
				VALUES ($1, 0, 0, NULL, $2)
				RETURNING user_id, current_streak, max_streak, last_active_date, updated_at
			`
			err = r.db.QueryRow(ctx, insertQuery, userID, time.Now()).Scan(
				&s.UserID, &s.CurrentStreak, &s.MaxStreak, &s.LastActiveDate, &s.UpdatedAt,
			)
			if err != nil {
				return nil, fmt.Errorf("erro ao criar streak para usuário: %w", err)
			}
			return &s, nil
		}
		return nil, fmt.Errorf("erro ao buscar streak do usuário: %w", err)
	}
	return &s, nil
}

func (r *StreakRepository) RecordActivity(ctx context.Context, userID uuid.UUID, dateStr string) (*UserStreak, error) {
	if r.db == nil {
		return &UserStreak{UserID: userID, CurrentStreak: 1, MaxStreak: 1}, nil
	}

	streak, err := r.GetOrCreate(ctx, userID)
	if err != nil {
		return nil, err
	}

	today, parseErr := time.Parse("2006-01-02", dateStr)
	if parseErr != nil {
		today = time.Now().Truncate(24 * time.Hour)
	}

	if streak.LastActiveDate != nil {
		lastDate := streak.LastActiveDate.Truncate(24 * time.Hour)
		todayTrunc := today.Truncate(24 * time.Hour)

		diff := todayTrunc.Sub(lastDate).Hours() / 24

		if diff == 0 {
			return streak, nil
		} else if diff == 1 {
			streak.CurrentStreak++
		} else {
			streak.CurrentStreak = 1
		}
	} else {
		streak.CurrentStreak = 1
	}

	if streak.CurrentStreak > streak.MaxStreak {
		streak.MaxStreak = streak.CurrentStreak
	}

	updateQuery := `
		UPDATE user_streaks
		SET current_streak = $1, max_streak = $2, last_active_date = $3, updated_at = $4
		WHERE user_id = $5
	`
	_, err = r.db.Exec(ctx, updateQuery, streak.CurrentStreak, streak.MaxStreak, today, time.Now(), userID)
	if err != nil {
		return nil, fmt.Errorf("erro ao atualizar streak: %w", err)
	}

	streak.LastActiveDate = &today
	return streak, nil
}
