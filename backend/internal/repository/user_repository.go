package repository

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/caio/diabetes-care/backend/internal/model"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type UserRepository struct {
	db *pgxpool.Pool
}

func NewUserRepository(db *pgxpool.Pool) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) Create(ctx context.Context, u *model.User) error {
	if r.db == nil {
		return nil // Fallback when running without database
	}

	query := `
		INSERT INTO users (id, name, email, password_hash, diabetes_type, target_glucose_min, target_glucose_max, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
	`
	_, err := r.db.Exec(ctx, query,
		u.ID, u.Name, u.Email, u.PasswordHash, u.DiabetesType,
		u.TargetGlucoseMin, u.TargetGlucoseMax, u.CreatedAt, u.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("erro ao inserir usuário no banco: %w", err)
	}
	return nil
}

func (r *UserRepository) GetByEmail(ctx context.Context, email string) (*model.User, error) {
	if r.db == nil {
		return nil, errors.New("banco de dados não conectado")
	}

	query := `
		SELECT id, name, email, password_hash, diabetes_type, target_glucose_min, target_glucose_max, created_at, updated_at
		FROM users
		WHERE email = $1
	`
	var u model.User
	err := r.db.QueryRow(ctx, query, email).Scan(
		&u.ID, &u.Name, &u.Email, &u.PasswordHash, &u.DiabetesType,
		&u.TargetGlucoseMin, &u.TargetGlucoseMax, &u.CreatedAt, &u.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil // User not found
		}
		return nil, fmt.Errorf("erro ao buscar usuário por email: %w", err)
	}

	return &u, nil
}

func (r *UserRepository) GetByID(ctx context.Context, userID uuid.UUID) (*model.User, error) {
	if r.db == nil {
		return nil, errors.New("banco de dados não conectado")
	}

	query := `
		SELECT id, name, email, password_hash, diabetes_type, target_glucose_min, target_glucose_max, created_at, updated_at
		FROM users
		WHERE id = $1
	`
	var u model.User
	err := r.db.QueryRow(ctx, query, userID).Scan(
		&u.ID, &u.Name, &u.Email, &u.PasswordHash, &u.DiabetesType,
		&u.TargetGlucoseMin, &u.TargetGlucoseMax, &u.CreatedAt, &u.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, fmt.Errorf("erro ao buscar usuário por id: %w", err)
	}

	return &u, nil
}

func (r *UserRepository) UpdateProfile(ctx context.Context, userID uuid.UUID, req model.UpdateProfileRequest) (*model.User, error) {
	if r.db == nil {
		return nil, errors.New("banco de dados não conectado")
	}

	query := `
		UPDATE users
		SET
			name = COALESCE(NULLIF($2, ''), name),
			email = COALESCE(NULLIF($3, ''), email),
			diabetes_type = COALESCE(NULLIF($4, ''), diabetes_type),
			target_glucose_min = CASE WHEN $5 > 0 THEN $5 ELSE target_glucose_min END,
			target_glucose_max = CASE WHEN $6 > 0 THEN $6 ELSE target_glucose_max END,
			updated_at = $7
		WHERE id = $1
		RETURNING id, name, email, password_hash, diabetes_type, target_glucose_min, target_glucose_max, created_at, updated_at
	`
	var u model.User
	err := r.db.QueryRow(ctx, query,
		userID, req.Name, req.Email, req.DiabetesType,
		req.TargetGlucoseMin, req.TargetGlucoseMax, time.Now(),
	).Scan(
		&u.ID, &u.Name, &u.Email, &u.PasswordHash, &u.DiabetesType,
		&u.TargetGlucoseMin, &u.TargetGlucoseMax, &u.CreatedAt, &u.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("erro ao atualizar perfil do usuário: %w", err)
	}

	return &u, nil
}
