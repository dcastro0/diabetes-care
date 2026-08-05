# 🩸 Diabetes Care - Monorepo

[![Go](https://img.shields.io/badge/Go-1.22+-00ADD8?style=for-the-badge&logo=go&logoColor=white)](https://go.dev/)
[![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-SDK_54-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

Plataforma completa de saúde e monitoramento de glicemia para diabetes, dividida em arquitetura monorepo com aplicativo móvel (**Frontend Expo / React Native**) e um serviço de alta performance (**Backend em Go com PostgreSQL**).

---

## 🏗️ Arquitetura do Projeto

```text
diabetes-care/
├── Makefile               # Automação de tarefas para dev, build, testes e lint
├── .gitignore             # Configuração unificada de ignore do Git
├── README.md              # Documentação principal
├── backend/               # Servidor REST API em Go (Clean Architecture)
│   ├── cmd/server/        # Entrypoint principal da aplicação
│   ├── internal/          # Regras de negócio, handlers, middlewares e models
│   ├── migrations/        # Migrações SQL do PostgreSQL
│   ├── go.mod             # Módulo Go (github.com/caio/diabetes-care/backend)
│   └── .env.example       # Modelo de variáveis de ambiente
└── frontend/              # Aplicativo Mobile em Expo / React Native
    ├── app/               # Roteamento baseado em arquivos (Expo Router)
    ├── components/        # Componentes visuais reutilizáveis
    ├── services/          # Integração com APIs e SQLite local
    └── package.json       # Dependências do Expo SDK 54 (pnpm)
```

---

## 🚀 Como Executar

### Pré-requisitos
- [Go](https://go.dev/doc/install) 1.21+
- [Node.js](https://nodejs.org/) LTS e [pnpm](https://pnpm.io/)
- [PostgreSQL](https://www.postgresql.org/) (opcional para dev local; o backend roda com fallback Gracioso de conexão)
- [Make](https://www.gnu.org/software/make/)

---

### 🛠️ Comandos Rápidos via `Makefile`

No diretório raiz do projeto, utilize os seguintes comandos:

```bash
# 1. Instalar todas as dependências (Frontend + Backend)
make install

# 2. Executar o Backend em Go (Porta 8080)
make dev-backend

# 3. Executar o aplicativo Frontend Expo
make dev-frontend

# 4. Executar os testes unitários do Backend Go
make test-backend

# 5. Compilar o binário de produção do Go
make build-backend

# 6. Executar linters em todo o projeto
make lint
```

---

## 🐹 Stack do Backend (Go)

- **Roteamento**: `go-chi/chi/v5`
- **Banco de Dados**: PostgreSQL com driver nativo `jackc/pgx/v5`
- **Autenticação**: JWT (`golang-jwt/jwt/v5`) + Bcrypt (`golang.org/x/crypto`)
- **Logs Estruturados**: `log/slog` (JSON nativo)
- **Gerenciamento de Schema**: SQL Migrations nativas em `backend/migrations`

---

## 📱 Stack do Frontend (Expo)

- **Framework**: React Native + Expo SDK 54
- **Roteador**: Expo Router
- **Estilização**: TailwindCSS (`twrnc`)
- **Gerenciamento de Formulários**: React Hook Form + Zod

---

## 👨‍💻 Autor

**Caio Corrêa de Castro**
- GitHub: [@dcastro0](https://github.com/dcastro0/)
- LinkedIn: [Caio de Castro](https://www.linkedin.com/in/caio-de-castro-a74a81188/)
