import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  SMABLE_AI_COUNTER_FROM,
  SMABLE_AI_MAX_CHARS,
  appendToken,
  charsLeft,
  clipText,
  composerButtons,
  nextEnabledIndex,
  normalizeOutgoing,
  shouldSendOnKey,
} from './composer.ts'

test('enter bez shiftu odešle', () => {
  assert.equal(shouldSendOnKey({ key: 'Enter', shiftKey: false, isComposing: false }), true)
  assert.equal(shouldSendOnKey({ key: 'a', shiftKey: false, isComposing: false }), false)
})

test('shift+enter neodešle', () => {
  assert.equal(shouldSendOnKey({ key: 'Enter', shiftKey: true, isComposing: false }), false)
})

test('během skládání znaků neodešle', () => {
  assert.equal(shouldSendOnKey({ key: 'Enter', shiftKey: false, isComposing: true }), false)
})

test('normalizace ořízne bílé znaky a CRLF', () => {
  assert.equal(normalizeOutgoing('  Kolik jsme prodali?\r\n\r\nA včera?  \n'), 'Kolik jsme prodali?\n\nA včera?')
  assert.equal(normalizeOutgoing('a\rb'), 'a\nb')
  assert.equal(normalizeOutgoing(' \r\n\t '), '')
})

test('charsLeft', () => {
  assert.equal(SMABLE_AI_MAX_CHARS, 2000)
  assert.equal(SMABLE_AI_COUNTER_FROM, 200)
  assert.equal(charsLeft('', 2000), 2000)
  assert.equal(charsLeft('abc', 2000), 1997)
  assert.equal(charsLeft('a'.repeat(2000), 2000), 0)
  assert.equal(charsLeft('a'.repeat(2001), 2000), -1)
})

test('mikrofon místo Odeslat u prázdného pole, Odeslat s textem', () => {
  assert.deepEqual(composerButtons({ hasMic: true, recording: false, value: '' }), { mic: true, send: false })
  assert.deepEqual(composerButtons({ hasMic: true, recording: false, value: ' \n ' }), { mic: true, send: false })
  assert.deepEqual(composerButtons({ hasMic: true, recording: false, value: 'Ahoj' }), { mic: false, send: true })
})

test('při nahrávání zůstává stop vidět i s textem', () => {
  assert.deepEqual(composerButtons({ hasMic: true, recording: true, value: '' }), { mic: true, send: false })
  assert.deepEqual(composerButtons({ hasMic: true, recording: true, value: 'Ahoj' }), { mic: true, send: true })
})

test('bez mikrofonu je Odeslat vždy', () => {
  assert.deepEqual(composerButtons({ hasMic: false, recording: false, value: '' }), { mic: false, send: true })
  assert.deepEqual(composerButtons({ hasMic: false, recording: false, value: 'Ahoj' }), { mic: false, send: true })
})

test('nextEnabledIndex přeskočí neaktivní položky a jde dokola', () => {
  const items = [{ disabled: true }, {}, { disabled: true }, {}]
  assert.equal(nextEnabledIndex(items, -1, 1), 1)
  assert.equal(nextEnabledIndex(items, 1, 1), 3)
  assert.equal(nextEnabledIndex(items, 3, 1), 1)
  assert.equal(nextEnabledIndex(items, 1, -1), 3)
  assert.equal(nextEnabledIndex(items, -1, -1), 3)
  assert.equal(nextEnabledIndex([{ disabled: true }], -1, 1), -1)
  assert.equal(nextEnabledIndex([], -1, 1), -1)
})

test('appendToken přidá token s jednou mezerou a mezerou na konec', () => {
  assert.equal(appendToken('', '@Rajče'), '@Rajče ')
  assert.equal(appendToken('Recept pro', '@BBQ Burger'), 'Recept pro @BBQ Burger ')
  assert.equal(appendToken('Recept pro  \n', '@BBQ Burger'), 'Recept pro @BBQ Burger ')
})

test('appendToken se vejde do maxLength, jinak token zkrátí nebo pole nechá', () => {
  assert.equal(appendToken('abc', 'defghij', 10), 'abc defg… ')
  assert.equal(appendToken('abc', 'de', 10), 'abc de ')
  assert.equal(appendToken('abcdefghi', 'x', 10), 'abcdefghi')
  assert.ok(appendToken('a'.repeat(1990), 'b'.repeat(50)).length <= SMABLE_AI_MAX_CHARS)
})

test('clipText srovná bílé znaky a zkrátí s výpustkou', () => {
  assert.equal(clipText('  Rajče \n 30 g ', 20), 'Rajče 30 g')
  assert.equal(clipText('abcdefgh', 5), 'abcd…')
  assert.equal(clipText('abcdefgh', 1), 'a')
})
