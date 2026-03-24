import Link from 'next/link'
import PricingPlans from '@/components/PricingPlans'
import {
  FileText, Zap, MessageSquare, BarChart3, Shield, ArrowRight,
  CheckCircle2, Upload, Cpu, Download, Star, Clock, Users,
} from 'lucide-react'

const features = [
  {
    icon: FileText,
    title: 'Résumé intelligent',
    desc: 'Extrait les points clés de n\'importe quel document en quelques secondes. Fini les heures de lecture.',
  },
  {
    icon: MessageSquare,
    title: 'Chat avec vos docs',
    desc: 'Posez des questions en langage naturel et obtenez des réponses précises directement depuis le document.',
  },
  {
    icon: BarChart3,
    title: 'Rapports professionnels',
    desc: 'Générez des rapports avec résumé exécutif, actions recommandées et signaux de risque — automatiquement.',
  },
  {
    icon: Zap,
    title: 'Extraction de données',
    desc: 'Identifie et extrait automatiquement les dates, noms, montants et délais dans des tableaux structurés.',
  },
  {
    icon: Shield,
    title: 'Sécurisé & privé',
    desc: 'Vos documents sont chiffrés et ne servent jamais à entraîner des modèles IA. Vos données restent vôtres.',
  },
  {
    icon: Download,
    title: 'Export PDF & CSV',
    desc: 'Exportez rapports et données extraites en PDF soignés ou CSV prêts à partager avec votre équipe.',
  },
]

const steps = [
  {
    number: '01',
    icon: Upload,
    title: 'Uploadez votre PDF',
    desc: 'Glissez-déposez n\'importe quel document — contrat, rapport financier, dossier médical, étude de marché.',
  },
  {
    number: '02',
    icon: Cpu,
    title: 'L\'IA analyse le contenu',
    desc: 'Notre moteur IA lit et comprend la structure, le contexte et les informations clés de votre document.',
  },
  {
    number: '03',
    icon: Zap,
    title: 'Obtenez vos insights',
    desc: 'Résumé, chat interactif, rapport complet, données extraites — tout est prêt en quelques secondes.',
  },
]

const useCases = [
  'Contrats légaux', 'Rapports financiers', 'Dossiers RH',
  'Dossiers médicaux', 'Articles de recherche', 'Docs de conformité',
]

