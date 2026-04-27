'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Result() {
  const [data, setData] = useState<any>(null)
  const [showPro, setShowPro] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const stored = sessionStorage.getItem('analysisResult')
    if (stored) setData(JSON.parse(stored))
  }, [])

  if (!data) return (
    <div style={{
      minHeight: '100vh',
      background: '#0d0d0d',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#666',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    }}>
      Loading result...
    </div>
  )

  if (data.error) return (
    <div style={{
      minHeight: '100vh',
      background: '#0d0d0d',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#f87171',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    }}>
      {data.message}
    </div>
  )

  const f = data.freeOutput
  const riskConfig = {
    reject: { color: '#f87171', bg: '#2a1a1a', label: '❌ High Risk of Rejection' },
    improve: { color: '#fbbf24', bg: '#2a2010', label: '⚠️ Needs Improvement' },
    strong: { color: '#4ade80', bg: '#0f2a1a', label: '✅ Strong Profile' }
  }[f.risk_level] || { color: '#888', bg: '#1a1a1a', label: f.risk_level }

  const scoreColor = f.score >= 70 ? '#4ade80' : f.score >= 40 ? '#fbbf24' : '#f87171'

  return (
    <main style={{
      minHeight: '100vh',
      background: '#0d0d0d',
      color: '#ececec',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>

        {/* Back button */}
        <button
          onClick={() => router.push('/')}
          style={{
            background: 'none',
            border: '1px solid #2a2a2a',
            color: '#666',
            padding: '8px 16px',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 13,
            marginBottom: 32
          }}
        >
          ← Analyze another resume
        </button>

        {/* Score Card */}
        <div style={{
          background: '#111',
          border: '1px solid #222',
          borderRadius: 16,
          padding: 32,
          marginBottom: 16,
          textAlign: 'center'
        }}>
          <p style={{ color: '#555', fontSize: 13, marginBottom: 8 }}>
            HIREABILITY SCORE
          </p>
          <p style={{
            fontSize: 96,
            fontWeight: 700,
            lineHeight: 1,
            color: scoreColor,
            margin: '0 0 8px'
          }}>
            {f.score}
          </p>
          <p style={{ color: '#444', fontSize: 14, marginBottom: 20 }}>
            out of 100
          </p>

          {/* Progress bar */}
          <div style={{
            height: 6,
            background: '#1a1a1a',
            borderRadius: 3,
            marginBottom: 20,
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: `${f.score}%`,
              background: scoreColor,
              borderRadius: 3
            }} />
          </div>

          {/* Risk badge */}
          <div style={{
            display: 'inline-block',
            background: riskConfig.bg,
            color: riskConfig.color,
            padding: '8px 20px',
            borderRadius: 20,
            fontSize: 14,
            fontWeight: 600,
            marginBottom: 20
          }}>
            {riskConfig.label}
          </div>

          {/* Mode */}
          <div style={{
            background: '#1a1a1a',
            borderRadius: 10,
            padding: '12px 16px',
            textAlign: 'left'
          }}>
            <p style={{ fontSize: 12, color: '#555', marginBottom: 4 }}>
              EXPERIENCE LEVEL DETECTED
            </p>
            <p style={{ fontSize: 14, color: '#888', textTransform: 'capitalize' }}>
              {f.mode} — {f.mode_explanation}
            </p>
          </div>
        </div>

        {/* Score Gap + Potential */}
        <div style={{
          background: '#111',
          border: '1px solid #222',
          borderRadius: 16,
          padding: 24,
          marginBottom: 16,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16
        }}>
          <div style={{
            background: '#1a1a1a',
            borderRadius: 10,
            padding: 16,
            textAlign: 'center'
          }}>
            <p style={{ color: '#555', fontSize: 12, marginBottom: 8 }}>
              POINTS TO STRONG
            </p>
            <p style={{ fontSize: 36, fontWeight: 700, color: '#fbbf24' }}>
              {f.scoreGap}
            </p>
            <p style={{ color: '#555', fontSize: 12 }}>points away</p>
          </div>
          <div style={{
            background: '#1a1a1a',
            borderRadius: 10,
            padding: 16,
            textAlign: 'center'
          }}>
            <p style={{ color: '#555', fontSize: 12, marginBottom: 8 }}>
              YOUR POTENTIAL
            </p>
            <p style={{ fontSize: 36, fontWeight: 700, color: '#4ade80' }}>
              {f.potentialScore}
            </p>
            <p style={{ color: '#555', fontSize: 12 }}>after top fixes</p>
          </div>
        </div>

        {/* Top 3 Issues */}
        <div style={{
          background: '#111',
          border: '1px solid #222',
          borderRadius: 16,
          padding: 24,
          marginBottom: 16
        }}>
          <p style={{ fontSize: 12, color: '#555', marginBottom: 16 }}>
            TOP 3 ISSUES — HIGHEST IMPACT
          </p>
          {f.top3Issues.map((issue: any, i: number) => (
            <div key={i} style={{
              padding: '14px 0',
              borderBottom: i < 2 ? '1px solid #1a1a1a' : 'none'
            }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{
                  background: '#2a1a1a',
                  color: '#f87171',
                  borderRadius: 6,
                  padding: '2px 8px',
                  fontSize: 12,
                  fontWeight: 600,
                  whiteSpace: 'nowrap'
                }}>
                  #{i + 1}
                </span>
                <div>
                  <p style={{ fontSize: 14, color: '#ececec', marginBottom: 4 }}>
                    {issue.description}
                  </p>
                  <p style={{ fontSize: 13, color: '#555' }}>
                    {issue.why_it_matters}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Teaser Fix */}
        <div style={{
          background: '#111',
          border: '1px solid #2a3a2a',
          borderRadius: 16,
          padding: 24,
          marginBottom: 16
        }}>
          <p style={{ fontSize: 12, color: '#4ade80', marginBottom: 16 }}>
            🔧 YOUR HIGHEST IMPACT FIX
          </p>
          <p style={{ fontSize: 14, color: '#ececec', marginBottom: 8 }}>
            <span style={{ color: '#555' }}>Problem: </span>
            {f.teaserFix.issue.description}
          </p>
          <p style={{ fontSize: 14, color: '#ececec', marginBottom: 8 }}>
            <span style={{ color: '#555' }}>Why it matters: </span>
            {f.teaserFix.issue.why_it_matters}
          </p>
          <div style={{
            background: '#1a1a1a',
            borderRadius: 8,
            padding: 14,
            marginTop: 12,
            fontSize: 13,
            color: '#888',
            lineHeight: 1.6
          }}>
            {f.teaserFix.issue.fix}
          </div>
          <p style={{ marginTop: 12, color: '#4ade80', fontSize: 13, fontWeight: 500 }}>
            ✅ Fixing this can improve your score by ~{f.teaserFix.gainRange}
          </p>
        </div>

        {/* Locked Section */}
        {!showPro && (
          <div style={{ position: 'relative', marginBottom: 16 }}>
            {/* Blurred content */}
            <div style={{
              filter: 'blur(4px)',
              pointerEvents: 'none',
              background: '#111',
              border: '1px solid #222',
              borderRadius: 16,
              padding: 24
            }}>
              <p style={{ color: '#555', fontSize: 12, marginBottom: 16 }}>
                REMAINING FIXES
              </p>
              {[1, 2, 3].map(i => (
                <div key={i} style={{
                  padding: '14px 0',
                  borderBottom: '1px solid #1a1a1a'
                }}>
                  <p style={{ color: '#ececec', fontSize: 14 }}>
                    Fix #{i + 1}: Add measurable metrics to your experience bullets...
                  </p>
                  <p style={{ color: '#555', fontSize: 13, marginTop: 4 }}>
                    This directly impacts recruiter decision making...
                  </p>
                </div>
              ))}
            </div>

            {/* Overlay */}
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(13,13,13,0.85)',
              borderRadius: 16
            }}>
              <p style={{ fontSize: 20, marginBottom: 8 }}>🔒</p>
              <p style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>
                {f.hiddenCount} more high-impact fixes
              </p>
              <p style={{ color: '#555', fontSize: 13, marginBottom: 20, textAlign: 'center' }}>
                Exact keywords · Full rewrites · Role fit guidance
              </p>
              <button
                onClick={() => {
                  setShowPro(true)
                  setTimeout(() => {
                    document.getElementById('pro-section')?.scrollIntoView({
                      behavior: 'smooth'
                    })
                  }, 100)
                }}
                style={{
                  padding: '12px 28px',
                  background: 'linear-gradient(135deg, #4ade80, #22c55e)',
                  color: '#000',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                See exactly how to close the gap →
              </button>
            </div>
          </div>
        )}

        {/* Pro Section */}
        {showPro && (
          <div id="pro-section" style={{ marginBottom: 32 }}>

            {/* Header */}
            <div style={{
              background: 'linear-gradient(135deg, #0f2a1a, #1a1a0f)',
              border: '1px solid #2a3a2a',
              borderRadius: 16,
              padding: 24,
              marginBottom: 16,
              textAlign: 'center'
            }}>
              <p style={{ fontSize: 20, marginBottom: 8 }}>🔓 Full Analysis Unlocked</p>
              <p style={{ color: '#4ade80', fontSize: 14 }}>
                Here's exactly how to close the gap to {f.potentialScore}/100
              </p>
            </div>

            {/* All Issues */}
            <div style={{
              background: '#111',
              border: '1px solid #222',
              borderRadius: 16,
              padding: 24,
              marginBottom: 16
            }}>
              <p style={{ fontSize: 12, color: '#555', marginBottom: 16 }}>
                ALL ISSUES — RANKED BY IMPACT
              </p>
              {data.proOutput.allIssues.map((issue: any, i: number) => (
                <div key={i} style={{
                  padding: '16px 0',
                  borderBottom: i < data.proOutput.allIssues.length - 1
                    ? '1px solid #1a1a1a'
                    : 'none'
                }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <span style={{
                      background: issue.tier === 1 ? '#2a1a1a'
                        : issue.tier === 2 ? '#2a1f0a'
                        : '#1a1a2a',
                      color: issue.tier === 1 ? '#f87171'
                        : issue.tier === 2 ? '#fbbf24'
                        : '#818cf8',
                      borderRadius: 6,
                      padding: '2px 8px',
                      fontSize: 11,
                      fontWeight: 600,
                      whiteSpace: 'nowrap'
                    }}>
                      T{issue.tier}
                    </span>
                    <div style={{ flex: 1 }}>
                      <span style={{
                        fontSize: 11,
                        color: '#555',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        {issue.category}
                      </span>
                      <p style={{ fontSize: 14, color: '#ececec', margin: '4px 0' }}>
                        {issue.description}
                      </p>
                      <p style={{ fontSize: 13, color: '#555', marginBottom: 8 }}>
                        {issue.why_it_matters}
                      </p>
                      <div style={{
                        background: '#1a1a1a',
                        borderRadius: 8,
                        padding: '10px 14px',
                        fontSize: 13,
                        color: '#4ade80',
                        lineHeight: 1.6
                      }}>
                        ✏️ {issue.fix}
                      </div>
                      <p style={{ fontSize: 12, color: '#555', marginTop: 8 }}>
                        Impact: +{Math.abs(issue.final_impact)} pts
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Role Fit Guidance */}
            <div style={{
              background: '#111',
              border: '1px solid #222',
              borderRadius: 16,
              padding: 24,
              marginBottom: 16
            }}>
              <p style={{ fontSize: 12, color: '#555', marginBottom: 16 }}>
                ROLE FIT GUIDANCE
              </p>
              <div style={{ display: 'grid', gap: 12 }}>
                <div style={{
                  background: '#0f2a1a',
                  border: '1px solid #2a3a2a',
                  borderRadius: 10,
                  padding: 16
                }}>
                  <p style={{ color: '#4ade80', fontWeight: 600, marginBottom: 4 }}>
                    ✅ Apply confidently
                  </p>
                  <p style={{ color: '#888', fontSize: 13 }}>
                    Roles matching your current level and experience field
                  </p>
                </div>
                <div style={{
                  background: '#2a1a1a',
                  border: '1px solid #3a2a2a',
                  borderRadius: 10,
                  padding: 16
                }}>
                  <p style={{ color: '#f87171', fontWeight: 600, marginBottom: 4 }}>
                    ❌ Avoid for now
                  </p>
                  <p style={{ color: '#888', fontSize: 13 }}>
                    Senior leadership roles requiring more demonstrated impact metrics
                  </p>
                </div>
                <div style={{
                  background: '#1a1a2a',
                  border: '1px solid #2a2a3a',
                  borderRadius: 10,
                  padding: 16
                }}>
                  <p style={{ color: '#818cf8', fontWeight: 600, marginBottom: 4 }}>
                    🚀 Stretch roles
                  </p>
                  <p style={{ color: '#888', fontSize: 13 }}>
                    Apply after fixing top 2 issues — you'll be competitive
                  </p>
                </div>
              </div>
            </div>

            {/* Action Plan */}
            <div style={{
              background: '#111',
              border: '1px solid #222',
              borderRadius: 16,
              padding: 24
            }}>
              <p style={{ fontSize: 12, color: '#555', marginBottom: 16 }}>
                YOUR ACTION PLAN
              </p>
              <div style={{ display: 'grid', gap: 10 }}>
                {data.proOutput.allIssues.slice(0, 3).map((issue: any, i: number) => (
                  <div key={i} style={{
                    display: 'flex',
                    gap: 12,
                    alignItems: 'flex-start',
                    padding: '10px 0',
                    borderBottom: i < 2 ? '1px solid #1a1a1a' : 'none'
                  }}>
                    <span style={{
                      background: '#1a1a1a',
                      color: '#4ade80',
                      borderRadius: 20,
                      width: 24,
                      height: 24,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 700,
                      flexShrink: 0
                    }}>
                      {i + 1}
                    </span>
                    <p style={{ fontSize: 14, color: '#888', lineHeight: 1.5 }}>
                      {issue.fix}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Trust line */}
        <p style={{
          color: '#333',
          fontSize: 12,
          textAlign: 'center',
          marginBottom: 40
        }}>
          This score reflects resume strength and role alignment —
          not guaranteed selection in systems like Workday ATS.
        </p>

      </div>
    </main>
  )
}