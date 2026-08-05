package model

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID                 uuid.UUID `json:"id"`
	Name               string    `json:"name"`
	Email              string    `json:"email"`
	PasswordHash       string    `json:"-"`
	DiabetesType       string    `json:"diabetes_type"`
	BirthDate          *time.Time `json:"birth_date,omitempty"`
	TargetGlucoseMin   int       `json:"target_glucose_min"`
	TargetGlucoseMax   int       `json:"target_glucose_max"`
	CreatedAt          time.Time `json:"created_at"`
	UpdatedAt          time.Time `json:"updated_at"`
}

type RegisterRequest struct {
	Name         string `json:"name"`
	Email        string `json:"email"`
	Password     string `json:"password"`
	DiabetesType string `json:"diabetes_type"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type AuthResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}
