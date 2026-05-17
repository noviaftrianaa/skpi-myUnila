# =============================================================================
# Build stage
# =============================================================================
FROM golang:1.24-alpine AS builder

WORKDIR /src

# Cache deps
COPY go.mod go.sum* ./
RUN go mod download

# Build
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /out/blog-service ./cmd/api

# =============================================================================
# Runtime stage
# =============================================================================
FROM alpine:3.20

RUN apk --no-cache add ca-certificates tzdata && \
    cp /usr/share/zoneinfo/Asia/Jakarta /etc/localtime && \
    echo "Asia/Jakarta" > /etc/timezone

WORKDIR /app
COPY --from=builder /out/blog-service /app/blog-service

EXPOSE 8091
ENTRYPOINT ["/app/blog-service"]
