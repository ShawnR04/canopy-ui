"use client";

import * as React from "react";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  Loader2,
  X,
  type LucideIcon,
} from "lucide-react";

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export type ToastVariant =
  | "default"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "custom"
  | "loading";

export type ToastPosition =
  | "top-right"
  | "bottom-right"
  | "top-center"
  | "bottom-center"
  | "top-left"
  | "bottom-left";

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

export interface ToasterProps {
  defaultDuration?: number;
  position?: ToastPosition;
}

// =============================================================================
// DYNAMIC POSITION STORE
// =============================================================================

const positionListeners = new Set<() => void>();
let activePositionState: ToastPosition = "top-center";

export function setToastPosition(position: ToastPosition) {
  activePositionState = position;
  positionListeners.forEach((listener) => listener());
}

function subscribePosition(callback: () => void) {
  positionListeners.add(callback);
  return () => {
    positionListeners.delete(callback);
  };
}

function getPositionSnapshot(): ToastPosition {
  return activePositionState;
}

// =============================================================================
// VARIANT STYLING CONFIGURATION
// =============================================================================

const variantStyles: Record<
  string,
  {
    bg: string;
    border: string;
    title: string;
    description: string;
    progress: string;
    iconColor: string;
    badge: string;
    icon: LucideIcon | null;
  }
> = {
  default: {
    bg: "bg-card dark:bg-neutral-900/95",
    border: "border-border dark:border-neutral-700/80",
    title: "text-neutral-900 dark:text-neutral-50",
    description: "text-neutral-600 dark:text-neutral-200",
    progress: "bg-neutral-900/20 dark:bg-neutral-400",
    iconColor: "text-neutral-700 dark:text-neutral-300",
    badge:
      "bg-neutral-200 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-100 border-neutral-300 dark:border-neutral-700",
    icon: null,
  },
  success: {
    bg: "bg-success-bg dark:bg-emerald-950/60",
    border: "border-success/40 dark:border-emerald-500/50",
    title: "text-emerald-950 dark:text-emerald-100",
    description: "text-emerald-800 dark:text-emerald-200/90",
    progress: "bg-emerald-600 dark:bg-emerald-400",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    badge:
      "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/80 dark:text-emerald-100 border-emerald-300 dark:border-emerald-700",
    icon: CheckCircle2,
  },
  error: {
    bg: "bg-destructive/10 dark:bg-red-950/60",
    border: "border-destructive/30 dark:border-red-500/50",
    title: "text-red-950 dark:text-red-100",
    description: "text-red-800 dark:text-red-200/90",
    progress: "bg-destructive dark:bg-red-400",
    iconColor: "text-red-600 dark:text-red-400",
    badge:
      "bg-red-100 text-red-900 dark:bg-red-900/80 dark:text-red-100 border-red-300 dark:border-red-700",
    icon: AlertCircle,
  },
  warning: {
    bg: "bg-warning-bg dark:bg-amber-950/60",
    border: "border-warning/40 dark:border-amber-500/50",
    title: "text-amber-950 dark:text-amber-100",
    description: "text-amber-800 dark:text-amber-200/90",
    progress: "bg-amber-600 dark:bg-amber-400",
    iconColor: "text-amber-600 dark:text-amber-400",
    badge:
      "bg-amber-100 text-amber-900 dark:bg-amber-900/80 dark:text-amber-100 border-amber-300 dark:border-amber-700",
    icon: AlertTriangle,
  },
  info: {
    bg: "bg-accent dark:bg-sky-950/60",
    border: "border-primary/30 dark:border-sky-500/50",
    title: "text-sky-950 dark:text-sky-100",
    description: "text-sky-800 dark:text-sky-200/90",
    progress: "bg-primary dark:bg-sky-400",
    iconColor: "text-sky-600 dark:text-sky-400",
    badge:
      "bg-sky-100 text-sky-900 dark:bg-sky-900/80 dark:text-sky-100 border-sky-300 dark:border-sky-700",
    icon: Info,
  },
  loading: {
    bg: "bg-card dark:bg-neutral-900/95",
    border: "border-border dark:border-neutral-700/80",
    title: "text-neutral-900 dark:text-neutral-50",
    description: "text-neutral-600 dark:text-neutral-200",
    progress: "bg-primary dark:bg-sky-400",
    iconColor: "text-primary dark:text-sky-400 animate-spin",
    badge:
      "bg-neutral-200 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-100 border-neutral-300 dark:border-neutral-700",
    icon: Loader2,
  },
};

