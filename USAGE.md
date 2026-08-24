# Toast Usage

This guide covers how to use the `toast` component after adding it to your project with Canopy UI.

The component includes a complete toast system in one file, including the `Toaster` component, `toast` API, `useToast` hook, variants, promise handling, positioning, custom styling, progress bars, duplicate handling, and loading states.

## 1. Add the Component

Install the toast component using the Canopy UI CLI:

```bash
npx @marv3l/canopy-ui add toast
```

This adds the toast component source code directly to your project.

## 2. Add the Toaster

Place the `<Toaster />` component once near the root of your application.

For a Next.js application, you can add it to your root layout:

```tsx
import { Toaster } from "@/components/ui/toast";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
```

The `Toaster` accepts a default duration and a position. By default, toasts remain visible for `4000ms` and appear at the top center of the screen.

### Custom Defaults

```tsx
<Toaster
  defaultDuration={5000}
  position="top-right"
/>
```

Available positions:

```tsx
type ToastPosition =
  | "top-right"
  | "bottom-right"
  | "top-center"
  | "bottom-center"
  | "top-left"
  | "bottom-left";
```

## 3. Import `toast`

Import the toast API anywhere you need to trigger a notification:

```tsx
import { toast } from "@/components/ui/toast";
```

Then trigger a toast:

```tsx
toast({
  title: "Notification",
  description: "This is a default toast.",
});
```

## 4. Success Toast

Use `toast.success()` for successful actions:

```tsx
toast.success("Changes saved");
```

You can also include a description:

```tsx
toast.success("Profile updated", {
  description: "Your changes have been saved successfully.",
});
```

## 5. Error Toast

Use `toast.error()` when an action fails:

```tsx
toast.error("Something went wrong");
```

With additional details:

```tsx
toast.error("Unable to save changes", {
  description: "Please try again in a few moments.",
});
```

## 6. Warning Toast

Use `toast.warning()` to notify users about something requiring attention:

```tsx
toast.warning("Unsaved changes");
```

```tsx
toast.warning("Storage almost full", {
  description: "Consider removing files you no longer need.",
});
```

## 7. Info Toast

Use `toast.info()` for helpful information:

```tsx
toast.info("New update available");
```

```tsx
toast.info("Maintenance scheduled", {
  description: "The application will be temporarily unavailable tonight.",
});
```

## 8. Loading Toast

Use `toast.loading()` for actions that are still in progress:

```tsx
const loadingToast = toast.loading("Uploading file");
```

Loading toasts do not automatically disappear. You can dismiss them manually:

```tsx
const loadingToast = toast.loading("Uploading file");

// Complete your operation

loadingToast.dismiss();
```

You can also update the toast when the operation finishes:

```tsx
const loadingToast = toast.loading("Uploading file");

setTimeout(() => {
  loadingToast.update({
    title: "Upload complete",
    variant: "success",
    duration: 4000,
  });
}, 2000);
```

## 9. Promise Toasts

Use `toast.promise()` to automatically transition from a loading state to either a success or error state.

```tsx
toast.promise(saveProfile(), {
  loading: "Saving profile...",
  success: "Profile saved successfully",
  error: "Unable to save profile",
});
```

You can also use the resolved data:

```tsx
toast.promise(createUser(), {
  loading: "Creating account...",
  success: (user) => `Welcome, ${user.name}`,
  error: "Unable to create your account",
});
```

The promise toast creates a loading notification first, then updates the same toast when the promise resolves or rejects.

## 10. Custom Duration

Set a custom duration for an individual toast:

```tsx
toast.success("Changes saved", {
  duration: 8000,
});
```

Durations are measured in milliseconds.

```tsx
toast.info("Quick notification", {
  duration: 2000,
});
```

To keep a non-loading toast visible until it is manually dismissed, use:

```tsx
toast({
  title: "Important message",
  description: "This toast will remain visible.",
  duration: 0,
});
```

## 11. Hide the Progress Bar

By default, automatically dismissible toasts display a progress bar.

Disable it with `showProgress`:

```tsx
toast.success("Changes saved", {
  showProgress: false,
});
```

## 12. Add a Custom Icon

You can provide your own React element as the toast icon:

```tsx
import { Bell } from "lucide-react";

toast({
  title: "New notification",
  description: "You have a new message.",
  icon: <Bell className="h-5 w-5" />,
});
```

