export const getScoreGainRange = (finalImpact: number): string => {
  if (finalImpact >= 10) return '7–10 points'
  if (finalImpact >= 7)  return '5–7 points'
  if (finalImpact >= 4)  return '3–5 points'
  return '1–3 points'
}

export const getPotentialScore = (
  score: number,
  issues: any[]
): number => {
  // Take top 3 issues and estimate realistic gain
  const top3 = issues.slice(0, 3)
  
  // Use tier-based gain estimation if final_impact seems too low
  const estimatedGain = top3.reduce((sum: number, issue: any) => {
    const impact = issue.final_impact || 0
    const tierGain = issue.tier === 1 ? 10
      : issue.tier === 2 ? 6
      : issue.tier === 3 ? 3
      : 1
    // Use whichever is higher — reported impact or tier default
    return sum + Math.max(impact, tierGain)
  }, 0)

  const potential = Math.round(score + estimatedGain)
  
  // Potential must always be higher than current score
  // and capped at 100
  return Math.min(100, Math.max(score + 5, potential))
}