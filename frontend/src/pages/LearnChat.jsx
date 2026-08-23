import { ArrowLeft, Bot, LoaderCircle, Send, Sparkles, Copy, ThumbsUp, ThumbsDown, ChevronDown, Search } from "lucide-react";
import { useEffect, useState, useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { api } from "../api";

export default function LearnChat({ content, token, initialQuery, onBack, onNotice, activePlan = "Free" }) {
  const [selectedId, setSelectedId] = useState("general");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const current = selectedId !== "general" ? content.find((item) => item.id === selectedId) : null;
  const initialized = useRef(false);
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  const sendQuery = useCallback(async (question) => {
    if (!question || sending) return;
    
    setInput(""); 
    setMessages((items) => [...items, { role: "user", text: question }]); 
    setSending(true);
    
    try { 
      let result;
      if (selectedId === "general") {
        result = await api(`/learning/chat/general`, { token, method: "POST", body: { question } });
      } else {
        result = await api(`/learning/content/${selectedId}/chat`, { token, method: "POST", body: { question } });
      }
      setMessages((items) => [...items, { role: "assistant", text: result.answer }]); 
    }
    catch (error) { onNotice(error.message); }
    finally { setSending(false); }
  }, [sending, selectedId, token, onNotice]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { 
    if (initialQuery && !initialized.current) {
      initialized.current = true;
      sendQuery(initialQuery);
    } 
  }, [initialQuery, sendQuery]);

  async function send(event) {
    event.preventDefault();
    sendQuery(input.trim());
  }

  async function submitFeedback(messageIndex, rating) {
    const msg = messages[messageIndex];
    if (!msg || msg.role !== "assistant" || msg.feedbackGiven || selectedId === "general") return;
    
    // Find the preceding user question
    let question = "";
    for (let i = messageIndex - 1; i >= 0; i--) {
      if (messages[i].role === "user") {
        question = messages[i].text;
        break;
      }
    }
    if (!question) return;

    try {
      await api(`/learning/content/${selectedId}/chat/feedback`, { 
        token, 
        method: "POST", 
        body: { question, answer: msg.text, rating } 
      });
      
      // Update UI to show feedback was given
      const newMessages = [...messages];
      newMessages[messageIndex] = { ...newMessages[messageIndex], feedbackGiven: rating };
      setMessages(newMessages);
      onNotice(rating === 1 ? "Thanks for the positive feedback!" : "Feedback recorded. We'll use this to improve.");
    } catch (error) {
      onNotice(error.message);
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendQuery(input.trim());
    }
  };
  
  return (
    <div className="learn-chat-page">
      <header className="learn-chat-head">
        {onBack && (
          <button onClick={onBack}>
            <ArrowLeft size={17} /> Back
          </button>
        )}
        <div className="learn-tab"><i /> Chat</div>
        
        <div ref={dropdownRef} style={{ position: 'relative', minWidth: '220px', marginLeft: 'auto', marginRight: '12px' }}>
          <div 
            onClick={() => !sending && setDropdownOpen(!dropdownOpen)} 
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: sending ? 'not-allowed' : 'pointer', opacity: sending ? 0.7 : 1, fontSize: '0.9rem', fontWeight: '500', color: 'var(--text-primary)' }}
          >
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {selectedId === "general" ? "General AI Chat" : (current?.title || "Select a lesson")}
            </span>
            <ChevronDown size={16} style={{ color: 'var(--text-secondary)' }} />
          </div>
          
          {dropdownOpen && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px', background: '#fff', border: '1px solid var(--border-color)', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 50, overflow: 'hidden' }}>
              <div 
                onClick={() => { setSelectedId("general"); setDropdownOpen(false); setSearchQuery(""); }}
                style={{ padding: '10px 12px', cursor: 'pointer', background: selectedId === "general" ? 'var(--bg-hover)' : 'transparent', borderBottom: '1px solid var(--border-color)', fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.9rem' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = selectedId === "general" ? 'var(--bg-hover)' : 'transparent'}
              >
                General AI Chat
              </div>
              
              <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ position: 'relative' }}>
                  <Search size={14} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input 
                    type="text" 
                    placeholder="Search lessons..." 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{ width: '100%', padding: '6px 8px 6px 28px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }}
                  />
                </div>
              </div>
              
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                <div style={{ padding: '6px 12px', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Your Lessons</div>
                {content.filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase())).map(item => (
                  <div 
                    key={item.id}
                    onClick={() => { setSelectedId(item.id); setDropdownOpen(false); setSearchQuery(""); }}
                    style={{ padding: '8px 12px', cursor: 'pointer', background: selectedId === item.id ? 'var(--bg-hover)' : 'transparent', fontSize: '0.85rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = selectedId === item.id ? 'var(--bg-hover)' : 'transparent'}
                  >
                    {item.title}
                  </div>
                ))}
                {content.filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                  <div style={{ padding: '12px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>No lessons found</div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div style={{ padding: '4px 10px', background: 'rgba(59, 130, 246, 0.1)', color: '#2563eb', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
          {activePlan === 'Premium' ? 'GPT-5.6-Sol' : activePlan === 'Pro' ? 'GPT-4o' : 'GPT-4o-mini'}
        </div>
      </header>

      <section className="learn-chat-body">
        {messages.length ? messages.map((message, index) => (
          <article className={`learn-message ${message.role}`} key={index}>
            {message.role === "assistant" && <span><Bot size={18} /></span>}
            
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="learn-message-content markdown-prose">
                {message.role === "assistant" ? (
                  <ReactMarkdown>{message.text}</ReactMarkdown>
                ) : (
                  <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{message.text}</p>
                )}
              </div>
              
              {message.role === "assistant" && (
                <div className="message-actions-bar">
                  <button onClick={() => navigator.clipboard.writeText(message.text).then(() => onNotice("Copied to clipboard!"))} title="Copy">
                    <Copy size={15} />
                  </button>
                  {selectedId !== "general" && (
                    <>
                      <button 
                        onClick={() => submitFeedback(index, 1)} 
                        title="Thumbs Up"
                        style={{ color: message.feedbackGiven === 1 ? '#10b981' : undefined }}
                        disabled={message.feedbackGiven !== undefined}
                      >
                        <ThumbsUp size={15} />
                      </button>
                      <button 
                        onClick={() => submitFeedback(index, -1)} 
                        title="Thumbs Down"
                        style={{ color: message.feedbackGiven === -1 ? '#ef4444' : undefined }}
                        disabled={message.feedbackGiven !== undefined}
                      >
                        <ThumbsDown size={15} />
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </article>
        )) : (
          <div className="learn-empty">
            <span><Sparkles size={24} /></span>
            <h1>What would you like to learn?</h1>
            <p>
              Ask any general knowledge question, or select a lesson from the dropdown to ask questions grounded only in that lesson's transcript.
            </p>
          </div>
        )}
        {sending && (
          <article className="learn-message assistant typing">
            <span><Bot size={18} /></span>
            <div className="learn-message-content">
              <LoaderCircle className="spin" size={16} /> 
              {selectedId === "general" ? "Thinking..." : "Searching transcript..."}
            </div>
          </article>
        )}
      </section>

      <form className="learn-composer" onSubmit={send}>
        <div className="learn-composer-wrapper">
          <textarea 
            value={input} 
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            disabled={sending} 
            placeholder={current ? `Ask anything about ${current.title}` : "Ask any general knowledge question..."}
            rows={1}
          />
          <button 
            type="submit"
            className="primary"
            disabled={sending || !input.trim()}
          >
            {sending ? <LoaderCircle className="spin" size={18} /> : <Send size={18} />}
          </button>
        </div>
        <div>
          <span>{current ? `Using: ${current.title}` : "General AI Mode"}</span>
        </div>
      </form>
    </div>
  );
}


