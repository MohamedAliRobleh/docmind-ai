'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FileText, Calendar, ArrowUpRight, Trash2, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

interface DocumentCardProps {
  id: string
  name: string
  created_at: string
  snippet?: string
  matchType?: 'name' | 'content' | 'both'
  searchQuery?: string
  onDelete?: (id: string) => void
}

function highlight(text: string, query?: string) {
  if (!query || query.length < 2) return <>{text}</>
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = text.split(regex)
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part)
          ? <mark key={i} className="bg-accent/30 text-accent rounded px-0.5">{part}</mark>
          : part
      )}
    </>
  )
}

export default function DocumentCard({
  id, name, created_at, snippet, matchType, searchQuery, onDelete
}: DocumentCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const date = new Date(created_at).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric', year: 'numeric' })
  const ext = name.split('.').pop()?.toUpperCase() ?? 'PDF'
  const displayName = name.replace(/\.[^.]+$/, '')

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!confirmDelete) {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 4000)
      return
    }
    setDeleting(true)
    const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Document supprimé')
      onDelete?.(id)
    } else {
      toast.error('Erreur lors de la suppression')
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setConfirmDelete(false)
  }

  return (
    <div className={`group relative bg-surface border rounded-2xl p-5 transition-all ${
      confirmDelete ? 'border-red-500/50 bg-red-500/5' : 'border-border hover:border-border/70 hover:bg-raised'
    }`}>
      {/* Delete controls */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5">
        {confirmDelete ? (
          <>
            <button
              onClick={handleCancelDelete}
              className="text-xs px-2 py-1 rounded-lg border border-border text-secondary hover:text-white hover:bg-raised transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-xs px-2 py-1 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 transition-colors flex items-center gap-1"
            >
              <AlertTriangle className="w-3 h-3" />
              {deleting ? 'Suppression…' : 'Confirmer'}
            </button>
          </>
        ) : (
          <button
            onClick={handleDelete}
            className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center text-muted hover:text-red-400 hover:bg-red-500/10 transition-all"
            title="Supprimer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <Link href={`/document/${id}`} className="block">
        <div className="flex items-start gap-4 pr-8">
          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 transition-colors ${
            confirmDelete ? 'bg-red-500/10 border-red-500/20' : 'bg-accent/10 border-accent/20 group-hover:bg-accent/15'
          }`}>
            <FileText className={`w-5 h-5 ${confirmDelete ? 'text-red-400' : 'text-accent'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-syne font-600 text-sm text-white truncate mb-1 group-hover:text-accent transition-colors">
              {searchQuery ? highlight(displayName, searchQuery) : displayName}
            </h3>
            <div className="flex items-center gap-2 flex-wrap text-xs text-muted">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {date}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-raised border border-border font-mono">
                {ext}
              </span>
              {matchType === 'content' && (
                <span className="px-1.5 py-0.5 rounded-full bg-purple/10 border border-purple/20 text-purple text-[10px]">
                  trouvé dans le contenu
                </span>
              )}
              {matchType === 'both' && (
                <span className="px-1.5 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px]">
                  titre + contenu
                </span>
              )}
            </div>
          </div>
          {!confirmDelete && (
            <ArrowUpRight className="w-4 h-4 text-muted group-hover:text-accent transition-colors flex-shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 duration-200" />
          )}
        </div>

        {/* Content snippet when found via content search */}
        {snippet && (
          <div className="mt-3 pl-14 text-xs text-secondary leading-relaxed line-clamp-2 font-mono bg-raised border border-border rounded-lg px-3 py-2">
            {searchQuery ? highlight(snippet, searchQuery) : snippet}
          </div>
        )}

        {!snippet && (
          <div className="mt-4 flex gap-1.5 pl-14">
            {['Résumé', 'Chat', 'Rapport', 'Extraction'].map(tag => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-raised border border-border text-muted">
                {tag}
              </span>
            ))}
          </div>
        )}
      </Link>
    </div>
  )
}
