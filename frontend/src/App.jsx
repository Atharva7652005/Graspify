import { useEffect, useMemo, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { api } from "./api";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Lesson from "./pages/Lesson";
import History from "./pages/History";
import Analysis from "./pages/Analysis";
import Profile from "./pages/Profile";
import HelpTools from "./pages/HelpTools";
import Support from "./pages/Support";
import Search from "./pages/Search";
import LearnChat from "./pages/LearnChat";
import PlanPricing from "./pages/PlanPricing";
import Sidebar from "./components/Sidebar";
import { Info, X } from "lucide-react";

function MainApp() {
  const [session, setSession] = useState(() => ({ token: localStorage.getItem("graspify_token"), user: null }));
  const [isInitializing, setIsInitializing] = useState(true);
  const [page, setPage] = useState("Dashboard");
  const [content, setContent] = useState([]);
  const [selected, setSelected] = useState(null);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [learnQuery, setLearnQuery] = useState("");
  const token = session.token;
  
  const current = useMemo(() => content.find((item) => item.id === selected) || null, [content, selected]);
  
  const refreshContent = async () => { 
    if(!token) return;
    const result = await api("/learning/content", { token }); 
    setContent(result.content); 
  };
  
  useEffect(() => { 
    if (!token) {
      setIsInitializing(false);
      return; 
    }
    api("/auth/me", { token })
      .then((result) => setSession((old) => ({ ...old, user: result.user })))
      .catch(() => { 
        localStorage.removeItem("graspify_token"); 
        setSession({ token: null, user: null }); 
      })
      .finally(() => setIsInitializing(false));
    
    refreshContent().catch((err) => setNotice(err.message)); 
  }, [token]);
  
  function saveContent(item) { 
    setContent((old) => [item, ...old.filter((currentItem) => currentItem.id !== item.id)]); 
    setSelected(item.id); 
  }
  
  async function upload(event) {
    event.preventDefault(); 
    const form = new FormData(event.currentTarget); 
    const youtubeUrl = form.get("youtubeUrl")?.trim();
    if (!form.get("file")?.name && !youtubeUrl) return setNotice("Choose an audio/video file or provide a YouTube URL.");
    setLoading(true); setNotice("Creating your transcript. This can take a little while for longer media.");
    try {
      const body = form.get("file")?.name ? form : { youtubeUrl, title: form.get("title") };
      const result = await api("/learning/transcript", { token, method: "POST", body }); 
      saveContent(result.content); setPage("Lesson"); setNotice("Learning material is ready. Generate a summary or ask your first question.");
    } catch (err) { setNotice(err.message); } finally { setLoading(false); }
  }
  
  async function generateSummary() { 
    if (!current) return; setLoading(true); 
    try { 
      const result = await api(`/learning/content/${current.id}/summary`, { token, method: "POST" }); 
      saveContent({ ...current, summary: result.summary }); 
    } catch (err) { setNotice(err.message); } finally { setLoading(false); } 
  }
  
  async function generateQuiz() { 
    if (!current) return; setLoading(true); 
    try { 
      const result = await api(`/learning/content/${current.id}/quiz`, { token, method: "POST" }); 
      saveContent({ ...current, quiz: { quizId: result.quiz_id, questions: result.questions } }); 
    } catch (err) { setNotice(err.message); } finally { setLoading(false); } 
  }
  
  async function deleteContent(id) {
    if (!id) return;
    try {
      await api(`/learning/content/${id}`, { token, method: "DELETE" });
      setContent((old) => old.filter(item => item.id !== id));
      if (selected === id) { setSelected(null); setPage("Dashboard"); }
      setNotice("Learning material deleted.");
    } catch (err) { setNotice(err.message); }
  }

  const logout = () => { localStorage.removeItem("graspify_token"); setSession({ token: null, user: null }); setContent([]); window.location.href = "/"; };

  if (isInitializing) {
    return <div className="flex h-screen justify-center items-center text-slate-500 font-medium">Loading your workspace...</div>;
  }

  if (!token || !session.user) {
    return <Navigate to="/login" replace />;
  }

  const openLesson = (id) => { 
    setSelected(id); 
    setPage("Lesson"); 
  };

  return (
    <div className="shell flex h-screen overflow-hidden">
      <Sidebar page={page} setPage={setPage} session={session} logout={logout} content={content} open={openLesson} />
      <main className="workspace flex-1 overflow-y-auto relative min-h-0 h-full">
        
        {notice && (
          <div className="fixed top-4 right-4 max-w-sm card-modern p-4 flex items-start gap-3 z-50 animate-in slide-in-from-top-2" style={{ boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}>
            <Info className="text-blue-600 mt-0.5 shrink-0" size={20} />
            <p className="text-sm font-medium text-slate-700 leading-relaxed pr-6">{notice}</p>
            <button onClick={() => setNotice("")} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
              <X size={16} />
            </button>
          </div>
        )}
        
        {page === "Dashboard" && <Dashboard content={content} upload={upload} loading={loading} session={session} open={(id) => { setSelected(id); setPage("Lesson"); }} onLearn={(query) => { setLearnQuery(query); setPage("Learn"); }} />}
        {page === "Lesson" && <Lesson current={current} loading={loading} onSummary={generateSummary} onQuiz={generateQuiz} onNotice={setNotice} token={token} saveContent={saveContent} activePlan={session?.user?.activePlan || "Free"} />}
        {page === "History" && <History content={content} open={openLesson} />}
        {page === "Analysis" && <Analysis content={content} open={openLesson} session={session} token={token} setPage={setPage} />}
        {page === "Profile" && <Profile session={session} content={content} onUserUpdate={(user) => setSession((old) => ({ ...old, user }))} onNotice={setNotice} onDeleteContent={deleteContent} openLesson={openLesson} logout={logout} />}
        {page === "Help" && <HelpTools />}
        {page === "Support" && <Support />}
        {page === "Search" && <Search content={content} open={(id) => { setSelected(id); setPage("Lesson"); }} close={() => setPage("Dashboard")} />}
        {page === "Learn" && <LearnChat content={content} token={token} initialQuery={learnQuery} onBack={() => setPage("Dashboard")} onNotice={setNotice} activePlan={session?.user?.activePlan || "Free"} />}
        {page === "PlanPricing" && <PlanPricing session={session} onUserUpdate={(user) => setSession((old) => ({ ...old, user }))} />}
      </main>
    </div>
  );
}

export default function App() {
  const token = localStorage.getItem("graspify_token");
  const handleAuthenticated = (result) => {};

  return (
    <Router>
      <Routes>
        <Route path="/" element={token ? <Navigate to="/app" replace /> : <Landing />} />
        <Route path="/login" element={token ? <Navigate to="/app" replace /> : <Auth onAuthenticated={handleAuthenticated} />} />
        <Route path="/register" element={token ? <Navigate to="/app" replace /> : <Auth onAuthenticated={handleAuthenticated} />} />
        <Route path="/app/*" element={<MainApp />} />
      </Routes>
    </Router>
  );
}
