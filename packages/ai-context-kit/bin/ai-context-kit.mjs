#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const VERSION = "0.3.55";
const MANAGED_MARKER = "<!-- generated-by: ai-context-kit -->";
const CODEX_MEM_GENERATOR = "ai-context-kit codex-mem";
const CODEX_MEM_DIR = ".codex-mem";

const EXCLUDED_DIRS = new Set([
  ".git",
  ".idea",
  ".vscode",
  ".hbuilderx",
  ".codegraph",
  ".codex",
  ".codex-mem",
  "node_modules",
  "target",
  "dist",
  "build",
  "unpackage",
  ".next",
  ".nuxt",
  "coverage",
  "logs",
  "log"
]);

const SENSITIVE_GLOBS = [
  "src/main/resources/application*.yml",
  "src/main/resources/application*.yaml",
  "src/main/resources/cert/**",
  ".env",
  ".env.*",
  "*.pem",
  "*.key",
  "*secret*",
  "*credential*",
  "*token*"
];

const HIGH_VOLUME_GLOBS = [
  "doc/sql/**",
  "**/*.min.js",
  "uview-ui/**",
  "utils/plugins/monitor/**",
  "src/main/resources/vm/**"
];

const SOURCE_EXTENSIONS = new Set([
  ".java",
  ".xml",
  ".js",
  ".ts",
  ".vue",
  ".json",
  ".md",
  ".yml",
  ".yaml",
  ".scss",
  ".css",
  ".sql"
]);

const FRONTEND_API_DIR_PATTERN = /(^|\/)(api|apis|service|services)(\/|$)/i;
const FRONTEND_ACTION_FILE_PATTERN = /(^|\/)(actions?|server-actions?)\.(js|ts|jsx|tsx)$/i;
const FRONTEND_SOURCE_EXTENSIONS = new Set([".js", ".ts", ".jsx", ".tsx", ".vue"]);

function main() {
  const argv = process.argv.slice(2);
  if (argv.length === 0 || argv[0] === "--help" || argv[0] === "-h") {
    printHelp();
    return;
  }
  if (argv[0] === "--version" || argv[0] === "-v") {
    console.log(`${cliLabel()} ${VERSION}`);
    return;
  }
  const commandArgs = argv[0] === "context" ? argv.slice(1) : argv;
  if (commandArgs.length === 0 || commandArgs[0] === "--help" || commandArgs[0] === "-h") {
    printHelp();
    return;
  }
  if (commandArgs[0] === "--version" || commandArgs[0] === "-v") {
    console.log(`${cliLabel()} ${VERSION}`);
    return;
  }
  const command = commandArgs[0] || "help";

  if (command === "codex-mem") {
    const subcommand = commandArgs[1] || "help";
    const opts = parseOptions(commandArgs.slice(2));
    const workspace = path.resolve(opts.workspace || process.cwd());
    if (subcommand === "help" || opts.help) {
      printCodexMemHelp();
      return;
    }
    if (!fs.existsSync(workspace)) {
      fail(`Workspace does not exist: ${workspace}`);
    }
    const context = buildContext(workspace);
    runCodexMemCommand(subcommand, context, opts);
    return;
  }

  const opts = parseOptions(commandArgs.slice(1));
  const workspace = path.resolve(opts.workspace || process.cwd());

  if (opts.version || command === "version") {
    console.log(`${cliLabel()} ${VERSION}`);
    return;
  }

  if (command === "help" || opts.help) {
    printHelp();
    return;
  }

  if (command === "redact") {
    runRedact(opts);
    return;
  }

  if (!fs.existsSync(workspace)) {
    fail(`Workspace does not exist: ${workspace}`);
  }

  const context = buildContext(workspace);

  if (command === "onboard") {
    runOnboard(context, opts);
    return;
  }

  if (command === "upgrade") {
    runUpgrade(context, opts);
    return;
  }

  if (command === "doctor") {
    printDoctor(context);
    return;
  }

  if (command === "measure") {
    writeScopeReport(context, opts);
    return;
  }

  if (command === "tokens") {
    writeTokenSavingsReport(context, opts);
    return;
  }

  if (command === "summary") {
    printSavingsSummary(context, opts);
    return;
  }

  if (command === "dashboard") {
    writeSavingsDashboard(context, opts);
    return;
  }

  if (command === "token-status") {
    printTokenStatus(context, opts);
    return;
  }

  if (command === "editor-tasks") {
    writeEditorTasks(context, opts);
    return;
  }

  if (command === "automation-prompt") {
    printAutomationPrompt(context, opts);
    return;
  }

  if (command === "contracts") {
    writeContractSearchReport(context, opts);
    return;
  }

  if (command === "real-task-audit") {
    writeRealTaskAuditReport(context, opts);
    return;
  }

  if (command === "graph") {
    writeContextGraph(context, opts);
    return;
  }

  if (command === "facts") {
    generateFacts(context, opts);
    return;
  }

  if (command === "agents" || command === "repair") {
    repairWorkflowArtifacts(context, opts);
    return;
  }

  if (command === "codegraph") {
    runCodegraphInit(context, opts);
    return;
  }

  if (command === "init") {
    runInitWorkflow(context, opts);
    return;
  }

  fail(`Unknown command: ${command}`);
}

function parseOptions(args) {
  const opts = {};
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === "--workspace" || arg === "-w") opts.workspace = args[++i];
    else if (arg === "--input") opts.input = args[++i];
    else if (arg === "--event" || arg === "--events") {
      if (!opts.eventFiles) opts.eventFiles = [];
      opts.eventFiles.push(args[++i]);
    }
    else if (arg === "--output" || arg === "-o") opts.output = args[++i];
    else if (arg === "--dry-run") opts.dryRun = true;
    else if (arg === "--force") opts.force = true;
    else if (arg === "--json") opts.json = true;
    else if (arg === "--with-codegraph") opts.withCodegraph = true;
    else if (arg === "--help" || arg === "-h") opts.help = true;
    else if (arg === "--version" || arg === "-v") opts.version = true;
    else if (arg === "--repos") opts.repos = args[++i]?.split(",").map((s) => s.trim()).filter(Boolean);
    else if (arg === "--codegraph-timeout") opts.codegraphTimeout = Number(args[++i]);
    else if (arg === "--token-encoding") opts.tokenEncoding = args[++i];
    else if (arg === "--top-files-len") opts.topFilesLen = Number(args[++i]);
    else if (arg === "--mode") opts.mode = args[++i];
    else if (arg === "--type") opts.type = args[++i];
    else if (arg === "--query" || arg === "-q") opts.query = args[++i];
    else if (arg === "--frontend-repo") opts.frontendRepo = args[++i];
    else if (arg === "--backend-repo") opts.backendRepo = args[++i];
    else if (arg === "--related" || arg === "--related-type") opts.related = args[++i];
    else if (arg === "--ref") opts.ref = args[++i];
    else if (arg === "--hash") opts.hash = args[++i];
    else if (arg === "--name") opts.name = args[++i];
    else if (arg === "--title") opts.title = args[++i];
    else if (arg === "--summary") opts.summary = args[++i];
    else if (arg === "--repo") opts.repo = args[++i];
    else if (arg === "--path") opts.path = args[++i];
    else if (arg === "--tag") {
      if (!opts.tags) opts.tags = [];
      opts.tags.push(args[++i]);
    }
    else if (arg === "--tags") {
      if (!opts.tags) opts.tags = [];
      opts.tags.push(...String(args[++i] || "").split(",").map((s) => s.trim()).filter(Boolean));
    }
    else if (arg === "--limit") opts.limit = Number(args[++i]);
    else if (arg === "--threshold") opts.threshold = Number(args[++i]);
    else if (arg === "--codex-home") opts.codexHome = args[++i];
    else if (arg === "--days") opts.days = Number(args[++i]);
    else if (arg === "--session") {
      if (!opts.sessionIds) opts.sessionIds = [];
      opts.sessionIds.push(args[++i]);
    }
    else if (arg === "--sessions") {
      if (!opts.sessionIds) opts.sessionIds = [];
      opts.sessionIds.push(...String(args[++i] || "").split(",").map((s) => s.trim()).filter(Boolean));
    }
    else fail(`Unknown option: ${arg}`);
  }
  return opts;
}

function printHelp() {
  console.log(`${cliLabel()} ${VERSION}

Usage:
  ai-context-kit onboard --workspace <path>
  ai-context-kit upgrade --workspace <path> [--with-codegraph] [--force]
  ai-context-kit doctor  --workspace <path>
  ai-context-kit init    --workspace <path> [--with-codegraph] [--force]
  ai-context-kit repair  --workspace <path> [--force]
  ai-context-kit facts   --workspace <path>
  ai-context-kit agents  --workspace <path> [--force]
  ai-context-kit measure --workspace <path>
  ai-context-kit tokens  --workspace <path> [--output <file>]
  ai-context-kit summary --workspace <path>
  ai-context-kit dashboard --workspace <path> [--output <file>]
  ai-context-kit token-status --workspace <path> [--json] [--output <file>]
  ai-context-kit editor-tasks --workspace <path> [--force]
  ai-context-kit automation-prompt --workspace <path> [--type skill-feedback-candidate|skill-feedback-review]
  ai-context-kit contracts --workspace <path> --query <endpoint-or-symbol> [--frontend-repo app] [--backend-repo api] [--related payment] [--limit 40] [--output <file>]
  ai-context-kit real-task-audit --workspace <path> [--output <file>]
  ai-context-kit graph   --workspace <path> [--output <file>]
  ai-context-kit redact --input <file> [--output <file>]
  ai-context-kit codegraph --workspace <path>
  ai-context-kit codex-mem <init|index|search|route|timeline|get|mcp|config|install-hooks|install-user-hooks|dashboard|sessions|exec-events> --workspace <path>
  project-facts-kit context <command> --workspace <path>

Options:
  -w, --workspace <path>   Workspace or repository path. Defaults to cwd.
  --input <file>           Input file for redact or codex-mem exec-events. Use - for stdin in redact.
  --events <file>          Codex exec --json events file for codex-mem exec-events. Can be repeated.
  -o, --output <file>      Output path for reports that support it.
  --repos <a,b>            Limit to selected child repository directory names.
  --dry-run                Print actions without writing files.
  --force                  Regenerate ai-context-kit managed files. Non-generated project facts are skipped.
  --json                   Print JSON for commands that support it, such as token-status.
  --with-codegraph         Run CodeGraph init for selected repos during init.
  --codegraph-timeout <s>  Timeout for each CodeGraph init. Defaults to 180 seconds.
  --token-encoding <name>  Repomix token encoding for tokens command. Defaults to o200k_base.
  --top-files-len <n>      Top token-heavy files shown by repomix. Defaults to 10.
  --mode <name>            codex-mem hook mode: observe or compress. Defaults to observe.
  --type <name>            automation-prompt type: skill-feedback-candidate or skill-feedback-review.
  -q, --query <text>       Query for codex-mem search or route.
  --ref <path-or-hash>     Ref path or sha256 hash for codex-mem get.
  --hash <sha256>          Hash alias for codex-mem get.
  --name <name>            MCP server name for codex-mem config. Defaults to codexMem.
  --title <text>           Title for codex-mem record.
  --summary <text>         Summary for codex-mem record.
  --repo <name>            Repository name for codex-mem record. Defaults to workspace.
  --path <path>            Related path for codex-mem record. Defaults to observations.
  --tag <tag>              Tag for codex-mem record. Can be repeated.
  --tags <a,b>             Comma-separated tags for codex-mem record.
  --limit <n>              Result limit for codex-mem search. Defaults to 10.
  --threshold <tokens>     Large-output threshold for codex-mem hooks. Defaults to 8000.
  --codex-home <path>      CODEX_HOME for user hooks or session usage. Defaults to ~/.codex.
  --days <n>               Session usage lookback window. Defaults to 14.
`);
}

function printCodexMemHelp() {
  console.log(`${cliLabel()} ${VERSION}

Usage:
  ai-context-kit codex-mem init --workspace <path>
  ai-context-kit codex-mem index --workspace <path>
  ai-context-kit codex-mem search --workspace <path> --query <text> [--limit 10]
  ai-context-kit codex-mem route --workspace <path> --query <text> [--limit 8]
  ai-context-kit codex-mem timeline --workspace <path> [--limit 20]
  ai-context-kit codex-mem get --workspace <path> --ref <ref-path-or-hash> [--output <file>]
  ai-context-kit codex-mem record --workspace <path> --title <text> --summary <text> [--repo name] [--path path] [--tag smoke]
  ai-context-kit codex-mem mcp --workspace <path>
  ai-context-kit codex-mem config --workspace <path> [--name codexMem] [--output <file>]
  ai-context-kit codex-mem install-hooks --workspace <path> [--mode observe|compress] [--force]
  ai-context-kit codex-mem install-user-hooks --workspace <path> [--mode observe|compress] [--force]
  ai-context-kit codex-mem dashboard --workspace <path> [--output <file>]
  ai-context-kit codex-mem sessions --workspace <path> [--days 14] [--session <id>] [--output <file>]
  ai-context-kit codex-mem exec-events --workspace <path> --events <events.jsonl> [--events <events-b.jsonl>] [--output <file>]

The first version is designed for Codex app observe mode:

- build a lightweight workspace/project-facts index
- install project-local Codex hooks under <workspace>/.codex/
- install optional user-level hooks for non-Git parent workspaces
- record tool-event token estimates in <workspace>/.codex-mem/ledger.jsonl
- avoid blocking tools unless the hook mode is changed to compress
`);
}

function runRedact(opts) {
  const input = String(opts.input || "").trim();
  if (!input) fail("redact requires --input <file>");
  const inputPath = input === "-" ? "" : path.resolve(input);
  if (inputPath && !fs.existsSync(inputPath)) fail(`redact input could not be read: ${input}`);
  const text = input === "-" ? fs.readFileSync(0, "utf8") : safeRead(inputPath);
  const result = redactText(text);
  if (opts.output) {
    writeFile(path.resolve(opts.output), result.text, opts);
    log(`redacted ${result.total} value(s)`);
    return;
  }
  process.stdout.write(result.text);
}

function redactText(input) {
  const counts = {};
  let text = String(input || "");
  const apply = (label, pattern, replacer) => {
    text = text.replace(pattern, (...args) => {
      counts[label] = (counts[label] || 0) + 1;
      return typeof replacer === "function" ? replacer(...args) : replacer;
    });
  };

  apply("pem-block", /-----BEGIN [^-]*(?:PRIVATE KEY|CERTIFICATE)[\s\S]*?-----END [^-]*(?:PRIVATE KEY|CERTIFICATE)-----/g, "-----BEGIN REDACTED-----\n***REDACTED***\n-----END REDACTED-----");
  apply("openai-key", /\bsk-[A-Za-z0-9_.*-]{8,}\b/g, "sk-***REDACTED***");
  apply("bearer-token", /\bBearer\s+[A-Za-z0-9._~+/=-]{12,}/gi, "Bearer ***REDACTED***");
  apply("authorization-header", /(\bAuthorization\s*[:=]\s*)(["']?)([^\r\n"']+)(["']?)/gi, (_, prefix, openQuote, _value, closeQuote) => `${prefix}${openQuote}***REDACTED***${closeQuote && openQuote ? closeQuote : ""}`);
  apply("cookie-header", /(\bCookie\s*[:=]\s*)(["']?)([^\r\n"']+)(["']?)/gi, (_, prefix, openQuote, _value, closeQuote) => `${prefix}${openQuote}***REDACTED***${closeQuote && openQuote ? closeQuote : ""}`);
  apply("url-password", /\b([a-z][a-z0-9+.-]*:\/\/[^/\s:@]+):([^@/\s]+)@/gi, (_, userPart) => `${userPart}:***REDACTED***@`);

  const sensitiveKey = String.raw`(?:token|secret|password|passwd|pwd|credential|authorization|bearer|cookie|[\w.-]*(?:api[_-]?key|access[_-]?token|refresh[_-]?token|id[_-]?token|auth[_-]?token|session[_-]?token|session[_-]?key|private[_-]?key|client[_-]?secret)[\w.-]*)`;
  apply("json-secret-field", new RegExp(`(["'])(${sensitiveKey})\\1(\\s*:\\s*)(["'])([^"'\\r\\n]{1,1000})\\4`, "gi"), (_, keyQuote, key, sep, valueQuote) => `${keyQuote}${key}${keyQuote}${sep}${valueQuote}***REDACTED***${valueQuote}`);
  apply("plain-secret-field", new RegExp(`\\b(${sensitiveKey})(\\s*[:=]\\s*)(["']?)([^"'\\s][^"'\\r\\n]*)\\3`, "gi"), (_, key, sep, quote) => `${key}${sep}${quote}***REDACTED***${quote}`);

  apply("email", /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "<redacted-email>");
  apply("cn-mobile-phone", /\b1[3-9]\d{9}\b/g, "<redacted-phone>");
  apply("mac-home-path", /\/Users\/[^/\s]+(?=\/)/g, "/Users/<user>");
  apply("linux-home-path", /\/home\/[^/\s]+(?=\/)/g, "/home/<user>");
  apply("windows-home-path", /\b([A-Za-z]:\\Users\\)[^\\\s]+(?=\\)/g, (_, prefix) => `${prefix}<user>`);

  return {
    text,
    counts,
    total: Object.values(counts).reduce((sum, count) => sum + count, 0)
  };
}

function buildContext(workspace) {
  const repos = discoverRepos(workspace);
  return {
    workspace,
    repos,
    codegraph: detectCommand("codegraph")
  };
}

function discoverRepos(workspace) {
  const directGit = path.join(workspace, ".git");
  if (fs.existsSync(directGit)) return [buildRepoInfo(workspace, workspace)];

  const entries = fs.readdirSync(workspace, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(workspace, entry.name))
    .filter((dir) => fs.existsSync(path.join(dir, ".git")))
    .map((dir) => buildRepoInfo(dir, workspace))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function buildRepoInfo(repoPath, workspace) {
  const name = path.basename(repoPath);
  const rel = path.relative(workspace, repoPath) || ".";
  const files = listFiles(repoPath);
  const hasPom = fs.existsSync(path.join(repoPath, "pom.xml"));
  const hasGoMod = fs.existsSync(path.join(repoPath, "go.mod"));
  const hasPackage = fs.existsSync(path.join(repoPath, "package.json"));
  const hasPagesJson = fs.existsSync(path.join(repoPath, "pages.json"));
  const hasManifest = fs.existsSync(path.join(repoPath, "manifest.json"));
  const goFiles = files.filter((f) => f.endsWith(".go"));
  const javaFiles = files.filter((f) => f.endsWith(".java"));
  const backendJavaFiles = files.filter((f) => f.startsWith("src/main/java/") && f.endsWith(".java"));
  const vueFiles = files.filter((f) => f.endsWith(".vue"));
  const mapperXml = files.filter((f) => f.includes("/mapper/") && f.endsWith(".xml"));
  const controllers = javaFiles.filter((file) => safeRead(path.join(repoPath, file)).includes("@RestController"));
  const apiFiles = files.filter(isFrontendApiCandidateFile);
  const tech = detectTech({ hasPom, hasGoMod, hasPackage, hasPagesJson, hasManifest, goFiles, backendJavaFiles, vueFiles });
  const metadata = detectRepoMetadata(repoPath, files);
  return {
    name,
    path: repoPath,
    rel,
    files,
    tech,
    metadata,
    branch: git(repoPath, ["branch", "--show-current"]) || "unknown",
    remote: git(repoPath, ["remote", "-v"]).split("\n")[0] || "",
    stats: {
      files: files.length,
      go: goFiles.length,
      java: javaFiles.length,
      vue: vueFiles.length,
      controllers: controllers.length,
      mapperXml: mapperXml.length,
      apiFiles: apiFiles.length
    }
  };
}

function detectRepoMetadata(repoPath, files) {
  const packageJson = readJson(path.join(repoPath, "package.json"));
  const manifest = parseJsonLike(safeRead(path.join(repoPath, "manifest.json")));
  const pom = safeRead(path.join(repoPath, "pom.xml"));
  const readme = readFirstExisting(repoPath, ["README.md", "readme.md"]);
  const readmeTitle = firstMarkdownTitle(readme);
  const artifactIds = mavenProjectHints(pom);
  const javaPackages = files
    .filter((f) => f.endsWith(".java") && f.startsWith("src/main/java/"))
    .slice(0, 80)
    .map((file) => {
      const content = safeRead(path.join(repoPath, file));
      const match = content.match(/^\s*package\s+([A-Za-z0-9_.]+)\s*;/m);
      return match ? match[1] : "";
    })
    .filter(Boolean);

  return {
    packageName: packageJson?.name || "",
    manifestName: manifest?.name || manifest?.["mp-weixin"]?.appid || "",
    readmeTitle,
    artifactIds,
    javaRoots: commonJavaRoots(javaPackages),
    remoteSlug: remoteSlug(git(repoPath, ["remote", "-v"]).split("\n")[0] || "")
  };
}

function detectTech(repo) {
  const tech = [];
  if (repo.hasPom) tech.push("maven");
  if (repo.hasPom || repo.backendJavaFiles.length) tech.push("java");
  if (repo.hasGoMod || repo.goFiles.length) tech.push("go");
  if (repo.hasPagesJson || repo.hasManifest) tech.push("uni-app");
  if (repo.vueFiles.length) tech.push("vue");
  if (repo.hasPackage) tech.push("node");
  return tech;
}

function listFiles(root) {
  const output = [];
  walk(root, root, output);
  return output.sort();
}

function walk(root, dir, output) {
  let entries = [];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (EXCLUDED_DIRS.has(entry.name)) continue;
      walk(root, path.join(dir, entry.name), output);
      continue;
    }
    if (!entry.isFile()) continue;
    const full = path.join(dir, entry.name);
    const rel = slash(path.relative(root, full));
    output.push(rel);
  }
}

function generateWorkspaceContext(context, opts) {
  generateWorkspaceAgents(context, opts);

  const workspaceIsRepo = fs.existsSync(path.join(context.workspace, ".git"));
  if (workspaceIsRepo && context.repos.length === 1) return;

  const mapPath = path.join(context.workspace, "docs", "ai-context-workspace-map.md");
  writeGeneratedFile(mapPath, renderWorkspaceMap(context), opts);
  const contractPath = path.join(context.workspace, "docs", "ai-context-api-contract-map.md");
  writeGeneratedFile(contractPath, renderWorkspaceApiContractMap(context), opts);
}

function repairWorkflowArtifacts(context, opts) {
  const artifactsBefore = workflowArtifacts(context);
  const missingBefore = artifactsBefore.filter((item) => !item.exists);
  const staleBefore = artifactsBefore.filter((item) => item.exists && item.issue);
  if (!missingBefore.length && staleBefore.length && !opts.force) {
    log(`generated workflow artifacts need init refresh: ${formatArtifactList(staleBefore)}`);
    return;
  }
  if (!missingBefore.length && !opts.force) {
    log("workflow artifacts already present.");
    return;
  }

  const repairOpts = { ...opts, missingOnly: !opts.force };
  generateWorkspaceContext(context, repairOpts);
  generateAgents(context, repairOpts);
  generateFacts(context, repairOpts);
  writeScopeReport(context, repairOpts);

  const refreshedContext = opts.dryRun ? context : buildContext(context.workspace);
  initCodexMem(refreshedContext, repairOpts);
  const needsIndexRefresh = opts.force || missingBefore.length > 0;
  writeCodexMemIndex(refreshedContext, needsIndexRefresh ? opts : repairOpts);

  const artifactsAfter = opts.dryRun ? artifactsBefore : workflowArtifacts(refreshedContext);
  const missingAfter = artifactsAfter.filter((item) => !item.exists);
  if (missingAfter.length) {
    log(`workflow artifacts still missing: ${formatArtifactList(missingAfter)}`);
    return;
  }
  const staleAfter = artifactsAfter.filter((item) => item.exists && item.issue);
  if (staleAfter.length && !opts.force) {
    log(`workflow artifacts present; generated artifacts need init refresh: ${formatArtifactList(staleAfter)}`);
    return;
  }
  log("workflow artifacts ready.");
}

function runOnboard(context, opts) {
  console.log(`# ${cliLabel()} onboard

workspace: ${context.workspace}
`);
  repairWorkflowArtifacts(context, opts);
  const refreshedContext = opts.dryRun ? context : buildContext(context.workspace);
  console.log("");
  printDoctor(refreshedContext);
  console.log("\n# token status\n");
  printTokenStatus(refreshedContext, tokenStatusDisplayOpts(opts));
  console.log("\n# capability actions\n");
  printCapabilityActions(refreshedContext);
}

function runUpgrade(context, opts) {
  console.log(`# ${cliLabel()} upgrade

workspace: ${context.workspace}
`);
  runInitWorkflow(context, opts);
  const refreshedContext = opts.dryRun ? context : buildContext(context.workspace);
  console.log("");
  printDoctor(refreshedContext);
  console.log("\n# token status\n");
  printTokenStatus(refreshedContext, tokenStatusDisplayOpts(opts));
  console.log("\n# capability actions\n");
  printCapabilityActions(refreshedContext);
}

function runInitWorkflow(context, opts) {
  generateWorkspaceContext(context, opts);
  generateAgents(context, opts);
  generateFacts(context, opts);
  writeScopeReport(context, opts);
  const refreshedContext = opts.dryRun ? context : buildContext(context.workspace);
  initCodexMem(refreshedContext, opts);
  writeCodexMemIndex(refreshedContext, opts);
  if (opts.withCodegraph) runCodegraphInit(refreshedContext, opts);
}

function tokenStatusDisplayOpts(opts) {
  return { ...opts, json: false, output: "" };
}

function generateWorkspaceAgents(context, opts) {
  const workspaceIsRepo = fs.existsSync(path.join(context.workspace, ".git"));
  if (workspaceIsRepo && context.repos.length === 1) return;

  const agentsPath = path.join(context.workspace, "AGENTS.md");
  writeManagedFile(agentsPath, renderWorkspaceAgents(context), opts);
}

function renderWorkspaceAgents(context) {
  const repoRows = context.repos.map((repo) => (
    `| \`${repo.name}\` | ${repoRole(repo)} | ${repoIdentityHints(repo)} | \`${repo.rel}\` | \`${repo.branch}\` | ${repo.stats.files} |`
  )).join("\n");

  return `# Codex 工作区指引

## 工作区定位

当前目录是多仓库工作区，不是单一业务仓库。

Codex app 可以从这个父目录打开，但普通任务必须先选择一个主仓库，再读取对应源码。

| 仓库 | 角色 | 识别线索 | 相对路径 | 分支 | 文件数 |
|---|---|---|---|---|---:|
${repoRows || "| - | - | - | - | - | - |"}

## 任务路由

${renderRepoRoutingBullets(context)}
- 跨端字段或接口问题：选择报错来源所在仓库作为主仓库，只读取另一个仓库的相关 endpoint、Controller、DTO、API wrapper、DTO copy/mapper。
- 跨端字段、下单、支付、预约类问题优先用 \`ai-context-kit contracts --workspace . --query "<endpoint-or-symbol>"\` 或 \`rg -n "<endpoint|symbol>" docs/ai-context-api-contract-map.md\` 精确筛选，不要整段读取契约索引。
- \`contracts\` 输出的同页面相关接口也要纳入首批检查，用于发现下单、支付发起、设备状态、取消或失败路径。
- 下单、支付、预约、库存、租用、结算、退款、保险等跨端流程：整理页面/入口、API wrapper、endpoint、Controller、请求 DTO、响应字段、核心 Service、DTO copy/mapper、状态流转、支付通道和失败/取消路径的小表。
- 后端单接口 bug：已知目标仓库和方法后，不读取 \`.codex-mem/index.jsonl\`，不扫全量 DTO 包；只读 route/contract 命中、Controller/handler、请求 DTO、直接 Service/ServiceImpl、必要 Mapper、响应或状态 DTO。支付、核销、异步任务等后续链路只读能证明当前问题的一层。
- 字段契约问题：对比前端 payload、后端请求 DTO、响应 DTO 和 DTO copy/mapper；顶层字段与嵌套字段分开检查。
- 新旧接口路径问题：对比前端 URL、后端 Controller 路由、较新的替代接口和仍在使用的旧接口。
- 前端链路还要检查缺失 export/import、空数据渲染、运行时分支、硬编码环境或支付配置；这些问题通常不在后端 DTO 里。
- 用户没有说明所属项目时，先根据页面名、接口路径、日志包名或文件名判断；仍不清楚时，只问一个短问题确认主仓库。

## 父目录工作规则

- 不在父目录做全量源码搜索，除非任务明确需要跨仓库定位。
- 优先读取 \`docs/ai-context-workspace-map.md\` 和 \`docs/ai-context-scope-report.md\`。
- 进入子仓库后，遵守该仓库自己的 \`AGENTS.md\` 和 \`project-facts/\`。
- 修改范围默认限制在一个主仓库；跨仓库修改前说明涉及的仓库和文件。

## 禁止默认读取

${SENSITIVE_GLOBS.map((item) => `- \`*/${item}\``).join("\n")}
- \`**/node_modules/**\`
- \`**/target/**\`
- \`**/dist/**\`
- \`**/unpackage/**\`
- \`**/.codegraph/**\`

## 高 token 路径

以下路径只有在任务明确相关时才读取，普通排查不要直接打开：

${HIGH_VOLUME_GLOBS.map((item) => `- \`**/${item}\``).join("\n")}

## CodeGraph

CodeGraph 只作为按需索引和查询工具。不要在父目录对全部子仓库批量初始化。

需要使用时，指定子仓库，例如：

\`\`\`bash
ai-context-kit codegraph --workspace . --repos example-miniapp
\`\`\`
`;
}

function renderWorkspaceMap(context) {
  const all = summarizeWorkspace(context.workspace);
  const repoRows = context.repos.map((repo) => {
    const facts = repoFactsLinks(repo);
    return `| \`${repo.name}\` | ${repoRole(repo)} | ${repoIdentityHints(repo)} | \`${repo.rel}\` | \`${repo.branch}\` | ${repo.stats.files} | ${facts} |`;
  }).join("\n");

  return `# AI 工作区地图

生成时间：${new Date().toISOString()}

## 目的

本文件用于父目录打开 Codex app 时快速选择主仓库，避免每个任务都扫描全部项目。

## 工作区

- 路径：\`.\`（执行命令时指定的 workspace）
- 子仓库数量：${context.repos.length}
- 源码/配置文件数量估算：${all.sourceFiles}
- CodeGraph：${context.codegraph ? "已发现" : "未发现"}

## 子仓库

| 仓库 | 角色 | 识别线索 | 相对路径 | 分支 | 文件数 | 关键索引 |
|---|---|---|---|---|---:|---|
${repoRows || "| - | - | - | - | - | - | - |"}

## 推荐读取方式

| 任务 | 主仓库 | 首选索引 |
|---|---|---|
${renderRecommendedReadRows(context)}
| 跨端字段或接口契约问题 | 报错来源所在仓库 | \`docs/ai-context-api-contract-map.md\` + 主仓库索引 + 对端 endpoint、Controller、DTO、API wrapper、DTO copy/mapper |

## 范围收益

从父目录直接探索会面对约 ${all.sourceFiles} 个源码/配置文件。先选择主仓库后，Codex app 通常只需要读取目标仓库的索引和少量相关源码。
`;
}

function repoRole(repo) {
  if (repo.tech.includes("uni-app")) return "uni-app 小程序";
  if (repo.tech.includes("java")) return "Java 后端服务";
  if (repo.tech.includes("go")) return "Go 后端服务";
  if (repo.tech.includes("vue") && repo.tech.includes("node") && /(admin|console|dashboard|portal)/i.test(repo.name)) return "管理控制台前端";
  if (repo.tech.includes("vue") && repo.tech.includes("node")) return "Vue/Node 前端项目";
  if (repo.tech.includes("vue")) return "Vue 前端项目";
  if (repo.tech.includes("node")) return "Node.js 项目";
  return repo.tech.join(", ") || "项目仓库";
}

function renderRecommendedReadRows(context) {
  if (!context.repos.length) return "| 未识别 | - | - |";
  return context.repos.map((repo) => {
    const task = repo.tech.includes("uni-app")
      ? `${repoRole(repo)} 页面/接口问题`
      : repo.tech.includes("java")
        ? `${repoRole(repo)} 接口/业务问题`
        : repo.tech.includes("go")
          ? `${repoRole(repo)} 接口/业务问题`
          : `${repoRole(repo)} 相关问题`;
    const facts = repoFactsLinks(repo);
    return `| ${task} | \`${repo.name}\` | ${facts} |`;
  }).join("\n");
}

function renderRepoRoutingBullets(context) {
  if (!context.repos.length) return "- 当前目录下未发现子 Git 仓库。";
  return context.repos.map((repo) => {
    const hints = [];
    if (repo.tech.includes("uni-app")) hints.push("页面、交互、样式、uni-app 请求");
    if (repo.tech.includes("vue") && !repo.tech.includes("uni-app")) hints.push("页面、交互、样式、前端 API");
    if (repo.tech.includes("java")) hints.push("后端接口、业务逻辑、Mapper/XML");
    if (repo.tech.includes("go")) hints.push("Go 后端、核心业务逻辑、平台/agent 适配");
    if (repo.tech.includes("node") && !repo.tech.includes("uni-app")) hints.push("Node.js 脚本或前端构建");
    const scope = hints.length ? hints.join("；") : "该仓库相关任务";
    const identity = repoIdentityHints(repo);
    return `- ${repoRole(repo)}（${identity}）：${scope}，进入 \`${repo.name}\`。`;
  }).join("\n");
}

function repoIdentityHints(repo) {
  const hints = [
    repo.metadata?.readmeTitle,
    repo.metadata?.packageName,
    repo.metadata?.manifestName,
    ...(repo.metadata?.artifactIds || []),
    ...(repo.metadata?.javaRoots || []),
    repo.metadata?.remoteSlug
  ].filter(Boolean);
  return hints.length ? unique(hints).slice(0, 5).map((item) => `\`${item}\``).join(", ") : "-";
}

function repoFactsLinks(repo) {
  const links = ["project-facts/project.md", "project-facts/verification.md"];
  if (repo.tech.includes("java")) links.push("project-facts/backend-route-controller-map.md", "project-facts/api-contract-map.md");
  if (repo.tech.includes("uni-app") || repo.tech.includes("vue")) {
    links.push("project-facts/api-endpoints.md", "project-facts/applet-route-api-map.md");
  }
  return links.map((item) => `\`${item}\``).join(", ");
}

function generateAgents(context, opts) {
  const repos = selectRepos(context, opts);
  for (const repo of repos) {
    const target = path.join(repo.path, "AGENTS.md");
    writeManagedFile(target, renderAgents(repo), opts);
  }
}

