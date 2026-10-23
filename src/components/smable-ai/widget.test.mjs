import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  SMABLE_AI_DESKTOP_QUERY,
  SMABLE_AI_PANEL_WIDTH,
  isWidgetExpanded,
  widgetEscapeAction,
  widgetExpandAction,
} from './widget.ts'

test('šířka panelu a breakpoint lg', () => {
  assert.equal(SMABLE_AI_PANEL_WIDTH, 420)
  assert.equal(SMABLE_AI_DESKTOP_QUERY, '(min-width: 1024px)')
})

test('rozbalení ze sbalené lišty: od lg do panelu, jen s callbackem umístění', () => {
  const collapsed = { placement: 'float', expanded: false }
  assert.equal(widgetExpandAction({ ...collapsed, isDesktop: true, hasPlacementCallback: true }), 'panel')
  assert.equal(widgetExpandAction({ ...collapsed, isDesktop: true, hasPlacementCallback: false }), 'expand')
  assert.equal(widgetExpandAction({ ...collapsed, isDesktop: false, hasPlacementCallback: true }), 'expand')
  assert.equal(widgetExpandAction({ ...collapsed, isDesktop: false, hasPlacementCallback: false }), 'expand')
})

test('rozbalený widget se znovu nerozbaluje', () => {
  for (const isDesktop of [true, false]) {
    assert.equal(widgetExpandAction({ placement: 'float', expanded: true, isDesktop, hasPlacementCallback: true }), 'none')
    assert.equal(widgetExpandAction({ placement: 'panel', expanded: false, isDesktop, hasPlacementCallback: true }), 'none')
    assert.equal(widgetExpandAction({ placement: 'panel', expanded: true, isDesktop, hasPlacementCallback: true }), 'none')
  }
})

test('panel je vždy rozbalený, plovoucí podle expanded', () => {
  assert.equal(isWidgetExpanded('panel', false), true)
  assert.equal(isWidgetExpanded('panel', true), true)
  assert.equal(isWidgetExpanded('float', false), false)
  assert.equal(isWidgetExpanded('float', true), true)
})

test('Esc ve sbalené liště nedělá nic', () => {
  assert.equal(widgetEscapeAction({ placement: 'float', expanded: false, historyOpen: false }), 'none')
  assert.equal(widgetEscapeAction({ placement: 'float', expanded: false, historyOpen: true }), 'none')
})

test('Esc v rozbalené kartě zavře nejdřív historii, potom sbalí', () => {
  assert.equal(widgetEscapeAction({ placement: 'float', expanded: true, historyOpen: true }), 'closeHistory')
  assert.equal(widgetEscapeAction({ placement: 'float', expanded: true, historyOpen: false }), 'collapse')
})

test('Esc v panelu jen zavře historii, nikdy nesbalí', () => {
  for (const expanded of [true, false]) {
    assert.equal(widgetEscapeAction({ placement: 'panel', expanded, historyOpen: true }), 'closeHistory')
    assert.equal(widgetEscapeAction({ placement: 'panel', expanded, historyOpen: false }), 'none')
  }
})
