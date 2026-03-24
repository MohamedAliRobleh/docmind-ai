'use client'

import jsPDF from 'jspdf'
import { Download, FileText } from 'lucide-react'
import MarkdownRenderer from './MarkdownRenderer'

interface ReportViewerProps {
  report: string
  docName?: string
}

export default function ReportViewer({ report, docName }: ReportViewerProps) {
  const cleanName = docName ? docName.replace(/\.pdf$/i, '').replace(/\.[^.]+$/, '') : null
  const displayTitle = cleanName ? `Rapport — ${cleanName}` : 'Rapport généré'
  const pdfFileName = cleanName
    ? `${cleanName.replace(/[^a-zA-Z0-9\-_\u00C0-\u024F ]/g, '').trim()}-rapport.pdf`
    : 'docuMind-rapport.pdf'

  const exportPDF = () => {
    const doc = new jsPDF()
    const margin = 15
    const pageWidth = doc.internal.pageSize.getWidth() - margin * 2
    let y = 20

    const checkPage = (needed = 8) => {
      if (y + needed > 270) { doc.addPage(); y = 20 }
    }

    // ── Cover header ──────────────────────────────────────────────────────────
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(18)
    doc.setTextColor(20, 20, 20)
    doc.text('DocuMind AI', margin, y)
    y += 9

    if (cleanName) {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(13)
      doc.setTextColor(40, 40, 40)
      const titleLines = doc.splitTextToSize(cleanName, pageWidth)
      for (const line of titleLines) {
        checkPage()
        doc.text(line, margin, y)
        y += 7
      }
    }

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(130, 130, 130)
    doc.text(`Rapport généré le ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`, margin, y)
    y += 4

    // Separator line
    doc.setDrawColor(220, 220, 220)
    doc.line(margin, y, margin + pageWidth, y)
    y += 10

    // ── Body: parse markdown line by line ────────────────────────────────────
    const lines = report.split('\n')

    for (const rawLine of lines) {
      const line = rawLine.trimEnd()

      // ## Section header → bold, larger, with spacing
      if (/^#{1,3}\s/.test(line)) {
        const text = line.replace(/^#{1,3}\s+/, '').replace(/\*\*/g, '')
        checkPage(12)
        y += 3
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(12)
        doc.setTextColor(20, 20, 20)
        const wrapped = doc.splitTextToSize(text, pageWidth)
        for (const wl of wrapped) {
          checkPage()
          doc.text(wl, margin, y)
          y += 7
        }
        y += 1
        continue
      }

      // Bullet point
      if (/^[-*]\s/.test(line)) {
        const raw = line.replace(/^[-*]\s+/, '')
        // Handle **bold**: label up to ':' or first bold span
        const parts = raw.split(/(\*\*[^*]+\*\*)/)
        checkPage()
        doc.setFontSize(10)
        doc.setTextColor(40, 40, 40)

        // Build the full bullet text (stripped of **)
        const fullText = '• ' + raw.replace(/\*\*(.*?)\*\*/g, '$1')
        const wrapped = doc.splitTextToSize(fullText, pageWidth - 4)

        // First line: try to render bold part then normal
        let xCursor = margin + 4

        // Check if line starts with **bold term**:
        const boldMatch = raw.match(/^\*\*([^*]+)\*\*[:：]?\s*(.*)/)
        if (boldMatch) {
          const boldPart = '• ' + boldMatch[1] + (boldMatch[0].includes(':') ? ':' : '')
          const normalPart = boldMatch[2] || ''

          doc.setFont('helvetica', 'bold')
          const boldWidth = doc.getTextWidth(boldPart)
          doc.text(boldPart, xCursor, y)

          doc.setFont('helvetica', 'normal')
          if (normalPart) {
            const normalLines = doc.splitTextToSize(normalPart, pageWidth - 4 - boldWidth - 1)
            doc.text(normalLines[0] || '', xCursor + boldWidth + 1, y)
            y += 6
            for (let i = 1; i < normalLines.length; i++) {
              checkPage()
              doc.text(normalLines[i], margin + 4 + boldWidth + 1, y)
              y += 6
            }
          } else {
            y += 6
          }
        } else {
          doc.setFont('helvetica', 'normal')
          for (const wl of wrapped) {
            checkPage()
            doc.text(wl, margin + 4, y)
            y += 6
          }
        }
        continue
      }

      // Empty line → small gap
      if (!line.trim()) {
        y += 3
        continue
      }

      // Normal paragraph
      const cleanLine = line.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1')
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.setTextColor(40, 40, 40)
      const wrapped = doc.splitTextToSize(cleanLine, pageWidth)
      for (const wl of wrapped) {
        checkPage()
        doc.text(wl, margin, y)
        y += 6
      }
    }

    // ── Footer on every page ─────────────────────────────────────────────────
    const totalPages = (doc.internal as any).getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(180, 180, 180)
      doc.text('DocuMind AI', margin, 290)
      doc.text(`Page ${i} / ${totalPages}`, doc.internal.pageSize.getWidth() - margin - 20, 290)
    }

    doc.save(pdfFileName)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={exportPDF}
          className="flex items-center gap-2 text-sm border border-border bg-raised px-4 py-2 rounded-xl hover:border-accent/40 hover:text-accent transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          Exporter PDF
        </button>
      </div>

      <div className="bg-raised border border-border rounded-xl p-6">
        <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
            <FileText className="w-4 h-4 text-accent" />
          </div>
          <div>
            <p className="font-syne font-600 text-sm">{displayTitle}</p>
            <p className="text-xs text-muted">
              {new Date().toLocaleDateString('fr-FR', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>
        <MarkdownRenderer content={report} />
      </div>
    </div>
  )
}
