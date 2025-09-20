# ByteStorm Smart Greenhouse – Backend (Node.js/Express)

Production‑ready backend for the Smart Greenhouse app. It exposes a secure REST API for the mobile frontend and separate, API‑key protected endpoints for IoT devices (e.g., Raspberry Pi Pico). Data is stored in MySQL/MariaDB. User authentication is delegated to Firebase Auth; tokens are verified on the server via Firebase Admin.

## Tech Stack
- Runtime: Node.js (ES modules)
- Framework: Express 5
- AuthN: Firebase Auth (ID Tokens)
- AuthZ: Server‑side token verification + SQL scoping by user `uid`
- Database: MySQL/MariaDB (`mysql2/promise`)
- Security: CORS, prepared statements, API key for devices

## High‑Level Architecture
```
Mobile App (React Native)
  ↕ HTTPS (Authorization: Bearer <Firebase ID Token>)
Backend (Express)
  ├─ Firebase Admin (verifyIdToken)
  ├─ Controllers (business logic)
  └─ MySQL (pool, prepared statements)

IoT Device (Raspberry Pi Pico)
  ↕ HTTPS (x-api-key: <DEVICE_API_KEY>)
  Endpoints for readings + actuator commands
```

## Repository Location
- Backend root: `backend/bytestorm-backend`

## Project Structure
```
backend/bytestorm-backend/
  config/
    db.js                 # MySQL connection pool (dotenv)
    firebaseAdmin.js      # Firebase Admin initialization (service account)
  controllers/            # Route handlers (business logic)
  middleware/
    authMiddleware.js     # verifyFirebaseToken (users)
    deviceAuth.js         # verifyDeviceKey (hardware)
  routes/                 # Express routers → controllers
  server.js               # Express app entrypoint
  DATABASE_SETUP.md       # DB design and setup notes
  insert-test-data.js     # Optional: seed script (if used)
  package.json
```

## Getting Started
### 1) Prerequisites
- Node.js 18+
- MySQL/MariaDB 10.4+
- Firebase project + a Service Account JSON (Admin SDK)

### 2) Install dependencies
```bash
cd backend/bytestorm-backend
npm install
```

### 3) Environment variables (.env)
Create `backend/bytestorm-backend/.env`:
```env
# Server
PORT=5000

# Database
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=
DB_NAME=agrotrack

# Hardware device security
DEVICE_API_KEY=change_this_random_key

# Legacy JWT (optional, only if you keep /api/auth routes)
JWT_SECRET=change_this_long_random_secret
```

### 4) Firebase Admin service account
Place your Firebase Admin service account file at:
```
backend/bytestorm-backend/config/serviceAccountKey.json
```
The file is loaded by `config/firebaseAdmin.js`. Do NOT commit this file to Git.

### 5) Database setup
- Create the database and tables as described in `DATABASE_SETUP.md`.
- Optionally seed data using any provided scripts (e.g., `insert-test-data.js`) if applicable.

### 6) Run the server (development)
```bash
npm run dev
# Server starts on http://localhost:5000 (unless PORT is set)
```

## Authentication & Authorization
- Mobile users authenticate with Firebase (email/password, etc.). The app sends an ID Token in every request:
  - Header: `Authorization: Bearer <Firebase ID Token>`
- The backend verifies the token using Firebase Admin (`verifyIdToken`) in `middleware/authMiddleware.js`, then attaches `req.user.uid`.
- Controllers scope all SQL queries by `uid` (e.g., `WHERE g.owner_user_id = ?`) to ensure users see only their own data.
- IoT devices use a separate mechanism:
  - Header: `x-api-key: <DEVICE_API_KEY>` checked by `middleware/deviceAuth.js`.

## API Overview (selected)
Base URL: `https://smartgreenhouse.online/` (adjust for local dev)

### Greenhouses
- GET `/greenhouses` – list current user’s greenhouses (requires Bearer token)
- POST `/greenhouses` – create a greenhouse `{ name, location }` (Bearer)

### Sensors
- GET `/sensors` – list user’s sensors (Bearer)
  - Optional: `?greenhouse_id=<id>` to filter

### Actuators
- GET `/actuators` – list actuators (Bearer)
- GET `/actuators/commands` – list recent commands (Bearer)
- POST `/actuators/commands` – create a command (Bearer)

### Sensor Readings
- GET `/sensors_readings` (Bearer)
  - Optional: `?sensor_id=<id>`
  - Returns `{ id, sensor_id, timestamp (ISO), value }[]` sorted ascending by time

### Outside Weather (stored)
- GET `/outside_weather` (Bearer)
  - Optional: `?greenhouse_id=&from=&to=&limit=`

### Contacts
- GET `/contacts`, GET `/contacts/:id`, POST `/contacts`, PATCH `/contacts/:id`, DELETE `/contacts/:id` (Bearer)

### Users Data (profile)
- GET `/users_data`, GET `/users_data/:id`, POST/PATCH `/users_data/:id`
  - Note: protect with `verifyFirebaseToken` if it contains PII (recommended in production)

### IoT / Device Endpoints (API key)
- POST `/data/:device_uid` (x-api-key)
  - Body example: `{ "temp": 23.5, "humidity": 60, "soil_moisture": 250 }`
- GET `/api/data/:device_uid/commands` (x-api-key)
  - Returns e.g.: `{ "pump": true, "fan": false }`

## Example Requests
### List greenhouses (user)
```bash
curl -H "Authorization: Bearer <ID_TOKEN>" \
  https://smartgreenhouse.online/greenhouses
```

### Get sensors in a greenhouse (user)
```bash
curl -H "Authorization: Bearer <ID_TOKEN>" \
  "https://smartgreenhouse.online/sensors?greenhouse_id=12"
```

### Device: send readings
```bash
curl -X POST -H "x-api-key: <DEVICE_API_KEY>" -H "Content-Type: application/json" \
  -d '{"temp": 22.7, "humidity": 58}' \
  https://smartgreenhouse.online/data/RPI_PICO_001
```

### Device: get commands
```bash
curl -H "x-api-key: <DEVICE_API_KEY>" \
  https://smartgreenhouse.online/api/data/RPI_PICO_001/commands
```

## Scripts
- `npm run dev` – start the server with `nodemon`

## Security Notes
- Never commit secrets: `.env`, `serviceAccountKey.json`, real API keys
- Always verify Firebase ID Tokens on the server (don’t trust client claims)
- Scope SQL by `uid` to enforce multi‑tenant isolation
- Use HTTPS in production; rotate `DEVICE_API_KEY` periodically for devices
- Avoid logging full `Authorization` headers or secrets

## Troubleshooting
- 401/403 on user routes: missing/invalid Bearer token; check Firebase Admin setup and client interceptor
- 403 on device routes: wrong/missing `x-api-key`; verify `DEVICE_API_KEY`
- Empty lists: ensure DB relations link user `uid` → greenhouses → controllers → sensors
- Slow queries: add indexes (e.g., `owner_user_id`, foreign keys, `timestamp`) and consider pagination/limits
- Firebase Admin errors: confirm `config/serviceAccountKey.json` is present and valid

## Contributing
1. Fork and create a feature branch
2. Follow existing code style and structure
3. Write clear commit messages and open a PR

## License
Specify your project’s license here (e.g., MIT).
