import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">CV<span>Genius</span></Link>
      <div className="navbar-links">
        <Link to="/candidate">
          <button className="nav-btn nav-btn-ghost">For Candidates</button>
        </Link>
        <Link to="/recruiter">
          <button className="nav-btn nav-btn-primary">For Recruiters</button>
        </Link>
      </div>
    </nav>
  )
}

export default Navbar