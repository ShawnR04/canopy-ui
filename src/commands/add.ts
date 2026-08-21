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

// Derive current directory path in ES Module environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
 * Main execution function for adding components
 */
export async function add(componentKeys: string[]) {
  // Print styled welcome banner in terminal
  p.intro(pc.bgCyan(pc.black(" Canopy UI ")));

  // Hold list of components to install
  let selected = componentKeys;

  // If user didn't specify components in CLI args, prompt with interactive multi-select
  if (!selected || selected.length === 0) {
    // Generate prompt choices from registered components
    const choices = Object.keys(REGISTRY).map((key) => ({
      value: key,
      label: `${REGISTRY[key]?.name ?? key} (${key})`,
    }));

    // Display interactive terminal multi-select
    const response = await p.multiselect({
      message: "Select UI components to install:",
      options: choices,
      required: true,
    });

    // Handle user cancellation (Ctrl+C / Esc)
    if (p.isCancel(response)) {
      p.cancel("Operation aborted.");
      process.exit(0);
    }
    selected = response as string[];
  }

  // Get path to current user workspace
  const projectRoot = process.cwd();

  // Detect project's package manager
  const pkgManager = await detectPackageManager(projectRoot);

  // Target destination directory: check for src/ folder
  const hasSrc = await fs.pathExists(path.join(projectRoot, "src"));
  const targetDir = hasSrc
    ? path.join(projectRoot, "src", "components", "ui")
    : path.join(projectRoot, "components", "ui");

  // Ensure the destination directory exists (create recursively if missing)
  await fs.ensureDir(targetDir);

  // Initialize terminal animated progress spinner
  const spinner = p.spinner();

  // Iterate over each selected component identifier
  for (const key of selected) {
    const meta = REGISTRY[key];

    // Guard against invalid component keys
    if (!meta) {
      p.log.error(`Component "${key}" was not found in registry.`);
      continue;
    }

    spinner.start(`Setting up ${meta.name}...`);

    // 1. Install required dependencies & package packages using the detected package manager
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
        continue;
      }
    }

    // 2. Write the single local component wrapper / export file
    spinner.message(`Creating component stub for ${meta.name}...`);

    for (const file of meta.files) {
      const destPath = path.join(targetDir, file.targetName);

      // If a templatePath exists on disk, copy it; otherwise write export stub
      if (file.templatePath) {
        const srcPath = path.resolve(__dirname, "../templates", file.templatePath);
        if (await fs.pathExists(srcPath)) {
          await fs.copy(srcPath, destPath, { overwrite: true });
        } else {
          spinner.stop(pc.red(`Template file missing: ${file.templatePath}`));
          p.log.warn(pc.dim(`Looked at path: ${srcPath}`));
          return;
        }
      } else if (file.content) {
        // Direct stub writing (e.g., export * from "@canopy-ui/toast")
        await fs.writeFile(destPath, file.content.trim() + "\n", "utf-8");
      }
    }

    // Mark completion for current component
    const relativePath = `${hasSrc ? "src/" : ""}components/ui/`;
    spinner.stop(pc.green(`✔ Added ${meta.name} into ${relativePath}`));
  }

  // Final success message
  p.outro(pc.green("All components successfully installed!"));
}