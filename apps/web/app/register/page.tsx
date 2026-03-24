'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { FileText, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
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
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    })

    if (error) {
      setError(error.message === 'User already registered'
        ? 'Un compte existe déjà avec cet email.'
        : error.message)
      setLoading(false)
    } else {
      setSuccess(true)
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
          {success ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7 text-green-400" />
              </div>
              <h2 className="font-syne font-700 text-xl mb-2">Vérifie ton email !</h2>
              <p className="text-secondary text-sm">
                Un lien de confirmation a été envoyé à <span className="text-white">{email}</span>.
                Clique dessus pour activer ton compte.
              </p>
            </div>
          ) : (
            <>
              <h1 className="font-syne font-700 text-2xl mb-1">Créer un compte</h1>
              <p className="text-secondary text-sm mb-6">C'est gratuit, pas de carte requise</p>

              {error && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-4">
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

                <div>
                  <label className="block text-sm text-secondary mb-1.5">Mot de passe</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min. 6 caractères"
                    minLength={6}
                    className="w-full bg-raised border border-border text-white text-sm rounded-xl px-4 py-3 placeholder-muted focus:outline-none focus:border-accent/50 transition-colors"
                  />
                  {password.length > 0 && password.length < 6 && (
                    <p className="text-xs text-red-400 mt-1">Trop court ({password.length}/6)</p>
                  )}
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
                  {confirm.length > 0 && confirm !== password && (
                    <p className="text-xs text-red-400 mt-1">Les mots de passe ne correspondent pas</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-accent text-bg font-mono font-500 text-sm py-3 rounded-xl hover:bg-accent/90 active:scale-[.99] transition-all disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Création…</> : 'Créer mon compte'}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-sm text-secondary mt-5">
          Déjà un compte ?{' '}
          <Link href="/login" className="text-accent hover:underline">
            Se connecter
          </Link>
        </p>

        <p className="text-center text-xs text-muted mt-4">
          En créant un compte, tu acceptes nos{' '}
          <Link href="/terms" className="hover:text-white transition-colors underline underline-offset-2">Conditions d'utilisation</Link>
          {' '}et notre{' '}
          <Link href="/privacy" className="hover:text-white transition-colors underline underline-offset-2">Politique de confidentialité</Link>.
        </p>
      </div>
    </div>
  )
}
