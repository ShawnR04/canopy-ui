#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { Command } from "commander";
import { CANOPY_THEME_CSS } from "../templates/theme.js";
import { add } from "../commands/add.js";

const program = new Command();

program
  .name("canopy-ui")
  .description("CLI to initialize Canopy UI and add components to your React or Next.js app")
  .version("1.3.2");

// ==========================================
// 1. INIT COMMAND
// ==========================================
program
  .command("init")
  .description("Inject theme variables and configure Tailwind CSS")
  .action(async () => {
    const cwd = process.cwd();

    // 1. Find the user's globals.css file
    const cssCandidates = [
      path.join(cwd, "app/globals.css"),
      path.join(cwd, "src/app/globals.css"),
      path.join(cwd, "styles/globals.css"),
      path.join(cwd, "src/styles/globals.css"),
      path.join(cwd, "src/index.css"),
    ];

    const targetCss = cssCandidates.find((p) => fs.existsSync(p));

    if (!targetCss) {
      console.log("\x1b[31m%s\x1b[0m", "✖ Could not locate your globals.css file.");
      return;
    }

    let cssContent = fs.readFileSync(targetCss, "utf-8");

    // 2. Inject CSS variables if not already present
    if (cssContent.includes("--success-bg") || cssContent.includes("--radius-lg")) {
      console.log(
        "\x1b[33m%s\x1b[0m",
        `ℹ Canopy UI theme variables already present in ${path.relative(cwd, targetCss)}`
      );
    } else {
      cssContent += `\n${CANOPY_THEME_CSS}\n`;
      fs.writeFileSync(targetCss, cssContent, "utf-8");
      console.log(
        "\x1b[32m%s\x1b[0m",
        `✔ Added Canopy UI theme tokens to ${path.relative(cwd, targetCss)}`
      );
    }

    // 3. Find and update tailwind.config
    const configCandidates = [
      path.join(cwd, "tailwind.config.ts"),
      path.join(cwd, "tailwind.config.js"),
      path.join(cwd, "tailwind.config.mjs"),
    ];

    const targetConfig = configCandidates.find((p) => fs.existsSync(p));

    if (targetConfig) {
      let configContent = fs.readFileSync(targetConfig, "utf-8");
      const canopyDistPath = `"./node_modules/@marv3l/canopy-ui/**/*.{js,ts,jsx,tsx}"`;

      if (!configContent.includes("@marv3l/canopy-ui")) {
        // Inject package dist path into content: [...]
        configContent = configContent.replace(
          /(content:\s*\[)/,
          `$1\n    ${canopyDistPath},`
        );
        fs.writeFileSync(targetConfig, configContent, "utf-8");
        console.log(
          "\x1b[32m%s\x1b[0m",
          `✔ Configured Tailwind content path in ${path.relative(cwd, targetConfig)}`
        );
      }
    }

    console.log(
      "\n\x1b[32m%s\x1b[0m",
      "✨ Canopy UI configured! Mount <Toaster /> in your layout and start triggering toasts."
    );
  });

// ==========================================
// 2. ADD COMMAND
// ==========================================
program
  .command("add")
  .description("Add UI components to your project")
  .argument("[components...]", "Names of the components to install")
  .action(async (components: string[]) => {
    await add(components);
  });

program.parse();