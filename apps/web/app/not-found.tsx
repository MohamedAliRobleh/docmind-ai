import Link from 'next/link'
import { FileText, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-10">
          <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center">
            <FileText className="w-5 h-5 text-bg" />
          </div>
          <span className="font-syne font-700 text-xl tracking-tight">DocuMind AI</span>
        </div>

        {/* 404 */}
        <div className="mb-6">
          <p className="font-syne font-800 text-[7rem] leading-none text-accent/20 select-none">404</p>
          <h1 className="font-syne font-700 text-2xl -mt-2 mb-2">Page introuvable</h1>
          <p className="text-secondary text-sm">
            Cette page n&apos;existe pas ou a été déplacée.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 bg-accent text-bg font-mono font-500 text-sm px-5 py-2.5 rounded-xl hover:bg-accent/90 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au dashboard
        </Link>
      </div>
    </div>
  )
}
