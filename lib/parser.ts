export const safeParseJSON = (raw: string) => {
  try {
    const clean = raw.replace(/```json|```/g, '').trim()
    return JSON.parse(clean)
  } catch {
    return null
  }
}

export const fallbackError = (layer: string) => ({
  error: true,
  message: `Analysis failed at ${layer}. Please try again.`
})