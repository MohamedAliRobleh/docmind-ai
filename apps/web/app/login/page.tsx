'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { FileText, Loader2, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message === 'Invalid login credentials'
        ? 'Email ou mot de passe incorrect.'
        : error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
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
          <h1 className="font-syne font-700 text-2xl mb-1">Connexion</h1>
          <p className="text-secondary text-sm mb-6">Accède à tes documents</p>

          {error && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm text-secondary">Mot de passe</label>
                <Link href="/forgot-password" className="text-xs text-accent hover:underline">
                  Oublié ?
                </Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                minLength={6}
                className="w-full bg-raised border border-border text-white text-sm rounded-xl px-4 py-3 placeholder-muted focus:outline-none focus:border-accent/50 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent text-bg font-mono font-500 text-sm py-3 rounded-xl hover:bg-accent/90 active:scale-[.99] transition-all disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Connexion…</> : 'Se connecter'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-secondary mt-5">
          Pas encore de compte ?{' '}
          <Link href="/register" className="text-accent hover:underline">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  )
}
