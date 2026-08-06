# ==============================================================================
# 🩸 Diabetes Care - Unified Makefile
# ==============================================================================

.PHONY: help install dev-backend dev-frontend build-backend test-backend lint-backend lint-frontend lint clean db-up db-down db-logs docker-up

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
	@echo "  Banco de Dados & Docker:"
	@echo "    db-up          Sobe o container do PostgreSQL via Docker Compose"
	@echo "    db-down        Para e remove o container do PostgreSQL"
	@echo "    db-logs        Exibe os logs em tempo real do container PostgreSQL"
	@echo "    docker-up      Sobe a stack completa (PostgreSQL + Backend Go) via Docker"
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
	@echo "🚀 Iniciando servidor Backend Go na porta 8080 (Pressione Ctrl+C para encerrar)..."
	@-cd backend && go run ./cmd/server

## db-up: Sobe o container PostgreSQL via Docker Compose
db-up:
	@echo "🐘 Subindo container do PostgreSQL..."
	@docker compose up -d postgres
	@echo "✅ PostgreSQL rodando na porta 5432!"

## db-down: Para e remove os containers Docker
db-down:
	@echo "🛑 Parando containers Docker..."
	@docker compose down

## db-logs: Exibe os logs do container PostgreSQL
db-logs:
	@docker compose logs -f postgres

## docker-up: Sobe a stack completa (PostgreSQL + Backend Go) via Docker Compose
docker-up:
	@echo "🐳 Subindo stack completa (PostgreSQL + Backend Go)..."
	@docker compose up -d --build
	@echo "✅ Stack em execução nas portas 8080 (Go API) e 5432 (PostgreSQL)!"

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
