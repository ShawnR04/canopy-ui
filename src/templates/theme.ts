// src/templates/theme.ts
export const CANOPY_THEME_CSS = `
/* --- Canopy UI Design Tokens --- */
:root {
  --border: #e5e5e5;
  --input: #e5e5e5;
  --ring: #171717;
  --radius-lg: 0.625rem;

  /* Primary */
  --primary: #171717;
  --primary-foreground: #fafafa;
  --primary-hover: #262626;

  /* Secondary */
  --secondary: #e5e5e5;
  --secondary-foreground: #262626;
  --secondary-hover: #d4d4d4;
  --secondary-border: #d4d4d4;

  /* Muted & Accent */
  --muted: #f5f5f5;
  --muted-foreground: #737373;
  --accent: #f5f5f5;
  --accent-foreground: #171717;
  --accent-hover: #e5e5e5;

  /* Status Colors */
  --destructive: #dc2626;
  --destructive-foreground: #ffffff;
  --destructive-hover: #b91c1c;

  --success: #059669;
  --success-foreground: #ffffff;
  --success-hover: #047857;

  --warning: #d97706;
  --warning-foreground: #ffffff;
  --warning-hover: #b45309;

  --info: #0284c7;
  --info-foreground: #ffffff;
  --info-hover: #0369a1;
}

@media (prefers-color-scheme: dark) {
  :root {
    --border: rgba(64, 64, 64, 0.8);
    --input: rgba(64, 64, 64, 0.8);
    --ring: #a3a3a3;

    --primary: #fafafa;
    --primary-foreground: #171717;
    --primary-hover: #e5e5e5;

    --secondary: #262626;
    --secondary-foreground: #fafafa;
    --secondary-hover: #404040;
    --secondary-border: #404040;

    --muted: #262626;
    --muted-foreground: #a3a3a3;
    --accent: #262626;
    --accent-foreground: #fafafa;
    --accent-hover: #333333;

    --destructive: #ef4444;
    --destructive-foreground: #ffffff;
    --destructive-hover: #dc2626;

    --success: #10b981;
    --success-foreground: #ffffff;
    --success-hover: #059669;

    --warning: #f59e0b;
    --warning-foreground: #ffffff;
    --warning-hover: #d97706;

    --info: #0ea5e9;
    --info-foreground: #ffffff;
    --info-hover: #0284c7;
  }
}

@theme inline {
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);

  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-primary-hover: var(--primary-hover);

  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-secondary-hover: var(--secondary-hover);
  --color-secondary-border: var(--secondary-border);

  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-accent-hover: var(--accent-hover);

  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-destructive-hover: var(--destructive-hover);

  --color-success: var(--success);
  --color-success-foreground: var(--success-foreground);
  --color-success-hover: var(--success-hover);

  --color-warning: var(--warning);
  --color-warning-foreground: var(--warning-foreground);
  --color-warning-hover: var(--warning-hover);

  --color-info: var(--info);
  --color-info-foreground: var(--info-foreground);
  --color-info-hover: var(--info-hover);
}
/* -------------------------------- */
`;