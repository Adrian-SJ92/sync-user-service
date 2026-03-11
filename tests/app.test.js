"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const node_test_1 = __importDefault(require("node:test"));
const supertest_1 = __importDefault(require("supertest"));
process.env.PORT = process.env.PORT ?? "3000";
process.env.DB_HOST = process.env.DB_HOST ?? "localhost";
process.env.DB_PORT = process.env.DB_PORT ?? "5432";
process.env.DB_NAME = process.env.DB_NAME ?? "sync_service_db";
process.env.DB_USER = process.env.DB_USER ?? "postgres";
process.env.DB_PASSWORD = process.env.DB_PASSWORD ?? "postgres";
const { default: app } = await Promise.resolve().then(() => __importStar(require("../src/app")));
const { pool } = await Promise.resolve().then(() => __importStar(require("../src/db")));
(0, node_test_1.default)("GET /health returns 200 when the database is available", async () => {
    const originalQuery = pool.query.bind(pool);
    pool.query = (async () => ({ rows: [], rowCount: 1 }));
    try {
        const response = await (0, supertest_1.default)(app).get("/health");
        strict_1.default.equal(response.status, 200);
        strict_1.default.deepEqual(response.body, { status: "ok", database: "up" });
        strict_1.default.ok(response.headers["x-correlation-id"]);
    }
    finally {
        pool.query = originalQuery;
    }
});
(0, node_test_1.default)("GET /health returns 503 when the database is unavailable", async () => {
    const originalQuery = pool.query.bind(pool);
    pool.query = (async () => {
        throw new Error("db unavailable");
    });
    try {
        const response = await (0, supertest_1.default)(app).get("/health");
        strict_1.default.equal(response.status, 503);
        strict_1.default.deepEqual(response.body, { status: "error", database: "down" });
        strict_1.default.ok(response.headers["x-correlation-id"]);
    }
    finally {
        pool.query = originalQuery;
    }
});
(0, node_test_1.default)("POST /sync/user returns 400 when payload is invalid", async () => {
    const response = await (0, supertest_1.default)(app)
        .post("/sync/user")
        .set("Content-Type", "application/json")
        .send({
        credential: "",
        email: "invalid-email",
        name: "",
    });
    strict_1.default.equal(response.status, 400);
    strict_1.default.equal(response.body.success, false);
    strict_1.default.equal(response.body.message, "Invalid payload");
    strict_1.default.ok(Array.isArray(response.body.errors));
    strict_1.default.ok(response.headers["x-correlation-id"]);
});
//# sourceMappingURL=app.test.js.map