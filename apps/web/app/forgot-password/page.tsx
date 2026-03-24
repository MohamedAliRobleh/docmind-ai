'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { FileText, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSent(true)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center">
            <FileText className="w-5 h-5 text-bg" />
          </div>
          <span className="font-syne font-700 text-xl tracking-tight">DocuMind AI</span>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-8">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7 text-green-400" />
              </div>
              <h2 className="font-syne font-700 text-xl mb-2">Email envoyé !</h2>
              <p className="text-secondary text-sm">
                Vérifie ta boîte mail pour <span className="text-white">{email}</span> et clique sur le lien de réinitialisation.
              </p>
            </div>
          ) : (
            <>
              <h1 className="font-syne font-700 text-2xl mb-1">Mot de passe oublié</h1>
              <p className="text-secondary text-sm mb-6">On t'envoie un lien de réinitialisation</p>

              {error && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-secondary mb-1.5">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="toi@email.com"
                    className="w-full bg-raised border border-border text-white text-sm rounded-xl px-4 py-3 placeholder-muted focus:outline-none focus:border-accent/50 transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-accent text-bg font-mono font-500 text-sm py-3 rounded-xl hover:bg-accent/90 transition-all disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Envoi…</> : 'Envoyer le lien'}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-sm text-secondary mt-5">
          <Link href="/login" className="text-accent hover:underline">
            ← Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  )
}
