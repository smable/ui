import { test } from 'node:test'
import assert from 'node:assert/strict'
import { deepActiveElement, isEventInPopover, isEventInside, rootOf } from './dom.ts'

test('deepActiveElement sestoupí přes dvě úrovně shadow rootů', () => {
  const inner = { name: 'textarea' }
  const innerHost = { name: 'inner-host', shadowRoot: { activeElement: inner } }
  const outerHost = { name: 'outer-host', shadowRoot: { activeElement: innerHost } }
  assert.equal(deepActiveElement({ activeElement: outerHost }), inner)
})

test('deepActiveElement vrátí hostitele, když uvnitř nic nemá fokus', () => {
  const host = { shadowRoot: { activeElement: null } }
  assert.equal(deepActiveElement({ activeElement: host }), host)
})

test('deepActiveElement vrátí prvek bez shadow rootu a null, když nic', () => {
  const el = { shadowRoot: null }
  assert.equal(deepActiveElement({ activeElement: el }), el)
  assert.equal(deepActiveElement({ activeElement: null }), null)
})

test('isEventInside je true jen pro prvek v composedPath', () => {
  const inside = {}
  const host = {}
  const event = { composedPath: () => [inside, {}, host] }
  assert.equal(isEventInside(event, inside), true)
  assert.equal(isEventInside(event, {}), false)
  assert.equal(isEventInside({ composedPath: () => [inside] }, host), false)
  assert.equal(isEventInside(event, null), false)
})

test('isEventInPopover hledá atribut data-smable-ai-popover v cestě', () => {
  const plain = { hasAttribute: () => false }
  const popover = { hasAttribute: (name) => name === 'data-smable-ai-popover' }
  const text = {}
  assert.equal(isEventInPopover({ composedPath: () => [text, plain, popover, plain] }), true)
  assert.equal(isEventInPopover({ composedPath: () => [text, plain] }), false)
  assert.equal(isEventInPopover({ composedPath: () => [] }), false)
})

test('rootOf vrátí kořen uzlu, jinak document', () => {
  const root = { getElementById() {} }
  assert.equal(rootOf({ getRootNode: () => root }), root)
  globalThis.document = { marker: 'doc' }
  try {
    assert.equal(rootOf(null), globalThis.document)
    assert.equal(rootOf({ getRootNode: () => ({}) }), globalThis.document)
  } finally {
    delete globalThis.document
  }
})
