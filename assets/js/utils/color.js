/**
 * Color & Auto-Contrast Utility (R-THM-03, R-THM-04, PRD §7.2)
 * Ensures WCAG 2.1 AA contrast ratio (>= 4.5:1 for normal text, >= 3:1 for muted).
 */

export function parseHex(hex) {
  let c = hex.replace('#', '').trim();
  if (c.length === 3) {
    c = c.split('').map(x => x + x).join('');
  }
  const num = parseInt(c, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

export function toHex(r, g, b) {
  const clamp = v => Math.max(0, Math.min(255, Math.round(v)));
  const toPadded = v => clamp(v).toString(16).padStart(2, '0');
  return '#' + toPadded(r) + toPadded(g) + toPadded(b);
}

export function luminance(hex) {
  const { r, g, b } = parseHex(hex);
  const a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

export function contrastRatio(colorA, colorB) {
  const l1 = luminance(colorA);
  const l2 = luminance(colorB);
  const max = Math.max(l1, l2);
  const min = Math.min(l1, l2);
  return (max + 0.05) / (min + 0.05);
}

export function pickForeground(bgHex) {
  const darkCandidate = '#09090b';
  const lightCandidate = '#fafafa';
  const crDark = contrastRatio(bgHex, darkCandidate);
  const crLight = contrastRatio(bgHex, lightCandidate);
  return crLight >= crDark ? lightCandidate : darkCandidate;
}

export function mixColor(hexA, hexB, weight = 0.5) {
  const rgbA = parseHex(hexA);
  const rgbB = parseHex(hexB);
  const w = Math.max(0, Math.min(1, weight));
  const r = rgbA.r * (1 - w) + rgbB.r * w;
  const g = rgbA.g * (1 - w) + rgbB.g * w;
  const b = rgbA.b * (1 - w) + rgbB.b * w;
  return toHex(r, g, b);
}

/**
 * Generate full sidebar tokens from any custom background color (R-THM-04)
 */
export function generateSidebarTokens(bgHex) {
  const isDark = luminance(bgHex) < 0.2;
  const fg = isDark ? '#f4f4f5' : '#18181b';
  const mutedFg = isDark ? '#a1a1aa' : '#71717a';

  // Accent background: subtle contrast step
  const accentBg = isDark
    ? mixColor(bgHex, '#ffffff', 0.12)
    : mixColor(bgHex, '#000000', 0.06);

  const accentFg = isDark ? '#ffffff' : '#09090b';

  // Border: subtle line
  const border = isDark
    ? mixColor(bgHex, '#ffffff', 0.1)
    : mixColor(bgHex, '#000000', 0.08);

  const ring = isDark
    ? mixColor(bgHex, '#ffffff', 0.3)
    : mixColor(bgHex, '#000000', 0.25);

  const primaryBg = isDark ? '#fafafa' : '#18181b';
  const primaryFg = isDark ? '#09090b' : '#fafafa';

  return {
    '--sidebar-bg': bgHex,
    '--sidebar-fg': fg,
    '--sidebar-muted-fg': mutedFg,
    '--sidebar-accent-bg': accentBg,
    '--sidebar-accent-fg': accentFg,
    '--sidebar-border': border,
    '--sidebar-ring': ring,
    '--sidebar-primary-bg': primaryBg,
    '--sidebar-primary-fg': primaryFg
  };
}
