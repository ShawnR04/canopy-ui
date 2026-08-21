// src/registry.ts
export interface ComponentMeta {
  name: string;
  packageName?: string;
  dependencies?: string[];
  files: Array<{
    targetName: string;
    templatePath?: string;
    content?: string;
  }>;
}

export const REGISTRY: Record<string, ComponentMeta> = {
  toast: {
    name: "Toast",
    packageName: "@canopy-ui/toast", // Your published npm package name
    dependencies: ["lucide-react"],
    files: [
      {
        targetName: "toast.tsx",
        content: `"use client";\n\nexport * from "@canopy-ui/toast";`,
      },
    ],
  },
};