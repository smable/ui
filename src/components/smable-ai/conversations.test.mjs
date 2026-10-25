import { test } from 'node:test'
import assert from 'node:assert/strict'
import { groupConversations } from './conversations.ts'

/** Lokální čas → ISO řetězec, aby test nezávisel na časové zóně stroje. */
const at = (y, m, d, h = 12, min = 0) => new Date(y, m - 1, d, h, min).toISOString()
const item = (id, updatedAt) => ({ id, title: id, updatedAt })

const shape = (groups) => groups.map((g) => [g.group, g.items.map((i) => i.id)])

test('dnes / tento týden / starší', () => {
  const now = new Date(2026, 9, 23, 15) // pátek
  const groups = groupConversations(
    [
      item('a', at(2026, 10, 23, 8)),
      item('b', at(2026, 10, 23, 0, 0)),
      item('c', at(2026, 10, 22, 23, 30)),
      item('d', at(2026, 10, 19, 0, 0)),
      item('e', at(2026, 10, 18, 23, 59)),
      item('f', at(2026, 10, 1)),
    ],
    now
  )
  assert.deepEqual(shape(groups), [
    ['today', ['a', 'b']],
    ['thisWeek', ['c', 'd']],
    ['older', ['e', 'f']],
  ])
})

test('týden začíná pondělím (neděle patří k týdnu od pondělí)', () => {
  const sunday = new Date(2026, 9, 25, 12)
  const items = [item('dnes', at(2026, 10, 25, 1)), item('po', at(2026, 10, 19, 9)), item('ne', at(2026, 10, 18, 22))]
  assert.deepEqual(shape(groupConversations(items, sunday)), [
    ['today', ['dnes']],
    ['thisWeek', ['po']],
    ['older', ['ne']],
  ])
  assert.deepEqual(shape(groupConversations(items, sunday, false)), [
    ['today', ['dnes']],
    ['older', ['po', 'ne']],
  ])

  const monday = new Date(2026, 9, 26, 10)
  assert.deepEqual(
    shape(groupConversations([item('dnes', at(2026, 10, 26, 0, 0)), item('ne', at(2026, 10, 25, 23))], monday)),
    [
      ['today', ['dnes']],
      ['older', ['ne']],
    ]
  )
})

test('prázdné skupiny se vynechají', () => {
  const now = new Date(2026, 9, 23, 15)
  assert.deepEqual(shape(groupConversations([item('a', at(2026, 10, 23, 8))], now)), [['today', ['a']]])
  assert.deepEqual(shape(groupConversations([item('f', at(2026, 10, 1))], now)), [['older', ['f']]])
  assert.deepEqual(groupConversations([], now), [])
})

test('pořadí vstupu se drží', () => {
  const now = new Date(2026, 9, 23, 15)
  const groups = groupConversations(
    [
      item('x', at(2026, 10, 20)),
      item('y', at(2026, 10, 23, 9)),
      item('z', at(2026, 10, 21)),
      item('w', at(2026, 10, 2)),
      item('v', at(2026, 10, 23, 7)),
    ],
    now
  )
  assert.deepEqual(shape(groups), [
    ['today', ['y', 'v']],
    ['thisWeek', ['x', 'z']],
    ['older', ['w']],
  ])
})
