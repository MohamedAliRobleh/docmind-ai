'use client'

import { useState, useCallback, forwardRef, useImperativeHandle } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Loader2, CheckCircle2, AlertCircle, FileText, FileSpreadsheet, File, Image, X } from 'lucide-react'
import toast from 'react-hot-toast'

interface UploadZoneProps {
  onUpload: (id: string) => void
}

export interface UploadZoneHandle {
  open: () => void
}

const ACCEPT = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.ms-excel': ['.xls'],
  'text/plain': ['.txt'],
  'text/csv': ['.csv'],
  'text/markdown': ['.md'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/gif': ['.gif'],
  'image/tiff': ['.tiff', '.tif'],
  'image/bmp': ['.bmp'],
}

const FORMAT_BADGES = [
  { label: 'PDF',      color: 'text-red-400 border-red-400/30 bg-red-400/5' },
  { label: 'Word',     color: 'text-blue-400 border-blue-400/30 bg-blue-400/5' },
  { label: 'Excel',    color: 'text-green-400 border-green-400/30 bg-green-400/5' },
  { label: 'TXT/CSV',  color: 'text-muted border-border bg-raised' },
  { label: 'JPG/PNG',  color: 'text-purple border-purple/30 bg-purple/5' },
  { label: 'WEBP/GIF', color: 'text-muted border-border bg-raised' },
]

interface FileStatus {
  file: File
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
}

const UploadZone = forwardRef<UploadZoneHandle, UploadZoneProps>(function UploadZone({ onUpload }, ref) {
  const [fileStatuses, setFileStatuses] = useState<FileStatus[]>([])
  const [isDone, setIsDone] = useState(false)

  const updateStatus = (fileName: string, status: FileStatus['status'], error?: string) => {
    setFileStatuses(prev => prev.map(f =>
      f.file.name === fileName ? { ...f, status, error } : f
    ))
  }

  const uploadFile = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    updateStatus(file.name, 'uploading')

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()

      if (res.ok) {
        updateStatus(file.name, 'success')
        toast.success(`"${file.name.replace(/\.[^.]+$/, '')}" importé`)
        onUpload(data.id)
      } else {
        const msg = data.message || data.error || 'Erreur lors de l\'upload.'
        updateStatus(file.name, 'error', msg)
        toast.error(msg)
      }
    } catch {
      updateStatus(file.name, 'error', 'Erreur réseau.')
      toast.error('Erreur réseau.')
    }
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!acceptedFiles.length) return
    setIsDone(false)

    const newStatuses: FileStatus[] = acceptedFiles.map(f => ({ file: f, status: 'pending' }))
    setFileStatuses(prev => [...prev, ...newStatuses])

    // Upload files sequentially to avoid rate limits
    for (const file of acceptedFiles) {
      await uploadFile(file)
    }
    setIsDone(true)
  }, [onUpload])

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: ACCEPT,
    multiple: true,
    noClick: false,
  })

  useImperativeHandle(ref, () => ({ open }), [open])

  const removeFile = (fileName: string) => {
    setFileStatuses(prev => prev.filter(f => f.file.name !== fileName))
  }

  const reset = () => {
    setFileStatuses([])
    setIsDone(false)
  }

  const isUploading = fileStatuses.some(f => f.status === 'uploading' || f.status === 'pending')
  const successCount = fileStatuses.filter(f => f.status === 'success').length
  const errorCount = fileStatuses.filter(f => f.status === 'error').length

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`relative rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all select-none ${
          isDragActive
            ? 'border-accent bg-accent/5 scale-[1.01]'
            : isUploading
            ? 'border-purple/40 bg-purple/5 cursor-not-allowed'
            : 'border-border bg-surface hover:border-accent/40 hover:bg-accent/[0.03]'
        }`}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center gap-3">
          <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center transition-all ${
            isDragActive ? 'bg-accent/15 border-accent/30' : 'bg-raised border-border'
          }`}>
            {isUploading
              ? <Loader2 className="w-6 h-6 text-purple animate-spin" />
              : <Upload className={`w-6 h-6 transition-colors ${isDragActive ? 'text-accent' : 'text-muted'}`} />
            }
          </div>

          <div>
            <p className="font-syne font-600 mb-1">
              {isDragActive
                ? 'Déposez vos fichiers ici'
                : isUploading
                ? 'Upload en cours…'
                : 'Déposez vos documents ici'}
            </p>
            {!isUploading && (
              <p className="text-secondary text-sm">
                ou <span className="text-accent underline underline-offset-2">parcourir les fichiers</span>
                <span className="text-muted"> · Plusieurs fichiers acceptés</span>
              </p>
            )}
          </div>

          {/* Format badges */}
          {!isUploading && (
            <div className="flex flex-wrap justify-center gap-1.5 mt-1">
              {FORMAT_BADGES.map(({ label, color }) => (
                <span key={label} className={`text-[10px] font-mono px-2 py-0.5 rounded border ${color}`}>
                  {label}
                </span>
              ))}
              <span className="text-[10px] font-mono px-2 py-0.5 rounded border text-purple border-purple/30 bg-purple/5">
                📷 Scan
              </span>
            </div>
          )}

          <p className="text-xs text-muted">Max 20MB par fichier</p>
        </div>
      </div>

      {/* File list */}
      {fileStatuses.length > 0 && (
        <div className="space-y-2">
          {/* Summary bar */}
          {isDone && (
            <div className={`flex items-center justify-between px-4 py-2 rounded-xl text-sm ${
              errorCount === 0
                ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                : 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-400'
            }`}>
              <span>
                {successCount} fichier{successCount !== 1 ? 's' : ''} téléversé{successCount !== 1 ? 's' : ''}
                {errorCount > 0 && ` · ${errorCount} erreur${errorCount !== 1 ? 's' : ''}`}
              </span>
              <button onClick={reset} className="text-xs underline hover:no-underline">Effacer</button>
            </div>
          )}

          {/* Individual file rows */}
          {fileStatuses.map(({ file, status, error }) => (
            <div key={file.name} className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm ${
              status === 'success' ? 'bg-green-500/5 border-green-500/20' :
              status === 'error'   ? 'bg-red-500/5 border-red-500/20' :
              status === 'uploading' ? 'bg-purple/5 border-purple/20' :
              'bg-surface border-border'
            }`}>
              {/* Status icon */}
              <div className="flex-shrink-0">
                {status === 'uploading' && <Loader2 className="w-4 h-4 text-purple animate-spin" />}
                {status === 'pending'   && <div className="w-4 h-4 rounded-full border-2 border-border" />}
                {status === 'success'   && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                {status === 'error'     && <AlertCircle className="w-4 h-4 text-red-400" />}
              </div>

              {/* File name + error */}
              <div className="flex-1 min-w-0">
                <p className="truncate text-white text-xs">{file.name}</p>
                {error && <p className="text-red-400 text-xs mt-0.5 truncate">{error}</p>}
                {status === 'uploading' && <p className="text-purple text-xs mt-0.5">Traitement en cours…</p>}
              </div>

              {/* File size */}
              <span className="text-xs text-muted flex-shrink-0">
                {(file.size / 1024 / 1024).toFixed(1)}MB
              </span>

              {/* Remove (only when done) */}
              {(status === 'success' || status === 'error') && (
                <button
                  onClick={e => { e.stopPropagation(); removeFile(file.name) }}
                  className="flex-shrink-0 text-muted hover:text-white transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
})

export default UploadZone
