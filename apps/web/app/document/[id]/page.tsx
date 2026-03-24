'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ChatInterface from '@/components/ChatInterface'
import ReportViewer from '@/components/ReportViewer'
import DataTable from '@/components/DataTable'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import { ArrowLeft, FileText, MessageSquare, BarChart3, Zap, AlignLeft, Loader2, AlertCircle, RefreshCw, Copy, Check } from 'lucide-react'
import toast from 'react-hot-toast'

const tabs = [
  { id: 'summary', label: 'Résumé', icon: AlignLeft },
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'report', label: 'Rapport', icon: BarChart3 },
  { id: 'extract', label: 'Extraction', icon: Zap },
]

function CopySummaryButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Résumé copié !')
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 border border-border text-secondary text-xs px-3 py-1.5 rounded-lg hover:border-accent/40 hover:text-accent transition-all"
      title="Copier le résumé"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Copié' : 'Copier'}
    </button>
  )
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
      <span>{message}</span>
    </div>
  )
}

export default function DocumentPage({ params }: { params: { id: string } }) {
  const [docName, setDocName] = useState('')
  const [niche, setNiche] = useState<string | null>(null)
  const [summary, setSummary] = useState('')
  const [report, setReport] = useState('')
  const [data, setData] = useState<any[]>([])
  const [tab, setTab] = useState('summary')
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Load doc name + niche (demo: localStorage, prod: handled server-side)
  useEffect(() => {
    fetch(`/api/documents/${params.id}`)
      .then(r => r.json())
      .then(d => { if (d.name) setDocName(d.name) })
      .catch(() => {})

    const stored = typeof window !== 'undefined' ? localStorage.getItem('docmind_niche') : null
    if (stored) setNiche(stored)
  }, [params.id])

  // Auto-generate summary on mount
  useEffect(() => {
    generateSummary()
  }, [params.id])

  async function callApi(endpoint: string, body: object): Promise<any> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (niche) headers['x-user-niche'] = niche

    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error || json.detail || `Error ${res.status}`)
    return json
  }

  const generateSummary = async () => {
    setLoading('summary')
    setError(null)
    try {
      const json = await callApi('/api/summarize', { doc_id: params.id })
      setSummary(json.summary)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(null)
    }
  }

  const generateReport = async () => {
    setLoading('report')
    setError(null)
    try {
      const json = await callApi('/api/report', { doc_id: params.id })
      setReport(json.report)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(null)
    }
  }

  const extractData = async () => {
    setLoading('extract')
    setError(null)
    try {
      const json = await callApi('/api/extract', { doc_id: params.id })
      setData(json.data ?? [])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(null)
    }
  }

  const displayName = docName
    ? docName.replace(/\.pdf$/i, '')
    : 'Document'

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-border bg-surface flex items-center gap-3 px-4 md:px-6 sticky top-0 z-30">
        <Link href="/dashboard" className="flex items-center gap-1.5 text-secondary hover:text-white transition-colors text-sm flex-shrink-0">
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Dashboard</span>
        </Link>
        <div className="w-px h-5 bg-border flex-shrink-0" />
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="w-6 h-6 rounded bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
            <FileText className="w-3.5 h-3.5 text-accent" />
          </div>
          <span className="font-syne font-600 text-sm truncate">{displayName}</span>
        </div>
      </header>

      <div className="flex-1 flex flex-col max-w-5xl w-full mx-auto px-4 md:px-8 py-5 md:py-8 gap-4 md:gap-6">
        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-surface border border-border rounded-xl overflow-x-auto scrollbar-none w-full sm:w-fit">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { setTab(id); setError(null) }}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm transition-all whitespace-nowrap flex-shrink-0 ${
                tab === id ? 'bg-accent text-bg font-500 shadow-sm' : 'text-secondary hover:text-white hover:bg-raised'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {error && <ErrorBanner message={error} />}

        {/* Tab content */}
        <div className="flex-1 animate-in">

          {/* SUMMARY */}
          {tab === 'summary' && (
            <div className="bg-surface border border-border rounded-2xl p-5 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-syne font-600 text-xl">Résumé</h2>
                  <p className="text-secondary text-sm mt-0.5">Points clés générés par l'IA</p>
                </div>
                <div className="flex items-center gap-2">
                  {summary && !loading && <CopySummaryButton text={summary} />}
                  <button
                    onClick={generateSummary}
                    disabled={loading === 'summary'}
                    className="flex items-center gap-2 border border-border text-secondary text-sm px-3 py-2 rounded-xl hover:border-accent/40 hover:text-white transition-all disabled:opacity-50"
                    title="Régénérer"
                  >
                    {loading === 'summary'
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <RefreshCw className="w-4 h-4" />}
                    <span className="hidden sm:inline">{loading === 'summary' ? 'Génération…' : 'Régénérer'}</span>
                  </button>
                </div>
              </div>

              {loading === 'summary' ? (
                <div className="space-y-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="space-y-2">
                      <div className="h-4 shimmer rounded w-1/3" />
                      <div className="h-3 shimmer rounded w-full" />
                      <div className="h-3 shimmer rounded w-5/6" />
                      <div className="h-3 shimmer rounded w-4/6" />
                    </div>
                  ))}
                </div>
              ) : summary ? (
                <div className="bg-raised border border-border rounded-xl p-5">
                  <MarkdownRenderer content={summary} />
                </div>
              ) : !error ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Loader2 className="w-8 h-8 text-muted animate-spin mb-3" />
                  <p className="text-secondary text-sm">Génération en cours…</p>
                </div>
              ) : null}
            </div>
          )}

          {/* CHAT */}
          {tab === 'chat' && (
            <div className="bg-surface border border-border rounded-2xl overflow-hidden h-[calc(100vh-13rem)]" style={{ minHeight: '400px' }}>
              <ChatInterface docId={params.id} niche={niche} />
            </div>
          )}

          {/* REPORT */}
          {tab === 'report' && (
            <div className="bg-surface border border-border rounded-2xl p-5 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-syne font-600 text-xl">Rapport Professionnel</h2>
                  <p className="text-secondary text-sm mt-0.5">Résumé exécutif, actions, risques</p>
                </div>
                <button
                  onClick={generateReport}
                  disabled={loading === 'report'}
                  className="flex items-center gap-2 bg-purple text-white text-sm font-mono px-4 py-2.5 rounded-xl hover:bg-purple/90 transition-all disabled:opacity-60"
                >
                  {loading === 'report'
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Génération…</>
                    : <><BarChart3 className="w-4 h-4" /> Générer</>}
                </button>
              </div>
              {loading === 'report' ? (
                <div className="space-y-4">
                  {[1,2,3].map(i => (
                    <div key={i} className="space-y-2">
                      <div className="h-4 shimmer rounded w-1/4" />
                      <div className="h-3 shimmer rounded w-full" />
                      <div className="h-3 shimmer rounded w-5/6" />
                      <div className="h-3 shimmer rounded w-3/4" />
                    </div>
                  ))}
                </div>
              ) : report ? (
                <ReportViewer report={report} docName={displayName} />
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-raised border border-border flex items-center justify-center mb-3">
                    <BarChart3 className="w-5 h-5 text-muted" />
                  </div>
                  <p className="font-syne font-600 mb-1">Rapport détaillé</p>
                  <p className="text-secondary text-sm mb-5 max-w-xs">Génère un rapport complet avec résumé exécutif, actions recommandées et signaux de risque.</p>
                  <button
                    onClick={generateReport}
                    disabled={loading === 'report'}
                    className="flex items-center gap-2 bg-purple text-white text-sm font-mono px-5 py-2.5 rounded-xl hover:bg-purple/90 transition-all disabled:opacity-60"
                  >
                    <BarChart3 className="w-4 h-4" /> Générer le rapport
                  </button>
                </div>
              )}
            </div>
          )}

          {/* EXTRACT */}
          {tab === 'extract' && (
            <div className="bg-surface border border-border rounded-2xl p-5 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-syne font-600 text-xl">Extraction de données</h2>
                  <p className="text-secondary text-sm mt-0.5">Dates, noms, montants, délais et plus</p>
                </div>
                <button
                  onClick={extractData}
                  disabled={loading === 'extract'}
                  className="flex items-center gap-2 bg-purple text-white text-sm font-mono px-4 py-2.5 rounded-xl hover:bg-purple/90 transition-all disabled:opacity-60"
                >
                  {loading === 'extract'
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Extraction…</>
                    : <><Zap className="w-4 h-4" /> Extraire</>}
                </button>
              </div>
              {loading === 'extract' ? (
                <div className="space-y-2">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="flex gap-3">
                      <div className="h-8 shimmer rounded w-24 flex-shrink-0" />
                      <div className="h-8 shimmer rounded flex-1" />
                    </div>
                  ))}
                </div>
              ) : data.length > 0 ? (
                <DataTable data={data} docName={displayName} />
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-raised border border-border flex items-center justify-center mb-3">
                    <Zap className="w-5 h-5 text-muted" />
                  </div>
                  <p className="font-syne font-600 mb-1">Extraction structurée</p>
                  <p className="text-secondary text-sm mb-5 max-w-xs">Identifie et extrait automatiquement les dates, montants, noms, délais et contacts du document.</p>
                  <button
                    onClick={extractData}
                    disabled={loading === 'extract'}
                    className="flex items-center gap-2 bg-purple text-white text-sm font-mono px-5 py-2.5 rounded-xl hover:bg-purple/90 transition-all disabled:opacity-60"
                  >
                    <Zap className="w-4 h-4" /> Lancer l'extraction
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
