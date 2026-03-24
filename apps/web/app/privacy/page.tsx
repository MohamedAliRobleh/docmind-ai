import Link from 'next/link'
import { FileText, ArrowLeft } from 'lucide-react'

const sections = [
  {
    title: '1. Information We Collect',
    content: `We collect information you provide during registration (name, email address), PDF documents you upload for analysis, and usage data (pages visited, features used).`,
  },
  {
    title: '2. How We Use Your Data',
    content: `Your data is used solely to provide DocuMind AI services: document analysis, summary and report generation. We never sell your data to third parties. Your documents are processed by the Groq/LLaMA API and are not retained after processing.`,
  },
  {
    title: '3. Uploaded Documents',
    content: `Documents you upload are securely transmitted to our AI provider for analysis. They are deleted from our servers within 24 hours of processing. We recommend avoiding uploading documents containing sensitive personal information.`,
  },
  {
    title: '4. Data Sharing',
    content: `We only share your data with essential service providers: Groq (AI analysis), Supabase (secure storage), and Stripe (payment processing). These providers are bound by their own privacy policies compliant with PIPEDA and GDPR.`,
  },
  {
    title: '5. Security',
    content: `All communications are encrypted via HTTPS/TLS. Passwords are hashed and never stored in plain text. We apply strict access controls to our databases.`,
  },
  {
    title: '6. Your Rights (PIPEDA — Canada)',
    content: `Under Canadian PIPEDA law, you have the right to access, correct, and request deletion of your data at any time. To exercise these rights, contact us at privacy@documind.ai.`,
  },
  {
    title: '7. Cookies',
    content: `We use essential cookies to maintain your login session and anonymized analytics cookies to improve our service. You may disable analytics cookies in your settings.`,
  },
  {
    title: '8. Changes to This Policy',
    content: `We will notify you by email of any significant changes to this policy. The latest version is always available on this page.`,
  },
  {
    title: '9. Contact',
    content: `For any questions: privacy@documind.ai`,
  },
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-bg">
      {/* Nav */}
      <header className="border-b border-border bg-surface/80 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
              <FileText className="w-4 h-4 text-bg" />
            </div>
            <span className="font-syne font-700 text-base tracking-tight">DocuMind AI</span>
          </Link>
          <Link href="/" className="flex items-center gap-1.5 text-sm text-secondary hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-14">
        {/* Header */}
        <div className="mb-12">
          <span className="inline-block text-xs font-mono text-accent bg-accent/10 border border-accent/20 px-3 py-1 rounded-full mb-4">
            Legal
          </span>
          <h1 className="font-syne font-800 text-4xl text-white mb-3">Privacy Policy</h1>
          <p className="text-secondary text-sm">DocuMind AI — Last updated: March 2026</p>
        </div>

        {/* Intro box */}
        <div className="bg-surface border border-border rounded-2xl p-6 mb-10 text-secondary text-sm leading-relaxed">
          At DocuMind AI, we take your privacy seriously. This policy explains what data we collect,
          how we use it, and what rights you have. We are committed to transparency and to protecting
          your personal information in accordance with Canadian PIPEDA law and GDPR.
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {sections.map((section) => (
            <div key={section.title} className="border-b border-border pb-8 last:border-0">
              <h2 className="font-syne font-600 text-lg text-white mb-3">{section.title}</h2>
              <p className="text-secondary leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6 mt-8">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted">
          <span>© {new Date().getFullYear()} DocuMind AI. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-accent hover:underline">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
