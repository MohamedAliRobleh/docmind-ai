'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import {
  ArrowLeft, User, Lock, CreditCard, Trash2, CheckCircle2,
  Loader2, AlertCircle, Zap, FileText, ChevronRight, RefreshCw
} from 'lucide-react'
import { NICHE_CONFIG, getNicheConfig } from '@/lib/niches'
import toast from 'react-hot-toast'

const IS_DEMO = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')

interface PlanInfo {
  plan: string
  doc_count: number
  doc_limit: number
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-border">
        <h2 className="font-syne font-600 text-base">{title}</h2>
      </div>
      <div className="p-6 space-y-4">{children}</div>
    </div>
  )
}

function SuccessBanner({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
      {message}
    </div>
  )
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
      <AlertCircle className="w-4 h-4 flex-shrink-0" />
      {message}
    </div>
  )
}

export default function SettingsPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [planInfo, setPlanInfo] = useState<PlanInfo>({ plan: 'free', doc_count: 0, doc_limit: 3 })

  // Password change
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwLoading, setPwLoading] = useState(false)
  const [pwSuccess, setPwSuccess] = useState('')
  const [pwError, setPwError] = useState('')

  // Email change
  const [newEmail, setNewEmail] = useState('')
  const [emailLoading, setEmailLoading] = useState(false)
  const [emailSuccess, setEmailSuccess] = useState('')
  const [emailError, setEmailError] = useState('')

  const [niche, setNiche] = useState<string | null>(null)

  // Delete account
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [showDelete, setShowDelete] = useState(false)

  // Upgrade
  const [upgradeLoading, setUpgradeLoading] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user?.email) setEmail(user.email)
      if (IS_DEMO) {
        setNiche(localStorage.getItem('docmind_niche'))
      } else if (user) {
        const { data: profile } = await supabase.from('profiles').select('niche').eq('id', user.id).single()
        setNiche(profile?.niche ?? null)
      }
    })
    fetch('/api/user/plan').then(r => r.json()).then(data => {
      if (data.plan) setPlanInfo(data)
    })
  }, [])

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwError('')
    setPwSuccess('')

    if (newPassword.length < 6) {
      setPwError('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPwError('Les mots de passe ne correspondent pas.')
      return
    }

    setPwLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      setPwSuccess('Mot de passe mis à jour avec succès.')
      toast.success('Mot de passe mis à jour !')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (e: any) {
      setPwError(e.message || 'Erreur lors du changement de mot de passe.')
      toast.error(e.message || 'Erreur lors du changement de mot de passe.')
    } finally {
      setPwLoading(false)
    }
  }

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailError('')
    setEmailSuccess('')

    if (!newEmail.includes('@')) {
      setEmailError('Adresse email invalide.')
      return
    }

    setEmailLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ email: newEmail })
      if (error) throw error
      setEmailSuccess('Un email de confirmation a été envoyé à ' + newEmail)
      toast.success('Email de confirmation envoyé !')
      setNewEmail('')
    } catch (e: any) {
      setEmailError(e.message || 'Erreur lors du changement d\'email.')
      toast.error(e.message || 'Erreur lors du changement d\'email.')
    } finally {
      setEmailLoading(false)
    }
  }

  const handleUpgrade = async () => {
    setUpgradeLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'pro' }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else alert(data.error || 'Erreur lors de la redirection.')
    } catch {
      alert('Erreur réseau.')
    } finally {
      setUpgradeLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== email) return
    setDeleteLoading(true)
    try {
      const res = await fetch('/api/user/delete', { method: 'DELETE' })
      if (!res.ok) throw new Error('Erreur lors de la suppression.')
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/')
    } catch (e: any) {
      alert(e.message)
      setDeleteLoading(false)
    }
  }

  const planLabel = planInfo.plan.charAt(0).toUpperCase() + planInfo.plan.slice(1)
  const isUnlimited = planInfo.doc_limit >= 999999
  const usagePercent = isUnlimited ? 0 : Math.min(100, (planInfo.doc_count / planInfo.doc_limit) * 100)

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="h-16 border-b border-border bg-surface flex items-center gap-4 px-6 sticky top-0 z-30">
        <Link href="/dashboard" className="flex items-center gap-2 text-secondary hover:text-white transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Dashboard</span>
        </Link>
        <div className="w-px h-5 bg-border" />
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
            <FileText className="w-4 h-4 text-bg" />
          </div>
          <span className="font-syne font-700 text-sm">Paramètres</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">

        {/* Account Info */}
        <Section title="Compte">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple/20 border border-purple/30 flex items-center justify-center font-syne font-600 text-purple uppercase">
              {email ? email[0] : 'U'}
            </div>
            <div>
              <p className="text-sm text-white font-500">{email || '—'}</p>
              <p className="text-xs text-muted">Compte actif</p>
            </div>
          </div>
        </Section>

        {/* Plan */}
        <Section title="Plan & Utilisation">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                planInfo.plan === 'free' ? 'bg-border' : 'bg-accent/10 border border-accent/20'
              }`}>
                {planInfo.plan === 'free'
                  ? <User className="w-4 h-4 text-muted" />
                  : <Zap className="w-4 h-4 text-accent" />
                }
              </div>
              <div>
                <p className="text-sm font-500 text-white">{planLabel}</p>
                <p className="text-xs text-muted">
                  {isUnlimited ? 'Documents illimités' : `${planInfo.doc_count} / ${planInfo.doc_limit} documents ce mois`}
                </p>
              </div>
            </div>
            {planInfo.plan === 'free' && (
              <button
                onClick={handleUpgrade}
                disabled={upgradeLoading}
                className="flex items-center gap-1.5 bg-accent text-bg text-xs font-mono font-500 px-3 py-1.5 rounded-lg hover:bg-accent/90 transition-all disabled:opacity-60"
              >
                {upgradeLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3 h-3" />}
                Upgrade
              </button>
            )}
          </div>
          {!isUnlimited && (
            <div>
              <div className="h-1.5 bg-raised rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${usagePercent >= 100 ? 'bg-red-400' : 'bg-accent'}`}
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
              <p className="text-xs text-muted mt-1.5">
                {Math.max(0, planInfo.doc_limit - planInfo.doc_count)} document{Math.max(0, planInfo.doc_limit - planInfo.doc_count) !== 1 ? 's' : ''} restant{Math.max(0, planInfo.doc_limit - planInfo.doc_count) !== 1 ? 's' : ''} ce mois
              </p>
            </div>
          )}
        </Section>

        {/* Change Email */}
        <Section title="Changer l'adresse email">
          <form onSubmit={handleEmailChange} className="space-y-3">
            <div>
              <label className="text-xs text-muted mb-1.5 block">Email actuel</label>
              <input
                value={email}
                disabled
                className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-muted focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-muted mb-1.5 block">Nouvel email</label>
              <input
                type="email"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                placeholder="nouveau@email.com"
                className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-white placeholder-muted focus:outline-none focus:border-accent/50 transition-colors"
              />
            </div>
            {emailSuccess && <SuccessBanner message={emailSuccess} />}
            {emailError && <ErrorBanner message={emailError} />}
            <button
              type="submit"
              disabled={emailLoading || !newEmail}
              className="flex items-center gap-2 bg-accent text-bg text-sm font-mono font-500 px-4 py-2.5 rounded-xl hover:bg-accent/90 transition-all disabled:opacity-50"
            >
              {emailLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <User className="w-4 h-4" />}
              Mettre à jour l'email
            </button>
          </form>
        </Section>

        {/* Change Password */}
        <Section title="Changer le mot de passe">
          <form onSubmit={handlePasswordChange} className="space-y-3">
            <div>
              <label className="text-xs text-muted mb-1.5 block">Nouveau mot de passe</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-white placeholder-muted focus:outline-none focus:border-accent/50 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-muted mb-1.5 block">Confirmer le mot de passe</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-white placeholder-muted focus:outline-none focus:border-accent/50 transition-colors"
              />
            </div>
            {pwSuccess && <SuccessBanner message={pwSuccess} />}
            {pwError && <ErrorBanner message={pwError} />}
            <button
              type="submit"
              disabled={pwLoading || !newPassword || !confirmPassword}
              className="flex items-center gap-2 bg-accent text-bg text-sm font-mono font-500 px-4 py-2.5 rounded-xl hover:bg-accent/90 transition-all disabled:opacity-50"
            >
              {pwLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              Changer le mot de passe
            </button>
          </form>
        </Section>

        {/* Danger Zone */}
        {/* Niche / Domain */}
        <Section title="Domaine d'activité">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {niche ? (
                <>
                  <span className="text-2xl">{getNicheConfig(niche).icon}</span>
                  <div>
                    <p className="text-sm font-500 text-white">{getNicheConfig(niche).label}</p>
                    <p className="text-xs text-muted mt-0.5">{getNicheConfig(niche).welcome}</p>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted">Aucun domaine sélectionné</p>
              )}
            </div>
            <Link
              href="/onboarding"
              className="flex items-center gap-2 border border-border text-secondary text-sm px-3 py-2 rounded-xl hover:border-accent/40 hover:text-accent transition-all flex-shrink-0"
            >
              <RefreshCw className="w-4 h-4" />
              Changer
            </Link>
          </div>
        </Section>

        <div className="bg-surface border border-red-500/20 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-red-500/20">
            <h2 className="font-syne font-600 text-base text-red-400">Zone dangereuse</h2>
          </div>
          <div className="p-6">
            {!showDelete ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white font-500">Supprimer mon compte</p>
                  <p className="text-xs text-muted mt-0.5">Cette action est irréversible. Tous vos documents seront supprimés.</p>
                </div>
                <button
                  onClick={() => setShowDelete(true)}
                  className="flex items-center gap-2 border border-red-500/30 text-red-400 text-sm px-3 py-2 rounded-xl hover:bg-red-500/10 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-red-400">Pour confirmer, tape ton adresse email : <span className="font-mono text-white">{email}</span></p>
                <input
                  value={deleteConfirm}
                  onChange={e => setDeleteConfirm(e.target.value)}
                  placeholder={email}
                  className="w-full bg-raised border border-red-500/30 rounded-xl px-4 py-2.5 text-sm text-white placeholder-muted focus:outline-none focus:border-red-500/50 transition-colors"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => { setShowDelete(false); setDeleteConfirm('') }}
                    className="px-4 py-2 rounded-xl border border-border text-secondary text-sm hover:text-white transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirm !== email || deleteLoading}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm hover:bg-red-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {deleteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    Confirmer la suppression
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
