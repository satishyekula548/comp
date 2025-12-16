import "dotenv/config";
import path from "node:path";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: path.join("prisma"),

  migrations: {
    path: path.join("prisma", "migrations"),
    seed: "ts-node prisma/seed/seed.ts",
  },

  generator: {
    client: {
      binaryTargets: [
        "native",
        "debian-openssl-3.0.x",
        "rhel-openssl-3.0.x",
        "linux-musl-openssl-3.0.x",
        "linux-musl-arm64-openssl-3.0.x",
      ],
    },
  },
});
