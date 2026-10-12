import test from 'node:test'
import assert from 'node:assert/strict'
import { layoutFlowFunnel, FLOW_FUNNEL_MIN_BAND } from './flow-funnel-layout.ts'

const SIZE = { width: 1000, height: 420 }
const near = (a, b, eps = 0.05) => assert.ok(Math.abs(a - b) <= eps, `${a} != ${b}`)
const band = (l, id) => l.bands.find((b) => b.id === id)

const ads = (c) => ({
  base: c.clicks,
  side: [{ id: 'unmeasured', label: 'Neměřeno', value: c.unmeasured }],
  root: {
    id: 'sessions', label: 'Návštěvy webu', value: c.sessions, tone: 'primary', children: [
      { id: 'no-lead', label: 'Bez poptávky', value: c.noLead, children: [
        { id: 'not-engaged', label: 'Odešli bez zapojení', value: c.notEngaged },
        { id: 'browsed', label: 'Prohlíželi, ale poptávku neposlali', value: c.browsed },
      ] },
      { id: 'leads', label: 'Poptávka', value: c.leads, tone: 'primary', children: c.crm ? [
        { id: 'crm', label: 'Lead v CRM', value: c.crm, tone: 'primary', children: [
          { id: 'won', label: 'Zákazník', value: c.won, tone: 'primary' },
        ] },
      ] : [] },
    ],
  },
})
const TYPICAL = { clicks: 226, unmeasured: 122, sessions: 104, noLead: 102, notEngaged: 34, browsed: 68, leads: 2 }
const WITH_CRM = { clicks: 200, unmeasured: 50, sessions: 150, noLead: 110, notEngaged: 40, browsed: 70, leads: 40, crm: 20, won: 5 }

test('base 0 znamená prázdný graf', () => {
  const l = layoutFlowFunnel(ads({ ...TYPICAL, clicks: 0, unmeasured: 0, sessions: 0, noLead: 0, notEngaged: 0, browsed: 0, leads: 0 }), SIZE)
  assert.equal(l.empty, true)
  assert.deepEqual(l.bands, [])
})

test('procenta: root a side z base, dítě z rodiče', () => {
  const l = layoutFlowFunnel(ads(TYPICAL), SIZE)
  near(band(l, 'sessions').ratio, 104 / 226, 1e-9)
  near(l.side[0].ratio, 122 / 226, 1e-9)
  near(band(l, 'no-lead').ratio, 102 / 104, 1e-9)
  near(band(l, 'browsed').ratio, 68 / 102, 1e-9)
})

test('tloušťky dětí nad minimem dají tloušťku rodiče', () => {
  const l = layoutFlowFunnel(ads({ ...TYPICAL, sessions: 100, noLead: 60, notEngaged: 20, browsed: 40, leads: 40 }), SIZE)
  near(band(l, 'no-lead').h + band(l, 'leads').h, band(l, 'sessions').h)
  near(band(l, 'not-engaged').h + band(l, 'browsed').h, band(l, 'no-lead').h)
})

test('malá větev má aspoň minimální tloušťku', () => {
  const l = layoutFlowFunnel(ads(TYPICAL), SIZE)
  assert.ok(band(l, 'leads').h >= FLOW_FUNNEL_MIN_BAND)
  assert.equal(band(l, 'leads').h, FLOW_FUNNEL_MIN_BAND)
})

test('neutrální větev je nad primární', () => {
  const l = layoutFlowFunnel(ads(TYPICAL), SIZE)
  assert.ok(band(l, 'no-lead').y + band(l, 'no-lead').h <= band(l, 'leads').y)
})

test('jediné dítě pokračuje rovně (stejný střed)', () => {
  const l = layoutFlowFunnel(ads(WITH_CRM), SIZE)
  const mid = (b) => b.y + b.h / 2
  near(mid(band(l, 'crm')), mid(band(l, 'leads')))
  near(mid(band(l, 'won')), mid(band(l, 'crm')))
})

test('nic nevyčnívá z plátna a popisky mají místo', () => {
  for (const c of [TYPICAL, WITH_CRM]) {
    const l = layoutFlowFunnel(ads(c), SIZE)
    for (const b of l.bands) {
      assert.ok(b.x >= 0 && b.x + b.w <= SIZE.width, `${b.id} x`)
      assert.ok(b.y >= 0 && b.y + b.h <= SIZE.height, `${b.id} y`)
      assert.ok(b.labelX <= SIZE.width - 220, `${b.id} label`)
      assert.ok(b.labelY >= 16 && b.labelY <= SIZE.height - 16, `${b.id} labelY`)
    }
    for (const r of l.ribbons) {
      assert.ok(r.x1 >= 0 && r.x2 <= SIZE.width)
      assert.ok(l.bands.some((b) => b.id === r.to))
    }
  }
})

test('tóny pásů: primární→neutrální přechod, primární→primární, neutrální→neutrální', () => {
  const l = layoutFlowFunnel(ads(WITH_CRM), SIZE)
  const tone = (to) => l.ribbons.find((r) => r.to === to).tone
  assert.equal(tone('no-lead'), 'fade')
  assert.equal(tone('leads'), 'primary')
  assert.equal(tone('crm'), 'primary')
  assert.equal(tone('browsed'), 'neutral')
})

test('nulové návštěvy při proklicích: minimální pás, graf není prázdný', () => {
  const l = layoutFlowFunnel(ads({ clicks: 30, unmeasured: 30, sessions: 0, noLead: 0, notEngaged: 0, browsed: 0, leads: 0 }), SIZE)
  assert.equal(l.empty, false)
  assert.equal(band(l, 'sessions').h, FLOW_FUNNEL_MIN_BAND)
  assert.equal(band(l, 'sessions').ratio, 0)
  assert.equal(band(l, 'no-lead').ratio, 0)
  near(l.side[0].ratio, 1, 1e-9)
})
