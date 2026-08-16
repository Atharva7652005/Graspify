import { FileUp, NotebookText, BrainCircuit, ChartNoAxesCombined } from "lucide-react";

const tools = [
  [FileUp, "Create a learning space", "Upload audio/video or add a YouTube URL. The original transcript remains the lesson’s source of truth."],
  [NotebookText, "Build structured notes", "Generate a detailed summary after transcription to review the lesson’s central ideas and definitions."],
  [BrainCircuit, "Practice with purpose", "Create a quiz that is grounded in your learning material, then submit your selected answers."],
  [ChartNoAxesCombined, "Use the analysis", "Review concept-level performance and use the suggested revision focus for your next study session."],
];

export default function HelpTools() {
  return <div className="utility-page"><section className="utility-hero"><span className="utility-icon">✦</span><div><p>HELP & TOOLS</p><h1>Learn with intention</h1><span>A simple workflow for turning a lecture into lasting understanding.</span></div></section><div className="tools-grid">{tools.map(([Icon, title, copy]) => <article key={title} className="tool-card"><span><Icon size={21} /></span><h2>{title}</h2><p>{copy}</p></article>)}</div></div>;
}
