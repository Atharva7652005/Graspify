import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Clock, Play, Box, HelpCircle, MessageSquare, ChevronDown, UserRound, Settings, LogOut, CreditCard } from "lucide-react";

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
        <div className="logo-section" onClick={() => navigate("/")} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
          <img src="/logo.png" alt="Graspify Logo" className="logo-img" style={{ height: '28px', width: 'auto', margin: 0 }} />
          <span className="logo-text font-display" style={{ fontSize: '1.25rem', fontWeight: 700 }}>Graspify</span>
        </div>
        
        <button className="add-content-btn btn-gradient" onClick={() => setPage("Dashboard")} style={{ margin: '1.5rem 0', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', border: 'none', cursor: 'pointer' }}>
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

      <div className="sidebar-bottom" style={{ padding: '0 0.75rem' }}>
        
        <div className="plan-badge" style={{ fontSize: '0.75rem', fontWeight: '600', padding: '0.25rem 0.75rem', borderRadius: '9999px', background: 'var(--primary-light)', color: 'var(--primary-color)', border: '1px solid rgba(37,99,235,0.2)', marginBottom: '1rem', display: 'inline-block' }}>Free Plan</div>
        
        <div className="profile-dropdown" onClick={() => setShowDropdown(!showDropdown)} ref={dropdownRef} style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="avatar" style={{ padding: session?.user?.avatarBase64 ? 0 : undefined, overflow: 'hidden' }}>
            {session?.user?.avatarBase64 ? (
              <img src={session.user.avatarBase64} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              session?.user?.avatarInitials
            )}
          </div>
          <span className="profile-name" style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{session?.user?.name}</span>
          <ChevronDown size={16} className="dropdown-icon" style={{ transform: showDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          
          {showDropdown && (
            <div className="dropdown-menu card-modern" style={{ position: 'absolute', display: 'block', top: 'auto', bottom: 'calc(100% + 8px)', left: 0, minWidth: '180px', padding: '8px', zIndex: 50 }}>
               <button onClick={(event) => { event.stopPropagation(); setShowDropdown(false); setPage("Profile"); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontWeight: '600', padding: '10px 12px', borderRadius: '6px', cursor: 'pointer', border: 'none', background: 'transparent', width: '100%', textAlign: 'left', fontSize: '.88rem', transition: 'background 0.2s' }} onMouseEnter={(e)=>e.currentTarget.style.background = 'var(--bg-hover)'} onMouseLeave={(e)=>e.currentTarget.style.background='transparent'}>
                 <Settings size={16} /> Settings
               </button>
               <button onClick={(event) => { event.stopPropagation(); setShowDropdown(false); setPage("PlanPricing"); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontWeight: '600', padding: '10px 12px', borderRadius: '6px', cursor: 'pointer', border: 'none', background: 'transparent', width: '100%', textAlign: 'left', fontSize: '.88rem', transition: 'background 0.2s' }} onMouseEnter={(e)=>e.currentTarget.style.background = 'var(--bg-hover)'} onMouseLeave={(e)=>e.currentTarget.style.background='transparent'}>
                 <CreditCard size={16} /> Plan & Pricing
               </button>
               <button onClick={(event) => { event.stopPropagation(); setShowDropdown(false); setPage("Help"); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontWeight: '600', padding: '10px 12px', borderRadius: '6px', cursor: 'pointer', border: 'none', background: 'transparent', width: '100%', textAlign: 'left', fontSize: '.88rem', transition: 'background 0.2s' }} onMouseEnter={(e)=>e.currentTarget.style.background = 'var(--bg-hover)'} onMouseLeave={(e)=>e.currentTarget.style.background='transparent'}>
                 <HelpCircle size={16} /> Help & Tools
               </button>
               <button onClick={(event) => { event.stopPropagation(); setShowDropdown(false); setPage("Support"); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontWeight: '600', padding: '10px 12px', borderRadius: '6px', cursor: 'pointer', border: 'none', background: 'transparent', width: '100%', textAlign: 'left', fontSize: '.88rem', transition: 'background 0.2s' }} onMouseEnter={(e)=>e.currentTarget.style.background = 'var(--bg-hover)'} onMouseLeave={(e)=>e.currentTarget.style.background='transparent'}>
                 <MessageSquare size={16} /> Support
               </button>
               <hr style={{ margin: '4px 0', border: 'none', borderTop: '1px solid var(--border-color)' }} />
               <button onClick={(event) => { event.stopPropagation(); logout(); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', fontWeight: '600', padding: '10px 12px', borderRadius: '6px', cursor: 'pointer', border: 'none', background: 'transparent', width: '100%', textAlign: 'left', fontSize: '.88rem', transition: 'background 0.2s' }} onMouseEnter={(e)=>e.currentTarget.style.background='#fef2f2'} onMouseLeave={(e)=>e.currentTarget.style.background='transparent'}>
                 <LogOut size={16} /> Sign out
               </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

