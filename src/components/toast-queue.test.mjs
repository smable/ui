import test from 'node:test'
import assert from 'node:assert/strict'
import { TOAST_DURATION, TOAST_ERROR_DURATION, addToast, removeToast, toastDuration } from './toast-queue.ts'

let seq = 0
const toast = (tone = 'success', duration = toastDuration(tone)) => ({ id: ++seq, tone, message: `m${seq}`, duration })
const ids = (queue) => queue.map((t) => t.id)

test('default duration is 4 s, errors 8 s', () => {
  assert.equal(toastDuration('success'), TOAST_DURATION)
  assert.equal(toastDuration('info'), 4000)
  assert.equal(toastDuration('error'), TOAST_ERROR_DURATION)
  assert.equal(toastDuration('error'), 8000)
})

test('explicit duration wins, null and 0 keep the toast open', () => {
  assert.equal(toastDuration('error', 2000), 2000)
  assert.equal(toastDuration('success', null), null)
  assert.equal(toastDuration('success', 0), null)
  assert.equal(toastDuration('success', -5), null)
  assert.equal(toastDuration('success', Infinity), null)
  assert.equal(toastDuration('success', Number.NaN), null)
})

test('huge duration is clamped so setTimeout does not fire at once', () => {
  assert.equal(toastDuration('info', 1e12), 2147483647)
})

test('addToast appends in order under the limit', () => {
  const a = toast()
  const b = toast()
  assert.deepEqual(ids(addToast(addToast([], a, 3), b, 3)), [a.id, b.id])
})

test('addToast does not mutate the queue', () => {
  const queue = [toast()]
  const copy = [...queue]
  addToast(queue, toast(), 1)
  assert.deepEqual(queue, copy)
})

test('over the limit the oldest ordinary toast goes', () => {
  const [a, b, c, d] = [toast(), toast(), toast(), toast()]
  assert.deepEqual(ids(addToast([a, b, c], d, 3)), [b.id, c.id, d.id])
})

test('errors and sticky toasts survive a flood of successes', () => {
  const err = toast('error')
  const sticky = toast('info', null)
  let queue = [err, sticky]
  for (let i = 0; i < 5; i++) queue = addToast(queue, toast(), 3)
  assert.equal(queue.length, 3)
  assert.deepEqual(ids(queue).slice(0, 2), [err.id, sticky.id])
})

test('when every toast is protected the oldest goes and the new one shows', () => {
  const [e1, e2, e3] = [toast('error'), toast('error'), toast('error')]
  const fresh = toast()
  assert.deepEqual(ids(addToast([e1, e2, e3], fresh, 3)), [e2.id, e3.id, fresh.id])
})

test('max below 1 still shows the newest toast', () => {
  const a = toast()
  const b = toast()
  assert.deepEqual(ids(addToast([a], b, 0)), [b.id])
})

test('removeToast drops by id and keeps the reference for an unknown id', () => {
  const [a, b] = [toast(), toast()]
  const queue = [a, b]
  assert.deepEqual(ids(removeToast(queue, a.id)), [b.id])
  assert.equal(removeToast(queue, 999999), queue)
})
