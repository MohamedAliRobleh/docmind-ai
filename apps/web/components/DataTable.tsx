'use client'

import { useState } from 'react'
import { Download, Tag, Hash, Copy, Check, Filter } from 'lucide-react'
import toast from 'react-hot-toast'

interface DataItem {
  type: string
  value: string
}

interface DataTableProps {
  data: DataItem[]
  docName?: string
}

const typeConfig: Record<string, { label: string; color: string }> = {
  date:         { label: 'Date',          color: 'bg-blue-500/10 text-blue-300 border-blue-500/20' },
  name:         { label: 'Nom',           color: 'bg-purple/10 text-purple border-purple/20' },
  amount:       { label: 'Montant',       color: 'bg-green-500/10 text-green-400 border-green-500/20' },
  deadline:     { label: 'Délai',         color: 'bg-red-500/10 text-red-400 border-red-500/20' },
  address:      { label: 'Adresse',       color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  email:        { label: 'Email',         color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
  phone:        { label: 'Téléphone',     color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  organization: { label: 'Organisation', color: 'bg-pink-500/10 text-pink-400 border-pink-500/20' },
}

const defaultConfig = { label: 'Autre', color: 'bg-accent/10 text-accent border-accent/20' }

function CopyCell({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    toast.success('Copié !')
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <div className="flex items-center justify-between gap-2 group/cell">
      <span className="text-secondary">{value}</span>
      <button
        onClick={handleCopy}
        className="opacity-0 group-hover/cell:opacity-100 transition-opacity p-1 rounded text-muted hover:text-white flex-shrink-0"
        title="Copier"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  )
}

export default function DataTable({ data, docName }: DataTableProps) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null)

  const types = [...new Set(data.map(d => d.type.toLowerCase()))]
  const filtered = activeFilter ? data.filter(d => d.type.toLowerCase() === activeFilter) : data

  const exportCSV = () => {
    const rows = ['Type,Valeur', ...filtered.map(d => `"${d.type}","${d.value.replace(/"/g, '""')}"`)]
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const filename = docName
      ? `${docName.replace(/\.pdf$/i, '')}_extraction.csv`
      : 'extraction.csv'
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-secondary">
          <Hash className="w-4 h-4" />
          <span>{filtered.length} élément{filtered.length !== 1 ? 's' : ''} extrait{filtered.length !== 1 ? 's' : ''}</span>
          {activeFilter && (
            <span className="text-xs text-muted">· filtre actif</span>
          )}
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 text-sm border border-border bg-raised px-4 py-2 rounded-xl hover:border-accent/40 hover:text-accent transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          Exporter CSV
        </button>
      </div>

      {/* Type filters */}
      {types.length > 1 && (
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-muted flex-shrink-0" />
          <button
            onClick={() => setActiveFilter(null)}
            className={`text-xs px-3 py-1 rounded-full border transition-all ${
              !activeFilter
                ? 'border-accent/40 bg-accent/10 text-accent'
                : 'border-border text-muted hover:text-white hover:border-border/80'
            }`}
          >
            Tous ({data.length})
          </button>
          {types.map(type => {
            const cfg = typeConfig[type] ?? defaultConfig
            const count = data.filter(d => d.type.toLowerCase() === type).length
            return (
              <button
                key={type}
                onClick={() => setActiveFilter(activeFilter === type ? null : type)}
                className={`text-xs px-3 py-1 rounded-full border transition-all ${
                  activeFilter === type
                    ? cfg.color
                    : 'border-border text-muted hover:text-white hover:border-border/80'
                }`}
              >
                {cfg.label} ({count})
              </button>
            )
          })}
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-raised">
              <th className="text-left px-4 py-3 text-muted font-mono font-400 text-xs uppercase tracking-wider w-36">Type</th>
              <th className="text-left px-4 py-3 text-muted font-mono font-400 text-xs uppercase tracking-wider">Valeur</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item, i) => {
              const cfg = typeConfig[item.type.toLowerCase()] ?? defaultConfig
              return (
                <tr
                  key={i}
                  className="border-b border-border last:border-0 hover:bg-raised/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border font-mono ${cfg.color}`}>
                      <Tag className="w-2.5 h-2.5" />
                      {cfg.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <CopyCell value={item.value} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-sm text-muted py-6">Aucun élément pour ce filtre.</p>
      )}
    </div>
  )
}