const stats = [
  { value: '< 5s', label: 'Temps de réponse moyen' },
  { value: '99%', label: 'Précision de l\'IA' },
  { value: '10k+', label: 'Documents analysés' },
  { value: '4.9/5', label: 'Satisfaction client', icon: Star },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-bg text-white overflow-x-hidden">

      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 glass border-b border-border">
        <div className="max-w-6xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
              <FileText className="w-4 h-4 text-bg" />
            </div>
            <span className="font-syne font-700 text-lg tracking-tight">DocuMind AI</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-secondary">
            <a href="#features" className="hover:text-white transition-colors">Fonctionnalités</a>
            <a href="#how" className="hover:text-white transition-colors">Comment ça marche</a>
            <a href="#pricing" className="hover:text-white transition-colors">Tarifs</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-secondary hover:text-white transition-colors hidden md:block">
              Se connecter
            </Link>
            <Link
              href="/register"
              className="bg-accent text-bg text-sm font-mono font-500 px-4 py-2 rounded-lg hover:bg-accent/90 transition-all hover:shadow-lg hover:shadow-accent/20"
            >
              Essayer gratuitement
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-5 md:px-8 text-center overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-30 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-purple/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple/40 bg-purple/5 text-sm text-secondary mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            Propulsé par Groq · llama-3.3-70b
          </div>

          <h1 className="font-syne text-5xl md:text-7xl font-800 leading-[1.05] tracking-tight mb-6">
            Comprenez n'importe quel
            <span className="block gradient-text">document en secondes</span>
          </h1>

          <p className="text-secondary text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Uploadez un PDF et obtenez résumés, réponses par chat, données structurées et rapports professionnels — instantanément.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link
              href="/register"
              className="group flex items-center gap-2 bg-accent text-bg font-mono font-500 px-7 py-3.5 rounded-xl hover:bg-accent/90 transition-all glow-accent hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto justify-center"
            >
              Commencer gratuitement
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#how"
              className="flex items-center gap-2 text-secondary border border-border px-7 py-3.5 rounded-xl hover:border-accent/30 hover:text-white transition-all w-full sm:w-auto justify-center"
            >
              Voir comment ça marche
            </a>
          </div>

          {/* Use cases */}
          <div className="flex flex-wrap justify-center gap-2">
            {useCases.map(uc => (
              <span key={uc} className="flex items-center gap-1.5 text-xs text-secondary border border-border px-3 py-1 rounded-full bg-surface">
                <CheckCircle2 className="w-3 h-3 text-accent" />
                {uc}
              </span>
            ))}
          </div>
        </div>

        {/* Mock UI preview */}
        <div className="relative max-w-3xl mx-auto mt-16">
          <div className="absolute -inset-6 bg-purple/8 blur-3xl rounded-3xl -z-10" />
          <div className="glass rounded-2xl border border-border overflow-hidden shadow-2xl">
            {/* Fake browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-surface">
              <div className="w-3 h-3 rounded-full bg-red-500/40" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/40" />
              <div className="w-3 h-3 rounded-full bg-green-500/40" />
              <div className="flex-1 mx-3">
                <div className="bg-raised border border-border rounded-md px-3 py-1 text-xs text-muted font-mono max-w-xs mx-auto text-center">
                  app.documind.ai/dashboard
                </div>
              </div>
            </div>
            {/* Fake dashboard content */}
            <div className="p-5 space-y-3 bg-bg">
              {/* Stats row */}
              <div className="grid grid-cols-4 gap-2">
                {['12 docs', 'Pro plan', '48 restants', '< 3s'].map((v, i) => (
                  <div key={i} className="bg-surface border border-border rounded-xl p-2.5 text-center">
                    <p className="text-xs text-muted mb-0.5">{['Total', 'Plan', 'Ce mois', 'Vitesse'][i]}</p>
                    <p className={`font-syne font-700 text-sm ${i === 3 ? 'text-accent' : 'text-white'}`}>{v}</p>
                  </div>
                ))}
              </div>
              {/* Doc cards */}
              {[
                { name: 'Contrat_2024_Q4.pdf', badge: 'Analysé', color: 'accent' },
                { name: 'Rapport_Financier.pdf', badge: 'Traitement…', color: 'purple', shimmer: true },
                { name: 'Dossier_RH_Oct.pdf', badge: 'Prêt', color: 'muted' },
              ].map((doc, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border">
                  <div className={`w-8 h-8 rounded-lg flex-shrink-0 ${
                    doc.color === 'accent' ? 'bg-accent/10 border border-accent/20' :
                    doc.color === 'purple' ? 'bg-purple/10 border border-purple/20' :
                    'bg-raised border border-border'
                  }`} />
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className={`h-2.5 rounded ${doc.shimmer ? 'shimmer' : 'bg-raised'} w-3/4`} />
                    <div className="h-2 bg-raised rounded w-1/3" />
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full flex-shrink-0 ${
                    doc.color === 'accent' ? 'bg-accent/10 border border-accent/20 text-accent' :
                    doc.color === 'purple' ? 'bg-purple/10 border border-purple/20 text-purple' :
                    'bg-raised border border-border text-muted'
                  }`}>{doc.badge}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="py-12 px-5 md:px-8 border-y border-border bg-surface/50">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="font-syne font-800 text-3xl text-accent mb-1">{value}</p>
              <p className="text-secondary text-sm">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-24 px-5 md:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-accent text-sm font-mono mb-3 tracking-widest uppercase">Processus</p>
            <h2 className="font-syne text-4xl md:text-5xl font-700 tracking-tight">
              Simple en 3 étapes
            </h2>
            <p className="text-secondary mt-4 max-w-md mx-auto">Du document brut aux insights actionnables en moins d'une minute.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Connecting line on desktop */}
            <div className="hidden md:block absolute top-10 left-1/6 right-1/6 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

            {steps.map(({ number, icon: Icon, title, desc }) => (
              <div key={number} className="relative flex flex-col items-center text-center p-6 rounded-2xl bg-surface border border-border group hover:border-accent/30 transition-all">
                <div className="relative mb-5">
                  <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center group-hover:bg-accent/15 transition-colors">
                    <Icon className="w-7 h-7 text-accent" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-bg border border-border flex items-center justify-center text-[10px] font-mono text-muted">
                    {number}
                  </span>
                </div>
                <h3 className="font-syne font-600 text-lg mb-2">{title}</h3>
                <p className="text-secondary text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-5 md:px-8 bg-surface/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-accent text-sm font-mono mb-3 tracking-widest uppercase">Fonctionnalités</p>
            <h2 className="font-syne text-4xl md:text-5xl font-700 tracking-tight">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-secondary mt-4 max-w-md mx-auto">Un outil unique pour remplacer des heures de lecture, d'analyse et de rédaction.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group p-6 rounded-2xl bg-surface border border-border hover:border-accent/25 transition-all hover:bg-raised"
              >
                <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-4 group-hover:bg-accent/15 transition-colors">
                  <Icon className="w-5 h-5 text-accent" />
                </div>
                <h3 className="font-syne font-600 text-base mb-2">{title}</h3>
                <p className="text-secondary text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-5 md:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-accent text-sm font-mono mb-3 tracking-widest uppercase">Tarifs</p>
            <h2 className="font-syne text-4xl md:text-5xl font-700 tracking-tight">
              Transparent et sans surprise
            </h2>
            <p className="text-secondary mt-4 max-w-md mx-auto">Commencez gratuitement. Passez à Pro quand vous êtes prêt.</p>
          </div>
          <PricingPlans />
          <p className="text-center text-xs text-muted mt-6">Paiement sécurisé par Stripe · Annulable à tout moment · Aucun engagement</p>
        </div>
      </section>

      {/* Testimonial / Trust */}
      <section className="py-16 px-5 md:px-8 border-y border-border bg-surface/30">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex items-center justify-center gap-1 mb-4">
            {[1,2,3,4,5].map(i => (
              <Star key={i} className="w-5 h-5 text-accent fill-accent" />
            ))}
          </div>
          <p className="text-lg text-secondary leading-relaxed italic mb-6">
            "DocuMind AI a transformé notre façon d'analyser les contrats. Ce qui prenait 2 heures prend maintenant 5 minutes. Indispensable pour notre équipe juridique."
          </p>
          <div className="flex items-center justify-center gap-3">
            <div className="w-9 h-9 rounded-full bg-purple/20 border border-purple/30 flex items-center justify-center font-syne font-600 text-purple text-sm">
              ML
            </div>
            <div className="text-left">
              <p className="text-sm font-500 text-white">Marie Lefebvre</p>
              <p className="text-xs text-muted">Directrice juridique, Cabinet Conseil</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-5 md:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="relative p-10 md:p-14 rounded-3xl bg-surface border border-border overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-accent/8 blur-3xl rounded-full pointer-events-none" />
            <div className="relative">
              <p className="text-accent text-sm font-mono mb-3 tracking-widest uppercase">Prêt à commencer ?</p>
              <h2 className="font-syne text-3xl md:text-4xl font-700 mb-4">Analysez votre premier document aujourd'hui</h2>
              <p className="text-secondary mb-8">Aucune carte de crédit requise. 3 documents gratuits pour toujours.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/register"
                  className="group inline-flex items-center gap-2 bg-accent text-bg font-mono font-500 px-8 py-4 rounded-xl hover:bg-accent/90 transition-all glow-accent hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto justify-center"
                >
                  Commencer gratuitement
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/login"
                  className="text-sm text-secondary hover:text-white transition-colors w-full sm:w-auto text-center py-4"
                >
                  Déjà un compte ? Se connecter →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10 px-5 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-accent flex items-center justify-center">
                <FileText className="w-3.5 h-3.5 text-bg" />
              </div>
              <span className="font-syne font-700">DocuMind AI</span>
            </div>
            <div className="flex items-center gap-8 text-sm text-secondary">
              <a href="#features" className="hover:text-white transition-colors">Fonctionnalités</a>
              <a href="#pricing" className="hover:text-white transition-colors">Tarifs</a>
              <Link href="/privacy" className="hover:text-white transition-colors">Confidentialité</Link>
              <Link href="/terms" className="hover:text-white transition-colors">CGU</Link>
            </div>
          </div>
          <div className="border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted">
            <span>© {new Date().getFullYear()} DocuMind AI. Tous droits réservés.</span>
            <span>Construit avec Next.js · Groq AI · Supabase · Stripe</span>
          </div>
        </div>
      </footer>

    </div>
  )
}
