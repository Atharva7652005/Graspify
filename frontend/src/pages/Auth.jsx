import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../api";
import { Mail, Lock, User, ArrowRight } from "lucide-react";

export default function Auth({ onAuthenticated }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mode, setMode] = useState(location.pathname === "/register" ? "register" : "login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMode(location.pathname === "/register" ? "register" : "login");
  }, [location.pathname]);

  async function submit(event) {
    event.preventDefault(); setError(""); setLoading(true);
    try {
      const result = await api(`/auth/${mode === "login" ? "login" : "register"}`, { method: "POST", body: form });
      localStorage.setItem("graspify_token", result.token); 
      onAuthenticated(result);
      navigate("/app");
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  }

  return (
    <div className="auth-modern">
      <div className="auth-left">
        <div className="auth-brand" onClick={() => navigate("/")}>
          <img src="/Graspify_logo.png" alt="Graspify" className="auth-logo" />
          <span>Graspify</span>
        </div>
        <div className="auth-hero-text">
          <h1>Turn every lecture into learning you can truly grasp.</h1>
          <p>Transcripts, structured notes, grounded answers, meaningful practice, and progress you can act on.</p>
        </div>
        <div className="auth-features">
          <div className="feature-item">
            <div className="feature-icon">🎙️</div>
            <div>
              <h3>Multilingual transcripts</h3>
              <p>Upload video/audio or link a YouTube video.</p>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🤖</div>
            <div>
              <h3>RAG-powered tutor</h3>
              <p>Chat directly with the transcript material.</p>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">📈</div>
            <div>
              <h3>Concept-based insights</h3>
              <p>Identify weak areas through AI quizzes.</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="auth-right">
        <div className="auth-card-modern">
          <div className="auth-header">
            <h2>{mode === "login" ? "Welcome back" : "Create your workspace"}</h2>
            <p>{mode === "login" ? "Sign in to continue your learning journey." : "Start turning lectures into learning material."}</p>
          </div>
          
          <form className="auth-form" onSubmit={submit}>
            {mode === "register" && (
              <div className="input-group">
                <label>Full Name</label>
                <div className="input-wrapper">
                  <User size={18} className="input-icon" />
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Doe" />
                </div>
              </div>
            )}
            
            <div className="input-group">
              <label>Email Address</label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
              </div>
            </div>
            
            <div className="input-group">
              <label>Password</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input required minLength="8" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="At least 8 characters" />
              </div>
            </div>
            
            {error && <div className="auth-error">{error}</div>}
            
            <button className="auth-submit-btn" disabled={loading}>
              {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
              <ArrowRight size={18} />
            </button>
          </form>
          
          <div className="auth-switch">
            <button onClick={() => navigate(mode === "login" ? "/register" : "/login")}>
              {mode === "login" ? "New to Graspify? Create an account" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
