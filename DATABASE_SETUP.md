# AgroTrack Database Setup – Detailed Explanation

This document describes how the database for the AgroTrack project was designed, created, and integrated into the backend system. It is intended to present a clear and formal overview of the steps taken, technologies used, and rationale behind the database architecture.

---

## 1. Project Context

AgroTrack is an IoT-based smart agriculture system for greenhouse monitoring and automation. The database is a critical component, enabling persistent storage and management of users, sensors, controllers, actuators, and alerts.

---

## 2. Tools and Technologies Used

- **Database Engine**: MariaDB 10.4.32 (compatible with MySQL)
- **Interface**: phpMyAdmin (version 5.2.1)
- **SQL File**: `agrotrack.sql` (auto-generated from phpMyAdmin)
- **Backend Language**: Node.js with the `mysql2` package
- **Environment Variables**: Configured via `.env` file

---

## 3. Database Initialization Process

### Step 1: Creating the Database

In phpMyAdmin, a new database was created with the following SQL command:

```sql
CREATE DATABASE agrotrack CHARACTER SET utf8 COLLATE utf8_general_ci;
```

### Step 2: Importing the SQL Schema

The structure and all related constraints were defined in the `agrotrack.sql` file, which was imported using phpMyAdmin’s import function.

### Step 3: Connecting from the Backend

The `.env` file was used to securely store and load database credentials:

```env
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=
DB_NAME=agrotrack
```

In `db.js`, the Node.js backend uses `mysql2` to connect:

```js
import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
  } else {
    console.log("✅ Connected to MySQL database");
  }
});
```

---

## 4. Tables and Entity Roles

The following tables were defined:

| Table             | Purpose                                                       |
| ----------------- | ------------------------------------------------------------- |
| `users`           | Stores user credentials, roles (admin/client), and timestamps |
| `greenhouses`     | Represents greenhouses linked to users                        |
| `controllers`     | Devices such as Raspberry Pi Picos for managing sensors       |
| `sensors`         | Metadata about sensors and their location                     |
| `sensor_readings` | Real-time sensor data with timestamps                         |
| `actuators`       | Devices that perform actions in the greenhouse                |
| `actuator_states` | Logs when and how an actuator was triggered                   |
| `alerts`          | System alerts, including severity and device associations     |

All primary keys are auto-incremented integer IDs. Relationships are enforced using foreign key constraints to preserve referential integrity.

---

## 5. Design Decisions

- **Normalization**: All tables follow third normal form (3NF).
- **Enums**: Used for fields like `role`, `severity`, and `triggered_by`.
- **No Cascading Deletes**: To prevent accidental data loss.
- **Timestamps**: Used in all logging tables for traceability.
- **Foreign Keys**: Applied post-creation via ALTER TABLE for clarity.

---

## 6. Code Integration and Critical Fixes

After establishing the database schema, several critical integration issues were identified and resolved to ensure proper connectivity between the database layer and the Node.js backend application.

### 6.1 Import Path Corrections

**Issue**: Inconsistent file naming conventions caused module resolution failures.

**Fix 1 - Server Entry Point (`server.js`)**

```javascript
// Before (incorrect):
import clientRoutes from "./routes/clientsRoutes.js";

// After (corrected):
import clientRoutes from "./routes/clientRoutes.js";
```

**Rationale**: The actual file was named `clientRoutes.js`, but the import referenced `clientsRoutes.js`. This mismatch prevented the Express application from properly loading client-related routes, causing immediate startup failures.

**Fix 2 - Client Routes Module (`routes/clientRoutes.js`)**

```javascript
// Before (incorrect):
import { getAllClients, getClientById, createClient } from "../controllers/clientsController.js";

// After (corrected):
import { getAllClients, getClientById, createClient } from "../controllers/clientController.js";
```

**Rationale**: Similar naming inconsistency between the controller file (`clientController.js`) and its import reference. This fix ensures proper dependency injection of client business logic handlers.

### 6.2 Authentication Controller Implementation

**Issue**: Missing authentication controller module referenced in route definitions.

**Solution**: Created `controllers/authController.js` with comprehensive user authentication logic:

```javascript
// Key functions implemented:
- register(): User registration with bcrypt password hashing
- login(): JWT token generation and validation
```

**Technical Justification**:

- **Security**: Implements bcrypt with 10 salt rounds for password hashing
- **Stateless Authentication**: Uses JWT tokens for scalable session management
- **Error Handling**: Comprehensive try-catch blocks with meaningful error responses
- **Database Integration**: Utilizes prepared statements via the mysql2 connection pool

### 6.3 Environment Configuration Validation

**Issue**: Missing or incomplete environment variable configuration.

**Solution**: Verified and standardized `.env` file structure:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=agrotrack
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
```

**Security Considerations**:

- Database credentials isolated from source code
- JWT secret key configured (requires production-specific value)
- Connection parameters match database server configuration

### 6.4 Impact Assessment

These fixes address critical architectural bottlenecks:

1. **Module Resolution**: Eliminates import/export failures that prevented server startup
2. **Authentication Flow**: Enables complete user lifecycle management (register → login → token verification)
3. **Database Connectivity**: Ensures secure and consistent database access patterns
4. **Development Workflow**: Allows `npm run dev` to execute successfully without module errors

---

## 7. Verification

### 7.1 Database Integration Validation

To ensure proper integration between the Node.js backend and the MySQL database, validation was performed to confirm successful implementation according to the planned architecture.

**Connection Verification:**

- ✅ Database `agrotrack` successfully created and accessible
- ✅ All 8 planned tables implemented with correct structure
- ✅ Foreign key relationships functioning as designed
- ✅ Environment variable configuration operational via `.env` file

**Schema Validation:**

```sql
-- Confirmed table structure:
users (id, name, email, password_hash, role, created_at)
greenhouses (id, user_id, name, location, created_at)
controllers (id, greenhouse_id, name, device_uid, type, last_seen)
sensors (id, controller_id, type, model, unit, location_in_greenhouse)
sensor_readings (id, sensor_id, value, timestamp)
actuators (id, controller_id, type, model, location_in_greenhouse)
actuator_states (id, actuator_id, state, triggered_by, timestamp)
alerts (id, user_id, greenhouse_id, sensor_id, actuator_id, message, severity, timestamp)
```

### 7.2 Test Data Population

**Data Insertion Validation:**
Created `insert-test-data.js` to populate the database with realistic test scenarios:

```javascript
// Test data successfully inserted:
- 4 users (admin and client roles with bcrypt-hashed passwords)
- 3 greenhouses (different locations and owners)
- 3 controllers (Raspberry Pi Pico devices with unique UIDs)
- 5 sensors (temperature, humidity, light, soil moisture)
- 7 sensor readings (real-time measurement data)
- 4 actuators (irrigation, ventilation, lighting, heating systems)
```

**Verification Results:**

- ✅ All foreign key constraints properly enforced
- ✅ Enum values validated (`role`, `type`, `triggered_by`, `severity`)
- ✅ Timestamp fields populated with correct format
- ✅ Decimal precision maintained for sensor measurements
- ✅ Unique constraints respected (emails, device UIDs)

### 7.3 Production Readiness Status

**System Integration Confirmed:**

```
📊 Database: agrotrack (8 tables, 21+ test records)
🔐 Authentication: bcrypt + JWT infrastructure ready
🌡️ IoT Data Pipeline: Sensor readings with proper data types
⚙️ Device Management: Controller-sensor-actuator hierarchy operational
🚨 Alert System: Schema prepared for notification management
🔗 API Ready: All tables prepared for CRUD operations
```

---
