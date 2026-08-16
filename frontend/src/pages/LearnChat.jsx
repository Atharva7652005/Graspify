import { ArrowLeft, Bot, LoaderCircle, Send, Sparkles, Copy, ThumbsUp, ThumbsDown } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { api } from "../api";

export default function LearnChat({ content, token, initialQuery, onBack, onNotice }) {
  const [selectedId, setSelectedId] = useState("general");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const current = selectedId !== "general" ? content.find((item) => item.id === selectedId) : null;
  const initialized = useRef(false);
  
  useEffect(() => { 
    if (initialQuery && !initialized.current) {
      initialized.current = true;
      sendQuery(initialQuery);
    } 
  }, [initialQuery]);
  
  async function sendQuery(question) {
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
  }

  async function send(event) {
    event.preventDefault();
    sendQuery(input.trim());
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
        <select value={selectedId} onChange={(event) => setSelectedId(event.target.value)} disabled={sending}>
          <option value="general">General AI Chat</option>
          <optgroup label="Your Lessons">
            {content.map((item) => <option value={item.id} key={item.id}>{item.title}</option>)}
          </optgroup>
        </select>
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
                  <button title="Thumbs Up">
                    <ThumbsUp size={15} />
                  </button>
                  <button title="Thumbs Down">
                    <ThumbsDown size={15} />
                  </button>
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
