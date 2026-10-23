import { test } from 'node:test'
import assert from 'node:assert/strict'
import { SMABLE_AI_COUNTER_FROM, SMABLE_AI_MAX_CHARS, charsLeft, composerButtons, normalizeOutgoing, shouldSendOnKey } from './composer.ts'

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
