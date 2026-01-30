import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ENV = process.env.NODE_ENV || "development";

const configPath = join(__dirname, `${ENV}.json`);

let config;

try {
  const configFile = readFileSync(configPath, "utf-8");
  config = JSON.parse(configFile);
} catch (error) {
  console.error(`Failed to load config for environment: ${ENV}`);
  process.exit(1);
}

export default config;

