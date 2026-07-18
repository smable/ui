/**
 * DataTable Export Plugin
 *
 * Provides CSV, Excel, PDF export and Print functionality
 * for TanStack Table filtered/sorted data.
 *
 * Usage:
 *   <DataTableExport table={table} filename="export" />
 *   <DataTableExport table={table} formats={['csv', 'excel']} />
 */

import { useState } from 'react'
import { Download, ChevronDown, FileSpreadsheet, FileText, Printer, Loader2 } from 'lucide-react'
import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'
import type { Table } from '@tanstack/react-table'
import clsx from 'clsx'

export type ExportFormat = 'csv' | 'excel' | 'pdf' | 'print'

/** Raw hodnota buňky pro export (žádné JSX). */
export type DataTableExportValue = string | number | boolean | Date | null | undefined

/**
 * Export kontrakt pro ColumnDef (přes `meta`):
 *
 * Hodnota buňky se bere z accessoru (`accessorKey` / `accessorFn`) přes
 * `row.getValue(columnId)` — NIKDY z `cell` rendereru (ten vrací JSX).
 * Display sloupce (jen `cell`, bez accessoru) se exportují prázdné,
 * pokud nedodají `meta.exportValue`.
 *
 *   {
 *     id: 'price',
 *     accessorFn: row => row.price,          // raw číslo pro sort + export
 *     cell: info => <Price value={info.getValue()} />,  // JSX jen pro UI
 *     meta: {
 *       exportValue: row => row.price,       // override, když accessor nestačí
 *       exportHeader: 'Cena (Kč)',           // když header není string
 *     },
 *   }
 */
export interface DataTableColumnExportMeta<T = any> {
  /** Raw hodnota řádku pro export — má přednost před accessorem. */
  exportValue?: (row: T) => DataTableExportValue
  /** Hlavička pro export, když `header` není plain string (je JSX/funkce). */
  exportHeader?: string
}

/**
 * Vlastní položka export menu (mimo vestavěné formáty) — např. server-side
 * export „CSV — vše (server)" u stránkovaných tabulek, kde vestavěný export
 * umí jen načtená data.
 */
export interface DataTableExportExtraOption {
  /** Stabilní klíč položky (React key + tracking běhu). */
  key: string
  label: string
  /**
   * Handler položky. Může být async — po dobu běhu je položka disabled
   * (spinner + opacity). Chyby se nepolykají, propagují se volajícímu.
   */
  onSelect: () => void | Promise<void>
}

interface DataTableExportProps<T> {
  table: Table<T>
  filename?: string
  formats?: ExportFormat[]
  title?: string
  /**
   * Extra položky vykreslené v dropdownu POD vestavěnými formáty,
   * oddělené separátorem.
   */
  extraOptions?: DataTableExportExtraOption[]
  /**
   * Načte PŮVODNÍ row objekty (typ `T`) VŠECH stránek pro export — použij
   * u server-side stránkovaných tabulek (`manualPagination`), kde row model
   * drží jen načtenou stránku a vestavěný export by jinak tiše exportoval
   * jen ji.
   *
   * Když je zadán, klik na formát (csv/excel/pdf/print) nejdřív zavolá
   * `fetchAllRows()` (položka menu mezitím ukazuje spinner a je disabled,
   * ostatní položky jsou guardnuté proti souběhu — stejný vzor jako async
   * `extraOptions`) a export se vygeneruje z vrácených řádků. Hodnoty se
   * extrahují se stejným kontraktem jako z row modelu: `meta.exportValue`
   * → accessor (`accessorFn` / `accessorKey` vč. tečkové notace) → display
   * sloupec bez accessoru prázdný. Chyby se nepolykají — propagují se
   * volajícímu (menu zůstane otevřené).
   *
   * Bez tohoto propu je chování beze změny (exportuje se row model — BC).
   *
   * Pozor: PDF a tisk s desítkami tisíc řádků jsou pomalé
   * (jspdf-autotable / render tabulky) — zodpovědnost volajícího.
   */
  fetchAllRows?: () => Promise<T[]>
}

