package handler

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/caio/diabetes-care/backend/internal/model"
	"github.com/caio/diabetes-care/backend/internal/repository"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type AuthHandler struct {
	userRepo  *repository.UserRepository
	jwtSecret string
}

func NewAuthHandler(userRepo *repository.UserRepository, jwtSecret string) *AuthHandler {
	return &AuthHandler{
		userRepo:  userRepo,
		jwtSecret: jwtSecret,
	}
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

	if req.DiabetesType == "" {
		req.DiabetesType = "Tipo 1"
	}

	// Check if user already exists
	if h.userRepo != nil {
		existing, err := h.userRepo.GetByEmail(r.Context(), req.Email)
		if err == nil && existing != nil {
			http.Error(w, `{"error":"este e-mail já está cadastrado"}`, http.StatusConflict)
			return
		}
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

	if h.userRepo != nil {
		if err := h.userRepo.Create(r.Context(), &user); err != nil {
			http.Error(w, `{"error":"erro ao salvar usuário no banco de dados"}`, http.StatusInternalServerError)
			return
		}
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

	var user *model.User
	if h.userRepo != nil {
		dbUser, err := h.userRepo.GetByEmail(r.Context(), req.Email)
		if err != nil || dbUser == nil {
			http.Error(w, `{"error":"e-mail ou senha inválidos"}`, http.StatusUnauthorized)
			return
		}

		if err := bcrypt.CompareHashAndPassword([]byte(dbUser.PasswordHash), []byte(req.Password)); err != nil {
			http.Error(w, `{"error":"e-mail ou senha inválidos"}`, http.StatusUnauthorized)
			return
		}
		user = dbUser
	} else {
		// Mock fallback when running without database
		mockID := uuid.New()
		user = &model.User{
			ID:               mockID,
			Name:             "Usuário Exemplo",
			Email:            req.Email,
			DiabetesType:     "Tipo 1",
			TargetGlucoseMin: 70,
			TargetGlucoseMax: 180,
			CreatedAt:        time.Now(),
			UpdatedAt:        time.Now(),
		}
	}

	token, err := h.generateToken(user.ID)
	if err != nil {
		http.Error(w, `{"error":"erro ao gerar token JWT"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(model.AuthResponse{
		Token: token,
		User:  *user,
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
