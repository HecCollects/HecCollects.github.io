import { test, expect } from '@playwright/test';
import path from 'path';

const pages = ['faq.html', 'returns.html', 'privacy.html'] as const;
const selectors = [
  { selector: '.policy-page p', label: 'paragraph' },
  { selector: '.policy-page h1', label: 'h1 heading' },
  { selector: '.policy-page h2', label: 'h2 heading' },
  { selector: '.policy-page .policy-accordion__summary-text', label: 'details summary' },
];

const themes = [
  { name: 'light', value: 'light' },
  { name: 'dark', value: 'dark' },
] as const;

const MIN_CONTRAST = 4.5;

type ContrastResult = {
  label: string;
  selector: string;
  tag: string;
  contrast: number;
  textColor: string;
  backgroundColor: string;
};

for (const pageName of pages) {
  for (const theme of themes) {
    test(`${pageName} ${theme.name} theme maintains text contrast`, async ({ page }) => {
      await page.addInitScript(themeValue => {
        try {
          localStorage.setItem('theme', themeValue);
        } catch {}
        document.documentElement.setAttribute('data-theme', themeValue);
      }, theme.value);

      const filePath = path.resolve(__dirname, `../${pageName}`);
      await page.goto('file://' + filePath);
      await page.waitForSelector('.policy-page');

      const results = await page.evaluate((selectorData) => {
        const parseColor = (input) => {
          if (!input) return null;
          const value = input.trim();
          if (!value) return null;
          if (value === 'transparent') {
            return { r: 0, g: 0, b: 0, a: 0 };
          }
          const hexMatch = value.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
          if (hexMatch) {
            let hex = hexMatch[1];
            if (hex.length === 3) {
              hex = hex
                .split('')
                .map(ch => ch + ch)
                .join('');
            }
            const num = parseInt(hex, 16);
            return {
              r: (num >> 16) & 255,
              g: (num >> 8) & 255,
              b: num & 255,
              a: 1,
            };
          }
          const rgbMatch = value.match(/^rgba?\(([^)]+)\)$/i);
          if (rgbMatch) {
            const parts = rgbMatch[1]
              .split(',')
              .map(part => part.trim())
              .map(part => (part.endsWith('%') ? (parseFloat(part) / 100) * 255 : parseFloat(part)));
            if (parts.length >= 3) {
              return {
                r: parts[0],
                g: parts[1],
                b: parts[2],
                a: parts[3] ?? 1,
              };
            }
          }
          return null;
        };

        const blendColors = (foreground, background) => {
          const alpha = foreground.a + background.a * (1 - foreground.a);
          if (alpha === 0) {
            return { r: 0, g: 0, b: 0, a: 0 };
          }
          return {
            r:
              (foreground.r * foreground.a + background.r * background.a * (1 - foreground.a)) /
              alpha,
            g:
              (foreground.g * foreground.a + background.g * background.a * (1 - foreground.a)) /
              alpha,
            b:
              (foreground.b * foreground.a + background.b * background.a * (1 - foreground.a)) /
              alpha,
            a: alpha,
          };
        };

        const relativeLuminance = (color) => {
          const [r, g, b] = [color.r, color.g, color.b].map(channel => {
            const normalized = channel / 255;
            return normalized <= 0.03928
              ? normalized / 12.92
              : Math.pow((normalized + 0.055) / 1.055, 2.4);
          });
          return 0.2126 * r + 0.7152 * g + 0.0722 * b;
        };

        const contrastRatio = (foreground, background) => {
          const fgLum = relativeLuminance(foreground);
          const bgLum = relativeLuminance(background);
          const lighter = Math.max(fgLum, bgLum);
          const darker = Math.min(fgLum, bgLum);
          return (lighter + 0.05) / (darker + 0.05);
        };

        const effectiveBackground = (element) => {
          let current = element;
          let accumulated = { r: 0, g: 0, b: 0, a: 0 };
          while (current) {
            const styles = window.getComputedStyle(current);
            const parsed = parseColor(styles.backgroundColor);
            if (parsed && parsed.a > 0) {
              accumulated = blendColors(parsed, accumulated);
              if (accumulated.a >= 0.99) {
                return accumulated;
              }
            }
            current = current.parentElement;
          }

          const bodyColor = parseColor(window.getComputedStyle(document.body).backgroundColor);
          if (bodyColor && bodyColor.a > 0) {
            accumulated = blendColors(bodyColor, accumulated);
          }

          if (accumulated.a < 0.99) {
            const rootStyles = window.getComputedStyle(document.documentElement);
            const rootVar = rootStyles.getPropertyValue('--color-bg').trim();
            const fallback =
              parseColor(rootVar) ||
              parseColor(rootStyles.backgroundColor) ||
              { r: 255, g: 255, b: 255, a: 1 };
            accumulated = blendColors(fallback, accumulated);
          }

          return accumulated;
        };

        const toColorString = (color) =>
          `rgba(${Math.round(color.r)}, ${Math.round(color.g)}, ${Math.round(color.b)}, ${color.a.toFixed(2)})`;

        const findings = [];
        for (const { selector, label } of selectorData) {
          const elements = Array.from(document.querySelectorAll(selector));
          for (const element of elements) {
            if (!(element instanceof HTMLElement)) continue;
            const style = window.getComputedStyle(element);
            let colorString = style.color;
            let textColor = parseColor(colorString);
            const textFill = style.getPropertyValue('-webkit-text-fill-color');
            const parsedTextFill = parseColor(textFill);
            if (
              parsedTextFill &&
              (!textColor || textFill.trim().toLowerCase() !== colorString.trim().toLowerCase())
            ) {
              textColor = parsedTextFill;
              colorString = textFill;
            }
            if (!textColor) continue;
            const background = effectiveBackground(element);
            const contrast = contrastRatio(textColor, background);
            findings.push({
              label,
              selector,
              tag: element.tagName.toLowerCase(),
              contrast,
              textColor: colorString,
              backgroundColor: toColorString(background),
            });
          }
        }

        return findings;
      }, selectors);

      expect(results.length).toBeGreaterThan(0);
      for (const result of results as ContrastResult[]) {
        expect(result.contrast, `${pageName} ${theme.name} ${result.tag} (${result.label}) contrast ${result.contrast.toFixed(2)}`).toBeGreaterThanOrEqual(
          MIN_CONTRAST,
        );
      }
    });
  }
}
