#!/usr/bin/env node

/**
 * Unified development server starter.
 * Runs ML Service (Flask), Backend (Express), and Frontend (Vite) concurrently.
 * Usage: node server.js
 */

const { spawn } = require("child_process");
const path = require("path");

const ROOT = __dirname;

function startProcess(name, command, args, cwd, envOverrides = {}) {
  const proc = spawn(command, args, {
    cwd,
    stdio: "pipe",
    shell: true,
    env: { ...process.env, ...envOverrides },
  });

  proc.stdout.on("data", (data) => {
    const lines = data.toString().trim().split("\n");
    for (const line of lines) {
      console.log(`[${name}] ${line}`);
    }
  });

  proc.stderr.on("data", (data) => {
    const lines = data.toString().trim().split("\n");
    for (const line of lines) {
      console.error(`[${name}] ${line}`);
    }
  });

  proc.on("close", (code) => {
    console.log(`[${name}] exited with code ${code}`);
  });

  return proc;
}

console.log("========================================");
console.log("  Used Car Price Prediction - Launcher  ");
console.log("========================================\n");

// 1. Start ML Service (Flask) on port 8000
const mlService = startProcess(
  "ML",
  "python",
  ["app.py"],
  path.join(ROOT, "ml-service"),
  { PORT: "8000" }
);

// 2. Start Backend (Express) on port 5000
const backend = startProcess(
  "BACKEND",
  "node",
  ["server.js"],
  path.join(ROOT, "used-car-backend"),
  { PORT: "5000", ML_SERVICE_URL: "http://localhost:8000" }
);

// 3. Start Frontend (Vite) on port 5173
const frontend = startProcess(
  "FRONTEND",
  "npx",
  ["vite", "--host"],
  ROOT,
  { VITE_API_URL: "http://localhost:5000" }
);

console.log("Services starting...");
console.log("  ML Service  → http://localhost:8000");
console.log("  Backend     → http://localhost:5000");
console.log("  Frontend    → http://localhost:5173\n");

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\nShutting down all services...");
  mlService.kill();
  backend.kill();
  frontend.kill();
  process.exit(0);
});

