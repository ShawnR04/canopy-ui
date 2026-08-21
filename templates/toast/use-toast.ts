"use client";

import * as React from "react";

/**
 * Supported visual styles and operational modes for toasts.
 * - "default" | "success" | "error" | "warning" | "info": Semantic presets
 * - "custom": Custom token/color overrides
 * - "loading": Persistent spinner mode for asynchronous operations
 */
export type ToastVariant =
  | "default"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "custom"
  | "loading";

export interface ToastOptions {
  /** Optional custom identifier. If omitted, a collision-resistant UUID is generated. */
  id?: string;
  /** Primary title text or JSX element displayed in the toast header. */
  title?: React.ReactNode;
  /** Secondary explanatory text or JSX node rendered below the title. */
  description?: React.ReactNode;
  /** Interactive action button or control rendered at the bottom of the toast. */
  action?: React.ReactNode;
  /** Visual variant styling preset. Defaults to "default". */
  variant?: ToastVariant;
  /** Display duration in milliseconds before auto-dismissing. Set to 0 or Infinity to prevent auto-dismiss. */
  duration?: number;
  /** Maximum number of duplicate message stacks allowed for this specific toast (defaults to 5). */
  maxCount?: number;
  /** Explicitly toggle the animated bottom progress bar. Defaults to true when auto-dismissible. */
  showProgress?: boolean;
  /** Optional custom icon node to override the variant preset icon. */
  icon?: React.ReactNode;
  /** Custom inline token styling overrides for background, border, text, progress bar, and icon. */
  customColor?: {
    bg?: string;
    text?: string;
    border?: string;
    progress?: string;
    icon?: string;
  };
  /** Additional Tailwind or CSS class names to apply to the root toast card container. */
  className?: string;
}

export interface ToastItem extends ToastOptions {
  id: string;
  open: boolean;
  count: number;
  maxReached?: boolean;
}

// -----------------------------------------------------------------------------
// Constants & Configuration
// -----------------------------------------------------------------------------

/** Maximum number of simultaneous toasts rendered on screen at any time. */
const TOAST_LIMIT = 5;

/** Default duplicate stack cap if not overridden per toast. */
const DEFAULT_MAX_COUNT = 5;

/** Delay in ms before unmounting a dismissed toast from the state tree. */
const TOAST_REMOVE_DELAY = 0;

// -----------------------------------------------------------------------------
// Action Types & State Management
// -----------------------------------------------------------------------------

type Action =
  | { type: "ADD_TOAST"; toast: ToastItem }
  | { type: "UPDATE_TOAST"; toast: Partial<ToastItem> }
  | { type: "DISMISS_TOAST"; toastId?: string }
  | { type: "REMOVE_TOAST"; toastId?: string };

interface State {
  toasts: ToastItem[];
}

/**
 * Generates a collision-resistant unique identifier.
 * Uses native crypto.randomUUID when available, falling back to high-resolution timestamps.
 */
function genId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Tracks active unmount timers to prevent duplicate queue dispatches. */
const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

/**
 * Schedules a toast for removal from memory after dismissal animations complete.
 */
const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) return;

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({ type: "REMOVE_TOAST", toastId });
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(toastId, timeout);
};

/**
 * Main state reducer managing insertion, deduplication stacking, updates, and dismissals.
 */
export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST": {
      // 1. In-place update: If a toast with this exact ID already exists (e.g. toast.promise transitions), update it
      const existingByIdIndex = state.toasts.findIndex((t) => t.id === action.toast.id);

      if (existingByIdIndex !== -1) {
        return {
          ...state,
          toasts: state.toasts.map((t) =>
            t.id === action.toast.id ? { ...t, ...action.toast, open: true } : t
          ),
        };
      }

      // 2. Duplicate Detection: Match on open state, title, description, and variant to increment badge counter
      const existingIndex = state.toasts.findIndex(
        (t) =>
          t.open &&
          t.title === action.toast.title &&
          t.description === action.toast.description &&
          (t.variant || "default") === (action.toast.variant || "default")
      );

      if (existingIndex !== -1) {
        const existing = state.toasts[existingIndex];
        const maxLimit = existing.maxCount ?? action.toast.maxCount ?? DEFAULT_MAX_COUNT;

        // Cap the count at maxLimit
        const newCount = Math.min(existing.count + 1, maxLimit);
        const maxReached = existing.count + 1 >= maxLimit;

        const updatedToast: ToastItem = {
          ...existing,
          ...action.toast,
          id: existing.id,
          count: newCount,
          maxReached,
          open: true,
        };

        // Move updated toast to the top of the stack
        const rest = state.toasts.filter((t) => t.id !== existing.id);
        return {
          ...state,
          toasts: [updatedToast, ...rest].slice(0, TOAST_LIMIT),
        };
      }

      // 3. New Toast: Prepend to list and truncate at TOAST_LIMIT
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };
    }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };

    case "DISMISS_TOAST": {
      const { toastId } = action;

      // Queue removal for specific toast or all active toasts
      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach((toast) => addToRemoveQueue(toast.id));
      }

      // Mark toast as closed to trigger exit transitions
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined ? { ...t, open: false } : t
        ),
      };
    }

    case "REMOVE_TOAST":
      if (action.toastId === undefined) return { ...state, toasts: [] };
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };

    default:
      return state;
  }
};

