import { test } from 'node:test'
import assert from 'node:assert/strict'
import { TILE_SIZE, stockPillClass, nbspUnits, tileFooter } from './itemTile.ts'

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

test('rozmery podle velikosti', () => {
  assert.equal(TILE_SIZE.xs.height, 'h-[96px]')
  assert.equal(TILE_SIZE.s.height, 'h-[120px]')
  assert.equal(TILE_SIZE.l.height, 'h-[148px]')
  assert.match(TILE_SIZE.l.name, /text-\[15px\]/)
})

test('ton stitku skladu', () => {
  assert.equal(stockPillClass('ok', 'photo'), 'bg-white/90 text-neutral-800')
  assert.equal(stockPillClass('ok', 'dark'), 'bg-white/20 text-white')
  assert.equal(stockPillClass('ok', 'light'), 'bg-black/10 text-neutral-800')
  assert.equal(stockPillClass('low', 'photo'), 'bg-[#fef3c7] text-[#92400e]')
  assert.equal(stockPillClass('out', 'dark'), 'bg-[#fee2e2] text-[#991b1b]')
})

test('pevna mezera mezi cislem a jednotkou', () => {
  assert.equal(nbspUnits('Voda 0,33 l'), 'Voda 0,33\u00a0l')
  assert.equal(nbspUnits('Pivo 0,5 l a 2 ks'), 'Pivo 0,5\u00a0l a 2\u00a0ks')
  assert.equal(nbspUnits('S\u00fdr 250 g'), 'S\u00fdr 250\u00a0g')
  assert.equal(nbspUnits('Lahev ledov\u00e1'), 'Lahev ledov\u00e1')
})
