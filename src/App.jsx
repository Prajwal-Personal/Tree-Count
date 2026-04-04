import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Upload from './pages/Upload';
import Explore from './pages/Explore';
import TreeProfile from './pages/TreeProfile';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import './App.css';

export default function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/tree/:slug" element={<TreeProfile />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
        <footer className="footer">
          <div className="container">
            <p>🌱 TreeVault — Smart Tree Intelligence System</p>
            <p style={{ marginTop: '4px', fontSize: '0.75rem' }}>
              Transforming raw observations into structured scientific knowledge
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}
