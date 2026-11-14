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
	userRepo     *repository.UserRepository
	jwtSecret    string
	allowDevMock bool
}

func NewAuthHandler(userRepo *repository.UserRepository, jwtSecret string, allowDevMock bool) *AuthHandler {
	return &AuthHandler{
		userRepo:     userRepo,
		jwtSecret:    jwtSecret,
		allowDevMock: allowDevMock,
	}
}

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req model.RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "payload JSON inválido")
		return
	}

	if req.Name == "" && req.Nome != "" {
		req.Name = req.Nome
	}

	if req.Email == "" || req.Password == "" || req.Name == "" {
		writeError(w, http.StatusBadRequest, "campos obrigatórios ausentes (name, email, password)")
		return
	}

	if req.DiabetesType == "" {
		req.DiabetesType = "Tipo 1"
	}

	// Check if user already exists
	if !h.allowDevMock && h.userRepo != nil {
		existing, err := h.userRepo.GetByEmail(r.Context(), req.Email)
		if err == nil && existing != nil {
			writeError(w, http.StatusConflict, "este e-mail já está cadastrado")
			return
		}
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "erro ao criptografar senha")
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

	if !h.allowDevMock && h.userRepo != nil {
		if err := h.userRepo.Create(r.Context(), &user); err != nil {
			writeError(w, http.StatusInternalServerError, "erro ao salvar usuário no banco de dados")
			return
		}
	}

	token, err := h.generateToken(user.ID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "erro ao gerar token JWT")
		return
	}

	writeJSON(w, http.StatusCreated, model.AuthResponse{
		Token:        token,
		ID:           user.ID.String(),
		Name:         user.Name,
		Nome:         user.Name,
		Email:        user.Email,
		DiabetesType: user.DiabetesType,
		User:         user,
	})
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req model.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "payload JSON inválido")
		return
	}

	if req.Email == "" || req.Password == "" {
		writeError(w, http.StatusBadRequest, "email e senha são obrigatórios")
		return
	}

	var user *model.User
	if !h.allowDevMock && h.userRepo != nil {
		dbUser, err := h.userRepo.GetByEmail(r.Context(), req.Email)
		if err != nil || dbUser == nil {
			writeError(w, http.StatusUnauthorized, "e-mail ou senha inválidos")
			return
		}

		if err := bcrypt.CompareHashAndPassword([]byte(dbUser.PasswordHash), []byte(req.Password)); err != nil {
			writeError(w, http.StatusUnauthorized, "e-mail ou senha inválidos")
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
		writeError(w, http.StatusInternalServerError, "erro ao gerar token JWT")
		return
	}

	writeJSON(w, http.StatusOK, model.AuthResponse{
		Token:        token,
		ID:           user.ID.String(),
		Name:         user.Name,
		Nome:         user.Name,
		Email:        user.Email,
		DiabetesType: user.DiabetesType,
		User:         *user,
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
