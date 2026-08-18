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

//TODO: Continue with `toast` code