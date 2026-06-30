# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vite bakes VITE_* vars at build time — pass them from EasyPanel build args
ARG VITE_API_URL
ARG VITE_APP_NAME="Debug Together"
ARG VITE_APP_ENV=production
ARG VITE_STRIPE_PUBLISHABLE_KEY
ARG VITE_STRIPE_PRICE_FREE=price_free
ARG VITE_STRIPE_PRICE_PRO_MONTHLY
ARG VITE_FEATURE_SHARING=true
ARG VITE_FEATURE_BILLING=true
ARG VITE_FEATURE_PDF_EXPORT=true
ARG VITE_SUPPORTED_PLATFORMS=instagram,whatsapp
ARG VITE_SENTRY_DSN
ARG VITE_POSTHOG_KEY

ENV VITE_API_URL=$VITE_API_URL \
    VITE_APP_NAME=$VITE_APP_NAME \
    VITE_APP_ENV=$VITE_APP_ENV \
    VITE_STRIPE_PUBLISHABLE_KEY=$VITE_STRIPE_PUBLISHABLE_KEY \
    VITE_STRIPE_PRICE_FREE=$VITE_STRIPE_PRICE_FREE \
    VITE_STRIPE_PRICE_PRO_MONTHLY=$VITE_STRIPE_PRICE_PRO_MONTHLY \
    VITE_FEATURE_SHARING=$VITE_FEATURE_SHARING \
    VITE_FEATURE_BILLING=$VITE_FEATURE_BILLING \
    VITE_FEATURE_PDF_EXPORT=$VITE_FEATURE_PDF_EXPORT \
    VITE_SUPPORTED_PLATFORMS=$VITE_SUPPORTED_PLATFORMS \
    VITE_SENTRY_DSN=$VITE_SENTRY_DSN \
    VITE_POSTHOG_KEY=$VITE_POSTHOG_KEY

RUN npm run build

# ── Stage 2: Serve with nginx ─────────────────────────────────────────────────
FROM nginx:alpine AS production

RUN apk add --no-cache curl

COPY --from=builder /app/dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD curl -sf http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
