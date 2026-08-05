# ==============================================================================
# 🩸 Diabetes Care - Unified Makefile
# ==============================================================================

.PHONY: help install dev-backend dev-frontend build-backend test-backend lint-backend lint-frontend lint clean

# Default Target
.DEFAULT_GOAL := help

## help: Mostra todos os comandos disponíveis com descrições
help:
	@echo ""
	@echo "  ================================================================"
	@echo "  🩸 Diabetes Care - Comandos Utilitários para Desenvolvimento"
	@echo "  ================================================================"
	@echo ""
	@echo "  Uso: make <comando>"
	@echo ""
	@echo "  Comandos Gerais:"
	@echo "    install        Instala todas as dependências do Frontend e Backend"
	@echo "    lint           Executa linters no Frontend e Backend"
	@echo "    clean          Limpa os arquivos compilados e binários"
	@echo ""
	@echo "  Backend (Go):"
	@echo "    dev-backend    Inicia o servidor backend Go em modo de desenvolvimento"
	@echo "    build-backend  Compila o binário de produção do backend Go"
	@echo "    test-backend   Executa os testes unitários do backend Go"
	@echo "    lint-backend   Executa 'go vet' e verificações estáticas do Go"
	@echo ""
	@echo "  Frontend (Expo):"
	@echo "    dev-frontend   Inicia o servidor de desenvolvimento do Expo"
	@echo "    lint-frontend  Executa o linter do frontend Expo"
	@echo ""

## install: Instala dependências do frontend (pnpm) e backend (go mod)
install:
	@echo "📦 Instalando dependências do Frontend..."
	@cd frontend && pnpm install
	@echo "📦 Baixando dependências do Backend em Go..."
	@cd backend && go mod download && go mod tidy

## dev-backend: Executa o servidor Go localmente
dev-backend:
	@echo "🚀 Iniciando servidor Backend Go na porta 8080..."
	@cd backend && go run ./cmd/server

## dev-frontend: Executa o app Expo
dev-frontend:
	@echo "📱 Iniciando Expo Frontend..."
	@cd frontend && pnpm start

## build-backend: Compila o servidor Go
build-backend:
	@echo "🔨 Compilando binário do Backend Go em backend/bin/server..."
	@cd backend && mkdir -p bin && go build -o bin/server ./cmd/server
	@echo "✅ Build concluído com sucesso!"

## test-backend: Roda os testes unitários Go
test-backend:
	@echo "🧪 Executando testes unitários do Backend Go..."
	@cd backend && go test -v ./...

## lint-backend: Roda vet e static analysis no Go
lint-backend:
	@echo "🔍 Analisando código Go (go vet)..."
	@cd backend && go vet ./...

## lint-frontend: Roda linter no frontend
lint-frontend:
	@echo "🔍 Executando linter no Frontend Expo..."
	@cd frontend && pnpm lint

## lint: Roda linter completo (Backend + Frontend)
lint: lint-backend lint-frontend

## clean: Limpa artefatos temporários
clean:
	@echo "🧹 Limpando arquivos de build..."
	@rm -rf backend/bin
	@rm -rf frontend/dist frontend/.expo
	@echo "✅ Limpeza concluída!"
