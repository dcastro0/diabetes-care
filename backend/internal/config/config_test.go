package config_test

import (
	"testing"

	"github.com/caio/diabetes-care/backend/internal/config"
)

func TestLoadConfigProductionRequiresJWTSecret(t *testing.T) {
	t.Setenv("ENV", "production")
	t.Setenv("JWT_SECRET", "")

	_, err := config.LoadConfig()
	if err == nil {
		t.Fatal("esperado erro quando ENV=production sem JWT_SECRET")
	}

	t.Setenv("JWT_SECRET", "default-dev-secret-change-me")
	_, err = config.LoadConfig()
	if err == nil {
		t.Fatal("esperado erro quando ENV=production usa o segredo padrão")
	}

	t.Setenv("JWT_SECRET", "strong-production-secret-123")
	cfg, err := config.LoadConfig()
	if err != nil {
		t.Fatalf("erro inesperado com JWT_SECRET válido: %v", err)
	}
	if cfg.JWTSecret != "strong-production-secret-123" {
		t.Errorf("JWT_SECRET inesperado: %s", cfg.JWTSecret)
	}
}
