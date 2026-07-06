#!/bin/bash
# MarqueeFlow POS — one-time VPS setup
# SAFE: only creates marqueeflow-pos* paths. Does NOT touch MarqueeFlow or AluRate.
set -euo pipefail

echo "=== MarqueeFlow POS one-time setup ==="
echo "This script only creates POS directories and MySQL databases."
echo "It will NOT modify /var/www/marqueeflow*, /var/www/alurate*, or their PM2 processes."
echo ""

# Directories
DIRS=(
  /var/www/marqueeflow-pos-repo
  /var/www/marqueeflow-pos/dist
  /var/www/marqueeflow-pos-staging/dist
  /var/www/marqueeflow-pos-backend/dist
  /var/www/marqueeflow-pos-backend-staging/dist
  /var/www/marqueeflow-pos-uploads
  /var/www/marqueeflow-pos-staging-uploads
  /var/log/marqueeflow-pos
  /root/backups/marqueeflow-pos/daily
)

for d in "${DIRS[@]}"; do
  mkdir -p "$d"
  echo "  created $d"
done

echo ""
echo "=== Next steps (manual) ==="
echo "1. DNS: A records pos + staging.pos -> this server IP"
echo "2. MySQL: create marqueeflow_pos_db + marqueeflow_pos_db_staging + mf_pos_user"
echo "3. Run backend/migrations/*.sql on staging DB first"
echo "4. Clone repo to /var/www/marqueeflow-pos-repo"
echo "5. Copy deploy/ecosystem.*.config.cjs to backend dirs (fill secrets)"
echo "6. Copy deploy/nginx/*.conf to /etc/nginx/sites-available/, certbot, nginx reload"
echo "7. pm2 start marqueeflow-pos-backend-staging, smoke test, then production"
echo ""
echo "=== PM2 names used (POS only) ==="
echo "  marqueeflow-pos-backend         :8085"
echo "  marqueeflow-pos-backend-staging :8088"
echo ""
echo "=== DO NOT TOUCH ==="
echo "  marqueeflow-backend*  (booking API :4010/:4012)"
echo "  alurate-*             (AluRate)"
