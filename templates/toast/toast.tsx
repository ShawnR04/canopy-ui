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
// 1. TYPES & BLUEPRINTS (Rules of the Game)
// Think of these like the rulebook for a board game.
// They describe what shapes, words, and colors are allowed to exist.
// =============================================================================

/** 
 * What kind of mood is this message in?
 * - "default": Normal neutral card
 * - "success": Green happy card (good job!)
 * - "error": Red alert card (something broke!)
 * - "warning": Yellow caution card (be careful!)
 * - "info": Blue helper card (fun fact / notice)
 * - "custom": A blank canvas where you pick all the paint
 * - "loading": A spinning wheel saying "hold on, I am thinking"
 */
export type ToastVariant =
  | "default"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "custom"
  | "loading";

/** 
 * Which corner of your computer or phone screen should the popups stick to?
 */
export type ToastPosition =
  | "top-right"
  | "bottom-right"
  | "top-center"
  | "bottom-center"
  | "top-left"
  | "bottom-left";

/**
 * This is the recipe card the developer fills out when they want to make a message pop up.
 */
export interface ToastOptions {
  /** A unique secret name tag so we can find this exact message later. */
  id?: string;
  /** The big, bold title at the very top of the popup card. */
  title?: React.ReactNode;
  /** The smaller story text underneath the title that explains what happened. */
  description?: React.ReactNode;
  /** A clickable button like "Undo" or "Try Again" inside the popup. */
  action?: React.ReactNode;
  /** Which preset color mood to use (success, error, etc.). */
  variant?: ToastVariant;
  /** How many milliseconds to stay alive before vanishing (1000 ms = 1 second). */
  duration?: number;
  /** If the user clicks 100 times, only stack up to this number so the screen doesn't explode! */
  maxCount?: number;
  /** Should we show the little colored line that shrinks as time runs out? */
  showProgress?: boolean;
  /** A custom picture/icon if you don't want the default variant icon. */
  icon?: React.ReactNode;
  /** Custom paint bucket colors if you want custom background/borders. */
  customColor?: {
    bg?: string;
    text?: string;
    border?: string;
    progress?: string;
    icon?: string;
  };
  /** Extra Tailwind styling classes to decorate the card box. */
  className?: string;
}

/**
 * The internal card data kept inside the memory vault while it sits on screen.
 */
export interface ToastItem extends ToastOptions {
  id: string;
  open: boolean;
  /** How many times this identical popup was triggered in a row. */
  count: number;
  /** True if we hit our duplicate stacking ceiling. */
  maxReached?: boolean;
  /** The exact clock timestamp (millisecond) when this toast was created. */
  createdAt: number;
}

/**
 * The properties passed to the master <Toaster /> box placed in your root layout.
 */
export interface ToasterProps {
  /** Default lifespan for cards in milliseconds if none is specified (4000 = 4 seconds). */
  defaultDuration?: number;
  /** Default screen corner where cards appear. */
  position?: ToastPosition;
}

// =============================================================================
// 2. THE MEGAPHONE STORE (Position Radio Station)
// This lets any button on any page change where toasts appear on screen,
// without having to pass variables through 10 parent components.
// =============================================================================

// A VIP list of listeners holding a walkie-talkie waiting for position updates
const positionListeners = new Set<() => void>();
let activePositionState: ToastPosition = "top-center";

/**
 * The announcement button: Changes the corner and screams into the megaphone
 * so every active component moves to the new spot instantly.
 */
export function setToastPosition(position: ToastPosition) {
  activePositionState = position;
  positionListeners.forEach((listener) => listener());
}

/**
 * Handshake for React to listen to our position megaphone.
 */
function subscribePosition(callback: () => void) {
  positionListeners.add(callback);
  return () => {
    // When the component leaves the screen, take it off the listener list
    positionListeners.delete(callback);
  };
}

/**
 * Takes a quick snapshot photograph of what the active position currently is.
 */
