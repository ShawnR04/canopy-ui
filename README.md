# Canopy UI

> A modern . copy-paste CLI to distribute custom UI components directly into your React / Next.js codebase.

## Quick Start
Add components to your project in one command

```bash
npx canopy-ui add toast
```

If you don't pass an argument, an interactive multi-select menu will appear.

---

## Components
### Toast

An animated notification system with global layout duration controls and fully customizable color palettes

#### 1. Setup in Root Layout
Mount the `` in your root `layout.tsx`:

```tsx
import { Toaster } from "@/components/ui/toast";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (

        {children}

    );
}
```

#### 2. Triggering Toasts in Components
```tsx
"use client";
import { toast } from "@components/ui/use-toast";

// Build-in Variant
toast({
    variant: "success",
    title: "Operation Complete",
    description: "Your file has been uploaded",
});

// Custom Color Paletter & Override Duration
toast({
    title: "Custom Palette",
    description: "Using your own brand colors.",
    duration: 6000,
    custonColor: {
        bg: "#1e1b4b",
        border: "#6366f1",
        text: "#e0e7ff",
        icon: "#818cf8" 
    },
});
```

---

## Development & Publishing
1. **Build CLI:** `npm run build`
2. **Test Locally:** `npm link` and run `canopy-ui add toast` inside a sample project
3. **Publish to npm:** `npm publish --access public`

## License
MIT © Shawn Rimai