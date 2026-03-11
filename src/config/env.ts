import "dotenv/config";

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function getPort(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const port = Number(value);

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error(`Invalid PORT value: ${value}`);
  }

  return port;
}

function getDbPort(value: string): number {
  const port = Number(value);

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error(`Invalid DB_PORT value: ${value}`);
  }

  return port;
}

export const env = {
  port: getPort(process.env.PORT, 3000),
  dbHost: getRequiredEnv("DB_HOST"),
  dbPort: getDbPort(getRequiredEnv("DB_PORT")),
  dbName: getRequiredEnv("DB_NAME"),
  dbUser: getRequiredEnv("DB_USER"),
  dbPassword: getRequiredEnv("DB_PASSWORD"),
};
