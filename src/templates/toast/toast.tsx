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
// 1. TYPES & BLUEPRINTS
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
  id?: string | undefined;
  title?: React.ReactNode | undefined;
  description?: React.ReactNode | undefined;
  action?: React.ReactNode | undefined;
  variant?: ToastVariant | undefined;
  duration?: number | undefined;
  maxCount?: number | undefined;
  showProgress?: boolean | undefined;
  icon?: React.ReactNode | undefined;
  customColor?:
    | {
        bg?: string | undefined;
        text?: string | undefined;
        border?: string | undefined;
        progress?: string | undefined;
        icon?: string | undefined;
      }
    | undefined;
  className?: string | undefined;
}

export interface ToastItem extends ToastOptions {
  id: string;
  open: boolean;
  count: number;
  maxReached?: boolean | undefined;
  createdAt: number;
  /** Flags that an exit animation is running before complete DOM unmount */
  exiting?: boolean | undefined;
}

export interface ToasterProps {
  defaultDuration?: number | undefined;
  position?: ToastPosition | undefined;
}

export interface VariantStyle {
  bg: string;
  border: string;
  title: string;
  description: string;
  progress: string;
  iconColor: string;
  badge: string;
  icon: LucideIcon | null;
}

// =============================================================================
// 2. HELPER UTILITIES
// =============================================================================

function areNodesEqual(a: React.ReactNode, b: React.ReactNode): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (React.isValidElement(a) && React.isValidElement(b)) {
    return a.key !== null && a.key !== undefined && a.key === b.key;
  }
  return false;
}

// =============================================================================
// 3. THE MEGAPHONE STORE (Position Radio Station)
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
// 4. THE COSTUME CLOSET (Solid bg-card with primary status-colored text & accents)
// =============================================================================

const variantStyles: Record<ToastVariant, VariantStyle> = {
  default: {
    bg: "bg-card",
    border: "border-border",
    title: "text-foreground",
    description: "text-muted-foreground",
    progress: "bg-primary",
    iconColor: "text-primary",
    badge: "bg-secondary text-secondary-foreground border-border",
    icon: null,
  },
  custom: {
    bg: "bg-card",
    border: "border-border",
    title: "text-foreground",
    description: "text-muted-foreground",
    progress: "bg-primary",
    iconColor: "text-primary",
    badge: "bg-secondary text-secondary-foreground border-border",
    icon: null,
  },
  success: {
    bg: "bg-card",
    border: "border-success/60 dark:border-success/70",
    title: "text-success",
    description: "text-success/80 dark:text-success/90",
    progress: "bg-success",
    iconColor: "text-success",
    badge: "bg-success/15 text-success border-success/40",
    icon: CheckCircle2,
  },
  error: {
    bg: "bg-card",
    border: "border-destructive/60 dark:border-destructive/70",
    title: "text-destructive",
    description: "text-destructive/80 dark:text-destructive/90",
    progress: "bg-destructive",
    iconColor: "text-destructive",
    badge: "bg-destructive/15 text-destructive border-destructive/40",
    icon: AlertCircle,
  },
  warning: {
    bg: "bg-card",
    border: "border-warning/60 dark:border-warning/70",
    title: "text-warning",
    description: "text-warning/80 dark:text-warning/90",
    progress: "bg-warning",
    iconColor: "text-warning",
    badge: "bg-warning/15 text-warning border-warning/40",
    icon: AlertTriangle,
  },
  info: {
    bg: "bg-card",
    border: "border-info/60 dark:border-info/70",
    title: "text-info",
    description: "text-info/80 dark:text-info/90",
    progress: "bg-info",
    iconColor: "text-info",
    badge: "bg-info/15 text-info border-info/40",
    icon: Info,
  },
  loading: {
    bg: "bg-card",
    border: "border-border",
    title: "text-foreground",
    description: "text-muted-foreground",
    progress: "bg-primary",
    iconColor: "text-primary animate-spin",
    badge: "bg-secondary text-secondary-foreground border-border",
    icon: Loader2,
  },
};

