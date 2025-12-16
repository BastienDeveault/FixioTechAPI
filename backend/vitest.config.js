import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./tests/setup.js"],
    testTimeout: 10000,
    hookTimeout: 10000,
    env: {
      NODE_ENV: "test",
      DB_HOST: "localhost",
      DB_PORT: "5432",
      DB_USER: "postgres",
      DB_PASSWORD: "postgres",
      DB_NAME: "fixiotech",
      DB_SSL: "false"
    }
  },
});
