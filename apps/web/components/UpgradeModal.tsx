'use client'

import { useState } from 'react'
import { X, CheckCircle2, Zap, Loader2 } from 'lucide-react'

interface UpgradeModalProps {
  onClose: () => void
}

const plans = [
  {
    id: 'pro',
    name: 'Pro',
    price: 29,
    description: 'Pour les professionnels.',
    features: ['50 documents / mois', 'Toutes les fonctionnalités IA', 'Export PDF & CSV', 'Support prioritaire'],
    highlighted: true,
  },
  {
    id: 'business',
    name: 'Business',
    price: 99,
    description: 'Pour les organisations.',
    features: ['Documents illimités', 'Accès API', 'Comptes d\'équipe', 'SLA & support dédié'],
    highlighted: false,
  },
]

export default function UpgradeModal({ onClose }: UpgradeModalProps) {
  const [loading, setLoading] = useState<string | null>(null)

  const handleSelect = async (planId: string) => {
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
      if (data.url) window.location.href = data.url
      else alert(data.error || 'Erreur lors de la redirection.')
    } catch {
      alert('Erreur réseau.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-surface border border-border rounded-2xl w-full max-w-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="font-syne font-700 text-xl">Passer à un plan supérieur</h2>
            <p className="text-secondary text-sm mt-0.5">Choisissez le plan qui correspond à vos besoins</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-white hover:bg-raised transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Plans */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {plans.map(plan => (
            <div
              key={plan.id}
              className={`relative rounded-xl p-5 flex flex-col border transition-all ${
                plan.highlighted
                  ? 'border-accent bg-accent/5'
                  : 'border-border bg-raised hover:border-border/70'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-4">
                  <span className="flex items-center gap-1 bg-accent text-bg text-xs font-mono font-500 px-2.5 py-0.5 rounded-full">
                    <Zap className="w-3 h-3" /> Recommandé
                  </span>
                </div>
              )}

              <div className="mb-4 mt-1">
                <p className="text-xs font-mono text-muted uppercase tracking-widest mb-1">{plan.name}</p>
                <div className="flex items-end gap-1 mb-1">
                  <span className="font-syne font-800 text-3xl text-white">${plan.price}</span>
                  <span className="text-secondary text-sm mb-1">/mois</span>
                </div>
                <p className="text-secondary text-xs">{plan.description}</p>
              </div>

              <ul className="space-y-2 flex-1 mb-5">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-secondary">
                    <CheckCircle2 className={`w-3.5 h-3.5 flex-shrink-0 ${plan.highlighted ? 'text-accent' : 'text-muted'}`} />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelect(plan.id)}
                disabled={loading === plan.id}
                className={`w-full py-2.5 rounded-xl text-sm font-mono font-500 flex items-center justify-center gap-2 transition-all disabled:opacity-60 ${
                  plan.highlighted
                    ? 'bg-accent text-bg hover:bg-accent/90'
                    : 'border border-border hover:border-accent/40 hover:text-accent text-secondary'
                }`}
              >
                {loading === plan.id
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Redirection…</>
                  : plan.id === 'business' ? 'Contacter les ventes' : `Choisir ${plan.name}`
                }
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 text-center">
          <p className="text-xs text-muted">
            Paiement sécurisé par Stripe · Annulable à tout moment · Aucun engagement
          </p>
        </div>
      </div>
    </div>
  )
}
