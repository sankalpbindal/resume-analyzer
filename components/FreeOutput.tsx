export default function FreeOutput({ data }: { data: any }) {
  const riskColor = {
    reject: '#dc2626',
    improve: '#d97706',
    strong: '#16a34a'
  }[data.risk_level] || '#000'

  return (
    <div style={{ fontFamily: 'sans-serif' }}>

      {/* Score + Risk */}
      <div style={{
        padding: 24,
        border: '1px solid #eee',
        borderRadius: 8,
        marginBottom: 16,
        textAlign: 'center'
      }}>
        <p style={{ fontSize: 64, fontWeight: 700, margin: 0 }}>
          {data.score}
        </p>
        <p style={{ color: '#666', marginTop: 4 }}>out of 100</p>
        <p style={{
          color: riskColor,
          fontWeight: 600,
          fontSize: 18,
          marginTop: 8,
          textTransform: 'uppercase'
        }}>
          {data.risk_level}
        </p>
      </div>

      {/* Mode */}
      <div style={{
        padding: 16,
        background: '#f9f9f9',
        borderRadius: 8,
        marginBottom: 16
      }}>
        <p style={{ fontWeight: 600 }}>
          Experience Level: {data.mode}
        </p>
        <p style={{ color: '#666', fontSize: 14, marginTop: 4 }}>
          {data.mode_explanation}
        </p>
      </div>

      {/* Top 3 Issues */}
      <div style={{
        padding: 16,
        border: '1px solid #eee',
        borderRadius: 8,
        marginBottom: 16
      }}>
        <p style={{ fontWeight: 600, marginBottom: 12 }}>
          Top 3 Issues (highest impact)
        </p>
        {data.top3Issues.map((issue: any, i: number) => (
          <div key={i} style={{
            padding: '10px 0',
            borderBottom: i < 2 ? '1px solid #f0f0f0' : 'none'
          }}>
            <p style={{ fontWeight: 500 }}>❌ {issue.description}</p>
            <p style={{ color: '#666', fontSize: 13, marginTop: 4 }}>
              {issue.why_it_matters}
            </p>
          </div>
        ))}
      </div>

      {/* Teaser Fix */}
      <div style={{
        padding: 16,
        background: '#fffbeb',
        border: '1px solid #fcd34d',
        borderRadius: 8,
        marginBottom: 16
      }}>
        <p style={{ fontWeight: 600, marginBottom: 8 }}>
          🔧 Your Highest Impact Fix
        </p>
        <p><strong>Problem:</strong> {data.teaserFix.issue.description}</p>
        <p style={{ marginTop: 8 }}>
          <strong>Why it matters:</strong> {data.teaserFix.issue.why_it_matters}
        </p>
        <p style={{ marginTop: 8 }}>
          <strong>Example fix:</strong> {data.teaserFix.issue.fix}
        </p>
        <p style={{
          marginTop: 12,
          color: '#16a34a',
          fontWeight: 500
        }}>
          ✅ Fixing this can improve your score by ~{data.teaserFix.gainRange}
        </p>
      </div>

      {/* Score Gap + Potential */}
      <div style={{
        padding: 16,
        background: '#f0f9ff',
        border: '1px solid #bae6fd',
        borderRadius: 8,
        marginBottom: 24
      }}>
        <p style={{ fontWeight: 600 }}>
          You're {data.scoreGap} points away from being a strong candidate.
        </p>
        <p style={{ color: '#0369a1', marginTop: 8 }}>
          Fix your top issues and you could reach ~{data.potentialScore}/100
        </p>
      </div>

      {/* Trust line */}
      <p style={{ fontSize: 12, color: '#999', textAlign: 'center' }}>
        This score reflects resume strength and role alignment — not guaranteed
        selection in systems like Workday ATS.
      </p>

    </div>
  )
}