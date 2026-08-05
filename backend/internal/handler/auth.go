package handler

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/caio/diabetes-care/backend/internal/model"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type AuthHandler struct {
	jwtSecret string
}

func NewAuthHandler(jwtSecret string) *AuthHandler {
	return &AuthHandler{jwtSecret: jwtSecret}
}

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req model.RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"payload JSON inválido"}`, http.StatusBadRequest)
		return
	}

	if req.Email == "" || req.Password == "" || req.Name == "" {
		http.Error(w, `{"error":"campos obrigatórios ausentes (name, email, password)"}`, http.StatusBadRequest)
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, `{"error":"erro ao criptografar senha"}`, http.StatusInternalServerError)
		return
	}

	user := model.User{
		ID:               uuid.New(),
		Name:             req.Name,
		Email:            req.Email,
		PasswordHash:     string(hashedPassword),
		DiabetesType:     req.DiabetesType,
		TargetGlucoseMin: 70,
		TargetGlucoseMax: 180,
		CreatedAt:        time.Now(),
		UpdatedAt:        time.Now(),
	}

	token, err := h.generateToken(user.ID)
	if err != nil {
		http.Error(w, `{"error":"erro ao gerar token JWT"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(model.AuthResponse{
		Token: token,
		User:  user,
	})
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req model.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"payload JSON inválido"}`, http.StatusBadRequest)
		return
	}

	if req.Email == "" || req.Password == "" {
		http.Error(w, `{"error":"email e senha são obrigatórios"}`, http.StatusBadRequest)
		return
	}

	// Mock representation for bootstrap API validation until database repo is connected
	userID := uuid.New()
	token, err := h.generateToken(userID)
	if err != nil {
		http.Error(w, `{"error":"erro ao gerar token JWT"}`, http.StatusInternalServerError)
		return
	}

	user := model.User{
		ID:               userID,
		Name:             "Usuário Exemplo",
		Email:            req.Email,
		DiabetesType:     "Tipo 1",
		TargetGlucoseMin: 70,
		TargetGlucoseMax: 180,
		CreatedAt:        time.Now(),
		UpdatedAt:        time.Now(),
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(model.AuthResponse{
		Token: token,
		User:  user,
	})
}

func (h *AuthHandler) generateToken(userID uuid.UUID) (string, error) {
	claims := jwt.MapClaims{
		"user_id": userID.String(),
		"exp":     time.Now().Add(time.Hour * 72).Unix(),
		"iat":     time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(h.jwtSecret))
}
