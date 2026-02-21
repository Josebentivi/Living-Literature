# Install Pensador Website on Ubuntu AWS EC2

This guide deploys this project on **Ubuntu EC2** using **Next.js server runtime + Nginx + HTTPS**.

## 1. Deployment model

This project uses Next.js App Router with a server runtime because it includes dynamic routes such as `/api/chatbot`.
- Build step: `npm run build`
- Runtime output: `.next/`
- App server: `next start` (Node process required at runtime)
- Web server: Nginx reverse proxy in front of Next.js
- Build engine: webpack (configured in npm scripts for stability)

## 2. Prerequisites

- AWS account
- DuckDNS subdomain (or custom domain)
- SSH key pair for EC2
- Git repository URL for this project
- Project requirements reference: `requirements.txt`

## 3. Create EC2 instance

1. Launch instance:
- AMI: `Ubuntu Server 24.04 LTS` (or `22.04 LTS`)
- Instance type: `t3.small` or higher
- Storage: at least `20 GB`

2. Security Group inbound rules:
- `22` (SSH) from your IP only
- `80` (HTTP) from `0.0.0.0/0` and `::/0`
- `443` (HTTPS) from `0.0.0.0/0` and `::/0`

3. Assign an Elastic IP (recommended) and attach it to the instance.

## 4. Connect to server

From your local machine:

```bash
ssh -i /path/to/key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

## 5. Install system packages

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl nginx ca-certificates
```

Enable/start Nginx:

```bash
sudo systemctl enable nginx
sudo systemctl start nginx
```

## 6. Install Node.js 24 with NVM

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.nvm/nvm.sh
nvm install 24
nvm alias default 24
node -v
npm -v
```

Expected: Node `v24.x.x`.
Minimum versions are listed in `requirements.txt`.

## 7. Clone and configure project

```bash
sudo mkdir -p /opt/pensador-website
sudo chown -R $USER:$USER /opt/pensador-website
git clone YOUR_REPOSITORY_URL /opt/pensador-website
cd /opt/pensador-website
```

Create environment file:

```bash
cp .env.example .env
nano .env
```

Set production values at minimum:
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_PRIVACY_URL`
- `NEXT_PUBLIC_TERMS_URL`
- `NEXT_PUBLIC_SUPPORT_URL`
- `NEXT_PUBLIC_GTM_ID` or `NEXT_PUBLIC_GA4_MEASUREMENT_ID`
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_CHATBOT_ENABLED=true`

Important:
- `NEXT_PUBLIC_*` variables are baked at build time.
- Every `.env` change requires a new `npm run build`.

DuckDNS example values:
- `NEXT_PUBLIC_SITE_URL=https://YOUR_SUBDOMAIN.duckdns.org`
- `NEXT_PUBLIC_PRIVACY_URL=https://YOUR_SUBDOMAIN.duckdns.org/privacy`
- `NEXT_PUBLIC_TERMS_URL=https://YOUR_SUBDOMAIN.duckdns.org/terms`

## 8. Install dependencies and build

```bash
npm ci
npm run lint
npm run build
```

After build, confirm `.next/` exists:

```bash
ls -la .next
```

Notes:
- `npm run build` already uses webpack (`next build --webpack`).
- If you manually run Turbopack and get panics, use the default npm scripts above.

## 9. Run Next.js app as a systemd service

```bash
sudo tee /etc/systemd/system/pensador-website.service >/dev/null <<'EOF'
[Unit]
Description=Pensador Next.js Website
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/opt/pensador-website
Environment=NODE_ENV=production
EnvironmentFile=/opt/pensador-website/.env
ExecStart=/bin/bash -lc 'source /home/ubuntu/.nvm/nvm.sh && nvm use 24 >/dev/null && npm start'
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now pensador-website
sudo systemctl status pensador-website --no-pager
```

## 10. Nginx pre-SSL note (standalone flow)

Important:
- This guide uses Certbot **standalone** mode.
- Do **not** configure a `443 ssl` Nginx block before certificate issuance.
- Final Nginx HTTPS config is created in section `12`, after certificate files exist.

