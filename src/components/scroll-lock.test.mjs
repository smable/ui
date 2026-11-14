import test from 'node:test'
import assert from 'node:assert/strict'
import { createScrollLock } from './scroll-lock.ts'

const body = (overflow = '') => ({ style: { overflow } })

test('first lock saves the original value, last unlock restores it', () => {
  const b = body('auto')
  const lock = createScrollLock(() => b)
  lock.acquire()
  assert.equal(b.style.overflow, 'hidden')
  lock.release()
  assert.equal(b.style.overflow, 'auto')
})

test('dialog over drawer: closing in any order restores the page', () => {
  const b = body('')
  const lock = createScrollLock(() => b)
  lock.acquire() // drawer
  lock.acquire() // confirm dialog
  lock.release() // dialog closes
  assert.equal(b.style.overflow, 'hidden')
  lock.release() // drawer closes
  assert.equal(b.style.overflow, '')
})

test('drawer re-running its effect while a dialog is open does not keep hidden', () => {
  const b = body('')
  const lock = createScrollLock(() => b)
  lock.acquire() // drawer
  lock.acquire() // dialog
  lock.release() // drawer effect cleanup (re-render)
  lock.acquire() // drawer effect again
  lock.release() // dialog closes
  lock.release() // drawer closes
  assert.equal(b.style.overflow, '')
  assert.equal(lock.count, 0)
})

test('extra release is ignored', () => {
  const b = body('scroll')
  const lock = createScrollLock(() => b)
  lock.release()
  assert.equal(b.style.overflow, 'scroll')
  lock.acquire()
  lock.release()
  lock.release()
  assert.equal(b.style.overflow, 'scroll')
  assert.equal(lock.count, 0)
})

test('no document (SSR) is a no-op', () => {
  const lock = createScrollLock(() => null)
  lock.acquire()
  lock.release()
  assert.equal(lock.count, 0)
})
