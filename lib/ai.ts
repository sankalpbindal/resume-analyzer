import { safeParseJSON } from './parser'

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const callAI = async (prompt: string): Promise<string> => {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0,
      max_tokens: 1000
    })
  })

  const data = await res.json()

  // Handle rate limit
  if (res.status === 429) {
    console.log('Rate limited, waiting 20 seconds...')
    await sleep(20000)
    return callAI(prompt)
  }

  if (!res.ok || !data?.choices?.[0]?.message?.content) {
    throw new Error(`Groq response error: ${JSON.stringify(data)}`)
  }

  return data.choices[0].message.content
}

export const callWithRetry = async (
  prompt: string,
  attempt = 1
): Promise<any> => {
  const suffix = attempt > 1
    ? '\n\nRETURN VALID JSON ONLY. NO TEXT. NO MARKDOWN.'
    : ''
  const raw = await callAI(prompt + suffix)
  const parsed = safeParseJSON(raw)

  if (!parsed && attempt === 1) return callWithRetry(prompt, 2)
  if (!parsed && attempt === 2) throw new Error('LLM JSON parsing failed')

  return parsed
}