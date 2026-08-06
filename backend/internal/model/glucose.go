package model

import (
	"time"

	"github.com/google/uuid"
)

type GlucoseLog struct {
	ID         uuid.UUID `json:"id"`
	UserID     uuid.UUID `json:"user_id"`
	Value      int       `json:"value"`
	Context    string    `json:"context"` // e.g. jejum, pre_refeicao, pos_refeicao, madrugada
	Notes      string    `json:"notes,omitempty"`
	MeasuredAt time.Time `json:"measured_at"`
	CreatedAt  time.Time `json:"created_at"`
}

type CreateGlucoseRequest struct {
	Value      int       `json:"value"`
	Context    string    `json:"context"`
	Notes      string    `json:"notes"`
	MeasuredAt time.Time `json:"measured_at"`
}

type GlucoseStatsResponse struct {
	TotalReadings      int     `json:"total_readings"`
	AverageGlucose     float64 `json:"average_glucose"`
	EstimatedHbA1c     float64 `json:"estimated_hba1c"`
	TimeInRangePercent float64 `json:"time_in_range_percent"`
	MinGlucose         int     `json:"min_glucose"`
	MaxGlucose         int     `json:"max_glucose"`
	DaysPeriod         int     `json:"days_period"`
}
