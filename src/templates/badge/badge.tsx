import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

export const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        primary:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
        success:
          "border-transparent bg-success text-success-foreground shadow hover:bg-success/80",
        warning:
          "border-transparent bg-warning text-warning-foreground shadow hover:bg-warning/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  /** Optional icon node to render before the text content. */
  icon?: React.ReactNode;
  /** When true, renders a pulsing indicator dot or makes the icon pulse. */
  pulse?: boolean;
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, icon, pulse = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`${badgeVariants({ variant })} ${className || ""}`}
        {...props}
      >
        {pulse && (
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
          </span>
        )}
        {icon && <span className="shrink-0 flex items-center">{icon}</span>}
        {children}
      </div>
    );
  }
);
Badge.displayName = "Badge";