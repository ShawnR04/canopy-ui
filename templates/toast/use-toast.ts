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
        // TODO: : Put the progress bar prop here when the time come
        //progress?: string;
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