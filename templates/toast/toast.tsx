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