// =============================================================================
// STATE STORE & ENGINE
// =============================================================================

const TOAST_LIMIT = 5;
const DEFAULT_MAX_COUNT = 5;
const TOAST_REMOVE_DELAY = 0;

type Action =
  | { type: "ADD_TOAST"; toast: ToastItem }
  | { type: "UPDATE_TOAST"; toast: Partial<ToastItem> }
  | { type: "DISMISS_TOAST"; toastId?: string }
  | { type: "REMOVE_TOAST"; toastId?: string };

interface State {
  toasts: ToastItem[];
}

function genId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) return;

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({ type: "REMOVE_TOAST", toastId });
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(toastId, timeout);
};

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST": {
      const existingByIdIndex = state.toasts.findIndex((t) => t.id === action.toast.id);

      if (existingByIdIndex !== -1) {
        return {
          ...state,
          toasts: state.toasts.map((t) =>
            t.id === action.toast.id ? { ...t, ...action.toast, open: true } : t
          ),
        };
      }

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

        const rest = state.toasts.filter((t) => t.id !== existing.id);
        return {
          ...state,
          toasts: [updatedToast, ...rest].slice(0, TOAST_LIMIT),
        };
      }

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

      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach((t) => addToRemoveQueue(t.id));
      }

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

const listeners = new Set<() => void>();
let memoryState: State = { toasts: [] };

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => listener());
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function getSnapshot(): State {
  return memoryState;
}

// =============================================================================
// DISPATCHER API & CONVENIENCE METHODS
// =============================================================================

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

toast.success = (title: React.ReactNode, options?: Omit<ToastOptions, "title" | "variant">) =>
  toast({ ...options, title, variant: "success" });

toast.error = (title: React.ReactNode, options?: Omit<ToastOptions, "title" | "variant">) =>
  toast({ ...options, title, variant: "error" });

toast.warning = (title: React.ReactNode, options?: Omit<ToastOptions, "title" | "variant">) =>
  toast({ ...options, title, variant: "warning" });

toast.info = (title: React.ReactNode, options?: Omit<ToastOptions, "title" | "variant">) =>
  toast({ ...options, title, variant: "info" });

toast.loading = (title: React.ReactNode, options?: Omit<ToastOptions, "title" | "variant">) =>
  toast({ ...options, title, variant: "loading", duration: 0 });

toast.dismiss = (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId });

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

// =============================================================================
// REACT CONSUMER HOOK
// =============================================================================

export function useToast() {
  const state = React.useSyncExternalStore(subscribe, getSnapshot, () => memoryState);

  return {
    ...state,
    toast,
    setToastPosition,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  };
}

// =============================================================================
// UI COMPONENTS (TOASTER & TOAST ELEMENT)
// =============================================================================

