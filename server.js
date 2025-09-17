import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import "./services/scheduler.js";
import authRoutes from "./routes/authRoutes.js";
import dataRoutes from "./routes/dataRoutes.js";
import usersRoutes from "./routes/usersRoutes.js";
import greenhouseRoutes from "./routes/greenhouseRoutes.js";
import sensorsRoutes from "./routes/sensorsRoutes.js";
import getSensorsByGreenhouse from "./routes/sensorsByGreenhouseRoutes.js";
import actuatorsRoutes from "./routes/actuatorsRoutes.js";
import sensorReadingsRoutes from "./routes/sensorReadingsRoutes.js";
import outsideWeatherRoutes from "./routes/outsideWeatherRoutes.js";
import usersDataRoutes from "./routes/usersDataRoutes.js";
import contactsRoutes from "./routes/contactsRoutes.js";
import deviceRoutes from "./routes/deviceRoutes.js";
import actuatorSchedulesRoutes from "./routes/actuatorSchedulesRoutes.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/data", dataRoutes);
app.use("/users", usersRoutes);
app.use("/greenhouses", greenhouseRoutes);
app.use("/sensors", sensorsRoutes);
app.use("/sensors", getSensorsByGreenhouse);
app.use("/actuators", actuatorsRoutes);
app.use("/sensors_readings", sensorReadingsRoutes);
app.use("/outside_weather", outsideWeatherRoutes);
app.use("/users_data", usersDataRoutes);
app.use("/contacts", contactsRoutes);
app.use("/", deviceRoutes);
app.use("/actuator_schedules", actuatorSchedulesRoutes);


// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
