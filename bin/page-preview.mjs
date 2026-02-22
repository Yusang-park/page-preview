#!/usr/bin/env node
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(__dirname, "..");
const requireFromPackage = createRequire(path.join(packageRoot, "package.json"));

const args = process.argv.slice(2);
const command = args[0] ?? "dev";

const getOption = (name) => {
  const idx = args.findIndex((arg) => arg === `--${name}`);
  if (idx === -1) return undefined;
  return args[idx + 1];
};

const storiesPath = getOption("stories");
if (storiesPath) {
  process.env.PAGE_PREVIEW_STORIES_PATH = path.resolve(process.cwd(), storiesPath);
}

const nodeBin = process.execPath;
const vitePackageRoot = path.dirname(requireFromPackage.resolve("vite/package.json"));
const playwrightPackageRoot = path.dirname(
  requireFromPackage.resolve("playwright/package.json"),
);
const viteBin = path.join(vitePackageRoot, "bin", "vite.js");
const playwrightBin = path.join(playwrightPackageRoot, "cli.js");

const run = (bin, runArgs) =>
  new Promise((resolve) => {
    const child = spawn(nodeBin, [bin, ...runArgs], {
      cwd: packageRoot,
      stdio: "inherit",
      env: process.env,
    });
    child.on("exit", (code) => resolve(code ?? 1));
  });

const main = async () => {
  const prepareExit = await run(path.join(packageRoot, "scripts", "prepare-stories.mjs"), []);
  if (prepareExit !== 0) process.exit(prepareExit);

  if (command === "dev") {
    process.exit(await run(viteBin, ["--host", "127.0.0.1", "--port", "4100", "--strictPort"]));
  }

  if (command === "build") {
    process.exit(await run(viteBin, ["build"]));
  }

  if (command === "preview") {
    process.exit(
      await run(viteBin, ["preview", "--host", "127.0.0.1", "--port", "4100", "--strictPort"]),
    );
  }

  if (command === "e2e" || command === "e2e:headed" || command === "e2e:ui") {
    const playArgs = ["test", "-c", "playwright.config.ts"];
    if (command === "e2e:headed") playArgs.push("--headed");
    if (command === "e2e:ui") playArgs.push("--ui");
    process.exit(await run(playwrightBin, playArgs));
  }

  console.error(`Unknown command: ${command}`);
  console.error("Usage: page-preview <dev|build|preview|e2e|e2e:headed|e2e:ui> [--stories <path>]");
  process.exit(1);
};

await main();
