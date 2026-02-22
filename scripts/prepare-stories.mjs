import fs from "node:fs";
import path from "node:path";

const runtimeRoot = path.resolve(new URL("..", import.meta.url).pathname);
const injectedFile = path.resolve(runtimeRoot, "src/stories/injected.ts");
const defaultFile = path.resolve(runtimeRoot, "src/stories/default.ts");

const projectRoot = process.env.PAGE_PREVIEW_PROJECT_ROOT || process.cwd();
const envPath = process.env.PAGE_PREVIEW_STORIES_PATH;

const ignoredDirs = new Set([
  ".git",
  "node_modules",
  ".next",
  "dist",
  "build",
  "coverage",
  "out",
  "tmp",
]);

const findPreviewFiles = (root) => {
  const results = [];
  const walk = (dir) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (ignoredDirs.has(entry.name)) continue;
        walk(fullPath);
        continue;
      }
      if (entry.isFile() && entry.name.endsWith(".preview.ts")) {
        results.push(fullPath);
      }
    }
  };

  walk(root);
  return results.sort();
};

const makeImportPath = (targetFile) =>
  path
    .relative(path.dirname(injectedFile), targetFile)
    .replace(/\\/g, "/")
    .replace(/^(?!\.)/, "./")
    .replace(/\.ts$/, "");

const writeSingleExport = (targetFile) => {
  const importPath = makeImportPath(targetFile);
  const content = `export { pagePreviewStories } from \"${importPath}\";\n`;
  fs.writeFileSync(injectedFile, content, "utf8");
};

const writeMergedExports = (files) => {
  const imports = files
    .map((file, index) => `import { pagePreviewStories as stories${index} } from \"${makeImportPath(file)}\";`)
    .join("\n");

  const merged = `\nconst mergedStories = [${files.map((_, index) => `...stories${index}`).join(", ")}];\n\nexport const pagePreviewStories = mergedStories;\n`;

  fs.writeFileSync(injectedFile, `${imports}${merged}`, "utf8");
};

if (envPath) {
  const asAbsolute = path.isAbsolute(envPath) ? envPath : path.resolve(projectRoot, envPath);
  const asRuntimeRelative = path.resolve(runtimeRoot, envPath);

  if (fs.existsSync(asAbsolute)) {
    writeSingleExport(asAbsolute);
    process.exit(0);
  }
  if (fs.existsSync(asRuntimeRelative)) {
    writeSingleExport(asRuntimeRelative);
    process.exit(0);
  }
}

const previewFiles = findPreviewFiles(projectRoot);

if (previewFiles.length > 0) {
  writeMergedExports(previewFiles);
} else {
  writeSingleExport(defaultFile);
}
