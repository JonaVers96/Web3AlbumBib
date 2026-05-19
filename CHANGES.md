# Wat is er veranderd t.o.v. de originele `frontendweb` repo?

Deze repo is uitgebreid van een **backend-only** project naar een **volledige webshop (backend + frontend)**.

## 1) Frontend toegevoegd (zelfde repo)
- Nieuwe map: `frontend/` (React + Vite + TypeScript) in Webify-stijl.
- React Router routes:
  - `/` store (publiek)
  - `/albums/:id` album detail (publiek)
  - `/cart` winkelmand
  - `/payment/return` status na betaling
  - `/library` aangekochte albums
  - `/login` en `/register`
  - `/admin` (admin dashboard) met subpagina's voor albums, artists en users
- State management via React Context:
  - `AuthContext` (JWT login/register + current user)
  - `CartContext` (winkelmand in localStorage)

## 2) Backend uitgebreid tot webshop
- Publieke catalog endpoints:
  - `GET /api/albums/catalog` (zoeken, filteren, paginatie)
  - `GET /api/albums/catalog/:id`
- Library endpoints voor ingelogde users:
  - `GET /api/albums`
  - `DELETE /api/albums/me/:id`
- Admin endpoints:
  - CRUD albums en artists
  - `GET /api/albums/admin/export` (CSV export)
  - users beheren + rollen aanpassen

## 3) Mollie checkout + webhook
- `POST /api/payments/checkout` maakt een betaling voor meerdere albums.
- `POST /api/webhooks/mollie` synchroniseert status en kent albums toe na succesvolle betaling.
- Zonder `MOLLIE_API_KEY` werkt er een dev-fallback zodat je lokaal zonder Mollie kunt testen.

## 4) JPEG upload voor album covers
- `POST /api/uploads/album-cover` (admin-only) accepteert enkel `.jpg/.jpeg`.
- Bestanden worden publiek geserveerd via `/uploads/...`.

## 5) Developer experience
- Root scripts om backend en frontend samen te starten:
  - `yarn dev`, `yarn dev:api`, `yarn dev:web`, `yarn install:all`
- `.env.example` toegevoegd en gecorrigeerd naar MySQL + shadow DB.
- `docker-compose.yml` toegevoegd om MySQL snel te starten.

## 6) Kleine betrouwbaarheid-fix
- CORS origin handling robuuster gemaakt: requests zonder `Origin` header (bv. swagger/curl) crashen niet.
