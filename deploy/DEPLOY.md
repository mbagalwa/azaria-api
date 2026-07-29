# Déploiement de l'API Azaria — VPS Ubuntu, Node natif (systemd + Nginx)

Cible : serveur Ubuntu que tu gères en SSH, **PostgreSQL déjà en place**, domaine
`api.azaria.cd` prêt (enregistrement DNS A/AAAA vers l'IP du serveur).

> Remplace partout `api.azaria.cd`, `admin.azaria.cd`, `azaria.cd` par tes vrais
> domaines. Les commandes sont à lancer **sur le serveur**.

---

## 0. Layout retenu

```
/opt/azaria/
├── azaria-api/            # clone git (code source + dossier build/)
│   └── build/             # sortie de `node ace build` ; build/.env → lien vers shared/.env
└── shared/.env            # secrets de production (persistent entre déploiements)
```

---

## 1. Utilisateur système + dossiers

```bash
sudo adduser --system --group --home /opt/azaria azaria
sudo mkdir -p /opt/azaria/shared
sudo chown -R azaria:azaria /opt/azaria
```

## 2. Node 22 LTS + pnpm

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs git
sudo npm i -g pnpm@10
node -v            # v22.x  → /usr/bin/node (utilisé par le service systemd)
```

## 3. PostgreSQL (déjà installé)

Crée la base + le rôle si ce n'est pas déjà fait, et note les identifiants pour le `.env` :

```bash
sudo -u postgres psql
```
```sql
CREATE ROLE azaria LOGIN PASSWORD 'un_mot_de_passe_solide';
CREATE DATABASE azaria_db OWNER azaria;
\q
```
> Si la base existe déjà, saute cette étape — récupère juste host/port/user/pass/db.

## 4. Récupérer le code (git)

Le dépôt est privé (`git@github.com:mbagalwa/azaria-api.git`) → ajoute une **clé de
déploiement** GitHub pour l'utilisateur `azaria`, puis clone :

```bash
sudo -u azaria ssh-keygen -t ed25519 -f /opt/azaria/.ssh/id_ed25519 -N ''
sudo -u azaria cat /opt/azaria/.ssh/id_ed25519.pub
# → coller cette clé dans GitHub : repo azaria-api → Settings → Deploy keys (read-only)

sudo -u azaria git clone git@github.com:mbagalwa/azaria-api.git /opt/azaria/azaria-api
```

## 5. Secrets de production

```bash
sudo -u azaria cp /opt/azaria/azaria-api/deploy/env.production.example /opt/azaria/shared/.env
sudo chmod 600 /opt/azaria/shared/.env
sudo -u azaria nano /opt/azaria/shared/.env
```
Remplir surtout :
- `DB_*` (identifiants du §3),
- **`CORS_ORIGIN`** = domaines de l'admin + du client (ex. `https://admin.azaria.cd,https://azaria.cd`) — sans ça, le **temps réel** et les appels navigateur sont bloqués,
- `APP_URL=https://api.azaria.cd`, `CUSTOMER_APP_URL`, `ADMIN_APP_URL`,
- Cloudinary, WhatsApp/Telegram (si utilisés).
- `APP_KEY` → généré à l'étape suivante.

## 6. Install + clé + build

```bash
cd /opt/azaria/azaria-api
sudo -u azaria pnpm install --frozen-lockfile

# Génère une APP_KEY et colle-la dans /opt/azaria/shared/.env (ligne APP_KEY=)
sudo -u azaria node ace generate:key --show

sudo -u azaria node ace build
cd build
sudo -u azaria pnpm install --prod --frozen-lockfile
sudo -u azaria ln -sfn /opt/azaria/shared/.env /opt/azaria/azaria-api/build/.env
```

## 7. Migrations + compte admin (une seule fois)

```bash
cd /opt/azaria/azaria-api/build
sudo -u azaria node ace migration:run --force
sudo -u azaria node ace db:seed --files=./database/seeders/admin_user_seeder.js
```
> ⚠️ **Ne lance jamais `node ace db:seed` sans `--files` en production** : les autres
> seeders injectent des **données de démo** (faux clients et commandes).

## 8. Service systemd

```bash
sudo cp /opt/azaria/azaria-api/deploy/azaria-api.service /etc/systemd/system/azaria-api.service
sudo systemctl daemon-reload
sudo systemctl enable --now azaria-api
sudo systemctl status azaria-api --no-pager
curl -s http://127.0.0.1:3333/           # attendu : {"hello":"world"}
```
Logs : `journalctl -u azaria-api -f`

## 9. Nginx + HTTPS

```bash
sudo cp /opt/azaria/azaria-api/deploy/nginx-azaria-api.conf /etc/nginx/sites-available/azaria-api
sudo nano /etc/nginx/sites-available/azaria-api        # server_name = api.azaria.cd
sudo ln -s /etc/nginx/sites-available/azaria-api /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.azaria.cd                  # ajoute le 443 + redirection

curl -s https://api.azaria.cd/                          # {"hello":"world"}
```
Le bloc `/__transmit/` (déjà dans la conf) désactive le buffering : indispensable
pour le **temps réel SSE**.

## 10. Brancher les fronts

Sur les déploiements de l'**admin** et du **client** (séparés), pointer :
- `API_URL=https://api.azaria.cd` (serveur Next),
- `NEXT_PUBLIC_API_URL=https://api.azaria.cd` (navigateur : SSE/temps réel).

Et vérifier que ces domaines figurent bien dans `CORS_ORIGIN`. Après toute
modification du `.env` : `sudo systemctl restart azaria-api`.

## 11. Redéploiements suivants

```bash
sudo -u azaria bash /opt/azaria/azaria-api/deploy/deploy.sh
```
(pull → install → build → deps prod → lien .env → migrations → restart)

---

## Dépannage

| Symptôme | Piste |
|---|---|
| Le service ne démarre pas | `journalctl -u azaria-api -e` — souvent une **variable d'env manquante** (validée au boot par `start/env.ts`). |
| 502 Bad Gateway (Nginx) | L'API n'écoute pas (service down) ou mauvais port → `systemctl status azaria-api`, `curl 127.0.0.1:3333`. |
| Temps réel / toasts KO | Vérifier le bloc `/__transmit/` (buffering off) **et** `CORS_ORIGIN`. |
| CORS bloqué dans le navigateur | Le domaine du front doit être listé dans `CORS_ORIGIN`, puis `restart`. |
| Uploads d'image refusés | `client_max_body_size` (25 Mo dans la conf) + Cloudinary configuré. |

### Note reverse-proxy
L'API tourne derrière Nginx en TLS. Si tu constates des soucis de scheme
(http vs https) dans des liens générés, vérifie `config/app.ts` → `http.trustProxy`
pour faire confiance à `127.0.0.1`.