## 11. Point DNS to EC2

### 11.1 Fill in your real DuckDNS values (copy/paste)

How to get real values from DuckDNS:
1. Open `https://www.duckdns.org` and sign in.
2. In `domains`, type your desired subdomain (example: `pensadorweb`) and click `add domain`.
3. Copy your `token` shown on the dashboard.
4. On EC2, run the block below and replace the token value.

```bash
DUCKDNS_SUBDOMAIN="literaturaviva"
DUCKDNS_TOKEN="PASTE_REAL_DUCKDNS_TOKEN_HERE"
EC2_PUBLIC_IP="$(curl -s https://checkip.amazonaws.com | tr -d '\n')"

echo "FQDN: ${DUCKDNS_SUBDOMAIN}.duckdns.org"
echo "IP: ${EC2_PUBLIC_IP}"
```

```bash
DUCKDNS_SUBDOMAIN="literaturaviva"
DUCKDNS_TOKEN="a7c4d0ad-114e-40ef-ba1d-d217904a50f2"
EC2_PUBLIC_IP="$(curl -s https://checkip.amazonaws.com | tr -d '\n')"

echo "FQDN: ${DUCKDNS_SUBDOMAIN}.duckdns.org"
echo "IP: ${EC2_PUBLIC_IP}"
```

Update DuckDNS with your current EC2 public IP:

```bash
curl "https://www.duckdns.org/update?domains=${DUCKDNS_SUBDOMAIN}&token=${DUCKDNS_TOKEN}&ip=${EC2_PUBLIC_IP}"
```

```bash
curl "https://www.duckdns.org/update?domains=${literaturaviva}&token=$a7c4d0ad-114e-40ef-ba1d-d217904a50f2&ip=$54.196.142.214"
```

Expected output: `OK`

Verify DNS:

```bash
nslookup "${DUCKDNS_SUBDOMAIN}.duckdns.org"
```

```bash
nslookup "$literaturaviva.duckdns.org"
```

Optional direct example:

```bash
curl "https://www.duckdns.org/update?domains=pensadorweb&token=PASTE_REAL_DUCKDNS_TOKEN_HERE&ip=$(curl -s https://checkip.amazonaws.com | tr -d '\n')"
nslookup pensadorweb.duckdns.org
```

### 11.2 Where to use your real DuckDNS subdomain

Use the same real FQDN in all these places:
- `.env`
  - `NEXT_PUBLIC_SITE_URL=https://pensadorweb.duckdns.org`
  - `NEXT_PUBLIC_PRIVACY_URL=https://pensadorweb.duckdns.org/privacy`
  - `NEXT_PUBLIC_TERMS_URL=https://pensadorweb.duckdns.org/terms`
- Nginx config
  - `server_name pensadorweb.duckdns.org;`
- Certbot command
  - `sudo certbot certonly --standalone -d pensadorweb.duckdns.org --agree-tos -m YOUR_EMAIL@example.com --non-interactive`

### Optional: Auto-update DuckDNS IP (if not using Elastic IP)

Create update script:

```bash
sudo tee /usr/local/bin/duckdns-update.sh >/dev/null <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
DOMAIN="YOUR_SUBDOMAIN"
TOKEN="YOUR_DUCKDNS_TOKEN"
curl -fsS "https://www.duckdns.org/update?domains=${DOMAIN}&token=${TOKEN}&ip="
EOF
sudo chmod 700 /usr/local/bin/duckdns-update.sh
```

```bash
sudo tee /usr/local/bin/duckdns-update.sh >/dev/null <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
DOMAIN="literaturaviva"
TOKEN="a7c4d0ad-114e-40ef-ba1d-d217904a50f2"
curl -fsS "https://www.duckdns.org/update?domains=${DOMAIN}&token=${TOKEN}&ip="
EOF
sudo chmod 700 /usr/local/bin/duckdns-update.sh
```

Create systemd service:

