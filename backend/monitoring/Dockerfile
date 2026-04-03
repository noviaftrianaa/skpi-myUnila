FROM golang:1.25-alpine AS builder

WORKDIR /app

RUN apk update && apk add --no-cache git ca-certificates

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o server ./cmd/api/main.go

FROM alpine:latest

WORKDIR /app

RUN apk --no-cache add ca-certificates tzdata wget

COPY --from=builder /app/server .
COPY --from=builder /app/.env.example .env.example

EXPOSE 8089

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8089/health || exit 1

CMD ["./server"]
