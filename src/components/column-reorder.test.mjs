import test from 'node:test'
import assert from 'node:assert/strict'
import { columnDropSide, moveColumn } from './column-reorder.ts'

const ORDER = ['select', 'name', 'price', 'stock', 'margin', 'category', 'actions']

test('dragging right lands after the target', () => {
  assert.equal(columnDropSide(ORDER, 'price', 'category'), 'after')
  assert.deepEqual(moveColumn(ORDER, 'price', 'category'),
    ['select', 'name', 'stock', 'margin', 'category', 'price', 'actions'])
})

test('dragging left lands before the target', () => {
  assert.equal(columnDropSide(ORDER, 'category', 'name'), 'before')
  assert.deepEqual(moveColumn(ORDER, 'category', 'name'),
    ['select', 'category', 'name', 'price', 'stock', 'margin', 'actions'])
})

test('neighbours swap and the side still matches the result', () => {
  for (const [from, to] of [['price', 'stock'], ['stock', 'price']]) {
    const side = columnDropSide(ORDER, from, to)
    const next = moveColumn(ORDER, from, to)
    const offset = side === 'after' ? 1 : -1
    assert.equal(next[next.indexOf(to) + offset], from, `${from} -> ${to}`)
  }
})

test('the side always matches where the column ends up', () => {
  for (const from of ORDER) {
    for (const to of ORDER) {
      if (from === to) continue
      const next = moveColumn(ORDER, from, to)
      const offset = columnDropSide(ORDER, from, to) === 'after' ? 1 : -1
      assert.equal(next[next.indexOf(to) + offset], from, `${from} -> ${to}`)
    }
  }
})

test('unknown or identical ids leave the order unchanged', () => {
  assert.deepEqual(moveColumn(ORDER, 'price', 'price'), ORDER)
  assert.deepEqual(moveColumn(ORDER, 'nope', 'price'), ORDER)
  assert.deepEqual(moveColumn(ORDER, 'price', 'nope'), ORDER)
})
