package handler_test

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/caio/diabetes-care/backend/internal/handler"
	"github.com/caio/diabetes-care/backend/internal/repository"
)

func TestUsersUpdateMeValidation(t *testing.T) {
	h := handler.NewUsersHandler(repository.NewUserRepository(nil))

	// Unauthenticated -> 401
	reqUnauth := httptest.NewRequest(http.MethodPut, "/api/v1/users/me", strings.NewReader(`{"name":"Teste"}`))
	recUnauth := httptest.NewRecorder()
	h.UpdateMe(recUnauth, reqUnauth)
	if recUnauth.Code != http.StatusUnauthorized {
		t.Fatalf("esperado 401, obtido %d", recUnauth.Code)
	}

	// Invalid target range (min >= max) -> 400
	reqInvalidRange := withAuthUser(httptest.NewRequest(http.MethodPut, "/api/v1/users/me", strings.NewReader(`{"target_glucose_min":180,"target_glucose_max":100}`)))
	recInvalidRange := httptest.NewRecorder()
	h.UpdateMe(recInvalidRange, reqInvalidRange)
	if recInvalidRange.Code != http.StatusBadRequest {
		t.Fatalf("esperado 400 para faixa inválida, obtido %d", recInvalidRange.Code)
	}
}