```bash
sudo tee /etc/systemd/system/duckdns-update.service >/dev/null <<'EOF'
[Unit]
Description=Update DuckDNS dynamic IP
After=network-online.target
Wants=network-online.target

[Service]
Type=oneshot
ExecStart=/usr/local/bin/duckdns-update.sh
EOF
```

Create systemd timer (every 5 minutes):

```bash
sudo tee /etc/systemd/system/duckdns-update.timer >/dev/null <<'EOF'
[Unit]
Description=Run DuckDNS updater every 5 minutes

[Timer]
OnBootSec=1min
OnUnitActiveSec=5min
Unit=duckdns-update.service

[Install]
WantedBy=timers.target
EOF
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now duckdns-update.timer
sudo systemctl start duckdns-update.service
sudo systemctl status duckdns-update.timer --no-pager
```

## 12. Issue SSL certificate with Certbot

Install certbot:

```bash
sudo apt install -y certbot
```

Stop Nginx and issue certificate in standalone mode:

```bash
sudo systemctl stop nginx
sudo certbot certonly --standalone \
  -d YOUR_SUBDOMAIN.duckdns.org \
  --agree-tos -m YOUR_EMAIL@example.com --non-interactive
```

```bash
sudo systemctl stop nginx
sudo certbot certonly --standalone \
  -d literaturaviva.duckdns.org \
  --agree-tos -m luminuslpa@gmail.com --non-interactive
```

Confirm certificate files were created:

```bash
sudo ls -la /etc/letsencrypt/live/YOUR_SUBDOMAIN.duckdns.org/
```

```bash
sudo ls -la /etc/letsencrypt/live/literaturaviva.duckdns.org/
```

Now create the final HTTPS Nginx config:

```bash
sudo nano /etc/nginx/sites-available/pensador-website
```

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name YOUR_SUBDOMAIN.duckdns.org;

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name YOUR_SUBDOMAIN.duckdns.org;

    ssl_certificate /etc/letsencrypt/live/YOUR_SUBDOMAIN.duckdns.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/YOUR_SUBDOMAIN.duckdns.org/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:10m;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```


```nginx
server {
    listen 80;
    listen [::]:80;
    server_name literaturaviva.duckdns.org;

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name literaturaviva.duckdns.org;

    ssl_certificate /etc/letsencrypt/live/literaturaviva.duckdns.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/literaturaviva.duckdns.org/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:10m;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    root /var/www/pensador-website;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    location ~* \.(?:css|js|png|jpg|jpeg|gif|svg|webp|ico|woff2?)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }
}
``` 

Enable the site, validate, and reload Nginx:

```bash
sudo ln -sf /etc/nginx/sites-available/pensador-website /etc/nginx/sites-enabled/pensador-website
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl start nginx
sudo systemctl reload nginx
```

Test HTTPS and renewal:

```bash
curl -I https://YOUR_SUBDOMAIN.duckdns.org
sudo certbot renew --dry-run --pre-hook "systemctl stop nginx" --post-hook "systemctl start nginx"
```

```bash
curl -I https://literaturaviva.duckdns.org
sudo certbot renew --dry-run --pre-hook "systemctl stop nginx" --post-hook "systemctl start nginx"
```

### 12.1 HTTPS activation checklist

Run these in order:
1. Ensure DNS is already pointing to this EC2 (`nslookup YOUR_SUBDOMAIN.duckdns.org`).
2. Stop Nginx:
   - `sudo systemctl stop nginx`
3. Issue certificate with standalone:
   - `sudo certbot certonly --standalone -d YOUR_SUBDOMAIN.duckdns.org --agree-tos -m YOUR_EMAIL@example.com --non-interactive`
4. Replace Nginx file with the final HTTPS config in this section (`443 ssl` block + HTTP redirect), then enable site symlink.
5. Start and validate Nginx configuration:
   - `sudo nginx -t && sudo systemctl start nginx && sudo systemctl reload nginx`
6. Validate HTTPS:
   - `curl -I https://YOUR_SUBDOMAIN.duckdns.org`
   - open `https://YOUR_SUBDOMAIN.duckdns.org` in browser

