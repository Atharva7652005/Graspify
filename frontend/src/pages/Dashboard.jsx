import { useState } from "react";
import { Upload, Link as LinkIcon, Clipboard, Mic, Plus, Box, ArrowUp } from "lucide-react";

export default function Dashboard({ content, upload, loading, open, session, onLearn }) { 
  const [activeModal, setActiveModal] = useState(null); // 'upload' | 'link'

  const handleUploadSubmit = (e) => {
    upload(e);
    setActiveModal(null);
  };

  return (
    <div className="dashboard-modern">

      <main className="dashboard-content">
        <h1 className="hero-title">What should we learn, {session?.user?.name?.toUpperCase().split(" ")[0]}?</h1>
        
        <div className="action-cards">
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
              <span className="sort-dropdown">All ⌄</span>
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
                    <p>{item.sourceType === "youtube_url" ? "YouTube" : "Media"} · {item.language}</p>
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
        <div className="modal-backdrop">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setActiveModal(null)}>×</button>
            <h2>{activeModal === 'upload' ? 'Upload Media' : 'Link YouTube URL'}</h2>
            <form onSubmit={handleUploadSubmit} className="modal-form">
              <label>Lesson title
                <input name="title" placeholder="e.g. Introduction to SQL" required />
              </label>
              
              {activeModal === 'upload' ? (
                <label className="file-picker">Choose audio or video
                  <input name="file" type="file" accept="audio/*,video/*" required />
                </label>
              ) : (
                <label>YouTube URL
                  <input name="youtubeUrl" type="url" placeholder="https://youtube.com/watch?v=..." required />
                </label>
              )}
              <label className="check"><input name="translate" type="checkbox" /> Translate to English</label>
              
              <button className="primary" disabled={loading}>
                {loading ? "Processing..." : "Create learning material"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ClockIcon() { return <Clock size={16} />; }
import { Clock, Play as PlayIcon } from "lucide-react";
