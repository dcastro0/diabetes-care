package model

import (
	"time"

	"github.com/google/uuid"
)

type Meal struct {
	ID           uuid.UUID `json:"id"`
	UserID       uuid.UUID `json:"user_id"`
	Name         string    `json:"name"`
	CarbsGrams   float64   `json:"carbs_grams"`
	InsulinUnits float64   `json:"insulin_units"`
	Notes        string    `json:"notes,omitempty"`
	EatenAt      time.Time `json:"eaten_at"`
	CreatedAt    time.Time `json:"created_at"`
}

type CreateMealRequest struct {
	Name         string    `json:"name"`
	CarbsGrams   float64   `json:"carbs_grams"`
	InsulinUnits float64   `json:"insulin_units"`
	Notes        string    `json:"notes"`
	EatenAt      time.Time `json:"eaten_at"`
}

type SyncMealItem struct {
	Name         string  `json:"name"`
	CarbsGrams   float64 `json:"carbs_grams"`
	InsulinUnits float64 `json:"insulin_units"`
	Notes        *string `json:"notes"`
	EatenAt      string  `json:"eaten_at"`
}

type SyncMealsResponse struct {
	Message             string `json:"message"`
	TotalMealsOnServer  int    `json:"total_meals_on_server"`
	InsertedCount       int    `json:"inserted_count"`
}
