import { useEffect, useState, useRef } from "react";
import { api } from "../api";
import { Bot, LoaderCircle, MessageCircle, RefreshCw, Send, Sparkles } from "lucide-react";
import { Flashcards, Notes } from "../components/LearningExtras";
import ReactMarkdown from "react-markdown";

const TRANSLATION_LANGUAGES = [
  "English",
  "Hindi", "Bengali", "Marathi", "Telugu", "Tamil", "Gujarati", "Urdu", "Kannada", "Odia", "Malayalam",
  "Chinese", "Spanish", "Arabic", "French", "Japanese"
];

function getLanguagesForPlan(plan) {
  if (plan === "Free") return ["English"];
  if (plan === "Basic") return ["English", "Hindi", "Marathi"];
  if (plan === "Pro") return TRANSLATION_LANGUAGES.slice(0, 12);
  return TRANSLATION_LANGUAGES;
}

export default function Lesson({ current, loading, onSummary, onQuiz, onNotice, token, saveContent, activePlan }) { 
  const [tab, setTab] = useState(current?.summary ? "Summary" : "Transcript"); 
  
  const [targetLang, setTargetLang] = useState(current?.englishTranslation ? "English" : "");
  const [translatedText, setTranslatedText] = useState(current?.englishTranslation || "");
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    if (current) {
      setTargetLang(current.englishTranslation ? "English" : "");
      setTranslatedText(current.englishTranslation || "");
    }
  }, [current?.id]);

  const handleTranslate = async (e) => {
    const lang = e.target.value;
    setTargetLang(lang);
    if (!lang) {
      setTranslatedText("");
      return;
    }
    
    if (lang === "English" && current.englishTranslation) {
      setTranslatedText(current.englishTranslation);
      return;
    }
    if (current.translations && current.translations[lang]) {
      setTranslatedText(current.translations[lang]);
      return;
    }
    
    setIsTranslating(true);
    try {
      const res = await api(`/learning/content/${current.id}/translate`, {
        method: "POST",
        token,
        body: { targetLanguage: lang }
      });
      setTranslatedText(res.translation);
      saveContent({
        ...current,
        translations: { ...current.translations, [lang]: res.translation }
      });
    } catch (err) {
      onNotice(err.message);
      setTargetLang("");
      setTranslatedText("");
    } finally {
      setIsTranslating(false);
    }
  };

  if (!current) return <div className="empty-state-large">Select a lesson from your history or create a new one.</div>; 
  
  const tabs = ["Summary", "Transcript", "Flashcards", "Notes", "Quiz", "Ask AI"];
  if (current.latestAnalysis) tabs.push("Analysis");
  const generateFreshQuiz = async () => {
    await onQuiz();
    setTab("Quiz");
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">{current.title}</h1>
      <div className="lesson-meta shadow-sm rounded-t-lg">
        <span>{current.sourceType === "youtube_url" ? "YouTube" : "Upload"}</span>
        <span>{current.language}</span>
      </div>
      <div className="tabs">
        {tabs.map((item) => (
          <button className={tab === item ? "selected" : ""} key={item} onClick={() => setTab(item)}>{item}</button>
        ))}
      </div>
      {tab === "Summary" && (
        <article className="paper">
          {current.summary ? <><div className="content-action-row"><span>Generated from this lesson transcript</span><button className="quiz-refresh" onClick={onSummary} disabled={loading}>{loading ? <LoadingLabel label="Refreshing summary" /> : <><RefreshCw size={15} /> Refresh summary</>}</button></div><div className="markdown-prose"><ReactMarkdown>{current.summary}</ReactMarkdown></div></> : (
            <div className="empty-state-large">
              <div className="empty-icon">📝</div>
              <h3>No Summary Yet</h3>
              <p>Generate a detailed summary to turn this transcript into structured notes.</p>
              <button className="primary" onClick={onSummary} disabled={loading}>{loading ? <LoadingLabel label="Generating summary" /> : "Generate Summary Now"}</button>
            </div>
          )}
        </article>
      )}
      {tab === "Transcript" && (
        <article className={`transcript-workspace with-translation`}>
          <section className="transcript-column">
            <div className="transcript-column-head"><span className="transcript-icon"><MessageCircle size={17} /></span><div><p>ORIGINAL LANGUAGE</p><h2>Original transcript</h2></div></div>
            <div className="transcript-scroll"><p>{current.transcript}</p></div>
          </section>
          <section className="transcript-column translation-column">
            <div className="transcript-column-head">
              <span className="transcript-icon"><Sparkles size={17} /></span>
              <div className="flex-1 flex justify-between items-center">
                <div><p>ACCESSIBILITY VIEW</p><h2>Translation</h2></div>
                <select 
                  value={targetLang} 
                  onChange={handleTranslate}
                  disabled={isTranslating}
                  className="ml-4 p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Select language</option>
                  {getLanguagesForPlan(activePlan).map(lang => <option key={lang} value={lang}>{lang}</option>)}
                </select>
              </div>
            </div>
            <div className="transcript-scroll">
              {isTranslating ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
                  <LoaderCircle className="animate-spin text-blue-500" size={32} />
                  <p>Translating to {targetLang}...</p>
                </div>
              ) : translatedText ? (
                <p>{translatedText}</p>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <Sparkles size={32} className="mb-4 opacity-50" />
                  <p>Select a language from the dropdown to translate this transcript.</p>
                </div>
              )}
            </div>
          </section>
        </article>
      )}
      {tab === "Flashcards" && <Flashcards current={current} token={token} saveContent={saveContent} onNotice={onNotice} />}
      {tab === "Notes" && <Notes current={current} token={token} saveContent={saveContent} onNotice={onNotice} />}
      {tab === "Quiz" && <Quiz current={current} token={token} saveContent={saveContent} onNotice={onNotice} onQuiz={generateFreshQuiz} loading={loading} />}
      {tab === "Ask AI" && <RagChat current={current} token={token} onNotice={onNotice} saveContent={saveContent} />}
      {tab === "Analysis" && <Analysis analysis={current.latestAnalysis} />}
    </div>
  );
}

