[![Open in Visual Studio Code](https://classroom.github.com/assets/open-in-vscode-2e0aaae1b6195c2367325f4f02e2d04e9abb55f0b24a779b69b11b9e10269abc.svg)](https://classroom.github.com/online_ide?assignment_repo_id=21310114&assignment_repo_type=AssignmentRepo)

# Frontendweb webshop – Web 3

Welkom op de repo van mijn project voor het vak Web 3.

 Dit is een volledige webshop geworden voor de verkoop van digitale muziekalbums. De applicatie bestaat uit een Node.js backend en een React frontend.

 ## Wat heb ik gebruikt?
- Backend: Node.js, Koa, Prisma, MySQL. (Inclusief JWT authenticatie, file uploads en een Mollie integratie).

- Frontend: React, Vite, TypeScript, Tailwind CSS v4.

- Toegang: Iedereen kan de store bekijken. Om effectief albums af te rekenen en aan je persoonlijke 'library' toe te voegen, moet je inloggen. Er is ook een afgeschermd admin dashboard voorzien.

---

## 1) Vereisten om op te starten

Zorg dat je het volgende op je systeem hebt staan voordat je begint:
- Node.js (v18 of hoger aanbevolen)
- Yarn (voor de installatiescriptjes)
- MySQL of Docker (voor de databases)

## 2) Database starten (MySQL)

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

## 3) Applicatie opstarten


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

## 4) Seed accounts
Bij `yarn migrate:dev` wordt er automatisch seed data geplaatst.

---

## 5) Mollie

Zonder `MOLLIE_API_KEY` werkt de webshop nog steeds: de backend gebruikt dan een **dev-fallback** die een checkout meteen als `paid` markeert.

Met een echte Mollie test key:
- zet `MOLLIE_API_KEY=test_...` in `.env`
- als je webhook extern wil testen, gebruik ngrok en zet `PUBLIC_BASE_URL` correct.

Webhook endpoint:
- `POST /api/webhooks/mollie`


## 6) API (high-level)
Base prefix: `/api`

- `GET /albums/catalog` (publiek, optionele auth => `isOwned`)
- `GET /albums/catalog/:id` (publiek)
- `GET /albums` (library van ingelogde user)
- `DELETE /albums/:id` (Verwijder een album uit bibliotheek)   
- `POST /payments/checkout` (Mollie checkout)
- `POST /webhooks/mollie` (Mollie webhook)

