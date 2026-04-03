# Build stage
FROM golang:1.23-alpine AS builder

WORKDIR /app

# Install dependencies
RUN apk add --no-cache git

# Copy all source first for go mod tidy
COPY go.mod ./
COPY . .

# Tidy and download deps
RUN go mod tidy && go mod download

# Build
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o project-service ./cmd/api/

# Final stage
FROM alpine:latest

WORKDIR /app

# Install CA certs for HTTPS
RUN apk --no-cache add ca-certificates tzdata

# Set timezone
ENV TZ=Asia/Jakarta

# Copy binary
COPY --from=builder /app/project-service .

# Copy .env.example (actual .env should be mounted)
COPY --from=builder /app/.env.example .env.example

EXPOSE 8090

CMD ["./project-service"]
