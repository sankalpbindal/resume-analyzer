'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

const JD_PRESETS: Record<string, string> = {
  'Software Engineer': 'Looking for a Software Engineer with experience in building scalable web applications. Required skills: JavaScript, TypeScript, React, Node.js, REST APIs, Git. Experience with cloud platforms (AWS/GCP) is a plus. 2+ years of experience preferred.',
  'Data Analyst': 'Seeking a Data Analyst to interpret data and turn it into information. Required skills: SQL, Python, Excel, data visualization (Tableau/Power BI), statistical analysis. Experience with large datasets and business reporting required.',
  'Product Manager': 'Looking for a Product Manager to lead product vision and roadmap. Required skills: product strategy, user research, agile/scrum, stakeholder management, data-driven decision making. Experience with B2B or SaaS products preferred.',
  'UI/UX Designer': 'Seeking a UI/UX Designer to create intuitive digital experiences. Required skills: Figma, user research, wireframing, prototyping, design systems. Portfolio demonstrating end-to-end design process required.',
  'Business Analyst': 'Looking for a Business Analyst to bridge business and technology. Required skills: requirements gathering, process mapping, SQL, Excel, stakeholder communication, documentation. Experience with ERP systems is a plus.',
  'Marketing Manager': 'Seeking a Marketing Manager to drive growth and brand awareness. Required skills: digital marketing, SEO/SEM, content strategy, social media, analytics, campaign management. Experience with marketing automation tools preferred.',
  'HR Manager': 'Looking for an HR Manager to oversee talent acquisition and employee relations. Required skills: recruitment, onboarding, performance management, HRIS systems, employment law, employee engagement.'
}

async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const pdfjsLib = await import('pdfjs-dist')
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString()
  
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  let fullText = ''
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const pageText = content.items
      .map((item: any) => item.str)
      .join(' ')
    fullText += pageText + '\n'
  }
  
  return fullText
}

