'use client'

import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import UploadZone, { UploadZoneHandle } from '@/components/UploadZone'
import DocumentCard from '@/components/DocumentCard'
import UpgradeModal from '@/components/UpgradeModal'
import { createClient } from '@/lib/supabase'
import { FileText, LayoutDashboard, Settings, LogOut, Plus, Search, X, Loader2, Zap, Menu, ChevronDown } from 'lucide-react'
import { NICHE_CONFIG, getNicheConfig, type Niche } from '@/lib/niches'

const IS_DEMO = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')

interface PlanInfo {
  plan: string
  doc_count: number
  doc_limit: number
}

interface Document {
  id: string
  name: string
  created_at: string
}

interface SearchResult extends Document {
  matchType: 'name' | 'content' | 'both'
  snippet?: string
}

function DashboardInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [docs, setDocs] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(null)
  const [searching, setSearching] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [planInfo, setPlanInfo] = useState<PlanInfo>({ plan: 'free', doc_count: 0, doc_limit: 3 })
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [niche, setNiche] = useState<string | null>(null)
  const uploadRef = useRef<UploadZoneHandle>(null)
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchDocs = async () => {
    const res = await fetch('/api/documents')
    const data = await res.json()
    setDocs(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => {
    const sessionId = searchParams.get('session_id')

    const init = async () => {
      // If coming back from Stripe checkout, verify and activate subscription first
      if (sessionId) {
        try {
          await fetch('/api/stripe/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_id: sessionId }),
          })
        } catch {}
        // Clean URL
        router.replace('/dashboard')
      }

      fetchDocs()
      const supabase = createClient()
      supabase.auth.getUser().then(async ({ data: { user } }) => {
        if (user?.email) setUserEmail(user.email)
        // Load niche
        if (IS_DEMO) {
          const stored = localStorage.getItem('docmind_niche')
          setNiche(stored)
        } else if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('niche')
            .eq('id', user.id)
            .single()
          setNiche(profile?.niche ?? null)
        }
      })
      fetch('/api/user/plan').then(r => r.json()).then(data => {
        if (data.plan) setPlanInfo(data)
      })
    }

    init()
  }, [])

  // Debounced search — calls API after 350ms idle
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value)
    if (searchTimer.current) clearTimeout(searchTimer.current)

    if (!value.trim() || value.trim().length < 2) {
      setSearchResults(null)
      setSearching(false)
      return
    }

    setSearching(true)
    searchTimer.current = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(value.trim())}`)
      const data = await res.json()
      setSearchResults(Array.isArray(data) ? data : [])
      setSearching(false)
    }, 350)
  }, [])

  const clearSearch = () => {
    setSearch('')
    setSearchResults(null)
    setSearching(false)
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleUploadClick = () => {
    setShowUpload(true)
    setTimeout(() => uploadRef.current?.open(), 50)
  }

  const onUpload = () => {
    setShowUpload(false)
    fetchDocs()
  }

  const handleDelete = (id: string) => {
    setDocs(prev => prev.filter(d => d.id !== id))
    if (searchResults) setSearchResults(prev => prev?.filter(d => d.id !== id) ?? null)
  }

  const isSearching = search.trim().length >= 2
  const displayList = isSearching ? (searchResults ?? []) : docs

  return (
    <>
    <div className="min-h-screen bg-bg flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-60 border-r border-border bg-surface fixed inset-y-0 left-0 z-40">
        <div className="h-16 flex items-center gap-2.5 px-5 border-b border-border">
          <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
            <FileText className="w-4 h-4 text-bg" />
          </div>
          <span className="font-syne font-700 text-base tracking-tight">DocuMind AI</span>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-raised text-white text-sm">
            <LayoutDashboard className="w-4 h-4 text-accent" />
            Documents
          </div>
          {niche && (
            <div className="mt-3 px-3 py-2.5 rounded-lg bg-surface border border-border">
              <p className="text-xs text-muted mb-0.5">Domaine actif</p>
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-white font-500 truncate">
                  {getNicheConfig(niche).icon} {getNicheConfig(niche).label}
                </p>
                <Link href="/onboarding" className="text-[10px] text-accent hover:underline flex-shrink-0">
                  Changer
                </Link>
              </div>
            </div>
          )}
        </nav>

        <div className="p-3 border-t border-border space-y-1">
          {userEmail && (
            <div className="px-3 py-2 mb-1">
              <p className="text-xs text-muted truncate">{userEmail}</p>
            </div>
          )}
          <Link href="/settings" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-secondary hover:text-white hover:bg-raised transition-colors text-sm">
            <Settings className="w-4 h-4" />
            Paramètres
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-secondary hover:text-white hover:bg-raised transition-colors text-sm">
            <LogOut className="w-4 h-4" />
            Se déconnecter
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 md:ml-60 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="h-16 border-b border-border bg-surface flex items-center gap-4 px-6 sticky top-0 z-30">
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setShowMobileMenu(true)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-secondary hover:text-white hover:bg-raised transition-colors"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="w-6 h-6 rounded bg-accent flex items-center justify-center">
              <FileText className="w-3.5 h-3.5 text-bg" />
            </div>
            <span className="font-syne font-700">DocuMind</span>
          </div>

          {/* Rich search bar */}
          <div className="relative flex-1 max-w-md hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none" />
            {searching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted animate-spin" />
            )}
            {search && !searching && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center text-muted hover:text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <input
              value={search}
              onChange={e => handleSearchChange(e.target.value)}
              placeholder="Chercher par titre ou mot dans le contenu…"
              className="w-full bg-raised border border-border text-sm text-white placeholder-muted rounded-lg pl-9 pr-9 py-2 focus:outline-none focus:border-accent/50 transition-colors"
            />
          </div>

          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={handleUploadClick}
              className="flex items-center gap-2 bg-accent text-bg text-sm font-mono font-500 px-4 py-2 rounded-lg hover:bg-accent/90 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Upload PDF</span>
            </button>
            <div
              className="w-8 h-8 rounded-full bg-purple/30 border border-purple/40 flex items-center justify-center text-xs text-purple font-syne font-600 uppercase"
              title={userEmail}
            >
              {userEmail ? userEmail[0] : 'U'}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 md:p-8">
          {/* Niche welcome banner */}
          {niche && !isSearching && (
            <div className="mb-6 flex items-center gap-3 p-4 rounded-xl bg-raised border border-border">
              <span className="text-2xl">{getNicheConfig(niche).icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-500 text-white">{getNicheConfig(niche).welcome}</p>
                <p className="text-xs text-muted">{getNicheConfig(niche).label}</p>
              </div>
              <Link href="/onboarding" className="text-xs text-secondary hover:text-accent transition-colors flex-shrink-0">
                Changer →
              </Link>
            </div>
          )}

          {/* Upload zone */}
          {showUpload && (
            <div className="mb-8 animate-in">
              <UploadZone ref={uploadRef} onUpload={onUpload} />
            </div>
          )}

          {/* Stats — hidden when searching */}
          {!isSearching && (
            <>
              {/* Upgrade warning banner */}
              {planInfo.plan === 'free' && planInfo.doc_count >= planInfo.doc_limit && (
                <div className="mb-6 flex items-center justify-between gap-4 p-4 rounded-xl bg-accent/10 border border-accent/30">
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-accent flex-shrink-0" />
                    <p className="text-sm text-white">
                      Limite atteinte — <span className="text-accent font-600">{planInfo.doc_count}/{planInfo.doc_limit} documents</span> ce mois. Passez à Pro pour continuer.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowUpgradeModal(true)}
                    className="flex-shrink-0 flex items-center gap-1.5 bg-accent text-bg text-xs font-mono font-500 px-3 py-1.5 rounded-lg hover:bg-accent/90 transition-all"
                  >
                    <Zap className="w-3 h-3" /> Upgrade
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Total documents', value: docs.length, accent: false },
                  { label: 'Ce mois', value: planInfo.doc_count, accent: false },
                  { label: 'Plan', value: planInfo.plan.charAt(0).toUpperCase() + planInfo.plan.slice(1), accent: false },
                  {
                    label: 'Restants ce mois',
                    value: planInfo.doc_limit >= 999999 ? '∞' : `${Math.max(0, planInfo.doc_limit - planInfo.doc_count)}`,
                    accent: true,
                  },
                ].map(stat => (
                  <div key={stat.label} className="bg-surface border border-border rounded-xl p-4">
                    <p className="text-muted text-xs mb-2">{stat.label}</p>
                    <p className={`font-syne font-700 text-2xl ${stat.accent ? 'text-accent' : 'text-white'}`}>{stat.value}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Mobile search bar */}
          <div className="md:hidden relative mb-5">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none" />
            {searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted animate-spin" />}
            {search && !searching && (
              <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-3.5 h-3.5 text-muted" />
              </button>
            )}
            <input
              value={search}
              onChange={e => handleSearchChange(e.target.value)}
              placeholder="Chercher par titre ou contenu…"
              className="w-full bg-surface border border-border text-sm text-white placeholder-muted rounded-lg pl-9 pr-9 py-2.5 focus:outline-none focus:border-accent/50"
            />
          </div>

          {/* Docs header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-syne font-600 text-lg">
                {isSearching ? (
                  searching ? 'Recherche…' : `${searchResults?.length ?? 0} résultat${(searchResults?.length ?? 0) !== 1 ? 's' : ''} pour "${search}"`
                ) : 'Vos Documents'}
              </h2>
              {isSearching && !searching && (searchResults?.length ?? 0) > 0 && (
                <p className="text-xs text-muted mt-0.5">
                  {searchResults?.filter(r => r.matchType === 'content' || r.matchType === 'both').length} trouvés dans le contenu
                </p>
              )}
            </div>
            {isSearching && (
              <button onClick={clearSearch} className="text-xs text-accent hover:underline flex items-center gap-1">
                <X className="w-3 h-3" /> Effacer
              </button>
            )}
          </div>

          {/* Documents grid */}
          {loading && !isSearching ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-surface border border-border rounded-xl p-5 space-y-3">
                  <div className="h-4 shimmer rounded w-2/3" />
                  <div className="h-3 shimmer rounded w-1/3" />
                  <div className="h-8 shimmer rounded w-1/2 mt-4" />
                </div>
              ))}
            </div>
          ) : searching ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2].map(i => (
                <div key={i} className="bg-surface border border-border rounded-xl p-5 space-y-3">
                  <div className="h-4 shimmer rounded w-2/3" />
                  <div className="h-3 shimmer rounded w-1/3" />
                  <div className="h-12 shimmer rounded w-full mt-2" />
                </div>
              ))}
            </div>
          ) : displayList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center mb-4">
                <FileText className="w-7 h-7 text-muted" />
              </div>
              <h3 className="font-syne font-600 text-lg mb-2">
                {isSearching ? 'Aucun résultat' : 'Aucun document'}
              </h3>
              <p className="text-secondary text-sm mb-6 max-w-xs">
                {isSearching
                  ? `Aucun document ne correspond à "${search}". Essaie d'autres mots.`
                  : "Uploade ton premier PDF pour commencer l'analyse IA."}
              </p>
              {!isSearching && (
                <button
                  onClick={handleUploadClick}
                  className="flex items-center gap-2 bg-accent text-bg text-sm font-mono font-500 px-5 py-2.5 rounded-xl hover:bg-accent/90 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Uploader mon premier PDF
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayList.map(doc => (
                <DocumentCard
                  key={doc.id}
                  {...doc}
                  searchQuery={isSearching ? search : undefined}
                  snippet={(doc as SearchResult).snippet}
                  matchType={(doc as SearchResult).matchType}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>

    {showUpgradeModal && <UpgradeModal onClose={() => setShowUpgradeModal(false)} />}

    {/* Mobile sidebar drawer */}
    {showMobileMenu && (
      <div className="fixed inset-0 z-50 md:hidden">
        <div className="absolute inset-0 bg-black/60" onClick={() => setShowMobileMenu(false)} />
        <aside className="absolute inset-y-0 left-0 w-64 bg-surface border-r border-border flex flex-col animate-in">
          <div className="h-16 flex items-center gap-2.5 px-5 border-b border-border">
            <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
              <FileText className="w-4 h-4 text-bg" />
            </div>
            <span className="font-syne font-700 text-base tracking-tight">DocuMind AI</span>
          </div>
          <nav className="flex-1 p-3 space-y-1">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-raised text-white text-sm">
              <LayoutDashboard className="w-4 h-4 text-accent" />
              Documents
            </div>
          </nav>
          <div className="p-3 border-t border-border space-y-1">
            {planInfo.plan === 'free' && (
              <div className="px-3 py-2 mb-1">
                <p className="text-xs text-muted">{planInfo.doc_count}/{planInfo.doc_limit} documents ce mois</p>
                <div className="mt-1.5 h-1 bg-raised rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full transition-all"
                    style={{ width: `${Math.min(100, (planInfo.doc_count / planInfo.doc_limit) * 100)}%` }}
                  />
                </div>
              </div>
            )}
            {userEmail && (
              <div className="px-3 py-2 mb-1">
                <p className="text-xs text-muted truncate">{userEmail}</p>
                {planInfo.plan !== 'free' && (
                  <p className="text-xs text-accent font-mono mt-0.5 capitalize">{planInfo.plan}</p>
                )}
              </div>
            )}
            {planInfo.plan === 'free' && (
              <button
                onClick={() => { setShowMobileMenu(false); setShowUpgradeModal(true) }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-accent hover:bg-accent/10 transition-colors text-sm"
              >
                <Zap className="w-4 h-4" />
                Passer à Pro
              </button>
            )}
            <Link href="/settings" onClick={() => setShowMobileMenu(false)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-secondary hover:text-white hover:bg-raised transition-colors text-sm">
              <Settings className="w-4 h-4" />
              Paramètres
            </Link>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-secondary hover:text-white hover:bg-raised transition-colors text-sm">
              <LogOut className="w-4 h-4" />
              Se déconnecter
            </button>
          </div>
        </aside>
      </div>
    )}
    </>
  )
}

export default function Dashboard() {
  return (
    <Suspense fallback={null}>
      <DashboardInner />
    </Suspense>
  )
}
