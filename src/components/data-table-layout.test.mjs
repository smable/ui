import test from 'node:test'
import assert from 'node:assert/strict'
import {
  cellAlignClass,
  columnWidthStyle,
  dataTablePagerState,
  headerAlignClass,
  headerJustifyClass,
  mobileViewClasses,
  skeletonAlignClass,
} from './data-table-layout.ts'

test('without align the classes stay as before', () => {
  assert.equal(headerAlignClass(undefined), 'text-left')
  assert.equal(cellAlignClass(undefined), undefined)
  assert.equal(headerJustifyClass(undefined), undefined)
  assert.equal(skeletonAlignClass(undefined), undefined)
})

test('align maps to header, cell, flex and skeleton classes', () => {
  assert.equal(headerAlignClass('left'), 'text-left')
  assert.equal(cellAlignClass('left'), undefined)
  assert.equal(headerJustifyClass('left'), undefined)

  assert.equal(headerAlignClass('right'), 'text-right')
  assert.equal(cellAlignClass('right'), 'text-right')
  assert.equal(headerJustifyClass('right'), 'justify-end')
  assert.equal(skeletonAlignClass('right'), 'ml-auto')

  assert.equal(headerAlignClass('center'), 'text-center')
  assert.equal(cellAlignClass('center'), 'text-center')
  assert.equal(headerJustifyClass('center'), 'justify-center')
  assert.equal(skeletonAlignClass('center'), 'mx-auto')
})

test('unknown align falls back to left', () => {
  assert.equal(headerAlignClass('middle'), 'text-left')
  assert.equal(cellAlignClass('middle'), undefined)
})

test('fixed layout gives every cell width and min width', () => {
  assert.deepEqual(columnWidthStyle(120, { fixedLayout: true, kind: 'header' }), { width: 120, minWidth: 120 })
  assert.deepEqual(columnWidthStyle(150, { fixedLayout: true, kind: 'cell' }), { width: 150, minWidth: 150 })
})

test('auto layout sizes only headers with a non-default size', () => {
  assert.deepEqual(columnWidthStyle(90, { fixedLayout: false, kind: 'header' }), { width: 90 })
  assert.equal(columnWidthStyle(150, { fixedLayout: false, kind: 'header' }), undefined)
  assert.equal(columnWidthStyle(90, { fixedLayout: false, kind: 'cell' }), undefined)
})

test('fill column never gets a width', () => {
  assert.equal(columnWidthStyle(280, { fixedLayout: true, fill: true, kind: 'header' }), undefined)
  assert.equal(columnWidthStyle(280, { fixedLayout: true, fill: true, kind: 'cell' }), undefined)
  assert.equal(columnWidthStyle(280, { fixedLayout: false, fill: true, kind: 'header' }), undefined)
})

test('client pagination counts filtered rows', () => {
  assert.deepEqual(
    dataTablePagerState({ manual: false, filteredCount: 35, pageIndex: 1, pageSize: 10, pageCount: 4 }),
    { page: 2, totalPages: 4, total: 35, visible: true },
  )
})

test('a single page is still shown, an empty result is not', () => {
  assert.equal(dataTablePagerState({ manual: false, filteredCount: 3, pageIndex: 0, pageSize: 20, pageCount: 1 }).visible, true)
  const empty = dataTablePagerState({ manual: false, filteredCount: 0, pageIndex: 0, pageSize: 20, pageCount: 0 })
  assert.equal(empty.visible, false)
  assert.equal(empty.totalPages, 1)
})

test('server pagination uses totalCount and the page count from the table', () => {
  assert.deepEqual(
    dataTablePagerState({ manual: true, totalCount: 95, filteredCount: 20, pageIndex: 2, pageSize: 20, pageCount: 5 }),
    { page: 3, totalPages: 5, total: 95, visible: true },
  )
})

test('unknown page count is derived from the total', () => {
  assert.equal(dataTablePagerState({ manual: true, totalCount: 95, filteredCount: 20, pageIndex: 0, pageSize: 20, pageCount: -1 }).totalPages, 5)
  assert.equal(dataTablePagerState({ manual: true, totalCount: 5, filteredCount: 5, pageIndex: 0, pageSize: 0, pageCount: -1 }).totalPages, 5)
})

test('server pagination without totalCount falls back (null)', () => {
  assert.equal(dataTablePagerState({ manual: true, filteredCount: 20, pageIndex: 0, pageSize: 20, pageCount: 7 }), null)
  assert.equal(dataTablePagerState({ manual: true, totalCount: Number.NaN, filteredCount: 20, pageIndex: 0, pageSize: 20, pageCount: -1 }), null)
})

test('mobile view classes are literal per breakpoint', () => {
  assert.deepEqual(mobileViewClasses(undefined), { list: 'md:hidden', table: 'hidden md:block' })
  assert.deepEqual(mobileViewClasses('md'), { list: 'md:hidden', table: 'hidden md:block' })
  assert.deepEqual(mobileViewClasses('sm'), { list: 'sm:hidden', table: 'hidden sm:block' })
})
