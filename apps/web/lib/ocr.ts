import Groq from 'groq-sdk'

const client = new Groq({ apiKey: process.env.GROQ_API_KEY })

// Groq vision supported formats
const VISION_SUPPORTED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export async function extractTextFromImage(buffer: Buffer, mimeType: string): Promise<string> {
  // Normalize JPEG mime type
  const normalizedMime = mimeType === 'image/jpg' ? 'image/jpeg' : mimeType

  if (!VISION_SUPPORTED.includes(normalizedMime)) {
    throw new Error(`Format image non supporté pour l'OCR : ${mimeType}. Utilisez JPG, PNG, WEBP ou GIF.`)
  }

  const base64 = buffer.toString('base64')
  const dataUrl = `data:${normalizedMime};base64,${base64}`

  const response = await client.chat.completions.create({
    model: 'llama-3.2-11b-vision-preview',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: dataUrl },
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
    max_tokens: 4096,
  })

  const text = response.choices[0].message.content || ''
  if (!text.trim()) throw new Error('Aucun texte détecté dans cette image.')
  return text
}
