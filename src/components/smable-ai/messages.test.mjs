import { test } from 'node:test'
import assert from 'node:assert/strict'
import { canRetry, liveAnnouncement } from './messages.ts'

const labels = {
  pending: 'Hledám v datech…',
  answered: 'Asistent odpověděl.',
  errors: { forbidden: 'ERR-forbidden', rateLimited: 'ERR-rate', unavailable: 'ERR-unavail', generic: 'ERR-generic' },
}
const user = { role: 'user' }
const assistant = { role: 'assistant' }
const failed = { role: 'assistant', error: 'unavailable' }

test('během čekání hlásí pending', () => {
  assert.equal(liveAnnouncement(false, true, user, labels), labels.pending)
  assert.equal(liveAnnouncement(true, true, user, labels), labels.pending)
  assert.equal(liveAnnouncement(false, true, undefined, labels), labels.pending)
})

test('konec čekání s odpovědí asistenta hlásí answered', () => {
  assert.equal(liveAnnouncement(true, false, assistant, labels), labels.answered)
})

test('konec čekání s chybovou bublinou hlásí text chyby', () => {
  assert.equal(liveAnnouncement(true, false, failed, labels), 'ERR-unavail')
  assert.equal(liveAnnouncement(true, false, { role: 'assistant', error: 'generic' }, labels), 'ERR-generic')
})

test('konec čekání bez odpovědi asistenta nehlásí nic', () => {
  assert.equal(liveAnnouncement(true, false, user, labels), '')
  assert.equal(liveAnnouncement(true, false, undefined, labels), '')
})

test('bez přechodu nehlásí nic (mount s historií, obyčejné překreslení)', () => {
  assert.equal(liveAnnouncement(false, false, assistant, labels), '')
  assert.equal(liveAnnouncement(false, false, failed, labels), '')
  assert.equal(liveAnnouncement(false, false, undefined, labels), '')
})

test('canRetry: jen poslední, jen bez běžícího pokusu, jen unavailable / generic', () => {
  for (const kind of ['unavailable', 'generic']) {
    assert.equal(canRetry(kind, true), true, kind)
    assert.equal(canRetry(kind, true, false), true, kind)
    assert.equal(canRetry(kind, true, true), false, `${kind} pending`)
    assert.equal(canRetry(kind, false), false, `${kind} not last`)
    assert.equal(canRetry(kind, false, true), false, `${kind} not last pending`)
  }
  for (const kind of ['forbidden', 'rateLimited']) {
    assert.equal(canRetry(kind, true), false, kind)
    assert.equal(canRetry(kind, true, true), false, `${kind} pending`)
    assert.equal(canRetry(kind, false), false, `${kind} not last`)
  }
})
