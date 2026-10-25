import { test } from 'node:test'
import assert from 'node:assert/strict'
import { actionButtonsVisible } from './actions.ts'

test('actionButtonsVisible: tlačítka u čekající akce', () => {
  assert.equal(actionButtonsVisible('pending'), true)
})

test('actionButtonsVisible: confirming bez tlačítek — zaseknutá akce nesmí točit spinner navždy', () => {
  assert.equal(actionButtonsVisible('confirming'), false)
})

test('actionButtonsVisible: vyřízené stavy bez tlačítek', () => {
  for (const status of ['executed', 'cancelled', 'expired', 'stale', 'failed']) {
    assert.equal(actionButtonsVisible(status), false, status)
  }
})
