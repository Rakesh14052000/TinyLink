# TinyLink (React + Express + Postgres)

## Overview
- Backend: Node + Express + pg
- Frontend: React (Vite) + Tailwind
- DB: Postgres (Neon)

## Local setup

# Setup DB
- Create a Postgres DB (Neon)
- Run server/db.sql to create `links` table

# Server
cd server
cp .env.example .env
# edit server/.env (DATABASE_URL, BASE_URL, PORT)
npm install
npm run dev   # dev server with nodemon (port default 5000)

# Client (dev)
cd client
npm install
npm run dev   # Vite dev at http://localhost:5173 (proxies /api to server)

# For production (single host)
# build client then start server
cd client
npm run build
cd ../server
npm install
# make sure server/.env BASE_URL points to domain
npm start
# server serves client built files; app available at SERVER_BASE_URL

## Routes
- GET / -> Dashboard (served by client)
- GET /code/:code -> Stats page (client route)
- POST /api/links -> create link
- GET /api/links -> list links
- GET /api/links/:code -> link stats
- DELETE /api/links/:code -> delete link
- GET /:code -> redirect (302) and increments clicks
- GET /healthz -> { ok: true }

psql -U postgres -c "DROP DATABASE IF EXISTS tinylink;"

psql -U postgres -d postgres
\l -> To show all DBs
\c tinylink -> Switch DB
SELECT * FROM links;
