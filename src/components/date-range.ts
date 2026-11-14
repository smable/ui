export type DatePreset = 'today' | 'yesterday' | 'this_week' | 'last_week' | 'this_month' | 'custom'

export function getDateRange(preset: DatePreset, now: Date = new Date()): { start: Date; end: Date } {
  // Calendar-day arithmetic: around the DST switch a day has 23 or 25 hours,
  // so `± 86400000` lands an hour off (and on a date-only API, a day off).
  const day = (offset: number) => new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset)
  const endOfDay = (offset: number) => new Date(day(offset + 1).getTime() - 1)
  const mondayOffset = -((now.getDay() + 6) % 7)

  switch (preset) {
    case 'yesterday':
      return { start: day(-1), end: endOfDay(-1) }
    case 'this_week':
      return { start: day(mondayOffset), end: endOfDay(0) }
    case 'last_week':
      return { start: day(mondayOffset - 7), end: endOfDay(mondayOffset - 1) }
    case 'this_month':
      return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: endOfDay(0) }
    default:
      return { start: day(0), end: endOfDay(0) }
  }
}

/**
 * Custom range from the calendar: the first day from 00:00, the last day until 23:59:59.999.
 * The calendar hands over the time it was opened at, and for a single day the same Date
 * object as start and end, so both days are copied before normalising.
 */
export function customDateRange(startRaw: Date | string, endRaw: Date | string): { start: Date; end: Date } {
  const start = new Date(startRaw)
  const end = new Date(endRaw)
  start.setHours(0, 0, 0, 0)
  end.setHours(23, 59, 59, 999)
  return { start, end }
}
