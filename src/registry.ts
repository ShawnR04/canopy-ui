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

// src/registry.ts
export const REGISTRY: Record<string, ComponentMeta> = {
  toast: {
    name: "Toast",
    dependencies: ["lucide-react"],
    files: [
      {
        targetName: "toast.tsx",
        templatePath: "toast/toast.tsx",
      },
    ],
  },
  button: {
    name: "Button",
    dependencies: [
      "@radix-ui/react-slot",
      "class-variance-authority",
      "clsx",
      "tailwind-merge",
      "lucide-react",
    ],
    files: [
      {
        targetName: "button.tsx",
        templatePath: "button/button.tsx",
      },
    ],
  },
};