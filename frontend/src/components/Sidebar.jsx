import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Clock, Play, Box, HelpCircle, MessageSquare, ChevronDown, UserRound, Settings, LogOut } from "lucide-react";

export default function Sidebar({ page, setPage, session, logout, content, open }) {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <aside className="sidebar-modern">
      <div className="sidebar-top">
        <div className="logo-section" onClick={() => navigate("/")}>
          <img src="/Graspify_logo.png" alt="Graspify Logo" className="logo-img" />
          <span className="logo-text">Graspify</span>
        </div>
        
        <button className="add-content-btn" onClick={() => setPage("Dashboard")}>
          <Plus size={16} /> Add content
        </button>

        <div className="nav-menu">
          <button className={`nav-item ${page === "Search" ? "active" : ""}`} onClick={() => setPage("Search")}>
            <Search size={18} /> Search
          </button>
          <button className={`nav-item ${page === "History" ? "active" : ""}`} onClick={() => setPage("History")}>
            <Clock size={18} /> History
          </button>
          <button className={`nav-item ${page === "Analysis" ? "active" : ""}`} onClick={() => setPage("Analysis")}>
            <Box size={18} /> Analysis
          </button>
        </div>

        <div className="sidebar-section">
          <p className="section-title">Recents</p>
          <div className="nav-list">
            {content?.slice(0, 5).map((item) => (
              <button key={item.id} className="nav-subitem" onClick={() => open(item.id)}>
                <Play size={14} /> <span className="truncate">{item.title}</span>
              </button>
            ))}
            {(!content || content.length === 0) && (
              <span className="empty-text">No recent lessons</span>
            )}
            {content?.length > 5 && <button className="nav-more">... More</button>}
          </div>
        </div>
      </div>

      <div className="sidebar-bottom">
        <div className="nav-menu">
          <button className={`nav-item ${page === "Help" ? "active" : ""}`} onClick={() => setPage("Help")}><HelpCircle size={18} /> Help & Tools</button>
          <button className={`nav-item ${page === "Support" ? "active" : ""}`} onClick={() => setPage("Support")}><MessageSquare size={18} /> Support</button>
        </div>
        
        <div className="plan-badge">Free Plan</div>
        
        <div className="profile-dropdown" onClick={() => setShowDropdown(!showDropdown)} ref={dropdownRef} style={{ position: 'relative', cursor: 'pointer' }}>
          <div className="avatar" style={{ padding: session?.user?.avatarBase64 ? 0 : undefined, overflow: 'hidden' }}>
            {session?.user?.avatarBase64 ? (
              <img src={session.user.avatarBase64} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              session?.user?.avatarInitials
            )}
          </div>
          <span className="profile-name">{session?.user?.name?.toUpperCase()}</span>
          <ChevronDown size={16} className="dropdown-icon" style={{ transform: showDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          
          {showDropdown && (
            <div className="dropdown-menu" style={{ display: 'block', top: 'auto', bottom: 'calc(100% + 8px)', right: 0, minWidth: '180px', padding: '8px', zIndex: 50, border: '1px solid var(--border-color)', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)' }}>
               <button onClick={(event) => { event.stopPropagation(); setShowDropdown(false); setPage("Profile"); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontWeight: '600', padding: '10px 12px', borderRadius: '6px', cursor: 'pointer', border: 'none', background: 'transparent', width: '100%', textAlign: 'left', fontSize: '.88rem', transition: 'background 0.2s' }} onMouseEnter={(e)=>e.currentTarget.style.background = 'var(--bg-hover)'} onMouseLeave={(e)=>e.currentTarget.style.background='transparent'}>
                 <Settings size={16} /> Settings
               </button>
               <button onClick={(event) => { event.stopPropagation(); logout(); navigate("/login"); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', fontWeight: '600', padding: '10px 12px', borderRadius: '6px', cursor: 'pointer', border: 'none', background: 'transparent', width: '100%', textAlign: 'left', fontSize: '.88rem', transition: 'background 0.2s' }} onMouseEnter={(e)=>e.currentTarget.style.background='#fef2f2'} onMouseLeave={(e)=>e.currentTarget.style.background='transparent'}>
                 <LogOut size={16} /> Sign out
               </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

