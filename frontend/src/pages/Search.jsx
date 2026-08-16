import { Search as SearchIcon, Play, X } from "lucide-react";
import { useMemo, useState } from "react";

export default function Search({ content, open, close }) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const value = query.trim().toLowerCase();
    return value ? content.filter((item) => `${item.title} ${item.transcript} ${item.summary || ""}`.toLowerCase().includes(value)) : content;
  }, [content, query]);
  return <div className="search-page"><div className="search-dialog"><header><div><SearchIcon size={20} /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search your learning library" /></div><button onClick={close} aria-label="Close search"><X size={20} /></button></header><div className="search-dialog-head"><span>{query ? `${results.length} result${results.length === 1 ? "" : "s"}` : "Recent lessons"}</span><small>Search titles, transcripts, and generated summaries</small></div><div className="search-results">{results.length ? results.map((item) => <button key={item.id} onClick={() => open(item.id)}><span><Play size={16} /></span><div><b>{item.title}</b><p>{item.sourceType === "youtube_url" ? "YouTube lesson" : "Uploaded media"} · {item.language}</p></div><em>{item.latestAnalysis ? `${item.latestAnalysis.accuracy_percent}% assessed` : "Open"}</em></button>) : <div className="search-empty">No learning material matches “{query}”.</div>}</div></div></div>;
}
