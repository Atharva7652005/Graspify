import { Headphones, Send, Clock, CheckCircle2, AlertCircle, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "../api";

export default function Support() {
  const [sent, setSent] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [category, setCategory] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    try {
      const data = await api("/support", { token: localStorage.getItem('graspify_token') });
      setTickets(data.tickets || []);
    } catch (err) {
      console.error("Error fetching tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await api("/support", {
        method: "POST",
        token: localStorage.getItem('graspify_token'),
        body: { category, subject, message }
      });
      
      setSent(true);
      setCategory("");
      setSubject("");
      setMessage("");
      setTimeout(() => setSent(false), 5000);
      fetchTickets(); // Refresh tickets list
    } catch (err) {
      console.error("Error submitting ticket:", err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="max-w-6xl mx-auto w-full p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Hero Section */}
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-blue-100">
          <Headphones size={32} />
        </div>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4">Graspify Support Center</h1>
        <p className="text-lg text-slate-600">
          Need help with your account, billing, or technical issues? Submit a request below, and our support team will get back to you shortly.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Help Form */}
        <div className="lg:col-span-5 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 sticky top-24">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <MessageSquare size={20} className="text-blue-500"/> Submit a Request
          </h2>
          <form 
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
              <select required value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 hover:bg-slate-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 transition-colors">
                <option value="">Select an issue type...</option>
                <option value="billing">Billing & Subscriptions</option>
                <option value="technical">Technical Bug / Issue</option>
                <option value="content">Lesson & Content Generation</option>
                <option value="account">Account Management</option>
                <option value="other">Other Inquiry</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Subject</label>
              <input required value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Briefly describe the issue..." className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 hover:bg-slate-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 transition-colors" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Message</label>
              <textarea required value={message} onChange={(e) => setMessage(e.target.value)} rows="5" placeholder="Provide as much detail as possible (error codes, links, what you were trying to do)..." className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 hover:bg-slate-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 resize-none transition-colors"></textarea>
            </div>

            <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2">
              <Send size={18} /> Send Support Request
            </button>
            
            {sent && (
              <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-semibold flex items-start gap-2 animate-in fade-in zoom-in-95">
                <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
                Your request has been successfully submitted! We'll review it and respond shortly.
              </div>
            )}
          </form>
        </div>

        {/* Previous Tickets & Admin Responses */}
        <div className="lg:col-span-7 space-y-6">
          <h2 className="text-xl font-bold text-slate-900 mb-6 px-1">Your Recent Tickets</h2>
          
          {loading ? (
            <div className="text-center p-8 text-slate-500">Loading tickets...</div>
          ) : tickets.length === 0 ? (
            <div className="text-center p-8 bg-slate-50 border border-slate-200 rounded-2xl text-slate-500 font-medium">You don't have any support tickets yet.</div>
          ) : (
            tickets.map(ticket => (
              <div key={ticket._id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                
                {/* Ticket Header */}
                <div className="bg-slate-50 border-b border-slate-200 p-4 sm:px-6 flex flex-wrap gap-4 items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg leading-tight">{ticket.subject}</h3>
                    <p className="text-xs text-slate-500 mt-1 font-medium tracking-wide">ID: {ticket._id.substring(18)} &bull; Submitted on {formatDate(ticket.createdAt)}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${ticket.status === 'resolved' ? 'bg-green-100 text-green-700 border border-green-200' : ticket.status === 'closed' ? 'bg-slate-100 text-slate-700 border border-slate-200' : 'bg-amber-100 text-amber-700 border border-amber-200'}`}>
                    {ticket.status === 'resolved' ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                    {ticket.status}
                  </div>
                </div>

                {/* User Query */}
                <div className="p-4 sm:px-6">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 shrink-0 flex items-center justify-center border border-slate-200 font-bold text-xs uppercase">
                      You
                    </div>
                    <div className="flex-1 bg-slate-50 rounded-2xl rounded-tl-sm p-4 text-sm text-slate-700 border border-slate-100">
                      {ticket.message}
                    </div>
                  </div>
                </div>

                {/* Admin Response */}
                {ticket.adminResponse ? (
                  <div className="p-4 sm:px-6 bg-blue-50/30 border-t border-blue-100/50">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white shrink-0 flex items-center justify-center shadow-sm">
                        <Headphones size={14} />
                      </div>
                      <div className="flex-1 bg-white rounded-2xl rounded-tl-sm p-4 text-sm text-slate-700 border border-blue-100 shadow-sm">
                        <div className="text-xs font-bold text-blue-600 mb-2 uppercase tracking-wide">Support Team</div>
                        {ticket.adminResponse}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 sm:px-6 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-400 text-sm font-medium">
                    <AlertCircle size={16} /> Awaiting response from the support team...
                  </div>
                )}
              </div>
            ))
          )}
          
        </div>
      </div>
    </div>
  );
}
