import test from 'node:test'
import assert from 'node:assert/strict'
import { skeletonBarWidth, skeletonRowCount } from './data-table-skeleton.ts'

test('explicit row count wins and is at least one', () => {
  assert.equal(skeletonRowCount(8, 20, 20), 8)
  assert.equal(skeletonRowCount(3.7, 0, 20), 3)
  assert.equal(skeletonRowCount(0, 0, 20), 1)
  assert.equal(skeletonRowCount(-2, 5, 20), 1)
})

test('keeps the height of the rows already on the page', () => {
  assert.equal(skeletonRowCount(undefined, 12, 20), 12)
  assert.equal(skeletonRowCount(undefined, 1, 20), 1)
})

test('empty table shows five rows, capped by the page size', () => {
  assert.equal(skeletonRowCount(undefined, 0, 20), 5)
  assert.equal(skeletonRowCount(undefined, 0, 3), 3)
  assert.equal(skeletonRowCount(undefined, 0, 0), 1)
  assert.equal(skeletonRowCount(Number.NaN, 0, 20), 5)
})

test('bar widths vary across rows and columns', () => {
  assert.equal(skeletonBarWidth(0, 0), 'w-3/4')
  assert.equal(skeletonBarWidth(0, 1), 'w-1/2')
  assert.equal(skeletonBarWidth(1, 0), 'w-1/2')
  assert.equal(skeletonBarWidth(2, 2), 'w-3/4')
})
