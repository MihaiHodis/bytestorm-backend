# Backend
În cadrul proiectului de monitorizare a serelor, Departamentul Dezvoltare Backend trebuie să realizeze partea de backend a aplicației.

Aceasta va fi realizată folosind framework-ul *`Express`*, bazat pe *`Node.js`* (respectiv *`JavaScript ES6+`*). 

### Observație:

După finalizare, cei care doresc o versiune bazată pe Python pot realiza conversia folosind ChatGPT.

## Structura backend-ului

Pentru backend, pe serverul proiectului va fi creat un director denumit *`backend`*. În acest director vor fi create fișierele și directoarele proiectului. O variantă de pornire ar fi cea din imaginea următoare.

![Structura de directoare](https://raw.githubusercontent.com/mdamian2020/imaginiBS/main/backend_struct.png)

Funcțiile fișierelor din imagine sunt următoarele:

- *`server.js`* este fișierul principal. Pentru a înțelege structura din imagine, într-o formă inițială acest fișier are următorul conținut:

```
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import clientRoutes from './routes/clientsRoutes.js';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/clients', clientRoutes);
app.use('/api/auth', authRoutes);

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

- *`directorul routes`* conține fișiere referite în *`server.js`* pentru definirea *`endpoint`*-urilor. Exemplu de pornire:

```
//  Linii conținute în fișierul "server.js"
app.use('/api/clients', clientRoutes);
app.use('/api/auth', authRoutes);
```

Exemplu de fișier conținut în *`routes`*:

```
//  Fișierul "routes/clientsRoutes.js"

import express from 'express';
import { getAllClients, getClientById, createClient } from '../controllers/clientsController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Rute protejate
router.get('/', verifyToken, getAllClients);
router.get('/:id', verifyToken, getClientById);

// Creare client fără protecție
router.post('/', createClient);

export default router;
```

- *`directorul controllers`* conține fișiere referite în fișierele din *`routes`*. Fiecare fișier din *`controllers`* implementează efectiv funcționalitățile specifice rutelor legate de o funcționalitate a serverului. Operarea în tabelul *`clients`* de exemplu presupune afișarea tuturor clienților, afișarea unui client dacă i se cunoaște `ID`-ul și crearea unui client nou. Exemplu de *`controller`* pentru implementarea funcționalităților legate de gestionarea clienților (*`clientsController.js`*):

```
//  Fișierul "controllers/clientsController.js"
import db from '../config/db.js';

// Get all clients
export const getAllClients = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name, email, phone, created_at FROM clients');
    . . .
};

// Get one client by ID
export const getClientById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query('SELECT id, name, email, phone, created_at FROM clients WHERE id = ?', [id]);
    . . .
};

// Create a new client
export const createClient = async (req, res) => {
  const { name, email, passw, phone } = req.body;
  try {
    . . .
};
```

- *`.env`* este un fișier ascuns care conține informații necesare conectării la baza de date și un șir de caractere necesar creării unui token JWT. Macheta lui este următoarea:

```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=parola_ta
DB_NAME=baza_ta
JWT_SECRET=secrettokenulmeutare
```

&npsp; 


## Activități preconizate pentru realizarea componentei de backend

1. Familiarizare cu aplicațiile Git și GitHub. Clonarea depozitului ([github.com/ByteStormAI/backend](https://github.com/ByteStormAI/backend)).
2. Structurarea bazei de date pornind de la schema din *`SDD`* (eng. `Software Design Description`). Scrierea fișierului *`.env`* 
3. Crearea, urmată de testarea în Postman, a endpoint-urilor aferente funcției aplicației privind gestionarea clienților
4. Crearea, urmată de testarea în Postman, a endpoint-urilor aferente funcției aplicației privind gestionarea serelor
5. Crearea, urmată de testarea în Postman, a endpoint-urilor aferente funcției aplicației privind memorarea datelor măsurate de senzori
6. Crearea, urmată de testarea în Postman, a endpoint-urilor aferente funcției aplicației privind gestionarea stărilor actuatorilor (udare, ventilație)
7. Conversia în Python (Flask) a backend-ului și testarea în Postman a noii variante

Observații:

1. După crearea clonei se va realiza instalarea modulelor utilizate. Trebuie dată comanda: *`npm install`*
(modulele care vor fi automat instalate sunt: *`express nodemon cors mysql2 dotenv jsonwebtoken bcryptjs`*)
2. Pentru lansarea în execuție a serverului Express se va da comanda: *`npm run dev`*

