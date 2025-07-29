import db from "./config/db.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

async function insertTestData() {
  try {
    console.log("🔄 Inserting test data...");

    // 1. Clear existing test data (except admin users)
    await db.query(`DELETE FROM sensor_readings WHERE id > 0`);
    await db.query(`DELETE FROM actuator_states WHERE id > 0`);
    await db.query(`DELETE FROM alerts WHERE id > 0`);
    await db.query(`DELETE FROM sensors WHERE id > 0`);
    await db.query(`DELETE FROM actuators WHERE id > 0`);
    await db.query(`DELETE FROM controllers WHERE id > 0`);
    await db.query(`DELETE FROM greenhouses WHERE id > 0`);
    console.log("🧹 Cleared existing test data");

    // 2. Insert test users (additional ones)
    const hashedPassword = await bcrypt.hash("password123", 10);
    await db.query(
      `
      INSERT INTO users (name, email, password_hash, role) VALUES 
      ('Maria Popescu', 'maria@agrofarm.ro', ?, 'client'),
      ('Alex Ionescu', 'alex@greentech.com', ?, 'client')
    `,
      [hashedPassword, hashedPassword]
    );
    console.log("✅ Additional users inserted");

    // 3. Insert test greenhouses
    await db.query(`
      INSERT INTO greenhouses (user_id, name, location) VALUES 
      (1, 'Greenhouse Alpha', 'Bucuresti, Sector 1'),
      (2, 'Greenhouse Beta', 'Cluj-Napoca, Zona Industriala'),
      (3, 'Greenhouse Gamma', 'Timisoara, Zona Sud')
    `);
    console.log("✅ Greenhouses inserted");

    // 4. Insert test controllers
    await db.query(`
      INSERT INTO controllers (greenhouse_id, name, device_uid, type) VALUES 
      (1, 'Controller GH-Alpha', 'RPI_PICO_001', 'rpi_pico'),
      (2, 'Controller GH-Beta', 'RPI_PICO_002', 'rpi_pico'),
      (3, 'Controller GH-Gamma', 'RPI_PICO_003', 'rpi_pico')
    `);
    console.log("✅ Controllers inserted");

    // 5. Insert test sensors
    await db.query(`
      INSERT INTO sensors (controller_id, type, model, unit, location_in_greenhouse) VALUES 
      (1, 'temperature', 'DHT22', '°C', 'North Wall'),
      (1, 'humidity', 'DHT22', '%', 'North Wall'),
      (2, 'temperature', 'DS18B20', '°C', 'Center'),
      (2, 'soil_moisture', 'Capacitive', '%', 'Plant Zone A'),
      (3, 'light', 'BH1750', 'lux', 'Roof')
    `);
    console.log("✅ Sensors inserted");

    // 6. Insert test actuators
    await db.query(`
      INSERT INTO actuators (controller_id, type, model, location_in_greenhouse) VALUES 
      (1, 'water_pump', 'Submersible 12V', 'Irrigation Zone 1'),
      (1, 'ventilation_fan', 'PC Fan 120mm', 'Roof Vent'),
      (2, 'led_grow_light', 'Full Spectrum 50W', 'Plant Zone A'),
      (3, 'heater', 'Ceramic 100W', 'Floor Level')
    `);
    console.log("✅ Actuators inserted");

    // 7. Insert test sensor readings
    await db.query(`
      INSERT INTO sensor_readings (sensor_id, value, timestamp) VALUES 
      (1, 22.5, NOW()),
      (1, 23.1, DATE_SUB(NOW(), INTERVAL 1 HOUR)),
      (2, 65.0, NOW()),
      (2, 67.3, DATE_SUB(NOW(), INTERVAL 1 HOUR)),
      (3, 24.8, NOW()),
      (4, 45.2, NOW()),
      (5, 15000, NOW())
    `);
    console.log("✅ Sensor readings inserted");

    console.log("🎉 All test data inserted successfully!");
  } catch (error) {
    console.error("❌ Error inserting test data:", error.message);
    hasError = true;
  } finally {
    process.exit(hasError ? 1 : 0);
  }
}

insertTestData();
