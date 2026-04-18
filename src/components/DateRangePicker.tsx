import { useState } from 'react'
import Datepicker from 'react-tailwindcss-datepicker'
import clsx from 'clsx'

export type DatePreset = 'today' | 'yesterday' | 'this_week' | 'last_week' | 'this_month' | 'custom'

const PRESETS: { key: DatePreset; label: string }[] = [
  { key: 'today', label: 'Dnes' },
  { key: 'yesterday', label: 'Včera' },
  { key: 'this_week', label: 'Tento týden' },
  { key: 'last_week', label: 'Minulý týden' },
  { key: 'this_month', label: 'Tento měsíc' },
]

export function getDateRange(preset: DatePreset): { start: Date; end: Date } {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  switch (preset) {
    case 'today':
      return { start: today, end: new Date(today.getTime() + 86400000 - 1) }
    case 'yesterday': {
      const yesterday = new Date(today.getTime() - 86400000)
      return { start: yesterday, end: new Date(today.getTime() - 1) }
    }
    case 'this_week': {
      const day = today.getDay()
      const monday = new Date(today.getTime() - ((day === 0 ? 6 : day - 1) * 86400000))
      return { start: monday, end: new Date(today.getTime() + 86400000 - 1) }
    }
    case 'last_week': {
      const day = today.getDay()
      const thisMonday = new Date(today.getTime() - ((day === 0 ? 6 : day - 1) * 86400000))
      const lastMonday = new Date(thisMonday.getTime() - 7 * 86400000)
      return { start: lastMonday, end: new Date(thisMonday.getTime() - 1) }
    }
    case 'this_month':
      return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: new Date(today.getTime() + 86400000 - 1) }
    default:
      return { start: today, end: new Date(today.getTime() + 86400000 - 1) }
  }
}

interface DateRangePickerProps {
  preset: DatePreset
  dateRange: { start: Date; end: Date }
  onPresetChange: (preset: DatePreset) => void
  onCustomRange: (start: Date, end: Date) => void
}

export function DateRangePicker({ preset, dateRange, onPresetChange, onCustomRange }: DateRangePickerProps) {
  const [pickerValue, setPickerValue] = useState<{ startDate: Date | null; endDate: Date | null }>({
    startDate: dateRange.start,
    endDate: dateRange.end,
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handlePickerChange = (newValue: any) => {
    if (newValue?.startDate && newValue?.endDate) {
      setPickerValue(newValue)
      const start = newValue.startDate instanceof Date ? newValue.startDate : new Date(newValue.startDate)
      const end = newValue.endDate instanceof Date ? newValue.endDate : new Date(newValue.endDate)
      end.setHours(23, 59, 59, 999)
      onCustomRange(start, end)
    }
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      {/* Preset buttons */}
      <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg w-fit">
        {PRESETS.map(p => (
          <button
            key={p.key}
            onClick={() => onPresetChange(p.key)}
            className={clsx(
              "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
              preset === p.key
                ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Custom date picker */}
      <div className="w-[260px]">
        <Datepicker
          value={pickerValue as any}
          onChange={handlePickerChange}
          showShortcuts={false}
          primaryColor="teal"
          separator="–"
          displayFormat="DD.MM.YYYY"
          placeholder="Vlastní období..."
          inputClassName="w-full h-9 px-3 text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all cursor-pointer"
          toggleClassName="absolute right-0 h-full px-3 text-neutral-400 focus:outline-none"
          containerClassName="relative"
        />
      </div>
    </div>
  )
}
