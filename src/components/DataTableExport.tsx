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
import { Download, ChevronDown, FileSpreadsheet, FileText, Printer } from 'lucide-react'
import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'
import type { Table } from '@tanstack/react-table'
import clsx from 'clsx'

export type ExportFormat = 'csv' | 'excel' | 'pdf' | 'print'

interface DataTableExportProps<T> {
  table: Table<T>
  filename?: string
  formats?: ExportFormat[]
  title?: string
}

// ============================================================================
// Helpers — extract visible data from TanStack Table
// ============================================================================

function getExportData<T>(table: Table<T>): { headers: string[]; rows: string[][] } {
  const visibleColumns = table.getVisibleLeafColumns().filter(
    col => col.id !== 'select' && col.id !== 'actions'
  )

  const headers = visibleColumns.map(col => {
    const header = col.columnDef.header
    if (typeof header === 'string') return header
    return col.id
  })

  const filteredRows = table.getFilteredRowModel().rows

  const rows = filteredRows.map(row => {
    return visibleColumns.map(col => {
      const value = row.getValue(col.id)
      if (value === null || value === undefined) return ''
      if (value instanceof Date) return value.toLocaleDateString('cs-CZ')
      if (typeof value === 'boolean') return value ? 'Ano' : 'Ne'
      return String(value)
    })
  })

  return { headers, rows }
}

// ============================================================================
// CSV Export
// ============================================================================

function exportCSV<T>(table: Table<T>, filename: string) {
  const { headers, rows } = getExportData(table)

  const bom = '\uFEFF'
  const csvContent = [
    headers.join(';'),
    ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(';'))
  ].join('\n')

  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8' })
  saveAs(blob, `${filename}.csv`)
}

// ============================================================================
// Excel Export
// ============================================================================

function exportExcel<T>(table: Table<T>, filename: string) {
  const { headers, rows } = getExportData(table)

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

async function exportPDF<T>(table: Table<T>, filename: string, title?: string) {
  const { default: jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')

  const { headers, rows } = getExportData(table)

  const doc = new jsPDF({ orientation: rows[0]?.length > 6 ? 'landscape' : 'portrait' })

  if (title) {
    doc.setFontSize(16)
    doc.text(title, 14, 20)
  }

  autoTable(doc, {
    head: [headers],
    body: rows,
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

function printTable<T>(table: Table<T>, title?: string) {
  const { headers, rows } = getExportData(table)

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
}: DataTableExportProps<T>) {
  const [isOpen, setIsOpen] = useState(false)

  const handleExport = (format: ExportFormat) => {
    switch (format) {
      case 'csv': exportCSV(table, filename); break
      case 'excel': exportExcel(table, filename); break
      case 'pdf': exportPDF(table, filename, title); break
      case 'print': printTable(table, title); break
    }
    setIsOpen(false)
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
            {formats.map((format, i) => (
              <div key={format}>
                {format === 'print' && i > 0 && (
                  <div className="h-px bg-neutral-100 dark:bg-neutral-800 my-1" />
                )}
                <button
                  onClick={() => handleExport(format)}
                  className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-700 dark:text-neutral-300"
                >
                  {FORMAT_CONFIG[format].icon}
                  {FORMAT_CONFIG[format].label}
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