// =============================================================================
// 5. THE REDUCER
// =============================================================================

const TOAST_LIMIT = 5;
const DEFAULT_MAX_COUNT = 5;

type Action =
  | { type: "ADD_TOAST"; toast: ToastItem }
  | { type: "UPDATE_TOAST"; toast: Partial<ToastItem> }
  | { type: "START_DISMISS"; toastId?: string | undefined }
  | { type: "DISMISS_TOAST"; toastId?: string | undefined };

interface State {
  toasts: ToastItem[];
}

function genId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST": {
      const existingByIdIndex = state.toasts.findIndex((t) => t.id === action.toast.id);

      if (existingByIdIndex !== -1) {
        return {
          ...state,
          toasts: state.toasts.map((t) =>
            t.id === action.toast.id
              ? { ...t, ...action.toast, open: true, exiting: false }
              : t
          ),
        };
      }

      const existingIndex = state.toasts.findIndex(
        (t) =>
          t.open &&
          !t.exiting &&
          areNodesEqual(t.title, action.toast.title) &&
          areNodesEqual(t.description, action.toast.description) &&
          (t.variant || "default") === (action.toast.variant || "default")
      );

      if (existingIndex !== -1) {
        const existing = state.toasts[existingIndex];
        if (!existing) return state;

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
          exiting: false,
          createdAt: Date.now(),
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

    case "START_DISMISS": {
      const { toastId } = action;
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          toastId === undefined || t.id === toastId ? { ...t, exiting: true } : t
        ),
      };
    }

    case "DISMISS_TOAST": {
      const { toastId } = action;
      if (toastId) {
        return {
          ...state,
          toasts: state.toasts.filter((t) => t.id !== toastId),
        };
      }
      return {
        ...state,
        toasts: [],
      };
    }

    default:
      return state;
  }
};

// =============================================================================
// 6. THE GLOBAL TOAST VAULT
// =============================================================================

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
// 7. DEVELOPER API (toast())
// =============================================================================

