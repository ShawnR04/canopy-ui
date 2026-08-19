<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Canopy UI - Technical Spec & Cheat Sheet</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&family=Inter:wght@300;400;500;600;700;800&display=swap');

    @page {
      size: A4;
      margin: 12mm 15mm 15mm 15mm;
    }

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #0f172a;
      background-color: #ffffff;
      line-height: 1.55;
      font-size: 13px;
      margin: 0;
      padding: 0;
    }

    /* Top Brand Banner */
    .header-card {
      background: linear-gradient(135deg, #090d16 0%, #1e1b4b 50%, #311042 100%);
      border-radius: 12px;
      padding: 24px;
      color: #ffffff;
      margin-bottom: 20px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    }

    .badge {
      display: inline-block;
      font-family: 'Fira Code', monospace;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      background: rgba(99, 102, 241, 0.25);
      border: 1px solid rgba(129, 140, 248, 0.4);
      color: #c7d2fe;
      padding: 3px 10px;
      border-radius: 9999px;
      margin-bottom: 10px;
    }

    .header-card h1 {
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.03em;
      margin: 0 0 6px 0;
      color: #f8fafc;
    }

    .header-card p {
      margin: 0;
      font-size: 13.5px;
      color: #94a3b8;
      font-weight: 400;
    }

    /* Section Typography */
    h2 {
      font-size: 15px;
      font-weight: 700;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin: 20px 0 10px 0;
      display: flex;
      align-items: center;
      gap: 8px;
      border-bottom: 1.5px solid #e2e8f0;
      padding-bottom: 6px;
      page-break-after: avoid;
    }

    h3 {
      font-size: 13.5px;
      font-weight: 600;
      color: #334155;
      margin: 14px 0 6px 0;
      page-break-after: avoid;
    }

    /* Command & Terminal Pill */
    .cli-box {
      background: #090d16;
      border: 1px solid #1e293b;
      border-radius: 8px;
      padding: 10px 14px;
      color: #38bdf8;
      font-family: 'Fira Code', monospace;
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 8px 0;
    }

    .cli-box span.prompt {
      color: #64748b;
      user-select: none;
    }

    /* Code Snippet Blocks */
    pre {
      background: #0b0f19;
      color: #e2e8f0;
      font-family: 'Fira Code', monospace;
      font-size: 11.5px;
      line-height: 1.6;
      padding: 14px 16px;
      border-radius: 8px;
      border: 1px solid #1e293b;
      margin: 8px 0 12px 0;
      overflow-x: hidden;
      white-space: pre-wrap;
      page-break-inside: avoid;
    }

    .token-keyword { color: #f43f5e; font-weight: 500; }
    .token-func { color: #38bdf8; }
    .token-str { color: #34d399; }
    .token-attr { color: #fbbf24; }
    .token-comment { color: #64748b; font-style: italic; }

    /* Tables */
    table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      margin: 12px 0;
      font-size: 12px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      overflow: hidden;
      page-break-inside: avoid;
    }

    th {
      background-color: #f8fafc;
      color: #475569;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      font-size: 10.5px;
      padding: 8px 12px;
      border-bottom: 1px solid #e2e8f0;
      border-right: 1px solid #e2e8f0;
      text-align: left;
    }

    th:last-child { border-right: none; }

    td {
      padding: 8px 12px;
      border-bottom: 1px solid #e2e8f0;
      border-right: 1px solid #e2e8f0;
      color: #334155;
      vertical-align: middle;
    }

    td:last-child { border-right: none; }
    tr:last-child td { border-bottom: none; }
    tr:nth-child(even) td { background-color: #fafafa; }

    code {
      font-family: 'Fira Code', monospace;
      font-size: 11px;
      background: #f1f5f9;
      color: #0f172a;
      padding: 2px 5px;
      border-radius: 4px;
      border: 1px solid #e2e8f0;
    }

    /* Grid Layout for Features */
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin: 10px 0;
    }

    .feature-card {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px 14px;
      background: #ffffff;
      border-left: 3.5px solid #6366f1;
    }

    .feature-card strong {
      display: block;
      color: #0f172a;
      font-size: 12.5px;
      margin-bottom: 3px;
    }

    .feature-card p {
      margin: 0;
      font-size: 11.5px;
      color: #64748b;
    }

    /* Footer */
    .footer {
      margin-top: 24px;
      padding-top: 10px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      color: #94a3b8;
      page-break-inside: avoid;
    }
  </style>
</head>
<body>

  <div class="header-card">
    <div class="badge">Component Reference v1.0.0</div>
    <h1>Canopy UI & Toast System</h1>
    <p>Independent copy-paste CLI & notification architecture for modern React & Next.js applications.</p>
  </div>

  <h2>⚡ Quick Setup</h2>
  <p style="margin: 4px 0 8px 0; color: #475569;">Run the CLI command to download the components directly into your codebase:</p>
  <div class="cli-box">
    <span class="prompt">$</span>
    <span>npx canopy-ui add toast</span>
  </div>

  <h2>📦 Component Highlights</h2>
  <div class="grid-2">
    <div class="feature-card">
      <strong>Zero Runtime CSS Config</strong>
      <p>Self-contained `@keyframes` injection allows the progress bar to animate seamlessly without modifying external stylesheets.</p>
    </div>
    <div class="feature-card" style="border-left-color: #10b981;">
      <strong>Observer Hook Architecture</strong>
      <p>Decoupled singleton state machine callable anywhere—inside React components or external async functions.</p>
    </div>
  </div>

  <h2>🚀 Implementation Blueprint</h2>

  <h3>1. Global Provider (<code>app/layout.tsx</code>)</h3>
  <pre><code><span class="token-keyword">import</span> { Toaster } <span class="token-keyword">from</span> <span class="token-str">"@/components/ui/toast"</span>;

<span class="token-keyword">export default function</span> <span class="token-func">RootLayout</span>({ children }: { children: React.ReactNode }) {
  <span class="token-keyword">return</span> (
    <span class="token-keyword">&lt;</span><span class="token-attr">html</span> <span class="token-attr">lang</span>=<span class="token-str">"en"</span><span class="token-keyword">&gt;</span>
      <span class="token-keyword">&lt;</span><span class="token-attr">body</span><span class="token-keyword">&gt;</span>
        {children}
        <span class="token-keyword">&lt;</span><span class="token-func">Toaster</span> <span class="token-attr">defaultDuration</span>={4000} <span class="token-attr">position</span>=<span class="token-str">"top-center"</span> <span class="token-keyword">/&gt;</span>
      <span class="token-keyword">&lt;/</span><span class="token-attr">body</span><span class="token-keyword">&gt;</span>
    <span class="token-keyword">&lt;/</span><span class="token-attr">html</span><span class="token-keyword">&gt;</span>
  );
}</code></pre>

  <h3>2. Dynamic Toast Dispatching</h3>
  <pre><code><span class="token-keyword">import</span> { toast } <span class="token-keyword">from</span> <span class="token-str">"@/components/ui/use-toast"</span>;

<span class="token-comment">// Trigger built-in preset or custom CSS tokens</span>
<span class="token-func">toast</span>({
  title: <span class="token-str">"Changes Saved"</span>,
  description: <span class="token-str">"Preferences synced with cloud database."</span>,
  variant: <span class="token-str">"success"</span>,
  duration: 5000,
  customColor: {
    bg: <span class="token-str">"var(--card)"</span>,
    border: <span class="token-str">"var(--primary)"</span>,
    progress: <span class="token-str">"var(--primary)"</span>,
  },
});</code></pre>

  <h2>⚙️ API Specification</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 18%;">Property</th>
        <th style="width: 28%;">Type</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><code>title</code></td>
        <td><code>React.ReactNode</code></td>
        <td>Header text or JSX component.</td>
      </tr>
      <tr>
        <td><code>description</code></td>
        <td><code>React.ReactNode</code></td>
        <td>Secondary details/body text.</td>
      </tr>
      <tr>
        <td><code>variant</code></td>
        <td><code>"default" | "success" | "error" | "warning" | "info"</code></td>
        <td>Semantic preset visual theme.</td>
      </tr>
      <tr>
        <td><code>duration</code></td>
        <td><code>number</code></td>
        <td>Lifespan in ms (overrides layout default).</td>
      </tr>
      <tr>
        <td><code>customColor</code></td>
        <td><code>{ bg?, text?, border?, icon?, progress? }</code></td>
        <td>Inline color overrides (Hex, RGB, or CSS variables).</td>
      </tr>
      <tr>
        <td><code>className</code></td>
        <td><code>string</code></td>
        <td>Direct Tailwind class utility overrides.</td>
      </tr>
    </tbody>
  </table>

  <div class="footer">
    <span>Canopy UI Specification &bull; Open Source Design System</span>
    <span>MIT License &bull; Shawn Rimai</span>
  </div>

</body>
</html>