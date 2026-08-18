// Native Node.js path utilities
import path from "node:path";
// Helper to derive __dirname in ESM
import { fileURLToPath } from "node:url";
// File system helper with promise support
import fs from "fs-extra";
// Subprocess execution library for running npm commands
import { execa } from "execa";
// Modern interactive CLI prompts
import * as p from "@clack/prompts"
// Terminal color styling
import pc from "picocolors";
// Component registry index
import  { REGISTRY } from "../registry.js";

// Derive current directory path in ES Module environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Main execution function for adding components
export async function add(componentKeys: string[]) {
    // Print styled welcome banner in terminal
    p.intro(pc.bgCyan(pc.black(" Canopy UI")));

    // Hold list of components to install
    let selected = componentKeys;

    // If user did'nt specify components in CLI args, prompt with interactive multi-select
    if (!selected || selected.length === 0) {
        // Generate prompt choices from registered components
        const choices = Object.keys(REGISTRY).map((key) => ({
            value: key,
            label: `${REGISTRY[key]?.name} (${key})`,
        }));

        // Display interactive terminal multi-select
        const response = await p.multiselect({
            message: "Select UI components to install:",
            options: choices,
            required:true,
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
    // Target destination directory: /components/ui
    const targetDir = path.join(projectRoot, "components", "ui");
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

        // Start progress spinner
        spinner.start(`Copying ${meta.name} source files.`)

        // Copy each template file to user's codebase
        for (const file of meta.files) {
            // Resolve path to bundled template within  the installed package
            const srcPath = path.resolve(__dirname, "../../templates", file.templatePath);
            // Resolve destiantion path in user's project
            const destPath = path.join(targetDir, file.targetName);

            // Verify templaet file exisits in package bundle
            if (await fs.pathExists(srcPath)) {
                // Copy file and overwrite existing version
                await fs.copy(srcPath, destPath, { overwrite: true });
            } else {
                spinner.stop(pc.red(`Template file missing: ${file.templatePath}`));
                return;
            }
        }

        // INstall required dependancies ifn specified
        if (meta.dependencies.length > 0) {
            spinner.message(`Installing required npm packages: ${meta.dependencies.join(", ")}...`);
            // Run npm install in user's root directory
            await execa("npm", ["install", ...meta.dependencies], { cwd: projectRoot });
        }

        // Mark comletion for current component
        spinner.stop(pc.green(`✔ Added ${meta.name} into components/ui/`))
    }

    // Final success message
    p.outro(pc.green("All components successfully installed!"))
}
