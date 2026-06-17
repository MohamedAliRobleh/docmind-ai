import Anthropic from '@anthropic-ai/sdk'

const MODEL = 'claude-haiku-4-5'

let _client: Anthropic | null = null
function getClient(): Anthropic {
  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  }
  return _client
}

// Claude vision supported formats
const VISION_SUPPORTED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const
type SupportedMime = (typeof VISION_SUPPORTED)[number]

export async function extractTextFromImage(buffer: Buffer, mimeType: string): Promise<string> {
  // Normalize JPEG mime type
  const normalizedMime = mimeType === 'image/jpg' ? 'image/jpeg' : mimeType

  if (!VISION_SUPPORTED.includes(normalizedMime as SupportedMime)) {
    throw new Error(`Format image non supporté pour l'OCR : ${mimeType}. Utilisez JPG, PNG, WEBP ou GIF.`)
  }

  const base64 = buffer.toString('base64')

  const response = await getClient().messages.create({
    model: MODEL,
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: normalizedMime as SupportedMime,
              data: base64,
            },
          },
          {
            type: 'text',
            text: `Extract ALL text from this scanned document image.
Preserve the exact structure: paragraphs, tables, lists, headers, dates, amounts, names.
Return only the raw extracted text — no commentary, no introduction, no explanation.
If the document is in French, return the text in French. If English, return in English.`,
          },
        ],
      },
    ],
  })

  const text = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('')

  if (!text.trim()) throw new Error('Aucun texte détecté dans cette image.')
  return text
}
