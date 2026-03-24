'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { FileText, Loader2, AlertCircle, CheckCircle2, Lock } from 'lucide-react'

export default function UpdatePasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Supabase sets the session from the URL hash automatically
    // We just need to wait for the auth state to settle
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
      if (event === 'SIGNED_IN') setReady(true)
    })
    // Also check if already signed in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setDone(true)
      setTimeout(() => router.push('/dashboard'), 2500)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center">
            <FileText className="w-5 h-5 text-bg" />
          </div>
          <span className="font-syne font-700 text-xl tracking-tight">DocuMind AI</span>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-8">
          {done ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7 text-green-400" />
              </div>
              <h2 className="font-syne font-700 text-xl mb-2">Mot de passe mis à jour !</h2>
              <p className="text-secondary text-sm">Redirection vers le dashboard…</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
                  <Lock className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h1 className="font-syne font-700 text-xl leading-tight">Nouveau mot de passe</h1>
                  <p className="text-secondary text-xs mt-0.5">Choisissez un mot de passe sécurisé</p>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-secondary mb-1.5">Nouveau mot de passe</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-raised border border-border text-white text-sm rounded-xl px-4 py-3 placeholder-muted focus:outline-none focus:border-accent/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-secondary mb-1.5">Confirmer le mot de passe</label>
                  <input
                    type="password"
                    required
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-raised border border-border text-white text-sm rounded-xl px-4 py-3 placeholder-muted focus:outline-none focus:border-accent/50 transition-colors"
                  />
                </div>

                {/* Password strength indicator */}
                {password.length > 0 && (
                  <div className="space-y-1">
                    <div className="h-1 bg-raised rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          password.length < 6 ? 'w-1/4 bg-red-400' :
                          password.length < 10 ? 'w-2/4 bg-yellow-400' :
                          'w-full bg-green-400'
                        }`}
                      />
                    </div>
                    <p className={`text-xs ${
                      password.length < 6 ? 'text-red-400' :
                      password.length < 10 ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>
                      {password.length < 6 ? 'Trop court' :
                       password.length < 10 ? 'Acceptable' : 'Fort'}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !ready}
                  className="w-full bg-accent text-bg font-mono font-500 text-sm py-3 rounded-xl hover:bg-accent/90 transition-all disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
                >
                  {loading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Mise à jour…</>
                    : 'Mettre à jour le mot de passe'
                  }
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
