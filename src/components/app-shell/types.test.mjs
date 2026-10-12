import test from 'node:test'
import assert from 'node:assert/strict'
import { isNavItemSelected } from './types.ts'

const child = { label: 'Uživatelé', href: '/settings/users' }

test('koncová položka se bez exact zvýrazní jen přesně', () => {
  assert.equal(isNavItemSelected('/leads', { label: 'Leady', href: '/leads' }), true)
  assert.equal(isNavItemSelected('/leads/1', { label: 'Leady', href: '/leads' }), false)
})

test('koncová položka s exact: false se zvýrazní i na podstránce', () => {
  assert.equal(isNavItemSelected('/leads/1', { label: 'Leady', href: '/leads', exact: false }), true)
  assert.equal(isNavItemSelected('/leadsy', { label: 'Leady', href: '/leads', exact: false }), false)
})

test('rodič se bez exact zvýrazní i na podstránce', () => {
  assert.equal(isNavItemSelected('/settings/users', { label: 'Nastavení', href: '/settings', children: [child] }), true)
})

test('rodič s exact: true se zvýrazní jen přesně', () => {
  assert.equal(
    isNavItemSelected('/settings/users', { label: 'Nastavení', href: '/settings', exact: true, children: [child] }),
    false
  )
})

test('kořen / se prefixem nezvýrazní nikde jinde', () => {
  assert.equal(isNavItemSelected('/leads', { label: 'Dashboard', href: '/', exact: false }), false)
})
