import { NextRequest, NextResponse } from 'next/server'
import { callWithRetry } from '@/lib/ai'
import { fallbackError } from '@/lib/parser'
import { getScoreGainRange, getPotentialScore } from '@/lib/scoring'
import {
  buildClassificationPrompt,
  buildScoringPrompt,
  buildFormattingPrompt
} from '@/lib/prompts'

export async function POST(req: NextRequest) {
  const start = Date.now()
console.log('API hit — start')
  try {
    const contentType = req.headers.get('content-type') || ''
    let resume = ''
    let jobDescription = ''

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData()
      const file = formData.get('resume') as File
      jobDescription = formData.get('jobDescription') as string || ''

      console.log('File received:', file?.name, file?.type, file?.size)

      if (file && file.type === 'application/pdf') {
        const buffer = Buffer.from(await file.arrayBuffer())
        console.log('Buffer size:', buffer.length)

        try {
          // Simple PDF text extraction
          const text = buffer.toString('latin1')
          const matches = text.match(/BT[\s\S]*?ET/g) || []
          let extracted = ''

          for (const block of matches) {
            const strings = block.match(/\((.*?)\)\s*Tj/g) || []
            for (const str of strings) {
              extracted += str.replace(/^\(|\)\s*Tj$/g, '') + ' '
            }
          }

          // Fallback: grab readable ASCII text
          if (extracted.trim().length < 100) {
            extracted = text
              .replace(/[^\x20-\x7E\n]/g, ' ')
              .replace(/\s+/g, ' ')
              .trim()
          }

          resume = extracted
          console.log('PDF parsed, text length:', resume.length)
          console.log('Sample:', resume.slice(0, 200))

        } catch (pdfErr: any) {
          console.error('PDF parse error:', pdfErr.message)
          return NextResponse.json(
            { error: true, message: 'Could not read PDF. Please paste your resume as text instead.' }
          )
        }

      } else if (file) {
        resume = await file.text()
        console.log('Text file received, length:', resume.length)
      }

    } else {
      const body = await req.json()
      resume = body.resume || ''
      jobDescription = body.jobDescription || ''
      console.log('JSON body received, resume length:', resume.length)
    }

    if (!resume.trim()) {
      return NextResponse.json(
        { error: true, message: 'No resume content found. Please try again.' }
      )
    }

    // Sanitize
    const cleanResume = resume
      .replace(/[\u2022•▪■]/g, '-')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 3000)

    console.log('Clean resume length:', cleanResume.length)

    // Layer 1 — Classify
    console.log('Starting classification...')
    const profile = await callWithRetry(
      buildClassificationPrompt(cleanResume)
    )
    if (!profile) return NextResponse.json(
      fallbackError('classification')
    )
    console.log('Classification done:', profile.mode)

    // Layer 2 — Score
    console.log('Starting scoring...')
    const analysis = await callWithRetry(
      buildScoringPrompt(cleanResume, profile, jobDescription)
    )
    if (!analysis) return NextResponse.json(
      fallbackError('scoring')
    )
    console.log('Scoring done, score:', analysis.score)

    // Guards
    if (!analysis.issues || analysis.issues.length === 0) {
      return NextResponse.json(fallbackError('no issues detected'))
    }

    // Enforce sort server-side
    analysis.issues.sort(
      (a: any, b: any) => b.final_impact - a.final_impact
    )

    // Clamp score
    analysis.score = Math.max(20, Math.min(100, analysis.score))

    // Derive in JS
    analysis.potential_score = getPotentialScore(
      analysis.score,
      analysis.issues
    )
    const teaserIssue = analysis.issues[0]
    const gainRange = getScoreGainRange(teaserIssue.final_impact)
    const scoreGap = 100 - analysis.score
    const hiddenCount = Math.max(0, analysis.total_issues - 1)

    // Log
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      duration: Date.now() - start,
      mode: profile.mode,
      score: analysis.score,
      risk: analysis.risk_level,
      issueCount: analysis.total_issues,
      potentialScore: analysis.potential_score,
      hasJD: !!jobDescription
    }))

    return NextResponse.json({
      freeOutput: {
        score: analysis.score,
        risk_level: analysis.risk_level,
        mode: profile.mode,
        mode_explanation: profile.mode_explanation,
        top3Issues: analysis.issues.slice(0, 3),
        teaserFix: { issue: teaserIssue, gainRange },
        scoreGap,
        potentialScore: analysis.potential_score,
        hiddenCount
      },
      proOutput: {
        allIssues: analysis.issues
      }
    })

 } catch (err: any) {
  console.error('TOP LEVEL ERROR:', err?.message || String(err))
  console.error('Stack:', err?.stack || 'no stack')
  return NextResponse.json(
    { error: true, message: err?.message || 'Something went wrong.' },
    { status: 500 }
  )
}
}