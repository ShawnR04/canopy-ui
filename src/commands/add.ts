// Native Node.js path utilities
import path from "node:path";
// Helper to derive __dirname in ESM
import { fileURLToPath } from "node:url";
// File system helper with promise support
import fs from "fs-extra";
// Subprocess execution library for running package manager commands
import { execa } from "execa";
// Modern interactive CLI prompts
import * as p from "@clack/prompts";
// Terminal color styling
import pc from "picocolors";
// Component registry index
import { REGISTRY } from "../registry.js";
// Design tokens CSS template
import { CANOPY_THEME_CSS } from "../templates/theme.js";

// Derive current directory path safely in both ES Module and CommonJS environments
const getDirname = () => {
  if (typeof __dirname !== "undefined") {
    return __dirname;
  }
  return path.dirname(fileURLToPath(import.meta.url));
};

const currentDir = getDirname();

/**
 * Resolves the location of a template file across development and built distributions
 */
async function resolveTemplatePath(templateSubPath: string): Promise<string | null> {
  const candidatePaths = [
    // 1. Production bundle (with "src/templates" in package.json files array)
    path.resolve(currentDir, "../src/templates", templateSubPath),
    // 2. Nested cli bundle (dist/cli/index.js -> ../../src/templates)
    path.resolve(currentDir, "../../src/templates", templateSubPath),
    // 3. Fallback if templates is at package root
    path.resolve(currentDir, "../templates", templateSubPath),
    path.resolve(currentDir, "../../templates", templateSubPath),
    // 4. Fallback relative to project root
    path.resolve(process.cwd(), "src/templates", templateSubPath),
  ];

  for (const candidate of candidatePaths) {
    if (await fs.pathExists(candidate)) {
      return candidate;
    }
  }

  return null;
}

/**
 * Detects the active package manager used in the target project workspace
 */
async function detectPackageManager(projectRoot: string): Promise<"pnpm" | "yarn" | "bun" | "npm"> {
  if (await fs.pathExists(path.join(projectRoot, "pnpm-lock.yaml"))) return "pnpm";
  if (await fs.pathExists(path.join(projectRoot, "yarn.lock"))) return "yarn";
  if (
    (await fs.pathExists(path.join(projectRoot, "bun.lockb"))) ||
    (await fs.pathExists(path.join(projectRoot, "bun.lock")))
  ) {
    return "bun";
  }
  return "npm";
}

/**
 * Finds the project's root stylesheet and injects design tokens if not already present
 */
async function injectGlobalsCss(projectRoot: string): Promise<void> {
  const cssCandidates = [
    path.join(projectRoot, "app/globals.css"),
    path.join(projectRoot, "src/app/globals.css"),
    path.join(projectRoot, "styles/globals.css"),
    path.join(projectRoot, "src/styles/globals.css"),
    path.join(projectRoot, "src/index.css"),
  ];

  let targetCss: string | null = null;
  for (const candidate of cssCandidates) {
    if (await fs.pathExists(candidate)) {
      targetCss = candidate;
      break;
    }
  }

  if (!targetCss) {
    p.log.warn(pc.yellow("⚠ Could not locate a globals.css or index.css to inject design tokens."));
    return;
  }

  const existingContent = await fs.readFile(targetCss, "utf-8");

  // Prevent duplicate injections
  if (
    existingContent.includes("Canopy UI Design Tokens") ||
    existingContent.includes("--color-primary") ||
    existingContent.includes("--primary:")
  ) {
    return;
  }

  await fs.writeFile(
    targetCss,
    `${existingContent.trimEnd()}\n\n${CANOPY_THEME_CSS.trim()}\n`,
    "utf-8"
  );

  const relativePath = path.relative(projectRoot, targetCss);
  p.log.success(pc.green(`✔ Injected Canopy UI design tokens into ${relativePath}`));
}

/**
 * Main execution function for adding components
 */
export async function add(componentKeys: string[]) {
  p.intro(pc.bgCyan(pc.black(" Canopy UI ")));

  let selected = componentKeys;

  if (!selected || selected.length === 0) {
    const choices = Object.keys(REGISTRY).map((key) => ({
      value: key,
      label: `${REGISTRY[key]?.name ?? key} (${key})`,
    }));

    const response = await p.multiselect({
      message: "Select UI components to install:",
      options: choices,
      required: true,
    });

    if (p.isCancel(response)) {
      p.cancel("Operation aborted.");
      process.exit(0);
    }
    selected = response as string[];
  }

  const projectRoot = process.cwd();
  const pkgManager = await detectPackageManager(projectRoot);

  // 1. Ensure globals.css has design tokens before copying files
  await injectGlobalsCss(projectRoot);

  // 2. Setup target component directory
  const hasSrc = await fs.pathExists(path.join(projectRoot, "src"));
  const targetDir = hasSrc
    ? path.join(projectRoot, "src", "components", "ui")
    : path.join(projectRoot, "components", "ui");

  await fs.ensureDir(targetDir);

  const spinner = p.spinner();

  for (const key of selected) {
    const meta = REGISTRY[key];

    if (!meta) {
      p.log.error(`Component "${key}" was not found in registry.`);
      continue;
    }

    spinner.start(`Setting up ${meta.name}...`);

    // 3. Install dependencies if any exist
    const allDependencies = [
      ...(meta.packageName ? [meta.packageName] : []),
      ...(meta.dependencies || []),
    ];

    if (allDependencies.length > 0) {
      spinner.message(
        `Installing packages (${pc.cyan(pkgManager)}): ${pc.dim(allDependencies.join(", "))}...`
      );

      const installArgs = {
        npm: ["install", ...allDependencies],
        pnpm: ["add", ...allDependencies],
        yarn: ["add", ...allDependencies],
        bun: ["add", ...allDependencies],
      }[pkgManager];

      try {
        await execa(pkgManager, installArgs, {
          cwd: projectRoot,
          stdio: "pipe",
        });
      } catch (err) {
        spinner.stop(pc.red(`Failed to install dependencies for ${meta.name}`));
        p.log.error(String(err));
        p.cancel("Installation aborted due to failed dependency resolution.");
        process.exit(1);
      }
    }

    // 4. Copy template files or write stubs
    spinner.message(`Creating component files for ${meta.name}...`);

    for (const file of meta.files) {
      const destPath = path.join(targetDir, file.targetName);

      if (file.templatePath) {
        const resolvedSrc = await resolveTemplatePath(file.templatePath);

        if (resolvedSrc) {
          await fs.copy(resolvedSrc, destPath, { overwrite: true });
        } else {
          spinner.stop(pc.red(`Template file missing: ${file.templatePath}`));
          p.log.warn(pc.dim(`Searched relative to: ${currentDir}`));
          p.cancel("Component generation aborted.");
          process.exit(1);
        }
      } else if (file.content) {
        await fs.writeFile(destPath, file.content.trim() + "\n", "utf-8");
      }
    }

    const relativePath = `${hasSrc ? "src/" : ""}components/ui/`;
    spinner.stop(pc.green(`✔ Added ${meta.name} into ${relativePath}`));
  }

  p.outro(pc.green("All components successfully installed!"));
}