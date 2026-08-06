# Stage 1: Build binary
FROM golang:1.22-alpine AS builder

WORKDIR /app

# Install git and ca-certificates
RUN apk add --no-cache git ca-certificates

# Copy dependency files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build statically linked Go binary
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-w -s" -o /app/bin/server ./cmd/server/main.go

# Stage 2: Final minimal runner image
FROM alpine:3.19

WORKDIR /app

RUN apk add --no-cache ca-certificates tzdata

# Copy binary from builder
COPY --from=builder /app/bin/server /app/server
COPY --from=builder /app/migrations /app/migrations

ENV PORT=8080
ENV ENV=production

EXPOSE 8080

CMD ["/app/server"]
