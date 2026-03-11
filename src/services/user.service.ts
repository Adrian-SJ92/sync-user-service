import { pool } from "../db";
import { SyncUserInput } from "../schemas/user.schema";

type UserRecord = {
  id: number;
  credential: string;
  email: string;
  name: string;
  created_at: Date;
  updated_at: Date;
};

export async function upsertUser(data: SyncUserInput): Promise<UserRecord> {
  const query = `
    INSERT INTO users (credential, email, name)
    VALUES ($1, $2, $3)
    ON CONFLICT (credential, email)
    DO UPDATE SET
      name = EXCLUDED.name,
      updated_at = NOW()
    RETURNING id, credential, email, name, created_at, updated_at;
  `;

  const values = [data.credential, data.email, data.name];

  const result = await pool.query<UserRecord>(query, values);

  const user = result.rows[0];

  if (!user) {
    throw new Error("Upsert user did not return a row");
  }

  return user;
}
