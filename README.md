# MalamAI (CrackJAMB)

JAMB study app: Expo frontend + Express/Postgres backend.

```
MalamAI/
  frontend/                 Expo app
    App.js                  Expo entry (re-exports navigator)
    src/
      screens/              Student + admin screens
      components/
      hooks/
      constants/
      services/             API + AI clients
      navigation/
      data/
    assets/
  backend/                  Express API
    server.js               Process entry: migrate + listen
    src/
      app.js                Express app (no listen)
      config/               Database pool
      db/                   Migrations
      middleware/
      controllers/
      routes/
      services/
  package.json              Root scripts
```

## Setup

### Backend

```bash
cd backend
cp .env.example .env
# fill in Postgres, JWT, and email values
npm install
npm run dev
```

API health check: `http://localhost:5000/api/health`

### Frontend

```bash
cd frontend
cp .env.example .env
# set EXPO_PUBLIC_API_URL to your machine's LAN or localhost URL
npm install
npm start
```

Or from the repo root:

```bash
npm run backend
npm run frontend
```

Point `EXPO_PUBLIC_API_URL` at `http://<your-lan-ip>:5000/api` when testing on a physical device.
