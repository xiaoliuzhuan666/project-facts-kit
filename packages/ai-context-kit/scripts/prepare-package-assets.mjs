#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(scriptDir, "..");
const repoRoot = path.resolve(packageRoot, "..", "..");
const vendorRoot = path.join(packageRoot, "vendor", "project-facts-kit");

const entries = [
  "template",
  "skills",
  "scripts/ai-context-kit.sh",
  "scripts/generate-repo-map.sh",
  "scripts/install-project-facts.sh",
  "scripts/sync-skills.sh",
  "docs/adoption-guide.zh-CN.md",
  "docs/project-facts-governance.zh-CN.md",
  "docs/team-quick-start.zh-CN.md",
  "docs/ai-context-quality-token-consistency-design.zh-CN.md",
  "docs/ai-context-workspace-status.schema.json",
  "docs/examples",
  "docs/task-read-checklists"
];

fs.rmSync(vendorRoot, { recursive: true, force: true });
for (const rel of entries) {
  const src = path.join(repoRoot, rel);
  const dst = path.join(vendorRoot, rel);
  if (!fs.existsSync(src)) {
    throw new Error(`Missing package asset: ${rel}`);
  }
  copy(src, dst);
}

console.log(`Prepared ai-context-kit package assets at ${vendorRoot}`);

function copy(src, dst) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dst, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copy(path.join(src, entry), path.join(dst, entry));
    }
    return;
  }
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(src, dst);
  fs.chmodSync(dst, stat.mode);
}