## 13. Update/redeploy workflow

From EC2:

```bash
cd /opt/pensador-website
git pull --ff-only
nvm use 24
npm ci
npm run lint
npm run build
sudo systemctl restart pensador-website
sudo systemctl status pensador-website --no-pager
sudo nginx -t && sudo systemctl reload nginx
```

## 14. Optional deploy script

Create script:

```bash
nano /opt/pensador-website/deploy.sh
```

```bash
#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/opt/pensador-website"
NVM_DIR="/home/ubuntu/.nvm"
NODE_VERSION="24"
SERVICE_NAME="pensador-website"

cd "$APP_DIR"
git pull --ff-only

if [ -s "$NVM_DIR/nvm.sh" ]; then
  # shellcheck disable=SC1091
  source "$NVM_DIR/nvm.sh"
  nvm use "$NODE_VERSION" >/dev/null
fi

npm ci
npm run lint
npm run build

sudo systemctl restart "$SERVICE_NAME"
sudo systemctl status "$SERVICE_NAME" --no-pager

sudo nginx -t
sudo systemctl reload nginx

echo "Deploy completed successfully (Next.js server mode)."
```

Make executable:

```bash
chmod +x /opt/pensador-website/deploy.sh
```

Run:

```bash
/opt/pensador-website/deploy.sh
```

## 15. Analytics activation

After setting GTM/GA4 env vars and rebuilding:
- Verify `window.dataLayer` events in browser devtools
- Verify tags/events in GTM Preview + GA4 DebugView

Full instructions are in:
- `CONNECT_DATALAYER.md`
- `HOW_TO_RUN.md`

## 16. Troubleshooting

- Site loads old content:
  - Rebuild and restart service: `npm run build && sudo systemctl restart pensador-website`.
- `.env` changes not visible:
  - Rebuild and restart service after env changes.
- Build fails due Node version:
  - Confirm `node -v` is `24.x` and run `nvm use 24`.
- Nginx error after config:
  - Run `sudo nginx -t` and fix reported line.
- SSL not issuing:
  - Confirm `YOUR_SUBDOMAIN.duckdns.org` resolves to this EC2 and ports `80/443` are open.
- Certbot standalone says port 80 is already in use:
  - Stop Nginx before issuance/renewal (`sudo systemctl stop nginx`) and check listeners with `sudo ss -ltnp | grep ':80'`.
- DuckDNS URL not resolving:
  - Re-run DuckDNS update API call and verify token/domain values.
- Site stopped working after IP change:
  - If no Elastic IP, enable the DuckDNS updater timer in section 11.
- Chatbot not answering in production:
  - Verify `OPENAI_API_KEY` is present in `/opt/pensador-website/.env`.
  - Ensure the key format is `OPENAI_API_KEY=...` (do not prefix with `export`).
  - Ensure the service references that file: `sudo systemctl cat pensador-website | grep -n EnvironmentFile`.
  - After env/service changes: `sudo systemctl daemon-reload && sudo systemctl restart pensador-website`.
  - Confirm the running service has the variable loaded:
    - `sudo systemctl show pensador-website --property=Environment | sed 's/ /\\n/g' | grep '^OPENAI_API_KEY=' | sed 's/=.*$/=<set>/'`
  - Check runtime logs: `sudo journalctl -u pensador-website -n 100 --no-pager`.
- Website returns 502:
  - Ensure `pensador-website` service is running and listening on port `3000`.
- Turbopack panic:
  - Use default scripts (`npm run dev` / `npm run build`) which are configured with webpack.

## 17. Quick production checklist

1. Instance hardened (SSH restricted to your IP).
2. DuckDNS hostname + HTTPS active.
3. `.env` production values finalized.
4. Build/lint passing.
5. `pensador-website` systemd service active (`next start` running).
6. Nginx proxying to `127.0.0.1:3000`.
7. DuckDNS updater active (or Elastic IP attached).
8. Analytics events validated.
9. Chatbot env configured (`OPENAI_API_KEY`, `NEXT_PUBLIC_CHATBOT_ENABLED`).