function renderAgents(repo) {
  const role = repoRole(repo);
  const readOrder = repo.tech.includes("uni-app")
    ? [
        "pages.json",
        "相关 pages*/ 或 mapPage/ 下的页面和组件",
        "api/*.js",
        "utils/httpServesFunction/index.js、utils/serves/httpServes.js、utils/services/request.js"
      ]
    : repo.tech.includes("java")
      ? [
          "Controller",
          "Service / ServiceImpl",
          "Mapper.java",
          "Mapper.xml",
          "DTO / domain / request / response",
          "必要 SQL"
        ]
      : repo.tech.includes("go")
        ? [
            "go.mod",
            "相关 package",
            "接口和核心业务文件",
            "*_test.go",
            "README.md"
          ]
        : repo.tech.includes("vue")
          ? [
              "package.json",
              "src/router 或 permission 路由",
              "src/views 下相关页面",
              "src/api 下相关接口封装",
              "README.md"
            ]
          : repo.tech.includes("node")
            ? ["package.json", "README.md", "项目入口文件", "相关模块"]
            : ["README.md", "项目入口文件", "相关模块"];

  return `# Codex 项目指引

## 仓库角色

当前仓库：\`${repo.name}\`

角色：${role}

## 默认读取顺序

${readOrder.map((item, idx) => `${idx + 1}. ${item}`).join("\n")}

## 任务范围

- 普通任务只在当前仓库内查找和修改。
- 跨端接口问题只读取 sibling repo 的相关 endpoint、Controller、DTO、API wrapper、DTO copy/mapper，不扫描整个 sibling repo。
- 从父目录接手跨端字段、下单、支付、预约类问题时，先用 \`ai-context-kit contracts --workspace .. --query "<endpoint-or-symbol>"\` 或对 \`../docs/ai-context-api-contract-map.md\` 做精确 \`rg\`；不要整段读取契约索引。
- \`contracts\` 输出的同页面相关接口也要纳入首批检查，用于发现下单、支付发起、设备状态、取消或失败路径。
- 涉及下单、支付、预约、库存、租用、结算、退款、保险等跨端流程时，整理页面/入口、API wrapper、endpoint、Controller、请求 DTO、响应字段、核心 Service、DTO copy/mapper、状态流转、支付通道和失败/取消路径的小表。
- 后端单接口 bug 已知方法名时，只读 route/contract 命中、Controller/handler、请求 DTO、直接 Service/ServiceImpl、必要 Mapper、响应或状态 DTO；不要读取 \`.codex-mem/index.jsonl\`，不要用宽泛字段名扫全量 DTO 包；支付、核销、异步任务等后续链路只读能证明当前问题的一层。
- 字段契约问题要对比前端 payload、后端请求 DTO、响应 DTO 和 DTO copy/mapper；顶层字段与嵌套字段分开检查。
- 新旧接口路径问题要对比前端 URL、后端 Controller 路由、较新的替代接口和仍在使用的旧接口。
- 前端链路还要检查缺失 export/import、空数据渲染、运行时分支、硬编码环境或支付配置；这些问题通常不在后端 DTO 里。
- 修改前先列出相关文件清单和理由。
- 修改后执行可用验证命令；无法验证时说明缺少的环境或数据。

## 禁止默认读取

${SENSITIVE_GLOBS.map((item) => `- \`${item}\``).join("\n")}
- \`node_modules/**\`
- \`target/**\`
- \`dist/**\`
- \`unpackage/**\`
- \`.codegraph/**\`

## 高 token 路径

以下路径只有在任务明确相关时才读取：

${HIGH_VOLUME_GLOBS.map((item) => `- \`${item}\``).join("\n")}

## 建议验证

${renderVerificationBullets(repo)}
`;
}

function renderVerificationBullets(repo) {
  if (repo.tech.includes("maven")) {
    return [
      "- Java/Maven 项目：优先执行 `mvn -DskipTests package` 或更窄的相关测试。",
      "- 如果本地缺少数据库、Redis、配置中心或第三方依赖，只能说明编译/静态检查结果，不能说接口链路已完整验证。"
    ].join("\n");
  }
  if (repo.tech.includes("go")) {
    return [
      "- Go 项目：优先执行 `go test ./...`，也可以先跑相关包或指定测试。",
      "- 如果测试依赖本地端口、外部服务或平台凭证，报告中要写清哪些部分没有验证。"
    ].join("\n");
  }
  if (repo.tech.includes("uni-app")) {
    return [
      "- uni-app 小程序：先确认 `package.json` 是否有构建脚本；没有脚本时说明需要 HBuilderX/微信开发者工具验证。",
      "- 页面问题不能只看接口返回；需要真实页面或开发者工具验证。"
    ].join("\n");
  }
  return "- 按 README 或项目事实文件中的命令验证。";
}

function generateFacts(context, opts) {
  const repos = selectRepos(context, opts);
  for (const repo of repos) {
    const dir = path.join(repo.path, "project-facts");
    ensureDir(dir, opts);
    writeManagedFile(path.join(dir, "project.md"), renderProjectFacts(repo), opts);
    writeManagedFile(path.join(dir, "verification.md"), renderVerification(repo), opts);
    writeManagedFile(path.join(dir, "context-boundary.md"), renderBoundary(repo, context), opts);
    if (repo.tech.includes("java")) {
      writeManagedFile(path.join(dir, "backend-route-controller-map.md"), renderSpringRoutes(repo), opts);
      writeManagedFile(path.join(dir, "api-contract-map.md"), renderJavaApiContractMap(repo), opts);
    }
    if (repo.tech.includes("uni-app") || repo.tech.includes("vue")) {
      writeManagedFile(path.join(dir, "api-endpoints.md"), renderApiEndpoints(repo), opts);
      writeManagedFile(path.join(dir, "applet-route-api-map.md"), renderAppletRouteApiMap(repo), opts);
    }
  }
}

function renderProjectFacts(repo) {
  return `# ${repo.name} 项目事实

生成时间：${new Date().toISOString()}

## 仓库

- 工作区相对路径：\`${repo.rel}\`
- 分支：\`${repo.branch}\`
- 远端：\`${repo.remote}\`
- 技术标签：${repo.tech.length ? repo.tech.map((t) => `\`${t}\``).join(", ") : "未识别"}

## 规模

| 指标 | 数量 |
|---|---:|
| 文件 | ${repo.stats.files} |
| Go 文件 | ${repo.stats.go} |
| Java 文件 | ${repo.stats.java} |
| Vue 文件 | ${repo.stats.vue} |
| RestController | ${repo.stats.controllers} |
| Mapper XML | ${repo.stats.mapperXml} |
| API JS 文件 | ${repo.stats.apiFiles} |

## 使用说明

本文件供 Codex app 快速了解仓库范围。实际修改前仍需读取相关源码和执行验证命令。
`;
}

function renderVerification(repo) {
  const packageJson = readJson(path.join(repo.path, "package.json"));
  const scripts = packageJson?.scripts || {};
  const scriptLines = Object.keys(scripts).length
    ? Object.entries(scripts).map(([name, cmd]) => `- \`npm run ${name}\` -> \`${cmd}\``).join("\n")
    : "- 未发现常规 npm scripts。uni-app 项目可能需要 HBuilderX 或开发者工具验证。";

  return `# 验证方式

生成时间：${new Date().toISOString()}

## 可检测到的命令

${repo.tech.includes("maven") ? "- Maven：`mvn -DskipTests package`\n- Maven 测试：`mvn test`" : repo.tech.includes("go") ? "- Go：`go test ./...`\n- Go 相关包：`go test ./<package>`\n- Go 指定测试：`go test ./<package> -run <TestName>`" : scriptLines}

## 验证边界

- 未配置数据库、Redis、第三方支付、短信、对象存储等依赖时，不能把编译通过写成接口链路已验证。
- 页面问题需要在小程序开发者工具或 Codex app browser 可访问页面中验证。
- 涉及生产配置、证书、密钥的问题需要人工提供脱敏信息。
`;
}

function renderBoundary(repo, context) {
  const siblings = context.repos.filter((r) => r.name !== repo.name).map((r) => r.name);
  return `# Codex 上下文边界

当前仓库：\`${repo.name}\`

## 默认范围

- 默认只读当前仓库。
- 不从工作区顶层扫描全部项目。
- 跨仓库问题只读取 sibling repo 的相关接口或调用文件；字段/路径问题增加请求 DTO、响应 DTO 和 DTO copy/mapper。

## sibling repos

${siblings.length ? siblings.map((name) => `- \`${name}\``).join("\n") : "- 无"}

## 禁读路径

${SENSITIVE_GLOBS.map((item) => `- \`${item}\``).join("\n")}
- \`node_modules/**\`
- \`target/**\`
- \`dist/**\`
- \`unpackage/**\`
- \`.codegraph/**\`

## 高 token 路径

以下路径只有在任务明确相关时才读取：

${HIGH_VOLUME_GLOBS.map((item) => `- \`${item}\``).join("\n")}
`;
}

function renderSpringRoutes(repo) {
  const rows = collectSpringRoutes(repo);
  rows.sort((a, b) => `${a.path} ${a.http}`.localeCompare(`${b.path} ${b.http}`));

  const table = rows.length
    ? rows.map((r) => `| ${r.http} | \`${r.path}\` | \`${r.controller}.${r.method}\` | \`${r.file}:${r.line}\` |`).join("\n")
    : "| - | - | - | - |";

  return `# 后端路由与 Controller 映射

生成时间：${new Date().toISOString()}

> 由 ai-context-kit 静态扫描生成。动态路径、变量拼接、继承映射需要人工复查。

| Method | Path | Handler | File |
|---|---|---|---|
${table}
`;
}

function collectSpringRoutes(repo) {
  const rows = [];
  for (const rel of repo.files.filter((f) => f.endsWith(".java") && f.includes("/controller/"))) {
    const full = path.join(repo.path, rel);
    const content = safeRead(full);
    if (!content.includes("Mapping") && !content.includes("@RestController")) continue;
    const className = (content.match(/\bclass\s+([A-Za-z0-9_]+)/) || [])[1] || path.basename(rel, ".java");
    const classBase = extractClassBasePath(content);
    const methods = extractMethodMappings(content);
    for (const method of methods) {
      rows.push({
        http: method.http,
        path: normalizeRoute(classBase, method.path),
        controller: className,
        method: method.name,
        requestTypes: method.requestTypes,
        responseType: cleanType(method.returnType),
        file: rel,
        line: lineOf(content, method.index)
      });
    }
  }
  return rows;
}

function extractClassBasePath(content) {
  const classIdx = content.search(/\bclass\s+[A-Za-z0-9_]+/);
  const prefix = classIdx >= 0 ? content.slice(0, classIdx) : content.slice(0, 1200);
  const matches = [...prefix.matchAll(/@RequestMapping\s*(?:\(([^)]*)\))?/g)];
  const last = matches.at(-1);
  return last ? extractPathArg(last[1] || "") : "";
}

function extractMethodMappings(content) {
  const out = [];
  const classIdx = content.search(/\bclass\s+[A-Za-z0-9_]+/);
  const bodyOffset = classIdx >= 0 ? content.indexOf("{", classIdx) + 1 : 0;
  const body = bodyOffset > 0 ? content.slice(bodyOffset) : content;
  const re = /@(GetMapping|PostMapping|PutMapping|DeleteMapping|PatchMapping|RequestMapping)\s*(?:\(([^)]*)\))?(?:\s*@[A-Za-z0-9_.]+(?:\([^)]*\))?)*\s+(?:public|protected|private)?\s*(?:static\s+)?(?:final\s+)?([A-Za-z0-9_<>\[\], ?]+)\s+([A-Za-z0-9_]+)\s*\(([^)]*)\)/g;
  let match;
  while ((match = re.exec(body))) {
    const annotation = match[1];
    const args = match[2] || "";
    const params = match[5] || "";
    out.push({
      index: bodyOffset + match.index,
      http: httpFor(annotation, args),
      path: extractPathArg(args),
      returnType: match[3],
      name: match[4],
      requestTypes: extractRequestDtoTypes(params)
    });
  }
  return out;
}

function extractRequestDtoTypes(params) {
  return unique(splitParams(params)
    .map((param) => cleanParamType(param))
    .filter(Boolean)
    .filter((type) => looksLikeRequestDto(type)));
}

function splitParams(params) {
  const out = [];
  let current = "";
  let depth = 0;
  for (const char of String(params || "")) {
    if (char === "<") depth += 1;
    if (char === ">") depth = Math.max(0, depth - 1);
    if (char === "," && depth === 0) {
      if (current.trim()) out.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }
  if (current.trim()) out.push(current.trim());
  return out;
}

function cleanParamType(param) {
  const withoutAnnotations = String(param || "")
    .replace(/@[A-Za-z0-9_.]+(?:\([^)]*\))?\s*/g, "")
    .replace(/\bfinal\s+/g, "")
    .trim();
  const match = withoutAnnotations.match(/([A-Za-z0-9_<>\[\].?, ]+)\s+[A-Za-z0-9_]+$/);
  return match ? simpleTypeName(cleanType(match[1])) : "";
}

function looksLikeRequestDto(type) {
  const simple = simpleTypeName(type);
  if (!simple) return false;
  if (/^(String|Long|Integer|Boolean|Double|Float|BigDecimal|Date|LocalDate|LocalDateTime|HttpServletRequest|HttpServletResponse|BindingResult|MultipartFile|Pageable|Model|Map|List|Set)$/i.test(simple)) return false;
  return /(Req|Request|Dto|DTO|Param|Params|Query|Form|Command)$/i.test(simple);
}

function cleanType(type) {
  return String(type || "").replace(/\s+/g, " ").trim();
}

function simpleTypeName(type) {
  const cleaned = cleanType(type).replace(/\[\]$/, "");
  const match = cleaned.match(/([A-Za-z0-9_]+)(?:\s*>*)$/);
  return match ? match[1] : cleaned.split(".").pop();
}

function httpFor(annotation, args) {
  const map = {
    GetMapping: "GET",
    PostMapping: "POST",
    PutMapping: "PUT",
    DeleteMapping: "DELETE",
    PatchMapping: "PATCH"
  };
  if (map[annotation]) return map[annotation];
  const method = args.match(/RequestMethod\.([A-Z]+)/);
  return method ? method[1] : "ANY";
}

function extractPathArg(args) {
  if (!args) return "";
  const direct = args.match(/["']([^"']+)["']/);
  if (direct) return direct[1];
  const named = args.match(/(?:value|path)\s*=\s*\{\s*["']([^"']+)["']/) || args.match(/(?:value|path)\s*=\s*["']([^"']+)["']/);
  return named ? named[1] : "";
}

function normalizeRoute(a, b) {
  const parts = [a, b].filter(Boolean).map((p) => p.trim()).filter(Boolean);
  const joined = parts.join("/");
  return ("/" + joined).replace(/\/+/g, "/").replace(/\/$/, "") || "/";
}

function renderApiEndpoints(repo) {
  const rows = collectApiEndpoints(repo);
  rows.sort((a, b) => a.endpoint.localeCompare(b.endpoint));
  const table = rows.length
    ? rows.map((r) => `| \`${r.endpoint}\` | \`${r.name}\` | \`${r.file}:${r.line}\` |`).join("\n")
    : "| - | - | - |";
  const title = repo.tech.includes("uni-app") ? "小程序 API endpoint 索引" : "前端 API endpoint 索引";
  return `# ${title}

生成时间：${new Date().toISOString()}

| Endpoint | Symbol | File |
|---|---|---|
${table}
`;
}

function collectApiEndpoints(repo) {
  const rows = [];
  const candidates = repo.files.filter(isFrontendApiCandidateFile);
  const endpointPrefixes = collectFrontendEndpointPrefixes(repo);
  for (const rel of candidates) {
    const content = safeRead(path.join(repo.path, rel));
    rows.push(...collectApiEndpointsFromContent(rel, content, endpointPrefixes));
  }
  return uniqueBy(rows, (row) => `${row.file}\0${row.name}\0${row.endpoint}`);
}

function collectApiEndpointsFromContent(rel, content, endpointPrefixes = []) {
  const rows = [];
  const stringConstants = collectFrontendStringConstants(content);
  const add = (name, endpoint, index) => {
    for (const expanded of expandFrontendEndpoint(endpoint, endpointPrefixes)) {
      if (!looksLikeEndpoint(expanded)) continue;
      rows.push({ name: name || "(url)", endpoint: expanded, file: rel, line: lineOf(content, index) });
    }
  };

  let match;
  const stringConstRe = /export\s+const\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*[`'"]([^`'"]+)[`'"]/g;
  while ((match = stringConstRe.exec(content))) add(match[1], match[2], match.index);

  const functionLikeRe = /(?:export\s+)?(?:async\s+)?function\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*\([^)]*\)\s*\{([\s\S]{0,1200}?)\n\}/g;
  while ((match = functionLikeRe.exec(content))) {
    const endpoint = firstEndpointExpression(match[2], stringConstants) || firstGraphqlEndpoint(match[2]);
    if (endpoint) add(match[1], endpoint, match.index);
  }

  const constFunctionRe = /(?:export\s+)?const\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[A-Za-z_$][A-Za-z0-9_$]*)\s*=>\s*([\s\S]{0,1200}?)(?=\n\s*(?:export\s+)?const\s+[A-Za-z_$]|\n\s*export\s+function\b|\n\s*function\b|$)/g;
  while ((match = constFunctionRe.exec(content))) {
    const endpoint = firstEndpointExpression(match[2], stringConstants) || firstGraphqlEndpoint(match[2]);
    if (endpoint) add(match[1], endpoint, match.index);
  }

  const urlRe = /\b(?:url|path|endpoint|uri)\s*:\s*([^,\n}]+)/g;
  while ((match = urlRe.exec(content))) {
    const endpoint = evaluateFrontendStringExpression(match[1], stringConstants);
    if (endpoint) add("(url)", endpoint, match.index);
  }

  for (const operation of collectGraphqlOperations(content)) {
    add(operation.name, `graphql:${operation.name}`, operation.index);
  }

  return uniqueBy(rows, (row) => `${row.file}\0${row.name}\0${row.endpoint}`);
}

function collectFrontendEndpointPrefixes(repo) {
  const prefixes = [];
  const files = repo.files.filter((file) => {
    const ext = path.extname(file).toLowerCase();
    if (!FRONTEND_SOURCE_EXTENSIONS.has(ext)) return false;
    const rel = slash(file);
    return isFrontendApiCandidateFile(rel) || /(^|\/)(request|http|axios|client|config|env)\.(js|ts|jsx|tsx)$/i.test(rel);
  });
  for (const rel of files) {
    const content = safeRead(path.join(repo.path, rel));
    if (!content) continue;
    const constants = collectFrontendStringConstants(content);
    for (const [name, item] of constants.entries()) {
      if (/(base.*url|base.*api|api.*base|api.*prefix|prefix|baseurl)/i.test(name)) {
        const prefix = normalizeFrontendEndpointPrefix(item.value);
        if (prefix) prefixes.push(prefix);
      }
    }
    const re = /\b(?:baseURL|baseUrl|base_url|apiBase|baseApi|apiPrefix|basePath|prefix)\s*[:=]\s*([^,\n}]+)/g;
    let match;
    while ((match = re.exec(content))) {
      const value = evaluateFrontendStringExpression(match[1], constants);
      const prefix = normalizeFrontendEndpointPrefix(value);
      if (prefix) prefixes.push(prefix);
    }
  }
  return unique(prefixes);
}

function normalizeFrontendEndpointPrefix(value) {
  let text = String(value || "").trim();
  if (!text) return "";
  try {
    if (/^https?:\/\//i.test(text)) text = new URL(text).pathname;
  } catch {}
  if (!text.startsWith("/")) return "";
  return text.replace(/\/+/g, "/").replace(/\/$/, "") || "";
}

function expandFrontendEndpoint(endpoint, prefixes = []) {
  const value = String(endpoint || "").trim();
  if (!value) return [];
  if (/^graphql:/i.test(value) || /^https?:\/\//i.test(value)) return looksLikeEndpoint(value) ? [value] : [];
  const out = [];
  if (looksLikeEndpoint(value)) out.push(value);
  for (const prefix of prefixes || []) {
    if (!prefix) continue;
    if (value.startsWith("/") && endpointHasPrefix(value, prefix)) continue;
    if (!value.startsWith("/") && !/^[A-Za-z0-9_$./{}:-]+$/.test(value)) continue;
    out.push(joinEndpointPrefix(prefix, value));
  }
  return unique(out.filter(Boolean));
}

function endpointHasPrefix(endpoint, prefix) {
  const value = String(endpoint || "").replace(/\/+/g, "/");
  const base = String(prefix || "").replace(/\/+/g, "/").replace(/\/$/, "");
  return value === base || value.startsWith(`${base}/`);
}

function joinEndpointPrefix(prefix, endpoint) {
  const base = normalizeFrontendEndpointPrefix(prefix);
  const tail = String(endpoint || "").replace(/^\/+/, "");
  if (!base || !tail) return "";
  return `${base}/${tail}`.replace(/\/+/g, "/");
}

function firstEndpointExpression(content, stringConstants = new Map()) {
  const patterns = [
    /\b(?:url|path|endpoint|uri)\s*:\s*([^,\n}]+)/,
    /\b(?:request|fetch)\s*\(\s*([^,\n)]+)/,
    /\baxios\s*\.\s*(?:get|post|put|patch|delete|request)\s*\(\s*([^,\n)]+)/,
    /\b[A-Za-z_$][A-Za-z0-9_$]*\s*\.\s*(?:GET|POST|PUT|PATCH|DELETE|get|post|put|patch|delete|request)\s*\(\s*([^,\n)]+)/
  ];
  for (const pattern of patterns) {
    const match = String(content || "").match(pattern);
    const endpoint = match ? evaluateFrontendStringExpression(match[1], stringConstants) : "";
    if (endpoint && looksLikeEndpoint(endpoint)) return endpoint;
  }
  const literal = String(content || "").match(/[`'"](\/api\/[^`'"]+|https?:\/\/[^`'"]+)[`'"]/);
  return literal && looksLikeEndpoint(literal[1]) ? literal[1] : "";
}

function firstGraphqlEndpoint(content) {
  const operation = collectGraphqlOperations(content)[0];
  return operation ? `graphql:${operation.name}` : "";
}

function collectGraphqlOperations(content) {
  const operations = [];
  const re = /\b(?:gql|graphql)\s*`([\s\S]*?)`/g;
  let match;
  while ((match = re.exec(String(content || "")))) {
    const operation = match[1].match(/\b(query|mutation|subscription)\s+([A-Za-z_$][A-Za-z0-9_$]*)/);
    if (!operation) continue;
    operations.push({ type: operation[1], name: operation[2], index: match.index });
  }
  return uniqueBy(operations, (item) => `${item.type}\0${item.name}`);
}

function collectFrontendStringConstants(content) {
  const candidates = [];
  const re = /(?:export\s+)?(?:const|let|var)\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*([^;\n]+)/g;
  let match;
  while ((match = re.exec(content))) {
    const expr = match[2].trim();
    if (/=>|\bfunction\b/.test(expr)) continue;
    candidates.push({ name: match[1], expr, index: match.index });
  }
  const constants = new Map();
  for (let pass = 0; pass < 4; pass += 1) {
    let changed = false;
    for (const item of candidates) {
      const value = evaluateFrontendStringExpression(item.expr, constants);
      if (typeof value !== "string") continue;
      const previous = constants.get(item.name)?.value;
      if (previous === value) continue;
      constants.set(item.name, { value, index: item.index });
      changed = true;
    }
    if (!changed) break;
  }
  return constants;
}

function evaluateFrontendStringExpression(expr, constants = new Map(), depth = 0) {
  if (depth > 6) return "";
  let text = trimFrontendExpression(expr);
  if (!text) return "";
  while (text.startsWith("(") && text.endsWith(")") && balancedOuterParens(text)) {
    text = trimFrontendExpression(text.slice(1, -1));
  }
  const literal = parseFrontendStringLiteral(text, constants);
  if (typeof literal === "string") return literal;
  if (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(text)) return constants.get(text)?.value || "";
  const parts = splitFrontendConcat(text);
  if (parts.length > 1) {
    let out = "";
    let hasKnownPart = false;
    for (const part of parts) {
      const value = evaluateFrontendStringExpression(part, constants, depth + 1);
      if (value) {
        out += value;
        hasKnownPart = true;
        continue;
      }
      const name = trimFrontendExpression(part);
      if (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name)) {
        out += `\${${name}}`;
        continue;
      }
      return "";
    }
    return hasKnownPart ? out : "";
  }
  return "";
}

function trimFrontendExpression(expr) {
  return String(expr || "")
    .trim()
    .replace(/\s+as\s+[A-Za-z_$][A-Za-z0-9_$]*(?:\[\])?$/g, "")
    .replace(/\s*[,})]\s*$/g, "")
    .trim();
}

function parseFrontendStringLiteral(text, constants) {
  const value = String(text || "").trim();
  if ((value.startsWith("'") && value.endsWith("'")) || (value.startsWith('"') && value.endsWith('"'))) {
    return value.slice(1, -1).replace(/\\(['"\\])/g, "$1");
  }
  if (value.startsWith("`") && value.endsWith("`")) {
    return value.slice(1, -1).replace(/\$\{([^}]+)\}/g, (_, rawName) => {
      const name = rawName.trim();
      return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name) && constants.has(name)
        ? constants.get(name).value
        : `\${${name}}`;
    });
  }
  return null;
}

function splitFrontendConcat(expr) {
  const parts = [];
  let quote = "";
  let depth = 0;
  let start = 0;
  const text = String(expr || "");
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const prev = text[i - 1];
    if (quote) {
      if (ch === quote && prev !== "\\") quote = "";
      continue;
    }
    if (ch === "'" || ch === '"' || ch === "`") {
      quote = ch;
      continue;
    }
    if (ch === "(" || ch === "[" || ch === "{") depth += 1;
    else if (ch === ")" || ch === "]" || ch === "}") depth = Math.max(0, depth - 1);
    else if (ch === "+" && depth === 0) {
      parts.push(text.slice(start, i).trim());
      start = i + 1;
    }
  }
  parts.push(text.slice(start).trim());
  return parts.filter(Boolean);
}

function balancedOuterParens(text) {
  let depth = 0;
  let quote = "";
  const value = String(text || "");
  for (let i = 0; i < value.length; i += 1) {
    const ch = value[i];
    const prev = value[i - 1];
    if (quote) {
      if (ch === quote && prev !== "\\") quote = "";
      continue;
    }
    if (ch === "'" || ch === '"' || ch === "`") {
      quote = ch;
      continue;
    }
    if (ch === "(") depth += 1;
    if (ch === ")") depth -= 1;
    if (depth === 0 && i < value.length - 1) return false;
  }
  return depth === 0;
}

function looksLikeEndpoint(endpoint) {
  const value = String(endpoint || "").trim();
  return value.startsWith("/") || /^https?:\/\//i.test(value) || /^graphql:[A-Za-z_$][A-Za-z0-9_$]*/.test(value);
}

function renderJavaApiContractMap(repo) {
  const dtoMap = collectDtoClasses(repo);
  const rows = collectSpringRoutes(repo).sort((a, b) => `${a.path} ${a.http}`.localeCompare(`${b.path} ${b.http}`));
  const table = rows.length
    ? rows.map((row) => `| ${row.http} | \`${row.path}\` | \`${row.controller}.${row.method}\` | ${formatDtoList(row.requestTypes, dtoMap)} | ${formatInline(row.responseType || "-")} | \`${row.file}:${row.line}\` |`).join("\n")
    : "| - | - | - | - | - | - |";
  return `# API 契约索引

生成时间：${new Date().toISOString()}

> 由 ai-context-kit 静态扫描生成。动态参数、继承字段、运行时转换和泛型内部字段需要人工复查。

| Method | Path | Handler | Request DTO fields | Response type | File |
|---|---|---|---|---|---|
${table}
`;
}

function buildWorkspaceApiContractRows(context) {
  const backendRoutes = [];
  for (const repo of context.repos.filter((item) => item.tech.includes("java"))) {
    const dtoMap = collectDtoClasses(repo);
    for (const route of collectSpringRoutes(repo)) {
      backendRoutes.push({ repo, route, dtoMap, normalizedPath: normalizeEndpointPath(route.path) });
    }
  }

  const rows = [];
  for (const repo of context.repos.filter((item) => item.tech.includes("uni-app") || item.tech.includes("vue") || item.stats.apiFiles > 0)) {
    const payloadFieldMap = collectFrontendPayloadFieldMap(repo);
    for (const endpoint of collectApiEndpoints(repo)) {
      const normalized = normalizeEndpointPath(endpoint.endpoint);
      const matches = backendRoutes.filter((item) => item.normalizedPath === normalized);
      const frontendPayloadFields = frontendPayloadFieldsForEndpoint(payloadFieldMap, endpoint);
      if (!matches.length) {
        rows.push({
          frontendRepo: repo.name,
          endpoint,
          frontendPayloadFields,
          backendRepo: "-",
          route: null,
          dtoMap: null
        });
        continue;
      }
      for (const match of matches) {
        rows.push({
          frontendRepo: repo.name,
          endpoint,
          frontendPayloadFields,
          backendRepo: match.repo.name,
          route: match.route,
          dtoMap: match.dtoMap
        });
      }
    }
  }

  rows.sort((a, b) => `${a.endpoint.endpoint} ${a.frontendRepo}`.localeCompare(`${b.endpoint.endpoint} ${b.frontendRepo}`));
  return rows;
}

function renderWorkspaceApiContractMap(context) {
  const rows = buildWorkspaceApiContractRows(context);
  const table = rows.length
    ? rows.map((row) => renderWorkspaceContractRow(row)).join("\n")
    : "| - | - | - | - | - | - | - | - | - | - |";

  return `# 跨端 API 契约索引

生成时间：${new Date().toISOString()}

> 由 ai-context-kit 静态扫描生成。只用于定位前后端契约检查入口；动态 URL、网关前缀、运行时参数和旧接口兼容需要人工复查。

| Frontend repo | Endpoint | Symbol | Frontend file | Backend repo | Handler | Frontend payload fields | Request DTO fields | Field check | Response type |
|---|---|---|---|---|---|---|---|---|---|
${table}
`;
}

function writeContextGraph(context, opts) {
  const outPath = opts.output ? path.resolve(opts.output) : path.join(context.workspace, "docs", "ai-context-graph.json");
  writeFile(outPath, JSON.stringify(buildContextGraph(context), null, 2) + "\n", opts);
}

function buildContextGraph(context) {
  const nodes = new Map();
  const edges = new Map();
  const addNode = (id, type, label, attrs = {}) => {
    if (!id) return;
    const current = nodes.get(id) || { id, type, label };
    nodes.set(id, compactObject({ ...current, ...attrs, id, type: current.type || type, label: current.label || label }));
  };
  const addEdge = (from, to, type, attrs = {}) => {
    if (!from || !to) return;
    const id = `${from}->${to}:${type}`;
    edges.set(id, compactObject({ id, from, to, type, ...attrs }));
  };

  addNode("workspace", "workspace", path.basename(context.workspace) || context.workspace, {
    path: ".",
    workspaceKind: fs.existsSync(path.join(context.workspace, ".git")) ? "single-repo" : "multi-repo"
  });
  for (const repo of context.repos) {
    const repoId = contextGraphRepoId(repo.name);
    addNode(repoId, "repo", repo.name, {
      path: repo.rel,
      role: repoRole(repo),
      tech: repo.tech,
      files: repo.stats.files
    });
    addEdge("workspace", repoId, "contains");
  }

  for (const row of buildWorkspaceApiContractRows(context)) {
    const frontendRepo = context.repos.find((repo) => repo.name === row.frontendRepo);
    const frontendRepoId = contextGraphRepoId(row.frontendRepo);
    const apiId = contextGraphApiId(row.frontendRepo, row.endpoint);
    const endpointId = contextGraphEndpointId(row.endpoint.endpoint);
    addNode(apiId, "frontend-api", row.endpoint.name, {
      repo: row.frontendRepo,
      endpoint: row.endpoint.endpoint,
      path: frontendRepo ? workspaceRelForRepoFile(frontendRepo, row.endpoint.file) : row.endpoint.file,
      line: row.endpoint.line
    });
    addNode(endpointId, "endpoint", row.endpoint.endpoint, {
      normalizedPath: normalizeEndpointPath(row.endpoint.endpoint)
    });
    addEdge(frontendRepoId, apiId, "exports-api");
    addEdge(apiId, endpointId, "calls-endpoint");

    if (!row.route) continue;
    const backendRepoId = contextGraphRepoId(row.backendRepo);
    const handlerId = contextGraphHandlerId(row.backendRepo, row.route);
    const backendRepo = context.repos.find((repo) => repo.name === row.backendRepo);
    addNode(handlerId, "backend-handler", `${row.route.controller}.${row.route.method}`, {
      repo: row.backendRepo,
      http: row.route.http,
      path: row.route.path,
      file: backendRepo ? workspaceRelForRepoFile(backendRepo, row.route.file) : row.route.file,
      line: row.route.line
    });
    addEdge(backendRepoId, handlerId, "owns-handler");
    addEdge(endpointId, handlerId, "handled-by");

    for (const type of row.route.requestTypes || []) {
      const dtoName = simpleTypeName(type);
      if (!dtoName) continue;
      const dtoId = contextGraphDtoId(row.backendRepo, dtoName);
      addNode(dtoId, "request-dto", dtoName, contextGraphDtoAttrs(row.backendRepo, dtoName, row.dtoMap));
      addEdge(handlerId, dtoId, "uses-request");
    }
    const responseName = simpleTypeName(row.route.responseType || "");
    if (responseName && responseName !== "R" && responseName !== "ResponseEntity") {
      const dtoId = contextGraphDtoId(row.backendRepo, responseName);
      addNode(dtoId, "response-type", responseName, contextGraphDtoAttrs(row.backendRepo, responseName, row.dtoMap));
      addEdge(handlerId, dtoId, "returns");
    }
  }

  return {
    generatedBy: `${cliLabel()} ${VERSION}`,
    generatedAt: new Date().toISOString(),
    workspace: context.workspace,
    summary: {
      repos: context.repos.length,
      nodes: nodes.size,
      edges: edges.size
    },
    nodes: [...nodes.values()].sort((a, b) => a.id.localeCompare(b.id)),
    edges: [...edges.values()].sort((a, b) => a.id.localeCompare(b.id))
  };
}

function contextGraphRepoId(repoName) {
  return `repo:${repoName || "workspace"}`;
}

function contextGraphApiId(repoName, endpoint) {
  return `api:${repoName}:${endpoint.name}:${endpoint.file}:${endpoint.endpoint}`;
}

function contextGraphEndpointId(endpoint) {
  return `endpoint:${normalizeEndpointPath(endpoint)}`;
}

function contextGraphHandlerId(repoName, route) {
  return `handler:${repoName}:${route.http}:${route.path}:${route.controller}.${route.method}`;
}

function contextGraphDtoId(repoName, dtoName) {
  return `dto:${repoName}:${dtoName}`;
}

function contextGraphDtoAttrs(repoName, dtoName, dtoMap) {
  const dto = dtoMap?.get(dtoName);
  return {
    repo: repoName,
    fields: dto?.fields?.map((field) => compactObject({ name: field.name, type: field.type, required: field.required })) || []
  };
}

function compactObject(value) {
  const out = {};
  for (const [key, item] of Object.entries(value || {})) {
    if (item === undefined || item === null || item === "") continue;
    if (Array.isArray(item) && !item.length) continue;
    out[key] = item;
  }
  return out;
}

