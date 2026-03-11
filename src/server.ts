import app from "./app";
import { pool } from "./db";
import { initDb } from "./db/init";
import { env } from "./config/env";

async function startServer() {
  try {
    await pool.query("SELECT 1");
    console.log("Database connected successfully");

    await initDb();
    console.log("Database initialized");

    app.listen(env.port, () => {
      console.log(`Server running on port ${env.port}`);
    });
  } catch (error) {
    console.error("Database connection failed", error);
    process.exit(1);
  }
}

startServer();
