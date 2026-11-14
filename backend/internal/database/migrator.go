package database

import (
	"context"
	"fmt"
	"io/fs"
	"log/slog"
	"sort"

	"github.com/caio/diabetes-care/backend/migrations"
	"github.com/jackc/pgx/v5/pgxpool"
)

func RunMigrations(ctx context.Context, pool *pgxpool.Pool, logger *slog.Logger) error {
	if pool == nil {
		return nil
	}

	_, err := pool.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS schema_migrations (
			version VARCHAR(255) PRIMARY KEY,
			applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
		)
	`)
	if err != nil {
		return fmt.Errorf("erro ao criar tabela schema_migrations: %w", err)
	}

	entries, err := fs.ReadDir(migrations.UpFiles, ".")
	if err != nil {
		return fmt.Errorf("erro ao ler arquivos de migration: %w", err)
	}

	var files []string
	for _, e := range entries {
		if !e.IsDir() {
			files = append(files, e.Name())
		}
	}
	sort.Strings(files)

	for _, file := range files {
		var exists bool
		err := pool.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM schema_migrations WHERE version = $1)`, file).Scan(&exists)
		if err != nil {
			return fmt.Errorf("erro ao verificar migration %s: %w", file, err)
		}
		if exists {
			continue
		}

		sqlBytes, err := fs.ReadFile(migrations.UpFiles, file)
		if err != nil {
			return fmt.Errorf("erro ao ler conteúdo da migration %s: %w", file, err)
		}

		tx, err := pool.Begin(ctx)
		if err != nil {
			return fmt.Errorf("erro ao iniciar transação da migration %s: %w", file, err)
		}

		if _, err := tx.Exec(ctx, string(sqlBytes)); err != nil {
			_ = tx.Rollback(ctx)
			return fmt.Errorf("erro ao executar migration %s: %w", file, err)
		}

		if _, err := tx.Exec(ctx, `INSERT INTO schema_migrations (version) VALUES ($1)`, file); err != nil {
			_ = tx.Rollback(ctx)
			return fmt.Errorf("erro ao registrar migration %s: %w", file, err)
		}

		if err := tx.Commit(ctx); err != nil {
			return fmt.Errorf("erro ao commitar migration %s: %w", file, err)
		}

		if logger != nil {
			logger.Info("migration aplicada com sucesso", slog.String("version", file))
		}
	}

	return nil
}