function Quiz({ current, token, saveContent, onNotice, onQuiz, loading }) { 
  const [answers, setAnswers] = useState({}); 
  const [result, setResult] = useState(current.latestAnalysis); 
  const [evaluating, setEvaluating] = useState(false);
  useEffect(() => { setAnswers({}); setResult(current.latestAnalysis); }, [current.quiz?.quizId, current.latestAnalysis]);
  
  if (!current.quiz?.questions?.length) {
    return (
      <div className="empty-state-large">
        <div className="empty-icon">🧠</div>
        <h3>Test Your Knowledge</h3>
        <p>Generate a quiz to practice the concepts in this lesson.</p>
        <button className="primary" onClick={onQuiz} disabled={loading}>{loading ? <LoadingLabel label="Generating quiz" /> : "Generate Quiz Now"}</button>
      </div>
    );
  }
  
  async function submit(event) { 
    event.preventDefault(); 
    setEvaluating(true);
    try { 
      const payload = current.quiz.questions.map((question) => ({ 
        question_id: question.question_id, 
        answer: answers[question.question_id] || "" 
      })); 
      const analysis = await api(`/learning/content/${current.id}/evaluate`, { token, method: "POST", body: { answers: payload } }); 
      setResult(analysis); 
      saveContent({ ...current, latestAnalysis: analysis }); 
    } catch (err) { 
      onNotice(err.message); 
    } finally { setEvaluating(false); }
  } 
  
  return (
    <form className="quiz" onSubmit={submit}>
      <div className="quiz-heading"><div><p>KNOWLEDGE CHECK</p><h2>Practice this lesson</h2><span>Each quiz is created fresh from the selected transcript.</span></div><button type="button" className="quiz-refresh" onClick={onQuiz} disabled={loading}>{loading ? <LoadingLabel label="Creating quiz" /> : <><RefreshCw size={15} /> Generate new questions</>}</button></div>
      {current.quiz.questions.map((question, index) => (
        <fieldset key={question.question_id}>
          <legend>{index + 1}. {question.question}</legend>
          {question.options.map((option) => {
            const hasAnswered = !!answers[question.question_id];
            const isSelected = answers[question.question_id] === option;
            const isCorrect = option === question.correct_answer;

            let className = "";
            if (hasAnswered) {
              className = "disabled";
              if (isCorrect) className += " correct";
              else if (isSelected) className += " incorrect";
            }

            return (
              <label key={option} className={className.trim()}>
                <input type="radio" name={question.question_id} value={option} 
                  disabled={hasAnswered}
                  checked={isSelected}
                  onChange={() => setAnswers({ ...answers, [question.question_id]: option })} /> {option}
              </label>
            );
          })}
        </fieldset>
      ))}
      <button className="primary" disabled={evaluating}>{evaluating ? <LoadingLabel label="Evaluating" /> : "Evaluate answers"}</button>
      {result && <Analysis analysis={result} />}
    </form>
  ); 
}

