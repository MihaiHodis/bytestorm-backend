// services/scheduler.js
import pool from "../config/db.js";

/**
 * Scheduler per actuator:
 * - Iterează toate actuatoarele
 * - Verifică dacă există programare activă acum
 * - Decide ON/OFF în funcție de ultima comandă și regulile de business
 */
export async function runScheduler() {
  const now = new Date();
  const today = now.toISOString().slice(0, 10); // YYYY-MM-DD
  const currentTime = now.toTimeString().slice(0, 8); // HH:mm:ss

  try {
    // 1️⃣ Preia toți actuatorii
    const [actuators] = await pool.query(`SELECT id FROM actuators`);

    for (const actuator of actuators) {
      const actuatorId = actuator.id;

      // 2️⃣ Verifică dacă are programări active acum (cu marjă 1 minut)
      const [activeSchedules] = await pool.query(
        `
        SELECT id, actuator_id, greenhouse_id,
               DATE_FORMAT(schedule_date, '%Y-%m-%d') AS schedule_date,
               start_time, end_time, issued_by_user_id
        FROM actuator_schedules
        WHERE actuator_id = ?
          AND schedule_date = ?
          AND start_time <= ADDTIME(?, '00:01:00')
          AND end_time > ?
        ORDER BY end_time DESC
        `,
        [actuatorId, today, currentTime, currentTime]
      );

      const hasActiveSchedule = activeSchedules.length > 0;

      // 3️⃣ Ultima comandă
      const [lastCmdRows] = await pool.query(
        `
        SELECT * FROM actuator_commands
        WHERE actuator_id = ?
        ORDER BY issued_at DESC
        LIMIT 1
        `,
        [actuatorId]
      );
      const lastCmd = lastCmdRows[0];

      // ======================
      // 🔹 CAZ 1: există programare activă → trebuie ON
      // ======================
      if (hasActiveSchedule) {
        const schedule = activeSchedules[0]; // programarea cu end_time cel mai mare
        const scheduleDate = schedule.schedule_date; // string
        const expiresAtStr = `${scheduleDate} ${schedule.end_time}`; // SQL format

        console.log(
          `📝 DEBUG actuator ${actuatorId} -> expiresAtStr = "${expiresAtStr}"`
        );

        let shouldTurnOn = false;

        if (!lastCmd) {
          shouldTurnOn = true;
        } else if (
          lastCmd.command === "on" &&
          lastCmd.expires_at &&
          new Date(lastCmd.expires_at).getTime() === new Date(expiresAtStr).getTime()
        ) {
          shouldTurnOn = false; // deja există ON exact pentru acest schedule
        } else if (
          lastCmd.command === "on" &&
          lastCmd.expires_at &&
          new Date(lastCmd.expires_at) > now
        ) {
          // dacă expirarea curentă este mai mică decât programarea activă → prelungim
          if (new Date(lastCmd.expires_at) < new Date(expiresAtStr)) {
            await pool.query(
              `UPDATE actuator_commands SET expires_at = ? WHERE id = ?`,
              [expiresAtStr, lastCmd.id]
            );
            console.log(
              `🔄 Actuator ${actuatorId}: expirarea ON prelungită până la ${expiresAtStr}`
            );
          }
          shouldTurnOn = false;
        } else if (
          lastCmd.command === "on" &&
          lastCmd.expires_at &&
          new Date(lastCmd.expires_at) <= now
        ) {
          shouldTurnOn = true; // ON expirat → repornește
        } else if (
          lastCmd.command === "off" &&
          lastCmd.issued_by_user_id !== "system_cron" &&
          new Date(lastCmd.issued_at) >= new Date(`${today} ${schedule.start_time}`)
        ) {
          console.log(
            `⏭️ Ignor ON: actuator ${actuatorId} oprit manual după start_time`
          );
          shouldTurnOn = false;
        } else if (lastCmd.command === "off") {
          shouldTurnOn = true;
        }

        if (shouldTurnOn) {
          await pool.query(
            `
            INSERT INTO actuator_commands (actuator_id, command, issued_by_user_id, issued_at, expires_at)
            VALUES (?, 'on', 'system_cron', NOW(), ?)
            `,
            [actuatorId, expiresAtStr]
          );

          await pool.query(`UPDATE actuators SET status = 'on' WHERE id = ?`, [
            actuatorId,
          ]);

          console.log(`✅ Actuator ${actuatorId} pornit (până la ${expiresAtStr})`);
        }

        continue; // trecem la următorul actuator
      }

      // ======================
      // 🔹 CAZ 2: nu există programare activă
      // ======================
      if (lastCmd && lastCmd.command === "on") {
        if (lastCmd.issued_by_user_id === "system_cron") {
          // OFF doar dacă ultima a fost de la cron
          await pool.query(
            `INSERT INTO actuator_commands (actuator_id, command, issued_by_user_id, issued_at)
             VALUES (?, 'off', 'system_cron', NOW())`,
            [actuatorId]
          );
          await pool.query(`UPDATE actuators SET status = 'off' WHERE id = ?`, [
            actuatorId,
          ]);
          console.log(
            `🛑 Actuator ${actuatorId} oprit (nu mai are programare activă)`
          );
        } else {
          // ultima comandă a fost de la user
          if (lastCmd.expires_at && new Date(lastCmd.expires_at) <= now) {
            // expirată → cron face OFF
            await pool.query(
              `INSERT INTO actuator_commands (actuator_id, command, issued_by_user_id, issued_at)
               VALUES (?, 'off', 'system_cron', NOW())`,
              [actuatorId]
            );
            await pool.query(`UPDATE actuators SET status = 'off' WHERE id = ?`, [
              actuatorId,
            ]);
            console.log(
              `🛑 Actuator ${actuatorId} oprit (comandă manuală expirat la ${lastCmd.expires_at})`
            );
          } else {
            // activă încă → nu facem nimic
            console.log(
              `⏭️ Actuator ${actuatorId} rămâne ON (comandă manuală activă până la ${lastCmd.expires_at || "∞"})`
            );
          }
        }
      }
    }
  } catch (err) {
    console.error("❌ Scheduler error:", err);
  }
}

// 4️⃣ Rulează la fiecare minut
setInterval(runScheduler, 60 * 1000);

console.log("⏱️ Scheduler pornit (rulează per actuator la fiecare minut)...");
