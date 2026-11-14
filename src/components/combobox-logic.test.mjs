import test from 'node:test'
import assert from 'node:assert/strict'
import { canCreateOption, comboboxQuery, firstEnabled, highlightRange, stepActive } from './combobox-logic.ts'
import { normalize, smartFilter } from '../lib/search.ts'

const none = () => false

test('query is empty while the text shows the selected value', () => {
  assert.equal(comboboxQuery('Káva', 'Káva'), '')
  assert.equal(comboboxQuery('Káv', 'Káva'), 'Káv')
  assert.equal(comboboxQuery('', undefined), '')
  assert.equal(comboboxQuery('mléko', undefined), 'mléko')
})

test('create is offered only for a new, non-empty name', () => {
  const options = [{ label: 'Káva' }, { label: ' Mléko ' }]
  assert.equal(canCreateOption(options, '', normalize), false)
  assert.equal(canCreateOption(options, '   ', normalize), false)
  assert.equal(canCreateOption(options, 'kava', normalize), false)
  assert.equal(canCreateOption(options, 'MLEKO ', normalize), false)
  assert.equal(canCreateOption(options, 'Kávovar', normalize), true)
  assert.equal(canCreateOption([], 'Čaj', normalize), true)
})

test('firstEnabled skips disabled options', () => {
  assert.equal(firstEnabled(0, none), -1)
  assert.equal(firstEnabled(3, none), 0)
  assert.equal(firstEnabled(3, (i) => i < 2), 2)
  assert.equal(firstEnabled(2, () => true), -1)
})

test('stepActive moves, skips disabled and stops at the edges', () => {
  const disabled = (i) => i === 1
  assert.equal(stepActive(4, 0, 1, disabled), 2)
  assert.equal(stepActive(4, 2, -1, disabled), 0)
  assert.equal(stepActive(4, 3, 1, disabled), 3)
  assert.equal(stepActive(4, 0, -1, disabled), 0)
  assert.equal(stepActive(4, -1, 1, none), 0)
  assert.equal(stepActive(0, 0, 1, none), -1)
  assert.equal(stepActive(3, 0, 1, (i) => i > 0), 0)
})

test('stepActive from a disabled or stale index falls back to the first enabled', () => {
  assert.equal(stepActive(3, 2, 1, (i) => i === 2), 0)
  assert.equal(stepActive(3, 7, 1, none), 0)
})

test('highlightRange ignores case and diacritics', () => {
  assert.deepEqual(highlightRange('Žlutý meloun', 'zlu', normalize), [0, 3])
  assert.deepEqual(highlightRange('Žlutý meloun', ' MELOUN ', normalize), [6, 12])
  assert.equal(highlightRange('Žlutý meloun', 'kiwi', normalize), null)
  assert.equal(highlightRange('Žlutý meloun', '', normalize), null)
})

test('highlightRange gives up when normalization changes length', () => {
  const stretch = (s) => s.toLowerCase().replace(/x/g, 'xx')
  assert.equal(highlightRange('xa', 'a', stretch), null)
})

test('default filter (smartFilter) matches label and description, all words', () => {
  const options = [
    { value: 1, label: 'Coca-Cola', description: '0,33 l' },
    { value: 2, label: 'Coca-Cola Zero', description: '0,5 l' },
    { value: 3, label: 'Čokoláda' },
  ]
  const text = (o) => `${o.label} ${o.description ?? ''}`
  assert.deepEqual(smartFilter(options, 'cola zero', text).map((o) => o.value), [2])
  assert.deepEqual(smartFilter(options, '0,5', text).map((o) => o.value), [2])
  assert.deepEqual(smartFilter(options, 'coko', text).map((o) => o.value), [3])
  assert.equal(smartFilter(options, '', text).length, 3)
})
