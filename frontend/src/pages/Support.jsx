import { Headphones, Send } from "lucide-react";
import { useState } from "react";

export default function Support() {
  const [sent, setSent] = useState(false);
  return <div className="utility-page support-page"><section className="utility-hero"><span className="utility-icon"><Headphones /></span><div><p>SUPPORT</p><h1>How can we help?</h1><span>Share the lesson name and the point where you got stuck so the issue is easy to reproduce.</span></div></section><form className="utility-card support-form" onSubmit={(event) => { event.preventDefault(); setSent(true); }}><label>Subject<input required placeholder="e.g. My transcript did not complete" /></label><label>Message<textarea required rows="6" placeholder="Describe what happened and include any displayed error message." /></label><button className="btn-primary"><Send size={16} />Send support request</button>{sent && <p className="support-success">Your support request is ready for the Graspify team.</p>}</form></div>;
}