function getPositionSnapshot(): ToastPosition {
  return activePositionState;
}

// =============================================================================
// 3. THE COSTUME CLOSET (Variant Color & Icon Themes)
// A dictionary that gives each variant its matching outfit (colors, icons, borders).
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
    // Happy emerald green theme with a checkmark badge
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
    // Red danger theme with an exclamation icon
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
    // Warm amber-yellow caution theme
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
    // Calming sky-blue theme
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
    // Spinning loader theme
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
// 4. THE BRAIN / REDUCER (The Toy Box Organizer)
// A pure calculator function that decides what to add, update, or throw away.
// =============================================================================

const TOAST_LIMIT = 5;       // Only 5 popups allowed on screen at once
const DEFAULT_MAX_COUNT = 5; // After 5 rapid clicks on the same popup, stop counting up

type Action =
  | { type: "ADD_TOAST"; toast: ToastItem }
  | { type: "UPDATE_TOAST"; toast: Partial<ToastItem> }
  | { type: "DISMISS_TOAST"; toastId?: string };

interface State {
  toasts: ToastItem[];
}

/**
 * Creates a one-of-a-kind name badge (UUID) so each toast has a unique fingerprint.
 */
function genId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * The master decision maker.
 * Whatever action comes in, it calculates the new list of toasts and sends it out.
 */
export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST": {
      // Step A: Did we already have a toast with this exact ID?
      // (Like a loading spinner that just finished and wants to turn green)
      const existingByIdIndex = state.toasts.findIndex((t) => t.id === action.toast.id);

      if (existingByIdIndex !== -1) {
        return {
          ...state,
          toasts: state.toasts.map((t) =>
            t.id === action.toast.id ? { ...t, ...action.toast, open: true } : t
          ),
        };
      }

      // Step B: Did the user click the exact same button multiple times?
      // If the Title, Description, and Variant match, don't spawn 5 identical cards.
      // Instead, increment the little "×2", "×3" bubble badge on the existing card!
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

        // Build the updated stacked toast card
        const updatedToast: ToastItem = {
          ...existing,
          ...action.toast,
          id: existing.id,
          count: newCount,
          maxReached,
          open: true,
          createdAt: Date.now(), // Reset clock so the timer starts fresh
        };

        // Move this updated card to the very top of the stack
        const rest = state.toasts.filter((t) => t.id !== existing.id);
        return {
          ...state,
          toasts: [updatedToast, ...rest].slice(0, TOAST_LIMIT),
        };
      }

      // Step C: It is a brand new unique message. Put it at the front of the list.
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };
    }

    case "UPDATE_TOAST":
      // Look through our cards and update only the matching one
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };

    case "DISMISS_TOAST": {
      const { toastId } = action;
      // Instant removal: filter out the targeted card or wipe the whole tray clean
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
// 5. THE GLOBAL TOAST VAULT
// Keeps track of the toasts outside of React components so any TypeScript function
// can fire a toast without needing a React context wrapper.
// =============================================================================

const listeners = new Set<() => void>();
let memoryState: State = { toasts: [] };

/** Dispatches actions to our reducer and rings the doorbell for all listeners */
function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => listener());
}

/** Tells React whenever the list of toasts changes */
function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

/** Returns the current list of toasts stored in memory */
function getSnapshot(): State {
  return memoryState;
}

// =============================================================================
// 6. THE DEVELOPER REMOTE CONTROL (toast() API)
// The functions you call in your app: toast.success("Yay!"), toast.error("Oops!").
// =============================================================================

