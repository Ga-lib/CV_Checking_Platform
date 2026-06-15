import { useState } from 'react'
import axios from 'axios'
import Navbar from '../components/Navbar'
import { Link } from 'react-router-dom'

function Candidate() {
  const [file, setFile] = useState(null)
  const [jobDescription, setJobDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleUpload = async () => {
    if (!file) return setError('Please select a PDF file first.')
    setLoading(true)
    setError(null)
    const formData = new FormData()
    formData.append('cv', file)
    if (jobDescription.trim()) {
      formData.append('jobDescription', jobDescription)
    }
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://cv-checking-platform.onrender.com'
      const response = await axios.post(`${apiUrl}/analyse`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setResult(response.data.analysis)
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

  const Gauge = ({ score, label, color }) => {
    const radius = 70
    const circumference = Math.PI * radius
    const offset = circumference - (score / 100) * circumference
    return (
      <div className="gauge-container">
        <svg className="gauge-svg" viewBox="0 0 160 100">
          <path className="gauge-bg" d="M 10 90 A 70 70 0 0 1 150 90" />
          <path className="gauge-fill" d="M 10 90 A 70 70 0 0 1 150 90" 
                style={{ stroke: color, strokeDasharray: circumference, strokeDashoffset: offset }} />
        </svg>
        <div className="gauge-text">
          <span className="gauge-value" style={{ color }}>{score}</span>
          <span className="gauge-label">{label}</span>
        </div>
      </div>
    )
  }

  const scoreColor = (s) => s >= 75 ? 'var(--success)' : s >= 50 ? 'var(--warning)' : 'var(--danger)'

  return (
    <>
      <Navbar />
      <div className="page animate-fade">

        <Link to="/" className="back-link">← Back to Home</Link>

        <div className="section-label">Candidate Tool</div>
        <h1 className="page-title">CV Analysis</h1>
        <p className="page-subtitle">Upload your CV and get a professional AI analysis with targeted job matching.</p>

        {/* Step 1: Optional JD */}
        <div className="card animate-up" style={{ marginBottom: '24px' }}>
          <div className="section-label">Step 1 (Optional)</div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '14px' }}>Target Job Description</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Paste the job description you're applying for to get a custom Match Score.
          </p>
          <textarea
            className="textarea"
            rows={4}
            placeholder="Paste job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
        </div>

        {/* Step 2: Upload */}
        <div className="card animate-up" style={{ marginBottom: '32px', animationDelay: '0.1s' }}>
          <div className="section-label">{jobDescription.trim() ? 'Step 2' : 'Step 1'}</div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '14px' }}>Upload your CV</h3>
          <div 
            className={`upload-zone ${isDragging ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="upload-zone-icon">📄</div>
            <p>Drag and drop your PDF here, or click to browse</p>
            <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} />
            {file && <div className="upload-selected">✅ {file.name} ready</div>}
          </div>

          <button className="btn btn-primary btn-lg" onClick={handleUpload} disabled={loading} style={{ width: '100%' }}>
            {loading ? <><span className="spinner" />Analysing...</> : 'Analyse My CV →'}
          </button>
        </div>

        {error && <div className="alert alert-error animate-up">❌ {error}</div>}

        {result && (
          <div className="animate-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Analysis Results</h2>
              <button className="btn btn-outline btn-sm" onClick={() => window.print()}>💾 Save Report</button>
            </div>

            {/* Scores */}
            <div className="card-grid-2" style={{ marginBottom: '24px' }}>
              <div className="card" style={{ textAlign: 'center' }}>
                <Gauge score={result.ats_score} label="ATS Score" color={scoreColor(result.ats_score)} />
              </div>
              {result.job_match_score !== undefined && (
                <div className="card" style={{ textAlign: 'center', border: '2px solid var(--brand)' }}>
                  <Gauge score={result.job_match_score} label="Job Match" color="var(--brand)" />
                </div>
              )}
            </div>

            <div className="card" style={{ marginBottom: '24px' }}>
              <div className="section-label">Summary</div>
              <p style={{ fontSize: '15px', color: 'var(--text)', lineHeight: '1.7' }}>{result.overall_summary}</p>
            </div>

            {/* Score Breakdown */}
            <div className="card" style={{ marginBottom: '24px' }}>
              <div className="section-label">Score Breakdown</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginTop: '10px' }}>
                {Object.entries(result.score_breakdown).map(([key, value]) => (
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
            </div>

            {/* Strengths & Weaknesses */}
            <div className="card-grid-2" style={{ marginBottom: '24px' }}>
              <div className="card">
                <div className="section-label" style={{ color: 'var(--success)' }}>Strengths</div>
                {result.strengths.map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px', fontSize: '14px' }}>
                    <span style={{ color: 'var(--success)' }}>✦</span><span>{s}</span>
                  </div>
                ))}
              </div>
              <div className="card">
                <div className="section-label" style={{ color: 'var(--danger)' }}>Weaknesses</div>
                {result.weaknesses.map((w, i) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px', fontSize: '14px' }}>
                    <span style={{ color: 'var(--danger)' }}>✦</span><span>{w}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ marginBottom: '24px' }}>
              <div className="section-label">Missing Skills</div>
              <div style={{ marginTop: '10px' }}>
                {result.missing_skills.map((s, i) => <span key={i} className="tag tag-danger">{s}</span>)}
              </div>
            </div>

            <div className="card" style={{ marginBottom: '24px' }}>
              <div className="section-label">Formatting</div>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '8px' }}>{result.formatting_feedback}</p>
            </div>

            <div className="card" style={{ background: 'var(--brand-light)', borderColor: 'var(--brand)' }}>
              <div className="section-label">Improvement Plan</div>
              {result.improvement_suggestions.map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '14px', fontSize: '14px', lineHeight: '1.6' }}>
                  <span style={{ background: 'var(--brand)', color: 'white', minWidth: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '800' }}>{i + 1}</span>
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <footer className="footer">CVGenius © 2026 — AI-powered hiring intelligence</footer>
    </>
  )
}

export default Candidate