Providing an icon replaces the default icon for the selected variant.

## 13. Add an Action

Use `action` to add custom interactive content to a toast:

```tsx
toast({
  title: "Item deleted",
  description: "The item has been moved to the trash.",
  action: (
    <button
      onClick={() => {
        console.log("Undo deletion");
      }}
      className="text-sm font-medium underline"
    >
      Undo
    </button>
  ),
});
```

You can use any valid React element for the action.

## 14. Custom Colors

Use `customColor` to override the toast colors.

```tsx
toast({
  title: "Custom toast",
  description: "This toast uses custom colors.",
  customColor: {
    bg: "#18181b",
    text: "#ffffff",
    border: "#3f3f46",
    progress: "#22c55e",
    icon: "#22c55e",
  },
});
```

Available color options:

| Property   | Description            |
| ---------- | ---------------------- |
| `bg`       | Toast background color |
| `text`     | Text color             |
| `border`   | Border color           |
| `progress` | Progress bar color     |
| `icon`     | Default icon color     |

You can use hex values, CSS variables, or other valid CSS color values:

```tsx
toast({
  title: "Custom theme",
  customColor: {
    bg: "var(--card)",
    text: "var(--foreground)",
    border: "var(--primary)",
    progress: "var(--primary)",
  },
});
```

## 15. Custom Tailwind Classes

Use `className` to apply additional styling:

```tsx
toast.success("Deployment complete", {
  className: "rounded-2xl shadow-2xl",
});
```

You can also override background, border, and text utility classes:

```tsx
toast({
  title: "Custom styled toast",
  description: "Styled with Tailwind utilities.",
  className:
    "bg-violet-600 border-violet-500 text-white rounded-xl shadow-xl",
});
```

## 16. Dynamic Positioning

You can change the toast position globally with `setToastPosition()`:

```tsx
import {
  setToastPosition,
  toast,
} from "@/components/ui/toast";

setToastPosition("bottom-right");

toast.success("Position updated");
```

For example, a user preference setting could control where future toasts appear:

```tsx
const positions = [
  "top-right",
  "bottom-right",
  "top-center",
  "bottom-center",
  "top-left",
  "bottom-left",
] as const;

function handlePositionChange(
  position: (typeof positions)[number]
) {
  setToastPosition(position);

  toast.success("Toast position updated");
}
```

If the `<Toaster />` receives a `position` prop directly, that position takes priority over the global position state.

## 17. Dismiss a Specific Toast

Every call to `toast()` returns an object containing the toast ID, `dismiss()`, and `update()` functions.

```tsx
const notification = toast({
  title: "Processing request",
  duration: 0,
});

notification.dismiss();
```

You can also dismiss a toast using its ID:

```tsx
const notification = toast({
  title: "Processing request",
  duration: 0,
});

toast.dismiss(notification.id);
```

## 18. Dismiss All Toasts

Call `toast.dismiss()` without an ID to remove every active toast:

```tsx
toast.dismiss();
```

## 19. Update a Toast

Create a toast and update it later:

```tsx
const notification = toast({
  title: "Uploading file",
  description: "Please wait...",
  variant: "loading",
  duration: 0,
});

setTimeout(() => {
  notification.update({
    title: "Upload complete",
    description: "Your file is ready.",
    variant: "success",
    duration: 4000,
  });
}, 3000);
```

You can also use a fixed ID to update the same toast by triggering another toast with that ID:

```tsx
toast({
  id: "upload-status",
  title: "Uploading file",
  variant: "loading",
  duration: 0,
});

toast.success("Upload complete", {
  id: "upload-status",
  description: "Your file has been uploaded.",
});
```

## 20. Prevent Excessive Duplicate Toasts

When the same toast is triggered repeatedly, identical active toasts are grouped together instead of endlessly creating new cards.

```tsx
toast.success("Saved");
toast.success("Saved");
toast.success("Saved");
```

The toast will display a count indicating how many times the same notification was triggered.

You can control the maximum duplicate count:

```tsx
toast.success("Saved", {
  maxCount: 3,
});
```

The component also limits the total number of visible toast cards.

## 21. Using `useToast`

The `useToast()` hook gives React components access to the current toast state and toast controls.

