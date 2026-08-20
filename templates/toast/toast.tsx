"use client";

// Import React runtime and component types
import * as React from "react";
// Import semantic SVG icons from lucide-react
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";
// Import toast hook and type interfaces
import { useToast, ToastItem } from "./use-toast";

// Props accepted by the root Toaster container mounted in the root layout
export interface ToasterProps {
  // Global lifespan (in milliseconds) for all toasts; defaults to 4000ms
  defaultDuration?: number;
  // Screen viewport placement position
  position?: "top-right" | "bottom-right" | "top-center" | "bottom-center" | "top-left" | "bottom-left";
}

// Visual preset configurations mapped to semantic & dark-safe theme tokens
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
    icon: any;
  }
> = {
  default: {
    bg: "bg-card dark:bg-neutral-900/95",
    border: "border-border dark:border-neutral-700/80",
    title: "text-neutral-900 dark:text-neutral-50",
    description: "text-neutral-600 dark:text-neutral-200",
    progress: "bg-neutral-900/20 dark:bg-neutral-400",
    iconColor: "text-neutral-700 dark:text-neutral-300",
    badge: "bg-neutral-200 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-100 border-neutral-300 dark:border-neutral-700",
    icon: null,
  },
  success: {
    bg: "bg-success-bg dark:bg-emerald-950/60",
    border: "border-success/40 dark:border-emerald-500/50",
    title: "text-emerald-950 dark:text-emerald-100",
    description: "text-emerald-800 dark:text-emerald-200/90",
    progress: "bg-emerald-600 dark:bg-emerald-400",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    badge: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/80 dark:text-emerald-100 border-emerald-300 dark:border-emerald-700",
    icon: CheckCircle2,
  },
  error: {
    bg: "bg-destructive/10 dark:bg-red-950/60",
    border: "border-destructive/30 dark:border-red-500/50",
    title: "text-red-950 dark:text-red-100",
    description: "text-red-800 dark:text-red-200/90",
    progress: "bg-destructive dark:bg-red-400",
    iconColor: "text-red-600 dark:text-red-400",
    badge: "bg-red-100 text-red-900 dark:bg-red-900/80 dark:text-red-100 border-red-300 dark:border-red-700",
    icon: AlertCircle,
  },
  warning: {
    bg: "bg-warning-bg dark:bg-amber-950/60",
    border: "border-warning/40 dark:border-amber-500/50",
    title: "text-amber-950 dark:text-amber-100",
    description: "text-amber-800 dark:text-amber-200/90",
    progress: "bg-amber-600 dark:bg-amber-400",
    iconColor: "text-amber-600 dark:text-amber-400",
    badge: "bg-amber-100 text-amber-900 dark:bg-amber-900/80 dark:text-amber-100 border-amber-300 dark:border-amber-700",
    icon: AlertTriangle,
  },
  info: {
    bg: "bg-accent dark:bg-sky-950/60",
    border: "border-primary/30 dark:border-sky-500/50",
    title: "text-sky-950 dark:text-sky-100",
    description: "text-sky-800 dark:text-sky-200/90",
    progress: "bg-primary dark:bg-sky-400",
    iconColor: "text-sky-600 dark:text-sky-400",
    badge: "bg-sky-100 text-sky-900 dark:bg-sky-900/80 dark:text-sky-100 border-sky-300 dark:border-sky-700",
    icon: Info,
  },
};

