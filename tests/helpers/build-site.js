import { spawnSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const eleventyCli = path.join(repositoryRoot, "node_modules/@11ty/eleventy/cmd.cjs");
const projectEntriesNeededForBuild = [
  "eleventy.config.js",
  "package.json",
  "lib",
  "src",
  "public",
  "posts/posts.11tydata.js",
];

export function post({ title, date, body = "Body text." }) {
  const frontMatterLines = [];
  if (title !== undefined) frontMatterLines.push(`title: ${JSON.stringify(title)}`);
  if (date !== undefined) frontMatterLines.push(`date: ${JSON.stringify(date)}`);
  return `---\n${frontMatterLines.join("\n")}\n---\n\n${body}\n`;
}

export function numberedPosts(count) {
  return Object.fromEntries(
    Array.from({ length: count }, (_, index) => {
      const day = String(index + 1).padStart(2, "0");
      return [
        `2024-01-${day}-post-${day}.md`,
        post({ title: `Post ${day}`, date: `2024-01-${day}` }),
      ];
    }),
  );
}

export function buildSite({ posts = {}, useRepositoryPosts = false, siteUrl } = {}) {
  const projectDirectory = mkdtempSync(path.join(tmpdir(), "blog-build-"));
  for (const entry of projectEntriesNeededForBuild) {
    cpSync(path.join(repositoryRoot, entry), path.join(projectDirectory, entry), {
      recursive: true,
    });
  }
  if (useRepositoryPosts) {
    cpSync(path.join(repositoryRoot, "posts"), path.join(projectDirectory, "posts"), {
      recursive: true,
    });
  }
  mkdirSync(path.join(projectDirectory, "posts"), { recursive: true });
  for (const [fileName, contents] of Object.entries(posts)) {
    writeFileSync(path.join(projectDirectory, "posts", fileName), contents);
  }

  const buildEnvironment = { ...process.env };
  delete buildEnvironment.SITE_URL;
  if (siteUrl !== undefined) buildEnvironment.SITE_URL = siteUrl;
  const result = spawnSync(process.execPath, [eleventyCli, "--quiet"], {
    cwd: projectDirectory,
    encoding: "utf8",
    env: buildEnvironment,
  });
  const outputDirectory = path.join(projectDirectory, "dist");

  return {
    exitCode: result.status,
    log: `${result.stdout}\n${result.stderr}`,
    exists: (relativePath) => existsSync(path.join(outputDirectory, relativePath)),
    read: (relativePath) => readFileSync(path.join(outputDirectory, relativePath), "utf8"),
    listFiles: () => readdirSync(outputDirectory, { recursive: true }),
    cleanup: () => rmSync(projectDirectory, { recursive: true, force: true }),
  };
}
