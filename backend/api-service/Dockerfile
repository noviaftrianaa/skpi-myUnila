# Stage 1: Build the application
FROM golang:1.25-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk update && apk add --no-cache git

# Copy go mod files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -o server ./cmd/api/main.go

# Stage 2: Runtime container
FROM alpine:latest

WORKDIR /app

# Install ca-certificates for HTTPS and wget for healthcheck
RUN apk --no-cache add ca-certificates tzdata wget

# Copy binary from builder
COPY --from=builder /app/server .
COPY --from=builder /app/.env.example .env.example

# Copy static assets for docs
COPY --from=builder /app/docs/logo-unila.png ./docs/logo-unila.png

# Expose port
EXPOSE 8085

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8085/health || exit 1

# Run the application
CMD ["./server"]
