package handler_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/caio/diabetes-care/backend/internal/handler"
	"github.com/caio/diabetes-care/backend/internal/model"
)

func TestAuthRegisterValidationAndDevMock(t *testing.T) {
	h := handler.NewAuthHandler(nil, "test-secret", true)

	// Missing fields -> 400 with JSON Content-Type
	req := httptest.NewRequest(http.MethodPost, "/api/v1/register", strings.NewReader(`{"email":"a@b.com"}`))
	rec := httptest.NewRecorder()
	h.Register(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("esperado 400, obtido %d", rec.Code)
	}
	if ct := rec.Header().Get("Content-Type"); !strings.Contains(ct, "application/json") {
		t.Errorf("Content-Type esperado application/json, obtido %s", ct)
	}

	// Valid registration in dev mock mode -> 201 + token
	body := `{"nome":"Maria","email":"maria@example.com","password":"password123","diabetes_type":"Tipo 2"}`
	req2 := httptest.NewRequest(http.MethodPost, "/api/v1/register", bytes.NewBufferString(body))
	rec2 := httptest.NewRecorder()
	h.Register(rec2, req2)

	if rec2.Code != http.StatusCreated {
		t.Fatalf("esperado 201, obtido %d: %s", rec2.Code, rec2.Body.String())
	}

	var resp model.AuthResponse
	if err := json.Unmarshal(rec2.Body.Bytes(), &resp); err != nil {
		t.Fatalf("erro ao decodificar AuthResponse: %v", err)
	}
	if resp.Token == "" {
		t.Error("esperado token JWT não vazio")
	}
	if resp.DiabetesType != "Tipo 2" {
		t.Errorf("diabetes_type esperado 'Tipo 2', obtido '%s'", resp.DiabetesType)
	}
}

func TestAuthLoginValidationAndDevMock(t *testing.T) {
	h := handler.NewAuthHandler(nil, "test-secret", true)

	req := httptest.NewRequest(http.MethodPost, "/api/v1/login", strings.NewReader(`{}`))
	rec := httptest.NewRecorder()
	h.Login(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("esperado 400 para campos vazios, obtido %d", rec.Code)
	}

	body := `{"email":"maria@example.com","password":"password123"}`
	req2 := httptest.NewRequest(http.MethodPost, "/api/v1/login", bytes.NewBufferString(body))
	rec2 := httptest.NewRecorder()
	h.Login(rec2, req2)

	if rec2.Code != http.StatusOK {
		t.Fatalf("esperado 200, obtido %d", rec2.Code)
	}
}
