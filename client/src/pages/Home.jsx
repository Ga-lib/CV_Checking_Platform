import Navbar from '../components/Navbar'
import { Link } from 'react-router-dom'

function Home() {
  return (
    <>
      <Navbar />
      <div className="page animate-fade">

        {/* Hero */}
        <div className="hero">
          <div className="hero-badge animate-up">🚀 AI-Powered Hiring Intelligence</div>
          <h1 className="animate-up" style={{ animationDelay: '0.1s' }}>Your CV.<br /><span>Analysed. Optimised.</span></h1>
          <p className="animate-up" style={{ animationDelay: '0.2s' }}>Get an instant ATS score, detailed feedback, and AI-powered suggestions — built for candidates and recruiters.</p>
          <div className="hero-ctas animate-up" style={{ animationDelay: '0.3s' }}>
            <Link to="/candidate">
              <button className="btn btn-primary btn-lg">Analyse My CV →</button>
            </Link>
            <Link to="/recruiter">
              <button className="btn btn-outline btn-lg">Rank Candidates →</button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="card-grid-3 animate-up" style={{ marginBottom: '64px', animationDelay: '0.4s' }}>
          {[
            { icon: '📊', title: 'ATS Score Breakdown', desc: 'See exactly how your CV scores on formatting, keywords, experience, and skills with a clear numeric breakdown.' },
            { icon: '🎯', title: 'Job Match Testing', desc: 'Paste any job description and instantly see how well your CV matches the role before you apply.' },
            { icon: '🏆', title: 'Candidate Ranking', desc: 'Recruiters upload multiple CVs and get AI-ranked candidates with transparent reasoning for every score.' }
          ].map((f, i) => (
            <div className="card feature-card card-hover" key={i}>
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Persona split */}
        <div className="card-grid-2 animate-up" style={{ animationDelay: '0.5s' }}>
          <div className="card card-hover" style={{ borderTop: '4px solid var(--brand)' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>👤</div>
            <div className="section-label">For Candidates</div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '12px' }}>Get hired faster</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '24px' }}>Upload your CV and receive a full ATS analysis with actionable improvement suggestions tailored to your target role.</p>
            <Link to="/candidate">
              <button className="btn btn-primary" style={{ width: '100%' }}>Analyse My CV →</button>
            </Link>
          </div>
          <div className="card card-hover" style={{ borderTop: '4px solid var(--brand)' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>🏢</div>
            <div className="section-label">For Recruiters</div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '12px' }}>Hire with clarity</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '24px' }}>Upload a job description and multiple CVs. Get ranked candidates with AI reasoning explaining every decision.</p>
            <Link to="/recruiter">
              <button className="btn btn-outline" style={{ width: '100%' }}>Rank Candidates →</button>
            </Link>
          </div>
        </div>

      </div>
      <footer className="footer">CVGenius © 2026 — AI-powered hiring intelligence</footer>
    </>
  )
}

export default Home