// -----------------------------------------------------------------------------
// Store Listeners & Dispatch Dispatcher
// -----------------------------------------------------------------------------

const listeners: Array<(state: State) => void> = [];
let memoryState: State = { toasts: [] };

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => listener(memoryState));
}

// -----------------------------------------------------------------------------
// Core Toast Dispatcher & Convenience Helpers
// -----------------------------------------------------------------------------

/**
 * Base dispatcher function to spawn or update a toast alert.
 */
export function toast(props: ToastOptions) {
  const id = props.id || genId();

  const update = (updatedProps: ToastOptions) =>
    dispatch({ type: "UPDATE_TOAST", toast: { ...updatedProps, id } });

  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id });

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      count: 1,
      maxReached: false,
    },
  });

  return { id, dismiss, update };
}

/** Convenience helper: Spawns a success variant toast. */
toast.success = (title: React.ReactNode, options?: Omit<ToastOptions, "title" | "variant">) =>
  toast({ ...options, title, variant: "success" });

/** Convenience helper: Spawns an error variant toast. */
toast.error = (title: React.ReactNode, options?: Omit<ToastOptions, "title" | "variant">) =>
  toast({ ...options, title, variant: "error" });

/** Convenience helper: Spawns a warning variant toast. */
toast.warning = (title: React.ReactNode, options?: Omit<ToastOptions, "title" | "variant">) =>
  toast({ ...options, title, variant: "warning" });

/** Convenience helper: Spawns an informational variant toast. */
toast.info = (title: React.ReactNode, options?: Omit<ToastOptions, "title" | "variant">) =>
  toast({ ...options, title, variant: "info" });

/** Convenience helper: Spawns a persistent loading variant toast with infinite duration. */
toast.loading = (title: React.ReactNode, options?: Omit<ToastOptions, "title" | "variant">) =>
  toast({ ...options, title, variant: "loading", duration: 0 });

/** Global method to dismiss a specific toast by ID or all active toasts if no ID is passed. */
toast.dismiss = (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId });

/**
 * Asynchronous promise lifecycle handler.
 * Displays a loading state and seamlessly transitions to success or error on resolution.
 */
toast.promise = <T,>(
  promise: Promise<T> | (() => Promise<T>),
  msgs: {
    loading: React.ReactNode;
    success: React.ReactNode | ((data: T) => React.ReactNode);
    error: React.ReactNode | ((err: unknown) => React.ReactNode);
  },
  options?: ToastOptions
) => {
  const instance = toast({
    ...options,
    variant: "loading",
    title: msgs.loading,
    duration: 0,
  });

  const promiseFn = typeof promise === "function" ? promise() : promise;

  promiseFn
    .then((data) => {
      const successTitle = typeof msgs.success === "function" ? msgs.success(data) : msgs.success;
      toast.success(successTitle, {
        ...options,
        id: instance.id,
        duration: options?.duration ?? 4000,
      });
    })
    .catch((err: unknown) => {
      const errorTitle = typeof msgs.error === "function" ? msgs.error(err) : msgs.error;
      toast.error(errorTitle, {
        ...options,
        id: instance.id,
        duration: options?.duration ?? 5000,
      });
    });

  return promiseFn;
};

// -----------------------------------------------------------------------------
// React Consumer Hook
// -----------------------------------------------------------------------------

/**
 * React hook providing reactive toast state, dispatchers, and dismissal handlers.
 */
export function useToast() {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  };
}