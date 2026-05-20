[![Open in Visual Studio Code](https://classroom.github.com/assets/open-in-vscode-2e0aaae1b6195c2367325f4f02e2d04e9abb55f0b24a779b69b11b9e10269abc.svg)](https://classroom.github.com/online_ide?assignment_repo_id=21310114&assignment_repo_type=AssignmentRepo)

# Frontendweb webshop (publiek) – Web 3 / Webify stijl

Deze repo bevat een  webshop voor het kopen van digitale albums.

- **Backend** (Node + Koa + Prisma + MySQL): REST API, JWT auth, admin CRUD, upload (JPEG), Mollie checkout + webhook.
- **Frontend** (React + Vite + TypeScript + Tailwind): store (publiek), cart, login/register, library (aangekochte albums), admin dashboard.

## Wat is er publiek?
- De **catalogus** (store) is publiek: je kan albums bekijken zonder login.
- **Afrekenen** gebeurt via Mollie en vereist een login (om aankopen te linken aan een gebruiker).

---

## 1) Database starten (MySQL)

### Optie A: MySQL lokaal
Zorg dat MySQL draait en dat je 2 databases hebt:
- `webify_shop`
- `webify_shop_shadow`

### Optie B: via Docker
In de root staat een `docker-compose.yml`.

```bash
docker compose up -d
```

---

## 2) Backend + frontend starten

### .env instellen
Kopieer `.env.example` naar `.env` en pas aan indien nodig.

Belangrijkste variabelen:
- `DATABASE_URL`
- `SHADOW_DATABASE_URL`
- `AUTH_JWT_SECRET`
- `MOLLIE_API_KEY` (optioneel)

### Install + migrate + run

```bash
# Installeer backend + frontend
YARN_ENABLE_IMMUTABLE_INSTALLS=false yarn install:all

# Prisma migrations + seed
yarn migrate:dev

# Start backend + frontend samen
yarn dev
```

Of apart:

```bash
# Alleen backend
yarn dev:api

# Alleen frontend
yarn dev:web
```

- Backend draait op: http://localhost:9000
- Frontend draait op: http://localhost:5173
- Swagger (development): http://localhost:9000/swagger

---

## Seed accounts
Bij `yarn migrate:dev` wordt er automatisch seed data geplaatst.

- **Admin**
  - email: `jonas.verstraeten@student.hogent.be`
  - password: `Password123456`

---

## Mollie (optioneel)

Zonder `MOLLIE_API_KEY` werkt de webshop nog steeds: de backend gebruikt dan een **dev-fallback** die een checkout meteen als `paid` markeert.

Met een echte Mollie test key:
- zet `MOLLIE_API_KEY=test_...` in `.env`
- als je webhook extern wil testen, gebruik ngrok en zet `PUBLIC_BASE_URL` correct.

Webhook endpoint:
- `POST /api/webhooks/mollie`

---

## Upload (JPEG covers)
Admin kan JPEG covers uploaden via:
- `POST /api/uploads/album-cover` (multipart form-data, field: `file`)

De cover URL die je terugkrijgt kan je opslaan in `Album.coverImageUrl`.
De bestanden zijn publiek zichtbaar via:
- `/uploads/covers/<bestandsnaam>.jpg`

---

## API (high-level)
Base prefix: `/api`

- `GET /albums/catalog` (publiek, optionele auth => `isOwned`)
- `GET /albums/catalog/:id` (publiek)
- `GET /albums` (library van ingelogde user)
- `POST /payments/checkout` (Mollie checkout)
- `POST /webhooks/mollie` (Mollie webhook)
- `POST /uploads/album-cover` (admin upload JPEG)

