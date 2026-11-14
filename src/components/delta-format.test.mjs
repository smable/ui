import test from 'node:test'
import assert from 'node:assert/strict'
import { formatDelta } from './delta-format.ts'

const NB = ' '
const MINUS = '\u2212'

test('null, undefined and non-finite render nothing', () => {
  assert.equal(formatDelta(null), null)
  assert.equal(formatDelta(undefined), null)
  assert.equal(formatDelta(Number.NaN), null)
  assert.equal(formatDelta(Number.POSITIVE_INFINITY), null)
})

test('positive value goes up, green, with plus sign and Czech decimal comma', () => {
  const d = formatDelta(12.34)
  assert.equal(d.number, '+12,3')
  assert.equal(d.text, `+12,3${NB}%`)
  assert.equal(d.direction, 'up')
  assert.equal(d.sentiment, 'positive')
})

test('negative value goes down, red', () => {
  const d = formatDelta(-3.5)
  assert.equal(d.direction, 'down')
  assert.equal(d.sentiment, 'negative')
  assert.equal(d.number, `${MINUS}3,5`)
  assert.equal(d.text, `${MINUS}3,5${NB}%`)
})

test('integers have no trailing decimals', () => {
  assert.equal(formatDelta(12).number, '+12')
})

test('zero and values rounding to zero are flat and neutral, without sign', () => {
  for (const v of [0, -0, 0.04, -0.04]) {
    const d = formatDelta(v)
    assert.equal(d.number, '0', `value ${v}`)
    assert.equal(d.direction, 'flat')
    assert.equal(d.sentiment, 'neutral')
  }
})

test('rounding happens before the direction is decided', () => {
  assert.equal(formatDelta(0.05).number, '+0,1')
  assert.equal(formatDelta(0.4, { fractionDigits: 0 }).direction, 'flat')
  assert.equal(formatDelta(2.345, { fractionDigits: 2 }).number, '+2,35')
})

test('invert swaps the sentiment but keeps the arrow direction', () => {
  const up = formatDelta(5, { invert: true })
  assert.equal(up.direction, 'up')
  assert.equal(up.sentiment, 'negative')
  const down = formatDelta(-5, { invert: true })
  assert.equal(down.direction, 'down')
  assert.equal(down.sentiment, 'positive')
  assert.equal(formatDelta(0, { invert: true }).sentiment, 'neutral')
})

test('percentage points use p. b. by default, unitLabel overrides it', () => {
  assert.equal(formatDelta(1.2, { unit: 'pp' }).text, `+1,2${NB}p. b.`)
  assert.equal(formatDelta(1.2, { unit: 'pp', unitLabel: 'pp' }).text, `+1,2${NB}pp`)
})

test('locale changes the decimal separator', () => {
  assert.equal(formatDelta(12.34, { locale: 'en-US' }).number, '+12.3')
})

test('negative numbers use the typographic minus U+2212, never a hyphen, in every locale', () => {
  for (const locale of ['cs-CZ', 'en-US', 'sv-SE']) {
    const d = formatDelta(-4.5, { locale })
    assert.ok(d.number.startsWith(MINUS), `${locale}: ${d.number}`)
    assert.ok(!d.text.includes('-'), `${locale}: ${d.text}`)
  }
  assert.equal(formatDelta(-4.5, { locale: 'en-US' }).number, `${MINUS}4.5`)
  assert.equal(formatDelta(-1.2, { unit: 'pp' }).text, `${MINUS}1,2${NB}p. b.`)
})
