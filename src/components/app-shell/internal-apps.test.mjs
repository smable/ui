import test from 'node:test'
import assert from 'node:assert/strict'
import { INTERNAL_APPS, internalRailApps } from './internal-apps.ts'
import { isNavItemActive } from './types.ts'

const ids = (apps) => apps.map((a) => a.id)

test('pořadí registru je Board, CRM, Helpdesk, Marketing, Mailbox, Workstation', () => {
  assert.deepEqual(ids(INTERNAL_APPS), ['board', 'crm', 'helpdesk', 'marketing', 'mailbox', 'workstation'])
})

test('sales vidí Board, CRM, Marketing', () => {
  assert.deepEqual(ids(internalRailApps('board', 'sales')), ['board', 'crm', 'marketing'])
})

test('support vidí Board a Helpdesk', () => {
  assert.deepEqual(ids(internalRailApps('helpdesk', 'support')), ['board', 'helpdesk'])
})

test('admin vidí všechny živé aplikace, workstation ne', () => {
  assert.deepEqual(ids(internalRailApps('crm', 'admin')), ['board', 'crm', 'helpdesk', 'marketing', 'mailbox'])
})

test('aktuální aplikace má href / a isActive, ostatní absolutní URL', () => {
  const apps = internalRailApps('crm', 'admin')
  const crm = apps.find((a) => a.id === 'crm')
  const board = apps.find((a) => a.id === 'board')
  assert.equal(crm.href, '/')
  assert.equal(crm.isActive, true)
  assert.equal(board.href, 'https://board.smable.cloud')
  assert.equal(board.isActive, false)
  assert.equal(apps.filter((a) => a.isActive).length, 1)
})

test('bez role jen aktuální aplikace', () => {
  assert.deepEqual(ids(internalRailApps('board', null)), ['board'])
  assert.deepEqual(ids(internalRailApps('board', undefined)), ['board'])
})

test('neznámá role jen aktuální aplikace', () => {
  assert.deepEqual(ids(internalRailApps('mailbox', 'finance')), ['mailbox'])
})

test('aktuální aplikace je v railu i mimo povolené role a i když není live', () => {
  assert.deepEqual(ids(internalRailApps('mailbox', 'sales')), ['board', 'crm', 'marketing', 'mailbox'])
  assert.deepEqual(ids(internalRailApps('workstation', 'support')), ['board', 'helpdesk', 'workstation'])
})

test('isNavItemActive: prefix bez exact, přesná shoda s exact', () => {
  assert.equal(isNavItemActive('/tickets/kanban', '/tickets'), true)
  assert.equal(isNavItemActive('/tickets/kanban', '/tickets', true), false)
  assert.equal(isNavItemActive('/tickets', '/tickets', true), true)
  assert.equal(isNavItemActive('/tickets/123', '/tickets/kanban', true), false)
  assert.equal(isNavItemActive('/leads', '/', false), false)
})
