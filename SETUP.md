# Canopy UI
An accessible, themable React UI component library built for fast-moving web applications.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/
licenses/MIT)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)


## 1. Complete Repository File Structure
```text
my-project/
├── public/ # Static assets, favicons, logos
├── src/
│ ├── app/ # Next.js App Router (Pages, layouts, API routes)
│ │ ├── api/ # Backend endpoints & webhook handlers
│ │ ├── dashboard/ # Authenticated user dashboard
│ │ ├── layout.tsx # Root application layout & providers
│ │ └── page.tsx # Public landing page
│ ├── components/ # Reusable UI components
│ │ ├── ui/ # Atomic design system components (buttons, modals)
│ │ └── forms/ # Interactive form schemas & inputs
│ ├── db/ # Database schemas, migrations & connection pool
│ │ ├── index.ts # Database client entry point
│ │ └── schema.ts # Table schemas (Drizzle / Prisma)
│ ├── hooks/ # Custom React client hooks
│ ├── lib/ # Utility helpers, validators, constants
│ └── types/ # Global TypeScript interfaces & types
├── .env.example # Environment configuration template
├── package.json # Dependencies and script definitions
├── tailwind.config.ts # Tailwind design system configurations
├── tsconfig.json # TypeScript compiler configuration
└── README.md
```

## 2. Project Initialization & Workspace Configuration
### 2.1 Workplace Setup Commands
```bash
# Create project folder, initalize git and initialize npm package
mkdir canopy-ui && cd canopy-ui
git init
npm init -y

# Install runtime dependancies needed for CLI terminal interactions
npm install commander @clack/prompts picocolors ora execa fs-extra lucide-react

# Install developer tools; Typescript compiler and tsup high-speed ERM budler
npm install -D typescript @types/node @types/fs-extra tsup
```

### 2.2 CLI Configuration (`package.json`) - Documented
<kbd>package.json</kbd>
```json
{
  "name": "@marv3l/canopy-ui",
  "version": "1.0.0",
  "description": "An accessible, themable React UI component library built for fast-moving web applications.",
  "main": "./dist/index.js",
  "bin" : {
    "canopy-ui": "./dist/index.js"
  },
  "files": [
    "dist",
    "templates"
  ],
  "scripts": {
    "build": "tsup src/index.ts --format esm --banner:js \"#!/usr/bin/env node\"",
    "dev": "tsup src/index.ts --format esm --watch",
    "prepublishOnly": "npm run build",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/ShawnR04/canopy-ui.git"
  },
  "keywords": ["react", "ui", "toast", "shadcn", "components", "cli"],
  "author": "Shawn Rimai",
  "license": "MIT",
  "type": "commonjs",
  "bugs": {
    "url": "https://github.com/ShawnR04/canopy-ui/issues"
  },
  "homepage": "https://github.com/ShawnR04/canopy-ui#readme",
  "dependencies": {
    "@clack/prompts": "^1.7.0",
    "commander": "^15.0.0",
    "execa": "^10.0.1",
    "fs-extra": "^11.4.0",
    "ora": "^9.4.1",
    "picocolors": "^1.1.1"
  },
  "devDependencies": {
    "@types/fs-extra": "^11.0.4",
    "@types/node": "^26.2.0",
    "tsup": "^8.5.1",
    "typescript": "^7.0.2"
  }
}
```

### 2.3 Typescript Configuration (`tsconfig.json`) - Documented

#### Creeate the `tsconfig.json` file
```bash
npx tsc --init
```
<kbd>tsconfig.json</kbd>
```json
{
    "compilerOptions": {
        // Target modern JavaScript runtime environments (Node 18+)
        "target": "ES2022",
        // Use NodeNext module resolution algorithm for native ESM compatibility
        "module": "NodeNext",
        "moduleResolution": "NodeNext",
        // Enable interoperability between CommonJS and ES Modules
        "esModuleInterop": true,
        // Turn on strict type checking for robust error detection
        "strict": true,
        // Skip type checking of declaration files (.d.ts) for faster compile times
        "skipLibCheck": true,
        // Destination directory for compiled JavaScript artifacts
        "outDir": "./dist"
    },
    // Include all TypeScript files in the src directory for compilation
    "include": ["src/**/*"]
}
```

## 3. Toast Component Source Code
These files live inside the `templates/toast/` directory of the CLI repository and get written into the customer's `components/ui/` directory

