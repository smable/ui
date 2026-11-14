import test from 'node:test'
import assert from 'node:assert/strict'
import { matchesAccept } from './file-accept.ts'

const file = (name, type = '') => ({ name, type })

test('empty or missing accept allows every file', () => {
  for (const accept of [undefined, null, '', ' , ']) {
    assert.equal(matchesAccept(file('a.exe', 'application/x-msdownload'), accept), true)
  }
})

test('extensions match case-insensitively, even without a MIME type', () => {
  const accept = '.gpc,.abo,.txt,.pdf'
  assert.equal(matchesAccept(file('vypis.GPC'), accept), true)
  assert.equal(matchesAccept(file('vypis.abo'), accept), true)
  assert.equal(matchesAccept(file('vypis.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'), accept), false)
  assert.equal(matchesAccept(file('gpc'), accept), false)
})

test('spaces around tokens are ignored', () => {
  assert.equal(matchesAccept(file('menu.csv', 'text/csv'), '.xlsx, .xls , .csv'), true)
})

test('exact MIME types match the file type', () => {
  const accept = 'image/jpeg,image/png'
  assert.equal(matchesAccept(file('foto.jpg', 'image/jpeg'), accept), true)
  assert.equal(matchesAccept(file('foto.PNG', 'image/png'), accept), true)
  assert.equal(matchesAccept(file('anim.gif', 'image/gif'), accept), false)
  assert.equal(matchesAccept(file('foto.jpg', ''), accept), false)
})

test('wildcard MIME groups match the prefix only', () => {
  assert.equal(matchesAccept(file('a.webp', 'image/webp'), 'image/*'), true)
  assert.equal(matchesAccept(file('a.mp4', 'video/mp4'), 'image/*'), false)
  assert.equal(matchesAccept(file('a.bin', 'application/octet-stream'), '*/*'), true)
})

test('extensions and MIME types can be mixed', () => {
  const accept = '.csv,image/*'
  assert.equal(matchesAccept(file('a.csv', 'application/vnd.ms-excel'), accept), true)
  assert.equal(matchesAccept(file('a.png', 'image/png'), accept), true)
  assert.equal(matchesAccept(file('a.pdf', 'application/pdf'), accept), false)
})
