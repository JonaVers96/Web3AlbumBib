# Dossier

- Student: Jonas Verstraeten
- Studentennummer: 201968383
- E-mailadres: <mailto:jonas.verstraeten@student.hogent.be>
- Demo: <https://hogent.cloud.panopto.eu/Panopto/Pages/Viewer.aspx?id=70b0c55f-940d-4ad6-906a-b33a0166e6c7>
- GitHub-repository: <GITHUB_REPO_LINK_HIERhttps://github.com/HOGENT-frontendweb/frontendweb-2425-JonaVers96/blob/main/dossier.md#dossier>
- Web Services:
  - Online versie: <https://frontendweb-2425-jonavers96.onrender.com/>

## Logingegevens

### Lokaal

- Gebruikersnaam/e-mailadres: test@example.com
- Wachtwoord: test123

### Online

- Gebruikersnaam/e-mailadres: test@example.com
- Wachtwoord: test123

> Er is één testgebruiker beschikbaar om de API te testen. Rollen en autorisatie zijn ingesteld via JWT.

## Projectbeschrijving


Dit project is een RESTful webservice voor het beheren van artiesten, albums en gebruikers.  
Het bevat authenticatie en autorisatie op basis van JWT, invoervalidatie voor alle routes en duidelijke foutafhandeling.  
De databank is opgezet met MySQL (VIC van HOGENT) en beheerd via Prisma met migraties en seeds.

**Domeinmodel / EERD:**

User ───< Album >─── Artist

- **User** heeft meerdere albums
- **Artist** heeft meerdere albums
- **Album** heeft een artiest en kan gekoppeld zijn aan een gebruiker

## API calls

### Gebruikers

- `POST /api/users/register`: nieuwe gebruiker registreren
- `POST /api/users/login`: inloggen en JWT verkrijgen
- `GET /api/users`: alle gebruikers ophalen (admin)
- `GET /api/users/:id`: gebruiker met id ophalen (admin of eigenaar)
- `PUT /api/users/:id`: gebruiker updaten
- `DELETE /api/users/:id`: gebruiker verwijderen

### Artiesten

- `GET /api/artists`: alle artiesten ophalen
- `GET /api/artists/:id`: artiest ophalen op id
- `POST /api/artists`: nieuwe artiest toevoegen
- `PUT /api/artists/:id`: artiest bewerken
- `DELETE /api/artists/:id`: artiest verwijderen

### Albums

- `GET /api/albums`: alle albums ophalen
- `GET /api/albums/:id`: album ophalen op id
- `POST /api/albums`: nieuw album toevoegen
- `PUT /api/albums/:id`: album bewerken
- `DELETE /api/albums/:id`: album verwijderen

### Health

- `GET /api/health/ping`: check of server online is
- `GET /api/health/version`: versie-info ophalen


**Swagger/OpenAPI documentatie**: <LINK_NAAR_SWAGGER_DOC>

## Behaalde minimumvereisten

> Duid per vak aan welke minimumvereisten je denkt behaald te hebben

### Web Services

#### Datalaag

- [x] voldoende complex en correct (meer dan één tabel (naast de user tabel), tabellen bevatten meerdere kolommen, 2 een-op-veel of veel-op-veel relaties)
- [x] één module beheert de connectie + connectie wordt gesloten bij sluiten server
- [x] heeft migraties - indien van toepassing
- [x] heeft seeds

#### Repositorylaag

- [x] definieert één repository per entiteit - indien van toepassing
- [x] mapt OO-rijke data naar relationele tabellen en vice versa - indien van toepassing
- [x] er worden kindrelaties opgevraagd (m.b.v. JOINs) - indien van toepassing

#### Servicelaag met een zekere complexiteit

- [x] bevat alle domeinlogica
- [x] er wordt gerelateerde data uit meerdere tabellen opgevraagd
- [x] bevat geen services voor entiteiten die geen zin hebben zonder hun ouder (bv. tussentabellen)
- [x] bevat geen SQL-queries of databank-gerelateerde code

#### REST-laag

- [x] meerdere routes met invoervalidatie
- [x] meerdere entiteiten met alle CRUD-operaties
- [x] degelijke foutboodschappen
- [x] volgt de conventies van een RESTful API
- [x] bevat geen domeinlogica
- [x] geen API calls voor entiteiten die geen zin hebben zonder hun ouder (bv. tussentabellen)
- [x] degelijke autorisatie/authenticatie op alle routes

#### Algemeen

- [x] er is een minimum aan logging en configuratie voorzien
- [x] een aantal niet-triviale én werkende integratietesten (min. 1 entiteit in REST-laag >= 90% coverage, naast de user testen)
- [x] node_modules, .env, productiecredentials... werden niet gepushed op GitHub
- [ ] minstens één extra technologie die we niet gezien hebben in de les
- [x] maakt gebruik van de laatste ES-features (async/await, object destructuring, spread operator...)
- [ ] de applicatie start zonder problemen op gebruikmakend van de instructies in de README
- [x] de API draait online
- [ ] duidelijke en volledige README.md
- [ ] er werden voldoende (kleine) commits gemaakt
- [ ] volledig en tijdig ingediend dossier

## Projectstructuur

### Front-end Web Development
src/
├── core/         # logging, config, middlewares, validation
├── data/         # database-initialisatie
├── repository/   # Prisma repositories per entiteit
├── service/      # domeinlogica
├── rest/         # Koa-routers per entiteit
├── types/        # TypeScript types
└── index.ts      # serverstart

## Extra technologie

### Front-end Web Development

> Wat is de extra technologie? Hoe werkt het? Voeg een link naar het npm package toe!

### Web Services

> Wat is de extra technologie? Hoe werkt het? Voeg een link naar het npm package toe!

## Gekende bugs

### Web Services


## Reflectie

Ik vond dit project uitdagend maar ook zeer leerzaam.  
Ik heb geleerd hoe je een Node.js back-end opzet met een duidelijke gelaagde structuur, hoe je Prisma inzet voor databasebeheer, en hoe je een applicatie online zet via Render.  
De combinatie van JWT-authenticatie, invoervalidatie, en Swagger-documentatie heeft me meer inzicht gegeven in professionele API-ontwikkeling.   
