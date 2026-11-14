package repository

import (
	"context"
	"fmt"
	"time"

	"github.com/caio/diabetes-care/backend/internal/model"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type MealRepository struct {
	db *pgxpool.Pool
}

func NewMealRepository(db *pgxpool.Pool) *MealRepository {
	return &MealRepository{db: db}
}

func (r *MealRepository) Create(ctx context.Context, meal *model.Meal) error {
	if r.db == nil {
		return fmt.Errorf("banco de dados não conectado")
	}

	query := `
		INSERT INTO meals (id, user_id, name, carbs_grams, insulin_units, notes, eaten_at, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`
	_, err := r.db.Exec(ctx, query,
		meal.ID, meal.UserID, meal.Name, meal.CarbsGrams, meal.InsulinUnits, meal.Notes, meal.EatenAt, meal.CreatedAt,
	)
	if err != nil {
		return fmt.Errorf("erro ao inserir refeição: %w", err)
	}
	return nil
}

func (r *MealRepository) ListByUser(ctx context.Context, userID uuid.UUID, limit int) ([]model.Meal, error) {
	if r.db == nil {
		return []model.Meal{}, nil
	}

	query := `
		SELECT id, user_id, name, carbs_grams, insulin_units, COALESCE(notes, ''), eaten_at, created_at
		FROM meals
		WHERE user_id = $1
		ORDER BY eaten_at DESC
		LIMIT $2
	`
	rows, err := r.db.Query(ctx, query, userID, limit)
	if err != nil {
		return nil, fmt.Errorf("erro ao listar refeições: %w", err)
	}
	defer rows.Close()

	var meals []model.Meal
	for rows.Next() {
		var m model.Meal
		if err := rows.Scan(&m.ID, &m.UserID, &m.Name, &m.CarbsGrams, &m.InsulinUnits, &m.Notes, &m.EatenAt, &m.CreatedAt); err != nil {
			return nil, fmt.Errorf("erro ao escanear refeição: %w", err)
		}
		meals = append(meals, m)
	}

	if meals == nil {
		meals = []model.Meal{}
	}
	return meals, nil
}

func (r *MealRepository) CountByUser(ctx context.Context, userID uuid.UUID) (int, error) {
	if r.db == nil {
		return 0, nil
	}
	var count int
	err := r.db.QueryRow(ctx, `SELECT COUNT(*) FROM meals WHERE user_id = $1`, userID).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("erro ao contar refeições: %w", err)
	}
	return count, nil
}

func (r *MealRepository) BulkInsert(ctx context.Context, userID uuid.UUID, items []model.SyncMealItem) (int, error) {
	if r.db == nil {
		return 0, fmt.Errorf("banco de dados não conectado")
	}

	tx, err := r.db.Begin(ctx)
	if err != nil {
		return 0, fmt.Errorf("erro ao iniciar transação: %w", err)
	}
	defer tx.Rollback(ctx)

	query := `
		INSERT INTO meals (id, user_id, name, carbs_grams, insulin_units, notes, eaten_at, created_at)
		SELECT $1, $2, $3, $4, $5, $6, $7, $8
		WHERE NOT EXISTS (
			SELECT 1 FROM meals
			WHERE user_id = $2 AND eaten_at = $7 AND name = $3
		)
	`

	inserted := 0
	for _, item := range items {
		eatenAt, parseErr := time.Parse(time.RFC3339, item.EatenAt)
		if parseErr != nil {
			eatenAt = time.Now()
		}

		notes := ""
		if item.Notes != nil {
			notes = *item.Notes
		}

		tag, execErr := tx.Exec(ctx, query,
			uuid.New(), userID, item.Name, item.CarbsGrams, item.InsulinUnits, notes, eatenAt, time.Now(),
		)
		if execErr != nil {
			return inserted, fmt.Errorf("erro ao sincronizar refeição: %w", execErr)
		}
		inserted += int(tag.RowsAffected())
	}

	if err := tx.Commit(ctx); err != nil {
		return 0, fmt.Errorf("erro ao commitar transação: %w", err)
	}
	return inserted, nil
}

func (r *MealRepository) DeleteByUserAndID(ctx context.Context, userID, mealID uuid.UUID) error {
	if r.db == nil {
		return fmt.Errorf("banco de dados não conectado")
	}

	_, err := r.db.Exec(ctx, `DELETE FROM meals WHERE id = $1 AND user_id = $2`, mealID, userID)
	if err != nil {
		return fmt.Errorf("erro ao remover refeição: %w", err)
	}
	return nil
}
