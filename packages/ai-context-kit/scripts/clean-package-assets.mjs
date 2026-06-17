#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(scriptDir, "..");
const vendorRoot = path.join(packageRoot, "vendor", "project-facts-kit");

fs.rmSync(vendorRoot, { recursive: true, force: true });
console.log(`Cleaned ai-context-kit package assets at ${vendorRoot}`);
