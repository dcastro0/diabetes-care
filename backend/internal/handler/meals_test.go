package handler_test

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/caio/diabetes-care/backend/internal/handler"
	"github.com/caio/diabetes-care/backend/internal/repository"
)

func TestMealsCreateValidation(t *testing.T) {
	h := handler.NewMealsHandler(repository.NewMealRepository(nil))

	// Unauthenticated -> 401
	reqUnauth := httptest.NewRequest(http.MethodPost, "/api/v1/meals", strings.NewReader(`{"name":"Almoço","carbs_grams":45}`))
	recUnauth := httptest.NewRecorder()
	h.CreateMeal(recUnauth, reqUnauth)
	if recUnauth.Code != http.StatusUnauthorized {
		t.Fatalf("esperado 401, obtido %d", recUnauth.Code)
	}

	// Empty name -> 400
	reqEmpty := withAuthUser(httptest.NewRequest(http.MethodPost, "/api/v1/meals", strings.NewReader(`{"name":"","carbs_grams":45}`)))
	recEmpty := httptest.NewRecorder()
	h.CreateMeal(recEmpty, reqEmpty)
	if recEmpty.Code != http.StatusBadRequest {
		t.Fatalf("esperado 400 para nome vazio, obtido %d", recEmpty.Code)
	}

	// Negative carbs -> 400
	reqNeg := withAuthUser(httptest.NewRequest(http.MethodPost, "/api/v1/meals", strings.NewReader(`{"name":"Almoço","carbs_grams":-5}`)))
	recNeg := httptest.NewRecorder()
	h.CreateMeal(recNeg, reqNeg)
	if recNeg.Code != http.StatusBadRequest {
		t.Fatalf("esperado 400 para carboidratos negativos, obtido %d", recNeg.Code)
	}
}

func TestMealsListWithoutDB(t *testing.T) {
	h := handler.NewMealsHandler(repository.NewMealRepository(nil))

	req := withAuthUser(httptest.NewRequest(http.MethodGet, "/api/v1/meals", nil))
	rec := httptest.NewRecorder()
	h.ListMeals(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("esperado 200, obtido %d", rec.Code)
	}
}
