import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateFollowUpEmail(params: {
  leadName: string
  company: string | null
  status: string
  notes?: string
}): Promise<string> {
  const { leadName, company, status, notes } = params

  const prompt = `Write a short, professional follow-up email to a sales lead named ${leadName}${
    company ? ` from ${company}` : ''
  }. Their current status is "${status}". ${
    notes ? `Additional context: ${notes}.` : ''
  } Keep it concise (under 150 words), friendly but professional, and end with a clear call to action. Do not include a subject line, just the email body.`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 300,
  })

  return completion.choices[0]?.message?.content || 'Unable to generate email content.'
}

export async function analyzeLeadQuality(params: {
  leadName: string
  company: string | null
  source: string | null
  status: string
}): Promise<{ score: number; reasoning: string }> {
  const { leadName, company, source, status } = params

  const prompt = `You are a sales lead qualification assistant. Analyze this lead and provide a quality score from 0-100, where 100 is an extremely promising lead likely to convert, and 0 is very unlikely to convert.

Lead details:
- Name: ${leadName}
- Company: ${company || 'Unknown'}
- Source: ${source || 'Unknown'}
- Current status: ${status}

Respond ONLY with valid JSON in this exact format, nothing else:
{"score": <number>, "reasoning": "<one sentence explanation>"}`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 150,
    response_format: { type: 'json_object' },
  })

  const content = completion.choices[0]?.message?.content

  if (!content) {
    throw new Error('Empty response from OpenAI')
  }

  const parsed = JSON.parse(content)

  if (typeof parsed.score !== 'number' || parsed.score < 0 || parsed.score > 100) {
    throw new Error('Invalid score returned by AI')
  }

  return {
    score: Math.round(parsed.score),
    reasoning: parsed.reasoning || 'No reasoning provided',
  }
}

