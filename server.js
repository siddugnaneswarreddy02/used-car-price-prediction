#!/usr/bin/env node

/**
 * Unified development server starter (ES Module).
 * Runs FastAPI Backend (Port 5000) and Frontend (Vite, Port 5173) concurrently.
 * Usage: node server.js (or npm start)
 */

import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
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
      const trimmed = line.trim();
      if (trimmed) {
        console.log(`[${name}] ${trimmed}`);
      }
    }
  });

  proc.stderr.on("data", (data) => {
    const lines = data.toString().trim().split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed) {
        console.error(`[${name}] ${trimmed}`);
      }
    }
  });

  proc.on("close", (code) => {
    if (code !== null && code !== 0) {
      console.log(`[${name}] process exited with code ${code}`);
    }
  });

  return proc;
}

console.log("==========================================");
console.log("  Used Car Price Prediction - App Launcher");
console.log("==========================================\n");

// 1. Start FastAPI Asynchronous Backend on port 5000
const backend = startProcess(
  "BACKEND",
  "python",
  ["-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5000", "--reload"],
  path.join(ROOT, "backend"),
  { PORT: "5000" }
);

// 2. Start Frontend (Vite) on port 5173
const frontend = startProcess(
  "FRONTEND",
  "npx",
  ["vite", "--host"],
  ROOT,
  { VITE_API_URL: "http://localhost:5000" }
);

console.log("Services starting...");
console.log("  ✓ Asynchronous Backend (FastAPI) → http://localhost:5000");
console.log("  ✓ Frontend (Vite React)         → http://localhost:5173\n");

// Graceful shutdown
function shutdown() {
  console.log("\nShutting down all services...");
  try {
    backend.kill();
  } catch (e) {}
  try {
    frontend.kill();
  } catch (e) {}
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