export function toast(props: ToastOptions) {
  const id = props.id || genId();

  const update = (updatedProps: ToastOptions) =>
    dispatch({ type: "UPDATE_TOAST", toast: { ...updatedProps, id } });

  const dismiss = () => dispatch({ type: "START_DISMISS", toastId: id });

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      count: 1,
      maxReached: false,
      createdAt: Date.now(),
      exiting: false,
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

toast.dismiss = (toastId?: string | undefined) => dispatch({ type: "START_DISMISS", toastId });

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
// 8. REACT CONSUMER HOOK
// =============================================================================

export function useToast() {
  const state = React.useSyncExternalStore(subscribe, getSnapshot, () => memoryState);

  return {
    ...state,
    toast,
    setToastPosition,
    dismiss: (toastId?: string | undefined) => dispatch({ type: "START_DISMISS", toastId }),
    remove: (toastId?: string | undefined) => dispatch({ type: "DISMISS_TOAST", toastId }),
  };
}

// =============================================================================
// 9. THE MASTER STAGE (<Toaster />)
// =============================================================================

export function Toaster({ defaultDuration = 4000, position }: ToasterProps) {
  const { toasts, dismiss, remove } = useToast();

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

        /* DIRECTIONAL ENTRANCES */
        @keyframes toast-slide-in-right {
          0% { opacity: 0; transform: translate3d(100%, 0, 0) scale(0.9); }
          70% { transform: translate3d(-4px, 0, 0) scale(1.01); }
          100% { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
        }
        @keyframes toast-slide-in-left {
          0% { opacity: 0; transform: translate3d(-100%, 0, 0) scale(0.9); }
          70% { transform: translate3d(4px, 0, 0) scale(1.01); }
          100% { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
        }
        @keyframes toast-slide-in-top {
          0% { opacity: 0; transform: translate3d(0, -100%, 0) scale(0.9); }
          70% { transform: translate3d(0, 4px, 0) scale(1.01); }
          100% { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
        }
        @keyframes toast-slide-in-bottom {
          0% { opacity: 0; transform: translate3d(0, 100%, 0) scale(0.9); }
          70% { transform: translate3d(0, -4px, 0) scale(1.01); }
          100% { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
        }

        /* DIRECTIONAL EXITS */
        @keyframes toast-slide-out-right {
          0% { opacity: 1; transform: translate3d(0, 0, 0) scale(1); max-height: 200px; margin-bottom: 0px; }
          40% { opacity: 0; transform: translate3d(105%, 0, 0) scale(0.92); }
          100% { opacity: 0; transform: translate3d(105%, 0, 0) scale(0.92); max-height: 0px; margin-bottom: -8px; padding-top: 0; padding-bottom: 0; }
        }
        @keyframes toast-slide-out-left {
          0% { opacity: 1; transform: translate3d(0, 0, 0) scale(1); max-height: 200px; margin-bottom: 0px; }
          40% { opacity: 0; transform: translate3d(-105%, 0, 0) scale(0.92); }
          100% { opacity: 0; transform: translate3d(-105%, 0, 0) scale(0.92); max-height: 0px; margin-bottom: -8px; padding-top: 0; padding-bottom: 0; }
        }
        @keyframes toast-slide-out-top {
          0% { opacity: 1; transform: translate3d(0, 0, 0) scale(1); max-height: 200px; margin-bottom: 0px; }
          40% { opacity: 0; transform: translate3d(0, -60%, 0) scale(0.9); }
          100% { opacity: 0; transform: translate3d(0, -60%, 0) scale(0.9); max-height: 0px; margin-bottom: -8px; padding-top: 0; padding-bottom: 0; }
        }
        @keyframes toast-slide-out-bottom {
          0% { opacity: 1; transform: translate3d(0, 0, 0) scale(1); max-height: 200px; margin-bottom: 0px; }
          40% { opacity: 0; transform: translate3d(0, 60%, 0) scale(0.9); }
          100% { opacity: 0; transform: translate3d(0, 60%, 0) scale(0.9); max-height: 0px; margin-bottom: -8px; padding-top: 0; padding-bottom: 0; }
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
            defaultDuration={defaultDuration ?? 4000}
            onDismiss={() => dismiss(item.id)}
            onRemove={() => remove(item.id)}
          />
        ))}
      </div>
    </>
  );
}

// =============================================================================
// 10. THE INDIVIDUAL TOAST CARD (<ToastElement />)
// =============================================================================

function ToastElement({
  toast,
  position,
  defaultDuration,
  onDismiss,
  onRemove,
}: {
  toast: ToastItem;
  position: ToastPosition;
  defaultDuration: number;
  onDismiss: () => void;
  onRemove: () => void;
}) {
  const isAutoDismissible =
    toast.variant !== "loading" && (toast.duration === undefined || toast.duration > 0);
  const activeDuration = toast.duration ?? defaultDuration;
  const showProgress = toast.showProgress ?? isAutoDismissible;

  const [isPaused, setIsPaused] = React.useState(false);
  const remainingTimeRef = React.useRef<number>(activeDuration);
  const startTimeRef = React.useRef<number>(0);
  const onDismissRef = React.useRef(onDismiss);

  React.useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  React.useEffect(() => {
    remainingTimeRef.current = activeDuration;
  }, [toast.id, toast.count, activeDuration]);

  React.useEffect(() => {
    if (!isAutoDismissible || isPaused || toast.exiting) return;

    startTimeRef.current = Date.now();
    const timer = setTimeout(() => {
      onDismissRef.current();
    }, remainingTimeRef.current);

    return () => {
      clearTimeout(timer);
    };
  }, [isAutoDismissible, isPaused, toast.id, toast.count, toast.createdAt, toast.exiting]);

  const handlePause = () => {
    if (!isAutoDismissible || toast.exiting) return;
    const elapsed = Date.now() - startTimeRef.current;
    remainingTimeRef.current = Math.max(remainingTimeRef.current - elapsed, 0);
    setIsPaused(true);
  };

  const handleResume = () => {
    if (!isAutoDismissible || toast.exiting) return;
    setIsPaused(false);
  };

  const variant: ToastVariant = toast.variant || "default";
  const defaultStyle: VariantStyle = variantStyles[variant] ?? variantStyles.default;
  const IconComponent = toast.icon !== undefined ? null : defaultStyle.icon;

  const customInlineStyle: React.CSSProperties = {};
  if (toast.customColor?.bg) customInlineStyle.backgroundColor = toast.customColor.bg;
  if (toast.customColor?.border) customInlineStyle.borderColor = toast.customColor.border;
  if (toast.customColor?.text) customInlineStyle.color = toast.customColor.text;

  const enterAnimationMap: Record<ToastPosition, string> = {
    "top-right": "toast-slide-in-right 320ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
    "bottom-right": "toast-slide-in-right 320ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
    "top-left": "toast-slide-in-left 320ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
    "bottom-left": "toast-slide-in-left 320ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
    "top-center": "toast-slide-in-top 320ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
    "bottom-center": "toast-slide-in-bottom 320ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
  };

  const exitAnimationMap: Record<ToastPosition, string> = {
    "top-right": "toast-slide-out-right 280ms cubic-bezier(0.4, 0, 1, 1) forwards",
    "bottom-right": "toast-slide-out-right 280ms cubic-bezier(0.4, 0, 1, 1) forwards",
    "top-left": "toast-slide-out-left 280ms cubic-bezier(0.4, 0, 1, 1) forwards",
    "bottom-left": "toast-slide-out-left 280ms cubic-bezier(0.4, 0, 1, 1) forwards",
    "top-center": "toast-slide-out-top 240ms cubic-bezier(0.4, 0, 1, 1) forwards",
    "bottom-center": "toast-slide-out-bottom 240ms cubic-bezier(0.4, 0, 1, 1) forwards",
  };

  customInlineStyle.animation = toast.exiting
    ? exitAnimationMap[position] ?? exitAnimationMap["top-center"]
    : enterAnimationMap[position] ?? enterAnimationMap["top-center"];

  const userHasBg = Boolean(toast.customColor?.bg || toast.className?.match(/(?:^|\s)bg-/));
  const userHasBorder = Boolean(toast.customColor?.border || toast.className?.match(/(?:^|\s)border-/));
  const userHasText = Boolean(toast.customColor?.text || toast.className?.match(/(?:^|\s)text-/));

  const isError = variant === "error";

  const handleAnimationEnd = (e: React.AnimationEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && toast.exiting) {
      onRemove();
    }
  };

  return (
    <div
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
      tabIndex={0}
      style={customInlineStyle}
      onAnimationEnd={handleAnimationEnd}
      onMouseEnter={handlePause}
      onMouseLeave={handleResume}
      onFocus={handlePause}
      onBlur={handleResume}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          onDismiss();
        }
      }}
      className={`pointer-events-auto relative overflow-hidden flex items-start gap-3 w-full p-4 rounded-[var(--radius-lg,0.625rem)] border shadow-xl will-change-transform outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring ${
        !userHasBg ? defaultStyle.bg : ""
      } ${!userHasBorder ? defaultStyle.border : ""} ${toast.className || ""}`}
    >
      {/* 1. Left Icon */}
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

      {/* 2. Middle Content Area */}
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
                  !userHasText ? defaultStyle.description : ""
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

      {/* 3. Close Button */}
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Close toast"
        className="p-1 rounded-md opacity-70 hover:opacity-100 hover:bg-muted transition-colors text-inherit"
      >
        <X className="w-4 h-4" />
      </button>

      {/* 4. Bottom Countdown Progress Bar */}
      {showProgress && isAutoDismissible && !toast.exiting && (
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