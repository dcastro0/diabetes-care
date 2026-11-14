package handler

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/caio/diabetes-care/backend/internal/middleware"
	"github.com/caio/diabetes-care/backend/internal/model"
	"github.com/caio/diabetes-care/backend/internal/repository"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

type MealsHandler struct {
	repo *repository.MealRepository
}

func NewMealsHandler(repo *repository.MealRepository) *MealsHandler {
	return &MealsHandler{repo: repo}
}

func (h *MealsHandler) ListMeals(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserIDFromContext(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, "usuário não autenticado")
		return
	}

	meals, err := h.repo.ListByUser(r.Context(), userID, 50)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "erro ao buscar refeições")
		return
	}

	writeJSON(w, http.StatusOK, meals)
}

func (h *MealsHandler) CreateMeal(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserIDFromContext(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, "usuário não autenticado")
		return
	}

	var req model.CreateMealRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "payload JSON inválido")
		return
	}

	if req.Name == "" || req.CarbsGrams < 0 || req.InsulinUnits < 0 {
		writeError(w, http.StatusBadRequest, "nome da refeição é obrigatório e valores não podem ser negativos")
		return
	}

	if req.EatenAt.IsZero() {
		req.EatenAt = time.Now()
	}

	meal := model.Meal{
		ID:           uuid.New(),
		UserID:       userID,
		Name:         req.Name,
		CarbsGrams:   req.CarbsGrams,
		InsulinUnits: req.InsulinUnits,
		Notes:        req.Notes,
		EatenAt:      req.EatenAt,
		CreatedAt:    time.Now(),
	}

	if err := h.repo.Create(r.Context(), &meal); err != nil {
		writeError(w, http.StatusInternalServerError, "erro ao salvar refeição")
		return
	}

	writeJSON(w, http.StatusCreated, meal)
}

func (h *MealsHandler) SyncMeals(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserIDFromContext(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, "usuário não autenticado")
		return
	}

	var items []model.SyncMealItem
	if err := json.NewDecoder(r.Body).Decode(&items); err != nil {
		writeError(w, http.StatusBadRequest, "payload JSON inválido")
		return
	}

	inserted, err := h.repo.BulkInsert(r.Context(), userID, items)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "erro ao sincronizar refeições")
		return
	}

	totalOnServer, _ := h.repo.CountByUser(r.Context(), userID)

	writeJSON(w, http.StatusOK, model.SyncMealsResponse{
		Message:            "Refeições sincronizadas com sucesso!",
		TotalMealsOnServer: totalOnServer,
		InsertedCount:      inserted,
	})
}

func (h *MealsHandler) DeleteMeal(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserIDFromContext(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, "usuário não autenticado")
		return
	}

	idStr := chi.URLParam(r, "id")
	mealID, err := uuid.Parse(idStr)
	if err != nil {
		writeError(w, http.StatusBadRequest, "id da refeição inválido")
		return
	}

	if err := h.repo.DeleteByUserAndID(r.Context(), userID, mealID); err != nil {
		writeError(w, http.StatusInternalServerError, "erro ao remover refeição")
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"message": "refeição removida com sucesso"})
}
