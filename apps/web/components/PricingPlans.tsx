'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Zap, Loader2 } from 'lucide-react'

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    description: 'Pour commencer, sans engagement.',
    features: ['3 documents / mois', 'Résumé IA', 'Chat avec le document', 'Extraction de données'],
    cta: 'Commencer gratuitement',
    highlighted: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29,
    description: 'Pour les professionnels et équipes.',
    features: ['50 documents / mois', 'Toutes les fonctionnalités IA', 'Export PDF & CSV', 'Support prioritaire', 'Historique des chats'],
    cta: 'Passer à Pro',
    highlighted: true,
  },
  {
    id: 'business',
    name: 'Business',
    price: 99,
    description: 'Pour les organisations à grande échelle.',
    features: ['Documents illimités', 'Accès API', 'Comptes d\'équipe', 'Intégrations personnalisées', 'SLA & support dédié'],
    cta: 'Contacter les ventes',
    highlighted: false,
  },
]

export default function PricingPlans() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const handleUpgrade = async (planId: string) => {
    if (planId === 'free') {
      router.push('/dashboard')
      return
    }
    if (planId === 'business') {
      window.location.href = 'mailto:sales@documind.ai?subject=Business Plan'
      return
    }
    setLoading(planId)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || 'Une erreur est survenue.')
      }
    } catch {
      alert('Une erreur est survenue.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {plans.map(plan => (
        <div
          key={plan.name}
          className={`relative rounded-2xl p-6 flex flex-col transition-all ${
            plan.highlighted
              ? 'bg-surface border-2 border-accent glow-accent'
              : 'bg-surface border border-border hover:border-border/70'
          }`}
        >
          {plan.highlighted && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="flex items-center gap-1 bg-accent text-bg text-xs font-mono font-500 px-3 py-1 rounded-full">
                <Zap className="w-3 h-3" />
                Le plus populaire
              </span>
            </div>
          )}

          <div className="mb-5">
            <p className="text-secondary text-xs font-mono uppercase tracking-widest mb-1">{plan.name}</p>
            <div className="flex items-end gap-1 mb-2">
              <span className="font-syne font-800 text-4xl">
                {plan.price === 0 ? 'Gratuit' : `$${plan.price}`}
              </span>
              {plan.price > 0 && <span className="text-secondary text-sm mb-1.5">/mois</span>}
            </div>
            <p className="text-secondary text-sm">{plan.description}</p>
          </div>

          <ul className="space-y-2.5 flex-1 mb-6">
            {plan.features.map(f => (
              <li key={f} className="flex items-center gap-2.5 text-sm text-secondary">
                <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${plan.highlighted ? 'text-accent' : 'text-muted'}`} />
                {f}
              </li>
            ))}
          </ul>

          <button
            onClick={() => handleUpgrade(plan.id)}
            disabled={loading === plan.id}
            className={`w-full text-center text-sm font-mono font-500 px-4 py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 ${
              plan.highlighted
                ? 'bg-accent text-bg hover:bg-accent/90'
                : 'border border-border hover:border-accent/40 hover:text-accent text-secondary'
            }`}
          >
            {loading === plan.id ? <><Loader2 className="w-4 h-4 animate-spin" /> Redirection…</> : plan.cta}
          </button>
        </div>
      ))}
    </div>
  )
}
