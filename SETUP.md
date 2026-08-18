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
  // Visit https://aka.ms/tsconfig to read more about this file
  "compilerOptions": {
    // File Layout
    "rootDir": "./src",
    "outDir": "./dist",

    // Environment Settings
    // See also https://aka.ms/tsconfig/module
    "module": "nodenext",
    "target": "es2022",
    "moduleResolution": "nodenext",
    "esModuleInterop": true,
    "types": [],
    // For nodejs:
    // "lib": ["esnext"],
    // "types": ["node"],
    // and npm install -D @types/node

    // Other Outputs
    "sourceMap": true,
    "declaration": true,
    "declarationMap": true,

    // Stricter Typechecking Options
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,

    // Style Options
    // "noImplicitReturns": true,
    // "noImplicitOverride": true,
    // "noUnusedLocals": true,
    // "noUnusedParameters": true,
    // "noFallthroughCasesInSwitch": true,
    // "noPropertyAccessFromIndexSignature": true,

    // Recommended Options
    "strict": true,
    "jsx": "react-jsx",
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "noUncheckedSideEffectImports": true,
    "moduleDetection": "force",
    "skipLibCheck": true
  },
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
```tsx
// Import React runtime and component types
import * as React from "react";
// Import semantic sVG icons from lucide-react
import { CheckCircle2, AlertCircle, AlertTriangle, Info ,X} from "lucide-react";
// Import toast hook and type interfaces
import { useToast, ToastItem } from "./use-toast";

// Props accepted by the root Toaster container mounted in the root layout
export interface ToasterProps {
    // Global lifespan (in milliseconds) for all toasts; defaults to 400ms
    defaultDuration?: number;
    //Screen viewport placement position
    position?: "top-right" | "bottom-right" | "top-center" | "bottom-center" | "top-left" | "bottom-left";
}
// Visual preset configurations defining Tailwind colors and associated icons
//TODO: Add `progress: string` in the dictionary
const variantSyles : Record<string, {bg: string; border: string; text: string; icon: any}> = {
    //Neutral default theme
    default: {
        bg: "bg-slate-900",
        border: "border-slate-800",
        text: "text-slate-100",
        //progress: "bg-slate-100",
        icon: null,
    },

    //Success preset: Emerald theme with Check icon
    success: {
        bg: "bg-emerald-950/90",
        border: "border-emerald-700/60",
        text: "text-emerald-200",
        //progress: "text-emerald-200",
        icon: CheckCircle2
    },

    // Error preset: Rose theme with AlertCircle
    error: {
        bg: "bg-rose-950/90",
        border: "border-rose-700/60",
        text: "text-rose-200",
        //progress: "text-rose-200",
        icon: AlertCircle
    },

    //Warning preset: Amber theme with AlertTriangle icon
    warning: {
        bg: "bg-amber-950/90",
        border: "border-amber-700/60",
        text: "text-amber-200",
        //progress: "text-amber-200",
        icon: AlertTriangle
    },

    //Informational preset: Sky blue theme with Info iocn
    info: {
        bg: "bg-sky-950/90",
        border: "border-sky-700/60",
        text: "text-sky-200",
        //progress: "text-sky-200",
        icon: Info
    },
}

// Root Toaster Component placed into layout.tsx
export function Toaster({ defaultDuration = 400, position = "top-center"}: ToasterProps){
    // Extract real-time toast arary and dismiss helper from custom hook
    const { toasts, dismiss } = useToast();

    // Map position prop to Tailwind absolute positioning classes
    const positionClasses = {
        "top-right" : "top-4 right-4 items-end",
        "top-left" : "top-4 left-4 items-start",
        "bottom-right" : "bottom-4 right-4 items-end",
        "bottom-left" : "bottom-4 left-4 items-start",
        "top-center" : "top-4 left-1/2 -translate-x-1/2 items-center",
        "bottom-center" : "bottom-4 left-1/2 -translate-x-1/2 items-center",
    }[position];

    return (
        // Fixed viewport container ; pointer-events-none ensures it doesn't block background clicks
        <div className={`fixed z-50 pointer-none flex flex-col gap-2 p-4 w-full max-w-sm ${positionClasses}`}>
            {/* Map through active toast state and render atomic  toast items */}
            {toasts.map((item) => (
                <ToastElement
                    key={item.id}
                    toast={item}
                    defaultDuration={defaultDuration}
                    onDismiss={() => dismiss(item.id)}
                />
            ))}
        </div>
    );
}

// Atomic Toast Card Component
function ToastElement({
    toast,
    defaultDuration,
    onDismiss,
}: {
    toast: ToastItem;
    defaultDuration: number;
    onDismiss: () => void;
}) {
    // Priority: toast.duration > layout defaultDuration
    const duration = toast.duration ?? defaultDuration;

    // Set up auto-dismiss timer on component mount
    React.useEffect(() => {
        // If duration is set to <= 0, toast stays on screen indefinitely until manual dismissal
        if (duration <= 0) return;
        // Schedule dismissal
        const timer = setTimeout(() => {
            onDismiss();
        }, duration);
        // Clean up timer when toast unmounts or duration changes
        return () => clearTimeout(timer);
    }, [duration, onDismiss]);

    // Resolve visual preset or fall back to default
    const variant = toast.variant || "default"
    const defaultStyle = variantSyles[variant] || variantSyles.default;
    const IconComponent = defaultStyle.icon;

    // Inline style overrides for user-specified dynamic colors
    const customInlineStyle: React.CSSProperties ={
        backgroundColor: toast.customColor?.bg,
        borderColor: toast.customColor?.border,
        //progress: toast.customColor?.progress,
        color: toast.customColor?.text,
    };

    return (
        // Card container with pointer-events-none to re-enable interaction on the toast itself
        <div 
            style={customInlineStyle}
            className={` pointer-events-auto flex items-start gap-3 w-full p-4 rounded-lg border shadow-lg
                transition-all duration-200 backdrop-blur-sm 
                ${!toast.customColor?.bg ? defaultStyle.bg : ""} 
                ${!toast.customColor?.border ? defaultStyle.border : ""} 
                ${!toast.customColor?.text ? defaultStyle.text : ""}
                ${toast.className || ""}
            `}
        >
            {/* Render icon if preset defines one */}
            {IconComponent && (
                <IconComponent
                    className="w-5 h-5 mt-0.5 shrink-0"
                    style={{ color: toast.customColor?.icon}}
                />
            )}
            {/* Toast Content Area */}
            <div className="flex-1 text-sm space-y-1">
                {/* Title rendering */}
                {toast.title && <div className="font-semibold">{toast.title}</div>}
                {/* Description rendering */}
                {toast.description && (
                    <div className="opacity-90 leading-relaxed text-xs">
                        {toast.description}
                    </div>
                )}
                {/* Action button/node rendering */}
                {toast.action && <div className="pt-1">{toast.action}</div>}
            </div>
            {/* Close button */}
            <button 
                onClick={onDismiss}
                className="p-1 rounded-md opacity-70 hover:opacity-100 hover:bg-slate-800/40 transition-colors"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}
```
