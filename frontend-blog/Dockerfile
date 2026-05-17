# Multi-stage build untuk frontend-blog (Next.js standalone)

# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk update && apk add --no-cache libc6-compat 2>/dev/null || true
WORKDIR /app
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then \
      npm ci --prefer-offline 2>/dev/null || npm install; \
    else \
      npm install; \
    fi

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_BLOG_API
ARG NEXT_PUBLIC_MEILI_HOST
ARG NEXT_PUBLIC_MEILI_SEARCH_KEY
ARG NEXT_PUBLIC_APEX_HOST
ARG NEXT_PUBLIC_USE_MOCK

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV NEXT_PUBLIC_BLOG_API=$NEXT_PUBLIC_BLOG_API
ENV NEXT_PUBLIC_MEILI_HOST=$NEXT_PUBLIC_MEILI_HOST
ENV NEXT_PUBLIC_MEILI_SEARCH_KEY=$NEXT_PUBLIC_MEILI_SEARCH_KEY
ENV NEXT_PUBLIC_APEX_HOST=$NEXT_PUBLIC_APEX_HOST
ENV NEXT_PUBLIC_USE_MOCK=$NEXT_PUBLIC_USE_MOCK

ENV NODE_OPTIONS="--max-old-space-size=2048"
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
RUN mkdir .next && chown nextjs:nodejs .next
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3002
ENV PORT=3002
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