export function Toaster({ defaultDuration = 4000, position }: ToasterProps) {
  const { toasts, dismiss } = useToast();
  const storePosition = React.useSyncExternalStore(
    subscribePosition,
    getPositionSnapshot,
    (): ToastPosition => "top-center"
  );

  const activePosition: ToastPosition = position ?? storePosition;

  const positionClasses: Record<ToastPosition, string> = {
    "top-right": "top-4 right-4 items-end",
    "top-left": "top-4 left-4 items-start",
    "bottom-right": "bottom-4 right-4 items-end",
    "bottom-left": "bottom-4 left-4 items-start",
    "top-center": "top-4 left-1/2 -translate-x-1/2 items-center",
    "bottom-center": "bottom-4 left-1/2 -translate-x-1/2 items-center",
  };

  return (
    <>
      <style>{`
        /* Progress & Description animations */
        @keyframes toast-progress {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }
        @keyframes toast-expand {
          from { grid-template-rows: 0fr; }
          to { grid-template-rows: 1fr; }
        }
        @keyframes toast-fade-in {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes toast-pop {
          0% { transform: scale(0.6); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        @keyframes toast-shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-2px); }
          75% { transform: translateX(2px); }
        }

        /* Directional Pop-in Animations */
        @keyframes toast-slide-in-right {
          0% {
            opacity: 0;
            transform: translate3d(100%, 0, 0) scale(0.9);
          }
          70% {
            transform: translate3d(-4px, 0, 0) scale(1.01);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }

        @keyframes toast-slide-in-left {
          0% {
            opacity: 0;
            transform: translate3d(-100%, 0, 0) scale(0.9);
          }
          70% {
            transform: translate3d(4px, 0, 0) scale(1.01);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }

        @keyframes toast-slide-in-top {
          0% {
            opacity: 0;
            transform: translate3d(0, -100%, 0) scale(0.9);
          }
          70% {
            transform: translate3d(0, 4px, 0) scale(1.01);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }

        @keyframes toast-slide-in-bottom {
          0% {
            opacity: 0;
            transform: translate3d(0, 100%, 0) scale(0.9);
          }
          70% {
            transform: translate3d(0, -4px, 0) scale(1.01);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }
      `}</style>

      <div
        className={`fixed z-50 pointer-events-none flex flex-col gap-2 p-4 w-full max-w-sm transition-all duration-300 ease-out ${positionClasses[activePosition]}`}
      >
        {toasts.map((item) => (
          <ToastElement
            key={item.id}
            toast={item}
            position={activePosition}
            defaultDuration={defaultDuration}
            onDismiss={() => dismiss(item.id)}
          />
        ))}
      </div>
    </>
  );
}

