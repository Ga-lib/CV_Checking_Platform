import { useState } from 'react'
import axios from 'axios'
import Navbar from '../components/Navbar'
import { Link } from 'react-router-dom'

function Candidate() {
  const [jobDescription, setJobDescription] = useState('')
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [error, setError] = useState(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleSubmit = async () => {
    if (!file) return setError('Please upload your CV.')
    setLoading(true)
    setError(null)
    const formData = new FormData()
    formData.append('cv', file)
    if (jobDescription.trim()) {
      formData.append('jobDescription', jobDescription)
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://cv-checking-platform.onrender.com'
      const response = await axios.post(`${apiUrl}/api/analyse`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setAnalysis(response.data.analysis)
    } catch (err) {
      const message = err.response?.data?.error || 'Analysis failed. Please check if the server is running.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') setIsDragging(true)
    else if (e.type === 'dragleave') setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'var(--success)'
    if (score >= 50) return 'var(--warning)'
    return 'var(--danger)'
  }

  return (
    <>
      <Navbar />
      <div className="page animate-fade">
        <Link to="/" className="back-link">← Back to Home</Link>

        <div className="section-label">Candidate Tool</div>
        <h1 className="page-title">CV Analysis & ATS Score</h1>
        <p className="page-subtitle">Upload your CV and optionally a job description to see how you rank and get AI-powered improvement tips.</p>

        <div className="card-grid-2" style={{ marginBottom: '32px', alignItems: 'start' }}>
          <div className="card animate-up">
            <div className="section-label">Step 1</div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '14px' }}>Target Job Description (Optional)</h3>
            <textarea
              className="textarea"
              rows={8}
              placeholder="Paste the job description you're applying for to get tailored feedback..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>

          <div className="card animate-up" style={{ animationDelay: '0.1s' }}>
            <div className="section-label">Step 2</div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '14px' }}>Upload Your CV</h3>
            <div 
              className={`upload-zone ${isDragging ? 'drag-active' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="upload-zone-icon">📄</div>
              <p>Drag & drop your PDF here</p>
              <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} />
              {file && (
                <div className="upload-selected">✅ {file.name}</div>
              )}
            </div>
            <button className="btn btn-primary btn-lg" onClick={handleSubmit} disabled={loading} style={{ width: '100%' }}>
              {loading ? <><span className="spinner" />Analysing...</> : '🚀 Analyse My CV →'}
            </button>
          </div>
        </div>

        {error && <div className="alert alert-error animate-up">❌ {error}</div>}

        {analysis && (
          <div className="animate-up">
            <div className="card-grid-2" style={{ marginBottom: '24px' }}>
              <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div className="gauge-container">
                  <svg className="gauge-svg" viewBox="0 0 100 60">
                    <path className="gauge-bg" d="M 10 50 A 40 40 0 0 1 90 50" />
                    <path 
                      className="gauge-fill" 
                      d="M 10 50 A 40 40 0 0 1 90 50" 
                      style={{ 
                        stroke: getScoreColor(analysis.ats_score),
                        strokeDasharray: `${(analysis.ats_score / 100) * 126}, 126` 
                      }} 
                    />
                  </svg>
                  <div className="gauge-text">
                    <span className="gauge-value">{analysis.ats_score}</span>
                    <span className="gauge-label">ATS Score</span>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="section-label">Overall Summary</div>
                <p style={{ fontSize: '15px', lineHeight: '1.7', color: 'var(--text-muted)' }}>{analysis.overall_summary}</p>
                {analysis.job_match_score !== undefined && (
                  <div style={{ marginTop: '20px', padding: '12px', background: 'var(--brand-light)', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--brand)' }}>Job Match Score</span>
                      <span style={{ fontSize: '18px', fontWeight: '800', color: 'var(--brand)' }}>{analysis.job_match_score}%</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="card-grid-2" style={{ marginBottom: '24px' }}>
              <div className="card">
                <div className="section-label">Detailed Breakdown</div>
                {Object.entries(analysis.score_breakdown).map(([key, value]) => (
                  <div className="progress-row" key={key}>
                    <div className="progress-meta">
                      <span>{key}</span>
                      <span>{value}/25</span>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${(value / 25) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="card">
                <div className="section-label">Formatting Feedback</div>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6' }}>{analysis.formatting_feedback}</p>
              </div>
            </div>

            <div className="card-grid-2" style={{ marginBottom: '24px' }}>
              <div className="card">
                <div className="section-label" style={{ color: 'var(--success)' }}>Strengths</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {analysis.strengths.map((s, i) => <span key={i} className="tag tag-success">{s}</span>)}
                </div>
              </div>
              <div className="card">
                <div className="section-label" style={{ color: 'var(--danger)' }}>Gaps & Weaknesses</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {analysis.weaknesses.map((w, i) => <span key={i} className="tag tag-danger">{w}</span>)}
                </div>
              </div>
            </div>

            <div className="card">
              <div className="section-label">Improvement Suggestions</div>
              <ul style={{ paddingLeft: '20px', color: 'var(--text-muted)', fontSize: '14px' }}>
                {analysis.improvement_suggestions.map((s, i) => (
                  <li key={i} style={{ marginBottom: '8px' }}>{s}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
      <footer className="footer">CVGenius © 2026 — AI-powered hiring intelligence</footer>
    </>
  )
}

export default Candidate
