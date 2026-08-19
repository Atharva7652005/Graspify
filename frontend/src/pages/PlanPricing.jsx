import React, { useState } from "react";
import { CheckCircle2, X, CreditCard, Lock, QrCode, Copy, AlertCircle, RefreshCcw } from "lucide-react";
import { api } from "../api";

export default function PlanPricing({ session, onUserUpdate }) {
  const plans = [
    { name: "Free", price: "₹0", desc: "Basic tools to get started.", features: ["3 uploads per day", "1 generation per item", "English translations", "Powered by GPT-4o-mini"] },
    { name: "Basic", price: "₹149", desc: "For casual learners.", features: ["10 uploads per day", "5 AI regenerations", "Hindi & Marathi support", "Powered by GPT-4o-mini"] },
    { name: "Pro", price: "₹249", desc: "For dedicated students.", features: ["25 uploads per day", "10 AI regenerations", "All Indian languages", "Powered by GPT-4o"], popular: true },
    { name: "Premium", price: "₹349", desc: "For power users.", features: ["50 uploads per day", "25 AI regenerations", "All global languages", "Powered by GPT-5.6-Sol"] },
  ];

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentStep, setPaymentStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [paymentStatus, setPaymentStatus] = useState("success");
  const [isProcessing, setIsProcessing] = useState(false);

  const activePlan = session?.user?.activePlan || "Free";
  const purchasedPlans = session?.user?.purchasedPlans || ["Free"];

  const handleSelectPlan = async (plan) => {
    if (plan.name === activePlan) return;
    
    if (plan.name === "Free" || purchasedPlans.includes(plan.name)) {
      setIsProcessing(true);
      try {
        const res = await api("/users/plan/switch", {
          method: "POST",
          body: { planName: plan.name },
          token: session?.token
        });
        if (onUserUpdate) onUserUpdate(res.user);
      } catch (err) {
        alert(err.message);
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    if (plan.name !== "Free") {
      setSelectedPlan(plan);
      setPaymentStep(1);
      setPaymentMethod("card");
      setPaymentStatus("success");
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="font-display text-3xl font-bold text-slate-900 mb-4">Simple, Transparent Pricing</h2>
        <p className="text-lg text-slate-600">Choose the plan that fits your learning pace.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
        {plans.map((plan, i) => (
          <div key={plan.name} className={`relative bg-white rounded-3xl border ${plan.popular ? 'border-purple-500 shadow-2xl shadow-purple-600/20 lg:-translate-y-4' : 'border-slate-200 shadow-lg shadow-slate-200/50'} p-8 flex flex-col h-full hover:-translate-y-2 transition-transform duration-300`}>
            {plan.popular && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold uppercase tracking-wider py-1 px-4 rounded-full shadow-md">
                Most Popular
              </div>
            )}
            
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h3>
              <p className="text-sm text-slate-500 h-10">{plan.desc}</p>
            </div>
            
            <div className="mb-8">
              <span className="text-4xl font-display font-extrabold text-slate-900">{plan.price}</span>
              <span className="text-slate-500 font-medium">/day</span>
            </div>
            
            <ul className="space-y-4 mb-8 flex-1">
              {plan.features.map((feat, j) => (
                <li key={j} className="flex items-start gap-3">
                  <CheckCircle2 size={18} className={plan.popular ? "text-purple-600 shrink-0" : "text-blue-500 shrink-0"} />
                  <span className="text-sm text-slate-700 font-medium">{feat}</span>
                </li>
              ))}
            </ul>

            <button 
              onClick={() => handleSelectPlan(plan)}
              disabled={plan.name === activePlan || selectedPlan !== null || isProcessing}
              className={`w-full py-3 px-6 rounded-xl font-bold text-sm transition-all ${plan.popular ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:shadow-purple-500/30' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {plan.name === activePlan ? "Current Plan" : (plan.name === "Free" || purchasedPlans.includes(plan.name)) ? "Switch to " + plan.name : "Upgrade to " + plan.name}
            </button>
          </div>
        ))}
      </div>

      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col animate-[modal-enter_0.2s_ease-out]">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">
                {paymentStep === 1 ? "Review your plan" : paymentStep === 2 ? "Payment details" : "Payment successful"}
              </h2>
              <button onClick={() => { setSelectedPlan(null); setPaymentStep(1); }} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {paymentStep === 1 && (
                <div>
                  <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-100">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-slate-900">{selectedPlan.name} Plan</h3>
                      <span className="font-bold text-slate-900">{selectedPlan.price}</span>
                    </div>
                    <p className="text-sm text-slate-500">Billed daily. Cancel anytime.</p>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {selectedPlan.features.map((feat, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-slate-700">
                        <CheckCircle2 size={16} className="text-green-500 shrink-0" /> {feat}
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => setPaymentStep(2)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors">
                    Continue to payment
                  </button>
                </div>
              )}
              {paymentStep === 2 && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="space-y-4 mb-6">
                    <div className="flex gap-2">
                      <button onClick={() => setPaymentMethod("card")} className={`flex-1 py-3 rounded-lg border-2 font-semibold flex justify-center items-center gap-2 transition-colors ${paymentMethod === 'card' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                        <CreditCard size={18}/> Card
                      </button>
                      <button onClick={() => setPaymentMethod("upi")} className={`flex-1 py-3 rounded-lg border-2 font-semibold flex justify-center items-center gap-2 transition-colors ${paymentMethod === 'upi' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                        <QrCode size={18}/> UPI
                      </button>
                    </div>

                    {paymentMethod === "card" && (
                      <div className="animate-in fade-in slide-in-from-top-2 duration-300 pt-2">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Card number</label>
                          <input type="text" placeholder="0000 0000 0000 0000" className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div className="flex gap-4 mt-4">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Expiry</label>
                            <input type="text" placeholder="MM/YY" className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none" />
                          </div>
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-slate-700 mb-1">CVC</label>
                            <input type="text" placeholder="123" className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none" />
                          </div>
                        </div>
                      </div>
                    )}

                    {paymentMethod === "upi" && (
                      <div className="animate-in fade-in slide-in-from-top-2 duration-300 text-center flex flex-col items-center pt-2">
                        <div className="w-48 h-48 bg-slate-50 rounded-2xl mb-4 flex flex-col items-center justify-center border-2 border-dashed border-slate-300">
                          <QrCode size={64} className="text-slate-400 mb-2" />
                          <span className="text-xs text-slate-500 font-medium px-4">Scan with Google Pay, PhonePe, or Paytm</span>
                        </div>
                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg py-2 px-4 mb-2">
                          <span className="text-sm font-semibold text-slate-700">graspify@upi</span>
                          <button onClick={() => alert("UPI ID copied!")} className="text-blue-600 hover:text-blue-700" title="Copy UPI ID">
                            <Copy size={16} />
                          </button>
                        </div>
                        <p className="text-xs text-slate-500">Or use the UPI ID above</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mb-4 justify-center bg-slate-50 py-2 rounded-lg border border-slate-100">
                    <input type="checkbox" id="fail-sim" className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer" onChange={(e) => setPaymentStatus(e.target.checked ? "error" : "success")} />
                    <label htmlFor="fail-sim" className="text-xs font-medium text-slate-600 cursor-pointer select-none">Simulate Payment Failure</label>
                  </div>

                  <button 
                    disabled={isProcessing}
                    onClick={() => {
                      setIsProcessing(true);
                      setTimeout(async () => {
                        if (paymentStatus === "success") {
                          try {
                            const res = await api("/users/plan/purchase", {
                              method: "POST",
                              body: { planName: selectedPlan.name },
                              token: session?.token
                            });
                            if (onUserUpdate) onUserUpdate(res.user);
                            setPaymentStep(3);
                          } catch (err) {
                            alert(err.message);
                            setPaymentStatus("error");
                            setPaymentStep(3);
                          }
                        } else {
                          setPaymentStep(3);
                        }
                        setIsProcessing(false);
                      }, 1500);
                    }} 
                    className="w-full bg-slate-900 hover:bg-black text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                    {isProcessing ? <RefreshCcw size={16} className="animate-spin" /> : <Lock size={16}/>} 
                    {isProcessing ? "Processing..." : `Pay ${selectedPlan.price}`}
                  </button>
                </div>
              )}
              {paymentStep === 3 && (
                <div className="text-center py-6 animate-in zoom-in-95 duration-300">
                  {paymentStatus === "success" ? (
                    <>
                      <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 size={32} />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">Payment Successful!</h3>
                      <p className="text-slate-500 mb-8">You are now subscribed to the {selectedPlan.name} plan.</p>
                      <button onClick={() => { setSelectedPlan(null); setPaymentStep(1); }} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold py-3 rounded-xl transition-colors">
                        Return to Dashboard
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle size={32} />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">Payment Failed</h3>
                      <p className="text-slate-500 mb-8">We couldn't process your payment. Please try again.</p>
                      <button onClick={() => setPaymentStep(2)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors mb-3">
                        Try Again
                      </button>
                      <button onClick={() => { setSelectedPlan(null); setPaymentStep(1); }} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold py-3 rounded-xl transition-colors">
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