function ToastElement({
  toast,
  position,
  defaultDuration,
  onDismiss,
}: {
  toast: ToastItem;
  position: ToastPosition;
  defaultDuration: number;
  onDismiss: () => void;
}) {
  const isAutoDismissible = toast.variant !== "loading" && (toast.duration === undefined || toast.duration > 0);
  const activeDuration = toast.duration ?? defaultDuration;
  const showProgress = toast.showProgress ?? isAutoDismissible;

  const [isPaused, setIsPaused] = React.useState(false);
  const remainingTimeRef = React.useRef<number>(activeDuration);
  const startTimeRef = React.useRef<number>(0);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    remainingTimeRef.current = activeDuration;
  }, [toast.variant, toast.title, toast.count, activeDuration]);

  React.useEffect(() => {
    if (!isAutoDismissible || isPaused) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    startTimeRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      onDismiss();
    }, remainingTimeRef.current);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isAutoDismissible, isPaused, toast.variant, toast.title, toast.count, activeDuration, onDismiss]);

  const handleMouseEnter = () => {
    if (!isAutoDismissible) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    const elapsed = Date.now() - startTimeRef.current;
    remainingTimeRef.current = Math.max(remainingTimeRef.current - elapsed, 0);
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    if (!isAutoDismissible) return;
    setIsPaused(false);
  };

  const variant = toast.variant || "default";
  const defaultStyle = variantStyles[variant] || variantStyles.default;
  const IconComponent = toast.icon !== undefined ? null : defaultStyle.icon;

  const customInlineStyle: React.CSSProperties = {};
  if (toast.customColor?.bg) customInlineStyle.backgroundColor = toast.customColor.bg;
  if (toast.customColor?.border) customInlineStyle.borderColor = toast.customColor.border;
  if (toast.customColor?.text) customInlineStyle.color = toast.customColor.text;

  // Directional animation resolution
  const animationMap: Record<ToastPosition, string> = {
    "top-right": "toast-slide-in-right 320ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
    "bottom-right": "toast-slide-in-right 320ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
    "top-left": "toast-slide-in-left 320ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
    "bottom-left": "toast-slide-in-left 320ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
    "top-center": "toast-slide-in-top 320ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
    "bottom-center": "toast-slide-in-bottom 320ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
  };

  customInlineStyle.animation = animationMap[position] || animationMap["top-center"];

  const userHasBg = Boolean(toast.customColor?.bg || toast.className?.match(/(?:^|\s)bg-/));
  const userHasBorder = Boolean(toast.customColor?.border || toast.className?.match(/(?:^|\s)border-/));
  const userHasText = Boolean(toast.customColor?.text || toast.className?.match(/(?:^|\s)text-/));

  const isError = variant === "error";

  return (
    <div
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
      style={customInlineStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`pointer-events-auto relative overflow-hidden flex items-start gap-3 w-full p-4 rounded-[var(--radius-lg,0.625rem)] border shadow-xl dark:shadow-2xl dark:shadow-black/70 dark:ring-1 dark:ring-white/10 backdrop-blur-md will-change-transform ${
        !userHasBg ? defaultStyle.bg : ""
      } ${!userHasBorder ? defaultStyle.border : ""} ${toast.className || ""}`}
    >
      {toast.icon !== undefined ? (
        <div className="shrink-0 mt-0.5">{toast.icon}</div>
      ) : (
        IconComponent && (
          <IconComponent
            className={`w-5 h-5 mt-0.5 shrink-0 ${!toast.customColor?.icon ? defaultStyle.iconColor : ""}`}
            style={{ color: toast.customColor?.icon }}
          />
        )
      )}

      {/* Toast Content Area */}
      <div className="flex-1 text-sm">
        <div className="flex items-center gap-2">
          {toast.title && (
            <div
              className={`font-semibold leading-tight tracking-tight ${
                !userHasText ? defaultStyle.title : ""
              }`}
            >
              {toast.title}
            </div>
          )}

          {/* Duplication Counter / Max Badge */}
          {toast.count > 1 && (
            <span
              key={`${toast.count}-${toast.maxReached}`}
              style={{
                animation: toast.maxReached
                  ? "toast-shake 200ms ease-in-out"
                  : "toast-pop 200ms ease-out",
              }}
              className={`inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold rounded-full border shadow-sm transition-transform ${
                defaultStyle.badge
              } ${toast.maxReached ? "ring-1 ring-destructive/40" : ""}`}
            >
              {toast.maxReached ? `×${toast.count} (max)` : `×${toast.count}`}
            </span>
          )}
        </div>

        {toast.description && (
          <div
            className="grid overflow-hidden"
            style={{
              gridTemplateRows: "0fr",
              animation: "toast-expand 250ms cubic-bezier(0.16, 1, 0.3, 1) 200ms forwards",
            }}
          >
            <div className="overflow-hidden">
              <div
                className={`leading-relaxed text-xs pt-1 opacity-0 font-normal ${
                  !userHasText ? defaultStyle.description : "opacity-90"
                }`}
                style={{
                  animation: "toast-fade-in 200ms ease-out 200ms forwards",
                }}
              >
                {toast.description}
              </div>
            </div>
          </div>
        )}

        {toast.action && <div className="pt-2">{toast.action}</div>}
      </div>

      <button
        onClick={onDismiss}
        aria-label="Close toast"
        className="p-1 rounded-md opacity-70 hover:opacity-100 hover:bg-neutral-500/15 dark:hover:bg-white/10 transition-colors text-inherit"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Progress Bar */}
      {showProgress && isAutoDismissible && (
        <div
          key={`${toast.id}-${toast.variant}-${toast.count}`}
          className={`absolute bottom-0 left-0 right-0 h-1 origin-left ${
            !toast.customColor?.progress ? defaultStyle.progress : ""
          }`}
          style={{
            backgroundColor: toast.customColor?.progress,
            animation: `toast-progress ${activeDuration}ms linear forwards`,
            animationPlayState: isPaused ? "paused" : "running",
          }}
        />
      )}
    </div>
  );
}