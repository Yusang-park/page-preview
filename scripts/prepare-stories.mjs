import fs from "node:fs";
import path from "node:path";

const runtimeRoot = path.resolve(new URL("..", import.meta.url).pathname);
const injectedFile = path.resolve(runtimeRoot, "src/stories/injected.ts");
const defaultFile = path.resolve(runtimeRoot, "src/stories/default.ts");

const envPath = process.env.PAGE_PREVIEW_STORIES_PATH;
let targetFile = defaultFile;

if (envPath) {
  const asAbsolute = path.isAbsolute(envPath) ? envPath : path.resolve(process.cwd(), envPath);
  const asRuntimeRelative = path.resolve(runtimeRoot, envPath);

  if (fs.existsSync(asAbsolute)) {
    targetFile = asAbsolute;
  } else if (fs.existsSync(asRuntimeRelative)) {
    targetFile = asRuntimeRelative;
  }
}

const importPath = path
  .relative(path.dirname(injectedFile), targetFile)
  .replace(/\\/g, "/")
  .replace(/^(?!\.)/, "./")
  .replace(/\.ts$/, "");

const content = `export { pagePreviewStories } from "${importPath}";\n`;
fs.writeFileSync(injectedFile, content, "utf8");