// ============================================================================
// Helpers — extract visible data from TanStack Table
// ============================================================================

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (value instanceof Date) return value.toLocaleDateString('cs-CZ')
  if (typeof value === 'boolean') return value ? 'Ano' : 'Ne'
  return String(value)
}

/**
 * Zdrojový řádek exportu — buď z TanStack row modelu (`getValue` čte přes
 * `row.getValue`), nebo raw objekt mimo row model (`getValue` chybí a hodnota
 * se resolvuje přes `column.accessorFn`).
 */
interface ExportSourceRow<T> {
  original: T
  index: number
  getValue?: (columnId: string) => unknown
}

/**
 * Sestaví export data ze zdrojových řádků. Obě větve (row model / raw rows
 * z `fetchAllRows`) sdílejí tuto jedinou cestu — stejné sloupce, hlavičky,
 * priorita hodnot i formátování (`formatValue`).
 *
 * Priorita hodnoty buňky:
 *   1. `meta.exportValue(original)` — má vždy přednost
 *   2. row model: `row.getValue(col.id)`; raw řádek: `col.accessorFn(original, index)`
 *      — `column.accessorFn` je TanStackem už resolvnutý accessor (accessorFn
 *      z definice, nebo accessorKey vč. tečkové notace `a.b`), takže obě
 *      cesty čtou identickou hodnotu
 *   3. display sloupec bez accessoru → prázdno
 */
function buildExportData<T>(
  table: Table<T>,
  sourceRows: ExportSourceRow<T>[]
): { headers: string[]; rows: string[][] } {
  // DataTables parita: jen viditelné sloupce (`:visible`)…
  const visibleColumns = table.getVisibleLeafColumns().filter(
    col => col.id !== 'select' && col.id !== 'actions'
  )

  const headers = visibleColumns.map(col => {
    const meta = col.columnDef.meta as DataTableColumnExportMeta<T> | undefined
    if (meta?.exportHeader) return meta.exportHeader
    const header = col.columnDef.header
    if (typeof header === 'string') return header
    return col.id
  })

  const rows = sourceRows.map(({ original, index, getValue }) => {
    return visibleColumns.map(col => {
      const meta = col.columnDef.meta as DataTableColumnExportMeta<T> | undefined
      const value = meta?.exportValue
        ? meta.exportValue(original)
        : getValue
          ? getValue(col.id)
          : col.accessorFn
            ? col.accessorFn(original, index)
            : undefined
      return formatValue(value)
    })
  })

  return { headers, rows }
}

/**
 * Export data z tabulky, nebo z raw řádků všech stránek (`allRows` z
 * `fetchAllRows` — server-side stránkované tabulky, kde row model drží
 * jen načtenou stránku).
 */
function getExportData<T>(
  table: Table<T>,
  allRows?: T[]
): { headers: string[]; rows: string[][] } {
  if (allRows) {
    return buildExportData(
      table,
      allRows.map((original, index) => ({ original, index }))
    )
  }

  // Všechny filtrované řádky před stránkováním (ne jen aktuální stránka).
  // Pozn.: při manualPagination drží row model jen načtenou stránku —
  // pro plný export předej `allRows` (prop `fetchAllRows`).
  return buildExportData(
    table,
    table.getFilteredRowModel().rows.map((row, index) => ({
      original: row.original,
      index,
      getValue: (columnId: string) => row.getValue(columnId),
    }))
  )
}

// ============================================================================
// CSV Export
// ============================================================================

