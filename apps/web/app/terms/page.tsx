import Link from 'next/link'
import { FileText, ArrowLeft } from 'lucide-react'

const sections = [
  {
    title: '1. Acceptance of Terms',
    content: `By accessing or using DocuMind AI ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service. We reserve the right to update these terms at any time, and continued use of the Service constitutes acceptance of the revised terms.`,
  },
  {
    title: '2. Description of Service',
    content: `DocuMind AI is an AI-powered document analysis platform that allows users to upload PDF documents and receive AI-generated summaries, reports, extracted data, and chat-based Q&A. The Service is provided "as is" and features may change or be discontinued at any time.`,
  },
  {
    title: '3. User Accounts',
    content: `You must create an account to use the Service. You are responsible for maintaining the confidentiality of your credentials and for all activities that occur under your account. You must provide accurate and complete information during registration. You may not share your account with others or create multiple accounts for the purpose of circumventing usage limits.`,
  },
  {
    title: '4. Acceptable Use',
    content: `You agree not to upload documents that contain illegal content, violate intellectual property rights, or include sensitive personal information of third parties without consent. You may not use the Service to generate misleading content, engage in fraud, or violate any applicable laws. We reserve the right to suspend or terminate accounts that violate these guidelines.`,
  },
  {
    title: '5. Intellectual Property',
    content: `All AI-generated content (summaries, reports, extractions) produced by the Service is provided to you for personal or business use. DocuMind AI retains no ownership of your uploaded documents. The DocuMind AI platform, brand, and codebase remain the exclusive intellectual property of DocuMind AI Inc.`,
  },
  {
    title: '6. Subscription Plans and Billing',
    content: `The Free plan allows up to 3 document analyses per month. Paid plans (Pro, Business) are billed monthly or annually via Stripe. All payments are non-refundable except where required by law. You may cancel your subscription at any time; your access will continue until the end of the current billing period. Prices may change with 30 days' notice.`,
  },
  {
    title: '7. Limitation of Liability',
    content: `DocuMind AI provides AI-generated analyses for informational purposes only. We do not guarantee the accuracy, completeness, or suitability of any AI-generated content for legal, financial, medical, or other professional purposes. DocuMind AI shall not be liable for any damages arising from reliance on AI-generated content. Our total liability to you shall not exceed the amount paid by you in the 3 months preceding the claim.`,
  },
  {
    title: '8. Data and Privacy',
    content: `Your use of the Service is also governed by our Privacy Policy, which is incorporated by reference into these Terms. By using the Service, you consent to our collection and use of your data as described in the Privacy Policy.`,
  },
  {
    title: '9. Service Availability',
    content: `We strive for 99.9% uptime but do not guarantee uninterrupted availability. The Service may be temporarily unavailable due to maintenance, updates, or circumstances beyond our control. We will notify users in advance of planned maintenance where possible.`,
  },
  {
    title: '10. Termination',
    content: `We reserve the right to suspend or terminate your account at any time for violation of these Terms. You may delete your account at any time through your account settings. Upon termination, your documents and data will be deleted within 30 days.`,
  },
  {
    title: '11. Governing Law',
    content: `These Terms are governed by the laws of the Province of Quebec, Canada, and applicable federal Canadian laws. Any disputes arising from these Terms shall be resolved in the courts of Quebec.`,
  },
  {
    title: '12. Contact',
    content: `For any questions regarding these Terms: legal@documind.ai`,
  },
]

export default function TermsPage() {
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
          <span className="inline-block text-xs font-mono text-purple bg-purple/10 border border-purple/20 px-3 py-1 rounded-full mb-4">
            Legal
          </span>
          <h1 className="font-syne font-800 text-4xl text-white mb-3">Terms of Service</h1>
          <p className="text-secondary text-sm">DocuMind AI — Last updated: March 2026</p>
        </div>

        {/* Intro box */}
        <div className="bg-surface border border-border rounded-2xl p-6 mb-10 text-secondary text-sm leading-relaxed">
          Please read these Terms of Service carefully before using DocuMind AI. These terms constitute
          a legally binding agreement between you and DocuMind AI Inc. regarding your use of the platform
          and all associated services.
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
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-accent hover:underline">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
