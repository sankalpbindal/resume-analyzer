export const buildClassificationPrompt = (resume: string) => `
You are a resume classification engine.

Read the resume below and return ONLY a JSON object.

Rules:
- Fresher: under 2 years or student or no full-time roles
- Mid-level: 2–8 years with clear progression
- Senior: 8+ years or visible leadership signals
- Switcher: ONLY classify if a job description is provided AND current field clearly doesn't match target role. If no job description provided, never return "switcher".
- If confidence < 60, still return best guess but reflect that in the confidence score.

Return this exact JSON:
{
  "mode": "fresher" | "mid-level" | "senior" | "switcher",
  "confidence": 0-100,
  "years_experience": number,
  "current_field": "string",
  "target_field": "string or null",
  "mode_explanation": "one line, e.g. Based on 4 years of relevant experience and role progression."
}

Return JSON only. No explanation.

RESUME:
${resume}
`

export const buildScoringPrompt = (
  resume: string,
  profile: any,
  jd: string | null
) => `
You are a resume evaluation engine.

User profile: ${profile.mode} | ${profile.years_experience} years experience.
Job Description: ${jd || 'Not provided'}

Evaluate the resume and return ONLY a JSON object.

Scoring rules (deterministic):
- Start from 100
- Subtract per issue found:
  Tier 1: -8 to -12 each (missing critical skill/keyword in 70%+ of similar JDs, no metrics, misaligned framing)
  Tier 2: -4 to -7 each (weak bullets, partial keyword gaps, missing proof of work)
  Tier 3: -2 to -4 each (ATS formatting, weak verbs, skill section gaps)
  Tier 4: -0 to -2 each (grammar, phrasing, cosmetic)
- Final score must be consistent with total penalties applied
- Score must never fall below 20 unless resume is clearly unusable

Risk level:
- 0–40: reject
- 41–69: improve
- 70–100: strong

Multipliers by mode (apply to base_score per issue):
- Fresher: projects/skills x1.3, metrics x1.2
- Mid-level: metrics x1.4, role alignment x1.2
- Senior: leadership x1.5, impact metrics x1.3
- Switcher: transferable skills x1.4, keyword gaps x1.3, direct experience gaps x0.7

Return this exact JSON:
{
  "score": number,
  "risk_level": "reject" | "improve" | "strong",
  "total_issues": number,
  "issues": [
    {
      "category": "skills" | "experience" | "keywords" | "formatting" | "quality",
      "tier": 1 | 2 | 3 | 4,
      "description": "string",
      "why_it_matters": "1-line impact explanation",
      "fix": "specific rewrite or action",
      "base_score": number,
      "final_impact": number
    }
  ]
}

Sort issues by final_impact descending.
Return JSON only. No explanation.

RESUME:
${resume}
`

export const buildFormattingPrompt = (
  analysis: any,
  profile: any,
  gainRange: string
) => `
You are a career feedback writer.

Given this analysis: ${JSON.stringify(analysis)}
User mode: ${profile.mode}
Mode explanation: ${profile.mode_explanation}
Gain range for top issue: ${gainRange}

Write the user-facing output in this exact structure:

SCORE: {score}/100
RISK: {risk_level}
EXPERIENCE LEVEL DETECTED: {mode}
"{mode_explanation}"

TOP 3 ISSUES (highest impact):
[List top 3 by final_impact — problem + why_it_matters only. No fix shown.]

TEASER FIX:
Problem: {highest impact issue description}
Why it matters: {why_it_matters}
Example fix: {before → after rewrite}
Fixing this can improve your score by ~${gainRange}

SCORE GAP:
"You're ${100 - analysis.score} points away from being a strong candidate."

POTENTIAL:
"Fix your top issues and you could reach ~${analysis.potential_score}/100."

Writing rules:
- Never suggest adding skills user clearly doesn't have
- Prefer reframe over add where honest
- Every fix must answer: why does this matter?
- Keep language direct, specific, human
`