function writeContractSearchReport(context, opts) {
  const query = String(opts.query || "").trim();
  if (!query) fail("contracts requires --query <endpoint-or-symbol>");
  const limit = Number.isFinite(opts.limit) && opts.limit > 0 ? opts.limit : 40;
  const filters = normalizeContractFilters(opts);
  const docs = collectContractDocs(context);
  const rows = [];
  const allRows = [];
  for (const doc of docs) {
    const lines = doc.content.split(/\r?\n/);
    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      if (!line.startsWith("|") || line.includes("---|---")) continue;
      if (/^\|\s*(Frontend repo|Method)\s*\|/i.test(line)) continue;
      const cells = splitMarkdownRow(line);
      if (!cells.length || cells.every((cell) => cell === "-")) continue;
      const row = {
        source: `${doc.path}:${i + 1}`,
        docPath: doc.path,
        lineNumber: i + 1,
        cells,
        line,
        score: 0
      };
      if (!contractRowMatchesRepoFilters(row, filters)) continue;
      allRows.push(row);
      const score = scoreContractRow(cells, query);
      if (score <= 0) continue;
      rows.push({ ...row, score });
    }
  }
  rows.sort((a, b) => b.score - a.score || a.source.localeCompare(b.source));
  const relatedRows = collectRelatedContractRows(context, docs, rows, allRows, query, 24, filters);
  const report = renderContractSearchReport({
    context,
    query,
    filters,
    docs,
    rows: rows.slice(0, limit),
    relatedRows,
    totalMatches: rows.length,
    limit,
    warnings: staleArtifactWarnings(context, ["docs/ai-context-api-contract-map.md"])
  });
  if (opts.output) writeFile(path.resolve(opts.output), report, opts);
  else process.stdout.write(report);
}

function normalizeContractFilters(opts) {
  const related = String(opts.related || "").trim().toLowerCase();
  return {
    frontendRepos: parseFilterList(opts.frontendRepo),
    backendRepos: parseFilterList(opts.backendRepo),
    relatedType: related && related !== "all" ? related : ""
  };
}

function parseFilterList(value) {
  return unique(String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean));
}

function contractRowMatchesRepoFilters(row, filters) {
  const fields = contractRowFields(row);
  if (filters.frontendRepos.length && !filters.frontendRepos.includes(fields.frontendRepo)) return false;
  if (filters.backendRepos.length && !filters.backendRepos.includes(fields.backendRepo)) return false;
  return true;
}

function contractRowFields(row) {
  const cells = row.cells || [];
  if (cells.length >= 8) {
    return {
      frontendRepo: cleanMarkdownCell(cells[0]),
      endpoint: cleanMarkdownCell(cells[1]),
      symbol: cleanMarkdownCell(cells[2]),
      frontendFile: cleanMarkdownCell(cells[3]),
      backendRepo: cleanMarkdownCell(cells[4]),
      handler: cleanMarkdownCell(cells[5]),
      frontendPayloadFields: cleanMarkdownCell(contractFrontendPayloadCell(cells)),
      requestFields: cleanMarkdownCell(contractRequestFieldsCell(cells)),
      fieldCheck: cleanMarkdownCell(contractFieldCheckCell(cells)),
      responseType: cleanMarkdownCell(contractResponseTypeCell(cells))
    };
  }
  return {
    frontendRepo: "",
    endpoint: cleanMarkdownCell(cells[1]),
    symbol: "",
    frontendFile: "",
    backendRepo: backendRepoFromContractDocPath(row.docPath),
    handler: cleanMarkdownCell(cells[2])
  };
}

function contractFrontendPayloadCell(cells) {
  return cells.length >= 9 ? cells[6] : "";
}

function contractRequestFieldsCell(cells) {
  if (cells.length >= 10) return cells[7];
  if (cells.length >= 9) return cells[7];
  if (cells.length >= 8) return cells[6];
  if (cells.length >= 5) return cells[3];
  return "";
}

function contractFieldCheckCell(cells) {
  return cells.length >= 10 ? cells[8] : "";
}

function contractResponseTypeCell(cells) {
  if (cells.length >= 10) return cells[9];
  if (cells.length >= 9) return cells[8];
  if (cells.length >= 8) return cells[7];
  if (cells.length >= 5) return cells[4];
  return "";
}

function backendRepoFromContractDocPath(docPath) {
  const parts = slash(docPath || "").split("/");
  return parts.length > 2 && parts[1] === "project-facts" ? parts[0] : "";
}

function collectContractDocs(context) {
  const docs = [];
  const workspaceContract = path.join(context.workspace, "docs", "ai-context-api-contract-map.md");
  if (fs.existsSync(workspaceContract)) {
    docs.push({
      path: slash(path.relative(context.workspace, workspaceContract)),
      content: safeReadContractDoc(workspaceContract)
    });
  } else {
    docs.push({
      path: "docs/ai-context-api-contract-map.md (generated preview)",
      content: renderWorkspaceApiContractMap(context)
    });
  }

  for (const repo of context.repos.filter((item) => item.tech.includes("java"))) {
    const repoContract = path.join(repo.path, "project-facts", "api-contract-map.md");
    if (fs.existsSync(repoContract)) {
      docs.push({
        path: slash(path.relative(context.workspace, repoContract)),
        content: safeRead(repoContract)
      });
    } else {
      docs.push({
        path: `${repo.rel}/project-facts/api-contract-map.md (generated preview)`,
        content: renderJavaApiContractMap(repo)
      });
    }
  }
  return docs;
}

function splitMarkdownRow(line) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function scoreContractRow(cells, query) {
  const text = cells.join(" ").toLowerCase();
  const endpointCells = cells.slice(0, 3).join(" ").toLowerCase();
  const terms = queryTerms(query);
  let score = 0;
  for (const term of terms) {
    if (!term) continue;
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const count = (text.match(new RegExp(escaped, "g")) || []).length;
    if (!count) continue;
    const endpointWeight = endpointCells.includes(term) ? 4 : 1;
    const shapeWeight = term.includes("/") || term.includes(".") || term.includes("_") ? 3 : 1;
    score += count * endpointWeight * shapeWeight;
  }
  return score;
}

function queryTerms(query) {
  const raw = String(query || "").toLowerCase();
  const parts = raw.split(/[^a-z0-9_\u4e00-\u9fa5./:-]+/).filter(Boolean);
  return unique([raw, ...parts].filter((item) => item.length >= 2));
}

function collectRelatedContractRows(context, docs, matchedRows, allRows, query, limit, filters = {}) {
  const workspaceRows = allRows
    .map((row) => ({ ...row, frontend: parseWorkspaceContractInfo(row) }))
    .filter((row) => row.frontend);
  if (!workspaceRows.length || !matchedRows.length) return [];

  const endpointCountByFile = new Map();
  for (const row of workspaceRows) {
    const key = `${row.frontend.frontendRepo}\0${row.frontend.frontendFile}`;
    endpointCountByFile.set(key, (endpointCountByFile.get(key) || 0) + 1);
  }

  const rowsByImport = new Map();
  for (const row of workspaceRows) {
    const key = contractImportKey(row.frontend.frontendRepo, row.frontend.frontendFile, row.frontend.symbol);
    if (!rowsByImport.has(key)) rowsByImport.set(key, []);
    rowsByImport.get(key).push(row);
  }

  const matchedSources = new Set(matchedRows.map((row) => row.source));
  const seeds = uniqueBy(
    matchedRows.map((row) => parseWorkspaceContractInfo(row)).filter(Boolean),
    (item) => contractImportKey(item.frontendRepo, item.frontendFile, item.symbol)
  );
  const related = new Map();

  for (const seed of seeds) {
    const repo = context.repos.find((item) => item.name === seed.frontendRepo || item.rel === seed.frontendRepo);
    if (!repo) continue;
    const fileKey = `${seed.frontendRepo}\0${seed.frontendFile}`;
    const seedFileEndpointCount = endpointCountByFile.get(fileKey) || 0;
    const callers = findFrontendCallers(repo, seed, query, seedFileEndpointCount)
      .sort((a, b) => b.score - a.score || a.file.localeCompare(b.file))
      .slice(0, 4);
    for (const caller of callers) {
      let callerRows = 0;
      for (const item of caller.imports) {
        if (callerRows >= 6) break;
        const key = contractImportKey(seed.frontendRepo, item.moduleRel, item.importedName);
        for (const row of rowsByImport.get(key) || []) {
          if (matchedSources.has(row.source)) continue;
          if (!contractRelatedTypeMatches(row, filters.relatedType)) continue;
          if (!related.has(row.source)) {
            related.set(row.source, {
              source: row.source,
              line: row.line,
              caller: `${repo.name}/${caller.file}`,
              symbol: item.importedName,
              score: caller.score
            });
            callerRows += 1;
          }
          if (callerRows >= 6) break;
        }
      }
    }
  }

  return [...related.values()]
    .sort((a, b) => b.score - a.score || a.caller.localeCompare(b.caller) || a.source.localeCompare(b.source))
    .slice(0, limit);
}

function contractRelatedTypeMatches(row, relatedType) {
  const type = String(relatedType || "").trim().toLowerCase();
  if (!type) return true;
  const actual = contractRelatedType(row);
  return actual === type;
}

function contractRelatedType(row) {
  const fields = contractRowFields(row);
  const cells = row.cells || [];
  const requestDto = cleanMarkdownCell(contractRequestFieldsCell(cells)).split(":")[0];
  const responseType = cleanMarkdownCell(contractResponseTypeCell(cells));
  const text = [
    fields.endpoint,
    fields.symbol,
    fields.handler,
    requestDto,
    responseType
  ].join(" ").toLowerCase();
  const checks = [
    ["payment", /(pay|payment|weappay|alipay|wechat|wxpay|payrouter|支付|付款)/],
    ["refund", /(refund|退款|退费)/],
    ["cancel", /(cancel|close|fail|失败|取消|payorderfail|payfail)/],
    ["settlement", /(settle|settlement|finalize|revert|return|giveback|leaseorder|结算|归还|租用)/],
    ["device", /(equipment|device|asset|status|state|设备|状态)/],
    ["booking", /(reserve|reservation|booking|appointment|预约|预订)/],
    ["inventory", /(stock|inventory|sku|commodity|库存|商品|票量)/],
    ["insurance", /(insurance|保险)/],
    ["order", /(order|saleorderno|parentorder|订单|下单)/]
  ];
  return (checks.find(([, pattern]) => pattern.test(text)) || ["other"])[0];
}

function parseWorkspaceContractInfo(row) {
  if (!row?.cells || row.cells.length < 8) return null;
  const frontendRepo = cleanMarkdownCell(row.cells[0]);
  const endpoint = cleanMarkdownCell(row.cells[1]);
  const symbol = cleanMarkdownCell(row.cells[2]);
  const frontendFileCell = cleanMarkdownCell(row.cells[3]);
  if (!frontendRepo || frontendRepo === "-" || !endpoint || endpoint === "-") return null;
  if (!symbol || symbol === "-" || !frontendFileCell || frontendFileCell === "-") return null;
  const frontendFile = frontendFileCell.replace(/:\d+$/, "");
  if (!frontendFile || frontendFile === "-") return null;
  return { frontendRepo, endpoint, symbol, frontendFile };
}

