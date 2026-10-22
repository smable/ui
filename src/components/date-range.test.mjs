import test from 'node:test'
import assert from 'node:assert/strict'
import { getDateRange } from './date-range.ts'

// Ranges are local calendar days. Around the DST switch a day has 23 or 25
// hours, so the cases below only bite when the process runs in a zone with
// DST — Europe/Prague on the dev machines.
const pad = (n) => String(n).padStart(2, '0')
const local = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
const range = (preset, now) => {
  const r = getDateRange(preset, new Date(now))
  return [local(r.start), local(r.end)]
}

test('today on 25. 10. 2026 (25 h day) ends at 23:59:59', () => {
  assert.deepEqual(range('today', '2026-10-25T12:00:00'), ['2026-10-25 00:00:00', '2026-10-25 23:59:59'])
})

test('today on 29. 3. 2026 (23 h day) ends at 23:59:59, not the next day', () => {
  assert.deepEqual(range('today', '2026-03-29T12:00:00'), ['2026-03-29 00:00:00', '2026-03-29 23:59:59'])
})

test('yesterday on 30. 3. 2026 is the whole of 29. 3.', () => {
  assert.deepEqual(range('yesterday', '2026-03-30T08:00:00'), ['2026-03-29 00:00:00', '2026-03-29 23:59:59'])
})

test('yesterday on 26. 10. 2026 is the whole of 25. 10.', () => {
  assert.deepEqual(range('yesterday', '2026-10-26T08:00:00'), ['2026-10-25 00:00:00', '2026-10-25 23:59:59'])
})

test('this_week on Tue 31. 3. 2026 starts Mon 30. 3.', () => {
  assert.deepEqual(range('this_week', '2026-03-31T08:00:00'), ['2026-03-30 00:00:00', '2026-03-31 23:59:59'])
})

test('last_week on Mon 30. 3. 2026 is 23.–29. 3.', () => {
  assert.deepEqual(range('last_week', '2026-03-30T08:00:00'), ['2026-03-23 00:00:00', '2026-03-29 23:59:59'])
})

test('last_week on Mon 26. 10. 2026 is 19.–25. 10.', () => {
  assert.deepEqual(range('last_week', '2026-10-26T08:00:00'), ['2026-10-19 00:00:00', '2026-10-25 23:59:59'])
})

test('this_month on 25. 10. 2026 ends today 23:59:59', () => {
  assert.deepEqual(range('this_month', '2026-10-25T12:00:00'), ['2026-10-01 00:00:00', '2026-10-25 23:59:59'])
})
