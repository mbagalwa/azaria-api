#!/usr/bin/env bash
#
# Redéploiement de l'API Azaria — à lancer SUR LE SERVEUR, en tant que
# l'utilisateur `azaria` :
#
#   sudo -u azaria bash /opt/azaria/azaria-api/deploy/deploy.sh
#
# Fait : git pull → install → build → deps prod → lien .env → migrations → restart.

set -euo pipefail

APP_DIR="${APP_DIR:-/opt/azaria/azaria-api}"
ENV_FILE="${ENV_FILE:-/opt/azaria/shared/.env}"

cd "$APP_DIR"

if [ -d .git ]; then
  echo "→ Récupération du code (git pull)…"
  git pull --ff-only
else
  echo "→ Pas de dépôt git : synchronise le code (rsync/scp) AVANT de lancer ce script."
fi

echo "→ Dépendances (avec dev, nécessaires au build)…"
pnpm install --frozen-lockfile

echo "→ Build…"
node ace build

echo "→ Dépendances de production dans build/…"
cd "$APP_DIR/build"
pnpm install --prod --frozen-lockfile

echo "→ Lien du .env de production…"
ln -sfn "$ENV_FILE" "$APP_DIR/build/.env"

echo "→ Migrations…"
node ace migration:run --force

echo "→ Redémarrage du service…"
sudo systemctl restart azaria-api

echo "✓ Déploiement terminé. Logs : journalctl -u azaria-api -f"
