package repository

import (
	"context"
	"fmt"
	"math"
	"time"

	"github.com/caio/diabetes-care/backend/internal/model"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type GlucoseRepository struct {
	db *pgxpool.Pool
}

func NewGlucoseRepository(db *pgxpool.Pool) *GlucoseRepository {
	return &GlucoseRepository{db: db}
}

func (r *GlucoseRepository) Create(ctx context.Context, log *model.GlucoseLog) error {
	if r.db == nil {
		return fmt.Errorf("banco de dados não conectado")
	}

	query := `
		INSERT INTO glucose_logs (id, user_id, value, context, notes, measured_at, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`
	_, err := r.db.Exec(ctx, query,
		log.ID, log.UserID, log.Value, log.Context, log.Notes, log.MeasuredAt, log.CreatedAt,
	)
	if err != nil {
		return fmt.Errorf("erro ao inserir registro de glicose: %w", err)
	}
	return nil
}

func (r *GlucoseRepository) ListByUser(ctx context.Context, userID uuid.UUID, limit int) ([]model.GlucoseLog, error) {
	if r.db == nil {
		return []model.GlucoseLog{}, nil
	}

	query := `
		SELECT id, user_id, value, context, COALESCE(notes, ''), measured_at, created_at
		FROM glucose_logs
		WHERE user_id = $1
		ORDER BY measured_at DESC
		LIMIT $2
	`
	rows, err := r.db.Query(ctx, query, userID, limit)
	if err != nil {
		return nil, fmt.Errorf("erro ao listar registros de glicose: %w", err)
	}
	defer rows.Close()

	var logs []model.GlucoseLog
	for rows.Next() {
		var log model.GlucoseLog
		if err := rows.Scan(&log.ID, &log.UserID, &log.Value, &log.Context, &log.Notes, &log.MeasuredAt, &log.CreatedAt); err != nil {
			return nil, fmt.Errorf("erro ao escanear registro de glicose: %w", err)
		}
		logs = append(logs, log)
	}

	if logs == nil {
		logs = []model.GlucoseLog{}
	}

	return logs, nil
}

func (r *GlucoseRepository) CountByUser(ctx context.Context, userID uuid.UUID) (int, error) {
	if r.db == nil {
		return 0, nil
	}

	var count int
	err := r.db.QueryRow(ctx, `SELECT COUNT(*) FROM glucose_logs WHERE user_id = $1`, userID).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("erro ao contar registros de glicose: %w", err)
	}
	return count, nil
}

func (r *GlucoseRepository) BulkInsert(ctx context.Context, userID uuid.UUID, items []model.SyncMeasurementItem) (int, error) {
	if r.db == nil {
		return 0, fmt.Errorf("banco de dados não conectado")
	}

	tx, err := r.db.Begin(ctx)
	if err != nil {
		return 0, fmt.Errorf("erro ao iniciar transação: %w", err)
	}
	defer tx.Rollback(ctx)

	query := `
		INSERT INTO glucose_logs (id, user_id, value, context, notes, measured_at, created_at)
		SELECT $1, $2, $3, $4, $5, $6, $7
		WHERE NOT EXISTS (
			SELECT 1 FROM glucose_logs
			WHERE user_id = $2 AND measured_at = $6 AND value = $3
		)
	`

	inserted := 0
	for _, item := range items {
		measuredAt, parseErr := time.Parse(time.RFC3339, item.Date)
		if parseErr != nil {
			measuredAt = time.Now()
		}

		ctxLabel := item.Context
		if ctxLabel == "" {
			ctxLabel = "geral"
		}

		note := ""
		if item.Note != nil {
			note = *item.Note
		}

		tag, execErr := tx.Exec(ctx, query,
			uuid.New(), userID, int(item.Value), ctxLabel, note, measuredAt, time.Now(),
		)
		if execErr != nil {
			return inserted, fmt.Errorf("erro ao inserir medição sincronizada: %w", execErr)
		}
		inserted += int(tag.RowsAffected())
	}

	if err := tx.Commit(ctx); err != nil {
		return 0, fmt.Errorf("erro ao commitar transação: %w", err)
	}

	return inserted, nil
}

func (r *GlucoseRepository) DeleteByUserAndID(ctx context.Context, userID, logID uuid.UUID) error {
	if r.db == nil {
		return fmt.Errorf("banco de dados não conectado")
	}

	_, err := r.db.Exec(ctx, `DELETE FROM glucose_logs WHERE id = $1 AND user_id = $2`, logID, userID)
	if err != nil {
		return fmt.Errorf("erro ao remover registro de glicose: %w", err)
	}
	return nil
}

func (r *GlucoseRepository) GetStatsByUser(ctx context.Context, userID uuid.UUID, days int, useStandardTarget bool) (*model.GlucoseStatsResponse, error) {
	targetMin, targetMax := 70, 180
	isCustomTarget := false

	if r.db == nil {
		return &model.GlucoseStatsResponse{
			DaysPeriod:     days,
			TargetMin:      targetMin,
			TargetMax:      targetMax,
			IsCustomTarget: false,
		}, nil
	}

	if !useStandardTarget {
		var dbMin, dbMax int
		err := r.db.QueryRow(ctx, `SELECT COALESCE(target_glucose_min, 70), COALESCE(target_glucose_max, 180) FROM users WHERE id = $1`, userID).Scan(&dbMin, &dbMax)
		if err == nil && dbMin > 0 && dbMax > dbMin {
			targetMin = dbMin
			targetMax = dbMax
			isCustomTarget = targetMin != 70 || targetMax != 180
		}
	}

	query := `
		SELECT
			COUNT(*) AS total_readings,
			COALESCE(AVG(value), 0) AS avg_glucose,
			COALESCE(MIN(value), 0) AS min_glucose,
			COALESCE(MAX(value), 0) AS max_glucose,
			COALESCE(
				SUM(CASE WHEN value BETWEEN $3 AND $4 THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0),
				0
			) AS tir_percent
		FROM glucose_logs
		WHERE user_id = $1
		  AND measured_at >= NOW() - ($2 || ' days')::INTERVAL
	`

	var totalReadings int
	var avgGlucose, tirPercent float64
	var minGlucose, maxGlucose int

	err := r.db.QueryRow(ctx, query, userID, fmt.Sprintf("%d", days), targetMin, targetMax).Scan(
		&totalReadings, &avgGlucose, &minGlucose, &maxGlucose, &tirPercent,
	)
	if err != nil {
		return nil, fmt.Errorf("erro ao calcular estatísticas de glicose: %w", err)
	}

	estimatedHbA1c := 0.0
	if avgGlucose > 0 {
		estimatedHbA1c = math.Round(((avgGlucose+46.7)/28.7)*10) / 10
	}

	return &model.GlucoseStatsResponse{
		TotalReadings:      totalReadings,
		AverageGlucose:     math.Round(avgGlucose*10) / 10,
		EstimatedHbA1c:     estimatedHbA1c,
		TimeInRangePercent: math.Round(tirPercent*10) / 10,
		MinGlucose:         minGlucose,
		MaxGlucose:         maxGlucose,
		DaysPeriod:         days,
		TargetMin:          targetMin,
		TargetMax:          targetMax,
		IsCustomTarget:     isCustomTarget,
	}, nil
}