// Root Toaster Component placed into layout.tsx
export function Toaster({ defaultDuration = 4000, position = "top-center" }: ToasterProps) {
  const { toasts, dismiss } = useToast();

  const positionClasses = {
    "top-right": "top-4 right-4 items-end",
    "top-left": "top-4 left-4 items-start",
    "bottom-right": "bottom-4 right-4 items-end",
    "bottom-left": "bottom-4 left-4 items-start",
    "top-center": "top-4 left-1/2 -translate-x-1/2 items-center",
    "bottom-center": "bottom-4 left-1/2 -translate-x-1/2 items-center",
  }[position];

  return (
    <>
      <style>{`
        @keyframes toast-progress {
          from {
            transform: scaleX(1);
          }
          to {
            transform: scaleX(0);
          }
        }
        @keyframes toast-expand {
          from {
            grid-template-rows: 0fr;
          }
          to {
            grid-template-rows: 1fr;
          }
        }
        @keyframes toast-fade-in {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes toast-pop {
          0% {
            transform: scale(0.6);
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
          }
        }
        @keyframes toast-shake {
          0%, 100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-2px);
          }
          75% {
            transform: translateX(2px);
          }
        }
      `}</style>

      <div className={`fixed z-50 pointer-events-none flex flex-col gap-2 p-4 w-full max-w-sm ${positionClasses}`}>
        {toasts.map((item) => (
          <ToastElement
            key={item.id}
            toast={item}
            defaultDuration={defaultDuration}
            onDismiss={() => dismiss(item.id)}
          />
        ))}
      </div>
    </>
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
  const duration = toast.duration ?? defaultDuration;

  // Reset lifespan timer whenever count or duration changes
  React.useEffect(() => {
    if (duration <= 0) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, toast.count, onDismiss]);

  const variant = toast.variant || "default";
  const defaultStyle = variantStyles[variant] || variantStyles.default;
  const IconComponent = defaultStyle.icon;

  // 1. Only build inline styles for values that are explicitly provided
  const customInlineStyle: React.CSSProperties = {};
  if (toast.customColor?.bg) customInlineStyle.backgroundColor = toast.customColor.bg;
  if (toast.customColor?.border) customInlineStyle.borderColor = toast.customColor.border;
  if (toast.customColor?.text) customInlineStyle.color = toast.customColor.text;

  // 2. Prevent default Tailwind classes from overriding user custom classes or inline styles
  const userHasBg = Boolean(toast.customColor?.bg || toast.className?.match(/(?:^|\s)bg-/));
  const userHasBorder = Boolean(toast.customColor?.border || toast.className?.match(/(?:^|\s)border-/));

  return (
    <div
      style={customInlineStyle}
      className={`pointer-events-auto relative overflow-hidden flex items-start gap-3 w-full p-4 rounded-[var(--radius-lg,0.625rem)] border shadow-xl dark:shadow-2xl dark:shadow-black/70 dark:ring-1 dark:ring-white/10 backdrop-blur-md transition-all duration-300 ease-out ${
        !userHasBg ? defaultStyle.bg : ""
      } ${!userHasBorder ? defaultStyle.border : ""} ${toast.className || ""}`}
    >
      {/* Render icon if preset defines one */}
      {IconComponent && (
        <IconComponent
          className={`w-5 h-5 mt-0.5 shrink-0 ${defaultStyle.iconColor}`}
          style={{ color: toast.customColor?.icon }}
        />
      )}

      {/* Toast Content Area */}
      <div className="flex-1 text-sm">
        <div className="flex items-center gap-2">
          {toast.title && (
            <div className={`font-semibold leading-tight tracking-tight ${defaultStyle.title}`}>
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

        {/* Collapsible/Expanding Description Wrapper */}
        {toast.description && (
          <div
            className="grid overflow-hidden"
            style={{
              gridTemplateRows: "0fr",
              animation: "toast-expand 250ms cubic-bezier(0.16, 1, 0.3, 1) 250ms forwards",
            }}
          >
            <div className="overflow-hidden">
              <div
                className={`leading-relaxed text-xs pt-1 opacity-0 font-normal ${defaultStyle.description}`}
                style={{
                  animation: "toast-fade-in 200ms ease-out 250ms forwards",
                }}
              >
                {toast.description}
              </div>
            </div>
          </div>
        )}

        {/* Interactive Action Button Slot */}
        {toast.action && <div className="pt-2">{toast.action}</div>}
      </div>

      {/* Close Button */}
      <button
        onClick={onDismiss}
        className="p-1 rounded-md opacity-70 hover:opacity-100 hover:bg-neutral-500/15 dark:hover:bg-white/10 transition-colors text-neutral-500 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Animated Lifespan Progress Bar (Resets on stack increment) */}
      {duration > 0 && (
        <div
          key={toast.count}
          className={`absolute bottom-0 left-0 right-0 h-1 origin-left ${
            !toast.customColor?.progress ? defaultStyle.progress : ""
          }`}
          style={{
            backgroundColor: toast.customColor?.progress,
            animation: `toast-progress ${duration}ms linear forwards`,
          }}
        />
      )}
    </div>
  );
}