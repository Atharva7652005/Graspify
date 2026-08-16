import { useNavigate } from "react-router-dom";
import { ArrowRight, Play, BookOpen, BrainCircuit } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();
  return (
    <div className="landing-modern">
      <nav className="landing-nav">
        <div className="logo-section">
          <img src="/Graspify_logo.png" alt="Graspify Logo" className="logo-img" />
          <span className="logo-text">Graspify</span>
        </div>
        <div className="nav-actions">
          <button className="btn-ghost" onClick={() => navigate("/login")}>Log in</button>
          <button className="btn-primary" onClick={() => navigate("/register")}>Sign up free</button>
        </div>
      </nav>

      <main className="landing-hero">
        <div className="hero-content">
          <div className="hero-badge">✨ AI-Powered Learning</div>
          <h1 className="hero-headline">Turn every lecture into learning you can <span className="highlight-text">truly grasp.</span></h1>
          <p className="hero-subtitle">
            Transcripts, structured notes, grounded answers, meaningful practice, and progress you can act on.
          </p>
          <div className="hero-cta-group">
            <button className="btn-primary btn-large" onClick={() => navigate("/register")}>
              Get Started <ArrowRight size={20} />
            </button>
            <button className="btn-secondary btn-large" onClick={() => navigate("/login")}>
              View Demo
            </button>
          </div>
        </div>
      </main>
      
      <section className="landing-features">
        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon-wrapper"><Play size={24} /></div>
            <h3>Multilingual Audio/Video</h3>
            <p>Upload a file or paste a YouTube URL and get an instant transcript.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon-wrapper"><BookOpen size={24} /></div>
            <h3>Structured Notes</h3>
            <p>Automatically turn hours of lecture into concise, structured study material.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon-wrapper"><BrainCircuit size={24} /></div>
            <h3>Concept Quizzes</h3>
            <p>Test your knowledge and get real-time feedback on weak areas.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
