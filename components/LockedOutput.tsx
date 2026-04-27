export default function LockedOutput({
  hiddenCount
}: {
  hiddenCount: number
}) {
  const trackCTA = () => {
    console.log(JSON.stringify({
      event: 'cta_clicked',
      timestamp: new Date().toISOString()
    }))
  }

  return (
    <div style={{ marginTop: 32, position: 'relative' }}>
      {/* Blurred background content */}
      <div style={{
        filter: 'blur(4px)',
        pointerEvents: 'none',
        padding: 24,
        border: '1px solid #eee',
        borderRadius: 8
      }}>
        <p>Fix 1: Add SQL to your skills section...</p>
        <p>Fix 2: Rewrite your experience bullets with metrics...</p>
        <p>Fix 3: Align your title with the target role...</p>
        <p>Fix 4: Add missing keywords from job description...</p>
      </div>

      {/* Overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(255,255,255,0.85)',
        borderRadius: 8
      }}>
        <p style={{ fontWeight: 600, fontSize: 16 }}>
          🔒 {hiddenCount} more high-impact fixes ranked by priority
        </p>
        <p style={{ color: '#666', fontSize: 14, marginTop: 8 }}>
          Exact keywords · Full rewrites · Role fit guidance
        </p>
        <button
          onClick={trackCTA}
          style={{
            marginTop: 16,
            padding: '12px 24px',
            background: '#000',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            fontSize: 15,
            cursor: 'pointer'
          }}
        >
          See exactly how to close the gap →
        </button>
      </div>
    </div>
  )
}