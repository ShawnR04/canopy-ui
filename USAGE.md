# Toast Usage

The Canopy UI Toast component provides a flexible notification system for React and Next.js applications.

## Add the Toast Component

First, add the Toast component to your project:

```bash
npx canopy-ui add toast
```

Render the `Toaster` once in your application layout.

```tsx
import { Toaster } from "@/components/ui/toaster";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

Then import `toast` wherever you want to trigger notifications.

```tsx
import { toast } from "@/components/ui/use-toast";
```

---

## Basic Toast

Create a standard toast with a title.

```tsx
toast({
  title: "Changes saved",
});
```

You can also add a description.

```tsx
toast({
  title: "Changes saved",
  description: "Your profile has been updated successfully.",
});
```

---

## Success Toast

Use `toast.success()` for successful actions.

```tsx
toast.success("Payment successful");
```

With a description:

```tsx
toast.success("Payment successful", {
  description: "Your transaction has been completed.",
});
```

---

## Error Toast

Use `toast.error()` when something goes wrong.

```tsx
toast.error("Something went wrong");
```

With additional information:

```tsx
toast.error("Failed to save changes", {
  description: "Please try again in a moment.",
});
```

---

## Warning Toast

Use `toast.warning()` to notify users about something that requires attention.

```tsx
toast.warning("Unsaved changes");
```

```tsx
toast.warning("Storage almost full", {
  description: "Consider deleting files you no longer need.",
});
```

---

## Info Toast

Use `toast.info()` for general information.

```tsx
toast.info("New update available");
```

```tsx
toast.info("Welcome back", {
  description: "You have 3 new notifications.",
});
```

---

## Loading Toast

Loading toasts stay visible until they are updated or dismissed.

```tsx
toast.loading("Uploading your files...");
```

You can store the returned toast instance and dismiss it later.

```tsx
const notification = toast.loading("Uploading your files...");

// Your async operation

notification.dismiss();
```

---

## Custom Duration

Set how long a toast remains visible using `duration`.

The value is in milliseconds.

```tsx
toast.success("Changes saved", {
  duration: 3000,
});
```

Keep a toast visible indefinitely by setting the duration to `0`.

```tsx
toast({
  title: "This notification stays open",
  duration: 0,
});
```

---

## Configure Global Duration

Set a default duration for all auto-dismissible toasts through the `Toaster`.

```tsx
<Toaster defaultDuration={5000} />
```

Individual toast durations can still override this value.

```tsx
toast.success("Saved", {
  duration: 2000,
});
```

---

## Toast Positions

The `Toaster` supports six positions.

```tsx
<Toaster position="top-right" />
```

Available positions:

```tsx
"top-right"
"top-left"
"top-center"
"bottom-right"
"bottom-left"
"bottom-center"
```

Example:

```tsx
<Toaster
  position="bottom-right"
  defaultDuration={4000}
/>
```

---

## Progress Bar

Auto-dismissible toasts display a progress bar by default.

You can disable it for an individual toast.

```tsx
toast.success("Saved successfully", {
  showProgress: false,
});
```

You can explicitly enable it as well.

```tsx
toast.info("Processing request", {
  showProgress: true,
});
```

---

## Custom Colors

Customize the toast using `customColor`.

```tsx
toast({
  title: "Custom notification",
  description: "This toast uses custom colors.",
  customColor: {
    bg: "#18181b",
    text: "#ffffff",
    border: "#3f3f46",
    progress: "#8b5cf6",
    icon: "#a78bfa",
  },
});
```

You can customize only the values you need.

```tsx
toast.success("Project deployed", {
  customColor: {
    bg: "var(--primary)",
    progress: "var(--accent)",
  },
});
```

CSS variables and design tokens can also be used.

```tsx
toast({
  title: "Theme notification",
  customColor: {
    bg: "var(--card)",
    text: "var(--foreground)",
    border: "var(--border)",
  },
});
```

---

## Custom Tailwind Classes

Use `className` to apply your own Tailwind classes.

```tsx
toast({
  title: "Custom styled toast",
  className: "rounded-2xl shadow-2xl",
});
```

You can override the background and border as well.

```tsx
toast({
  title: "Important notification",
  className: "bg-purple-600 border-purple-400 text-white",
});
```

---

## Custom Icons

Override the default variant icon by passing your own React element.

```tsx
import { Rocket } from "lucide-react";

toast({
  title: "Deployment complete",
  icon: <Rocket className="h-5 w-5" />,
});
```

You can also combine custom icons with semantic variants.

```tsx
import { Bell } from "lucide-react";

