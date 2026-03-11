import { pool } from "./index";

export async function initDb(): Promise<void> {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      credential VARCHAR(100) NOT NULL,
      email VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
      UNIQUE (credential, email)
    );
  `;

  await pool.query(query);
}