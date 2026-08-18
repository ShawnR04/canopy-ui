// Type interface specifying component metadata and dependancy requirements
export interface ComponentMeta {
    // Human-readable title
    name: string;
    // Production npm packages requierd by this component
    dependencies: string[];
    // Developmemnt dependancies required by this component
    devDependencies?: string[];
    // File distribution mappings
    files: {
        // Relative path to file inside the CLI package's templates/ folder
        templatePath: string;
        // Filename written inside teh consumer project's components/ui folder
        targetName: string;
    }[];
}

// Central catalog mapping component aliases to metadata definitions
export const REGISTRY: Record<string,ComponentMeta> = {
    // Toast component registration
    toast: {
        name: "Custom Toast Notification System",
        // Packages to automatically install in consumer project
        dependencies: ["lucide-react", "clsx", "tailwind-merge"],
        files: [
            {
                templatePath: "toast/toast.tsx",
                targetName: "toast.tsx",
            },
            {
                templatePath: "toast/use-toast.ts",
                targetName: "use-toast.ts"
            },
        ],
    },
    // Future components (dialog, sheet, dropdown) are added here
}