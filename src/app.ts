import express from "express";
import { correlationIdMiddleware } from "./middlewares/correlation.middleware";
import { pool } from "./db";
import userRoutes from "./routes/user.routes";

const app = express();

app.use(express.json());
app.use(correlationIdMiddleware);

app.get("/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.status(200).json({ status: "ok", database: "up" });
  } catch (error) {
    console.error("Health check failed", error);
    res.status(503).json({ status: "error", database: "down" });
  }
});

app.use(userRoutes);

export default app;