```tsx
"use client";

import { useToast } from "@/components/ui/toast";

export function ToastControls() {
  const {
    toasts,
    toast,
    dismiss,
    setToastPosition,
  } = useToast();

  return (
    <div>
      <button
        onClick={() =>
          toast.success("Hello from useToast")
        }
      >
        Show Toast
      </button>

      <button
        onClick={() => dismiss()}
      >
        Dismiss All
      </button>

      <button
        onClick={() => setToastPosition("bottom-right")}
      >
        Move Toasts
      </button>

      <p>Active toasts: {toasts.length}</p>
    </div>
  );
}
```

The hook exposes the active toast state, the `toast` API, global position controls, and a dismiss function.

## 22. Available Variants

The toast component supports the following variants:

```tsx
type ToastVariant =
  | "default"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "custom"
  | "loading";
```

Examples:

```tsx
toast({
  title: "Default toast",
  variant: "default",
});

toast.success("Success toast");

toast.error("Error toast");

toast.warning("Warning toast");

toast.info("Information toast");

toast.loading("Loading toast");
```

## Complete Example

```tsx
"use client";

import {
  Toaster,
  toast,
} from "@/components/ui/toast";

export default function ToastExample() {
  return (
    <>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() =>
            toast.success("Changes saved", {
              description: "Your settings have been updated.",
            })
          }
        >
          Success
        </button>

        <button
          onClick={() =>
            toast.error("Something went wrong", {
              description: "Please try again.",
            })
          }
        >
          Error
        </button>

        <button
          onClick={() =>
            toast.warning("Unsaved changes")
          }
        >
          Warning
        </button>

        <button
          onClick={() =>
            toast.info("New update available")
          }
        >
          Info
        </button>

        <button
          onClick={() =>
            toast.loading("Processing request")
          }
        >
          Loading
        </button>

        <button
          onClick={() =>
            toast({
              title: "Custom toast",
              description: "Fully customizable notification.",
              customColor: {
                bg: "#18181b",
                text: "#ffffff",
                border: "#3f3f46",
                progress: "#22c55e",
              },
            })
          }
        >
          Custom
        </button>
      </div>

      <Toaster />
    </>
  );
}
```

## API Reference

### `Toaster`

```tsx
<Toaster
  defaultDuration={4000}
  position="top-center"
/>
```

| Prop              | Type            | Default        | Description                              |
| ----------------- | --------------- | -------------- | ---------------------------------------- |
| `defaultDuration` | `number`        | `4000`         | Default display duration in milliseconds |
| `position`        | `ToastPosition` | `"top-center"` | Default toast position                   |

### `toast(options)`

```tsx
toast({
  id: "optional-id",
  title: "Toast title",
  description: "Toast description",
  variant: "success",
  duration: 4000,
  maxCount: 5,
  showProgress: true,
  icon: <Icon />,
  action: <button>Undo</button>,
  customColor: {},
  className: "",
});
```

| Option         | Description                                                |
| -------------- | ---------------------------------------------------------- |
| `id`           | Optional unique toast ID                                   |
| `title`        | Main toast content                                         |
| `description`  | Secondary descriptive content                              |
| `action`       | Custom React content displayed below the description       |
| `variant`      | Toast visual variant                                       |
| `duration`     | Display duration in milliseconds                           |
| `maxCount`     | Maximum duplicate count                                    |
| `showProgress` | Controls the progress bar                                  |
| `icon`         | Custom React icon                                          |
| `customColor`  | Custom background, text, border, progress, and icon colors |
| `className`    | Additional Tailwind classes                                |

### Helper Methods

```tsx
toast.success("Success");

toast.error("Error");

toast.warning("Warning");

toast.info("Information");

toast.loading("Loading");

toast.dismiss();

toast.promise(promise, {
  loading: "Loading...",
  success: "Completed",
  error: "Failed",
});
```

### `useToast()`

```tsx
const {
  toasts,
  toast,
  setToastPosition,
  dismiss,
} = useToast();
```

## Notes

* Add `<Toaster />` once near the root of your application.
* Import and call `toast` from client-side interactive code.
* Loading toasts remain visible until they are dismissed or updated.
* Toast timers pause while the user hovers over an automatically dismissible toast.
* Use `toast.promise()` for async operations that need loading, success, and error feedback.
* Use `id` values when you need to update an existing toast instead of creating a new one.
* Use `customColor` or `className` when the built-in variants do not match your design system.
