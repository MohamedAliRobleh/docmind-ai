import Groq from 'groq-sdk'

const client = new Groq({ apiKey: process.env.GROQ_API_KEY })

// Truncate content to avoid token limits — increased to 14k chars
function truncate(text: string, maxChars = 14000) {
  return text.length > maxChars ? text.slice(0, maxChars) + '\n...[truncated]' : text
}

export async function streamChatResponse(
  content: string,
  question: string,
  customPrompt?: string
): Promise<ReadableStream<Uint8Array>> {
  const doc = truncate(content, 8000)
  const langInstruction = `CRITICAL: Detect the language of the document and write your ENTIRE response in that exact same language. Do NOT mention the language. Do NOT introduce yourself. Output the content directly.`

  const prompt = customPrompt
    ? `${customPrompt}\nDocument: ${doc}\nQuestion: ${question}`
    : `You are an expert document assistant.
${langInstruction}
Answer the question in detail based ONLY on the document provided.
If the answer is not in the document, say so clearly.
Use markdown formatting when helpful (bullet points, bold for key terms).
Document: ${doc}
Question: ${question}`

  const groqStream = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 2048,
    temperature: 0.4,
    stream: true,
  })

  const encoder = new TextEncoder()
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      for await (const chunk of groqStream) {
        const text = chunk.choices[0]?.delta?.content || ''
        if (text) controller.enqueue(encoder.encode(text))
      }
      controller.close()
    },
  })
}

export async function analyzeDocument(
  content: string,
  task: 'summary' | 'report' | 'extract' | 'chat',
  question?: string,
  customPrompt?: string
) {
  const doc = truncate(content)

  const langInstruction = `CRITICAL: Detect the language of the document and write your ENTIRE response in that exact same language. Do NOT mention the language. Do NOT introduce yourself. Output the content directly.`

  const prompts: Record<string, string> = {
    summary: `You are an expert document analyst. Produce a structured, precise summary of the document below.
${langInstruction}

YOU MUST USE MARKDOWN SYNTAX. Follow this EXACT format:

## 1. [Meaningful Section Title]
- **Specific term or fact**: One concise sentence explaining it — include actual numbers, dates, names, or values from the document when available
- **Specific term or fact**: One concise sentence with a concrete detail
- **Specific term or fact**: One concise sentence

## 2. [Next Section Title]
(same pattern)

(5 to 6 sections total)

## Key Takeaway
One short paragraph (2-3 sentences) with the most important insight.

STRICT RULES — failure to follow these will make the summary useless:
- Use ## for headers — MANDATORY
- Use **bold** for the key term at the start of each bullet — MANDATORY
- Each bullet = ONE sentence only. No second sentence that says "this is important" or "this ensures". If you catch yourself writing "This X is Y because Z is fundamental to..." — delete the second part.
- Prioritize concrete details: numbers, deadlines, specific names, thresholds, dates
- Do NOT pad with filler like "This underscores the importance of..." or "Understanding this is essential..."
- Do NOT repeat what the previous sentence said in different words
- No introduction before the first ##

Document:
${doc}`,

    report: `You are a senior business analyst. Generate a comprehensive professional report from the document below.
${langInstruction}

Use exactly these markdown sections, each with rich bullet points (minimum 3-5 points per section):

## Executive Summary
(2-3 paragraph overview of the document's purpose, scope and main conclusions)

## Key Points
(The most important facts, data, concepts or arguments — be specific)

## Action Items
(Concrete next steps or recommendations derived from the document)

## Risk Flags
(Potential issues, warnings, limitations or concerns identified in the document)

## Recommendations
(Strategic suggestions based on the document's content)

Rules:
- Each section must have at least 4 bullet points
- Use **bold** for key terms and important values
- Be precise and professional — avoid generic filler
- Do NOT introduce yourself or mention the language

Document:
${doc}`,

    extract: `Extract key data from the document below.
Return a valid JSON array only — no markdown, no explanation, no code fences.
Each item must have "type" and "value" string fields.
Types to look for: date, name, amount, deadline, address, email, phone, organization.
Example output: [{"type":"date","value":"2024-01-15"},{"type":"name","value":"John Doe"}]
Document: ${doc}`,
  }

  // If a niche-specific custom prompt is provided, use it + append the document
  const prompt = customPrompt
    ? task === 'extract'
      ? `${customPrompt}\nDocument: ${doc}`
      : task === 'chat'
      ? `${customPrompt}\nDocument: ${truncate(content, 8000)}\nQuestion: ${question}`
      : `${customPrompt}\n\nDocument:\n${doc}`
    : question
    ? `You are an expert document assistant.
${langInstruction}
Answer the question in detail based ONLY on the document provided.
If the answer is not in the document, say so clearly.
Document: ${truncate(content, 8000)}
Question: ${question}`
    : prompts[task]

  const response = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: task === 'extract' ? 1024 : task === 'chat' ? 2048 : 4096,
    temperature: task === 'extract' ? 0 : 0.4,
  })

  const raw = response.choices[0].message.content || ''
  // DeepSeek R1 includes <think>...</think> reasoning blocks — strip them from the final output
  return raw.replace(/<think>[\s\S]*?<\/think>/gi, '').trim()
}
