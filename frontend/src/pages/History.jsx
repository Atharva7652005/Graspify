import { Clock } from "lucide-react";

export default function History({ content, open }) {
  return (
    <div className="history-page max-w-4xl mx-auto py-8 px-4">
      <div className="history-head flex items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
            <Clock size={20} />
          </div>
          <h1 className="text-3xl font-bold font-display text-slate-900">History</h1>
        </div>
      </div>
      
      <div className="history-card-grid">
        {content.length ? content.map((item) => (
          <button 
            key={item.id} 
            onClick={() => open(item.id)}
            className="history-card"
          >
            <div className="history-art">
              <span className="text-blue-600 font-bold text-lg">{item.title?.charAt(0) || "L"}</span>
            </div>
            <div className="history-card-copy flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-slate-900 truncate">{item.title}</h3>
              <p className="text-sm text-slate-500 truncate">{item.sourceType === "youtube_url" ? "YouTube Video" : "Uploaded File"} • {item.language}</p>
            </div>
            <div className="history-review shrink-0 text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              Review
            </div>
          </button>
        )) : (
          <div className="p-12 text-center text-slate-500">
            No history found. Create your first lesson to see it here!
          </div>
        )}
      </div>
    </div>
  );
}
