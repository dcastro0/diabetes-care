package handler_test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/caio/diabetes-care/backend/internal/handler"
)

func TestHealthCheck(t *testing.T) {
	h := handler.NewHealthHandler(nil)

	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	rec := httptest.NewRecorder()

	h.Check(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("código HTTP esperado %d, obtido %d", http.StatusOK, rec.Code)
	}

	var resp handler.HealthResponse
	if err := json.Unmarshal(rec.Body.Bytes(), &resp); err != nil {
		t.Fatalf("erro ao decodificar resposta JSON: %v", err)
	}

	if resp.Status != "ok" {
		t.Errorf("status esperado 'ok', obtido '%s'", resp.Status)
	}
}
