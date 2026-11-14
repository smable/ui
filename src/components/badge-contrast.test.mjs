import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import preset from '../../tailwind.preset.js'

// Tailwind CSS 3.4 paleta; neutral a brand z presetu knihovny.
const TAILWIND = {
  blue: { 400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8', 800: '#1e40af', 900: '#1e3a8a' },
  cyan: { 400: '#22d3ee', 500: '#06b6d4', 600: '#0891b2', 700: '#0e7490', 800: '#155e75', 900: '#164e63' },
  purple: { 400: '#c084fc', 500: '#a855f7', 600: '#9333ea', 700: '#7e22ce', 800: '#6b21a8', 900: '#581c87' },
  pink: { 400: '#f472b6', 500: '#ec4899', 600: '#db2777', 700: '#be185d', 800: '#9d174d', 900: '#831843' },
  amber: { 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309', 800: '#92400e', 900: '#78350f' },
  orange: { 400: '#fb923c', 500: '#f97316', 600: '#ea580c', 700: '#c2410c', 800: '#9a3412', 900: '#7c2d12' },
  emerald: { 400: '#34d399', 500: '#10b981', 600: '#059669', 700: '#047857', 800: '#065f46', 900: '#064e3b' },
  red: { 400: '#f87171', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c', 800: '#991b1b', 900: '#7f1d1d' },
}
const PALETTE = {
  ...TAILWIND,
  neutral: preset.theme.extend.colors.neutral,
  brand: preset.theme.extend.colors.brand,
}
const SHADES = [400, 500, 600, 700, 800, 900]
const WHITE = '#ffffff'
const MIN_RATIO = 4.5

function luminance(hex) {
  const n = parseInt(hex.slice(1), 16)
  const channel = (c) => {
    const v = c / 255
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * channel(n >> 16) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255)
}

function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

function lightestPassingShade(tone) {
  return SHADES.find((s) => contrast(WHITE, PALETTE[tone][s]) >= MIN_RATIO)
}

function solidMap() {
  const src = readFileSync(new URL('./Badge.tsx', import.meta.url), 'utf8')
  const block = src.match(/const solidClass[^{]*\{([\s\S]*?)\n\}/)
  assert.ok(block, 'solidClass not found in Badge.tsx')
  const map = {}
  for (const [, tone, color, shade, rest] of block[1].matchAll(/(\w+): 'bg-([a-z]+)-(\d+) ([^']*)'/g)) {
    map[tone] = { color, shade: Number(shade), rest }
  }
  return map
}

test('contrast helper matches known WCAG values', () => {
  assert.equal(contrast(WHITE, '#000000').toFixed(0), '21')
  assert.equal(contrast(WHITE, '#737373').toFixed(2), '4.74')
})

test('every solid tone uses the lightest shade where white text reaches 4.5:1', () => {
  const map = solidMap()
  assert.deepEqual(Object.keys(map).sort(), Object.keys(PALETTE).sort())
  for (const [tone, { color, shade, rest }] of Object.entries(map)) {
    assert.equal(color, tone)
    assert.equal(rest, 'text-white', `${tone}: solid badge text must stay white without dark: override`)
    const ratio = contrast(WHITE, PALETTE[tone][shade])
    assert.ok(ratio >= MIN_RATIO, `${tone}-${shade}: ${ratio.toFixed(2)}:1`)
    assert.equal(shade, lightestPassingShade(tone), `${tone}: a lighter shade also passes`)
  }
})
