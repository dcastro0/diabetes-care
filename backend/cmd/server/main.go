package main

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/caio/diabetes-care/backend/internal/config"
	"github.com/caio/diabetes-care/backend/internal/handler"
	customMiddleware "github.com/caio/diabetes-care/backend/internal/middleware"
	"github.com/caio/diabetes-care/backend/internal/repository"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

func main() {
	// 1. Setup Structured Logger (slog)
	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	}))
	slog.SetDefault(logger)

	// 2. Load Configuration
	cfg, err := config.LoadConfig()
	if err != nil {
		logger.Error("falha ao carregar configurações", slog.String("error", err.Error()))
		os.Exit(1)
	}

	logger.Info("iniciando servidor backend Go",
		slog.String("env", cfg.Env),
		slog.String("port", cfg.Port),
	)

	// 3. Connect to Database (optional/graceful if local PostgreSQL is not running yet)
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	dbPool, err := repository.NewPostgresPool(ctx, cfg.DSN())
	if err != nil {
		logger.Warn("não foi possível conectar ao PostgreSQL (executando com mocks de desenvolvimento)",
			slog.String("dsn", cfg.DSN()),
			slog.String("error", err.Error()),
		)
	} else {
		defer dbPool.Close()
		logger.Info("conexão com PostgreSQL estabelecida com sucesso!")
	}

	// 4. Initialize Repositories & Handlers
	userRepo := repository.NewUserRepository(dbPool)

	healthH := handler.NewHealthHandler(dbPool)
	authH := handler.NewAuthHandler(userRepo, cfg.JWTSecret)
	glucoseH := handler.NewGlucoseHandler()

	// 5. Setup Router (Chi)
	r := chi.NewRouter()

	// Global Middlewares
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(customMiddleware.Logger(logger))
	r.Use(middleware.Recoverer)

	// CORS Setup
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// Routes
	r.Get("/health", healthH.Check)

	r.Route("/api/v1", func(r chi.Router) {
		// Public Auth Routes
		r.Route("/auth", func(r chi.Router) {
			r.Post("/register", authH.Register)
			r.Post("/login", authH.Login)
		})

		// Protected Routes
		r.Group(func(r chi.Router) {
			r.Use(customMiddleware.Auth(cfg.JWTSecret))

			r.Route("/glucose", func(r chi.Router) {
				r.Get("/", glucoseH.ListLogs)
				r.Post("/", glucoseH.CreateLog)
			})
		})
	})

	// 6. HTTP Server Configuration
	srv := &http.Server{
		Addr:         fmt.Sprintf(":%s", cfg.Port),
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// 7. Graceful Shutdown Listener
	serverErrors := make(chan error, 1)
	go func() {
		logger.Info("servidor pronto para receber requisições", slog.String("addr", srv.Addr))
		serverErrors <- srv.ListenAndServe()
	}()

	shutdown := make(chan os.Signal, 1)
	signal.Notify(shutdown, os.Interrupt, syscall.SIGTERM)

	select {
	case err := <-serverErrors:
		if !errors.Is(err, http.ErrServerClosed) {
			logger.Error("erro crítico no servidor HTTP", slog.String("error", err.Error()))
		}
	case sig := <-shutdown:
		logger.Info("sinal de encerramento recebido", slog.String("signal", sig.String()))

		ctxShutdown, cancelShutdown := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancelShutdown()

		if err := srv.Shutdown(ctxShutdown); err != nil {
			logger.Error("falha durante o graceful shutdown", slog.String("error", err.Error()))
			_ = srv.Close()
		}
	}

	logger.Info("servidor backend Go finalizado com sucesso.")
}
