#!/usr/bin/env node

// Import Commander framework for CLI argument parsing
import { Command } from "commander";
// Import add command handler
import { add } from "./commands/add.js";

// Initialize command program instance
const program = new Command();

// Configure CLI identity and metadata
program
  .name("canopy-ui")
  .description("Install custom modular UI components directly to your project")
  .version("1.0.0");

// Define 'add' command with variadic component arguments
program
  .command("add")
  .description("Add a component to your project")
  .argument("[components...]", "Component identifiers (e.g., toast)")
  .action(async (components: string[]) => {
    // Invoke add handler with parsed component names
    await add(components);
  });

// Parse command line arguments from process.argv
program.parse(process.argv);