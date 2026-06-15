import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Candidate from './pages/Candidate'
import Recruiter from './pages/Recruiter'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/candidate" element={<Candidate />} />
        <Route path="/recruiter" element={<Recruiter />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App