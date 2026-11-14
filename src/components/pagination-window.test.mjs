import test from 'node:test'
import assert from 'node:assert/strict'
import { PAGE_WINDOW_SLOTS, pageWindow } from './pagination-window.ts'

const numbers = (items) => items.filter((i) => typeof i === 'number')
const E1 = 'ellipsis-start'
const E2 = 'ellipsis-end'

test('no pages, no items', () => {
  assert.deepEqual(pageWindow(1, 0), [])
  assert.deepEqual(pageWindow(1, -3), [])
  assert.deepEqual(pageWindow(1, NaN), [])
})

test('up to 7 pages: all of them, no ellipsis', () => {
  assert.deepEqual(pageWindow(1, 1), [1])
  assert.deepEqual(pageWindow(2, 3), [1, 2, 3])
  assert.deepEqual(pageWindow(4, 7), [1, 2, 3, 4, 5, 6, 7])
})

test('start of a long list: window of 5', () => {
  assert.deepEqual(pageWindow(1, 20), [1, 2, 3, 4, 5, E2, 20])
  assert.deepEqual(pageWindow(4, 20), [1, 2, 3, 4, 5, E2, 20])
})

test('middle of a long list: current ± 1', () => {
  assert.deepEqual(pageWindow(5, 20), [1, E1, 4, 5, 6, E2, 20])
  assert.deepEqual(pageWindow(10, 20), [1, E1, 9, 10, 11, E2, 20])
  assert.deepEqual(pageWindow(16, 20), [1, E1, 15, 16, 17, E2, 20])
})

test('end of a long list: window of 5', () => {
  assert.deepEqual(pageWindow(17, 20), [1, E1, 16, 17, 18, 19, 20])
  assert.deepEqual(pageWindow(20, 20), [1, E1, 16, 17, 18, 19, 20])
})

test('eight pages switch straight from start to end window', () => {
  assert.deepEqual(pageWindow(4, 8), [1, 2, 3, 4, 5, E2, 8])
  assert.deepEqual(pageWindow(5, 8), [1, E1, 4, 5, 6, 7, 8])
})

test('page out of range is clamped', () => {
  assert.deepEqual(pageWindow(0, 20), pageWindow(1, 20))
  assert.deepEqual(pageWindow(-5, 20), pageWindow(1, 20))
  assert.deepEqual(pageWindow(99, 20), pageWindow(20, 20))
  assert.deepEqual(pageWindow(10.7, 20), pageWindow(10, 20))
  assert.deepEqual(pageWindow(NaN, 3), [1, 2, 3])
})

test('constant slot count, current page with neighbours, ellipsis hides 2+ pages', () => {
  for (let total = 1; total <= 40; total++) {
    for (let page = 1; page <= total; page++) {
      const items = pageWindow(page, total)
      const nums = numbers(items)
      const at = `${page}/${total}`
      assert.equal(items.length, Math.min(total, PAGE_WINDOW_SLOTS), `slots ${at}`)
      assert.ok(nums.includes(page), `current ${at}`)
      if (page > 1) assert.ok(nums.includes(page - 1), `previous ${at}`)
      if (page < total) assert.ok(nums.includes(page + 1), `next ${at}`)
      assert.ok(nums.includes(1) && nums.includes(total), `edges ${at}`)
      for (let i = 1; i < nums.length; i++) assert.ok(nums[i] > nums[i - 1], `ascending ${at}`)
      items.forEach((item, i) => {
        if (typeof item === 'number') return
        assert.ok(items[i + 1] - items[i - 1] > 2, `gap ${at}`)
      })
    }
  }
})
