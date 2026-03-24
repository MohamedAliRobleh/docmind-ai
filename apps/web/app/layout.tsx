import type { Metadata } from 'next'
import { Syne, DM_Mono } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-syne',
  display: 'swap',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-dm-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'DocuMind AI — Intelligent Document Analysis',
  description: 'AI-powered document analysis platform for small businesses, lawyers, accountants, and HR teams.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${dmMono.variable}`}>
      <body className="font-mono bg-bg text-white antialiased">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1a1a26',
              color: '#ffffff',
              border: '1px solid #2a2a3a',
              borderRadius: '12px',
              fontSize: '13px',
              fontFamily: 'var(--font-dm-mono)',
            },
            success: {
              iconTheme: { primary: '#e8ff47', secondary: '#0a0a0f' },
              duration: 3000,
            },
            error: {
              iconTheme: { primary: '#f87171', secondary: '#0a0a0f' },
              duration: 4000,
            },
          }}
        />
      </body>
    </html>
  )
}