function RagChat({ current, token, onNotice, saveContent }) {
  const [messages, setMessages] = useState(
    current.chatHistory?.length > 0 
      ? current.chatHistory 
      : [{ role: "assistant", text: "Ask about this lesson. I'll answer only from its transcript." }]
  );
  const [question, setQuestion] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function submit(event) {
    event.preventDefault();
    const text = question.trim();
    if (!text || sending) return;
    setQuestion(""); 
    setMessages((items) => [...items, { role: "user", text }]); 
    setSending(true);
    try {
      const result = await api(`/learning/content/${current.id}/chat`, { token, method: "POST", body: { question: text } });
      const cleanAnswer = result.answer.replace(/[*#]/g, '').replace(/--/g, '');
      
      setMessages((items) => {
        const newMessages = [...items, { role: "assistant", text: cleanAnswer, source: result.retrieved_context?.[0] }];
        if (saveContent) saveContent({ ...current, chatHistory: newMessages });
        return newMessages;
      });
    } catch (error) { onNotice(error.message); } finally { setSending(false); }
  }

  return (
    <section className="rag-panel">
      <div className="rag-head">
        <span><Bot size={20} /></span>
        <div><p>RAG CHATBOT</p><h2>Ask your lesson tutor</h2><small>Answers are grounded in {current.title}.</small></div>
      </div>
      <div className="rag-messages">
        {messages.map((message, index) => (
          <div className={`rag-message ${message.role}`} key={index}>
            <p>{message.text}</p>
            {message.source && <small>Based on retrieved lesson context</small>}
          </div>
        ))}
        {sending && (
          <div className="rag-message typing" aria-label="Tutor is preparing a response">
            <LoadingLabel label="Finding an answer" />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form className="rag-form" onSubmit={submit}>
        <input value={question} onChange={(event) => setQuestion(event.target.value)} disabled={sending} placeholder="Ask a question about this lesson" />
        <button className="primary" disabled={sending} aria-label="Send question">{sending ? <LoaderCircle className="spin" size={16} /> : <Send size={16} />}</button>
      </form>
    </section>
  );
}

function LoadingLabel({ label }) {
  return <span className="loading-label"><LoaderCircle className="spin" size={15} /> {label}</span>;
}

function Analysis({ analysis }) { 
  if (!analysis) return null; // Analysis tab is hidden if not present, so we don't need a large empty state here.
  return (
    <section className="analysis">
      <div className="analysis-header">
        <div className="score-card">
          <strong>{analysis.accuracy_percent}%</strong>
          <span>Estimated Grasping Level</span>
          <div style={{marginTop: "0.5rem", fontWeight: 600, color: "var(--primary-dark)"}}>{analysis.estimated_grasping_level}</div>
        </div>
      </div>
      <div className="concept-bars">
        <h3 style={{marginBottom: "1.5rem"}}>Concept Mastery</h3>
        {Object.entries(analysis.concept_accuracy || {}).map(([concept, score]) => (
          <p key={concept}>
            <b>{concept}</b>
            <i><em style={{ width: `${score}%` }} /></i>
            <span style={{width: "40px", textAlign: "right"}}>{score}%</span>
          </p>
        ))}
      </div>
      {analysis.improvement_suggestions?.[0] && (
        <div className="suggestion">
          <strong>💡 Suggestion:</strong> {analysis.improvement_suggestions[0]}
        </div>
      )}
      <small style={{color: "var(--text-tertiary)"}}>{analysis.disclaimer}</small>
    </section>
  ); 
}
