#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const SCHEMA_DIR = path.join(__dirname, "../prisma/schema");
const OUTPUT_DIR = path.join(__dirname, "../dist");
const OUTPUT_SCHEMA = path.join(OUTPUT_DIR, "schema.prisma");

console.log("🔨 Combining Prisma schema files...");

// 🔒 Always start with ONE generator + datasource
let combinedSchema = `
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
`.trim() + "\n\n";

// Read all .prisma files
const schemaFiles = fs
  .readdirSync(SCHEMA_DIR)
  .filter((file) => file.endsWith(".prisma"))
  .sort();

console.log(`📁 Found ${schemaFiles.length} schema files`);

for (const file of schemaFiles) {
  console.log(`  - Adding ${file}`);
  const content = fs.readFileSync(path.join(SCHEMA_DIR, file), "utf8");

  combinedSchema += `// ===== ${file} =====\n`;
  combinedSchema += content;
  if (!content.endsWith("\n")) combinedSchema += "\n";
  combinedSchema += "\n";
}

// Ensure dist exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Write schema
fs.writeFileSync(OUTPUT_SCHEMA, combinedSchema);

// Prisma client helper
fs.writeFileSync(
  path.join(OUTPUT_DIR, "client.ts"),
  `
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
`.trim()
);

// Index export
fs.writeFileSync(
  path.join(OUTPUT_DIR, "index.ts"),
  `
export { db } from "./client";
export * from "@prisma/client";
`.trim()
);

console.log(`✅ Combined schema written to: ${OUTPUT_SCHEMA}`);
console.log(`📏 Size: ${(combinedSchema.length / 1024).toFixed(1)} KB`);
console.log("🎯 Schema ready for Prisma generate");
