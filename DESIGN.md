# Design Guidelines

The theme uses a simple palette governed by the classic **60/30/10 rule**:

* **60% neutrals** provide a calm foundation for content.
* **30% branding colors** reinforce identity and highlight interactive elements.
* **10% accent** draws attention to alerts or special statuses.

Use the CSS variables below to keep styles consistent across components and to enable easy theming.

## Palette

### Grayscale Foundation (~60%)

| Variable | Hex | Usage |
| --- | --- | --- |
| `--color-bg` | `#FAFAFA` | Primary page background. |
| `--color-surface` | `#E5E5E5` | Card and section backgrounds. |
| `--color-text` | `#222222` | Main body text and headings. |
| `--color-muted` | `#888888` | Borders, metadata and muted text. |

### Branding Colors (~30%)

| Variable | Hex | Usage |
| --- | --- | --- |
| `--brand-primary` | `#2563EB` | Primary actions and interactive elements. |
| `--brand-secondary` | `#0F766E` | Secondary actions and hover states. |

### Accent Color (~10%)

| Variable | Hex | Usage |
| --- | --- | --- |
| `--accent` | `#B45309` | Highlights and status indicators. |

Neutrals keep layouts readable while the brand colors guide focus. The accent is intentionally sparing so callouts remain noticeable.

## Usage

Declare the variables in `:root` and apply them in components:

```css
:root {
  --color-bg: #FAFAFA;
  --color-text: #222222;
  --brand-primary: #2563EB;
  --brand-secondary: #0F766E;
  --accent: #B45309;
}

.button {
  background: var(--brand-primary);
  color: var(--color-bg);
}

.note {
  border-left: 4px solid var(--accent);
  color: var(--color-text);
}
```

## Accessibility

- Text and interactive elements must maintain at least a **4.5:1** contrast ratio against their backgrounds (WCAG 2.1 AA).
- Verify color usage with tools such as [axe](https://www.deque.com/axe/) or browser devtools.
- Do not rely on color alone to convey meaning; pair the `--accent` color with icons or text labels.
- Dark theme variants mirror these hues with darker neutrals and lighter brand tones to preserve contrast.
