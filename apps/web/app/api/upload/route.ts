import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase, getUser } from '@/lib/supabase-server'
import { docs } from '@/lib/store'
import { PLAN_LIMITS } from '@/app/api/user/plan/route'
import { extractTextFromImage } from '@/lib/ocr'

const IS_DEMO = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')

const SUPPORTED_TYPES: Record<string, string> = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/msword': 'docx',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/vnd.ms-excel': 'xlsx',
  'text/plain': 'txt',
  'text/csv': 'txt',
  'text/markdown': 'txt',
  'application/json': 'txt',
  'image/jpeg': 'image',
  'image/jpg': 'image',
  'image/png': 'image',
  'image/webp': 'image',
  'image/gif': 'image',
  'image/tiff': 'image',
  'image/bmp': 'image',
}

const EXT_MAP: Record<string, string> = {
  '.pdf': 'pdf', '.docx': 'docx', '.doc': 'docx',
  '.xlsx': 'xlsx', '.xls': 'xlsx',
  '.txt': 'txt', '.csv': 'txt', '.md': 'txt', '.json': 'txt',
  '.jpg': 'image', '.jpeg': 'image', '.png': 'image',
  '.webp': 'image', '.gif': 'image', '.tiff': 'image', '.tif': 'image', '.bmp': 'image',
}

function getFileType(fileName: string, mimeType: string): string | null {
  const ext = '.' + (fileName.split('.').pop() ?? '').toLowerCase()
  return EXT_MAP[ext] ?? SUPPORTED_TYPES[mimeType] ?? null
}

async function extractText(buffer: Buffer, fileType: string, mimeType: string): Promise<string> {
  if (fileType === 'pdf') {
    const pdfParse = require('pdf-parse')
    const parsed = await pdfParse(buffer)
    const text = (parsed.text || '').trim()

    // Detect scanned PDF (very little text extracted)
    if (text.length < 80) {
      throw new Error(
        'Ce PDF semble être un document scanné (aucun texte lisible détecté). ' +
        'Exportez les pages en JPG ou PNG et uploadez les images directement.'
      )
    }
    return text
  }

  if (fileType === 'docx') {
    const mammoth = require('mammoth')
    const result = await mammoth.extractRawText({ buffer })
    return result.value || ''
  }

  if (fileType === 'xlsx') {
    const XLSX = require('xlsx')
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const lines: string[] = []
    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName]
      const csv = XLSX.utils.sheet_to_csv(sheet)
      if (csv.trim()) {
        lines.push(`=== Feuille : ${sheetName} ===`)
        lines.push(csv)
      }
    }
    return lines.join('\n')
  }

  if (fileType === 'image') {
    return await extractTextFromImage(buffer, mimeType)
  }

  // Plain text (.txt, .csv, .md, .json)
  return buffer.toString('utf-8')
}

export async function POST(request: NextRequest) {
  try {
    let userId = 'anon'

    if (!IS_DEMO) {
      const user = await getUser()
      if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
      userId = user.id

      const supabase = createServerSupabase()
      const { data: sub } = await supabase
        .from('subscriptions').select('plan, status').eq('user_id', userId).single()
      const plan = (sub?.status === 'active' ? sub.plan : 'free') as string
      const docLimit = PLAN_LIMITS[plan] ?? 3

      if (docLimit !== Infinity) {
        const startOfMonth = new Date()
        startOfMonth.setDate(1); startOfMonth.setHours(0, 0, 0, 0)
        const { count } = await supabase
          .from('documents').select('id', { count: 'exact', head: true })
          .eq('user_id', userId).gte('created_at', startOfMonth.toISOString())
        if ((count ?? 0) >= docLimit) {
          return NextResponse.json({
            error: 'upgrade_required',
            message: `Limite atteinte — le plan ${plan} permet ${docLimit} document${docLimit > 1 ? 's' : ''} par mois.`,
          }, { status: 403 })
        }
      }
    } else {
      if (Object.keys(docs).length >= 3) {
        return NextResponse.json({
          error: 'upgrade_required',
          message: 'Limite atteinte — 3 documents maximum en mode démo.',
        }, { status: 403 })
      }
    }

    let formData: FormData
    try {
      formData = await request.formData()
    } catch (e) {
      return NextResponse.json({ error: 'Impossible de lire la requête', detail: String(e) }, { status: 400 })
    }

    const file = formData.get('file')
    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'Aucun fichier reçu' }, { status: 400 })
    }

    const fileObj = file as File
    const fileName = fileObj.name || 'upload'
    const mimeType = fileObj.type || ''

    const fileType = getFileType(fileName, mimeType)
    if (!fileType) {
      return NextResponse.json({
        error: 'Format non supporté. Formats acceptés : PDF, Word, Excel, TXT, CSV, JPG, PNG, WEBP.',
      }, { status: 400 })
    }

    // 20MB limit
    if (fileObj.size > 20 * 1024 * 1024) {
      return NextResponse.json({ error: 'Le fichier dépasse la limite de 20MB.' }, { status: 400 })
    }

    let content = ''
    try {
      const arrayBuffer = await fileObj.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      content = await extractText(buffer, fileType, mimeType)
    } catch (e: any) {
      return NextResponse.json({ error: e.message || 'Impossible de lire le fichier.' }, { status: 422 })
    }

    if (!content.trim()) {
      return NextResponse.json({
        error: 'Aucun texte détecté dans ce fichier. Vérifiez qu\'il n\'est pas vide.',
      }, { status: 422 })
    }

    if (IS_DEMO) {
      const id = `demo-${Date.now()}`
      docs[id] = { id, user_id: userId, name: fileName, content, created_at: new Date().toISOString() }
      return NextResponse.json({ id })
    }

    const supabase = createServerSupabase()
    const { data: doc, error } = await supabase
      .from('documents').insert({ user_id: userId, name: fileName, content }).select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ id: doc.id })

  } catch (e) {
    return NextResponse.json({ error: 'Erreur interne', detail: String(e) }, { status: 500 })
  }
}