function csvCell(value: string): string {
  return /[";\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

/** UTF-8 s BOM, st\u0159edn\u00EDk jako odd\u011Blova\u010D, CRLF \u2014 \u010Desk\u00E1 Excel konvence. */
export function exportCSV<T>(table: Table<T>, filename: string, allRows?: T[]) {
  const { headers, rows } = getExportData(table, allRows)

  const bom = '\uFEFF'
  const csvContent = [headers, ...rows]
    .map(row => row.map(csvCell).join(';'))
    .join('\r\n')

  const blob = new Blob([bom + csvContent + '\r\n'], { type: 'text/csv;charset=utf-8' })
  saveAs(blob, `${filename}.csv`)
}

// ============================================================================
// Excel Export
// ============================================================================

export function exportExcel<T>(table: Table<T>, filename: string, allRows?: T[]) {
  const { headers, rows } = getExportData(table, allRows)

  const wsData = [headers, ...rows]
  const ws = XLSX.utils.aoa_to_sheet(wsData)

  // Auto-size columns
  ws['!cols'] = headers.map((h, i) => {
    const maxLen = Math.max(h.length, ...rows.map(r => (r[i] || '').length))
    return { wch: Math.min(Math.max(maxLen + 2, 10), 40) }
  })

  // Style header row (bold)
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1')
  for (let c = range.s.c; c <= range.e.c; c++) {
    const addr = XLSX.utils.encode_cell({ r: 0, c })
    if (ws[addr]) {
      ws[addr].s = { font: { bold: true } }
    }
  }

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Data')
  XLSX.writeFile(wb, `${filename}.xlsx`)
}

// ============================================================================
// PDF Export
// ============================================================================

/**
 * Standardní fonty jsPDF (helvetica) pokrývají jen CP1252 — česká
 * diakritika (ě š č ř ž ů …) by se rozsypala. Transliterace přes NFD
 * dekompozici + odstranění diakritických znamének; normalizují se i
 * typografické mezery/pomlčky z Intl formátování (stejná konvence jako
 * lib/export.ts v app.smable.cz, bez nových závislostí).
 */
function pdfText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u00a0\u202f]/g, ' ')
    .replace(/\u2212/g, '-')
    .replace(/[\u2013\u2014]/g, '-')
}

export async function exportPDF<T>(table: Table<T>, filename: string, title?: string, allRows?: T[]) {
  const { default: jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')

  const { headers, rows } = getExportData(table, allRows)

  const doc = new jsPDF({ orientation: rows[0]?.length > 6 ? 'landscape' : 'portrait' })

  if (title) {
    doc.setFontSize(16)
    doc.text(pdfText(title), 14, 20)
  }

  autoTable(doc, {
    head: [headers.map(pdfText)],
    body: rows.map(row => row.map(pdfText)),
    startY: title ? 30 : 15,
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [38, 38, 38],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250],
    },
  })

  doc.save(`${filename}.pdf`)
}

// ============================================================================
// Print
// ============================================================================