/** 
 * Main toast trigger: spawns a toast card on screen and gives you back tools
 * to dismiss or update it later.
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
      createdAt: Date.now(),
    },
  });

  return { id, dismiss, update };
}

// Short-hand helper buttons for quick and easy coding
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

/**
 * The Promise Magic Trick:
 * 1. Shows a loading spinner popup.
 * 2. Waits for your network request to finish.
 * 3. Automatically transforms the card into a green checkmark on success OR a red alert on error!
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
  // Step 1: Fire off the loading card
  const instance = toast({
    ...options,
    variant: "loading",
    title: msgs.loading,
    duration: 0,
  });

  const promiseFn = typeof promise === "function" ? promise() : promise;

  // Step 2: Listen for when the task finishes
  promiseFn
    .then((data) => {
      // Task succeeded! Turn into green success card
      const successTitle = typeof msgs.success === "function" ? msgs.success(data) : msgs.success;
      toast.success(successTitle, {
        ...options,
        id: instance.id,
        duration: options?.duration ?? 4000,
      });
    })
    .catch((err: unknown) => {
      // Task failed! Turn into red error card
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
// 7. REACT CONSUMER HOOK
// Connects React components to the memory vault safely without tearing or lag.
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
// 8. THE MASTER STAGE (<Toaster />)
// The transparent container positioned in the corner of your browser.
// It draws the animations in CSS and maps over all active cards.
// =============================================================================

export function Toaster({ defaultDuration = 4000, position }: ToasterProps) {
  const { toasts, dismiss } = useToast();

  // Listen to position changes across the entire app
  const storePosition = React.useSyncExternalStore(
    subscribePosition,
    getPositionSnapshot,
    (): ToastPosition => "top-center"
  );

  // If someone hardcoded <Toaster position="..." />, prioritize that over the store
  const activePosition: ToastPosition = position ?? storePosition;

  // Map each position corner to its exact CSS layout coordinates
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
      {/* Cartoon Animation Keyframes (CSS physics for slides, shakes, and pops) */}
      <style>{`
        /* Shrinks the bottom timer bar from 100% width down to 0% width */
        @keyframes toast-progress {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }
        /* Smoothly opens the description drawer like a rolling window shade */
        @keyframes toast-expand {
          from { grid-template-rows: 0fr; }
          to { grid-template-rows: 1fr; }
        }
        /* Gently fades in the description text */
        @keyframes toast-fade-in {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        /* Springy rubber-band pop for the duplicate counter badge (×2) */
        @keyframes toast-pop {
          0% { transform: scale(0.6); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        /* Shakes left and right when you hit the maximum stack count */
        @keyframes toast-shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-2px); }
          75% { transform: translateX(2px); }
        }

        /* DIRECTIONAL ENTRANCE PHYSICS */
        /* Slides in from the right edge with a tiny spring bounce */
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

        /* Slides in from the left edge */
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

        /* Drops down from the top ceiling */
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

        /* Shoots up from the bottom floor */
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

      {/* The invisible box pinned to the screen corner */}
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

// =============================================================================
// 9. THE INDIVIDUAL TOAST CARD (<ToastElement />)
// The physical card on screen that counts down, listens for mouse hovers,
// handles dismissal, and renders your buttons.
// =============================================================================

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
  // A loading spinner never vanishes automatically; others vanish after their timer runs out
  const isAutoDismissible =
    toast.variant !== "loading" && (toast.duration === undefined || toast.duration > 0);
  const activeDuration = toast.duration ?? defaultDuration;
  const showProgress = toast.showProgress ?? isAutoDismissible;

  // STOPWATCH REFS & STATES
  const [isPaused, setIsPaused] = React.useState(false);
  const remainingTimeRef = React.useRef<number>(activeDuration);
  const startTimeRef = React.useRef<number>(0);
  const onDismissRef = React.useRef(onDismiss);

  // Always keep the freshest dismiss callback without triggering unnecessary re-renders
  React.useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  // If a new duration or duplicate stack event happens, reset our stopwatch
  React.useEffect(() => {
    remainingTimeRef.current = activeDuration;
  }, [toast.id, toast.count, activeDuration]);

  // THE DEATH TIMER EFFECT:
  // Starts a countdown. When it hits 0, it calls onDismiss() to remove itself from the screen.
  React.useEffect(() => {
    if (!isAutoDismissible || isPaused) return;

    startTimeRef.current = Date.now();
    const timer = setTimeout(() => {
      onDismissRef.current();
    }, remainingTimeRef.current);

    // If the component unmounts or pauses, stop the ticking timer immediately
    return () => {
      clearTimeout(timer);
    };
  }, [isAutoDismissible, isPaused, toast.id, toast.count, toast.createdAt]);

  // When your mouse hovers over the card, FREEZE the countdown stopwatch so you have time to read it
  const handleMouseEnter = () => {
    if (!isAutoDismissible) return;
    const elapsed = Date.now() - startTimeRef.current;
    remainingTimeRef.current = Math.max(remainingTimeRef.current - elapsed, 0);
    setIsPaused(true);
  };

  // When your mouse moves away, UNFREEZE the stopwatch and resume counting down
  const handleMouseLeave = () => {
    if (!isAutoDismissible) return;
    setIsPaused(false);
  };

  // Pick the outfit styles and icon for this card's mood
  const variant = toast.variant || "default";
  const defaultStyle = variantStyles[variant] || variantStyles.default;
  const IconComponent = toast.icon !== undefined ? null : defaultStyle.icon;

  // Apply any custom inline color overrides passed by the developer
  const customInlineStyle: React.CSSProperties = {};
  if (toast.customColor?.bg) customInlineStyle.backgroundColor = toast.customColor.bg;
  if (toast.customColor?.border) customInlineStyle.borderColor = toast.customColor.border;
  if (toast.customColor?.text) customInlineStyle.color = toast.customColor.text;

  // Pick the directional slide-in animation matching whichever corner this card was born in
  const animationMap: Record<ToastPosition, string> = {
    "top-right": "toast-slide-in-right 320ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
    "bottom-right": "toast-slide-in-right 320ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
    "top-left": "toast-slide-in-left 320ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
    "bottom-left": "toast-slide-in-left 320ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
    "top-center": "toast-slide-in-top 320ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
    "bottom-center": "toast-slide-in-bottom 320ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
  };

  customInlineStyle.animation = animationMap[position] || animationMap["top-center"];

  // Helper flags so Tailwind default classes don't fight with custom user classes
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
      {/* 1. The Left Icon */}
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

      {/* 2. Middle Content Area (Title, Description, Counter, and Buttons) */}
      <div className="flex-1 text-sm">
        <div className="flex items-center gap-2">
          {/* Main Title */}
          {toast.title && (
            <div
              className={`font-semibold leading-tight tracking-tight ${
                !userHasText ? defaultStyle.title : ""
              }`}
            >
              {toast.title}
            </div>
          )}

          {/* Duplication Badge (Shows "×2", "×3", etc. when clicked repeatedly) */}
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

        {/* Expandable Story Description Box */}
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

        {/* Custom Interactive Action Button Area (e.g., "Undo" button) */}
        {toast.action && <div className="pt-2">{toast.action}</div>}
      </div>

      {/* 3. The Close "X" Button */}
      <button
        onClick={onDismiss}
        aria-label="Close toast"
        className="p-1 rounded-md opacity-70 hover:opacity-100 hover:bg-neutral-500/15 dark:hover:bg-white/10 transition-colors text-inherit"
      >
        <X className="w-4 h-4" />
      </button>

      {/* 4. The Bottom Countdown Progress Bar (shrinks down as time ticks away) */}
      {showProgress && isAutoDismissible && (
        <div
          key={`${toast.id}-${toast.variant}-${toast.count}`}
          className={`absolute bottom-0 left-0 right-0 h-1 origin-left ${
            !toast.customColor?.progress ? defaultStyle.progress : ""
          }`}
          style={{
            backgroundColor: toast.customColor?.progress,
            animation: `toast-progress ${activeDuration}ms linear forwards`,
            animationPlayState: isPaused ? "paused" : "running", // Pauses when your mouse is hovering!
          }}
        />
      )}
    </div>
  );
}