import { useState } from 'react'
import Datepicker from 'react-tailwindcss-datepicker'
import clsx from 'clsx'
import type { DatePreset } from './date-range'

export { getDateRange, type DatePreset } from './date-range'

const PRESETS: { key: DatePreset; label: string }[] = [
  { key: 'today', label: 'Dnes' },
  { key: 'yesterday', label: 'Včera' },
  { key: 'this_week', label: 'Tento týden' },
  { key: 'last_week', label: 'Minulý týden' },
  { key: 'this_month', label: 'Tento měsíc' },
]

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
          <button type="button"
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
