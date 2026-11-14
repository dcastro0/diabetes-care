package handler_test

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/caio/diabetes-care/backend/internal/handler"
	"github.com/caio/diabetes-care/backend/internal/middleware"
	"github.com/caio/diabetes-care/backend/internal/repository"
	"github.com/google/uuid"
)

func withAuthUser(req *http.Request) *http.Request {
	ctx := context.WithValue(req.Context(), middleware.UserIDKey, uuid.New())
	return req.WithContext(ctx)
}

func TestGlucoseCreateLogValidation(t *testing.T) {
	h := handler.NewGlucoseHandler(repository.NewGlucoseRepository(nil))

	// Unauthenticated -> 401
	reqUnauth := httptest.NewRequest(http.MethodPost, "/api/v1/glucose", strings.NewReader(`{"value":110,"context":"Jejum"}`))
	recUnauth := httptest.NewRecorder()
	h.CreateLog(recUnauth, reqUnauth)
	if recUnauth.Code != http.StatusUnauthorized {
		t.Fatalf("esperado 401, obtido %d", recUnauth.Code)
	}

	// Out of clinical range -> 400
	reqInvalid := withAuthUser(httptest.NewRequest(http.MethodPost, "/api/v1/glucose", strings.NewReader(`{"value":10,"context":"Jejum"}`)))
	recInvalid := httptest.NewRecorder()
	h.CreateLog(recInvalid, reqInvalid)
	if recInvalid.Code != http.StatusBadRequest {
		t.Fatalf("esperado 400 para valor < 20, obtido %d", recInvalid.Code)
	}

	reqHigh := withAuthUser(httptest.NewRequest(http.MethodPost, "/api/v1/glucose", strings.NewReader(`{"value":750,"context":"Jejum"}`)))
	recHigh := httptest.NewRecorder()
	h.CreateLog(recHigh, reqHigh)
	if recHigh.Code != http.StatusBadRequest {
		t.Fatalf("esperado 400 para valor > 600, obtido %d", recHigh.Code)
	}
}

func TestGlucoseListLogsWithoutDB(t *testing.T) {
	h := handler.NewGlucoseHandler(repository.NewGlucoseRepository(nil))

	req := withAuthUser(httptest.NewRequest(http.MethodGet, "/api/v1/glucose", nil))
	rec := httptest.NewRecorder()
	h.ListLogs(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("esperado 200, obtido %d", rec.Code)
	}
}