export default function Home() {
  const [resume, setResume] = useState('')
  const [jd, setJD] = useState('')
  const [selectedRole, setSelectedRole] = useState('')
  const [loading, setLoading] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [error, setError] = useState('')
  const [uploadedFileName, setUploadedFileName] = useState('')
  const [inputMode, setInputMode] = useState<'paste' | 'upload'>('paste')
  const [jdMode, setJdMode] = useState<'preset' | 'custom'>('preset')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setExtracting(true)
    setError('')
    setUploadedFileName(file.name)

    try {
      let text = ''
      if (file.type === 'application/pdf') {
        text = await extractTextFromPDF(file)
      } else {
        text = await file.text()
      }

      if (!text.trim()) {
        setError('Could not extract text from this PDF. Please try pasting your resume instead.')
        return
      }

      setResume(text)
      console.log('Extracted text length:', text.length)
      console.log('Sample:', text.slice(0, 200))
    } catch (err: any) {
      setError('Failed to read file. Please try pasting your resume instead.')
      console.error('File read error:', err.message)
    } finally {
      setExtracting(false)
    }
  }

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role)
    setJD(JD_PRESETS[role] || '')
  }

  const analyze = async () => {
    if (!resume.trim()) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
  resume: resume.slice(0, 6000), 
  jobDescription: jd 
})
      })

      const data = await res.json()
      if (data.error) { setError(data.message); return }
      sessionStorage.setItem('analysisResult', JSON.stringify(data))
      router.push('/result')

    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const isReady = resume.trim().length > 0

  return (
    <main style={{
      minHeight: '100vh',
      background: '#0d0d0d',
      color: '#ececec',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '60px 20px'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 48, maxWidth: 600 }}>
        <div style={{
          display: 'inline-block',
          background: '#1a1a1a',
          border: '1px solid #2a2a2a',
          borderRadius: 20,
          padding: '6px 16px',
          fontSize: 13,
          color: '#888',
          marginBottom: 20
        }}>
          AI-Powered Resume Analyzer
        </div>
        <h1 style={{
          fontSize: 42,
          fontWeight: 700,
          lineHeight: 1.2,
          margin: '0 0 16px',
          background: 'linear-gradient(135deg, #fff 0%, #888 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          See why your resume gets rejected
        </h1>
        <p style={{ color: '#666', fontSize: 16, lineHeight: 1.6 }}>
          Get a score, rejection reasons, and exactly how to fix it — in 30 seconds.
        </p>
      </div>

      {/* Main Card */}
      <div style={{
        width: '100%',
        maxWidth: 680,
        background: '#111',
        border: '1px solid #222',
        borderRadius: 16,
        padding: 32,
        boxShadow: '0 0 60px rgba(0,0,0,0.5)'
      }}>

        {/* Resume Input Toggle */}
        <div style={{ marginBottom: 24 }}>
          <div style={{
            display: 'flex',
            gap: 8,
            marginBottom: 16,
            background: '#1a1a1a',
            borderRadius: 10,
            padding: 4
          }}>
            {(['paste', 'upload'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => {
                  setInputMode(mode)
                  setResume('')
                  setUploadedFileName('')
                  setError('')
                }}
                style={{
                  flex: 1,
                  padding: '8px 0',
                  borderRadius: 8,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 500,
                  background: inputMode === mode ? '#2a2a2a' : 'transparent',
                  color: inputMode === mode ? '#fff' : '#666',
                  transition: 'all 0.2s'
                }}
              >
                {mode === 'paste' ? '📋 Paste Text' : '📄 Upload PDF'}
              </button>
            ))}
          </div>

          {inputMode === 'paste' ? (
            <textarea
              placeholder="Paste your resume here..."
              value={resume}
              onChange={e => setResume(e.target.value)}
              rows={10}
              style={{
                width: '100%',
                background: '#1a1a1a',
                border: '1px solid #2a2a2a',
                borderRadius: 10,
                padding: 16,
                color: '#ececec',
                fontSize: 14,
                lineHeight: 1.6,
                resize: 'vertical',
                fontFamily: 'inherit',
                boxSizing: 'border-box'
              }}
            />
          ) : (
            <div>
              <div
                onClick={() => !extracting && fileInputRef.current?.click()}
                style={{
                  border: '2px dashed #2a2a2a',
                  borderRadius: 10,
                  padding: '40px 20px',
                  textAlign: 'center',
                  cursor: extracting ? 'wait' : 'pointer',
                  background: '#1a1a1a'
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                {extracting ? (
                  <div>
                    <p style={{ fontSize: 32, marginBottom: 8 }}>⏳</p>
                    <p style={{ color: '#888', fontSize: 15 }}>
                      Reading your PDF...
                    </p>
                  </div>
                ) : uploadedFileName && resume ? (
                  <div>
                    <p style={{ color: '#4ade80', fontSize: 15, fontWeight: 500 }}>
                      ✓ {uploadedFileName}
                    </p>
                    <p style={{ color: '#555', fontSize: 13, marginTop: 4 }}>
                      {resume.length} characters extracted · Click to change
                    </p>
                  </div>
                ) : (
                  <div>
                    <p style={{ fontSize: 32, marginBottom: 8 }}>📄</p>
                    <p style={{ color: '#888', fontSize: 15 }}>
                      Click to upload your resume
                    </p>
                    <p style={{ color: '#555', fontSize: 13, marginTop: 4 }}>
                      PDF or TXT supported
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Job Description */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
            Job Description <span style={{ color: '#444' }}>(optional but improves accuracy)</span>
          </p>

          <div style={{
            display: 'flex',
            gap: 8,
            marginBottom: 12,
            background: '#1a1a1a',
            borderRadius: 10,
            padding: 4
          }}>
            {(['preset', 'custom'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setJdMode(mode)}
                style={{
                  flex: 1,
                  padding: '8px 0',
                  borderRadius: 8,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 500,
                  background: jdMode === mode ? '#2a2a2a' : 'transparent',
                  color: jdMode === mode ? '#fff' : '#666',
                  transition: 'all 0.2s'
                }}
              >
                {mode === 'preset' ? '🎯 Select Role' : '✏️ Custom JD'}
              </button>
            ))}
          </div>

          {jdMode === 'preset' ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: 8
            }}>
              {Object.keys(JD_PRESETS).map(role => (
                <button
                  key={role}
                  onClick={() => handleRoleSelect(role)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: '1px solid',
                    borderColor: selectedRole === role ? '#4ade80' : '#2a2a2a',
                    background: selectedRole === role ? '#0f2a1a' : '#1a1a1a',
                    color: selectedRole === role ? '#4ade80' : '#888',
                    fontSize: 13,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s'
                  }}
                >
                  {selectedRole === role ? '✓ ' : ''}{role}
                </button>
              ))}
            </div>
          ) : (
            <textarea
              placeholder="Paste the job description here..."
              value={jd}
              onChange={e => setJD(e.target.value)}
              rows={5}
              style={{
                width: '100%',
                background: '#1a1a1a',
                border: '1px solid #2a2a2a',
                borderRadius: 10,
                padding: 16,
                color: '#ececec',
                fontSize: 14,
                lineHeight: 1.6,
                resize: 'vertical',
                fontFamily: 'inherit',
                boxSizing: 'border-box'
              }}
            />
          )}
        </div>

        {/* Error */}
        {error && (
          <p style={{
            color: '#f87171',
            fontSize: 13,
            marginBottom: 16,
            padding: '10px 14px',
            background: '#2a1a1a',
            borderRadius: 8
          }}>
            {error}
          </p>
        )}

        {/* Analyze Button */}
        <button
          onClick={analyze}
          disabled={loading || !isReady || extracting}
          style={{
            width: '100%',
            padding: '14px 0',
            borderRadius: 10,
            border: 'none',
            background: isReady && !extracting
              ? 'linear-gradient(135deg, #4ade80, #22c55e)'
              : '#1a1a1a',
            color: isReady && !extracting ? '#000' : '#444',
            fontSize: 16,
            fontWeight: 600,
            cursor: isReady && !extracting ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s'
          }}
        >
          {loading ? 'Analyzing your resume...' : extracting ? 'Reading PDF...' : 'Analyze my resume →'}
        </button>

        {!isReady && !extracting && (
          <p style={{
            textAlign: 'center',
            color: '#444',
            fontSize: 13,
            marginTop: 12
          }}>
            {inputMode === 'paste'
              ? 'Paste your resume to get started'
              : 'Upload your resume to get started'}
          </p>
        )}
      </div>

      {/* Footer */}
      <p style={{ color: '#333', fontSize: 12, marginTop: 32, textAlign: 'center' }}>
        This tool scores resume strength and role alignment —
        not guaranteed selection in ATS systems like Workday.
      </p>
    </main>
  )
}