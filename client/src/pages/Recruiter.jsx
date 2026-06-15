import { useState } from 'react'
import axios from 'axios'
import Navbar from '../components/Navbar'
import { Link } from 'react-router-dom'

function Recruiter() {
  const [jobDescription, setJobDescription] = useState('')
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([])
  const [error, setError] = useState(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleSubmit = async () => {
    if (!jobDescription.trim()) return setError('Please enter a job description.')
    if (files.length === 0) return setError('Please upload at least one CV.')
    setLoading(true)
    setError(null)
    const formData = new FormData()
    formData.append('jobDescription', jobDescription)
    Array.from(files).forEach(file => formData.append('cvs', file))
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
      const response = await axios.post(`${apiUrl}/recruiter`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setResults(response.data.results)
    } catch (err) {
      const message = err.response?.data?.error || 'Ranking failed. Please check if the server is running.'
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
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles(e.dataTransfer.files)
    }
  }

  const exportCSV = () => {
    if (results.length === 0) return
    const headers = ['Rank', 'Filename', 'Match Score', 'Reasoning', 'Matching Skills', 'Missing Skills']
    const rows = results.map((c, i) => [
      i + 1,
      c.filename,
      `${c.match_score}%`,
      `"${c.reasoning.replace(/"/g, '""')}"`,
      `"${c.matching_skills.join(', ')}"`,
      `"${c.missing_skills.join(', ')}"`
    ])
    const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', 'candidate_rankings.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const scoreColor = (s) => s >= 75 ? 'var(--success)' : s >= 50 ? 'var(--warning)' : 'var(--danger)'

  return (
    <>
      <Navbar />
      <div className="page animate-fade">

        <Link to="/" className="back-link">← Back to Home</Link>

        <div className="section-label">Recruiter Tool</div>
        <h1 className="page-title">Candidate Ranking</h1>
        <p className="page-subtitle">Paste a job description and upload multiple CVs to get AI-ranked candidates with transparent reasoning.</p>

        <div className="card-grid-2" style={{ marginBottom: '32px', alignItems: 'start' }}>
          {/* Step 1 */}
          <div className="card animate-up">
            <div className="section-label">Step 1</div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '14px' }}>Job Description</h3>
            <textarea
              className="textarea"
              rows={8}
              placeholder="Paste the full job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>

          {/* Step 2 */}
          <div className="card animate-up" style={{ animationDelay: '0.1s' }}>
            <div className="section-label">Step 2</div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '14px' }}>Upload Candidate CVs</h3>
            <div 
              className={`upload-zone ${isDragging ? 'drag-active' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              style={{ padding: '30px' }}
            >
              <div className="upload-zone-icon">📂</div>
              <p>Drag & drop multiple PDFs here</p>
              <input type="file" accept=".pdf" multiple onChange={(e) => setFiles(e.target.files)} />
              {files.length > 0 && (
                <div className="upload-selected">✅ {files.length} CVs selected</div>
              )}
            </div>
            <button className="btn btn-primary btn-lg" onClick={handleSubmit} disabled={loading} style={{ width: '100%' }}>
              {loading ? <><span className="spinner" />Ranking...</> : '🏆 Rank Candidates →'}
            </button>
          </div>
        </div>

        {error && <div className="alert alert-error animate-up">❌ {error}</div>}

        {/* Results */}
        {results.length > 0 && (
          <div className="animate-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <div className="section-label">Ranking Results</div>
                <h2 style={{ fontSize: '24px', fontWeight: '800' }}>{results.length} Candidates Scored</h2>
              </div>
              <button className="btn btn-outline btn-sm" onClick={exportCSV}>📊 Export CSV</button>
            </div>

            {results.map((c, i) => (
              <div className={`rank-card ${i === 0 ? 'top' : ''}`} key={i}>
                <div className="rank-header">
                  <div className="rank-left">
                    <div className="rank-number">#{i + 1}</div>
                    <div>
                      <div className="rank-name">{c.filename}</div>
                      {i === 0 && <span className="top-badge">⭐ Best Fit</span>}
                    </div>
                  </div>
                  <div className="rank-score" style={{ color: scoreColor(c.match_score) }}>
                    {c.match_score}%
                  </div>
                </div>

                <div className="card" style={{ background: 'rgba(0,0,0,0.02)', padding: '20px', border: 'none', marginBottom: '20px' }}>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.7' }}>
                    <strong style={{ color: 'var(--text)' }}>AI Analysis: </strong>{c.reasoning}
                  </p>
                </div>

                <div className="card-grid-2">
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--success)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Matching Skills</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                      {c.matching_skills.map((s, j) => <span key={j} className="tag tag-success">{s}</span>)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--danger)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Skill Gaps</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                      {c.missing_skills.map((s, j) => <span key={j} className="tag tag-danger">{s}</span>)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <footer className="footer">CVGenius © 2026 — AI-powered hiring intelligence</footer>
    </>
  )
}

export default Recruiter