function cleanMarkdownCell(value) {
  return String(value || "")
    .trim()
    .replace(/^`/, "")
    .replace(/`$/, "")
    .replace(/\\`/g, "`")
    .trim();
}

function contractImportKey(repo, file, symbol) {
  return `${repo}\0${stripSourceExtension(slash(file || ""))}\0${String(symbol || "").toLowerCase()}`;
}

function stripSourceExtension(file) {
  return slash(file).replace(/\.(js|ts|jsx|tsx|vue)$/i, "");
}

function uniqueBy(items, keyFn) {
  const seen = new Set();
  const out = [];
  for (const item of items) {
    const key = keyFn(item);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

function findFrontendCallers(repo, seed, query, seedFileEndpointCount) {
  const callers = [];
  for (const file of frontendSourceFiles(repo)) {
    const content = safeRead(path.join(repo.path, file));
    if (!content) continue;
    const imports = parseFrontendApiImports(repo, file, content);
    const seedImports = imports.filter((item) => importsReferenceFile(item.moduleRel, seed.frontendFile));
    if (!seedImports.length) continue;
    const usedContent = stripImportStatements(content);
    const hasSeedSymbol = seedImports.some((item) =>
      (item.importedName === seed.symbol || item.localName === seed.symbol) && identifierUsed(usedContent, item.localName)
    );
    const largeSeedWrapper = seedFileEndpointCount > 20;
    if (hasSeedSymbol && largeSeedWrapper && !callerMatchesSpecificQuery(file, usedContent, query, seed)) continue;
    const sameSmallWrapper = !hasSeedSymbol && seedFileEndpointCount > 0 && seedFileEndpointCount <= 20;
    if (!hasSeedSymbol && !sameSmallWrapper) continue;

    const usedImports = imports.filter((item) => identifierUsed(usedContent, item.localName));
    if (!usedImports.length) continue;
    callers.push({
      file,
      imports: uniqueBy(usedImports, (item) => `${stripSourceExtension(item.moduleRel)}\0${item.importedName}`),
      score: frontendCallerScore(file, content, query, seed, hasSeedSymbol, sameSmallWrapper)
    });
  }
  return callers;
}

function frontendSourceFiles(repo) {
  return repo.files.filter((file) => {
    if (isFrontendApiCandidateFile(file) || file.startsWith("project-facts/") || file.startsWith("docs/")) return false;
    const ext = path.extname(file).toLowerCase();
    return FRONTEND_SOURCE_EXTENSIONS.has(ext);
  });
}

function isFrontendApiCandidateFile(file) {
  const ext = path.extname(file).toLowerCase();
  const rel = slash(file);
  return FRONTEND_SOURCE_EXTENSIONS.has(ext) && (FRONTEND_API_DIR_PATTERN.test(rel) || FRONTEND_ACTION_FILE_PATTERN.test(rel));
}

function isFrontendApiModuleRel(moduleRel) {
  const rel = slash(moduleRel || "");
  return FRONTEND_API_DIR_PATTERN.test(rel) || FRONTEND_ACTION_FILE_PATTERN.test(rel);
}

function parseFrontendApiImports(repo, file, content) {
  const imports = [];
  const addImportedModule = (specifier, names) => {
    const moduleRel = resolveFrontendImport(repo, file, specifier);
    if (!moduleRel || !isFrontendApiModuleRel(moduleRel)) return;
    for (const item of names) imports.push({ ...item, moduleRel });
  };

  const addObjectImportMembers = (specifier, localName) => {
    const moduleRel = resolveFrontendImport(repo, file, specifier);
    if (!moduleRel || !isFrontendApiModuleRel(moduleRel)) return;
    for (const member of objectMemberNames(content, localName)) {
      imports.push({ importedName: member, localName: member, moduleRel });
    }
  };

  const mixedRe = /import\s+(?:type\s+)?[A-Za-z_$][A-Za-z0-9_$]*\s*,\s*\{([\s\S]*?)\}\s+from\s+[`'"]([^`'"]+)[`'"]/g;
  let match;
  while ((match = mixedRe.exec(content))) addImportedModule(match[2], parseImportNames(match[1]));

  const re = /import\s+(?:type\s+)?\{([\s\S]*?)\}\s+from\s+[`'"]([^`'"]+)[`'"]/g;
  while ((match = re.exec(content))) addImportedModule(match[2], parseImportNames(match[1]));

  const namespaceRe = /import\s+\*\s+as\s+([A-Za-z_$][A-Za-z0-9_$]*)\s+from\s+[`'"]([^`'"]+)[`'"]/g;
  while ((match = namespaceRe.exec(content))) addObjectImportMembers(match[2], match[1]);

  const defaultRe = /import\s+(?:type\s+)?([A-Za-z_$][A-Za-z0-9_$]*)\s+from\s+[`'"]([^`'"]+)[`'"]/g;
  while ((match = defaultRe.exec(content))) addObjectImportMembers(match[2], match[1]);

  const requireRe = /(?:const|let|var)\s+\{([\s\S]*?)\}\s*=\s*require\([`'"]([^`'"]+)[`'"]\)/g;
  while ((match = requireRe.exec(content))) addImportedModule(match[2], parseImportNames(match[1]));

  const objectRequireRe = /(?:const|let|var)\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*require\([`'"]([^`'"]+)[`'"]\)/g;
  while ((match = objectRequireRe.exec(content))) addObjectImportMembers(match[2], match[1]);

  const dynamicImportRe = /(?:const|let|var)\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*(?:await\s+)?import\([`'"]([^`'"]+)[`'"]\)/g;
  while ((match = dynamicImportRe.exec(content))) addObjectImportMembers(match[2], match[1]);

  return uniqueBy(imports, (item) => `${item.moduleRel}\0${item.importedName}\0${item.localName}`);
}

function objectMemberNames(content, localName) {
  if (!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(String(localName || ""))) return [];
  const re = new RegExp(`\\b${escapeRegExp(localName)}\\s*\\.\\s*([A-Za-z_$][A-Za-z0-9_$]*)`, "g");
  const names = [];
  let match;
  while ((match = re.exec(content))) names.push(match[1]);
  return unique(names);
}

function parseImportNames(raw) {
  return String(raw || "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const cleaned = part.replace(/\s+/g, " ");
      const alias = cleaned.match(/^([A-Za-z0-9_$]+)\s+as\s+([A-Za-z0-9_$]+)$/);
      if (alias) return { importedName: alias[1], localName: alias[2] };
      return { importedName: cleaned, localName: cleaned };
    })
    .filter((item) => /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(item.importedName));
}

function resolveFrontendImport(repo, file, specifier) {
  let rel = "";
  const spec = String(specifier || "").split("?")[0].split("#")[0];
  if (spec.startsWith("@/")) rel = spec.slice(2);
  else if (spec.startsWith("./") || spec.startsWith("../")) rel = slash(path.normalize(path.join(path.dirname(file), spec)));
  else if (spec.startsWith("/")) rel = spec.replace(/^\/+/, "");
  else if (spec.startsWith("api/")) rel = spec;
  if (!rel) return "";
  rel = slash(rel);
  const candidates = [rel, `${rel}.js`, `${rel}.ts`, `${rel}.jsx`, `${rel}.tsx`, path.posix.join(rel, "index.js"), path.posix.join(rel, "index.ts")];
  return candidates.find((candidate) => repo.files.includes(candidate)) || rel;
}

function importsReferenceFile(importRel, targetFile) {
  return stripSourceExtension(importRel) === stripSourceExtension(targetFile);
}

function stripImportStatements(content) {
  return String(content || "")
    .replace(/import\s+(?:type\s+)?[\s\S]*?\s+from\s+[`'"][^`'"]+[`'"];?/g, "")
    .replace(/(?:const|let|var)\s+\{[\s\S]*?\}\s*=\s*require\([`'"][^`'"]+[`'"]\);?/g, "")
    .replace(/(?:const|let|var)\s+[A-Za-z_$][A-Za-z0-9_$]*\s*=\s*require\([`'"][^`'"]+[`'"]\);?/g, "")
    .replace(/(?:const|let|var)\s+[A-Za-z_$][A-Za-z0-9_$]*\s*=\s*(?:await\s+)?import\([`'"][^`'"]+[`'"]\);?/g, "");
}

function identifierUsed(content, name) {
  if (!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(String(name || ""))) return false;
  return new RegExp(`\\b${escapeRegExp(name)}\\b`).test(content);
}

function frontendCallerScore(file, content, query, seed, hasSeedSymbol, sameSmallWrapper) {
  const haystack = `${file}\n${content}`.toLowerCase();
  let score = hasSeedSymbol ? 20 : sameSmallWrapper ? 18 : 5;
  for (const term of queryTerms(query)) {
    if (haystack.includes(term)) score += term.includes("/") ? 6 : 2;
  }
  if (haystack.includes(String(seed.symbol || "").toLowerCase())) score += 8;
  if (sameSmallWrapper && haystack.includes(stripSourceExtension(seed.frontendFile).toLowerCase())) score += 4;
  return score;
}

function callerMatchesSpecificQuery(file, content, query, seed) {
  const haystack = `${file}\n${content}`.toLowerCase();
  const terms = queryTerms(query).filter((term) => {
    if (term === String(seed.symbol || "").toLowerCase()) return true;
    return !["api", "get", "list", "save", "update", "order", "orders", "pay", "payment", "payrouter", "支付", "结算", "接口"].includes(term);
  });
  if (!terms.length) return true;
  return terms.some((term) => haystack.includes(term));
}

function renderContractSearchReport({ context, query, filters, docs, rows, relatedRows, totalMatches, limit, warnings = [] }) {
  const docList = docs.map((doc) => `- \`${doc.path}\``).join("\n");
  const filterSummary = formatContractFilterSummary(filters);
  const table = rows.length
    ? rows.map((row) => `| \`${row.source}\` | ${escapeTableLong(row.line)} |`).join("\n")
    : "| - | - |";
  const relatedTable = relatedRows.length
    ? relatedRows.map((row) => `| \`${row.caller}\` | \`${row.symbol}\` | \`${row.source}\` | ${escapeTableLong(row.line)} |`).join("\n")
    : "| - | - | - | - |";
  const warningBlock = formatArtifactWarnings(warnings, "markdown");
  return `# API 契约精确筛选

生成时间：${new Date().toISOString()}

工作区：\`.\`

查询：\`${escapeTable(query)}\`

筛选：${filterSummary}

匹配：${totalMatches}，显示：${Math.min(rows.length, limit)}

${warningBlock}

## 数据来源

${docList || "- -"}

## 匹配行

| Source | Contract row |
|---|---|
${table}

## 同页面相关接口

> 由命中 API wrapper 的前端 import 推断，用于提示同一页面里的下单、支付发起、设备占用/释放、取消或失败处理接口；仍需读取源码确认实际调用。

| Page/caller | Symbol | Source | Contract row |
|---|---|---|---|
${relatedTable}

## 建议读取顺序

1. 只读取匹配行和同页面相关接口对应的前端 API wrapper、页面入口或调用点。
2. 只读取这些行对应的后端 Controller、请求 DTO、响应 DTO、Service/ServiceImpl、DTO copy/mapper 和必要 Mapper。
3. 对下单、支付、预约、库存、租用、结算、退款、保险等跨端流程，检查顶层 payload、嵌套对象/列表字段、响应字段、状态流转、并发/库存/设备状态、支付通道、取消/失败路径。
4. 前端还要检查缺失 export/import、空数据渲染、运行时分支、硬编码环境或支付配置。
5. 未执行构建、接口联调或真实支付时，在报告中写明。
`;
}

function formatContractFilterSummary(filters = {}) {
  const parts = [];
  if (filters.frontendRepos?.length) parts.push(`frontend=${filters.frontendRepos.map((repo) => `\`${escapeTable(repo)}\``).join(", ")}`);
  if (filters.backendRepos?.length) parts.push(`backend=${filters.backendRepos.map((repo) => `\`${escapeTable(repo)}\``).join(", ")}`);
  if (filters.relatedType) parts.push(`related=\`${escapeTable(filters.relatedType)}\``);
  return parts.length ? parts.join("；") : "无";
}

function renderWorkspaceContractRow(row) {
  if (!row.route) {
    return `| \`${row.frontendRepo}\` | \`${row.endpoint.endpoint}\` | \`${row.endpoint.name}\` | \`${row.endpoint.file}:${row.endpoint.line}\` | - | - | ${formatFrontendPayloadFields(row.frontendPayloadFields)} | - | - | - |`;
  }
  return `| \`${row.frontendRepo}\` | \`${row.endpoint.endpoint}\` | \`${row.endpoint.name}\` | \`${row.endpoint.file}:${row.endpoint.line}\` | \`${row.backendRepo}\` | \`${row.route.http} ${row.route.path} ${row.route.controller}.${row.route.method}\` | ${formatFrontendPayloadFields(row.frontendPayloadFields)} | ${formatDtoList(row.route.requestTypes, row.dtoMap)} | ${formatFieldContractCheck(row.frontendPayloadFields, row.route.requestTypes, row.dtoMap)} | ${formatInline(row.route.responseType || "-")} |`;
}

function collectFrontendPayloadFieldMap(repo) {
  const out = new Map();
  const add = (moduleRel, symbol, file, line, fields) => {
    const names = unique((fields || []).filter(Boolean));
    if (!moduleRel || !symbol || !names.length) return;
    const key = frontendPayloadFieldKey(moduleRel, symbol);
    if (!out.has(key)) out.set(key, []);
    out.get(key).push({ file, line, fields: names });
  };

  for (const file of frontendSourceFiles(repo)) {
    const content = safeRead(path.join(repo.path, file));
    if (!content) continue;
    const imports = parseFrontendApiImports(repo, file, content);
    if (!imports.length) continue;
    const usedContent = stripImportStatements(content);
    for (const item of imports) {
      if (!identifierUsed(usedContent, item.localName)) continue;
      for (const usage of collectFrontendPayloadUsages(usedContent, item.localName)) {
        add(item.moduleRel, item.importedName, file, usage.line, usage.fields);
      }
    }
  }

  for (const [key, items] of out.entries()) {
    out.set(key, uniqueBy(items, (item) => `${item.file}\0${item.line}\0${item.fields.join(",")}`).slice(0, 6));
  }
  return out;
}

function frontendPayloadFieldsForEndpoint(payloadFieldMap, endpoint) {
  return payloadFieldMap.get(frontendPayloadFieldKey(endpoint.file, endpoint.name)) || [];
}

function frontendPayloadFieldKey(moduleRel, symbol) {
  return `${stripSourceExtension(slash(moduleRel || ""))}\0${String(symbol || "").toLowerCase()}`;
}

function collectFrontendPayloadUsages(content, symbol) {
  const usages = [];
  for (const call of findFrontendCallExpressionsContainingSymbol(content, symbol)) {
    const fields = extractFrontendPayloadFieldsFromCallArgs(call.argsText, symbol, content, call.index);
    if (fields.length) usages.push({ line: lineOf(content, call.index), fields });
  }
  return usages;
}

function findFrontendCallExpressionsContainingSymbol(content, symbol) {
  if (!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(String(symbol || ""))) return [];
  const text = String(content || "");
  const re = new RegExp(`\\b${escapeRegExp(symbol)}\\b`, "g");
  const out = [];
  const seen = new Set();
  let match;
  while ((match = re.exec(text))) {
    const open = text.lastIndexOf("(", match.index);
    if (open < 0 || seen.has(open)) continue;
    const close = findMatchingDelimiter(text, open, "(", ")");
    if (close <= match.index) continue;
    const argsText = text.slice(open + 1, close);
    if (!identifierUsed(argsText, symbol)) continue;
    seen.add(open);
    out.push({ index: open, argsText });
  }
  return out;
}

function extractFrontendPayloadFieldsFromCallArgs(argsText, symbol, content, callIndex) {
  const args = splitTopLevelExpressions(argsText);
  const fields = [];
  for (let i = 0; i < args.length; i += 1) {
    if (!identifierUsed(args[i], symbol)) continue;
    fields.push(...extractFrontendPayloadFieldsFromRequestObject(args[i], content, callIndex));
    for (const candidate of args.slice(i + 1, i + 3)) {
      fields.push(...frontendFieldsFromExpression(candidate, content, callIndex));
    }
  }
  return unique(fields).slice(0, 24);
}

function extractFrontendPayloadFieldsFromRequestObject(expr, content, beforeIndex) {
  const objectExpr = extractLeadingObjectLiteral(expr);
  if (!objectExpr) return [];
  const props = frontendObjectProperties(objectExpr);
  const endpointProps = new Set(["url", "path", "endpoint", "uri"]);
  if (!props.some((prop) => endpointProps.has(prop.name))) return [];
  const payloadProps = props.filter((prop) => ["data", "body", "params", "payload", "json"].includes(prop.name));
  return unique(payloadProps.flatMap((prop) => frontendFieldsFromExpression(prop.value, content, beforeIndex)));
}

function frontendFieldsFromExpression(expr, content, beforeIndex, depth = 0) {
  if (depth > 4) return [];
  let text = trimFrontendPayloadExpression(expr);
  if (!text) return [];
  const jsonArg = firstFunctionArgument(text, "JSON.stringify");
  if (jsonArg) return frontendFieldsFromExpression(jsonArg, content, beforeIndex, depth + 1);
  const objectExpr = extractLeadingObjectLiteral(text);
  if (objectExpr) return frontendFieldsFromObjectExpression(objectExpr, content, beforeIndex, depth + 1);
  if (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(text)) {
    const objectValue = resolveFrontendVariableObjectExpression(content, text, beforeIndex);
    if (objectValue) return frontendFieldsFromObjectExpression(objectValue, content, beforeIndex, depth + 1);
  }
  return [];
}

function frontendFieldsFromObjectExpression(objectExpr, content, beforeIndex, depth) {
  const props = frontendObjectProperties(objectExpr);
  if (!props.length) return [];
  const payloadProps = props.filter((prop) => ["data", "body", "params", "payload", "json"].includes(prop.name));
  if (payloadProps.length) {
    const nested = unique(payloadProps.flatMap((prop) => frontendFieldsFromExpression(prop.value, content, beforeIndex, depth + 1)));
    if (nested.length) return nested;
  }
  const ignored = new Set(["url", "path", "endpoint", "uri", "method", "headers", "header", "timeout", "baseURL", "baseUrl"]);
  return unique(props.map((prop) => prop.name).filter((name) => name && !ignored.has(name)));
}

function resolveFrontendVariableObjectExpression(content, name, beforeIndex) {
  const re = new RegExp(`(?:const|let|var)\\s+${escapeRegExp(name)}\\s*=\\s*`, "g");
  let found = "";
  let match;
  while ((match = re.exec(content))) {
    if (match.index >= beforeIndex) break;
    const start = skipWhitespace(content, re.lastIndex);
    if (content[start] !== "{") continue;
    const end = findMatchingDelimiter(content, start, "{", "}");
    if (end > start && end < beforeIndex) found = content.slice(start, end + 1);
  }
  return found;
}

function frontendObjectProperties(objectExpr) {
  const text = extractLeadingObjectLiteral(objectExpr);
  if (!text) return [];
  const body = stripJsComments(text.slice(1, -1));
  return splitTopLevelExpressions(body).map((part) => parseFrontendObjectProperty(part)).filter(Boolean);
}

function parseFrontendObjectProperty(part) {
  const text = String(part || "").trim();
  if (!text || text.startsWith("...") || text.startsWith("[") || text.startsWith("#")) return null;
  const colon = topLevelColonIndex(text);
  if (colon >= 0) {
    const rawName = text.slice(0, colon).trim();
    const name = cleanFrontendObjectKey(rawName);
    return name ? { name, value: text.slice(colon + 1).trim() } : null;
  }
  const shorthand = text.match(/^([A-Za-z_$][A-Za-z0-9_$]*)$/);
  if (shorthand) return { name: shorthand[1], value: shorthand[1] };
  const method = text.match(/^([A-Za-z_$][A-Za-z0-9_$]*)\s*\(/);
  if (method) return { name: method[1], value: "" };
  return null;
}

function cleanFrontendObjectKey(rawName) {
  const value = String(rawName || "").trim();
  const quoted = value.match(/^["'`]([^"'`]+)["'`]$/);
  if (quoted) return quoted[1];
  const bare = value.match(/^([A-Za-z_$][A-Za-z0-9_$]*)$/);
  return bare ? bare[1] : "";
}

function extractLeadingObjectLiteral(expr) {
  const text = trimFrontendPayloadExpression(expr);
  const start = text.indexOf("{");
  if (start < 0) return "";
  const end = findMatchingDelimiter(text, start, "{", "}");
  return end >= start ? text.slice(start, end + 1) : "";
}

function trimFrontendPayloadExpression(expr) {
  return String(expr || "")
    .trim()
    .replace(/\s+as\s+[A-Za-z_$][A-Za-z0-9_$]*(?:\[\])?$/g, "")
    .replace(/\s*,\s*$/g, "")
    .trim();
}

function firstFunctionArgument(expr, functionName) {
  const text = String(expr || "");
  const idx = text.indexOf(`${functionName}(`);
  if (idx < 0) return "";
  const open = idx + functionName.length;
  const close = findMatchingDelimiter(text, open, "(", ")");
  if (close <= open) return "";
  return splitTopLevelExpressions(text.slice(open + 1, close))[0] || "";
}

function splitTopLevelExpressions(value) {
  const parts = [];
  let start = 0;
  let depth = 0;
  let quote = "";
  const text = String(value || "");
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const prev = text[i - 1];
    if (quote) {
      if (ch === quote && prev !== "\\") quote = "";
      continue;
    }
    if (ch === "'" || ch === '"' || ch === "`") {
      quote = ch;
      continue;
    }
    if (ch === "(" || ch === "[" || ch === "{") depth += 1;
    else if (ch === ")" || ch === "]" || ch === "}") depth = Math.max(0, depth - 1);
    else if (ch === "," && depth === 0) {
      parts.push(text.slice(start, i).trim());
      start = i + 1;
    }
  }
  parts.push(text.slice(start).trim());
  return parts.filter(Boolean);
}

function topLevelColonIndex(value) {
  let depth = 0;
  let quote = "";
  const text = String(value || "");
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const prev = text[i - 1];
    if (quote) {
      if (ch === quote && prev !== "\\") quote = "";
      continue;
    }
    if (ch === "'" || ch === '"' || ch === "`") {
      quote = ch;
      continue;
    }
    if (ch === "(" || ch === "[" || ch === "{") depth += 1;
    else if (ch === ")" || ch === "]" || ch === "}") depth = Math.max(0, depth - 1);
    else if (ch === ":" && depth === 0) return i;
  }
  return -1;
}

function findMatchingDelimiter(text, openIndex, openChar, closeChar) {
  let depth = 0;
  let quote = "";
  const value = String(text || "");
  for (let i = openIndex; i < value.length; i += 1) {
    const ch = value[i];
    const prev = value[i - 1];
    if (quote) {
      if (ch === quote && prev !== "\\") quote = "";
      continue;
    }
    if (ch === "'" || ch === '"' || ch === "`") {
      quote = ch;
      continue;
    }
    if (ch === openChar) depth += 1;
    else if (ch === closeChar) {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function skipWhitespace(text, index) {
  let i = index;
  while (i < text.length && /\s/.test(text[i])) i += 1;
  return i;
}

function stripJsComments(value) {
  return String(value || "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
}

function formatFrontendPayloadFields(items) {
  const rows = uniqueBy(items || [], (item) => `${item.file}\0${item.line}\0${item.fields.join(",")}`).slice(0, 4);
  if (!rows.length) return "-";
  return rows.map((item) => {
    const fields = item.fields.slice(0, 12).map((field) => `\`${escapeTable(field)}\``).join(", ");
    const rest = item.fields.length > 12 ? ` (+${item.fields.length - 12})` : "";
    const location = item.line ? `${item.file}:${item.line}` : item.file;
    return `\`${escapeTable(location)}\`: ${fields}${rest}`;
  }).join("<br>");
}

function formatFieldContractCheck(payloadItems, requestTypes, dtoMap) {
  const payloadNames = unique((payloadItems || []).flatMap((item) => item.fields || []).filter(Boolean));
  const dtoFields = requestDtoFields(requestTypes, dtoMap);
  if (!payloadNames.length || !dtoFields.length) return "-";

  const payloadLower = new Set(payloadNames.map((name) => name.toLowerCase()));
  const dtoLower = new Set(dtoFields.map((field) => field.name.toLowerCase()));
  const requiredMissing = dtoFields
    .filter((field) => field.required && !payloadLower.has(field.name.toLowerCase()))
    .map((field) => field.name);
  const payloadOnly = payloadNames.filter((name) => !dtoLower.has(name.toLowerCase()));
  const parts = [];
  if (requiredMissing.length) parts.push(`required-missing: ${requiredMissing.slice(0, 8).map((name) => `\`${escapeTable(name)}\``).join(", ")}`);
  if (payloadOnly.length) parts.push(`payload-only: ${payloadOnly.slice(0, 8).map((name) => `\`${escapeTable(name)}\``).join(", ")}`);
  return parts.length ? parts.join("<br>") : "-";
}

function requestDtoFields(types, dtoMap) {
  const names = unique((types || []).map((type) => simpleTypeName(type)).filter(Boolean));
  return names.flatMap((name) => dtoMap?.get(name)?.fields || []);
}

function collectDtoClasses(repo) {
  const out = new Map();
  for (const rel of repo.files.filter((file) => file.endsWith(".java") && file.startsWith("src/main/java/"))) {
    const content = safeRead(path.join(repo.path, rel));
    const className = (content.match(/\bclass\s+([A-Za-z0-9_]+)/) || [])[1];
    if (!className) continue;
    const fields = collectDtoFields(content);
    out.set(className, { file: rel, fields });
  }
  return out;
}

function collectDtoFields(content) {
  const fields = [];
  let annotations = [];
  for (const line of String(content || "").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith("@")) {
      annotations.push(trimmed);
      continue;
    }
    const match = line.match(/^\s*(?:private|protected|public)\s+(?!static\s+final\b)(?:final\s+)?([A-Za-z0-9_<>\[\], ?]+)\s+([A-Za-z0-9_]+)\s*(?:=|;)/);
    if (match) {
      if (match[2] !== "serialVersionUID") {
        const annotationText = annotations.join("\n");
        fields.push({
          type: cleanType(match[1]),
          name: match[2],
          required: /@(NotNull|NotBlank|NotEmpty)\b/.test(annotationText)
        });
      }
      annotations = [];
      continue;
    }
    if (!trimmed.startsWith("//") && !trimmed.startsWith("*") && !trimmed.startsWith("/*")) annotations = [];
  }
  return fields;
}

function formatDtoList(types, dtoMap) {
  const names = unique((types || []).map((type) => simpleTypeName(type)).filter(Boolean));
  if (!names.length) return "-";
  return names.map((name) => formatDtoFields(name, dtoMap)).join("<br>");
}

function formatDtoFields(name, dtoMap) {
  const dto = dtoMap?.get(name);
  if (!dto) return `\`${name}\` (not found)`;
  if (!dto.fields.length) return `\`${name}\`: -`;
  const visible = dto.fields.slice(0, 12).map((field) => `\`${field.name}${field.required ? "*" : ""}\``).join(", ");
  const rest = dto.fields.length > 12 ? ` (+${dto.fields.length - 12})` : "";
  return `\`${name}\`: ${visible}${rest}`;
}

function formatInline(value) {
  return value && value !== "-" ? `\`${escapeTable(value)}\`` : "-";
}

function normalizeEndpointPath(endpoint) {
  let value = String(endpoint || "").trim();
  if (!value) return "";
  try {
    if (/^https?:\/\//i.test(value)) value = new URL(value).pathname;
  } catch {}
  value = value.split("?")[0].replace(/\$\{[^}]+\}/g, "");
  if (!value.startsWith("/")) value = `/${value}`;
  return value.replace(/\/+/g, "/").replace(/\/$/, "") || "/";
}

function renderAppletRouteApiMap(repo) {
  const pages = readPages(repo);
  const rows = [];
  for (const page of pages) {
    const vueRel = page.endsWith(".vue") ? page : `${page}.vue`;
    const content = safeRead(path.join(repo.path, vueRel));
    const imports = extractApiImports(repo, vueRel, content);
    rows.push({
      page,
      file: fs.existsSync(path.join(repo.path, vueRel)) ? vueRel : "(not found)",
      imports: imports.length ? imports.join(", ") : "-"
    });
  }
  const table = rows.length
    ? rows.map((r) => `| \`${r.page}\` | \`${r.file}\` | ${r.imports} |`).join("\n")
    : "| - | - | - |";
  const title = repo.tech.includes("uni-app") ? "小程序页面与 API 文件映射" : "前端页面与 API 文件映射";
  return `# ${title}

生成时间：${new Date().toISOString()}

> 由 pages.json 和页面 import 静态生成。普通 Vue 控制台没有 pages.json 时可能为空；运行时动态引用需要人工复查。

| Page | File | API imports |
|---|---|---|
${table}
`;
}

function readPages(repo) {
  const pagesFile = path.join(repo.path, "pages.json");
  if (!fs.existsSync(pagesFile)) return [];
  const raw = safeRead(pagesFile);
  const parsed = parseJsonLike(raw);
  if (!parsed) return [];
  const pages = [];
  for (const item of parsed.pages || []) {
    if (item?.path) pages.push(item.path);
  }
  for (const pkg of parsed.subPackages || parsed.subpackages || []) {
    const root = pkg.root || "";
    for (const item of pkg.pages || []) {
      if (item?.path) pages.push(slash(path.join(root, item.path)));
    }
  }
  return [...new Set(pages)].sort();
}

function extractApiImports(repo, file, content) {
  return unique(parseFrontendApiImports(repo, file, content)
    .map((item) => item.moduleRel)
    .filter(Boolean))
    .sort();
}

function runCodexMemCommand(subcommand, context, opts) {
  if (subcommand === "init") {
    initCodexMem(context, opts);
    writeCodexMemIndex(context, opts);
    return;
  }
  if (subcommand === "index") {
    initCodexMem(context, opts);
    writeCodexMemIndex(context, opts);
    return;
  }
  if (subcommand === "search") {
    printCodexMemSearch(context, opts);
    return;
  }
  if (subcommand === "route") {
    printCodexMemRoute(context, opts);
    return;
  }
  if (subcommand === "timeline") {
    printCodexMemTimeline(context, opts);
    return;
  }
  if (subcommand === "get") {
    printCodexMemRef(context, opts);
    return;
  }
  if (subcommand === "record") {
    printCodexMemRecord(context, opts);
    return;
  }
  if (subcommand === "mcp") {
    runCodexMemMcpServer(context, opts);
    return;
  }
  if (subcommand === "config") {
    printCodexMemMcpConfig(context, opts);
    return;
  }
  if (subcommand === "install-hooks") {
    initCodexMem(context, opts);
    writeCodexMemIndex(context, opts);
    installCodexMemHooks(context, opts);
    return;
  }
  if (subcommand === "install-user-hooks") {
    initCodexMem(context, opts);
    writeCodexMemIndex(context, opts);
    installCodexMemHooks(context, opts);
    installUserCodexMemHooks(context, opts);
    return;
  }
  if (subcommand === "dashboard") {
    writeCodexMemDashboard(context, opts);
    return;
  }
  if (subcommand === "sessions") {
    writeCodexSessionUsageReport(context, opts);
    return;
  }
  if (subcommand === "exec-events") {
    writeCodexExecEventsReport(context, opts);
    return;
  }
  fail(`Unknown codex-mem command: ${subcommand}`);
}

function initCodexMem(context, opts) {
  const dir = path.join(context.workspace, CODEX_MEM_DIR);
  ensureDir(dir, opts);
  ensureDir(path.join(dir, "refs"), opts);
  writeGeneratedFile(path.join(dir, ".gitignore"), "*\n!.gitignore\n", opts);
  writeGeneratedFile(path.join(dir, "README.md"), renderCodexMemReadme(), opts);
}

function renderCodexMemReadme() {
  return `# codex-mem local data

This directory is generated by ai-context-kit.

- \`index.jsonl\` is a lightweight local index generated from AGENTS.md, project-facts and ai-context docs.
- \`ledger.jsonl\` records Codex hook token estimates.
- \`refs/\` may contain local-only tool output references when compression mode is enabled.

Do not commit local refs or usage ledgers unless your team has reviewed them.
`;
}

function writeCodexMemIndex(context, opts) {
  const entries = buildCodexMemEntries(context);
  const dir = path.join(context.workspace, CODEX_MEM_DIR);
  const outPath = path.join(dir, "index.jsonl");
  const workspacePath = path.join(dir, "workspace.json");
  writeGeneratedFile(outPath, entries.map((entry) => JSON.stringify(entry)).join("\n") + "\n", opts);
  writeGeneratedFile(workspacePath, JSON.stringify({
    generatedBy: CODEX_MEM_GENERATOR,
    generatedAt: new Date().toISOString(),
    workspaceKind: fs.existsSync(path.join(context.workspace, ".git")) ? "single-repo" : "multi-repo",
    repos: context.repos.map((repo) => ({
      name: repo.name,
      rel: repo.rel,
      role: repoRole(repo),
      tech: repo.tech,
      branch: repo.branch,
      files: repo.stats.files
    }))
  }, null, 2) + "\n", opts);
}

function buildCodexMemEntries(context) {
  const entries = [];
  const workspaceKind = fs.existsSync(path.join(context.workspace, ".git")) ? "single-repo" : "multi-repo";
  entries.push({
    id: "workspace",
    type: "workspace",
    repo: "",
    path: ".",
    title: `${workspaceKind} workspace`,
    summary: `Repos: ${context.repos.map((repo) => repo.name).join(", ") || "none"}`,
    tokenEstimate: 80,
    generatedAt: new Date().toISOString()
  });

  for (const rel of ["AGENTS.md", "docs/ai-context-workspace-map.md", "docs/ai-context-scope-report.md"]) {
    addCodexMemFileEntry(entries, context.workspace, rel, "", "workspace-doc");
  }
  addCodexMemContractEntries(entries, context);

  for (const repo of context.repos) {
    entries.push({
      id: `repo:${repo.name}`,
      type: "repo",
      repo: repo.name,
      path: repo.rel,
      title: `${repo.name} ${repoRole(repo)}`,
      summary: [
        `role: ${repoRole(repo)}`,
        `tech: ${repo.tech.join(", ") || "unknown"}`,
        `identity: ${repoIdentityHints(repo)}`,
        `files: ${repo.stats.files}`,
        `controllers: ${repo.stats.controllers}`,
        `vue: ${repo.stats.vue}`
      ].join("; "),
      tokenEstimate: 120,
      generatedAt: new Date().toISOString()
    });

    const factFiles = [
      "AGENTS.md",
      ...repo.files.filter((rel) => rel.startsWith("project-facts/") && rel.endsWith(".md")),
      ...repo.files.filter((rel) => rel.startsWith("docs/ai-context-") && rel.endsWith(".md"))
    ];
    for (const rel of unique(factFiles)) {
      addCodexMemFileEntry(entries, repo.path, rel, repo.name, "project-index", repo);
    }
  }

  return entries;
}

function addCodexMemFileEntry(entries, root, rel, repoName, type, repo) {
  const normalized = slash(rel);
  if (isSensitivePath(normalized)) return;
  const full = path.join(root, rel);
  const content = safeRead(full);
  if (!content) return;
  const stat = safeStat(full);
  const workspaceRel = repo ? workspaceRelForRepoFile(repo, rel) : normalized;
  entries.push({
    id: `file:${repoName || "workspace"}:${workspaceRel}`,
    type,
    repo: repoName,
    path: workspaceRel,
    title: firstMarkdownTitle(content) || path.basename(rel),
    summary: summarizeForIndex(content),
    tokenEstimate: estimateTokens(content),
    mtimeMs: stat?.mtimeMs || 0,
    size: stat?.size || 0,
    generatedAt: new Date().toISOString()
  });
}

function addCodexMemContractEntries(entries, context) {
  const contractPath = path.join(context.workspace, "docs", "ai-context-api-contract-map.md");
  const content = safeReadContractDoc(contractPath);
  if (!content) return;
  const lines = content.split(/\r?\n/);
  let count = 0;
  for (let i = 0; i < lines.length && count < 3000; i += 1) {
    const line = lines[i];
    if (!line.startsWith("|") || line.includes("---|---")) continue;
    if (/^\|\s*Frontend repo\s*\|/i.test(line)) continue;
    const cells = splitMarkdownRow(line);
    if (cells.length < 8 || cells.every((cell) => cell === "-")) continue;
    const cleaned = cells.map(cleanCodexMemContractCell);
    const [frontendRepo, endpoint, symbol, frontendFile, backendRepo, handler] = cleaned;
    const frontendPayloadFields = cleaned.length >= 9 ? cleaned[6] : "";
    const requestFields = cleaned.length >= 10 ? cleaned[7] : cleaned.length >= 9 ? cleaned[7] : cleaned[6];
    const fieldCheck = cleaned.length >= 10 ? cleaned[8] : "";
    const responseType = cleaned.length >= 10 ? cleaned[9] : cleaned.length >= 9 ? cleaned[8] : cleaned[7];
    const summary = [
      `frontend=${frontendRepo || "-"}`,
      `endpoint=${endpoint || "-"}`,
      `symbol=${symbol || "-"}`,
      `frontendFile=${frontendFile || "-"}`,
      `backend=${backendRepo || "-"}`,
      `handler=${handler || "-"}`,
      `payload=${frontendPayloadFields || "-"}`,
      `request=${requestFields || "-"}`,
      `fieldCheck=${fieldCheck || "-"}`,
      `response=${responseType || "-"}`
    ].join("; ");
    entries.push({
      id: `api-contract:${i + 1}:${symbol || endpoint || count}`,
      type: "api-contract",
      repo: frontendRepo || "workspace",
      path: `docs/ai-context-api-contract-map.md:${i + 1}`,
      title: `${symbol || "(no symbol)"} ${endpoint || ""}`.trim(),
      summary: summary.slice(0, 1200),
      contract: {
        frontendRepo,
        endpoint,
        symbol,
        frontendFile,
        backendRepo,
        handler,
        frontendPayloadFields,
        requestFields,
        fieldCheck,
        responseType
      },
      relatedRepos: unique([frontendRepo, backendRepo].filter(isCodexMemRepoName)),
      tokenEstimate: estimateTokens(summary),
      generatedAt: new Date().toISOString()
    });
    count += 1;
  }
}

function cleanCodexMemContractCell(value) {
  return String(value || "")
    .replace(/`/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isCodexMemRepoName(value) {
  const text = String(value || "").trim();
  return Boolean(text && text !== "-" && text !== "workspace");
}

function summarizeForIndex(content) {
  return String(content || "")
    .replace(MANAGED_MARKER, "")
    .replace(/```[\s\S]*?```/g, "[code block]")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 24)
    .join(" ")
    .replace(/\s+/g, " ")
    .slice(0, 1600);
}

function estimateTokens(value) {
  return Math.ceil(String(value || "").length / 4);
}

function safeStat(file) {
  try {
    return fs.statSync(file);
  } catch {
    return null;
  }
}

function readCodexMemIndex(context) {
  const indexPath = path.join(context.workspace, CODEX_MEM_DIR, "index.jsonl");
  const text = safeReadLarge(indexPath, 50 * 1024 * 1024);
  if (!text) {
    fail(`codex-mem index not found. Run ai-context-kit codex-mem index --workspace <path> first: ${indexPath}`);
  }
  return text.split(/\r?\n/).filter(Boolean).map((line) => {
    try {
      return JSON.parse(line);
    } catch {
      return null;
    }
  }).filter(Boolean);
}

function printCodexMemSearch(context, opts) {
  const query = String(opts.query || "").trim();
  if (!query) fail("codex-mem search requires --query <text>");
  const limit = Number.isFinite(opts.limit) && opts.limit > 0 ? opts.limit : 10;
  const warnings = staleArtifactWarnings(context, [`${CODEX_MEM_DIR}/index.jsonl`]);
  const warningText = formatArtifactWarnings(warnings, "plain");
  if (warningText) console.log(`${warningText}\n`);
  const entries = readCodexMemKnowledge(context);
  const results = scoreCodexMemEntries(entries, query).slice(0, limit);
  if (!results.length) {
    console.log("No codex-mem matches.");
    return;
  }
  for (const item of results) {
    console.log(`- [${item.score}] ${item.entry.type} ${item.entry.repo || "workspace"} ${item.entry.path}`);
    console.log(`  title: ${item.entry.title}`);
    console.log(`  tokens: ${item.entry.tokenEstimate || 0}`);
    console.log(`  summary: ${String(item.entry.summary || "").slice(0, 240)}`);
  }
}

function printCodexMemRoute(context, opts) {
  const query = String(opts.query || "").trim();
  if (!query) fail("codex-mem route requires --query <text>");
  const limit = Number.isFinite(opts.limit) && opts.limit > 0 ? opts.limit : 8;
  const route = buildCodexMemRoute(context, query, limit, { optionalIndex: false });
  console.log(formatCodexMemRoute(route));
}

function printCodexMemTimeline(context, opts) {
  const limit = Number.isFinite(opts.limit) && opts.limit > 0 ? opts.limit : 20;
  const items = buildCodexMemTimeline(context, limit);
  console.log(formatCodexMemTimeline(items));
}

function printCodexMemRef(context, opts) {
  const ref = String(opts.ref || opts.hash || opts.query || "").trim();
  if (!ref) fail("codex-mem get requires --ref <ref-path-or-hash>");
  const match = resolveCodexMemRef(context, ref);
  if (!match) fail(`codex-mem ref not found: ${ref}`);
  const text = readCodexMemRefFile(match.path);
  if (!text) fail(`codex-mem ref could not be read: ${slash(path.relative(context.workspace, match.path))}`);
  if (opts.output) {
    writeFile(path.resolve(opts.output), text, opts);
    return;
  }
  process.stdout.write(text.endsWith("\n") ? text : `${text}\n`);
}

function printCodexMemRecord(context, opts) {
  const result = writeCodexMemObservation(context, {
    title: opts.title,
    summary: opts.summary,
    repo: opts.repo,
    path: opts.path,
    tags: opts.tags
  });
  if (result.error) fail(result.error);
  console.log(`Recorded observation: ${result.entry.title}`);
  console.log(`path: ${slash(path.relative(context.workspace, result.observationsPath))}`);
}

function resolveCodexMemRef(context, ref) {
  const refsRoot = path.join(context.workspace, CODEX_MEM_DIR, "refs");
  const normalizedRef = String(ref || "").replace(/^file:\/\//, "");
  const direct = resolveRefPathCandidate(context.workspace, refsRoot, normalizedRef);
  if (direct) return { path: direct, source: "path" };

  const hash = normalizeSha256(normalizedRef);
  const ledgerPath = path.join(context.workspace, CODEX_MEM_DIR, "ledger.jsonl");
  const events = readJsonl(ledgerPath);
  for (const event of [...events].reverse()) {
    const eventRef = String(event.refPath || "");
    const eventHash = normalizeSha256(event.outputHash || "");
    if (!eventRef) continue;
    if (eventRef === normalizedRef || eventRef.endsWith(`/${normalizedRef}`) || path.basename(eventRef) === normalizedRef) {
      const found = resolveRefPathCandidate(context.workspace, refsRoot, eventRef);
      if (found) return { path: found, source: "ledger-path" };
    }
    if (hash && eventHash === hash) {
      const found = resolveRefPathCandidate(context.workspace, refsRoot, eventRef);
      if (found) return { path: found, source: "ledger-hash" };
    }
  }

  for (const file of listCodexMemRefs(refsRoot)) {
    const rel = slash(path.relative(context.workspace, file));
    if (rel === normalizedRef || rel.endsWith(`/${normalizedRef}`) || path.basename(file) === normalizedRef) {
      return { path: file, source: "refs-path" };
    }
    if (hash) {
      const head = readFilePrefix(file, 128 * 1024);
      if (head.includes(`sha256:${hash}`) || head.includes(`sha256:${hash.toLowerCase()}`)) {
        return { path: file, source: "refs-hash" };
      }
    }
  }
  return null;
}

function resolveRefPathCandidate(workspace, refsRoot, ref) {
  const candidates = [];
  if (path.isAbsolute(ref)) candidates.push(path.resolve(ref));
  candidates.push(path.resolve(workspace, ref));
  candidates.push(path.resolve(refsRoot, ref.replace(/^\.codex-mem\/refs\/?/, "")));
  for (const candidate of candidates) {
    if (!isPathInside(candidate, refsRoot)) continue;
    const stat = safeStat(candidate);
    if (stat && stat.isFile()) return candidate;
  }
  return "";
}

function listCodexMemRefs(root) {
  const out = [];
  function walk(dir, depth) {
    if (depth > 5) return;
    let entries = [];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full, depth + 1);
      else if (entry.isFile() && entry.name.endsWith(".md")) out.push(full);
    }
  }
  walk(root, 0);
  return out.sort();
}

function normalizeSha256(value) {
  const text = String(value || "").trim().toLowerCase().replace(/^sha256:/, "");
  return /^[a-f0-9]{64}$/.test(text) ? text : "";
}

function isPathInside(candidate, root) {
  const rel = path.relative(path.resolve(root), path.resolve(candidate));
  return rel === "" || (!rel.startsWith("..") && !path.isAbsolute(rel));
}

function readCodexMemKnowledge(context, options = {}) {
  const indexEntries = options.optionalIndex
    ? readOptionalCodexMemIndex(context)
    : readCodexMemIndex(context);
  return [...indexEntries, ...readCodexMemObservations(context)];
}

function readOptionalCodexMemIndex(context) {
  const indexPath = path.join(context.workspace, CODEX_MEM_DIR, "index.jsonl");
  const text = safeRead(indexPath);
  if (!text) return [];
  return text.split(/\r?\n/).filter(Boolean).map((line) => {
    try {
      return JSON.parse(line);
    } catch {
      return null;
    }
  }).filter(Boolean);
}

function readCodexMemObservations(context) {
  const observationsPath = path.join(context.workspace, CODEX_MEM_DIR, "observations.jsonl");
  return readJsonl(observationsPath).map((entry) => ({
    type: entry.type || "observation",
    repo: entry.repo || "workspace",
    path: entry.path || "observations",
    title: entry.title || "observation",
    summary: entry.summary || "",
    tokenEstimate: entry.tokenEstimate || estimateTokens([entry.title, entry.summary].join(" "))
  }));
}

function readCodexMemRefFile(file) {
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return "";
  }
}

function readFilePrefix(file, maxBytes) {
  let fd = null;
  try {
    fd = fs.openSync(file, "r");
    const buffer = Buffer.alloc(maxBytes);
    const bytes = fs.readSync(fd, buffer, 0, maxBytes, 0);
    return buffer.subarray(0, bytes).toString("utf8");
  } catch {
    return "";
  } finally {
    if (fd !== null) {
      try {
        fs.closeSync(fd);
      } catch {}
    }
  }
}

function printCodexMemMcpConfig(context, opts) {
  const serverName = sanitizeMcpServerName(opts.name || "codexMem");
  const command = path.resolve(process.argv[1] || "ai-context-kit");
  const content = renderCodexMemMcpConfig({ serverName, command, workspace: context.workspace });
  if (opts.output) {
    writeFile(path.resolve(opts.output), content, opts);
    return;
  }
  process.stdout.write(content);
}

function renderCodexMemMcpConfig({ serverName, command, workspace }) {
  const enabledTools = [
    "codex_mem_search",
    "codex_mem_get",
    "codex_mem_route",
    "codex_mem_timeline",
    "codex_mem_record"
  ];
  return [
    "# Add this block to ~/.codex/config.toml or to a trusted workspace .codex/config.toml.",
    "# CLI alternative:",
    `# codex mcp add ${serverName} -- ${command} codex-mem mcp --workspace ${workspace}`,
    "",
    `[mcp_servers.${serverName}]`,
    `command = ${tomlString(command)}`,
    `args = ${tomlArray(["codex-mem", "mcp", "--workspace", workspace])}`,
    `cwd = ${tomlString(workspace)}`,
    "startup_timeout_sec = 10",
    "tool_timeout_sec = 60",
    "enabled = true",
    `enabled_tools = ${tomlArray(enabledTools)}`,
    `default_tools_approval_mode = "prompt"`,
    "",
    `[mcp_servers.${serverName}.tools.codex_mem_search]`,
    `approval_mode = "approve"`,
    "",
    `[mcp_servers.${serverName}.tools.codex_mem_route]`,
    `approval_mode = "approve"`,
    "",
    `[mcp_servers.${serverName}.tools.codex_mem_timeline]`,
    `approval_mode = "approve"`,
    "",
    `[mcp_servers.${serverName}.tools.codex_mem_get]`,
    `approval_mode = "prompt"`,
    "",
    `[mcp_servers.${serverName}.tools.codex_mem_record]`,
    `approval_mode = "prompt"`,
    ""
  ].join("\n");
}

function sanitizeMcpServerName(name) {
  const value = String(name || "").trim();
  if (!/^[A-Za-z0-9_-]+$/.test(value)) fail("--name must contain only letters, digits, underscores, or hyphens");
  return value;
}

function tomlString(value) {
  return `"${String(value || "").replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function tomlArray(values) {
  return `[${values.map((value) => tomlString(value)).join(", ")}]`;
}

let mcpOutputFraming = "line";

function runCodexMemMcpServer(context) {
  let buffer = Buffer.alloc(0);
  process.stdin.on("data", (chunk) => {
    buffer = Buffer.concat([buffer, Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)]);
    buffer = drainMcpBuffer(context, buffer);
  });
  process.stdin.on("end", () => {
    const line = buffer.toString("utf8").trim();
    if (line) handleMcpPayload(context, line, "line");
  });
}

function drainMcpBuffer(context, buffer) {
  while (buffer.length) {
    buffer = trimLeadingMcpBlankLines(buffer);
    if (!buffer.length) return buffer;
    if (bufferStartsWithContentLength(buffer)) {
      const parsed = readContentLengthFrame(buffer);
      if (!parsed) return buffer;
      handleMcpPayload(context, parsed.body, "header");
      buffer = parsed.rest;
      continue;
    }
    const newlineIndex = buffer.indexOf(0x0a);
    if (newlineIndex < 0) return buffer;
    const line = buffer.subarray(0, newlineIndex).toString("utf8").trim();
    buffer = buffer.subarray(newlineIndex + 1);
    if (line) handleMcpPayload(context, line, "line");
  }
  return buffer;
}

function trimLeadingMcpBlankLines(buffer) {
  let start = 0;
  while (start < buffer.length && (buffer[start] === 0x0a || buffer[start] === 0x0d)) start += 1;
  return start ? buffer.subarray(start) : buffer;
}

function bufferStartsWithContentLength(buffer) {
  return /^Content-Length:/i.test(buffer.toString("utf8", 0, Math.min(buffer.length, 32)));
}

function readContentLengthFrame(buffer) {
  const rn = buffer.indexOf(Buffer.from("\r\n\r\n"));
  const nn = buffer.indexOf(Buffer.from("\n\n"));
  let headerEnd = -1;
  let sepLength = 0;
  if (rn >= 0 && (nn < 0 || rn < nn)) {
    headerEnd = rn;
    sepLength = 4;
  } else if (nn >= 0) {
    headerEnd = nn;
    sepLength = 2;
  }
  if (headerEnd < 0) return null;
  const header = buffer.subarray(0, headerEnd).toString("utf8");
  const match = header.match(/Content-Length:\s*(\d+)/i);
  if (!match) {
    buffer = buffer.subarray(headerEnd + sepLength);
    return { body: "{}", rest: buffer };
  }
  const length = Number(match[1]);
  const bodyStart = headerEnd + sepLength;
  const bodyEnd = bodyStart + length;
  if (!Number.isFinite(length) || length < 0 || buffer.length < bodyEnd) return null;
  return {
    body: buffer.subarray(bodyStart, bodyEnd).toString("utf8"),
    rest: buffer.subarray(bodyEnd)
  };
}

function handleMcpPayload(context, line, framing) {
  mcpOutputFraming = framing;
  let message = null;
  try {
    message = JSON.parse(line);
  } catch {
    writeMcpResponse(mcpError(null, -32700, "Parse error"));
    return;
  }
  if (Array.isArray(message)) {
    const responses = message.map((item) => handleMcpMessage(context, item)).filter(Boolean);
    if (responses.length) writeMcpResponse(responses);
    return;
  }
  const response = handleMcpMessage(context, message);
  if (response) writeMcpResponse(response);
}

function handleMcpMessage(context, message) {
  const hasId = Object.prototype.hasOwnProperty.call(message || {}, "id");
  const id = hasId ? message.id : null;
  try {
    if (!message || message.jsonrpc !== "2.0" || typeof message.method !== "string") {
      return hasId ? mcpError(id, -32600, "Invalid Request") : null;
    }
    if (message.method === "initialize") {
      return {
        jsonrpc: "2.0",
        id,
        result: buildMcpInitializeResult(message.params || {})
      };
    }
    if (message.method === "notifications/initialized") return null;
    if (message.method === "ping") {
      return hasId ? { jsonrpc: "2.0", id, result: {} } : null;
    }
    if (message.method === "tools/list") {
      return {
        jsonrpc: "2.0",
        id,
        result: { tools: buildCodexMemMcpTools() }
      };
    }
    if (message.method === "tools/call") {
      const params = message.params || {};
      const result = callCodexMemMcpTool(context, String(params.name || ""), params.arguments || {});
      return { jsonrpc: "2.0", id, result };
    }
    return hasId ? mcpError(id, -32601, `Method not found: ${message.method}`) : null;
  } catch (error) {
    return hasId ? mcpError(id, -32603, error.message || "Internal error") : null;
  }
}

function buildMcpInitializeResult(params) {
  const requested = String(params.protocolVersion || "");
  const supported = new Set(["2025-06-18", "2025-03-26", "2024-11-05"]);
  return {
    protocolVersion: supported.has(requested) ? requested : "2025-06-18",
    capabilities: {
      tools: { listChanged: false }
    },
    serverInfo: {
      name: "ai-context-kit-codex-mem",
      version: VERSION
    },
    instructions: "Use codex_mem_search to find local project context, codex_mem_route to choose a repository, and codex_mem_get to read stored refs."
  };
}

function buildCodexMemMcpTools() {
  return [
    {
      name: "codex_mem_search",
      title: "Search codex-mem",
      description: "Search the local codex-mem index and recorded observations.",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string" },
          limit: { type: "integer", minimum: 1, maximum: 20 }
        },
        required: ["query"],
        additionalProperties: false
      }
    },
    {
      name: "codex_mem_get",
      title: "Read codex-mem ref",
      description: "Read a stored .codex-mem ref by path or SHA-256 hash.",
      inputSchema: {
        type: "object",
        properties: {
          ref: { type: "string" },
          maxChars: { type: "integer", minimum: 1000, maximum: 200000 }
        },
        required: ["ref"],
        additionalProperties: false
      }
    },
    {
      name: "codex_mem_route",
      title: "Route codex-mem task",
      description: "Suggest likely repositories and context files for a prompt.",
      inputSchema: {
        type: "object",
        properties: {
          prompt: { type: "string" },
          limit: { type: "integer", minimum: 1, maximum: 12 }
        },
        required: ["prompt"],
        additionalProperties: false
      }
    },
    {
      name: "codex_mem_timeline",
      title: "Read codex-mem timeline",
      description: "List recent hook events and recorded observations.",
      inputSchema: {
        type: "object",
        properties: {
          limit: { type: "integer", minimum: 1, maximum: 50 }
        },
        additionalProperties: false
      }
    },
    {
      name: "codex_mem_record",
      title: "Record codex-mem observation",
      description: "Append a local observation for later codex-mem search.",
      inputSchema: {
        type: "object",
        properties: {
          title: { type: "string" },
          summary: { type: "string" },
          repo: { type: "string" },
          path: { type: "string" },
          tags: {
            type: "array",
            items: { type: "string" }
          }
        },
        required: ["title", "summary"],
        additionalProperties: false
      }
    }
  ];
}

function callCodexMemMcpTool(context, name, args) {
  if (name === "codex_mem_search") return mcpSearchCodexMem(context, args);
  if (name === "codex_mem_get") return mcpGetCodexMemRef(context, args);
  if (name === "codex_mem_route") return mcpRouteCodexMem(context, args);
  if (name === "codex_mem_timeline") return mcpTimelineCodexMem(context, args);
  if (name === "codex_mem_record") return mcpRecordCodexMem(context, args);
  return mcpToolError(`Unknown tool: ${name}`);
}

function mcpSearchCodexMem(context, args) {
  const query = String(args.query || "").trim();
  if (!query) return mcpToolError("codex_mem_search requires query");
  const limit = clampInt(args.limit, 10, 1, 20);
  const warnings = staleArtifactWarnings(context, [`${CODEX_MEM_DIR}/index.jsonl`]);
  const warningText = formatArtifactWarnings(warnings, "plain");
  const entries = readCodexMemKnowledge(context, { optionalIndex: true });
  const results = scoreCodexMemEntries(entries, query).slice(0, limit).map((item) => toMcpCodexMemMatch(item, 500));
  if (!results.length) return mcpToolResult([warningText, "No codex-mem matches."].filter(Boolean).join("\n\n"), { results: [], warnings });
  return mcpToolResult([warningText, formatMcpSearchResults(results)].filter(Boolean).join("\n\n"), { results, warnings });
}

function mcpGetCodexMemRef(context, args) {
  const ref = String(args.ref || "").trim();
  if (!ref) return mcpToolError("codex_mem_get requires ref");
  const match = resolveCodexMemRef(context, ref);
  if (!match) return mcpToolError(`codex-mem ref not found: ${ref}`);
  const maxChars = clampInt(args.maxChars, 20000, 1000, 200000);
  const text = readFilePrefix(match.path, maxChars + 1);
  if (!text) return mcpToolError(`codex-mem ref could not be read: ${slash(path.relative(context.workspace, match.path))}`);
  const truncated = text.length > maxChars;
  const body = truncated
    ? `${text.slice(0, maxChars)}\n... truncated; call codex_mem_get with a larger maxChars or use ai-context-kit codex-mem get for the full ref ...`
    : text;
  return mcpToolResult(body, {
    refPath: slash(path.relative(context.workspace, match.path)),
    truncated,
    maxChars
  });
}

function mcpRouteCodexMem(context, args) {
  const prompt = String(args.prompt || "").trim();
  if (!prompt) return mcpToolError("codex_mem_route requires prompt");
  const limit = clampInt(args.limit, 8, 1, 12);
  const route = buildCodexMemRoute(context, prompt, limit, { optionalIndex: true });
  return mcpToolResult(formatCodexMemRoute(route), route);
}

function buildCodexMemRoute(context, prompt, limit, options = {}) {
  const entries = readCodexMemKnowledge(context, { optionalIndex: Boolean(options.optionalIndex) });
  const matches = scoreCodexMemEntries(entries, prompt).slice(0, limit).map((item) => toMcpCodexMemMatch(item, 300));
  const repos = rankReposForPrompt(context, matches, prompt).slice(0, 5);
  const warnings = staleArtifactWarnings(context, [`${CODEX_MEM_DIR}/index.jsonl`]);
  return { repos, matches, warnings };
}

function formatCodexMemRoute(route) {
  const repos = route.repos || [];
  const matches = route.matches || [];
  const warningText = formatArtifactWarnings(route.warnings || [], "plain");
  return [
    "codex_mem_route",
    "",
    warningText,
    warningText ? "" : null,
    "Suggested repos:",
    ...(repos.length ? repos.map((repo) => `- ${repo.repo}: score=${repo.score}; reason=${repo.reason}`) : ["- workspace: no specific repo match"]),
    "",
    "Context matches:",
    ...(matches.length ? matches.map(formatMcpRouteMatchLine) : ["- no local index match"])
  ].filter((line) => line !== null).join("\n");
}

function mcpTimelineCodexMem(context, args) {
  const limit = clampInt(args.limit, 20, 1, 50);
  const items = buildCodexMemTimeline(context, limit);
  return mcpToolResult(formatCodexMemTimeline(items), { items });
}

function buildCodexMemTimeline(context, limit) {
  const ledgerPath = path.join(context.workspace, CODEX_MEM_DIR, "ledger.jsonl");
  const observationsPath = path.join(context.workspace, CODEX_MEM_DIR, "observations.jsonl");
  const ledgerItems = readJsonl(ledgerPath).map((event) => ({
    ts: event.ts || "",
    kind: "hook",
    title: `${event.event || "event"} ${event.tool || ""}`.trim(),
    summary: formatCodexMemTimelineHookSummary(event)
  }));
  const observationItems = readJsonl(observationsPath).map((entry) => ({
    ts: entry.ts || "",
    kind: "observation",
    title: entry.title || "observation",
    summary: entry.summary || ""
  }));
  return [...ledgerItems, ...observationItems]
    .sort((a, b) => String(b.ts || "").localeCompare(String(a.ts || "")))
    .slice(0, limit);
}

function formatCodexMemTimeline(items) {
  return items.length
    ? items.map((item) => `- ${item.ts} ${item.kind} ${item.title}: ${item.summary}`).join("\n")
    : "No codex-mem timeline events.";
}

function formatCodexMemTimelineHookSummary(event) {
  const parts = [
    `mode=${event.mode || "unknown"}`,
    `input=${event.inputTokens || 0}`,
    `output=${event.outputTokens || 0}`,
    event.refPath ? `ref=${event.refPath}` : "",
    event.outputHash ? `hash=${shortHash(event.outputHash)}` : "",
    event.refSkipped ? `skipped=${event.refSkipped}` : "",
    timelineSummaryHint(event.outputSummary || event.outputPreview)
  ];
  return parts.filter(Boolean).join("; ");
}

function shortHash(value) {
  const text = String(value || "");
  return text.startsWith("sha256:") && text.length > 24 ? `${text.slice(0, 19)}...` : text;
}

function timelineSummaryHint(value) {
  const text = typeof value === "string" ? value : String(value?.text || "");
  if (!text) return "";
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const important = lines.find((line) => /^L\d+:/i.test(line) && /(error|exception|fatal|fail|failed|warning|warn|timeout|not found|denied|invalid)/i.test(line));
  const firstLine = important || lines.find((line) => /^L\d+:/i.test(line)) || lines[0];
  return firstLine ? `summary=${firstLine.slice(0, 220)}` : "";
}

function mcpRecordCodexMem(context, args) {
  const result = writeCodexMemObservation(context, args);
  if (result.error) return mcpToolError(result.error);
  return mcpToolResult(`Recorded observation: ${result.entry.title}`, {
    path: slash(path.relative(context.workspace, result.observationsPath)),
    entry: result.entry
  });
}

function writeCodexMemObservation(context, args) {
  const title = String(args.title || "").trim();
  const summary = String(args.summary || "").trim();
  if (!title || !summary) return { error: "codex_mem_record requires title and summary" };
  const rawTags = Array.isArray(args.tags) ? args.tags : typeof args.tags === "string" ? args.tags.split(",") : [];
  const tags = rawTags.map((tag) => String(tag).trim()).filter(Boolean).slice(0, 12);
  const entry = {
    ts: new Date().toISOString(),
    type: "observation",
    repo: String(args.repo || "workspace").trim() || "workspace",
    path: String(args.path || "observations").trim() || "observations",
    title: title.slice(0, 200),
    summary: summary.slice(0, 4000),
    tags,
    source: "codex_mem_record",
    tokenEstimate: estimateTokens(`${title} ${summary}`)
  };
  const observationsPath = path.join(context.workspace, CODEX_MEM_DIR, "observations.jsonl");
  appendLocalJsonl(observationsPath, entry);
  return { entry, observationsPath };
}

function rankReposForPrompt(context, matches, prompt) {
  const terms = codexMemQueryTerms(prompt);
  const scores = new Map();
  const addScore = (repoName, score, reason) => {
    if (!isCodexMemRepoName(repoName) && repoName !== "workspace") return;
    const item = scores.get(repoName) || { repo: repoName, score: 0, reason };
    item.score += score;
    if (!String(item.reason || "").includes(reason)) item.reason = `${item.reason}; ${reason}`;
    scores.set(repoName, item);
  };
  for (const repo of context.repos) {
    const haystack = [repo.name, repo.role, ...(repo.tech || [])].join(" ").toLowerCase();
    let score = 0;
    for (const term of terms) {
      if (term && haystack.includes(term)) score += 3;
    }
    if (score) addScore(repo.name, score, "repo metadata matched prompt");
  }
  for (const match of matches) {
    const score = Number(match.score || 0);
    const repoNames = routeReposForCodexMemMatch(match);
    for (let i = 0; i < repoNames.length; i += 1) {
      const repoName = repoNames[i];
      const relatedScore = i === 0 ? score : Math.max(1, Math.ceil(score * 0.9));
      const reason = i === 0 ? "context index matched prompt" : "api contract linked repository";
      addScore(repoName, relatedScore, reason);
    }
  }
  return [...scores.values()].sort((a, b) => b.score - a.score || a.repo.localeCompare(b.repo));
}

function formatMcpSearchResults(results) {
  return results.map((item) => {
    const lines = [
      `- [${item.score}] ${item.type} ${item.repo} ${item.path}`,
      `  title: ${item.title}`,
      `  tokens: ${item.tokenEstimate || 0}`
    ];
    if (item.relatedRepos?.length) lines.push(`  related repos: ${item.relatedRepos.join(", ")}`);
    lines.push(`  summary: ${item.summary}`);
    return lines.join("\n");
  }).join("\n");
}

function formatMcpRouteMatchLine(item) {
  const related = item.relatedRepos?.length ? `; related=${item.relatedRepos.join(",")}` : "";
  return `- [${item.score}] ${item.repo} ${item.type} ${item.path}: ${item.title}${related}`;
}

function toMcpCodexMemMatch(item, summaryLimit) {
  const contract = codexMemContractForEntry(item.entry);
  const relatedRepos = relatedReposForCodexMemEntry(item.entry, contract);
  const result = {
    score: item.score,
    type: item.entry.type,
    repo: item.entry.repo || "workspace",
    path: item.entry.path,
    title: item.entry.title,
    summary: String(item.entry.summary || "").slice(0, summaryLimit),
    tokenEstimate: item.entry.tokenEstimate || 0
  };
  if (relatedRepos.length) result.relatedRepos = relatedRepos;
  if (contract) result.contract = contract;
  return result;
}

function routeReposForCodexMemMatch(match) {
  return unique([match.repo, ...(match.relatedRepos || [])].filter((repoName) => isCodexMemRepoName(repoName) || repoName === "workspace"));
}

function relatedReposForCodexMemEntry(entry, contract) {
  const related = Array.isArray(entry.relatedRepos) ? entry.relatedRepos : [];
  return unique([
    ...related,
    contract?.frontendRepo,
    contract?.backendRepo
  ].filter(isCodexMemRepoName));
}

function codexMemContractForEntry(entry) {
  if (!entry || entry.type !== "api-contract") return null;
  const fromEntry = entry.contract && typeof entry.contract === "object" ? entry.contract : {};
  const fromSummary = parseCodexMemSummaryFields(entry.summary);
  const contract = {
    frontendRepo: cleanCodexMemContractValue(fromEntry.frontendRepo || fromSummary.frontend),
    endpoint: cleanCodexMemContractValue(fromEntry.endpoint || fromSummary.endpoint),
    symbol: cleanCodexMemContractValue(fromEntry.symbol || fromSummary.symbol),
    frontendFile: cleanCodexMemContractValue(fromEntry.frontendFile || fromSummary.frontendFile),
    backendRepo: cleanCodexMemContractValue(fromEntry.backendRepo || fromSummary.backend),
    handler: cleanCodexMemContractValue(fromEntry.handler || fromSummary.handler),
    frontendPayloadFields: cleanCodexMemContractValue(fromEntry.frontendPayloadFields || fromSummary.payload),
    requestFields: cleanCodexMemContractValue(fromEntry.requestFields || fromSummary.request),
    fieldCheck: cleanCodexMemContractValue(fromEntry.fieldCheck || fromSummary.fieldCheck),
    responseType: cleanCodexMemContractValue(fromEntry.responseType || fromSummary.response)
  };
  return Object.values(contract).some(Boolean) ? contract : null;
}

function parseCodexMemSummaryFields(summary) {
  const fields = {};
  for (const part of String(summary || "").split(";")) {
    const match = part.trim().match(/^([A-Za-z][A-Za-z0-9_]*)=(.*)$/);
    if (match) fields[match[1]] = match[2].trim();
  }
  return fields;
}

function cleanCodexMemContractValue(value) {
  const text = String(value || "").trim();
  return text && text !== "-" ? text : "";
}

function appendLocalJsonl(file, value) {
  ensureDir(path.dirname(file), {});
  fs.appendFileSync(file, `${JSON.stringify(value)}\n`, "utf8");
}

function mcpToolResult(text, structuredContent) {
  const result = {
    content: [{ type: "text", text: String(text || "") }]
  };
  if (structuredContent) result.structuredContent = structuredContent;
  return result;
}

function mcpToolError(message) {
  return {
    content: [{ type: "text", text: String(message || "Tool error") }],
    isError: true
  };
}

function mcpError(id, code, message) {
  return {
    jsonrpc: "2.0",
    id,
    error: { code, message }
  };
}

function writeMcpResponse(response) {
  const body = JSON.stringify(response);
  if (mcpOutputFraming === "header") {
    process.stdout.write(`Content-Length: ${Buffer.byteLength(body, "utf8")}\r\n\r\n${body}`);
    return;
  }
  process.stdout.write(`${body}\n`);
}

function clampInt(value, defaultValue, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) return defaultValue;
  return Math.max(min, Math.min(max, Math.floor(number)));
}

const CODEX_MEM_QUERY_ALIASES = [
  { patterns: ["设备", "资产"], terms: ["equipment", "device", "asset"] },
  { patterns: ["租用", "租借"], terms: ["lease", "leased", "rent", "rental"] },
  { patterns: ["下单", "下订", "提交订单"], terms: ["order", "saveorder", "placeorder", "presaveorder"] },
  { patterns: ["归还", "退还", "完成"], terms: ["return", "revert", "giveback", "give-back", "finalize"] },
  { patterns: ["结算"], terms: ["settlement", "settle", "pay", "payment"] },
  { patterns: ["支付"], terms: ["pay", "payment", "weappay", "payrouter"] },
  { patterns: ["退款"], terms: ["refund", "payfail", "payorderfail"] },
  { patterns: ["状态"], terms: ["status", "state"] },
  { patterns: ["预约", "预订"], terms: ["reserve", "reservation", "booking"] }
];

function scoreCodexMemEntries(entries, query) {
  const terms = codexMemQueryTerms(query);
  return entries.map((entry) => {
    let score = 0;
    const contract = codexMemContractForEntry(entry);
    for (const term of terms) {
      if (!term) continue;
      for (const field of codexMemEntrySearchFields(entry)) {
        score += scoreCodexMemField(field.value, term, field.weight);
      }
    }
    if (score > 0 && contract?.backendRepo) score += 8;
    return { entry, score };
  }).filter((item) => item.score > 0).sort((a, b) => b.score - a.score || (a.entry.tokenEstimate || 0) - (b.entry.tokenEstimate || 0));
}

function codexMemEntrySearchFields(entry) {
  const fields = [
    { value: entry.type, weight: 1 },
    { value: entry.repo, weight: 4 },
    { value: entry.path, weight: 4 },
    { value: entry.title, weight: 6 },
    { value: entry.summary, weight: 1 }
  ];
  const contract = codexMemContractForEntry(entry);
  if (contract) {
    fields.push(
      { value: contract.endpoint, weight: 12 },
      { value: contract.symbol, weight: 12 },
      { value: contract.handler, weight: 9 },
      { value: contract.frontendFile, weight: 5 },
      { value: contract.frontendRepo, weight: 4 },
      { value: contract.backendRepo, weight: 4 },
      { value: contract.frontendPayloadFields, weight: 5 },
      { value: contract.requestFields, weight: 3 },
      { value: contract.fieldCheck, weight: 5 },
      { value: contract.responseType, weight: 2 }
    );
  }
  if (Array.isArray(entry.relatedRepos)) fields.push({ value: entry.relatedRepos.join(" "), weight: 4 });
  if (Array.isArray(entry.tags)) fields.push({ value: entry.tags.join(" "), weight: 5 });
  if (entry.source) fields.push({ value: entry.source, weight: 2 });
  return fields;
}

function scoreCodexMemField(value, term, weight) {
  const text = String(value || "").toLowerCase();
  if (!text || !term) return 0;
  const occurrences = text.split(term).length - 1;
  if (!occurrences) return 0;
  const shapeWeight = term.includes("/") || term.includes(".") ? 3 : 1;
  const exactWeight = text === term ? 3 : 1;
  return occurrences * shapeWeight * exactWeight * weight;
}

function codexMemQueryTerms(query) {
  const raw = String(query || "").toLowerCase();
  const expanded = [raw];
  for (const group of CODEX_MEM_QUERY_ALIASES) {
    if (group.patterns.some((pattern) => raw.includes(pattern.toLowerCase()))) {
      expanded.push(...group.terms);
    }
  }
  return unique(expanded.join(" ").split(/[^a-z0-9_\u4e00-\u9fa5./-]+/).filter(Boolean));
}

function installCodexMemHooks(context, opts) {
  const mode = opts.mode || "observe";
  if (!["observe", "compress"].includes(mode)) fail("--mode must be observe or compress");
  const codexDir = path.join(context.workspace, ".codex");
  const hooksDir = path.join(codexDir, "hooks");
  ensureDir(hooksDir, opts);
  writeGeneratedJson(path.join(codexDir, "hooks.json"), renderCodexMemHooksJson(mode, opts), opts);
  writeFile(path.join(hooksDir, "codex-mem-hook.mjs"), renderCodexMemHookScript({ mode, threshold: opts.threshold }), opts);
}

function installUserCodexMemHooks(context, opts) {
  const mode = opts.mode || "observe";
  if (!["observe", "compress"].includes(mode)) fail("--mode must be observe or compress");
  const codexHome = path.resolve(opts.codexHome || process.env.CODEX_HOME || path.join(os.homedir(), ".codex"));
  const target = path.join(codexHome, "hooks.json");
  const hookScript = path.join(context.workspace, ".codex", "hooks", "codex-mem-hook.mjs");
  if (!fs.existsSync(hookScript) && !opts.dryRun) {
    fail(`Project hook script not found. Run install-hooks first: ${hookScript}`);
  }
  writeGeneratedJson(target, renderCodexMemHooksJson(mode, opts, {
    commandPrefix: `node ${shellQuote(hookScript)} --workspace ${shellQuote(context.workspace)} --scope ${shellQuote(context.workspace)}`
  }), opts);
}

function renderCodexMemHooksJsonWithOptions(mode, opts, extra) {
  const threshold = Number.isFinite(opts.threshold) && opts.threshold > 0 ? opts.threshold : 8000;
  const prefix = extra.commandPrefix || "node .codex/hooks/codex-mem-hook.mjs";
  const commandFor = (event) => `${prefix} --event ${event} --mode ${mode} --threshold ${threshold}`;
  const simple = (event) => [{ hooks: [{ type: "command", command: commandFor(event) }] }];
  const tool = (event) => [{
    matcher: ".*",
    hooks: [{ type: "command", command: commandFor(event) }]
  }];
  return {
    _generatedBy: CODEX_MEM_GENERATOR,
    _generatedAt: new Date().toISOString(),
    _mode: mode,
    hooks: {
      SessionStart: simple("SessionStart"),
      UserPromptSubmit: simple("UserPromptSubmit"),
      PreToolUse: tool("PreToolUse"),
      PostToolUse: tool("PostToolUse"),
      PreCompact: simple("PreCompact"),
      PostCompact: simple("PostCompact"),
      Stop: simple("Stop")
    }
  };
}

function renderCodexMemHooksJson(mode, opts, extra) {
  return renderCodexMemHooksJsonWithOptions(mode, opts, extra || {});
}

function writeGeneratedJson(target, value, opts) {
  if (fs.existsSync(target)) {
    const current = safeRead(target);
    if (!opts.force && !current.includes(CODEX_MEM_GENERATOR)) {
      log(`skip existing non-codex-mem file ${target}`);
      return;
    }
  }
  writeFile(target, JSON.stringify(value, null, 2) + "\n", opts);
}

function renderCodexMemHookScript({ mode, threshold }) {
  const defaultThreshold = Number.isFinite(threshold) && threshold > 0 ? threshold : 8000;
  return `#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const args = parseArgs(process.argv.slice(2));
const workspace = path.resolve(args.workspace || process.cwd());
const scopes = Array.isArray(args.scope) ? args.scope.map((item) => path.resolve(item)) : [];
const mode = args.mode || ${JSON.stringify(mode || "observe")};
const threshold = Number.isFinite(Number(args.threshold)) ? Number(args.threshold) : ${defaultThreshold};
const eventFromArg = args.event || "";
const payload = await readPayload();
const eventName = payload.hook_event_name || payload.hookEventName || eventFromArg || "unknown";

if (scopes.length && !isInScope(payload, scopes)) {
  process.exit(0);
}

ensureDir(path.join(workspace, ".codex-mem"));
ensureDir(path.join(workspace, ".codex-mem", "refs"));

const ledgerPath = path.join(workspace, ".codex-mem", "ledger.jsonl");
const record = buildRecord(payload, eventName, mode, threshold);
const response = buildResponse(payload, eventName, record);
const recorded = appendJsonl(ledgerPath, record);

if (recorded && Object.keys(response).length) {
  process.stdout.write(JSON.stringify(response));
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--workspace") out.workspace = argv[++i];
    else if (arg === "--event") out.event = argv[++i];
    else if (arg === "--mode") out.mode = argv[++i];
    else if (arg === "--threshold") out.threshold = argv[++i];
    else if (arg === "--scope") {
      if (!Array.isArray(out.scope)) out.scope = [];
      out.scope.push(argv[++i]);
    }
  }
  return out;
}

function isInScope(input, scopeRoots) {
  const candidates = [
    input.cwd,
    input.current_working_directory,
    input.workspace,
    input.project_root,
    process.cwd()
  ].filter(Boolean).map((item) => path.resolve(String(item)));
  return candidates.some((candidate) => scopeRoots.some((root) => candidate === root || candidate.startsWith(root + path.sep)));
}

async function readPayload() {
  const raw = await new Promise((resolve) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => { data += chunk; });
    process.stdin.on("end", () => resolve(data));
    if (process.stdin.isTTY) resolve("");
  });
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    return { parseError: true, rawChars: raw.length };
  }
}

function buildRecord(input, eventName, modeName, largeThreshold) {
  const outputText = extractOutputText(input);
  const toolInputText = extractToolInputText(input);
  const toolName = extractToolName(input);
  const risk = detectRisk(input);
  return {
    ts: new Date().toISOString(),
    event: eventName,
    mode: modeName,
    tool: toolName,
    risk,
    inputTokens: estimateTokens(toolInputText),
    outputTokens: estimateTokens(outputText),
    outputChars: outputText.length,
    threshold: largeThreshold,
    largeOutput: estimateTokens(outputText) >= largeThreshold
  };
}

function buildResponse(input, eventName, record) {
  if (eventName === "SessionStart") {
    const summary = readWorkspaceSummary();
    if (!summary) return {};
    return additional(eventName, summary);
  }

  if (eventName === "UserPromptSubmit") {
    const prompt = String(input.prompt || input.user_prompt || input.userPrompt || input.message || "");
    const matches = searchIndex(prompt).slice(0, 5);
    if (!matches.length) return {};
    return additional(eventName, [
      "codex-mem observe: local context matches",
      ...matches.map((item) => "- " + item.entry.type + " " + (item.entry.repo || "workspace") + " " + item.entry.path + " (" + (item.entry.tokenEstimate || 0) + " tokens)")
    ].join("\\n"));
  }

  if (eventName === "Stop") {
    const summary = buildStopTokenSummary();
    if (!summary) return {};
    return additional(eventName, summary);
  }

  if (eventName === "PreToolUse" && record.risk.length) {
    const hints = [
      "codex-mem observe: this tool call looks expensive or sensitive.",
      "risk: " + record.risk.join(", "),
      "Prefer workspace maps, project-facts, codex-mem search, or narrower repo-scoped rg before broad reads."
    ];
    if (record.risk.includes("contract-map-wide-read")) {
      hints.push("For API contracts, prefer: ai-context-kit contracts --workspace <workspace> --query \\"<endpoint-or-symbol>\\".");
      hints.push("If the CLI is not available, use rg -n with exact endpoint/page/API symbols instead of reading the whole contract map.");
    }
    if (record.risk.includes("codex-mem-index-direct-read")) {
      hints.push("Prefer ai-context-kit codex-mem search/route, or exact rg against known files, instead of opening .codex-mem/index.jsonl.");
      hints.push("For backend-only single endpoint bugs, after repo and method are known, do not read the local index.");
    }
    return additional(eventName, hints.join("\\n"));
  }

  if (eventName === "PostToolUse" && record.largeOutput) {
    if (mode === "compress") {
      const outputText = extractOutputText(input);
      if (record.risk.includes("sensitive-path")) {
        record.compressed = false;
        record.refSkipped = "sensitive-path";
        return additional(eventName, [
          "codex-mem compress: large output matched sensitive-path; no ref was written.",
          "estimated original tokens: " + record.outputTokens,
          "Use a narrower command and avoid sending secrets or config files into tool output."
        ].join("\\n"));
      }
      if (outputText && !record.risk.includes("sensitive-path")) {
        const ref = writeRef(outputText, input, record);
        const additionalContext = [
          "codex-mem compressed tool output.",
          "ref: " + ref.path,
          "sha256: " + ref.hash,
          "estimated original tokens: " + record.outputTokens,
          "estimated compressed tokens: " + ref.contextTokens,
          "summary:",
          ref.preview
        ].join("\\n");
        record.compressed = true;
        record.refPath = ref.path;
        record.outputHash = "sha256:" + ref.hash;
        record.outputPreview = ref.preview;
        record.outputSummary = ref.summary;
        record.compressedOutputTokens = ref.contextTokens;
        return {
          decision: "block",
          reason: "codex-mem stored a large tool output locally and returned a short reference.",
          hookSpecificOutput: {
            hookEventName: eventName,
            additionalContext
          }
        };
      }
    }
    return additional(eventName, "codex-mem observe: tool output estimated at " + record.outputTokens + " tokens. Consider narrowing the command or enabling compress mode after A/B testing.");
  }

  return {};
}

function additional(eventName, text) {
  return {
    hookSpecificOutput: {
      hookEventName: eventName,
      additionalContext: text
    }
  };
}

function readWorkspaceSummary() {
  const workspaceFile = path.join(workspace, ".codex-mem", "workspace.json");
  let data = null;
  try {
    data = JSON.parse(fs.readFileSync(workspaceFile, "utf8"));
  } catch {
    return "";
  }
  const repos = Array.isArray(data.repos) ? data.repos : [];
  return [
    "codex-mem observe mode is active.",
    "workspace kind: " + (data.workspaceKind || "unknown"),
    "repos: " + repos.map((repo) => repo.name + ":" + repo.role).join(", "),
    "Use AGENTS.md, project-facts and ai-context-kit codex-mem search/route before broad source reads; do not open .codex-mem/index.jsonl directly for known backend endpoint bugs."
  ].join("\\n");
}

function buildStopTokenSummary() {
  const events = readLedgerEvents();
  const lastSessionStartIndex = findLastIndex(events, (event) => event.event === "SessionStart");
  const scopedEvents = events
    .slice(lastSessionStartIndex >= 0 ? lastSessionStartIndex + 1 : 0)
    .filter((event) => event.event !== "Stop");
  const inputTokens = sumValues(scopedEvents, "inputTokens");
  const outputTokens = sumValues(scopedEvents, "outputTokens");
  const largeEvents = scopedEvents.filter((event) => event.largeOutput);
  const compressedEvents = scopedEvents.filter((event) => event.compressed && Number.isFinite(Number(event.compressedOutputTokens)));
  const projectedTokens = scopedEvents.reduce((total, event) => {
    if (event.compressed && Number.isFinite(Number(event.compressedOutputTokens))) {
      return total + Number(event.compressedOutputTokens);
    }
    const eventThreshold = Number.isFinite(Number(event.threshold)) ? Number(event.threshold) : threshold;
    return total + (Number(event.outputTokens || 0) >= eventThreshold ? 1000 : Number(event.outputTokens || 0));
  }, 0);
  const estimatedSaved = Math.max(0, outputTokens - projectedTokens);
  const staticSummary = readStaticSavingsSummary();
  const lines = ["codex-mem token snapshot:"];
  if (staticSummary) lines.push("- static context: " + staticSummary);
  lines.push("- observed tool input tokens in this session: " + formatNumber(inputTokens));
  lines.push("- observed tool output tokens in this session: " + formatNumber(outputTokens));
  lines.push("- large output events: " + formatNumber(largeEvents.length));
  if (compressedEvents.length || estimatedSaved > 0) {
    lines.push("- compressed/projection output tokens: " + formatNumber(projectedTokens) + " (estimated change " + formatNumber(estimatedSaved) + " tokens)");
  }
  lines.push("- real Codex session usage: run ai-context-kit codex-mem sessions --workspace " + workspace);
  lines.push("These are local estimates for visibility; they are not a billing statement or a quality result.");
  return lines.join("\\n");
}

function readStaticSavingsSummary() {
  const dashboardPath = path.join(workspace, "docs", "ai-context-token-dashboard.md");
  let text = "";
  try {
    text = fs.readFileSync(dashboardPath, "utf8");
  } catch {
    return "";
  }
  const baseline = findDashboardMetric(text, "父目录全量基线");
  const routing = findDashboardMetric(text, "父目录路由");
  const savings = (text.match(/父目录路由相比父目录全量基线：节省\\s*([0-9.]+%)/) || [])[1] || "";
  const rel = slashPath(path.relative(workspace, dashboardPath));
  const parts = [];
  if (savings) parts.push("routing saved " + savings);
  if (baseline && routing) parts.push(formatNumber(baseline) + " -> " + formatNumber(routing) + " tokens");
  parts.push(rel);
  return parts.join("; ");
}

function findDashboardMetric(text, label) {
  const pattern = new RegExp("\\\\|\\\\s*" + escapeRegExp(label) + "\\\\s*\\\\|\\\\s*([0-9,]+)\\\\s*\\\\|");
  const match = text.match(pattern);
  return match ? Number(match[1].replace(/,/g, "")) : 0;
}

function readLedgerEvents() {
  try {
    return fs.readFileSync(ledgerPath, "utf8")
      .split(/\\r?\\n/)
      .filter(Boolean)
      .map((line) => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

function findLastIndex(items, predicate) {
  for (let i = items.length - 1; i >= 0; i -= 1) {
    if (predicate(items[i], i)) return i;
  }
  return -1;
}

function sumValues(items, key) {
  return items.reduce((total, item) => total + Number(item[key] || 0), 0);
}

function formatNumber(value) {
  return String(Math.round(Number(value) || 0)).replace(/\\B(?=(\\d{3})+(?!\\d))/g, ",");
}

function slashPath(value) {
  return String(value || "").split(path.sep).join("/");
}

function escapeRegExp(value) {
  const specials = "\\\\^$.*+?()[]{}|";
  let out = "";
  for (const char of String(value || "")) {
    out += specials.includes(char) ? "\\\\" + char : char;
  }
  return out;
}

function searchIndex(query) {
  const terms = Array.from(new Set(String(query || "").toLowerCase().split(/[^a-z0-9_\\u4e00-\\u9fa5./-]+/).filter(Boolean)));
  if (!terms.length) return [];
  const entries = readIndex();
  return entries.map((entry) => {
    const text = [entry.type, entry.repo, entry.path, entry.title, entry.summary].join(" ").toLowerCase();
    let score = 0;
    for (const term of terms) {
      const count = text.split(term).length - 1;
      score += count * (term.includes("/") || term.includes(".") ? 3 : 1);
    }
    return { entry, score };
  }).filter((item) => item.score > 0).sort((a, b) => b.score - a.score || (a.entry.tokenEstimate || 0) - (b.entry.tokenEstimate || 0));
}

function readIndex() {
  try {
    return fs.readFileSync(path.join(workspace, ".codex-mem", "index.jsonl"), "utf8")
      .split(/\\r?\\n/)
      .filter(Boolean)
      .map((line) => JSON.parse(line));
  } catch {
    return [];
  }
}

function writeRef(outputText, input, record) {
  const date = new Date().toISOString().slice(0, 10);
  const dir = path.join(workspace, ".codex-mem", "refs", date);
  ensureDir(dir);
  const id = new Date().toISOString().replace(/[:.]/g, "-") + "-" + Math.random().toString(16).slice(2, 8);
  const rel = path.join(".codex-mem", "refs", date, id + ".md");
  const refPath = rel.split(path.sep).join("/");
  const hash = crypto.createHash("sha256").update(outputText).digest("hex");
  const summary = summarizeOutput(outputText, 2400);
  const preview = summary.text;
  const toolInputPreview = makePreview(extractToolInputText(input), 800);
  const metadata = {
    ...record,
    compressed: true,
    refPath,
    outputHash: "sha256:" + hash,
    outputPreview: preview,
    outputSummary: summary,
    toolInputPreview
  };
  const body = [
    "# codex-mem tool output ref",
    "",
    "~~~json",
    JSON.stringify(metadata, null, 2),
    "~~~",
    "",
    "## Summary",
    "",
    "~~~text",
    preview,
    "~~~",
    "",
    "## Output",
    "",
    "~~~text",
    outputText,
    "~~~"
  ].join("\\n");
  fs.writeFileSync(path.join(workspace, rel), body, "utf8");
  return {
    path: refPath,
    hash,
    preview,
    summary,
    contextTokens: estimateTokens([
      "codex-mem compressed tool output.",
      "ref: " + refPath,
      "sha256: " + hash,
      "estimated original tokens: " + record.outputTokens,
      "summary:",
      preview
    ].join("\\n"))
  };
}

function summarizeOutput(value, maxChars) {
  const text = String(value || "").replace(/\\r\\n/g, "\\n");
  const lines = text.split("\\n");
  const nonEmpty = lines
    .map((line, index) => ({ index, line: line.trim() }))
    .filter((item) => item.line);
  const importantPattern = /(error|exception|traceback|fatal|fail|failed|warning|warn|timeout|not found|cannot|denied|invalid|undefined|panic|segmentation|stack trace)/i;
  const pathPattern = /(^|[\\s"'(])([A-Za-z0-9_./-]+\\.(?:js|ts|jsx|tsx|vue|java|kt|go|py|rb|php|cs|sql|xml|json|ya?ml|md|sh))(?:[:#]\\d+)?/i;
  const important = takeUniqueLines(nonEmpty.filter((item) => importantPattern.test(item.line)), 16);
  const pathLines = takeUniqueLines(nonEmpty.filter((item) => pathPattern.test(item.line)), 16, new Set(important.map((item) => item.index)));
  const head = nonEmpty.slice(0, 10);
  const tail = nonEmpty.length > 16 ? nonEmpty.slice(-8) : [];
  const parts = [
    "lines: " + lines.length + "; chars: " + text.length + "; estimated tokens: " + estimateTokens(text),
    renderSummarySection("important lines", important),
    renderSummarySection("file/path lines", pathLines),
    renderSummarySection("head", head),
    renderSummarySection("tail", tail)
  ].filter(Boolean);
  const summaryText = makePreview(parts.join("\\n\\n"), maxChars);
  return {
    text: summaryText,
    lineCount: lines.length,
    charCount: text.length,
    importantLineCount: important.length,
    pathLineCount: pathLines.length
  };
}

function takeUniqueLines(items, limit, skipIndexes = new Set()) {
  const seen = new Set();
  const out = [];
  for (const item of items) {
    if (skipIndexes.has(item.index)) continue;
    const key = item.line.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
    if (out.length >= limit) break;
  }
  return out;
}

function renderSummarySection(title, items) {
  if (!items.length) return "";
  return [
    title + ":",
    ...items.map((item) => "L" + (item.index + 1) + ": " + item.line.slice(0, 320))
  ].join("\\n");
}

function makePreview(value, maxChars) {
  const text = String(value || "").replace(/\\r\\n/g, "\\n");
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars) + "\\n... truncated; read the ref file for full output ...";
}

function extractToolName(input) {
  return String(input.tool_name || input.toolName || input.name || input.tool?.name || input.tool || "");
}

function extractToolInputText(input) {
  const value = input.tool_input || input.toolInput || input.input || input.arguments || input.args || "";
  return typeof value === "string" ? value : safeStringify(value);
}

function extractOutputText(input) {
  const value = input.tool_response || input.toolResponse || input.response || input.output || input.result || input.stdout || input.stderr || "";
  return typeof value === "string" ? value : safeStringify(value);
}

function detectRisk(input) {
  const text = safeStringify(input).toLowerCase();
  const risks = [];
  if (/\\brg\\b.*\\s\\.\\s*$|find\\s+\\.|ls\\s+-r|cat\\s+\\.|sed\\s+-n/.test(text)) risks.push("broad-read");
  if (/ai-context-api-contract-map\\.md/.test(text) && /(sed\\s+-n|cat\\s+|less\\s+|more\\s+|head\\s+|tail\\s+)/.test(text)) risks.push("contract-map-wide-read");
  if (/\\.codex-mem\\/index\\.jsonl/.test(text) && /(sed\\s+-n|cat\\s+|less\\s+|more\\s+|head\\s+|tail\\s+)/.test(text)) risks.push("codex-mem-index-direct-read");
  if (/node_modules|target\\/|dist\\/|build\\/|unpackage\\/|\\.codegraph|uview-ui|utils\\/plugins\\/monitor|doc\\/sql|\\.min\\.js|src\\/main\\/resources\\/vm/.test(text)) risks.push("high-volume-path");
  if (/application.*\\.ya?ml|\\.env|\\.pem|\\.key|secret|credential|token/.test(text)) risks.push("sensitive-path");
  return Array.from(new Set(risks));
}

function safeStringify(value) {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value || "");
  }
}

function estimateTokens(value) {
  return Math.ceil(String(value || "").length / 4);
}

function appendJsonl(file, value) {
  const releaseLock = acquireLedgerLock(file + ".lock");
  try {
    if (isRecentDuplicate(file, value)) return false;
    fs.appendFileSync(file, JSON.stringify(value) + "\\n", "utf8");
    return true;
  } finally {
    releaseLock();
  }
}

function acquireLedgerLock(lockDir) {
  const deadline = Date.now() + 2000;
  while (true) {
    try {
      fs.mkdirSync(lockDir);
      return () => {
        try {
          fs.rmSync(lockDir, { recursive: true, force: true });
        } catch {}
      };
    } catch {
      try {
        const ageMs = Date.now() - fs.statSync(lockDir).mtimeMs;
        if (ageMs > 5000) fs.rmSync(lockDir, { recursive: true, force: true });
      } catch {}
      if (Date.now() > deadline) return () => {};
      sleep(25);
    }
  }
}

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function isRecentDuplicate(file, value) {
  let lines = [];
  try {
    lines = fs.readFileSync(file, "utf8").trim().split(/\\r?\\n/).filter(Boolean).slice(-10);
  } catch {
    return false;
  }
  const currentTs = Date.parse(value.ts) || Date.now();
  return lines.some((line) => {
    let previous = null;
    try {
      previous = JSON.parse(line);
    } catch {
      return false;
    }
    const previousTs = Date.parse(previous.ts) || 0;
    return Math.abs(currentTs - previousTs) <= 1000 && sameHookRecord(previous, value);
  });
}

function sameHookRecord(a, b) {
  return a.event === b.event
    && a.mode === b.mode
    && a.tool === b.tool
    && Number(a.inputTokens || 0) === Number(b.inputTokens || 0)
    && Number(a.outputTokens || 0) === Number(b.outputTokens || 0)
    && Number(a.outputChars || 0) === Number(b.outputChars || 0)
    && safeStringify(a.risk || []) === safeStringify(b.risk || []);
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}
`;
}

function writeCodexMemDashboard(context, opts) {
  const ledgerPath = path.join(context.workspace, CODEX_MEM_DIR, "ledger.jsonl");
  const rawEvents = readJsonl(ledgerPath);
  const events = dedupeLedgerEvents(rawEvents);
  const outPath = path.resolve(opts.output || path.join(context.workspace, "docs", "codex-mem-dashboard.md"));
  writeFile(outPath, renderCodexMemDashboard({ context, events, ledgerPath, rawEventCount: rawEvents.length }), opts);
}

function readJsonl(file) {
  const text = safeRead(file);
  if (!text) return [];
  return text.split(/\r?\n/).filter(Boolean).map((line) => {
    try {
      return JSON.parse(line);
    } catch {
      return null;
    }
  }).filter(Boolean);
}

function dedupeLedgerEvents(events) {
  const out = [];
  for (const event of events) {
    const currentTs = Date.parse(event.ts) || 0;
    const duplicate = out.slice(-10).some((previous) => {
      const previousTs = Date.parse(previous.ts) || 0;
      return Math.abs(currentTs - previousTs) <= 1000 && sameLedgerEvent(previous, event);
    });
    if (!duplicate) out.push(event);
  }
  return out;
}

function sameLedgerEvent(a, b) {
  return a.event === b.event
    && a.mode === b.mode
    && a.tool === b.tool
    && Number(a.inputTokens || 0) === Number(b.inputTokens || 0)
    && Number(a.outputTokens || 0) === Number(b.outputTokens || 0)
    && Number(a.outputChars || 0) === Number(b.outputChars || 0)
    && JSON.stringify(a.risk || []) === JSON.stringify(b.risk || []);
}

function renderCodexMemDashboard({ context, events, ledgerPath, rawEventCount }) {
  const outputTokens = sum(events.map((event) => event.outputTokens));
  const inputTokens = sum(events.map((event) => event.inputTokens));
  const largeEvents = events.filter((event) => event.largeOutput);
  const compressedEvents = events.filter((event) => event.compressed && event.refPath);
  const skippedRefEvents = events.filter((event) => event.refSkipped);
  const threshold = 8000;
  const compressedProjection = events.reduce((total, event) => {
    if (event.compressed && Number.isFinite(Number(event.compressedOutputTokens))) {
      return total + Number(event.compressedOutputTokens);
    }
    const eventThreshold = Number.isFinite(Number(event.threshold)) ? Number(event.threshold) : threshold;
    return total + (event.outputTokens >= eventThreshold ? 1000 : event.outputTokens);
  }, 0);
  const toolRows = topToolRows(events);
  const riskRows = topRiskRows(events);
  const duplicateEvents = Math.max(0, Number(rawEventCount || events.length) - events.length);
  return `# codex-mem observe 看板

生成时间：${new Date().toISOString()}

工作区：\`.\`

ledger：\`${slash(path.relative(context.workspace, ledgerPath))}\`

## 观测结果

| 指标 | 数值 |
|---|---:|
| hook events | ${formatNumber(events.length)} |
| duplicate hook events ignored | ${formatNumber(duplicateEvents)} |
| tool input tokens 估算 | ${formatNumber(inputTokens)} |
| tool output tokens 估算 | ${formatNumber(outputTokens)} |
| 大输出事件 | ${formatNumber(largeEvents.length)} |
| 已写入 refs 的事件 | ${formatNumber(compressedEvents.length)} |
| 因敏感路径跳过 refs | ${formatNumber(skippedRefEvents.length)} |
| 大输出压缩后预估 output tokens | ${formatNumber(compressedProjection)} |
| 只压缩大输出的潜在变化 | ${formatPct(compressedProjection, outputTokens)} |

## 工具分布

| 工具 | 事件 | output tokens |
|---|---:|---:|
${toolRows}

## 风险提示

| 风险 | 次数 |
|---|---:|
${riskRows}

## 使用说明

- 当前默认是 observe 模式，只记录和提示，不阻止工具调用。
- 大输出压缩预估只用于判断收益空间，不等同于实际 Codex app 账单。
- 打开 compress 模式前，需要用真实任务确认答案质量没有下降。
- refs 和 ledger 可能包含本地调试信息，不建议提交。
`;
}

function topToolRows(events) {
  const map = new Map();
  for (const event of events) {
    const key = event.tool || event.event || "unknown";
    const item = map.get(key) || { count: 0, tokens: 0 };
    item.count += 1;
    item.tokens += Number(event.outputTokens || 0);
    map.set(key, item);
  }
  const rows = [...map.entries()].sort((a, b) => b[1].tokens - a[1].tokens).slice(0, 12);
  return rows.length ? rows.map(([tool, item]) => `| \`${tool}\` | ${formatNumber(item.count)} | ${formatNumber(item.tokens)} |`).join("\n") : "| - | - | - |";
}

function topRiskRows(events) {
  const map = new Map();
  for (const event of events) {
    for (const risk of event.risk || []) {
      map.set(risk, (map.get(risk) || 0) + 1);
    }
  }
  const rows = [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12);
  return rows.length ? rows.map(([risk, count]) => `| \`${risk}\` | ${formatNumber(count)} |`).join("\n") : "| - | - |";
}

function writeCodexSessionUsageReport(context, opts) {
  const codexHome = path.resolve(opts.codexHome || process.env.CODEX_HOME || path.join(os.homedir(), ".codex"));
  const days = Number.isFinite(opts.days) && opts.days > 0 ? opts.days : 14;
  const sessionsDir = path.join(codexHome, "sessions");
  const outPath = path.resolve(opts.output || path.join(context.workspace, "docs", "codex-session-usage.md"));
  const allSessions = collectCodexSessions({ sessionsDir, workspace: context.workspace, days });
  const requestedSessionIds = normalizeSessionIds(opts.sessionIds);
  const { sessions, missingSessionIds } = filterSessionsByIds(allSessions, requestedSessionIds);
  writeFile(outPath, renderCodexSessionUsageReport({
    context,
    codexHome,
    sessions,
    days,
    requestedSessionIds,
    missingSessionIds
  }), opts);
}

function normalizeSessionIds(values) {
  const out = [];
  for (const value of values || []) {
    for (const part of String(value || "").split(",")) {
      const item = part.trim();
      if (item) out.push(item);
    }
  }
  return out;
}

function filterSessionsByIds(sessions, requestedSessionIds) {
  if (!requestedSessionIds.length) return { sessions, missingSessionIds: [] };
  const byId = new Map(sessions.map((session) => [session.id, session]));
  const filtered = [];
  const missing = [];
  const seen = new Set();
  for (const id of requestedSessionIds) {
    if (seen.has(id)) continue;
    seen.add(id);
    const session = byId.get(id);
    if (session) filtered.push(session);
    else missing.push(id);
  }
  return { sessions: filtered, missingSessionIds: missing };
}

function collectCodexSessions({ sessionsDir, workspace, days }) {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const files = listSessionFiles(sessionsDir).filter((file) => {
    const stat = safeStat(file);
    return stat && stat.mtimeMs >= cutoff && stat.size <= 50 * 1024 * 1024;
  });
  const workspaceRoot = path.resolve(workspace);
  return files.map((file) => readCodexSessionSummary(file, workspaceRoot))
    .filter((session) => session && sessionMatchesWorkspace(session, workspaceRoot))
    .sort((a, b) => String(b.lastTimestamp || "").localeCompare(String(a.lastTimestamp || "")));
}

function listSessionFiles(root) {
  const out = [];
  function walk(dir, depth) {
    if (depth > 8) return;
    let entries = [];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full, depth + 1);
      else if (entry.isFile() && entry.name.endsWith(".jsonl")) out.push(full);
    }
  }
  walk(root, 0);
  return out;
}

function readCodexSessionSummary(file, workspaceRoot) {
  const text = safeReadLarge(file, 50 * 1024 * 1024);
  if (!text) return null;
  const session = {
    file,
    id: sessionIdFromFile(file),
    cwd: "",
    source: "",
    model: "",
    modelProvider: "",
    firstTimestamp: "",
    lastTimestamp: "",
    firstPrompt: "",
    lastAgentMessage: "",
    durationMs: 0,
    toolCalls: 0,
    toolNames: new Map(),
    usage: emptyUsage(),
    status: "unknown",
    failureMessage: "",
    warningMessages: []
  };
  for (const line of text.split(/\r?\n/)) {
    if (!line) continue;
    let item = null;
    try {
      item = JSON.parse(line);
    } catch {
      continue;
    }
    if (item.timestamp) {
      session.firstTimestamp ||= item.timestamp;
      session.lastTimestamp = item.timestamp;
    }
    const payload = item.payload || {};
    if (item.type === "session_meta") {
      session.id = payload.id || session.id;
      session.cwd = payload.cwd || session.cwd;
      session.source = payload.source || session.source;
      session.model = payload.model || session.model;
      session.modelProvider = payload.model_provider || session.modelProvider;
    } else if (item.type === "turn_context") {
      session.cwd = payload.cwd || session.cwd;
      session.model = payload.model || session.model;
    } else if (item.type === "event_msg" && payload.type === "user_message") {
      session.firstPrompt ||= redactReportText(payload.message).slice(0, 160);
    } else if (item.type === "event_msg" && payload.type === "agent_message") {
      session.lastAgentMessage = redactReportText(payload.message).slice(0, 160);
    } else if (item.type === "event_msg" && payload.type === "task_complete") {
      session.durationMs = Number(payload.duration_ms || session.durationMs || 0);
      if (session.status !== "failed") session.status = "succeeded";
    } else if (item.type === "event_msg" && payload.type === "token_count") {
      session.usage = normalizeUsage(payload.info?.total_token_usage || session.usage);
    } else if (item.type === "response_item" && payload.type === "function_call") {
      session.toolCalls += 1;
      const name = String(payload.name || "unknown");
      session.toolNames.set(name, (session.toolNames.get(name) || 0) + 1);
    }
    const eventState = classifyCodexSessionEvent(item, payload);
    if (eventState.status === "failed") {
      session.status = "failed";
      session.failureMessage ||= eventState.message;
    } else if (eventState.status === "warning" && eventState.message) {
      session.warningMessages.push(eventState.message);
    }
  }
  if (session.status === "unknown" && session.warningMessages.length) session.status = "warning";
  session.toolNames = [...session.toolNames.entries()].sort((a, b) => b[1] - a[1]);
  session.workspaceRelFile = slash(path.relative(path.join(os.homedir(), ".codex"), file));
  session.workspaceMatched = sessionMatchesWorkspace(session, workspaceRoot);
  return session;
}

function classifyCodexSessionEvent(item, payload) {
  const itemType = String(item.type || "");
  const payloadType = String(payload.type || "");
  if (itemType === "turn.failed" || payloadType === "turn_failed" || payloadType === "task_failed") {
    return { status: "failed", message: shortSessionMessage(payload.error?.message || payload.message || item.error?.message || item.message) };
  }
  if (itemType === "error" || payloadType === "error") {
    return { status: "warning", message: shortSessionMessage(payload.message || item.message || payload.error?.message || item.error?.message) };
  }
  if (payload.error?.message) {
    return { status: "failed", message: shortSessionMessage(payload.error.message) };
  }
  return { status: "", message: "" };
}

function shortSessionMessage(value) {
  return redactReportText(value).slice(0, 180);
}

function redactReportText(value) {
  return sanitizeReportText(redactText(String(value || "")).text).replace(/\s+/g, " ").trim();
}

function sanitizeReportText(value) {
  let text = String(value || "");
  text = text
    .replace(/\/Users\/<user>(?=\/|\b)/g, "~")
    .replace(/\/home\/<user>(?=\/|\b)/g, "~")
    .replace(/\b[A-Za-z]:\\Users\\<user>(?=\\|\b)/g, "~");
  for (const root of knownTmpRoots()) {
    const normalized = slash(root).replace(/\/$/, "");
    const pattern = new RegExp(`${escapeRegExp(normalized)}(?=\\/|\\b)`, "g");
    text = text.replace(pattern, "<tmp>");
  }
  return text;
}

function sessionMatchesWorkspace(session, workspaceRoot) {
  if (!session.cwd) return false;
  const cwd = path.resolve(session.cwd);
  return cwd === workspaceRoot || cwd.startsWith(workspaceRoot + path.sep);
}

function normalizeUsage(value) {
  const usage = emptyUsage();
  for (const key of Object.keys(usage)) usage[key] = Number(value?.[key] || 0);
  if (!usage.total_tokens && (usage.input_tokens || usage.output_tokens)) {
    usage.total_tokens = usage.input_tokens + usage.output_tokens;
  }
  return usage;
}

function emptyUsage() {
  return {
    input_tokens: 0,
    cached_input_tokens: 0,
    output_tokens: 0,
    reasoning_output_tokens: 0,
    total_tokens: 0
  };
}

function sessionIdFromFile(file) {
  const match = path.basename(file).match(/(019[a-z0-9-]+)\.jsonl$/i);
  return match ? match[1] : path.basename(file, ".jsonl");
}

function renderCodexSessionUsageReport({ context, codexHome, sessions, days, requestedSessionIds = [], missingSessionIds = [] }) {
  const rows = sessions.map((session) => {
    const usage = session.usage;
    return `| ${formatDateTime(session.firstTimestamp)} | \`${session.id}\` | ${escapeTable(session.source || "-")} | ${escapeTable(session.status || "unknown")} | ${formatNumber(usage.total_tokens)} | ${formatNumber(usage.input_tokens)} | ${formatNumber(usage.cached_input_tokens)} | ${formatNumber(usage.output_tokens)} | ${formatNumber(usage.reasoning_output_tokens)} | ${formatNumber(session.toolCalls)} | ${formatDuration(session.durationMs)} | ${escapeTable(session.failureMessage || "-")} | ${escapeTable(session.firstPrompt || "-")} |`;
  }).join("\n") || "| - | - | - | - | - | - | - | - | - | - | - | - | - |";
  const totals = sessions.reduce((acc, session) => {
    for (const [key, value] of Object.entries(session.usage)) acc[key] = (acc[key] || 0) + Number(value || 0);
    acc.toolCalls += session.toolCalls;
    if (session.status === "failed") acc.failedSessions += 1;
    else if (session.status === "warning") acc.warningSessions += 1;
    return acc;
  }, { ...emptyUsage(), toolCalls: 0, failedSessions: 0, warningSessions: 0 });
  const topTools = topSessionTools(sessions);
  const requestedLine = requestedSessionIds.length
    ? `\n筛选 session：${requestedSessionIds.map((id) => `\`${id}\``).join(", ")}\n`
    : "";
  const missingLine = missingSessionIds.length
    ? `\n未找到 session：${missingSessionIds.map((id) => `\`${id}\``).join(", ")}\n`
    : "";
  const comparison = renderSelectedSessionComparison(sessions, requestedSessionIds.length >= 2);
  return `# Codex session token 统计

生成时间：${new Date().toISOString()}

工作区：\`.\`

Codex home：\`${slash(path.relative(context.workspace, codexHome)) || codexHome}\`

时间窗口：最近 ${days} 天
${requestedLine}${missingLine}

## 汇总

| 指标 | 数值 |
|---|---:|
| sessions | ${formatNumber(sessions.length)} |
| total tokens | ${formatNumber(totals.total_tokens)} |
| input tokens | ${formatNumber(totals.input_tokens)} |
| cached input tokens | ${formatNumber(totals.cached_input_tokens)} |
| output tokens | ${formatNumber(totals.output_tokens)} |
| reasoning output tokens | ${formatNumber(totals.reasoning_output_tokens)} |
| tool calls | ${formatNumber(totals.toolCalls)} |
| failed sessions | ${formatNumber(totals.failedSessions)} |
| warning sessions | ${formatNumber(totals.warningSessions)} |

## 会话明细

| 开始时间 | session | source | status | total | input | cached input | output | reasoning | tools | 耗时 | error | prompt |
|---|---|---|---|---:|---:|---:|---:|---:|---:|---:|---|---|
${rows}
${comparison}

## 工具调用分布

| 工具 | 次数 |
|---|---:|
${topTools}

## A/B 使用方式

1. A 组和 B 组都从同一个 workspace 打开 Codex。
2. 任务结束后运行 \`ai-context-kit codex-mem sessions --workspace .\`。
3. 按 session id 对比 total/input/cached/output/reasoning/tool calls。
4. 质量检查通过后，再把 token 变化当作有效结果。
`;
}

function renderSelectedSessionComparison(sessions, enabled) {
  if (!enabled || sessions.length < 2) return "";
  const baseline = sessions[0];
  const rows = sessions.slice(1).map((session) => {
    const usage = session.usage;
    const baseUsage = baseline.usage;
    return `| \`${session.id}\` | ${formatNumber(usage.total_tokens)} | ${formatDelta(usage.total_tokens, baseUsage.total_tokens)} | ${formatDelta(usage.input_tokens, baseUsage.input_tokens)} | ${formatDelta(usage.cached_input_tokens, baseUsage.cached_input_tokens)} | ${formatDelta(usage.output_tokens, baseUsage.output_tokens)} | ${formatDelta(usage.reasoning_output_tokens, baseUsage.reasoning_output_tokens)} | ${formatDelta(session.toolCalls, baseline.toolCalls)} | ${formatDurationDelta(session.durationMs, baseline.durationMs)} |`;
  }).join("\n");
  return `

## 选中会话对比

基准 session：\`${baseline.id}\`

| session | total | total delta | input delta | cached input delta | output delta | reasoning delta | tools delta | duration delta |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
${rows}
`;
}

function writeCodexExecEventsReport(context, opts) {
  const eventFiles = normalizeExecEventFiles(opts);
  if (!eventFiles.length) fail("codex-mem exec-events requires --events <events.jsonl> or --input <events.jsonl>");
  const summaries = eventFiles.map((file) => readCodexExecEventsSummary(file));
  const outPath = path.resolve(opts.output || path.join(context.workspace, "docs", "codex-exec-events.md"));
  writeFile(outPath, renderCodexExecEventsReport({ context, eventFiles, summaries }), opts);
}

function normalizeExecEventFiles(opts) {
  const values = [];
  if (opts.input) values.push(opts.input);
  for (const value of opts.eventFiles || []) values.push(value);
  const out = [];
  for (const value of values) {
    for (const part of String(value || "").split(",")) {
      const item = part.trim();
      if (item) out.push(path.resolve(item));
    }
  }
  return unique(out);
}

function readCodexExecEventsSummary(file) {
  const text = safeReadLarge(file, 50 * 1024 * 1024);
  if (!text) {
    return {
      file,
      status: "missing",
      threadId: "",
      events: 0,
      turns: 0,
      errors: [],
      mcpCalls: 0,
      toolCalls: 0,
      usage: emptyUsage(),
      toolNames: new Map(),
      lastMessage: "events file could not be read"
    };
  }
  const summary = {
    file,
    status: "unknown",
    threadId: "",
    events: 0,
    turns: 0,
    turnCompleted: 0,
    turnFailed: 0,
    errors: [],
    warnings: [],
    mcpCalls: 0,
    toolCalls: 0,
    usage: emptyUsage(),
    toolNames: new Map(),
    firstTimestamp: "",
    lastTimestamp: "",
    lastMessage: ""
  };
  const mcpIds = new Set();
  const toolIds = new Set();
  for (const line of text.split(/\r?\n/)) {
    if (!line) continue;
    let event = null;
    try {
      event = JSON.parse(line);
    } catch {
      summary.warnings.push("unparseable JSONL line");
      continue;
    }
    summary.events += 1;
    if (event.timestamp) {
      summary.firstTimestamp ||= event.timestamp;
      summary.lastTimestamp = event.timestamp;
    }
    const type = String(event.type || "");
    const payload = event.payload || {};
    const item = event.item || payload.item || {};
    const itemType = String(item.type || payload.type || "");
    if (type === "thread.started") summary.threadId = event.thread_id || payload.thread_id || summary.threadId;
    if (type === "turn.started") summary.turns += 1;
    if (type === "turn.completed") {
      summary.turnCompleted += 1;
      if (summary.status !== "failed") summary.status = "succeeded";
      summary.usage = mergeUsage(summary.usage, normalizeUsage(event.usage || payload.usage || {}));
    }
    if (type === "turn.failed") {
      summary.turnFailed += 1;
      summary.status = "failed";
      pushExecError(summary, event.error?.message || payload.error?.message || event.message || payload.message);
    }
    if (type === "error") {
      pushExecError(summary, event.message || payload.message || event.error?.message || payload.error?.message);
      if (summary.status === "unknown") summary.status = "warning";
    }
    if (itemType === "mcp_tool_call") {
      const id = String(item.id || event.id || `${summary.events}:${item.tool || "mcp"}`);
      const isNew = !mcpIds.has(id);
      mcpIds.add(id);
      if (isNew) addToolName(summary.toolNames, item.tool || `${item.server || "mcp"}/unknown`);
      if (item.error) pushExecError(summary, item.error?.message || item.error);
    } else if (itemType.includes("tool_call") || itemType === "function_call" || itemType === "command_execution") {
      const id = String(item.id || event.id || `${summary.events}:${item.name || item.tool || "tool"}`);
      const isNew = !toolIds.has(id);
      toolIds.add(id);
      if (isNew) addToolName(summary.toolNames, commandExecutionToolName(item) || item.name || item.tool || itemType);
      if (item.error) pushExecError(summary, item.error?.message || item.error);
    }
    if (itemType === "agent_message" || payload.type === "agent_message") {
      summary.lastMessage = shortExecEventMessage(item.text || payload.message || "");
    }
    if (type !== "turn.completed" && (event.usage || payload.usage || payload.info?.total_token_usage)) {
      summary.usage = mergeUsage(summary.usage, normalizeUsage(event.usage || payload.usage || payload.info?.total_token_usage || {}));
    }
  }
  summary.mcpCalls = mcpIds.size;
  summary.toolCalls = toolIds.size;
  summary.toolNames = [...summary.toolNames.entries()].sort((a, b) => b[1] - a[1]);
  if (summary.status === "unknown" && summary.errors.length) summary.status = "warning";
  return summary;
}

function mergeUsage(a, b) {
  const out = emptyUsage();
  for (const key of Object.keys(out)) out[key] = Number(a?.[key] || 0) + Number(b?.[key] || 0);
  return out;
}

function addToolName(map, name) {
  const key = String(name || "unknown");
  map.set(key, (map.get(key) || 0) + 1);
}

function commandExecutionToolName(item) {
  if (String(item?.type || "") !== "command_execution") return "";
  const command = String(item.command || "").trim();
  if (!command) return "command_execution";
  const shellMatch = command.match(/^\/bin\/(?:zsh|bash|sh)\s+-lc\s+(.+)$/);
  const body = shellMatch ? shellMatch[1].trim() : command;
  const unquoted = body.replace(/^['"]|['"]$/g, "");
  const parts = unquoted.split(/\s+/).filter(Boolean).slice(0, 3);
  if (parts[0]?.includes(path.sep)) parts[0] = path.basename(parts[0]);
  const head = parts.join(" ");
  return head ? `command_execution: ${head}` : "command_execution";
}

function pushExecError(summary, value) {
  const message = shortExecEventMessage(value);
  if (message) summary.errors.push(message);
}

function shortExecEventMessage(value) {
  const message = String(value || "").replace(/\s+/g, " ").trim();
  return redactText(message).text.slice(0, 220);
}

function renderCodexExecEventsReport({ context, eventFiles, summaries }) {
  const totals = summaries.reduce((acc, summary) => {
    acc.events += summary.events;
    acc.turns += summary.turns;
    acc.mcpCalls += summary.mcpCalls;
    acc.toolCalls += summary.toolCalls;
    if (summary.status === "succeeded") acc.succeeded += 1;
    else if (summary.status === "failed") acc.failed += 1;
    else if (summary.status === "warning") acc.warning += 1;
    for (const [key, value] of Object.entries(summary.usage || {})) acc.usage[key] = (acc.usage[key] || 0) + Number(value || 0);
    return acc;
  }, { events: 0, turns: 0, mcpCalls: 0, toolCalls: 0, succeeded: 0, failed: 0, warning: 0, usage: emptyUsage() });
  const rows = summaries.map((summary) => {
    const usage = summary.usage || emptyUsage();
    return `| ${escapeTable(displayPathForReport(context, summary.file))} | ${escapeTable(summary.threadId || "-")} | ${escapeTable(summary.status)} | ${formatNumber(summary.events)} | ${formatNumber(summary.mcpCalls)} | ${formatNumber(summary.toolCalls)} | ${formatNumber(usage.total_tokens)} | ${formatNumber(usage.input_tokens)} | ${formatNumber(usage.output_tokens)} | ${formatNumber(usage.reasoning_output_tokens)} | ${escapeTable(summary.errors[summary.errors.length - 1] || "-")} |`;
  }).join("\n") || "| - | - | - | - | - | - | - | - | - | - | - |";
  const toolRows = topExecEventTools(summaries);
  const comparison = renderExecEventComparison(context, summaries);
  return `# Codex exec events 摘要

生成时间：${new Date().toISOString()}

工作区：\`.\`

输入文件：${eventFiles.map((file) => `\`${escapeInline(displayPathForReport(context, file))}\``).join(", ")}

## 汇总

| 指标 | 数值 |
|---|---:|
| event files | ${formatNumber(summaries.length)} |
| succeeded files | ${formatNumber(totals.succeeded)} |
| failed files | ${formatNumber(totals.failed)} |
| warning files | ${formatNumber(totals.warning)} |
| events | ${formatNumber(totals.events)} |
| turns | ${formatNumber(totals.turns)} |
| MCP calls | ${formatNumber(totals.mcpCalls)} |
| tool calls | ${formatNumber(totals.toolCalls)} |
| total tokens | ${formatNumber(totals.usage.total_tokens)} |
| input tokens | ${formatNumber(totals.usage.input_tokens)} |
| output tokens | ${formatNumber(totals.usage.output_tokens)} |
| reasoning output tokens | ${formatNumber(totals.usage.reasoning_output_tokens)} |

## 文件明细

| events file | thread | status | events | MCP calls | tool calls | total | input | output | reasoning | last error |
|---|---|---|---:|---:|---:|---:|---:|---:|---:|---|
${rows}

${comparison}

## 工具与 MCP 分布

| tool | calls |
|---|---:|
${toolRows}

## 记录规则

- 这份报告来自 \`codex exec --json\` 输出事件，不替代源码阅读、测试或 session token 报告。
- status 为 failed 或 warning 的文件只能作为执行失败证据，不能计入真实任务成功样本。
- 错误消息已使用本地规则脱敏；共享前仍需人工复查。
`;
}

function renderExecEventComparison(context, summaries) {
  if (summaries.length < 2) return "";
  const baseline = summaries[0];
  const baseUsage = baseline.usage || emptyUsage();
  const rows = summaries.slice(1).map((summary) => {
    const usage = summary.usage || emptyUsage();
    return `| ${escapeTable(displayPathForReport(context, summary.file))} | ${escapeTable(summary.status)} | ${formatNumber(usage.total_tokens)} | ${formatDelta(usage.total_tokens, baseUsage.total_tokens)} | ${formatDelta(usage.input_tokens, baseUsage.input_tokens)} | ${formatDelta(usage.output_tokens, baseUsage.output_tokens)} | ${formatDelta(usage.reasoning_output_tokens, baseUsage.reasoning_output_tokens)} | ${formatDelta(summary.mcpCalls, baseline.mcpCalls)} | ${formatDelta(summary.toolCalls, baseline.toolCalls)} | ${formatDelta(summary.events, baseline.events)} |`;
  }).join("\n");
  return `## 事件文件对比

基准文件：\`${escapeInline(displayPathForReport(context, baseline.file))}\`

| events file | status | total | total delta | input delta | output delta | reasoning delta | MCP delta | tool delta | event delta |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
${rows}

说明：这段只比较 raw event 摘要，第一个输入文件作为基准；任务质量仍以源码阅读、验证结果和真实任务记录为准。`;
}

const REAL_TASK_CATEGORIES = [
  { id: "backend-bug", label: "后端 bug" },
  { id: "miniapp-integration", label: "小程序联调" },
  { id: "cross-end-field", label: "跨端字段问题" }
];

function writeRealTaskAuditReport(context, opts) {
  const outPath = path.resolve(opts.output || path.join(context.workspace, "docs", "ai-context-kit-real-task-ab-audit.md"));
  const dir = path.join(context.workspace, "docs", "real-task-ab");
  const files = listRealTaskMarkdownFiles(dir);
  const items = files.map((file) => readRealTaskAuditItem(context, file));
  const records = items.filter((item) => item.hasConclusion);
  const supporting = items.filter((item) => !item.hasConclusion);
  writeFile(outPath, renderRealTaskAuditReport({ context, dir, files, records, supporting }), opts);
}

function listRealTaskMarkdownFiles(dir) {
  let entries = [];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => path.join(dir, entry.name))
    .sort();
}

function readRealTaskAuditItem(context, file) {
  const text = safeReadLarge(file, 5 * 1024 * 1024);
  const countedAnswer = findMarkdownTableValue(text, (label) => label.includes("是否计入") && label.includes("真实任务"));
  const categoryAnswer = findMarkdownTableValue(text, (label) => label === "计入哪一类");
  const taskType = findMarkdownTableValue(text, (label) => label === "Task type");
  const recordId = findMarkdownTableValue(text, (label) => label === "Record ID");
  const category = normalizeRealTaskCategory(categoryAnswer || taskType);
  const counted = isYesAnswer(countedAnswer);
  return {
    file,
    recordId: stripMarkdownInline(recordId) || path.basename(file, ".md"),
    hasConclusion: Boolean(countedAnswer),
    countedAnswer: stripMarkdownInline(countedAnswer) || "-",
    counted,
    category,
    categoryAnswer: stripMarkdownInline(categoryAnswer || taskType) || "-",
    missedFewer: stripMarkdownInline(findMarkdownTableValue(text, (label) => label.includes("减少漏项"))) || "-",
    fewerTokens: stripMarkdownInline(findMarkdownTableValue(text, (label) => label.includes("减少 token") || label.includes("减少token"))) || "-",
    qualityDown: stripMarkdownInline(findMarkdownTableValue(text, (label) => label.includes("质量是否下降"))) || "-",
    nextVerification: stripMarkdownInline(findMarkdownTableValue(text, (label) => label.includes("后续验证"))) || "-",
    status: realTaskAuditStatus({ text, countedAnswer, counted, category }),
    processWarnings: realTaskProcessWarnings({ text, category })
  };
}

function renderRealTaskAuditReport({ context, dir, files, records, supporting }) {
  const counted = records.filter((item) => item.counted && item.category);
  const countedByCategory = new Map(REAL_TASK_CATEGORIES.map((item) => [item.id, []]));
  for (const item of counted) countedByCategory.get(item.category)?.push(item);
  const missingCategories = REAL_TASK_CATEGORIES.filter((item) => !countedByCategory.get(item.id)?.length);
  const processWarnings = records.flatMap((item) => item.processWarnings.map((warning) => ({ item, warning })));
  const categoryRows = REAL_TASK_CATEGORIES.map((category) => {
    const items = countedByCategory.get(category.id) || [];
    const status = items.length ? "done" : "missing";
    const names = items.length ? items.map((item) => `\`${escapeInline(displayPathForReport(context, item.file))}\``).join(", ") : "-";
    return `| \`${category.id}\` | ${category.label} | ${status} | ${names} |`;
  }).join("\n");
  const recordRows = records.length
    ? records.map((item) => `| \`${escapeInline(displayPathForReport(context, item.file))}\` | ${escapeTable(item.recordId)} | ${escapeTable(item.countedAnswer)} | ${escapeTable(item.categoryAnswer)} | ${escapeTable(item.status)} | ${escapeTable(item.missedFewer)} | ${escapeTable(item.fewerTokens)} | ${escapeTable(item.qualityDown)} | ${escapeTable(item.nextVerification)} |`).join("\n")
    : "| - | - | - | - | - | - | - | - | - |";
  const supportingRows = supporting.length
    ? supporting.map((item) => `| \`${escapeInline(displayPathForReport(context, item.file))}\` | missing conclusion |`).join("\n")
    : "| - | - |";
  const processWarningRows = processWarnings.length
    ? processWarnings.map(({ item, warning }) => `| \`${escapeInline(displayPathForReport(context, item.file))}\` | ${escapeTable(item.categoryAnswer)} | ${escapeTable(warning)} |`).join("\n")
    : "| - | - | - |";
  return `# ai-context-kit 真实任务 A/B 审计

生成时间：${new Date().toISOString()}

工作区：\`.\`

记录目录：\`${escapeInline(displayPathForReport(context, dir))}\`

## 汇总

| 指标 | 数值 |
|---|---:|
| markdown files | ${formatNumber(files.length)} |
| candidate records | ${formatNumber(records.length)} |
| supporting files | ${formatNumber(supporting.length)} |
| counted records | ${formatNumber(counted.length)} |
| missing categories | ${missingCategories.length ? missingCategories.map((item) => `\`${item.id}\``).join(", ") : "none"} |
| process warnings | ${formatNumber(processWarnings.length)} |

## 三类验证状态

| category | 中文 | status | counted records |
|---|---|---|---|
${categoryRows}

## 任务记录

| record file | record id | counted answer | category answer | status | B missed fewer | B fewer tokens | quality down | next verification |
|---|---|---|---|---|---|---|---|---|
${recordRows}

## 支撑材料

| file | status |
|---|---|
${supportingRows}

## 流程风险提示

| record file | category | warning |
|---|---|---|
${processWarningRows}

## 判定规则

- 只有带“是否计入三类真实任务验证”结论且答案为 \`yes\` 的记录，才进入 counted records。
- counted records 必须落在 \`backend-bug\`、\`miniapp-integration\`、\`cross-end-field\` 三类之一。
- session、exec-events、patch 等支撑材料不会单独计入任务验证。
- 后端单接口记录如果显示读取本地索引、宽 DTO 搜索或过深后续链路，审计会在“流程风险提示”里列出。
- 这份审计只检查记录是否满足计入声明；任务质量仍以记录中的源码阅读、验证命令和失败证据为准。
`;
}

function realTaskProcessWarnings({ text, category }) {
  if (category !== "backend-bug") return [];
  const body = String(text || "");
  const warnings = [];
  if (/(读了|读取了|read[^。\n|]*)(\s*`?)?\.codex-mem\/index\.jsonl/i.test(body)) {
    warnings.push("后端单接口记录显示读取了 `.codex-mem/index.jsonl`；已知仓库和方法后应改用 route/contract 命中与精确源码搜索。");
  }
  if (/(宽\s*DTO|宽泛[^。\n|]*DTO|全量[^。\n|]*DTO|DTO[^。\n|]*(宽泛|全量|搜索|扫描))/i.test(body)) {
    warnings.push("后端单接口记录显示有宽 DTO 搜索；应限制在已知 DTO 或已知 package。");
  }
  if (/(扩展到|扩展到了|过深|深入)[^。\n|]*(核销|write-off|OrderWriteOff|异步|回调|MQ|scheduler|队列)/i.test(body)) {
    warnings.push("后端单接口记录显示扩展到核销或异步后续链路；非完整生命周期任务只看能证明当前接口问题的一层。");
  }
  return [...new Set(warnings)];
}

function findMarkdownTableValue(text, predicate) {
  for (const line of String(text || "").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("|") || !trimmed.endsWith("|")) continue;
    if (/^\|\s*-+\s*\|/.test(trimmed)) continue;
    const cells = trimmed.slice(1, -1).split("|").map((cell) => cell.trim());
    if (cells.length < 2) continue;
    const label = stripMarkdownInline(cells[0]);
    if (predicate(label)) return cells[1];
  }
  return "";
}

function stripMarkdownInline(value) {
  return String(value || "")
    .replace(/`+/g, "")
    .replace(/^<|>$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isYesAnswer(value) {
  const answer = stripMarkdownInline(value).toLowerCase();
  if (!answer) return false;
  if (/^(no|n|false|否|不)/.test(answer)) return false;
  return /^(yes|y|true|是)/.test(answer);
}

function normalizeRealTaskCategory(value) {
  const text = stripMarkdownInline(value).toLowerCase();
  if (!text) return "";
  for (const item of REAL_TASK_CATEGORIES) {
    if (text.includes(item.id)) return item.id;
  }
  if (text.includes("后端")) return "backend-bug";
  if (text.includes("小程序")) return "miniapp-integration";
  if (text.includes("跨端") || text.includes("字段")) return "cross-end-field";
  return "";
}

function realTaskAuditStatus({ text, countedAnswer, counted, category }) {
  if (!countedAnswer) return "supporting";
  if (counted && category) return "counted";
  if (counted && !category) return "counted-missing-category";
  const body = String(text || "").toLowerCase();
  if (body.includes("out of credits") || body.includes("401") || body.includes("fail before tool use")) return "not counted: exec failed";
  if (body.includes("局部") || body.includes("partial")) return "not counted: partial evidence";
  return "not counted";
}

function displayPathForReport(context, file) {
  const abs = path.resolve(file);
  const rel = slash(path.relative(context.workspace, abs));
  if (rel && !rel.startsWith("..") && !path.isAbsolute(rel)) return rel;

  const home = path.resolve(os.homedir());
  if (abs === home) return "~";
  if (abs.startsWith(home + path.sep)) return `~/${slash(path.relative(home, abs))}`;

  const tmpRel = relativeToKnownTmp(abs);
  if (tmpRel !== null) return tmpRel ? `<tmp>/${tmpRel}` : "<tmp>";

  return `<external>/${path.basename(abs)}`;
}

function relativeToKnownTmp(abs) {
  for (const root of knownTmpRoots()) {
    if (abs === root) return "";
    if (abs.startsWith(root + path.sep)) return slash(path.relative(root, abs));
  }
  return null;
}

function knownTmpRoots() {
  return unique([os.tmpdir(), "/private/tmp", "/var/tmp", "/tmp"].filter(Boolean).map((item) => path.resolve(item)))
    .sort((a, b) => b.length - a.length);
}

function escapeInline(value) {
  return String(value || "").replace(/`/g, "\\`");
}

function topExecEventTools(summaries) {
  const map = new Map();
  for (const summary of summaries) {
    for (const [name, count] of summary.toolNames || []) map.set(name, (map.get(name) || 0) + count);
  }
  const rows = [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 16);
  return rows.length ? rows.map(([name, count]) => `| \`${escapeInline(name)}\` | ${formatNumber(count)} |`).join("\n") : "| - | - |";
}

function topSessionTools(sessions) {
  const map = new Map();
  for (const session of sessions) {
    for (const [name, count] of session.toolNames || []) {
      map.set(name, (map.get(name) || 0) + count);
    }
  }
  const rows = [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12);
  return rows.length ? rows.map(([name, count]) => `| \`${name}\` | ${formatNumber(count)} |`).join("\n") : "| - | - |";
}

function formatDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toISOString().replace("T", " ").replace(/\.\d{3}Z$/, "Z");
}

function formatDuration(ms) {
  const value = Number(ms || 0);
  if (!value) return "-";
  return `${(value / 1000).toFixed(1)}s`;
}

function formatDelta(after, before) {
  const delta = Number(after || 0) - Number(before || 0);
  const sign = delta > 0 ? "+" : delta < 0 ? "-" : "";
  if (!Number(before || 0)) return `${sign}${formatNumber(Math.abs(delta))} (baseline 0)`;
  const pct = Math.abs((delta / Number(before)) * 100);
  return `${sign}${formatNumber(Math.abs(delta))} (${sign}${pct.toFixed(1)}%)`;
}

function formatDurationDelta(afterMs, beforeMs) {
  const delta = Number(afterMs || 0) - Number(beforeMs || 0);
  const sign = delta > 0 ? "+" : delta < 0 ? "-" : "";
  if (!Number(beforeMs || 0)) return `${sign}${formatDuration(Math.abs(delta))} (baseline 0)`;
  const pct = Math.abs((delta / Number(beforeMs)) * 100);
  return `${sign}${formatDuration(Math.abs(delta))} (${sign}${pct.toFixed(1)}%)`;
}

function escapeTable(value) {
  return String(value || "").replace(/\|/g, "\\|").replace(/\r?\n/g, " ").slice(0, 180);
}

function escapeTableLong(value) {
  return String(value || "").replace(/\|/g, "\\|").replace(/\r?\n/g, " ").slice(0, 600);
}

function sum(values) {
  return values.reduce((total, value) => total + Number(value || 0), 0);
}

function writeTokenSavingsReport(context, opts) {
  if (opts.dryRun) {
    log("dry-run token measurement report");
    return;
  }
  const npxCommand = detectCommand("npx");
  if (!npxCommand) {
    fail("npx not found. Install Node.js/npm or install repomix and run the measurement manually.");
  }

  const encoding = opts.tokenEncoding || "o200k_base";
  const topFilesLen = Number.isFinite(opts.topFilesLen) && opts.topFilesLen > 0 ? opts.topFilesLen : 10;
  const outPath = path.resolve(opts.output || path.join(context.workspace, "docs", "ai-context-token-savings-measurement.md"));
  const tempPrefix = path.join(os.tmpdir(), `ai-context-kit-${Date.now()}`);

  const routingFiles = existingWorkspaceFiles(context.workspace, [
    "AGENTS.md",
    "docs/ai-context-workspace-map.md",
    "docs/ai-context-scope-report.md"
  ]);

  const parentBaselineFiles = listFiles(context.workspace).filter((rel) => isMeasurableBaselinePath(rel));
  const parent = runRepomixMeasure({
    name: "parent-baseline",
    cwd: context.workspace,
    files: parentBaselineFiles,
    output: `${tempPrefix}-parent-baseline.md`,
    encoding,
    topFilesLen: Math.max(topFilesLen, 20),
    npxCommand
  });

  const routing = runRepomixMeasure({
    name: "routing",
    cwd: context.workspace,
    files: routingFiles,
    output: `${tempPrefix}-routing.md`,
    encoding,
    topFilesLen,
    npxCommand
  });

  const repos = selectRepos(context, opts);
  const repoRows = [];
  for (const repo of repos) {
    const baselineFiles = repo.files
      .map((rel) => workspaceRelForRepoFile(repo, rel))
      .filter((rel) => isMeasurableRepoBaselinePath(rel, repo.rel));
    const leanFiles = existingWorkspaceFiles(context.workspace, leanContextFiles(repo));
    const indexFiles = existingWorkspaceFiles(context.workspace, fullIndexContextFiles(repo));

    const baseline = runRepomixMeasure({
      name: `${repo.name}-baseline`,
      cwd: context.workspace,
      files: baselineFiles,
      output: `${tempPrefix}-${repo.name}-baseline.md`,
      encoding,
      topFilesLen,
      npxCommand
    });
    const lean = runRepomixMeasure({
      name: `${repo.name}-lean`,
      cwd: context.workspace,
      files: leanFiles,
      output: `${tempPrefix}-${repo.name}-lean.md`,
      encoding,
      topFilesLen,
      npxCommand
    });
    const index = runRepomixMeasure({
      name: `${repo.name}-index`,
      cwd: context.workspace,
      files: indexFiles,
      output: `${tempPrefix}-${repo.name}-index.md`,
      encoding,
      topFilesLen,
      npxCommand
    });
    repoRows.push({ repo, baseline, lean, index });
  }

  writeFile(outPath, renderTokenSavingsReport({ context, parent, routing, repoRows, encoding, topFilesLen }), opts);
}

function runRepomixMeasure({ name, cwd, files, output, encoding, topFilesLen, npxCommand }) {
  const uniqueFiles = [...new Set(files)].sort();
  if (!uniqueFiles.length) {
    return { name, files: 0, tokens: 0, chars: 0, output, topFiles: [], ok: true, skipped: true };
  }
  log(`measure ${name}: ${uniqueFiles.length} files`);
  const args = [
    "--yes",
    "repomix@latest",
    "--stdin",
    "--output",
    output,
    "--style",
    "markdown",
    "--token-count-encoding",
    encoding,
    "--top-files-len",
    String(topFilesLen),
    "--no-security-check"
  ];
  const result = spawnSync(npxCommand, args, {
    cwd,
    input: `${uniqueFiles.join("\n")}\n`,
    encoding: "utf8",
    maxBuffer: 100 * 1024 * 1024
  });
  const combined = stripAnsi(`${result.stdout || ""}\n${result.stderr || ""}`);
  if (result.status !== 0) {
    fail(`repomix measurement failed for ${name}: ${formatToolFailure(result)}`);
  }
  return {
    name,
    files: parseSummaryNumber(combined, /Total Files:\s*([\d,]+)\s+files/),
    tokens: parseSummaryNumber(combined, /Total Tokens:\s*([\d,]+)\s+tokens/),
    chars: parseSummaryNumber(combined, /Total Chars:\s*([\d,]+)\s+chars/),
    output,
    topFiles: parseTopTokenFiles(combined),
    ok: true
  };
}

function parseSummaryNumber(text, regex) {
  const match = text.match(regex);
  return match ? Number(match[1].replace(/,/g, "")) : 0;
}

function parseTopTokenFiles(text) {
  const files = [];
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\s*\d+\.\s+(.+?)\s+\(([\d,]+)\s+tokens,\s+([\d,]+)\s+chars,\s+([^)]+)\)/);
    if (!match) continue;
    files.push({
      path: match[1].trim(),
      tokens: Number(match[2].replace(/,/g, "")),
      chars: Number(match[3].replace(/,/g, "")),
      share: match[4].trim()
    });
  }
  return files;
}

function renderTokenSavingsReport({ context, parent, routing, repoRows, encoding, topFilesLen }) {
  const repoBaselineTable = repoRows.map(({ repo, baseline }) => (
    `| \`${repo.name}\` | ${formatNumber(baseline.files)} | ${formatNumber(baseline.tokens)} | ${formatTempOutput(baseline.output)} |`
  )).join("\n") || "| - | - | - | - |";

  const savingsTable = repoRows.map(({ repo, baseline, lean, index }) => (
    `| \`${repo.name}\` | ${formatNumber(baseline.tokens)} | ${formatNumber(index.tokens)} | ${formatPct(index.tokens, parent.tokens)} | ${formatPct(index.tokens, baseline.tokens)} | ${formatNumber(lean.tokens)} | ${formatPct(lean.tokens, parent.tokens)} | ${formatPct(lean.tokens, baseline.tokens)} |`
  )).join("\n") || "| - | - | - | - | - | - | - | - |";

  const topFilesTable = parent.topFiles.length
    ? parent.topFiles.slice(0, topFilesLen).map((file, idx) => `| ${idx + 1} | \`${file.path}\` | ${formatNumber(file.tokens)} | ${file.share} |`).join("\n")
    : "| - | - | - | - |";

  return `# AI 上下文 token 测量报告

生成时间：${new Date().toISOString()}

## 判断

本报告用于对比“不使用上下文治理”和“使用父目录路由、轻量事实、完整索引”时的 token 规模。测量工具为 \`repomix@latest\`，tokenizer 为 \`${encoding}\`。

这些数字是可复现的上下文规模测量，不等同于某一次 Codex app 账单。实际账单还会受到对话长度、工具输出、缓存命中、模型和验证过程影响。

## 测量边界

默认排除：

${SENSITIVE_GLOBS.map((item) => `- \`${item}\``).join("\n")}
- \`AGENTS.md\`、\`project-facts/**\` 和 \`docs/ai-context-*.md\` 不进入“不使用方案”基线。
- \`node_modules/**\`、\`target/**\`、\`dist/**\`、\`build/**\`、\`unpackage/**\`、\`.codegraph/**\` 等目录不进入测量。

## 父目录全量基线

| 指标 | 数值 |
|---|---:|
| 文件数 | ${formatNumber(parent.files)} |
| tokens | ${formatNumber(parent.tokens)} |
| chars | ${formatNumber(parent.chars)} |
| 临时输出 | ${formatTempOutput(parent.output)} |

## 高 token 文件

| 排名 | 文件 | tokens | 占比 |
|---:|---|---:|---:|
${topFilesTable}

## 单仓基线

| 子仓库 | 文件数 | tokens | 输出文件 |
|---|---:|---:|---|
${repoBaselineTable}

## 使用方案后的上下文

父目录路由只读取 \`AGENTS.md\`、\`docs/ai-context-workspace-map.md\`、\`docs/ai-context-scope-report.md\`。

| 指标 | 数值 |
|---|---:|
| 文件数 | ${formatNumber(routing.files)} |
| tokens | ${formatNumber(routing.tokens)} |
| 相比父目录全量变化 | ${formatPct(routing.tokens, parent.tokens)} |

| 目标仓库 | 单仓基线 tokens | 完整索引 tokens | 相比父目录全量变化 | 相比单仓基线变化 | 轻量模式 tokens | 相比父目录全量变化 | 相比单仓基线变化 |
|---|---:|---:|---:|---:|---:|---:|---:|
${savingsTable}

## 使用建议

1. Codex app 可以打开父目录，但先读父目录 \`AGENTS.md\` 和工作区地图。
2. 普通任务只读目标仓库 \`AGENTS.md\`、\`project-facts/project.md\`、\`project-facts/context-boundary.md\`、\`project-facts/verification.md\`。
3. 接口、页面或字段映射问题先用 \`ai-context-kit contracts --query <endpoint-or-symbol>\` 或精确 \`rg\` 筛选索引，再检查请求 DTO、响应 DTO、DTO copy/mapper 与新旧接口路径。
4. 符号、类名、方法名再用 \`rg\` 或 CodeGraph 对单个子仓库查询。
5. 不把高 token SQL、minified JS、UI 库、构建产物作为普通排查入口。

## 复现命令

\`\`\`bash
ai-context-kit tokens --workspace .
\`\`\`
`;
}

function printSavingsSummary(context, opts) {
  const reportPath = tokenReportPath(context, opts);
  const report = parseTokenSavingsReport(reportPath);
  console.log(renderSavingsSummaryText(report));
}

function writeSavingsDashboard(context, opts) {
  const reportPath = tokenReportPath(context, opts);
  const report = parseTokenSavingsReport(reportPath);
  const outPath = path.resolve(opts.output || path.join(context.workspace, "docs", "ai-context-token-dashboard.md"));
  writeFile(outPath, renderSavingsDashboard(report), opts);
}

function printTokenStatus(context, opts) {
  const data = buildTokenStatusData(context);
  const text = opts.json ? JSON.stringify(data, null, 2) : renderTokenStatusText(data);
  if (opts.output) {
    writeFile(resolveWorkspaceOutput(context, opts.output), text + "\n", opts);
    return;
  }
  console.log(text);
}

function resolveWorkspaceOutput(context, output) {
  return path.isAbsolute(output) ? output : path.join(context.workspace, output);
}

function buildTokenStatusData(context) {
  const reportPath = tokenReportPath(context, {});
  const report = fs.existsSync(reportPath) ? parseTokenSavingsReport(reportPath) : null;
  const ledger = collectHookTokenStats(context);
  const sessionReport = path.join(context.workspace, "docs", "codex-session-usage.md");
  const dashboard = path.join(context.workspace, "docs", "ai-context-token-dashboard.md");
  const staticContext = report ? buildStaticTokenStatus(context, report) : {
    status: "not_run",
    report: null,
    generatedAt: null,
    parentTokens: 0,
    routingTokens: 0,
    routingChangeFromParent: "unknown",
    leanRepoTokens: { min: 0, max: 0 },
    fullIndexTokens: { min: 0, max: 0 },
    command: "ai-context-kit tokens --workspace <path> && ai-context-kit dashboard --workspace <path>"
  };
  const hookObserve = {
    status: ledger.exists ? "enabled" : "not_enabled",
    ledger: ledger.exists ? workspaceRelativePath(context, ledger.path) : null,
    events: ledger.eventCount,
    currentSession: {
      inputTokens: ledger.currentInputTokens,
      outputTokens: ledger.currentOutputTokens,
      largeOutputEvents: ledger.currentLargeEvents,
      compressedRefs: ledger.compressedEvents,
      projectedOutputAfterCompressionTokens: ledger.currentProjectedOutputTokens,
      estimatedOutputSavedTokens: ledger.currentEstimatedSavedTokens
    },
    command: ledger.exists ? null : "ai-context-kit codex-mem install-hooks --workspace <path> --mode observe"
  };
  return {
    generatedBy: `ai-context-kit ${VERSION}`,
    generatedAt: new Date().toISOString(),
    workspace: ".",
    workspaceName: path.basename(context.workspace),
    staticContext,
    hookObserve,
    reports: {
      staticDashboard: reportFileStatus(context, dashboard),
      codexSessionUsage: reportFileStatus(context, sessionReport),
      realSessionCommand: "ai-context-kit codex-mem sessions --workspace <path>"
    },
    notes: [
      "Static context savings measure context size, not a bill.",
      "Hook observe numbers are local estimates from tool input/output.",
      "Quality still needs source checks, contract checks and verification results."
    ]
  };
}

function buildStaticTokenStatus(context, report) {
  const bestLean = minNumber(report.repoRows.map((row) => row.leanTokens));
  const worstLean = maxNumber(report.repoRows.map((row) => row.leanTokens));
  const bestIndex = minNumber(report.repoRows.map((row) => row.indexTokens));
  const worstIndex = maxNumber(report.repoRows.map((row) => row.indexTokens));
  return {
    status: "measured",
    report: workspaceRelativePath(context, report.path),
    generatedAt: report.generatedAt,
    parentTokens: report.parentTokens,
    routingTokens: report.routingTokens,
    routingChangeFromParent: formatPct(report.routingTokens, report.parentTokens),
    leanRepoTokens: { min: bestLean, max: worstLean },
    fullIndexTokens: { min: bestIndex, max: worstIndex },
    command: null
  };
}

function reportFileStatus(context, file) {
  const exists = fs.existsSync(file);
  return {
    exists,
    path: exists ? workspaceRelativePath(context, file) : null
  };
}

function workspaceRelativePath(context, file) {
  const rel = slash(path.relative(context.workspace, file));
  return rel && !rel.startsWith("..") && !path.isAbsolute(rel) ? rel : displayPathForReport(context, file);
}

function renderTokenStatusText(data) {
  const lines = [
    "# AI context token status",
    "",
    `Workspace: ${data.workspace}`,
    `Generated: ${data.generatedAt}`,
    "",
    "## Static Context"
  ];
  if (data.staticContext.status === "measured") {
    lines.push(`- report: ${data.staticContext.report}`);
    lines.push(`- generated: ${data.staticContext.generatedAt}`);
    lines.push(`- parent baseline: ${formatNumber(data.staticContext.parentTokens)} tokens`);
    lines.push(`- routing context: ${formatNumber(data.staticContext.routingTokens)} tokens (${data.staticContext.routingChangeFromParent})`);
    lines.push(`- lean repo context: ${formatNumber(data.staticContext.leanRepoTokens.min)}-${formatNumber(data.staticContext.leanRepoTokens.max)} tokens`);
    lines.push(`- full index context: ${formatNumber(data.staticContext.fullIndexTokens.min)}-${formatNumber(data.staticContext.fullIndexTokens.max)} tokens`);
  } else {
    lines.push("- status: Not run");
    lines.push(`- command: ${data.staticContext.command}`);
  }
  lines.push("");
  lines.push("## Hook Observe");
  if (data.hookObserve.status === "enabled") {
    lines.push(`- ledger: ${data.hookObserve.ledger}`);
    lines.push(`- events: ${formatNumber(data.hookObserve.events)}`);
    lines.push(`- current session tool input estimate: ${formatNumber(data.hookObserve.currentSession.inputTokens)} tokens`);
    lines.push(`- current session tool output estimate: ${formatNumber(data.hookObserve.currentSession.outputTokens)} tokens`);
    lines.push(`- large output events: ${formatNumber(data.hookObserve.currentSession.largeOutputEvents)}`);
    lines.push(`- compressed refs: ${formatNumber(data.hookObserve.currentSession.compressedRefs)}`);
    lines.push(`- projected output after compression: ${formatNumber(data.hookObserve.currentSession.projectedOutputAfterCompressionTokens)} tokens`);
    lines.push(`- estimated output change: ${formatNumber(data.hookObserve.currentSession.estimatedOutputSavedTokens)} tokens`);
  } else {
    lines.push("- status: Not enabled");
    lines.push(`- command: ${data.hookObserve.command}`);
  }
  lines.push("");
  lines.push("## Reports");
  lines.push(`- static dashboard: ${data.reports.staticDashboard.exists ? data.reports.staticDashboard.path : "Not generated"}`);
  lines.push(`- Codex session usage: ${data.reports.codexSessionUsage.exists ? data.reports.codexSessionUsage.path : "Not generated"}`);
  lines.push(`- real session command: ${data.reports.realSessionCommand}`);
  lines.push("");
  lines.push("## Notes");
  for (const note of data.notes) lines.push(`- ${note}`);
  return lines.join("\n");
}

function collectHookTokenStats(context) {
  const ledgerPath = path.join(context.workspace, CODEX_MEM_DIR, "ledger.jsonl");
  const rawEvents = readJsonl(ledgerPath);
  const events = dedupeLedgerEvents(rawEvents);
  const lastSessionStart = lastIndexWhere(events, (event) => event.event === "SessionStart");
  const currentEvents = events
    .slice(lastSessionStart >= 0 ? lastSessionStart + 1 : 0)
    .filter((event) => event.event !== "Stop");
  const currentOutputTokens = sum(currentEvents.map((event) => Number(event.outputTokens || 0)));
  const currentProjectedOutputTokens = currentEvents.reduce((total, event) => {
    if (event.compressed && Number.isFinite(Number(event.compressedOutputTokens))) {
      return total + Number(event.compressedOutputTokens);
    }
    const eventThreshold = Number.isFinite(Number(event.threshold)) ? Number(event.threshold) : 8000;
    const outputTokens = Number(event.outputTokens || 0);
    return total + (outputTokens >= eventThreshold ? 1000 : outputTokens);
  }, 0);
  return {
    exists: fs.existsSync(ledgerPath),
    path: ledgerPath,
    eventCount: events.length,
    currentInputTokens: sum(currentEvents.map((event) => Number(event.inputTokens || 0))),
    currentOutputTokens,
    currentLargeEvents: currentEvents.filter((event) => event.largeOutput).length,
    compressedEvents: currentEvents.filter((event) => event.compressed && event.refPath).length,
    currentProjectedOutputTokens,
    currentEstimatedSavedTokens: Math.max(0, currentOutputTokens - currentProjectedOutputTokens)
  };
}

function lastIndexWhere(items, predicate) {
  for (let i = items.length - 1; i >= 0; i -= 1) {
    if (predicate(items[i], i)) return i;
  }
  return -1;
}

const AI_CONTEXT_TASK_LABELS = [
  "ai-context: onboard workspace",
  "ai-context: upgrade workspace context",
  "ai-context: token status",
  "ai-context: write token status json",
  "ai-context: measure static tokens",
  "ai-context: write token dashboard",
  "ai-context: refresh token reports",
  "ai-context: Codex session usage",
  "ai-context: install Codex observe hooks"
];

function writeEditorTasks(context, opts) {
  const target = path.join(context.workspace, ".vscode", "tasks.json");
  const existing = fs.existsSync(target) ? parseJsonLike(safeRead(target)) : null;
  if (fs.existsSync(target) && (!existing || typeof existing !== "object" || Array.isArray(existing))) {
    fail(`Could not parse existing VS Code tasks file. Edit manually or rerun after fixing JSON: ${target}`);
  }
  const tasksDoc = existing || { version: "2.0.0", tasks: [] };
  if (!Array.isArray(tasksDoc.tasks)) tasksDoc.tasks = [];
  const labels = new Set(AI_CONTEXT_TASK_LABELS);
  const preserved = tasksDoc.tasks.filter((task) => !labels.has(task?.label));
  tasksDoc.version = tasksDoc.version || "2.0.0";
  tasksDoc.tasks = [...preserved, ...renderAiContextEditorTasks()];
  writeFile(target, JSON.stringify(tasksDoc, null, 2) + "\n", opts);
}

function renderAiContextEditorTasks() {
  const workspaceArg = "${workspaceFolder}";
  return [
    shellTask("ai-context: onboard workspace", ["onboard", "--workspace", workspaceArg], "Prepare missing project-facts and low-token workflow artifacts."),
    shellTask("ai-context: upgrade workspace context", ["upgrade", "--workspace", workspaceArg], "Refresh generated maps, reports and local route/search indexes."),
    shellTask("ai-context: token status", ["token-status", "--workspace", workspaceArg], "Show AI context token status in the editor terminal."),
    shellTask("ai-context: write token status json", ["token-status", "--workspace", workspaceArg, "--json", "--output", "docs/ai-context-token-status.json"], "Write docs/ai-context-token-status.json for editor panels and scripts."),
    shellTask("ai-context: measure static tokens", ["tokens", "--workspace", workspaceArg], "Measure static context token savings."),
    shellTask("ai-context: write token dashboard", ["dashboard", "--workspace", workspaceArg], "Write docs/ai-context-token-dashboard.md from the latest token report."),
    {
      label: "ai-context: refresh token reports",
      dependsOrder: "sequence",
      dependsOn: [
        "ai-context: measure static tokens",
        "ai-context: write token dashboard",
        "ai-context: write token status json"
      ],
      problemMatcher: []
    },
    shellTask("ai-context: Codex session usage", ["codex-mem", "sessions", "--workspace", workspaceArg], "Generate Codex session token usage report."),
    shellTask("ai-context: install Codex observe hooks", ["codex-mem", "install-hooks", "--workspace", workspaceArg, "--mode", "observe"], "Install Codex observe hooks for end-of-turn token snapshots.")
  ];
}

function shellTask(label, args, detail) {
  return {
    label,
    type: "shell",
    command: "ai-context-kit",
    args,
    detail,
    problemMatcher: []
  };
}

function printAutomationPrompt(context, opts) {
  const type = String(opts.type || "skill-feedback-candidate").trim();
  if (type === "skill-feedback-candidate" || type === "business-skill-feedback-candidate") {
    console.log(renderSkillFeedbackCandidateAutomationPrompt(context));
    return;
  }
  if (type === "skill-feedback-review" || type === "maintainer-skill-feedback-review") {
    console.log(renderSkillFeedbackReviewAutomationPrompt());
    return;
  }
  fail(`Unknown automation prompt type: ${type}`);
}

function renderSkillFeedbackCandidateAutomationPrompt(context) {
  const repoHints = context.repos.length
    ? context.repos.map((repo) => `- ${repo.name}: ${repoRole(repo)}; hints ${repoIdentityHints(repo)}; rel ${repo.rel}`).join("\n")
    : "- No child Git repositories were detected from the current automation workspace.";

  return `你是在业务项目或业务父目录里运行的每日 Skill 反哺候选任务。目标是整理候选，不修改共享 Skill、模板、脚本、CLI，也不改变任何项目事实的批准状态。

先自动定位候选应该属于哪个业务仓库，不要求用户提前指定子仓库路径。

已检测到的仓库线索：
${repoHints}

定位规则：
1. 如果 automation 的工作目录本身就是单个 Git 仓库，优先把它作为目标业务仓库。
2. 如果工作目录是业务父目录，先读父目录 AGENTS.md、docs/ai-context-workspace-map.md、docs/ai-context-scope-report.md 和 ai-context-kit doctor --workspace . 的结果；这些文件不存在时，按子目录中的 .git、package.json、pom.xml、go.mod、pages.json、README、project-facts/ 判断仓库角色。
3. 优先看当天新增或修改的证据：git status --short、今天的 git log --since=midnight --name-only、project-facts/changes/、project-facts/handover/、project-facts/skill-feedback/、docs/skill-performance-log.md、evidence.md、verification.md。
4. 结合文件路径、模块名、页面名、endpoint、Controller、DTO、API wrapper、包名、错误日志中的路径，判断候选属于哪个子仓库或哪条跨仓库链路。
5. 多个仓库都有独立证据时，分别写候选；证据无法明确归属，或两个候选仓库冲突时，只在最终报告列出待确认项，不要猜测写入某个仓库。

候选筛选规则：
- 只记录可以改进共享 Skill、项目事实模板、低 token 路由、CLI、hooks、CodeGraph/RAG/memory 使用方式的经验。
- 项目专属业务规则留在业务项目事实里，不写成共享 Skill 候选。
- 只有聊天、AI 总结或没有可追溯文件/命令时，状态写 needs-evidence。
- 有真实任务来源、证据路径和验证结果时，状态写 proposed。

隐私规则：
- 候选文件和每日摘要只写仓库相对路径、符号名、命令名、检查状态和已脱敏的短结论。
- 不要写入业务数据、用户数据、客户数据、生产数据、请求/响应正文、数据库行、生产日志原文、会话 trace 原文、stderr 原文或 Codex event payload 原文。
- 不要写入 API key、token、cookie、Authorization header、数据库密码、证书私钥或生产环境变量值。
- 需要引用日志、API 响应、stderr、Codex event 或任务 trace 时，先运行 ai-context-kit redact --input <raw-file> --output <redacted-file>；脱敏后仍无法确认安全的内容，只记录本地证据路径和摘要，不复制原文。
- 项目专属业务规则、价格、库存、风控、权限、运营策略只留在业务项目事实中，不进入共享 Skill 候选。

输出规则：
- 对每个明确归属的仓库，写入该仓库的 project-facts/skill-feedback/SFC-YYYYMMDD-short-name.md；目录不存在时可以创建。
- 每个候选必须包含 Candidate ID、Candidate status、Source task、Affected skill/tool、Observed useful behavior、Missing or misleading behavior、Evidence paths、Verification result、Privacy check、Applicability、Possible project-only rule、Suggested upstream change、Review。
- Verification result 只能写 Pass、Fail 或 Not run，不能省略。
- Review 初始保持 Pending。
- 没有候选时，不创建候选文件；在最终报告说明读取了哪些入口、为什么没有候选。
- 不要把本机绝对路径写进候选文件；需要路径时使用仓库相对路径。

结束时汇报：识别到的目标仓库、创建或更新的候选文件、needs-evidence 项、未运行的验证、需要人工确认的归属冲突。`;
}

function renderSkillFeedbackReviewAutomationPrompt() {
  return `你是在共享 Skill 仓库里运行的候选评审任务。目标是评审和整理候选，不直接把 AI 总结写进正式 Skill。

读取 docs/skill-feedback/、docs/skill-iteration-backlog.zh-CN.md、相关 evidence、AGENTS.md、README.md、docs/project-facts-governance.zh-CN.md 和 docs/adoption-guide.zh-CN.md。

评审规则：
1. 检查每个候选是否有真实任务来源、证据路径、验证结果、适用范围和 reviewer/owner 记录。
2. 区分通用工作流改进、项目专属业务规则、CLI/脚本缺陷、模板缺陷、低 token 路由缺口、CodeGraph/RAG/memory layer 候选。
3. 没有 Tool/library owner 审阅记录时，不要标 accepted；只能保持 proposed 或 needs-evidence。
4. 项目专属业务规则不进入共享 Skill，标 rejected 或要求留在目标项目 project-facts。
5. 只有 accepted 且证据充分的候选，才建议后续 PR 修改 skills/、template/、scripts/ 或 packages/ai-context-kit/。

输出规则：
- 可以更新 docs/skill-iteration-backlog.zh-CN.md 的状态、证据摘要和下一步建议。
- 不要直接修改正式 skills/、template/、scripts/ 或 CLI，除非当前任务明确要求进入实现阶段并且已有 owner 接受记录。
- 评审结果需要列出 proposed、needs-evidence、accepted、rejected、applied。
- 记录检查是否运行；未运行写 Not run。

结束时汇报：处理的候选数量、状态变化、需要补证据的项、可进入 PR 的项、未执行的检查。`;
}

function tokenReportPath(context, opts) {
  return path.resolve(opts.output && opts.output.endsWith(".md")
    ? opts.output
    : path.join(context.workspace, "docs", "ai-context-token-savings-measurement.md"));
}

function parseTokenSavingsReport(reportPath) {
  const text = safeRead(reportPath);
  if (!text) {
    fail(`Token report not found. Run ai-context-kit tokens --workspace <path> first: ${reportPath}`);
  }
  return {
    path: reportPath,
    generatedAt: (text.match(/生成时间：(.+)/) || [])[1] || "unknown",
    parentTokens: sectionMetric(text, "## 父目录全量基线", "tokens"),
    routingTokens: sectionMetric(text, "## 使用方案后的上下文", "tokens"),
    repoRows: parseSavingsRows(text)
  };
}

function renderSavingsSummaryText(report) {
  const bestLean = minNumber(report.repoRows.map((row) => row.leanTokens));
  const worstLean = maxNumber(report.repoRows.map((row) => row.leanTokens));
  const bestIndex = minNumber(report.repoRows.map((row) => row.indexTokens));
  const worstIndex = maxNumber(report.repoRows.map((row) => row.indexTokens));
  return [
    "# AI context savings summary",
    "",
    `Report: ${report.path}`,
    `Generated: ${report.generatedAt}`,
    `Parent baseline: ${formatNumber(report.parentTokens)} tokens`,
    `Routing context: ${formatNumber(report.routingTokens)} tokens (${formatPct(report.routingTokens, report.parentTokens)})`,
    `Lean repo context: ${formatNumber(bestLean)}-${formatNumber(worstLean)} tokens`,
    `Full index context: ${formatNumber(bestIndex)}-${formatNumber(worstIndex)} tokens`,
    "",
    "Repo details:",
    ...report.repoRows.map((row) => `- ${row.repo}: lean ${formatNumber(row.leanTokens)}, index ${formatNumber(row.indexTokens)}, single-repo baseline ${formatNumber(row.baselineTokens)}`)
  ].join("\n");
}

function renderSavingsDashboard(report) {
  const rows = report.repoRows.map((row) => (
    `| \`${row.repo}\` | ${formatNumber(row.baselineTokens)} | ${formatNumber(row.leanTokens)} | ${formatPct(row.leanTokens, row.baselineTokens)} | ${formatNumber(row.indexTokens)} | ${formatPct(row.indexTokens, row.baselineTokens)} |`
  )).join("\n") || "| - | - | - | - | - | - |";
  const bestLean = minNumber(report.repoRows.map((row) => row.leanTokens));
  const worstLean = maxNumber(report.repoRows.map((row) => row.leanTokens));
  const bestIndex = minNumber(report.repoRows.map((row) => row.indexTokens));
  const worstIndex = maxNumber(report.repoRows.map((row) => row.indexTokens));

  return `# AI 上下文节省看板

生成时间：${new Date().toISOString()}

数据来源：\`${slash(path.relative(path.dirname(report.path), report.path)) || "ai-context-token-savings-measurement.md"}\`

## 用户可感知数字

| 指标 | tokens |
|---|---:|
| 父目录全量基线 | ${formatNumber(report.parentTokens)} |
| 父目录路由 | ${formatNumber(report.routingTokens)} |
| 目标仓库轻量上下文 | ${formatNumber(bestLean)} 到 ${formatNumber(worstLean)} |
| 完整接口索引上下文 | ${formatNumber(bestIndex)} 到 ${formatNumber(worstIndex)} |

父目录路由相比父目录全量基线：${formatPct(report.routingTokens, report.parentTokens)}。

## 子仓库对比

| 目标仓库 | 单仓基线 | 轻量上下文 | 轻量节省 | 完整索引 | 完整索引节省 |
|---|---:|---:|---:|---:|---:|
${rows}

## 准确度保护

- 节省来自先选择主仓库、先读事实索引、再按需读源码，不来自省略必要代码。
- \`project-facts\` 和接口索引只用于导航；真正改 bug 前仍读取相关源码。
- 业务行为以源码、测试、运行结果和已批准需求为准。
- 高 token SQL、minified JS、构建产物、证书和配置文件不作为普通排查入口。
- 跨端问题只读取相关 endpoint、Controller、DTO、API wrapper、DTO copy/mapper，不扫描全部 sibling repo。
- 跨端结论需要说明是否检查了字段契约和新旧接口路径；未检查时直接写明。

## Codex 使用方式

1. 从父目录打开 Codex app 时，先读 \`AGENTS.md\` 和 \`docs/ai-context-workspace-map.md\`。
2. 任务开始后先选择一个主仓库。
3. 普通任务读取主仓库轻量上下文。
4. 接口、页面、字段映射问题先用 \`ai-context-kit contracts --query <endpoint-or-symbol>\` 或精确 \`rg\` 筛选索引，再检查请求 DTO、响应 DTO、DTO copy/mapper 与新旧接口路径。
5. 每周或重要改造后重新运行 \`ai-context-kit tokens\` 和 \`ai-context-kit dashboard\`。
`;
}

function sectionMetric(text, sectionTitle, metric) {
  const start = text.indexOf(sectionTitle);
  if (start < 0) return 0;
  const rest = text.slice(start);
  const nextSection = rest.slice(sectionTitle.length).search(/\n## /);
  const section = nextSection >= 0 ? rest.slice(0, sectionTitle.length + nextSection) : rest;
  const regex = new RegExp(`\\|\\s*${escapeRegExp(metric)}\\s*\\|\\s*([\\d,]+)\\s*\\|`);
  return parseSummaryNumber(section, regex);
}

function parseSavingsRows(text) {
  const rows = [];
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\| `([^`]+)` \| ([\d,]+) \| ([\d,]+) \| [^|]+ \| [^|]+ \| ([\d,]+) \|/);
    if (!match) continue;
    rows.push({
      repo: match[1],
      baselineTokens: Number(match[2].replace(/,/g, "")),
      indexTokens: Number(match[3].replace(/,/g, "")),
      leanTokens: Number(match[4].replace(/,/g, ""))
    });
  }
  return rows;
}

function minNumber(values) {
  const nums = values.filter((value) => Number.isFinite(value));
  return nums.length ? Math.min(...nums) : 0;
}

function maxNumber(values) {
  const nums = values.filter((value) => Number.isFinite(value));
  return nums.length ? Math.max(...nums) : 0;
}

function formatTempOutput(output) {
  if (!output) return "-";
  return `\`${path.basename(output)}\`（系统临时目录，不提交）`;
}

function workspaceRelForRepoFile(repo, rel) {
  if (repo.rel === ".") return rel;
  return slash(path.join(repo.rel, rel));
}

function leanContextFiles(repo) {
  return [
    "AGENTS.md",
    "docs/ai-context-workspace-map.md",
    "docs/ai-context-scope-report.md",
    workspaceRelForRepoFile(repo, "AGENTS.md"),
    workspaceRelForRepoFile(repo, "project-facts/project.md"),
    workspaceRelForRepoFile(repo, "project-facts/context-boundary.md"),
    workspaceRelForRepoFile(repo, "project-facts/verification.md")
  ];
}

function fullIndexContextFiles(repo) {
  const files = [...leanContextFiles(repo)];
  files.push("docs/ai-context-api-contract-map.md");
  if (repo.tech.includes("java")) {
    files.push(workspaceRelForRepoFile(repo, "project-facts/backend-route-controller-map.md"));
    files.push(workspaceRelForRepoFile(repo, "project-facts/api-contract-map.md"));
  }
  if (repo.tech.includes("uni-app") || repo.tech.includes("vue")) {
    files.push(workspaceRelForRepoFile(repo, "project-facts/api-endpoints.md"));
    files.push(workspaceRelForRepoFile(repo, "project-facts/applet-route-api-map.md"));
  }
  return files;
}

function existingWorkspaceFiles(workspace, files) {
  return files.filter((rel) => fs.existsSync(path.join(workspace, rel)));
}

function isMeasurableBaselinePath(rel) {
  const normalized = slash(rel);
  if (isSensitivePath(normalized)) return false;
  if (isGeneratedContextPath(normalized)) return false;
  if (normalized.startsWith("tools/ai-context-kit/")) return false;
  if (normalized.startsWith("packages/ai-context-kit/")) return false;
  return true;
}

function isMeasurableRepoBaselinePath(rel, repoRel) {
  const normalized = slash(rel);
  if (!isMeasurableBaselinePath(normalized)) return false;
  if (repoRel === ".") return true;
  return normalized.startsWith(`${slash(repoRel)}/`);
}

function isGeneratedContextPath(rel) {
  return rel === "AGENTS.md"
    || rel.endsWith("/AGENTS.md")
    || rel.includes("/project-facts/")
    || rel.startsWith("project-facts/")
    || rel.startsWith("docs/ai-context-")
    || rel.includes("/docs/ai-context-");
}

function isSensitivePath(rel) {
  const normalized = slash(rel);
  const base = path.posix.basename(normalized).toLowerCase();
  const lower = normalized.toLowerCase();
  if (base === ".env" || base.startsWith(".env.")) return true;
  if (base.endsWith(".pem") || base.endsWith(".key")) return true;
  if (lower.includes("/src/main/resources/cert/")) return true;
  if (/\/?src\/main\/resources\/application.*\.ya?ml$/.test(lower)) return true;
  if (lower.includes("secret") || lower.includes("credential") || lower.includes("token")) return true;
  return false;
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString("en-US");
}

function formatPct(after, before) {
  if (!before || !Number.isFinite(before) || !Number.isFinite(after)) return "-";
  const value = (1 - after / before) * 100;
  if (value >= 0) return `节省 ${value.toFixed(2)}%`;
  return `增加 ${Math.abs(value).toFixed(2)}%`;
}

function writeScopeReport(context, opts) {
  const reportPath = path.join(context.workspace, "docs", "ai-context-scope-report.md");
  const all = summarizeWorkspace(context.workspace);
  const repoRows = context.repos.map((repo) => {
    const share = all.sourceFiles ? ((repo.stats.files / all.sourceFiles) * 100).toFixed(1) : "0.0";
    return `| \`${repo.name}\` | ${repo.stats.files} | ${share}% | ${repo.stats.controllers} | ${repo.stats.vue} | ${repo.stats.mapperXml} |`;
  }).join("\n");

  const body = `# AI 上下文范围报告

生成时间：${new Date().toISOString()}

## 工作区

- 路径：\`.\`（执行命令时指定的 workspace）
- Git 仓库数量：${context.repos.length}
- 全工作区源码/配置文件数量估算：${all.sourceFiles}

## 子仓库范围

| Repo | Files | Share | Controllers | Vue | Mapper XML |
|---|---:|---:|---:|---:|---:|
${repoRows}

## 判断

- Codex app 可以打开父目录，但普通任务应先通过父目录 \`AGENTS.md\` 选择一个主仓库。
- 选择主仓库后，可以避免 Codex app 同时探索全部 ${all.sourceFiles} 个文件。
- 小程序任务选择小程序仓库时，默认不需要读取 Java 后端。
- 后端任务选择对应后端仓库时，默认不需要读取小程序页面和另一个后端。
- 跨端问题应通过 endpoint/route 矩阵读取相关链路，而不是扫描整个 sibling repo。
- 字段或路径结论需要检查请求 DTO、响应 DTO、DTO copy/mapper 和新旧接口路径。
`;
  ensureDir(path.dirname(reportPath), opts);
  writeGeneratedFile(reportPath, body, opts);
}

function summarizeWorkspace(workspace) {
  const files = listFiles(workspace).filter((f) => SOURCE_EXTENSIONS.has(path.extname(f)));
  return { sourceFiles: files.length };
}

function runCodegraphInit(context, opts) {
  if (!context.codegraph) {
    log("codegraph not found. Install with: npm install -g @colbymchenry/codegraph@0.9.9");
    return;
  }
  if (context.repos.length > 1 && !opts.repos?.length) {
    log("skip CodeGraph batch init for multi-repo workspace. Use --repos <name> to select one repo.");
    for (const repo of context.repos) log(`available repo: ${repo.name}`);
    return;
  }
  const repos = selectRepos(context, opts);
  const timeoutSeconds = Number.isFinite(opts.codegraphTimeout) && opts.codegraphTimeout > 0 ? opts.codegraphTimeout : 180;
  for (const repo of repos) {
    ensureGitignoreEntry(repo, ".codegraph/", opts);
    if (opts.dryRun) {
      log(`dry-run codegraph init ${repo.path}`);
      continue;
    }
    log(`codegraph init ${repo.path} (timeout ${timeoutSeconds}s)`);
    const result = spawnSync(context.codegraph, ["init", repo.path], { encoding: "utf8", timeout: timeoutSeconds * 1000 });
    if (result.status !== 0) {
      log(`codegraph init failed for ${repo.name}: ${formatToolFailure(result)}`);
      continue;
    }
    const status = spawnSync(context.codegraph, ["status", repo.path], { encoding: "utf8" });
    if (status.status === 0) {
      log(status.stdout.trim());
    }
  }
}

function formatToolFailure(result) {
  if (result.error) return String(result.error.message || result.error);
  if (result.signal) return `terminated by ${result.signal}`;
  const text = stripAnsi(`${result.stderr || ""}\n${result.stdout || ""}`).trim();
  return lastLines(text, 20) || `exit status ${result.status}`;
}

function stripAnsi(value) {
  return String(value).replace(/\x1b\[[0-9;?]*[A-Za-z]/g, "");
}

function lastLines(value, count) {
  return String(value).split(/\r?\n/).filter(Boolean).slice(-count).join("\n");
}

function ensureGitignoreEntry(repo, entry, opts) {
  const target = path.join(repo.path, ".gitignore");
  const current = safeRead(target);
  if (current.split(/\r?\n/).includes(entry)) return;
  const next = current.endsWith("\n") || current.length === 0 ? `${current}${entry}\n` : `${current}\n${entry}\n`;
  writeFile(target, next, opts);
}

function selectRepos(context, opts) {
  if (!opts.repos?.length) return context.repos;
  const wanted = new Set(opts.repos);
  return context.repos.filter((repo) => wanted.has(repo.name));
}

function workflowArtifacts(context) {
  const artifacts = [];
  const workspaceIsRepo = fs.existsSync(path.join(context.workspace, ".git"));
  const singleRepoWorkspace = workspaceIsRepo && context.repos.length === 1;
  const addWorkspace = (rel, label, group) => {
    artifacts.push({ rel, label, group, target: path.join(context.workspace, rel) });
  };
  const addRepo = (repo, rel, label, group) => {
    const workspaceRel = repo.rel === "." ? rel : slash(path.join(repo.rel, rel));
    artifacts.push({ rel: workspaceRel, label, group, target: path.join(repo.path, rel) });
  };

  if (!singleRepoWorkspace) {
    addWorkspace("AGENTS.md", "workspace routing instructions", "instructions");
    addWorkspace("docs/ai-context-workspace-map.md", "workspace map", "routing");
    addWorkspace("docs/ai-context-api-contract-map.md", "workspace API contract map", "contracts");
  }

  addWorkspace("docs/ai-context-scope-report.md", "context scope report", "routing");
  addWorkspace(path.join(CODEX_MEM_DIR, "index.jsonl"), "codex-mem search/route index", "memory");

  for (const repo of context.repos) {
    addRepo(repo, "AGENTS.md", "repository instructions", "instructions");
    addRepo(repo, "project-facts/project.md", "project facts", "facts");
    addRepo(repo, "project-facts/context-boundary.md", "context boundary", "facts");
    addRepo(repo, "project-facts/verification.md", "verification notes", "facts");
    if (repo.tech.includes("java")) {
      addRepo(repo, "project-facts/backend-route-controller-map.md", "backend route map", "contracts");
      addRepo(repo, "project-facts/api-contract-map.md", "backend DTO contract map", "contracts");
    }
    if (repo.tech.includes("uni-app") || repo.tech.includes("vue")) {
      addRepo(repo, "project-facts/api-endpoints.md", "frontend API endpoint map", "contracts");
      addRepo(repo, "project-facts/applet-route-api-map.md", "page to API map", "contracts");
    }
  }

  return artifacts.map((item) => {
    const exists = fs.existsSync(item.target);
    return { ...item, exists, issue: exists ? workflowArtifactIssue(item) : "" };
  });
}

function staleArtifactWarnings(context, rels = []) {
  const relSet = new Set((rels || []).map((rel) => slash(rel)));
  return workflowArtifacts(context)
    .filter((item) => item.exists && item.issue)
    .filter((item) => !relSet.size || relSet.has(slash(item.rel)))
    .map((item) => ({ rel: item.rel, issue: item.issue }));
}

function formatArtifactWarnings(warnings = [], style = "plain") {
  if (!warnings.length) return "";
  const lines = warnings.map((item) => `- ${item.rel}: ${item.issue}`);
  const action = `Run ${cliLabel()} init --workspace <path> to refresh generated maps and indexes before trusting these results.`;
  if (style === "markdown") {
    return `## Warnings\n\n${lines.join("\n")}\n\n${action}`;
  }
  return ["Warnings:", ...lines, action].join("\n");
}

function workflowArtifactIssue(item) {
  const rel = slash(item.rel || "");
  if (rel === "docs/ai-context-api-contract-map.md") {
    const content = readFilePrefix(item.target, 64 * 1024);
    const missing = ["Frontend payload fields", "Field check"].filter((column) => !content.includes(column));
    if (missing.length) return `missing columns: ${missing.join(", ")}`;
  }
  if (rel === `${CODEX_MEM_DIR}/index.jsonl`) {
    const content = safeRead(item.target);
    if (content.includes("\"type\":\"api-contract\"") || content.includes("\"type\": \"api-contract\"")) {
      const missing = [
        ["frontendPayloadFields", "Frontend payload fields"],
        ["fieldCheck", "Field check"]
      ].filter(([field]) => !content.includes(`"${field}"`));
      if (missing.length) return `api-contract entries missing fields: ${missing.map(([, label]) => label).join(", ")}`;
    }
  }
  return "";
}

function formatArtifactList(items) {
  const shown = items.slice(0, 8).map((item) => item.rel).join(", ");
  const suffix = items.length > 8 ? ` and ${items.length - 8} more` : "";
  return `${shown}${suffix}`;
}

function printDoctor(context) {
  const artifacts = workflowArtifacts(context);
  const missing = artifacts.filter((item) => !item.exists);
  const stale = artifacts.filter((item) => item.exists && item.issue);
  const capabilities = buildCapabilityStatus(context, artifacts);
  console.log(`# ai-context-kit doctor

workspace: ${context.workspace}
codegraph: ${context.codegraph ? "found" : "missing"}
repos: ${context.repos.length}
`);
  for (const repo of context.repos) {
    console.log(`- ${repo.name}`);
    console.log(`  path: ${repo.path}`);
    console.log(`  branch: ${repo.branch}`);
    console.log(`  tech: ${repo.tech.join(", ") || "unknown"}`);
    console.log(`  files: ${repo.stats.files}`);
    console.log(`  controllers: ${repo.stats.controllers}`);
    console.log(`  vue: ${repo.stats.vue}`);
    console.log(`  mapperXml: ${repo.stats.mapperXml}`);
  }
  console.log("\nworkflow artifacts:");
  for (const item of artifacts) {
    const state = !item.exists ? "missing" : item.issue ? "stale" : "ok";
    const detail = item.issue ? `; ${item.issue}` : "";
    console.log(`- ${state} ${item.rel} (${item.label}${detail})`);
  }
  console.log("\ncapability status:");
  for (const item of capabilities) {
    console.log(`- ${item.name}: ${item.status} (${item.detail})`);
    if (item.command) console.log(`  command: ${item.command}`);
  }
  if (missing.length || stale.length) {
    console.log("\nrecommended:");
    if (missing.length) {
      console.log(`- ${cliLabel()} agents --workspace <path>`);
      console.log(`- ${cliLabel()} repair --workspace <path>`);
      console.log("- `agents` and `repair` generate the missing workflow artifacts only and refresh the codex-mem index when new artifacts were created.");
    }
    if (stale.length) {
      console.log(`- ${cliLabel()} init --workspace <path>`);
      console.log("- `init` refreshes generated maps, reports and indexes when existing generated artifacts are outdated.");
    } else {
      console.log(`- Use ${cliLabel()} init --workspace <path> when you want to regenerate generated maps, reports and indexes from the current repository state.`);
    }
  } else {
    console.log("\nworkflow: ready for route/search, contracts and project-facts guided reads.");
  }
}

function printCapabilityActions(context) {
  const capabilities = buildCapabilityStatus(context);
  const get = (name) => capabilities.find((item) => item.name === name) || {
    name,
    status: "unknown",
    detail: "status not available",
    command: null
  };
  const codegraph = get("CodeGraph");
  const staticReport = get("static token report");
  const dashboard = get("token dashboard");
  const observeHooks = get("observe hooks");
  const sessionUsage = get("session token usage");
  const codegraphRepos = codegraphCandidateRepos(context).map((item) => item.repo.name);

  console.log("CodeGraph:");
  console.log(`- status: ${codegraph.status} (${codegraph.detail})`);
  if (codegraph.status === "missing_cli") {
    if (codegraph.command) console.log(`- install: ${codegraph.command}`);
    if (codegraphRepos.length) {
      console.log(`- after install: ${commandWithWorkspace(context, "codegraph", `--repos ${codegraphRepos.join(",")}`)}`);
    }
  } else if (codegraph.status === "recommended") {
    console.log(`- action: ${commandWithWorkspace(context, "codegraph", `--repos ${codegraphRepos.join(",")}`)}`);
  } else {
    console.log("- action: no CodeGraph setup needed now");
  }

  console.log("");
  console.log("Token visibility:");
  console.log(`- static report: ${staticReport.status} (${staticReport.detail})`);
  console.log(`- dashboard: ${dashboard.status} (${dashboard.detail})`);
  console.log(`- observe hooks: ${observeHooks.status} (${observeHooks.detail})`);
  console.log(`- session usage: ${sessionUsage.status} (${sessionUsage.detail})`);

  const tokenRefreshCommands = [];
  if (staticReport.command) tokenRefreshCommands.push(commandWithWorkspace(context, "tokens"));
  if (dashboard.command) tokenRefreshCommands.push(commandWithWorkspace(context, "dashboard"));
  if (tokenRefreshCommands.length) {
    tokenRefreshCommands.push(commandWithWorkspace(context, "token-status"));
    console.log(`- refresh static token view: ${unique(tokenRefreshCommands).join(" && ")}`);
  } else {
    console.log("- static token view: ready");
  }
  if (observeHooks.command) {
    console.log(`- enable observe hooks: ${commandWithWorkspace(context, "codex-mem install-hooks", "--mode observe")}`);
  }
  if (sessionUsage.command) {
    console.log(`- write real session report: ${commandWithWorkspace(context, "codex-mem sessions")}`);
  }

  console.log("");
  console.log("Report requirement:");
  console.log("- First adoption and upgrade summaries should mention CodeGraph status, static token visibility, observe hooks and session usage.");
}

function buildCapabilityStatus(context, artifacts = workflowArtifacts(context)) {
  const artifactState = capabilityArtifactState(artifacts);
  const contractState = capabilityContractState(context, artifacts);
  const codegraphState = capabilityCodegraphState(context);
  const tokenState = capabilityTokenState(context);
  const hookState = capabilityHookState(context);
  const graphState = capabilityReportState(context, "docs/ai-context-graph.json", "run graph when a structure JSON is useful");
  const realTaskState = capabilityRealTaskState(context);
  const redactState = {
    name: "redact",
    status: "available",
    detail: "rule-based local redaction command is bundled",
    command: `${cliLabel()} redact --input <file> --output <file>`
  };
  return [
    artifactState,
    contractState,
    codegraphState,
    tokenState.staticReport,
    tokenState.dashboard,
    hookState,
    tokenState.sessionUsage,
    graphState,
    realTaskState,
    redactState
  ];
}

function commandWithWorkspace(context, subcommand, extra = "") {
  return `${cliLabel()} ${subcommand} --workspace ${shellQuote(context.workspace)}${extra ? ` ${extra}` : ""}`;
}

function capabilityArtifactState(artifacts) {
  const missing = artifacts.filter((item) => !item.exists);
  const stale = artifacts.filter((item) => item.exists && item.issue);
  if (missing.length) {
    return {
      name: "low-token artifacts",
      status: "missing",
      detail: `${missing.length} workflow artifact(s) missing`,
      command: `${cliLabel()} agents --workspace <path> or ${cliLabel()} repair --workspace <path>`
    };
  }
  if (stale.length) {
    return {
      name: "low-token artifacts",
      status: "stale",
      detail: `${stale.length} generated artifact(s) need refresh`,
      command: `${cliLabel()} init --workspace <path>`
    };
  }
  return {
    name: "low-token artifacts",
    status: "ready",
    detail: "routing docs, project-facts skeletons and local route/search index are present",
    command: null
  };
}

function capabilityContractState(context, artifacts) {
  const contractArtifacts = artifacts.filter((item) => item.group === "contracts");
  const missing = contractArtifacts.filter((item) => !item.exists);
  const stale = contractArtifacts.filter((item) => item.exists && item.issue);
  const expected = contractArtifacts.length;
  if (!expected) {
    return {
      name: "contract index",
      status: "not_applicable",
      detail: "no frontend/backend contract artifacts are expected for detected repository types",
      command: null
    };
  }
  if (stale.length) {
    return {
      name: "contract index",
      status: "stale",
      detail: `${stale.length} contract artifact(s) missing current columns or fields`,
      command: `${cliLabel()} init --workspace <path>`
    };
  }
  if (missing.length === expected) {
    return {
      name: "contract index",
      status: "missing",
      detail: `${missing.length} expected contract artifact(s) missing`,
      command: `${cliLabel()} init --workspace <path>`
    };
  }
  if (missing.length) {
    return {
      name: "contract index",
      status: "partial",
      detail: `${expected - missing.length}/${expected} contract artifact(s) present`,
      command: `${cliLabel()} init --workspace <path>`
    };
  }
  return {
    name: "contract index",
    status: "ready",
    detail: `${expected} contract artifact(s) present; use contracts --query before opening long maps`,
    command: `${cliLabel()} contracts --workspace <path> --query <endpoint-or-symbol>`
  };
}

function capabilityCodegraphState(context) {
  const candidates = codegraphCandidateRepos(context);
  if (!context.codegraph) {
    return {
      name: "CodeGraph",
      status: candidates.length ? "missing_cli" : "skip",
      detail: candidates.length ? `recommended for ${candidates.map((item) => item.repo.name).join(", ")}` : "current workspace is small or has no strong symbol-query signal",
      command: candidates.length ? "npm install -g @colbymchenry/codegraph@0.9.9" : null
    };
  }
  const initialized = context.repos.filter((repo) => codegraphInitialized(repo.path));
  if (initialized.length) {
    return {
      name: "CodeGraph",
      status: "initialized",
      detail: `initialized in ${initialized.map((repo) => repo.name).join(", ")}`,
      command: null
    };
  }
  if (candidates.length) {
    const names = candidates.map((item) => item.repo.name).join(",");
    return {
      name: "CodeGraph",
      status: "recommended",
      detail: candidates.map((item) => `${item.repo.name}: ${item.reasons.join(", ")}`).join("; "),
      command: `${cliLabel()} codegraph --workspace <path> --repos ${names}`
    };
  }
  return {
    name: "CodeGraph",
    status: "skip",
    detail: "CLI is installed, but detected repositories do not need CodeGraph by default",
    command: null
  };
}

function codegraphCandidateRepos(context) {
  const multiRepo = context.repos.length > 1;
  return context.repos.map((repo) => {
    const reasons = [];
    if (repo.stats.files >= 800) reasons.push(`files ${repo.stats.files}`);
    if (repo.stats.controllers >= 3) reasons.push(`controllers ${repo.stats.controllers}`);
    if (repo.stats.apiFiles >= 5) reasons.push(`frontend API files ${repo.stats.apiFiles}`);
    if (repo.stats.mapperXml >= 3) reasons.push(`mapperXml ${repo.stats.mapperXml}`);
    if (multiRepo && (repo.tech.includes("java") || repo.stats.apiFiles > 0 || repo.stats.vue > 20)) reasons.push("multi-repo cross-end workspace");
    return { repo, reasons };
  }).filter((item) => item.reasons.length);
}

function codegraphInitialized(repoPath) {
  return fs.existsSync(path.join(repoPath, ".codegraph"));
}

function capabilityTokenState(context) {
  const reportPath = tokenReportPath(context, {});
  const dashboardPath = path.join(context.workspace, "docs", "ai-context-token-dashboard.md");
  const sessionPath = path.join(context.workspace, "docs", "codex-session-usage.md");
  const report = reportStatusWithAge(reportPath);
  const dashboard = reportStatusWithAge(dashboardPath);
  const session = reportStatusWithAge(sessionPath);
  return {
    staticReport: {
      name: "static token report",
      status: tokenReportStatus(report),
      detail: report.exists ? `${workspaceRelativePath(context, reportPath)}; age ${formatAge(report.ageMs)}` : "not measured yet",
      command: report.exists && !isReportStale(report.ageMs) ? null : `${cliLabel()} tokens --workspace <path>`
    },
    dashboard: {
      name: "token dashboard",
      status: dashboard.exists ? "generated" : "missing",
      detail: dashboard.exists ? `${workspaceRelativePath(context, dashboardPath)}; age ${formatAge(dashboard.ageMs)}` : "dashboard has not been generated",
      command: dashboard.exists && !isReportStale(dashboard.ageMs) ? null : `${cliLabel()} dashboard --workspace <path>`
    },
    sessionUsage: {
      name: "session token usage",
      status: session.exists ? "generated" : "missing",
      detail: session.exists ? `${workspaceRelativePath(context, sessionPath)}; age ${formatAge(session.ageMs)}` : "real Codex session usage report has not been generated",
      command: session.exists && !isReportStale(session.ageMs) ? null : `${cliLabel()} codex-mem sessions --workspace <path>`
    }
  };
}

function capabilityHookState(context) {
  const hooksPath = path.join(context.workspace, ".codex", "hooks.json");
  const hookScript = path.join(context.workspace, ".codex", "hooks", "codex-mem-hook.mjs");
  const ledgerPath = path.join(context.workspace, CODEX_MEM_DIR, "ledger.jsonl");
  const hooksText = safeRead(hooksPath);
  const projectHooksInstalled = hooksText.includes(CODEX_MEM_GENERATOR) && fs.existsSync(hookScript);
  const ledgerEvents = readJsonl(ledgerPath).length;
  if (projectHooksInstalled) {
    return {
      name: "observe hooks",
      status: ledgerEvents ? "enabled_with_data" : "enabled_no_data",
      detail: ledgerEvents ? `${formatNumber(ledgerEvents)} ledger event(s) recorded` : "project hooks installed; no ledger events recorded yet",
      command: ledgerEvents ? `${cliLabel()} codex-mem dashboard --workspace <path>` : null
    };
  }
  if (fs.existsSync(ledgerPath)) {
    return {
      name: "observe hooks",
      status: "ledger_only",
      detail: "ledger exists but project hook config was not found",
      command: `${cliLabel()} codex-mem install-hooks --workspace <path> --mode observe`
    };
  }
  return {
    name: "observe hooks",
    status: "not_enabled",
    detail: "no project-level Codex observe hooks found",
    command: `${cliLabel()} codex-mem install-hooks --workspace <path> --mode observe`
  };
}

function capabilityReportState(context, rel, missingDetail) {
  const file = path.join(context.workspace, rel);
  const status = reportStatusWithAge(file);
  return {
    name: rel.replace(/^docs\/|\.json$/g, ""),
    status: status.exists ? "generated" : "missing",
    detail: status.exists ? `${rel}; age ${formatAge(status.ageMs)}` : missingDetail,
    command: status.exists ? null : `${cliLabel()} graph --workspace <path> --output ${rel}`
  };
}

function capabilityRealTaskState(context) {
  const auditPath = path.join(context.workspace, "docs", "ai-context-kit-real-task-ab-audit.md");
  const status = reportStatusWithAge(auditPath);
  if (!status.exists) {
    return {
      name: "real-task A/B",
      status: "missing",
      detail: "no refreshed real-task audit report found",
      command: `${cliLabel()} real-task-audit --workspace <path>`
    };
  }
  const text = safeRead(auditPath);
  const hasCounted = /counted|计入|Pass/i.test(text);
  return {
    name: "real-task A/B",
    status: hasCounted ? "generated" : "supporting_only",
    detail: `${workspaceRelativePath(context, auditPath)}; age ${formatAge(status.ageMs)}`,
    command: null
  };
}

function reportStatusWithAge(file) {
  const stat = safeStat(file);
  return {
    exists: Boolean(stat),
    ageMs: stat ? Math.max(0, Date.now() - stat.mtimeMs) : 0
  };
}

function tokenReportStatus(report) {
  if (!report.exists) return "not_run";
  return isReportStale(report.ageMs) ? "stale" : "fresh";
}

function isReportStale(ageMs) {
  return ageMs > 7 * 24 * 60 * 60 * 1000;
}

function formatAge(ageMs) {
  if (!Number.isFinite(ageMs)) return "unknown";
  const minutes = Math.floor(ageMs / 60000);
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 48) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

function writeManagedFile(target, content, opts) {
  const body = `${MANAGED_MARKER}\n${content}`;
  if (fs.existsSync(target)) {
    if (!opts.force) {
      log(`skip existing ${target}`);
      return;
    }
    const current = safeRead(target);
    if (!current.includes(MANAGED_MARKER)) {
      log(`skip existing non-ai-context-kit file ${target}`);
      return;
    }
  }
  writeFile(target, body, opts);
}

function writeGeneratedFile(target, content, opts) {
  if (opts.missingOnly && fs.existsSync(target)) {
    log(`skip existing ${target}`);
    return;
  }
  writeFile(target, content, opts);
}

function writeFile(target, content, opts) {
  if (opts.dryRun) {
    log(`dry-run write ${target}`);
    return;
  }
  ensureDir(path.dirname(target), opts);
  fs.writeFileSync(target, content, "utf8");
  log(`wrote ${target}`);
}

function ensureDir(dir, opts) {
  if (opts.dryRun) return;
  fs.mkdirSync(dir, { recursive: true });
}

function detectCommand(command) {
  const result = spawnSync("sh", ["-lc", `command -v ${shellQuote(command)}`], { encoding: "utf8" });
  if (result.status === 0 && result.stdout.trim()) return result.stdout.trim();
  for (const candidate of commandFallbackPaths(command)) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return "";
}

function commandFallbackPaths(command) {
  const home = os.homedir();
  const paths = [
    path.join(home, ".local", "bin", command),
    path.join(home, ".npm-global", "bin", command),
    path.join(home, ".volta", "bin", command)
  ];
  const nvmRoot = path.join(home, ".nvm", "versions", "node");
  try {
    for (const version of fs.readdirSync(nvmRoot)) {
      paths.push(path.join(nvmRoot, version, "bin", command));
    }
  } catch {
    // ignore missing nvm installs
  }
  return paths;
}

function git(cwd, args) {
  const result = spawnSync("git", ["-C", cwd, ...args], { encoding: "utf8" });
  if (result.status !== 0) return "";
  return result.stdout.trim();
}

function safeRead(file) {
  try {
    const stat = fs.statSync(file);
    if (stat.size > 1024 * 1024) return "";
    return fs.readFileSync(file, "utf8");
  } catch {
    return "";
  }
}

function safeReadLarge(file, maxBytes) {
  try {
    const stat = fs.statSync(file);
    if (stat.size > maxBytes) return "";
    return fs.readFileSync(file, "utf8");
  } catch {
    return "";
  }
}

function safeReadContractDoc(file) {
  return safeReadLarge(file, 64 * 1024 * 1024);
}

function readFirstExisting(root, names) {
  for (const name of names) {
    const content = safeRead(path.join(root, name));
    if (content) return content;
  }
  return "";
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

function parseJsonLike(raw) {
  try {
    return JSON.parse(stripJsonComments(raw).replace(/,\s*([}\]])/g, "$1"));
  } catch {
    return null;
  }
}

function stripJsonComments(input) {
  return input
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
}

function lineOf(content, index) {
  return content.slice(0, index).split(/\r?\n/).length;
}

function slash(value) {
  return value.split(path.sep).join("/");
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function firstMarkdownTitle(content) {
  const match = String(content || "").match(/^#\s+(.+)$/m);
  return match ? match[1].trim().replace(/\s+/g, " ").slice(0, 80) : "";
}

function uniqueMatches(content, regex) {
  const values = [];
  let match;
  while ((match = regex.exec(content || ""))) values.push(match[1].trim());
  return unique(values);
}

function mavenProjectHints(pom) {
  const withoutParent = String(pom || "").replace(/<parent>[\s\S]*?<\/parent>/, "");
  const header = withoutParent.split(/<dependencyManagement>|<dependencies>|<build>|<profiles>/)[0] || "";
  return unique([
    ...uniqueMatches(header, /<artifactId>\s*([^<]+?)\s*<\/artifactId>/g),
    ...uniqueMatches(header, /<name>\s*([^<]+?)\s*<\/name>/g)
  ]).slice(0, 4);
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function commonJavaRoots(packages) {
  const parts = packages
    .map((name) => name.split(".").slice(0, 3).join("."))
    .filter(Boolean);
  return unique(parts).slice(0, 3);
}

function remoteSlug(remoteLine) {
  const text = String(remoteLine || "");
  const match = text.match(/github\.com[:/]([^)\s]+?)(?:\.git)?(?:\s|$)/)
    || text.match(/([^/\s:]+\/[^/\s]+?)(?:\.git)?(?:\s|$)/);
  return match ? match[1].replace(/\.git$/, "") : "";
}

function shellQuote(value) {
  return `'${String(value).replace(/'/g, "'\\''")}'`;
}

function log(message) {
  console.log(`[ai-context-kit] ${message}`);
}

function cliLabel() {
  const bin = path.basename(process.argv[1] || "");
  return bin === "project-facts-kit" ? "project-facts-kit context" : "ai-context-kit";
}

function fail(message) {
  console.error(`[ai-context-kit] ${message}`);
  process.exit(1);
}

main();
