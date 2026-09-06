"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90 focus-visible:ring-primary",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 focus-visible:ring-destructive",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground focus-visible:ring-primary",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 focus-visible:ring-secondary",
        ghost:
          "hover:bg-accent hover:text-accent-foreground focus-visible:ring-accent",
        link: "text-primary underline-offset-4 hover:underline focus-visible:ring-primary",
        success:
          "bg-success text-success-foreground shadow-sm hover:bg-success/90 focus-visible:ring-success",
      },
      size: {
        default: "h-9 px-4 py-2 [&_svg:not([class*='size-'])]:size-4",
        sm: "h-8 rounded-md px-3 text-xs [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-10 rounded-md px-6 text-base [&_svg:not([class*='size-'])]:size-5",
        icon: "size-9 p-0 [&_svg:not([class*='size-'])]:size-4",
        "icon-sm": "size-8 p-0 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg": "size-10 p-0 [&_svg:not([class*='size-'])]:size-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      loadingText,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    // 1. Resolve internal contents based on current state
    const renderChildren = (baseChildren: React.ReactNode) => {
      if (loading) {
        return (
          <>
            <Loader2 className="animate-spin" />
            {loadingText !== undefined ? loadingText : baseChildren}
          </>
        );
      }

      return (
        <>
          {leftIcon}
          {baseChildren}
          {rightIcon}
        </>
      );
    };

    // 2. Polymorphic Slot delegation (Radix UI)
    if (asChild) {
      if (!React.isValidElement(children)) {
        return null;
      }

      const childElement = children as React.ReactElement<{ children?: React.ReactNode }>;

      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          aria-disabled={disabled || loading || undefined}
          {...props}
        >
          {React.cloneElement(
            childElement,
            {},
            renderChildren(childElement.props.children)
          )}
        </Slot>
      );
    }

    // 3. Standard native <button>
    return (
      <button
        type="button"
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {renderChildren(children)}
      </button>
    );
  }
);

Button.displayName = "Button";