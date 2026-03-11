const assert = require("node:assert/strict");
const request = require("supertest");

process.env.PORT = process.env.PORT || "3000";
process.env.DB_HOST = process.env.DB_HOST || "localhost";
process.env.DB_PORT = process.env.DB_PORT || "5432";
process.env.DB_NAME = process.env.DB_NAME || "sync_service_db";
process.env.DB_USER = process.env.DB_USER || "postgres";
process.env.DB_PASSWORD = process.env.DB_PASSWORD || "postgres";

const app = require("../dist/app").default;
const { pool } = require("../dist/db");

const tests = [
  {
    name: "GET /health returns 200 when the database is available",
    run: async () => {
      const originalQuery = pool.query.bind(pool);
      pool.query = async () => ({ rows: [], rowCount: 1 });

      try {
        const response = await request(app).get("/health");

        assert.equal(response.status, 200);
        assert.deepEqual(response.body, { status: "ok", database: "up" });
        assert.ok(response.headers["x-correlation-id"]);
      } finally {
        pool.query = originalQuery;
      }
    },
  },
  {
    name: "GET /health returns 503 when the database is unavailable",
    run: async () => {
      const originalQuery = pool.query.bind(pool);
      pool.query = async () => {
        throw new Error("db unavailable");
      };

      try {
        const response = await request(app).get("/health");

        assert.equal(response.status, 503);
        assert.deepEqual(response.body, { status: "error", database: "down" });
        assert.ok(response.headers["x-correlation-id"]);
      } finally {
        pool.query = originalQuery;
      }
    },
  },
  {
    name: "POST /sync/user returns 400 when payload is invalid",
    run: async () => {
      const response = await request(app)
        .post("/sync/user")
        .set("Content-Type", "application/json")
        .send({
          credential: "",
          email: "invalid-email",
          name: "",
        });

      assert.equal(response.status, 400);
      assert.equal(response.body.success, false);
      assert.equal(response.body.message, "Invalid payload");
      assert.ok(Array.isArray(response.body.errors));
      assert.ok(response.headers["x-correlation-id"]);
    },
  },
];

(async () => {
  let failures = 0;

  for (const currentTest of tests) {
    try {
      await currentTest.run();
      console.log(`PASS ${currentTest.name}`);
    } catch (error) {
      failures += 1;
      console.error(`FAIL ${currentTest.name}`);
      console.error(error);
    }
  }

  if (failures > 0) {
    process.exit(1);
  }

  console.log(`PASS ${tests.length} tests`);
})();
