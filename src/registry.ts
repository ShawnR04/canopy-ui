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
    dependencies: ["lucide-react"], // Peer dependencies to install in consumer app
    files: [
      {
        targetName: "toast.tsx",
        templatePath: "toast/toast.tsx",
      },
      {
        targetName: "use-toast.tsx",
        templatePath: "toast/use-toast.ts",
      },
    ],
  },
};