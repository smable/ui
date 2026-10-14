import { test } from 'node:test'
import assert from 'node:assert/strict'
import { tileFooter } from './itemTile.ts'

test('bez skladu jen cena vpravo', () => {
  assert.deepEqual(tileFooter({ price: '49,00', showPrice: true, stock: null }), { left: null, right: '49,00' })
})

test('sklad vlevo, cena vpravo', () => {
  assert.deepEqual(tileFooter({ price: '49,00', showPrice: true, stock: '12 ks' }), { left: '12 ks', right: '49,00' })
})

test('zapnuty sklad bez suroviny = prazdny radek, ne null', () => {
  assert.deepEqual(tileFooter({ price: '49,00', showPrice: true, stock: '' }), { left: '', right: '49,00' })
})

test('skryta cena', () => {
  assert.deepEqual(tileFooter({ price: '49,00', showPrice: false, stock: '3,50 kg' }), { left: '3,50 kg', right: null })
  assert.deepEqual(tileFooter({ price: '49,00', showPrice: false, stock: null }), { left: null, right: null })
})

test('prazdna cena (slozka) se nevykresli', () => {
  assert.deepEqual(tileFooter({ price: '', showPrice: true, stock: null }), { left: null, right: null })
})
