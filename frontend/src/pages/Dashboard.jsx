import { useState } from "react";
import { Upload, Link as LinkIcon, FileText, ArrowUp, Sparkles, AlertCircle } from "lucide-react";
import { api } from "../api";
import { Play as PlayIcon } from "lucide-react";

export default function Dashboard({ content, upload, loading, open, session, onLearn, setTranslatedDoc, setPage }) { 
  const [activeModal, setActiveModal] = useState(null); // 'upload' | 'link' | 'document' | 'upgrade'
  const [docLoading, setDocLoading] = useState(false);
  const [docError, setDocError] = useState("");

  const handleUploadSubmit = (e) => {
    upload(e);
    setActiveModal(null);
  };

  const handleDocumentSubmit = async (e) => {
    e.preventDefault();
    setDocError("");
    const formData = new FormData(e.target);
    const file = formData.get("file");
    const targetLanguage = formData.get("target_language");
    
    if (!file || !targetLanguage) {
      setDocError("Please provide both a file and a target language.");
      return;
    }

    setDocLoading(true);
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("target_language", targetLanguage);

      const result = await api("/learning/translate/document", {
        method: "POST",
        body: data,
        token: session.token
      });

      setTranslatedDoc(result);
      setPage("DocumentPreview");
      setActiveModal(null);
    } catch (err) {
      setDocError(err.message || "Failed to translate document.");
    } finally {
      setDocLoading(false);
    }
  };

  const activePlan = session?.user?.activePlan || "Free";

  const handleDocumentClick = () => {
    if (activePlan === 'Premium') {
      setActiveModal('document');
    } else {
      setActiveModal('upgrade');
    }
  };

  return (
    <div className="dashboard-modern animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-both">

      <main className="dashboard-content">
        <h1 className="hero-title">What should we learn, {session?.user?.name?.toUpperCase().split(" ")[0] || "User"}?</h1>
        
        <div className="action-cards grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button className="action-card" onClick={() => setActiveModal('upload')}>
            <div className="popular-badge">Popular</div>
            <div className="card-icon"><Upload size={24} /></div>
            <h3>Upload</h3>
            <p>File, audio, video</p>
          </button>
          
          <button className="action-card" onClick={() => setActiveModal('link')}>
            <div className="card-icon"><LinkIcon size={24} /></div>
            <h3>Link</h3>
            <p>YouTube, Website</p>
          </button>

          <button className="action-card relative border-2 border-transparent hover:border-amber-400 transition-all duration-300 overflow-hidden" onClick={handleDocumentClick}>
            <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-400 to-amber-600 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg shadow-sm flex items-center gap-1">
              <Sparkles size={10} />
              PREMIUM
            </div>
            <div className="card-icon text-amber-500"><FileText size={24} /></div>
            <h3>Document</h3>
            <p>Translate PPTX / DOCX</p>
          </button>
        </div>

        <form className="search-palette" onSubmit={(event) => { event.preventDefault(); const query = new FormData(event.currentTarget).get("learnQuery")?.trim(); if (query) onLearn(query); }}>
          <input name="learnQuery" type="text" placeholder="Learn anything with your lesson library" className="palette-input" />
          <button className="palette-submit" aria-label="Ask Learn Anything">
            <ArrowUp size={20} />
          </button>
        </form>

        <div className="sections-grid">
          <section className="dashboard-section">
            <div className="section-header-flex">
              <h2>Recents</h2>
              <span className="sort-dropdown">All &#x25BC;</span>
              <button className="view-all" onClick={() => open("History")}>View all</button>
            </div>
            <div className="recent-list">
              {content.length ? content.slice(0, 5).map((item) => (
                <button 
                  key={item.id} 
                  className="recent-item" onClick={() => open(item.id)}>
                  <div className="recent-icon"><PlayIcon /></div>
                  <div className="recent-details">
                    <h4>{item.title}</h4>
                    <p>{item.sourceType === "youtube_url" ? "YouTube" : "Media"} &bull; {item.language}</p>
                  </div>
                </button>
              )) : (
                <div className="empty-state">No recent lessons. Start by uploading content.</div>
              )}
            </div>
          </section>
        </div>
      </main>

      {activeModal && (
        <div className="modal-backdrop z-50">
          <div className="modal-content relative">
            <button className="modal-close absolute top-4 right-4 text-slate-400 hover:text-slate-600" onClick={() => { setActiveModal(null); setDocError(""); }}>
              <XIcon />
            </button>
            
            {activeModal === 'upgrade' && (
              <div className="flex flex-col items-center text-center p-6">
                <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
                  <Sparkles size={32} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Premium Feature</h2>
                <p className="text-slate-500 mb-6">Document translation is exclusively available for Premium members. Upgrade to translate PowerPoint files instantly with exact styling.</p>
                <button onClick={() => setPage("PlanPricing")} className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-amber-200 transition-colors">
                  View Plans
                </button>
              </div>
            )}

            {activeModal === 'document' && (
                <div className="p-2">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <FileText className="text-amber-500" size={24} />
                      Translate Document
                    </h2>
                    <div className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                      {(session?.user?.docUploadsToday?.count || 0)} / 1 Used Today
                    </div>
                  </div>
                  
                  {docError && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 text-sm border border-red-100">
                      <AlertCircle size={16} className="flex-shrink-0" />
                      <span>{docError}</span>
                    </div>
                  )}
                  
                  <form onSubmit={handleDocumentSubmit} className="flex flex-col gap-5">
                    <label className="flex flex-col gap-2">
                      <span className="font-semibold text-sm text-slate-700">Choose .pptx or .docx file</span>
                      <input name="file" type="file" accept=".pptx,.docx" required className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                    </label>
  
                    <label className="flex flex-col gap-2">
                      <span className="font-semibold text-sm text-slate-700">Target Language</span>
                      <select name="target_language" required defaultValue="English" className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                        <option value="English">English</option>
                        <optgroup label="Indian Languages">
                          <option value="Hindi">Hindi</option>
                          <option value="Marathi">Marathi</option>
                          <option value="Tamil">Tamil</option>
                          <option value="Telugu">Telugu</option>
                          <option value="Kannada">Kannada</option>
                          <option value="Bengali">Bengali</option>
                          <option value="Gujarati">Gujarati</option>
                          <option value="Punjabi">Punjabi</option>
                          <option value="Malayalam">Malayalam</option>
                          <option value="Odia">Odia</option>
                        </optgroup>
                        <optgroup label="Global Languages">
                          <option value="Chinese">Chinese</option>
                          <option value="Japanese">Japanese</option>
                          <option value="French">French</option>
                          <option value="Spanish">Spanish</option>
                          <option value="German">German</option>
                        </optgroup>
                      </select>
                    </label>
                    
                    <button type="submit" disabled={docLoading || (session?.user?.docUploadsToday?.count >= 1)} className="mt-2 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl shadow-sm transition-colors flex justify-center items-center gap-2">
                      {docLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Translating...
                        </>
                      ) : (
                        "Translate Document"
                      )}
                    </button>
                  <p className="text-xs text-center text-slate-400">Powered by GPT-5.6-Sol</p>
                </form>
              </div>
            )}

            {(activeModal === 'upload' || activeModal === 'link') && (
              <div className="p-2">
                <h2 className="text-xl font-bold text-slate-900 mb-6">{activeModal === 'upload' ? 'Upload Media' : 'Link YouTube URL'}</h2>
                <form onSubmit={handleUploadSubmit} className="flex flex-col gap-5">
                  <label className="flex flex-col gap-2">
                    <span className="font-semibold text-sm text-slate-700">Lesson title</span>
                    <input name="title" placeholder="e.g. Introduction to SQL" required className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </label>
                  
                  {activeModal === 'upload' ? (
                    <label className="flex flex-col gap-2">
                      <span className="font-semibold text-sm text-slate-700">Choose audio or video</span>
                      <input name="file" type="file" accept="audio/*,video/*" required className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                    </label>
                  ) : (
                    <label className="flex flex-col gap-2">
                      <span className="font-semibold text-sm text-slate-700">YouTube URL</span>
                      <input name="youtubeUrl" type="url" placeholder="https://youtube.com/watch?v=..." required className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </label>
                  )}
                  
                  <button className="mt-2 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl shadow-sm transition-colors" disabled={loading}>
                    {loading ? "Processing..." : "Create learning material"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


function XIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>; }