export function printTable<T>(table: Table<T>, title?: string, allRows?: T[]) {
  const { headers, rows } = getExportData(table, allRows)

  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title || 'Tisk'}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 20px; color: #262626; }
        h1 { font-size: 18px; margin-bottom: 4px; }
        .meta { font-size: 12px; color: #737373; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th { background: #262626; color: white; text-align: left; padding: 8px 12px; font-weight: 600; text-transform: uppercase; font-size: 10px; letter-spacing: 0.05em; }
        td { padding: 8px 12px; border-bottom: 1px solid #e5e5e5; }
        tr:nth-child(even) { background: #fafafa; }
        @media print { body { padding: 0; } }
      </style>
    </head>
    <body>
      ${title ? `<h1>${title}</h1>` : ''}
      <div class="meta">${rows.length} záznamů · ${new Date().toLocaleDateString('cs-CZ')} ${new Date().toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}</div>
      <table>
        <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody>${rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody>
      </table>
    </body>
    </html>
  `

  printWindow.document.write(html)
  printWindow.document.close()
  printWindow.onload = () => {
    printWindow.print()
  }
}

// ============================================================================
// Export Button Component
// ============================================================================

const FORMAT_CONFIG: Record<ExportFormat, { label: string; icon: React.ReactNode }> = {
  csv: { label: 'Export do CSV', icon: <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> },
  excel: { label: 'Export do Excel', icon: <FileSpreadsheet className="w-4 h-4 text-green-600" /> },
  pdf: { label: 'Export do PDF', icon: <FileText className="w-4 h-4 text-red-500" /> },
  print: { label: 'Tisk', icon: <Printer className="w-4 h-4 text-neutral-500" /> },
}

export function DataTableExport<T>({
  table,
  filename = 'export',
  formats = ['csv', 'excel', 'pdf', 'print'],
  title,
  extraOptions,
  fetchAllRows,
}: DataTableExportProps<T>) {
  const [isOpen, setIsOpen] = useState(false)
  // Klíč právě běžící položky menu — formát (`format:csv`) nebo extra option
  // (`extra:{key}`). Dokud běží, je položka disabled (spinner) a ostatní
  // položky jsou guardnuté proti souběhu.
  const [runningKey, setRunningKey] = useState<string | null>(null)

  const handleExport = async (format: ExportFormat) => {
    if (runningKey) return

    if (!fetchAllRows) {
      // BC: bez fetchAllRows synchronní export z row modelu, beze změny.
      switch (format) {
        case 'csv': exportCSV(table, filename); break
        case 'excel': exportExcel(table, filename); break
        case 'pdf': exportPDF(table, filename, title); break
        case 'print': printTable(table, title); break
      }
      setIsOpen(false)
      return
    }

    setRunningKey(`format:${format}`)
    try {
      // Chyby se nechytají (žádné vlastní error UI) — propagují se
      // volajícímu, menu zůstává otevřené.
      const allRows = await fetchAllRows()
      switch (format) {
        case 'csv': exportCSV(table, filename, allRows); break
        case 'excel': exportExcel(table, filename, allRows); break
        case 'pdf': await exportPDF(table, filename, title, allRows); break
        case 'print': printTable(table, title, allRows); break
      }
      setIsOpen(false)
    } finally {
      setRunningKey(null)
    }
  }

  const handleExtraSelect = async (option: DataTableExportExtraOption) => {
    if (runningKey) return
    setRunningKey(`extra:${option.key}`)
    try {
      // Chyby se nechytají (žádné vlastní error UI) — propagují se volajícímu.
      await option.onSelect()
      setIsOpen(false)
    } finally {
      setRunningKey(null)
    }
  }

  const filteredCount = table.getFilteredRowModel().rows.length

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 h-10 px-4 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
      >
        <Download className="w-4 h-4" />
        <span className="hidden sm:inline">Export</span>
        <ChevronDown className={clsx('w-4 h-4 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-neutral-900 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-800 py-1 z-50">
            <div className="px-4 py-2 text-xs text-neutral-400 border-b border-neutral-100 dark:border-neutral-800">
              {filteredCount} záznamů
            </div>
            {formats.map((format, i) => {
              const isRunning = runningKey === `format:${format}`
              return (
                <div key={format}>
                  {format === 'print' && i > 0 && (
                    <div className="h-px bg-neutral-100 dark:bg-neutral-800 my-1" />
                  )}
                  <button
                    onClick={() => handleExport(format)}
                    disabled={isRunning}
                    className={clsx(
                      'w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-700 dark:text-neutral-300',
                      isRunning && 'opacity-50 cursor-wait'
                    )}
                  >
                    {isRunning ? (
                      <Loader2 className="w-4 h-4 text-neutral-500 animate-spin" />
                    ) : (
                      FORMAT_CONFIG[format].icon
                    )}
                    {FORMAT_CONFIG[format].label}
                  </button>
                </div>
              )
            })}
            {extraOptions && extraOptions.length > 0 && (
              <>
                {formats.length > 0 && (
                  <div className="h-px bg-neutral-100 dark:bg-neutral-800 my-1" />
                )}
                {extraOptions.map(option => {
                  const isRunning = runningKey === `extra:${option.key}`
                  return (
                    <button
                      key={option.key}
                      onClick={() => handleExtraSelect(option)}
                      disabled={isRunning}
                      className={clsx(
                        'w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-700 dark:text-neutral-300',
                        isRunning && 'opacity-50 cursor-wait'
                      )}
                    >
                      {isRunning ? (
                        <Loader2 className="w-4 h-4 text-neutral-500 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4 text-neutral-500" />
                      )}
                      {option.label}
                    </button>
                  )
                })}
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}
