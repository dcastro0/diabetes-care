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
