'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { NICHE_CONFIG, type Niche } from '@/lib/niches'
import { ArrowRight, CheckCircle2, Loader2, FileText } from 'lucide-react'

const IS_DEMO = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')

const niches = Object.entries(NICHE_CONFIG) as [Niche, typeof NICHE_CONFIG[Niche]][]

const colorMap: Record<string, { card: string; check: string }> = {
  blue:   { card: 'border-blue-400/50 bg-blue-400/5',   check: 'text-blue-400' },
  green:  { card: 'border-green-400/50 bg-green-400/5', check: 'text-green-400' },
  purple: { card: 'border-purple/50 bg-purple/5',       check: 'text-purple' },
}

export default function OnboardingPage() {
  const router = useRouter()
  const [selected, setSelected] = useState<Niche | null>(null)
  const [loading, setLoading] = useState(false)

  // Pre-select existing niche if coming back to change
  useEffect(() => {
    if (IS_DEMO) {
      const stored = localStorage.getItem('docmind_niche') as Niche | null
      if (stored) setSelected(stored)
    } else {
      const supabase = createClient()
      supabase.auth.getUser().then(async ({ data: { user } }) => {
        if (!user) return
        const { data } = await supabase.from('profiles').select('niche').eq('id', user.id).single()
        if (data?.niche) setSelected(data.niche as Niche)
      })
    }
  }, [])

  const handleSubmit = async () => {
    if (!selected || loading) return
    setLoading(true)

    try {
      if (IS_DEMO) {
        localStorage.setItem('docmind_niche', selected)
        localStorage.setItem('docmind_onboarding_completed', 'true')
      } else {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/login'); return }
        await supabase.from('profiles').upsert({
          id: user.id,
          niche: selected,
          onboarding_completed: true,
        }, { onConflict: 'id' })
      }
      router.push('/dashboard')
    } catch {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-10">
        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
          <FileText className="w-4 h-4 text-bg" />
        </div>
        <span className="font-syne font-700 text-lg tracking-tight">DocuMind AI</span>
      </div>

      {/* Header */}
      <div className="text-center mb-10 max-w-xl">
        <h1 className="font-syne font-700 text-3xl md:text-4xl mb-3">
          Choisissez votre domaine
        </h1>
        <p className="text-secondary text-base leading-relaxed">
          L'IA adapte ses résumés, rapports et extractions selon votre profession.
          Vous pourrez changer à tout moment.
        </p>
      </div>

      {/* Niche cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl mb-8">
        {niches.map(([id, config]) => {
          const isSelected = selected === id
          const colors = colorMap[config.color]

          return (
            <button
              key={id}
              onClick={() => setSelected(id)}
              className={`relative flex flex-col items-start text-left p-6 rounded-2xl border-2 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] ${
                isSelected
                  ? colors.card
                  : 'border-border bg-surface hover:border-border/80 hover:bg-raised'
              }`}
            >
              {/* Checkmark */}
              {isSelected && (
                <div className={`absolute top-4 right-4 ${colors.check}`}>
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              )}

              {/* Icon */}
              <span className="text-3xl mb-4">{config.icon}</span>

              {/* Label */}
              <h3 className="font-syne font-600 text-base text-white mb-2">{config.label}</h3>

              {/* Description */}
              <p className="text-secondary text-sm leading-relaxed">{config.description}</p>
            </button>
          )
        })}
      </div>

      {/* CTA */}
      <button
        onClick={handleSubmit}
        disabled={!selected || loading}
        className={`flex items-center gap-2 font-mono font-500 px-8 py-3.5 rounded-xl transition-all ${
          selected && !loading
            ? 'bg-accent text-bg hover:bg-accent/90 glow-accent hover:scale-[1.02] active:scale-[0.98]'
            : 'bg-raised border border-border text-muted cursor-not-allowed opacity-50'
        }`}
      >
        {loading ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Configuration…</>
        ) : (
          <>Commencer <ArrowRight className="w-4 h-4" /></>
        )}
      </button>

      {selected && !loading && (
        <p className="text-xs text-muted mt-4">
          {NICHE_CONFIG[selected].icon} {NICHE_CONFIG[selected].label} sélectionné
        </p>
      )}
    </div>
  )
}
