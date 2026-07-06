# MarqueeFlow POS — Deployment Guide

**VPS:** `187.77.86.114` (`srv1616304.hstgr.cloud`)  
**Production:** https://pos.marqueeflow.com  
**Staging:** https://staging.pos.marqueeflow.com  
**GitHub:** https://github.com/azeemar3602/MarqueeFlow-POS (create and push)

---

## Isolation guarantee

This POS stack is **fully separate** from existing apps on the VPS:

| | MarqueeFlow POS | MarqueeFlow Booking | AluRate |
|--|-----------------|---------------------|---------|
| **Paths** | `/var/www/marqueeflow-pos*` | `/var/www/marqueeflow*` | `/var/www/alurate*` |
| **PM2** | `marqueeflow-pos-backend*` | `marqueeflow-backend*` | `alurate-*` |
| **Ports** | `8085` / `8088` | `4010` / `4012` | (unchanged) |
| **MySQL DB** | `marqueeflow_pos_db*` | (booking DBs) | (alurate DBs) |
| **nginx** | `pos.marqueeflow.com` only | `api.marqueeflow.com` etc. | (unchanged) |

Deploy scripts and CI **never** `cd` into MarqueeFlow or AluRate directories.

---

## Phase 1 — GitHub

1. Create repo `azeemar3602/MarqueeFlow-POS` on GitHub (empty or from this clone)
2. Push branches `staging` and `main`
3. Reuse existing secrets from MarqueeFlow (same VPS):
   - `VPS_SSH_HOST` = `187.77.86.114`
   - `VPS_SSH_USER` = `root` (or deploy user)
   - `VPS_SSH_PRIVATE_KEY`
   - `VPS_SSH_PORT` = `22` (optional)
4. Create GitHub Environments: `staging`, `production` (prod requires manual approval)

---

## Phase 2 — DNS (Hostinger hPanel)

Add **only** these records for `marqueeflow.com`:

| Type | Name | Value |
|------|------|-------|
| A | `pos` | `187.77.86.114` |
| A | `staging.pos` | `187.77.86.114` |

Do **not** change existing `api`, `admin`, or root records.

---

## Phase 3 — VPS one-time setup (SSH)

```bash
# 1. Create POS-only directories
bash deploy/vps-one-time-setup.sh

# 2. Clone repo (build source — never build in serve dirs)
cd /var/www
git clone https://github.com/azeemar3602/MarqueeFlow-POS.git marqueeflow-pos-repo

# 3. MySQL (POS databases only)
mysql -u root -p <<'SQL'
CREATE DATABASE marqueeflow_pos_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE marqueeflow_pos_db_staging CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'mf_pos_user'@'localhost' IDENTIFIED BY 'STRONG_PASSWORD_HERE';
GRANT ALL ON marqueeflow_pos_db.* TO 'mf_pos_user'@'localhost';
GRANT ALL ON marqueeflow_pos_db_staging.* TO 'mf_pos_user'@'localhost';
FLUSH PRIVILEGES;
SQL

# 4. Run migrations on STAGING first
cd /var/www/marqueeflow-pos-repo/backend/migrations
for f in *.sql; do mysql -u mf_pos_user -p marqueeflow_pos_db_staging < "$f"; done

# 5. PM2 configs (edit secrets first!)
cp /var/www/marqueeflow-pos-repo/deploy/ecosystem.staging.config.cjs /var/www/marqueeflow-pos-backend-staging/ecosystem.config.cjs
cp /var/www/marqueeflow-pos-repo/deploy/ecosystem.production.config.cjs /var/www/marqueeflow-pos-backend/ecosystem.config.cjs
# Edit both files: DB password, JWT_SECRET, MAIL_PASS

# 6. nginx (new vhosts only — does not edit MarqueeFlow configs)
cp deploy/nginx/pos.marqueeflow.com.conf /etc/nginx/sites-available/
cp deploy/nginx/staging.pos.marqueeflow.com.conf /etc/nginx/sites-available/
ln -sf /etc/nginx/sites-available/pos.marqueeflow.com.conf /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/staging.pos.marqueeflow.com.conf /etc/nginx/sites-enabled/
certbot --nginx -d pos.marqueeflow.com
certbot --nginx -d staging.pos.marqueeflow.com
nginx -t && systemctl reload nginx

# 7. First staging build + PM2
cd /var/www/marqueeflow-pos-repo && git checkout staging
# ... (same as CI deploy script, or push to staging branch to trigger Actions)
pm2 start /var/www/marqueeflow-pos-backend-staging/ecosystem.config.cjs
pm2 save
```

---

## Phase 4 — Email

Use Hostinger mailbox `support@marqueeflow.com`:

- SMTP host: `smtp.hostinger.com`
- Port: `465` (SSL)
- Generate app password in hPanel → Emails
- Set `MAIL_USER`, `MAIL_PASS`, `ADMIN_EMAIL` in PM2 ecosystem config

---

## Phase 5 — Super admin (fresh DB)

After migrations, create the first super admin (replace bcrypt hash):

```sql
USE marqueeflow_pos_db_staging;
INSERT INTO super_admins (email, password_hash, name)
VALUES ('you@marqueeflow.com', '$2a$10$...', 'Admin');
```

Or register a test shop at `/register` and approve via `/superadmin`.

---

## Phase 6 — Smoke test (staging)

1. https://staging.pos.marqueeflow.com loads with MarqueeFlow branding
2. Register → approve → login
3. Add product + image (thumbnails work)
4. Create sale (cash + credit)
5. Offline sale sync
6. Email arrives at `support@marqueeflow.com`

Then run migrations on `marqueeflow_pos_db`, deploy `main` to production.

---

## CI/CD flow

```
feature branch → PR → staging → auto-deploy staging → smoke test
                  → PR staging → main → approve → prod deploy
```

DB migrations: **manual** before prod deploy, after backup.

---

## Backups (POS only)

```bash
# /root/backups/marqueeflow_pos_backup.sh — cron 0 2 * * *
mysqldump marqueeflow_pos_db | gzip > /root/backups/marqueeflow-pos/daily/pos_$(date +%F).sql.gz
find /root/backups/marqueeflow-pos/daily -mtime +7 -delete
```

---

## Rollback

```bash
cd /var/www/marqueeflow-pos-repo
git checkout <previous-sha>
# rebuild + rsync dist (same as deploy script)
pm2 reload marqueeflow-pos-backend
```

Never run `npm run build` inside `/var/www/marqueeflow-pos/dist` serve directories.
