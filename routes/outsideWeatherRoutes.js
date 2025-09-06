// routes/outsideWeatherRoutes.js
import { Router } from 'express';
import { listOutsideWeather } from '../controllers/outsideWeatherController.js';

const router = Router();

// GET /outside_weather?greenhouse_id=1&from=2025-07-23T00:00:00Z&to=2025-07-24T00:00:00Z&limit=500
router.get('/', listOutsideWeather);

export default router;
