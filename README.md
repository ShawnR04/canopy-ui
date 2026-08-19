# Canopy UI

> A modern, copy-and-paste CLI for adding customizable UI components directly to React and Next.js codebases.

Canopy UI installs component source code into your project, giving you full ownership over the markup, styles, behavior, and design tokens. Customize components as much as you need—without being locked into a hosted UI library.

## Quick Start

Add a component with one command:

```bash
npx canopy-ui add toast
```

Run the command without a component name to open an interactive multi-select prompt:

```bash
npx canopy-ui add
```

---

## Components

### Toast

A customizable, animated notification system with:

- Built-in `success` and `error` variants
- Configurable global default duration
- Configurable screen position
- Per-toast duration overrides
- Custom colors using hex values, CSS variables, or design tokens
- Progress-bar color controls
- Direct Tailwind `className` overrides

## Installation

Install the Toast component into your project:

```bash
npx canopy-ui add toast
```

The component is added to your local UI directory, typically under:

```text
components/ui/toast.tsx
components/ui/use-toast.ts
```

> The exact generated paths may depend on your project's configured import aliases.

---

## Setup

Mount `Toaster` once in your root `app/layout.tsx`. This provides the toast viewport for all routes in your application.

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";
import { Toaster } from "@/components/ui/toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "My App",
  description: "My application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {children}
        <Toaster defaultDuration={3500} position="top-center" />
      </body>
    </html>
  );
}
```

### `Toaster` Props

| Prop | Type | Description |
| --- | --- | --- |
| `defaultDuration` | `number` | Default time, in milliseconds, before a toast dismisses. Individual toasts can override it. |
| `position` | `string` | Position of the toast viewport, for example `"top-center"`. |

---

## Usage

Import `toast` inside a client component, then call it from an event handler or client-side action.

```tsx
"use client";

import { toast } from "@/components/ui/use-toast";

export default function Page() {
  return (
    <button
      onClick={() =>
        toast({
          variant: "success",
          title: "Changes saved",
          description: "Your preferences were updated successfully.",
        })
      }
    >
      Show toast
    </button>
  );
}
```

---

## Examples

### Success Toast

```tsx
toast({
  variant: "success",
  title: "Changes saved",
  description: "Your preferences were updated successfully.",
});
```

### Error Toast

```tsx
toast({
  variant: "error",
  title: "Action failed",
  description: "Could not connect to the remote server.",
});
```

### Custom Colors and Duration

Use `customColor` to override the toast palette. Values can be literal CSS colors, such as hex values, or CSS custom properties such as `var(--primary)`.

```tsx
toast({
  title: "Pro subscription unlocked",
  description: "Welcome to VIP perks and custom styling.",
  duration: 5000,
  customColor: {
    bg: "var(--card)",
    border: "var(--primary)",
    text: "var(--card-foreground)",
    icon: "var(--primary)",
    progress: "var(--primary)",
  },
});
```

### Tailwind Class Override

Use `className` when you want to apply direct Tailwind utility classes to an individual toast.

```tsx
toast({
  title: "Tailwind classes applied",
  description: "Styled with direct className overrides.",
  duration: 3500,
  customColor: {
    progress: "var(--destructive)",
  },
  className: "border-destructive/40 bg-card text-primary",
});
```

---

## Toast API

```ts
toast({
  variant?: "success" | "error";
  title?: string;
  description?: string;
  duration?: number;
  customColor?: {
    bg?: string;
    border?: string;
    text?: string;
    icon?: string;
    progress?: string;
  };
  className?: string;
});
```

| Option | Description |
| --- | --- |
| `variant` | Applies a built-in visual style, such as `"success"` or `"error"`. |
| `title` | Primary toast message. |
| `description` | Supporting text displayed below the title. |
| `duration` | Dismiss timeout in milliseconds. Overrides `Toaster`’s `defaultDuration`. |
| `customColor.bg` | Toast background color. |
| `customColor.border` | Toast border color. |
| `customColor.text` | Toast text color. |
| `customColor.icon` | Toast icon color. |
| `customColor.progress` | Toast progress-bar color. |
| `className` | Tailwind or custom CSS classes applied directly to the toast. |

---

## Development

Build the CLI:

```bash
npm run build
```

Link the package locally:

```bash
npm link
```

Then, inside a sample React or Next.js project, install a component through the linked CLI:

```bash
canopy-ui add toast
```

## Publishing

Publish the package to npm:

```bash
npm publish --access public
```

## License

MIT © Shawn Rimai
