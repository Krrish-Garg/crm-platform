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