toast.success("New notification", {
  icon: <Bell className="h-5 w-5" />,
});
```

---

## Toast Actions

Add an interactive action to a toast.

```tsx
toast({
  title: "File deleted",
  description: "The file has been moved to the trash.",
  action: (
    <button
      onClick={() => {
        console.log("Undo deletion");
      }}
    >
      Undo
    </button>
  ),
});
```

Example with Tailwind styling:

```tsx
toast.success("Profile updated", {
  description: "Your changes have been saved.",
  action: (
    <button className="text-sm font-medium underline">
      View Profile
    </button>
  ),
});
```

---

## Duplicate Toast Handling

Identical active toasts are automatically grouped together instead of creating unlimited duplicate notifications.

For example:

```tsx
toast.error("Failed to connect");
toast.error("Failed to connect");
toast.error("Failed to connect");
```

The toast will display a duplicate count.

You can control the maximum count for a specific toast.

```tsx
toast.error("Failed to connect", {
  maxCount: 3,
});
```

---

## Dismiss a Specific Toast

The base `toast()` function returns an instance containing the toast ID and dismissal methods.

```tsx
const notification = toast({
  title: "Processing...",
  duration: 0,
});

notification.dismiss();
```

---

## Update an Existing Toast

Use the returned `update()` method to update a toast.

```tsx
const notification = toast({
  title: "Uploading...",
  description: "Please wait.",
  duration: 0,
});

// Later...

notification.update({
  title: "Upload complete",
  description: "Your file was uploaded successfully.",
  variant: "success",
  duration: 4000,
});
```

---

## Dismiss by ID

You can dismiss a toast globally using its ID.

```tsx
const notification = toast({
  title: "Processing...",
  duration: 0,
});

toast.dismiss(notification.id);
```

---

## Dismiss All Toasts

Call `toast.dismiss()` without an ID to dismiss every active toast.

```tsx
toast.dismiss();
```

---

## Promise Toasts

Use `toast.promise()` to automatically manage loading, success, and error states for an asynchronous operation.

```tsx
toast.promise(
  fetch("/api/profile"),
  {
    loading: "Saving your changes...",
    success: "Changes saved successfully",
    error: "Failed to save changes",
  }
);
```

You can also pass a function that returns a promise.

```tsx
toast.promise(
  async () => {
    const response = await fetch("/api/profile");

    if (!response.ok) {
      throw new Error("Request failed");
    }

    return response.json();
  },
  {
    loading: "Updating profile...",
    success: "Profile updated successfully",
    error: "Unable to update your profile",
  }
);
```

---

## Promise Toasts with Response Data

The success message can use the resolved promise data.

```tsx
toast.promise(
  fetch("/api/user").then((response) => response.json()),
  {
    loading: "Loading user...",
    success: (user) => `Welcome back, ${user.name}`,
    error: "Failed to load user",
  }
);
```

The error message can also receive the error.

```tsx
toast.promise(
  saveChanges(),
  {
    loading: "Saving changes...",
    success: "Changes saved",
    error: (error) =>
      error instanceof Error
        ? error.message
        : "Something went wrong",
  }
);
```

---

## Complete Example

```tsx
"use client";

import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

export function ToastExamples() {
  return (
    <div className="flex flex-wrap gap-3">
      <Button
        onClick={() =>
          toast({
            title: "Default toast",
            description: "This is a standard notification.",
          })
        }
      >
        Default
      </Button>

      <Button
        onClick={() =>
          toast.success("Success!", {
            description: "Your changes were saved successfully.",
          })
        }
      >
        Success
      </Button>

      <Button
        onClick={() =>
          toast.error("Error", {
            description: "Something went wrong. Please try again.",
          })
        }
      >
        Error
      </Button>

      <Button
        onClick={() =>
          toast.warning("Warning", {
            description: "You have unsaved changes.",
          })
        }
      >
        Warning
      </Button>

      <Button
        onClick={() =>
          toast.info("Information", {
            description: "A new version is available.",
          })
        }
      >
        Info
      </Button>

      <Button
        onClick={() =>
          toast.loading("Processing your request...")
        }
      >
        Loading
      </Button>
    </div>
  );
}
```

## Available Methods

| Method              | Description                                             |
| ------------------- | ------------------------------------------------------- |
| `toast()`           | Create a fully customizable toast                       |
| `toast.success()`   | Create a success toast                                  |
| `toast.error()`     | Create an error toast                                   |
| `toast.warning()`   | Create a warning toast                                  |
| `toast.info()`      | Create an informational toast                           |
| `toast.loading()`   | Create a persistent loading toast                       |
| `toast.promise()`   | Handle loading, success, and error states for a promise |
| `toast.dismiss(id)` | Dismiss a specific toast                                |
| `toast.dismiss()`   | Dismiss all active toasts                               |

## Available Toast Options

| Option         | Type           | Description                                                |
| -------------- | -------------- | ---------------------------------------------------------- |
| `title`        | `ReactNode`    | Main toast content                                         |
| `description`  | `ReactNode`    | Secondary descriptive content                              |
| `action`       | `ReactNode`    | Custom interactive action                                  |
| `variant`      | `ToastVariant` | Visual toast style                                         |
| `duration`     | `number`       | Display time in milliseconds                               |
| `maxCount`     | `number`       | Maximum duplicate count                                    |
| `showProgress` | `boolean`      | Show or hide the progress bar                              |
| `icon`         | `ReactNode`    | Custom toast icon                                          |
| `customColor`  | `object`       | Custom background, text, border, progress, and icon colors |
| `className`    | `string`       | Additional Tailwind or CSS classes                         |

### Supported Variants

```tsx
"default"
"success"
"error"
"warning"
"info"
"loading"
```
