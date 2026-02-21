# Admin Instructions

This document is the operational runbook for managing the Pensador website in production.

## 1. System Overview

- Framework: Next.js 16 App Router (`npm run build`, `npm start`)
- Node runtime required: `>=24`
- Main routes: `/`, `/research`, `/library`, `/library/pensador`, `/how-to-use`
- Chatbot API: `/api/chatbot` (`GET`, `POST`, `DELETE`)
- Web server setup (recommended): Nginx reverse proxy + systemd service (`pensador-website`)

Important chatbot note:
- Chat history is now server-side session-based (not client cookie history).
- Current session store is in-memory (`lib/chatbot/session-store.ts`), so sessions reset on app restart/deploy.

## 2. Required Environment Variables

Copy `.env.example` to `.env` and set production values.

Critical:
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_PRIVACY_URL`
- `NEXT_PUBLIC_TERMS_URL`
- `NEXT_PUBLIC_SUPPORT_URL`

Analytics:
- `NEXT_PUBLIC_GTM_ID` (preferred) or `NEXT_PUBLIC_GA4_MEASUREMENT_ID`

Chatbot guard tuning (optional):
- `CHATBOT_RATE_LIMIT_WINDOW_MS`
- `CHATBOT_RATE_LIMIT_PER_IP`
- `CHATBOT_RATE_LIMIT_PER_SESSION`
- `CHATBOT_SPIKE_ALERT_PER_MINUTE`
- `CHATBOT_SPIKE_ALERT_PER_IP_PER_MINUTE`

## 3. Deployment and Release

Production directory (as documented): `/opt/pensador-website`

Standard deploy:
```bash
cd /opt/pensador-website
git pull --ff-only
npm ci
npm run lint
npm run build
sudo systemctl restart pensador-website
sudo systemctl status pensador-website --no-pager
sudo nginx -t && sudo systemctl reload nginx
```

Shortcut:
```bash
/opt/pensador-website/deploy.sh
```

## 4. Service Operations

Systemd:
```bash
sudo systemctl status pensador-website --no-pager
sudo systemctl restart pensador-website
sudo systemctl stop pensador-website
sudo systemctl start pensador-website
```

Logs:
```bash
sudo journalctl -u pensador-website -n 200 --no-pager
sudo journalctl -u pensador-website -f
```

Nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
sudo systemctl status nginx --no-pager
```

## 5. Content and Marketing Updates

Most text updates are in:
- `content/site-copy.ts`

Then validate:
```bash
npm run lint
npm run build
```

Deploy after validation.

## 6. Chatbot Admin Notes

- Route file: `app/api/chatbot/route.ts`
- Request protection: `lib/chatbot/request-guard.ts`
- Session store: `lib/chatbot/session-store.ts`

Behavior in production:
- Origin checks are enforced.
- Per-IP and per-session rate limits are enforced.
- Spike alerts are logged via server logs (`[chatbot] ...`).
- Request body byte-size limit enforced before JSON parsing.

Quick API health checks:
```bash
curl -i https://YOUR_DOMAIN/api/chatbot
curl -i -X POST https://YOUR_DOMAIN/api/chatbot \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello"}'
```

## 7. Security and Secret Handling

- Never commit real tokens/keys in docs, code, or examples.
- Rotate `OPENAI_API_KEY` immediately if exposure is suspected.
- Keep `.env` only on server; file is gitignored.
- Review deployment docs before publishing (remove real domain/token/email examples).
- Restrict SSH (port 22) to admin IPs only.

## 8. Monitoring and Alerts

Minimum monitoring checklist:
- HTTP uptime on site root and `/api/chatbot`
- service status: `pensador-website` and `nginx`
- server logs for:
  - `[chatbot] rate limit exceeded`
  - `[chatbot] blocked by origin policy`
  - `[chatbot] global traffic spike`
  - `[chatbot] per-ip traffic spike`
  - OpenAI request failures

Recommended:
- Add external uptime checks (1-min interval)
- Add log shipping/alerting (CloudWatch, Datadog, ELK, etc.)

## 9. Incident Response (Quick Runbook)

1. Confirm impact:
```bash
curl -I https://YOUR_DOMAIN
sudo systemctl status pensador-website --no-pager
sudo systemctl status nginx --no-pager
```

2. Check recent logs:
```bash
sudo journalctl -u pensador-website -n 200 --no-pager
```

3. If config/env changed, rebuild and restart:
```bash
cd /opt/pensador-website
npm run build
sudo systemctl restart pensador-website
```

4. Validate Nginx:
```bash
sudo nginx -t && sudo systemctl reload nginx
```

5. If chatbot errors persist, verify `OPENAI_API_KEY` is loaded in service environment.

## 10. Reference Documents

- `README.md`
- `HOW_TO_RUN.md`
- `HOW_TO_EDIT_CONTENT.md`
- `CONNECT_DATALAYER.md`
- `INSTALL_WEBSITE_UBUNTU_AWS_EC2.md`
- `WEBSITE_IMPROVEMENTS.md`