### 3.1 Toast State Management Engine (`templates/toast/use-toast.ts`)
<kbd>templates/toast/use-toast.ts</kbd>
```ts
// Import React to access state hooks and ReactNode type definitions
import * as React from "react";

// Define the supported visual preset types for toast notifications
export type ToastVariant = "default" | "success" | "error" | "warning" | "info" | "custom";

// Interface defining all configurable parameters when triggering a toast notification
export interface ToastOptions {
    // Unique identifier for toast; auto-generated if omitted
    id?: string;
    // Primary header text or React component
    title?: React.ReactNode;
    // Secondary descriptive message or details
    description?: React.ReactNode;
    // Optional action button or interactive element
    action?: React.ReactNode;
    // Visual style preset (success, error, warning, info, default, custom)
    variant?: ToastVariant;
    // Individual lifespan in milliseconds; overrides the global layout default
    duration?: number;
    // User-defined custom styling parameters for dynamic themes
    customColor?: {
        // Custom CSS background color (HEX, RGB, or HSL)
        bg?: string;
        // Custom text color
        text?: string;
        // Custom border stroke color
        border?: string;
        //Custom progress bar stroke color
        progress?: string;
        // Custom icon fill/stroke tint
        icon?: string;
    };
    // Additional Tailwind or custom CSS classes applied to toast container
    className?: string;
}

// Internal representation of an active toast item containing open state
export interface ToastItem extends ToastOptions {
    // Guaranteed string ID for DOM key mapping
    id: string;
    // Boolean flag controlling entrance and exit animations
    open: boolean;
}

// Maximum number of visible toast cards on screen simultaneously
const TOAST_LIMIT = 5;
// Delay before removed toasts are completely purged from memory (allows exit transition)
const TOAST_REMOVE_DELAY = 1000;

// Discriminated union type representing all possible reducer actions
type Action = 
    // Adds a newly triggered toast to state
    | { type: "ADD_TOAST"; toast: ToastItem }
    // Modifies properties of an existing active toast
    | { type: "UPDATE_TOAST"; toast: Partial<ToastItem> }
    // Initiates dismiss sequence (triggers exit animation)
    | { type: "DISMISS_TOAST"; toastId?: string }
    // Purges toast object from memory after exit animation finishes
    | { type: "REMOVE_TOAST"; toastId?: string };

// Structure of global toast memory state
interface State {
    toasts: ToastItem[];
}

// Monotonically increasing counter for collision-free ID generation
let count = 0;

// Generates unique string identifiers for toast items
function genId(): string {
    count = (count + 1) % Number.MAX_SAFE_INTEGER;
    return count.toString();
}

// Map tracking active removal timers to prevent duplicate schedule queues
const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

// Schedule the hard removal of a dismissed toast after its exit animation completes
const addToRemoveQueue = (toastId: string) => {
    // If a timeout is already scheduled for this ID, skip to avoid duplicates
    if (toastTimeouts.has(toastId)) return;

    // Schedule state dispatch after delay
    const timeout = setTimeout(() => {
        // Clean up timeout reference from tracking map
        toastTimeouts.delete(toastId);
        // Dispatch removal action to purge from state
        dispatch({ type: "REMOVE_TOAST", toastId });
    }, TOAST_REMOVE_DELAY);

    // Store reference in tracking map
    toastTimeouts.set(toastId, timeout);
};

// Pure reducer function handling toast state transitions
export const reducer = (state: State, action: Action): State => {
    switch (action.type) {
        case "ADD_TOAST":
            return {
                ...state,
                // Prepend new toast and enforce maximum visible limit
                toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
            };

        case "UPDATE_TOAST":
            return {
                ...state,
                // Map through toasts and merge updated properties onto target ID
                toasts: state.toasts.map((t) =>
                    t.id === action.toast.id ? { ...t, ...action.toast } : t
                ),
            };

        case "DISMISS_TOAST": {
            const { toastId } = action;

            // If a specific ID is provided, schedule removal for only that toast
            if (toastId) {
                addToRemoveQueue(toastId);
            } else {
                // Otherwise schedule removal for all currently open toasts
                state.toasts.forEach((toast) => addToRemoveQueue(toast.id));
            }

            return {
                ...state,
                // Mark target toasts as closed to trigger CSS fade-out
                toasts: state.toasts.map((t) =>
                    t.id === toastId || toastId === undefined ? { ...t, open: false } : t
                ),
            };
        }

        case "REMOVE_TOAST":
            // Clear entire array if no specific ID passed
            if (action.toastId === undefined) return { ...state, toasts: [] };

            return {
                ...state,
                // Filter out target toast from state memory
                toasts: state.toasts.filter((t) => t.id !== action.toastId),
            };

        default:
            return state;
    }
};

// Array of subscriber callbacks implementing the Observer pattern
const listeners: Array<(state: State) => void> = [];

// Singleton state variable preserving toast state across entire application
let memoryState: State = { toasts: [] };

// Dispatches actions to state and notifies all registered React hook subscribers
function dispatch(action: Action) {
    // Update in-memory singleton state
    memoryState = reducer(memoryState, action);
    // Notify every mounted React component listener
    listeners.forEach((listener) => listener(memoryState));
}

// Imperative toast function callable from anywhere (inside or outside React lifecycle)
export function toast(props: ToastOptions) {
    // Use provided ID or generate a new unique identifier
    const id = props.id || genId();

    // Helper to dynamically update this specific toast
    const update = (updatedProps: ToastOptions) => 
        dispatch({ type: "UPDATE_TOAST", toast: { ...updatedProps, id } });

    // Helper to dismiss this specific toast
    const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id });

    // Dispatch action to push toast into visible queue
    dispatch({
        type: "ADD_TOAST",
        toast: {
            ...props,
            id,
            open: true,
        },
    });

    // Return control object allowing caller to dismiss or update toast programmatically
    return { id, dismiss, update };
}

// Custom React hook subscribing components to real-time toast updates
export function useToast() {
    // Local state synced with singleton memory state
    const [state, setState] = React.useState<State>(memoryState);

    // Register listener on mount; unregister on unmount
    React.useEffect(() => {
        listeners.push(setState);
        return () => {
            const index = listeners.indexOf(setState);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        };
    }, []); // Empty array ensures registration only happens on mount/unmount

    // Expose current state, trigger function, and dismiss helper
    return {
        ...state,
        toast,
        dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
    };
}
```

### 3.2 Toast UI Container and Renderer (`templates/toast/toast.tsx`)
<kbd>templates/toast/toast.tsx</kbd>
