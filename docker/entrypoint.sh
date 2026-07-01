#!/bin/sh
set -e

CONFIG_FILE=/usr/share/nginx/html/config.js

echo "==> Generating runtime config from environment..."
cat > "$CONFIG_FILE" <<EOF
window.__APP_CONFIG__ = {
  VITE_API_URL: "${VITE_API_URL}",
  VITE_STRIPE_PUBLISHABLE_KEY: "${VITE_STRIPE_PUBLISHABLE_KEY}",
  VITE_STRIPE_PLUS_PRICE_ID: "${VITE_STRIPE_PLUS_PRICE_ID}",
  VITE_STRIPE_PREMIUM_PRICE_ID: "${VITE_STRIPE_PREMIUM_PRICE_ID}"
};
EOF

echo "    VITE_API_URL=${VITE_API_URL}"
echo "==> Starting nginx..."
exec nginx -g "daemon off;"
