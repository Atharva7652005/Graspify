import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowRight, Play, BookOpen, BrainCircuit, X, Menu, Search, Video, FileText, 
  Target, GraduationCap, Mic, BarChart3, MessageSquare, Shield, Clock,
  CheckCircle2, Languages, Cpu, Zap, LayoutDashboard, Compass, Star, FileQuestion, ChevronDown, MonitorPlay, Activity, ArrowRightCircle, Trophy
} from "lucide-react";

// --- CUSTOM HOOKS & UTILS ---

function useIntersectionObserver(options = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef(null);
  const optionsStr = JSON.stringify(options);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsIntersecting(true);
      return;
    }

    const parsedOptions = JSON.parse(optionsStr);
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsIntersecting(true);
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.1, ...parsedOptions });

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [optionsStr]);

  return [ref, isIntersecting];
}

// --- REUSABLE COMPONENTS ---

function Reveal({ children, delay = 0, className = "" }) {
  const [ref, isVisible] = useIntersectionObserver();
  return (
    <div 
      ref={ref} 
      className={`transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// --- SUB SECTIONS ---

function Navbar() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "Learner Analysis", href: "#analysis" },
    { name: "Pricing", href: "#pricing" },
    { name: "FAQ", href: "#faq" }
  ];

  const scrollTo = (e, id) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.getElementById(id.replace('#', ''));
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <img src="/logo.png" alt="Graspify Logo" className="w-8 h-auto" />
            <span className="font-display font-extrabold text-xl text-slate-900 tracking-tight">Graspify</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a key={link.name} href={link.href} onClick={(e) => scrollTo(e, link.href)} className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors relative group">
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button onClick={() => navigate("/login")} className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Sign In</button>
            <button onClick={() => navigate("/register")} className="text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2.5 rounded-full shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-0.5 transition-all duration-300">
              Try Graspify
            </button>
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-600 hover:text-slate-900 transition-colors p-2">
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden absolute top-full left-0 w-full bg-white shadow-xl border-t border-slate-100 transition-all duration-300 overflow-hidden ${mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-4 py-4 space-y-1">
          {navLinks.map((link, i) => (
            <a key={link.name} href={link.href} onClick={(e) => scrollTo(e, link.href)} className="block px-3 py-3 text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors" style={{ transitionDelay: `${i * 50}ms` }}>
              {link.name}
            </a>
          ))}
          <div className="pt-4 mt-2 border-t border-slate-100 flex flex-col gap-3 px-3">
            <button onClick={() => navigate("/login")} className="w-full py-3 text-center text-base font-medium text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">Sign In</button>
            <button onClick={() => navigate("/register")} className="w-full py-3 text-center text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-md">Try Graspify</button>
          </div>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  const navigate = useNavigate();
  return (
    <section className="pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden relative">
      <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[800px] h-[800px] bg-gradient-to-bl from-blue-100/50 to-purple-100/50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Left Column */}
          <div className="max-w-2xl">
            <Reveal delay={0}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-semibold mb-6 shadow-sm">
                <span className="flex h-2 w-2 rounded-full bg-blue-600"></span>
                AI-Powered Multilingual Learning
              </div>
            </Reveal>
            
            <Reveal delay={100}>
              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6">
                Turn Any Lecture Into Your Personal <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 block sm:inline">AI Tutor.</span>
              </h1>
            </Reveal>
            
            <Reveal delay={200}>
              <p className="text-lg sm:text-xl text-slate-600 mb-8 leading-relaxed max-w-xl">
                Upload video or audio in any language. Instantly get structured transcripts, intelligent summaries, generated quizzes, and a deep analysis of your learning progress.
              </p>
            </Reveal>
            
            <Reveal delay={300}>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button onClick={() => navigate("/register")} className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-lg shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-1 transition-all duration-300">
                  Start Learning Free <ArrowRight size={20} />
                </button>
                <a href="#how-it-works" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-lg hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 shadow-sm">
                  <Play size={20} className="text-slate-400" /> See How It Works
                </a>
              </div>
              <p className="text-sm text-slate-500 flex items-center gap-2">
                <Shield size={16} className="text-green-500" /> No credit card required. Cancel anytime.
              </p>
            </Reveal>
          </div>

          {/* Right Column - Dashboard Mockup */}
          <div className="relative lg:ml-auto w-full max-w-lg mx-auto lg:max-w-none">
            <Reveal delay={400} className="relative z-10">
              <div className="bg-white rounded-3xl shadow-2xl shadow-slate-900/10 border border-slate-100 overflow-hidden transform perspective-1000 rotate-y-[-5deg] rotate-x-[5deg]">
                {/* Mockup Header */}
                <div className="bg-slate-50 border-b border-slate-100 px-4 py-3 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                    <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                    <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                  </div>
                  <div className="ml-4 bg-white border border-slate-200 rounded-md px-3 py-1 flex-1 text-xs text-slate-400 font-medium flex items-center gap-2">
                    <Video size={12} /> app.graspify.com/lesson/quantum-physics
                  </div>
                </div>
                {/* Mockup Body */}
                <div className="p-6 bg-slate-50">
                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-display font-bold text-slate-800">Quantum Physics 101</h3>
                      <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-700 rounded-md">100% Processed</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-5">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-full w-full float-fill"></div>
                    </div>
                    <div className="space-y-2 mb-6">
                      <div className="h-3 bg-slate-100 rounded-full w-full"></div>
                      <div className="h-3 bg-slate-100 rounded-full w-5/6"></div>
                      <div className="h-3 bg-slate-100 rounded-full w-4/6"></div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 border border-slate-200">
                        <FileText size={16} /> Summary
                      </button>
                      <button className="flex-1 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 border border-blue-200">
                        <BrainCircuit size={16} /> AI Tutor
                      </button>
                    </div>
                  </div>
                  
                  {/* Grasp Tile inside Mockup */}
                  <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl p-5 shadow-inner border border-slate-800 text-white">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-slate-400 text-sm font-medium flex items-center gap-1.5"><Target size={16}/> Learner Grasp</span>
                      <span className="text-2xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">82%</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-[10px] uppercase tracking-wider font-bold bg-green-500/20 text-green-400 px-2 py-1 rounded-md border border-green-500/30">Wave-Particle</span>
                      <span className="text-[10px] uppercase tracking-wider font-bold bg-amber-500/20 text-amber-400 px-2 py-1 rounded-md border border-amber-500/30">Superposition</span>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Floating Status Pills */}
            <div className="absolute top-12 left-0 md:-left-12 bg-white rounded-xl shadow-xl border border-slate-100 p-3 flex items-center gap-3 z-20 float-y-slow">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0"><FileText size={16}/></div>
              <div>
                <p className="text-xs font-bold text-slate-900">AI Summary</p>
                <p className="text-[10px] text-slate-500">Ready in English</p>
              </div>
            </div>
            
            <div className="absolute bottom-24 -right-8 bg-white rounded-xl shadow-xl border border-slate-100 p-3 flex items-center gap-3 z-20 float-y-medium">
              <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0"><FileQuestion size={16}/></div>
              <div>
                <p className="text-xs font-bold text-slate-900">Quiz Generated</p>
                <p className="text-[10px] text-slate-500">5 Questions</p>
              </div>
            </div>
            
            <div className="absolute -bottom-6 left-8 bg-slate-900 rounded-xl shadow-xl border border-slate-800 p-3 flex items-center gap-3 z-20 float-y-fast">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0"><Activity size={16}/></div>
              <div>
                <p className="text-xs font-bold text-white">Analysis Updated</p>
                <p className="text-[10px] text-slate-400">3 Weak Concepts Detected</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

function TrustStrip() {
  const items = [
    { icon: Languages, label: "Multilingual Support" },
    { icon: FileText, label: "Smart Summaries" },
    { icon: MessageSquare, label: "Context-Aware AI Tutor" },
    { icon: BarChart3, label: "Learner Grasp Analysis" },
  ];

  return (
    <section className="bg-slate-50/60 border-y border-slate-200/60 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-semibold text-slate-500 uppercase tracking-widest mb-8">Everything you need to master complex topics</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {items.map((item, i) => (
            <Reveal key={i} delay={i * 100} className="flex flex-col items-center gap-3">
              <item.icon size={28} className="text-slate-400" />
              <span className="text-sm font-semibold text-slate-700">{item.label}</span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProblemSection() {
  const painPoints = [
    "Rewatching 2-hour lectures to find one concept",
    "Taking disorganized notes that you never read again",
    "Not knowing if you actually understood the material",
    "Struggling with content in a different language",
    "Having no one to ask when you get stuck"
  ];

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <Reveal>
              <h2 className="font-display text-4xl lg:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
                Watching a lecture isn't the same as <span className="text-blue-600">understanding it.</span>
              </h2>
            </Reveal>
            <div className="space-y-4 mb-8">
              {painPoints.map((point, i) => (
                <Reveal key={i} delay={100 + (i * 100)} className="flex items-start gap-3">
                  <div className="mt-1 w-6 h-6 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                    <X size={14} className="text-red-500" />
                  </div>
                  <p className="text-lg text-slate-600">{point}</p>
                </Reveal>
              ))}
            </div>
            <Reveal delay={600}>
              <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 shadow-inner">
                <p className="text-slate-800 font-medium text-lg">
                  <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Graspify changes this.</span> We transform passive viewing into active, measurable learning.
                </p>
              </div>
            </Reveal>
          </div>
          
          <div className="relative group">
            <Reveal delay={300}>
              <div className="relative rounded-3xl overflow-hidden shadow-2xl transition-transform duration-500 group-hover:-rotate-2 group-hover:scale-[1.02]">
                <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop" alt="Student watching lecture" className="w-full h-auto object-cover opacity-90" />
                <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                    <Play size={24} className="text-white ml-1" />
                  </div>
                </div>
              </div>
            </Reveal>
            
            <Reveal delay={500} className="absolute -bottom-10 left-0 md:-left-16 z-10 float-y-slow">
              <div className="bg-[#fefce8] p-6 rounded-xl shadow-xl shadow-yellow-900/10 border border-yellow-200 rotate-[-8deg] w-64">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-yellow-800 font-display font-bold text-sm">Messy Notes.txt</span>
                  <X size={14} className="text-yellow-600/50" />
                </div>
                <div className="space-y-2 opacity-60">
                  <div className="h-2 bg-yellow-800/20 rounded w-full"></div>
                  <div className="h-2 bg-yellow-800/20 rounded w-5/6"></div>
                  <div className="h-2 bg-yellow-800/20 rounded w-4/6"></div>
                  <div className="h-2 bg-yellow-800/20 rounded w-full"></div>
                  <div className="h-2 bg-yellow-800/20 rounded w-3/4"></div>
                </div>
                <p className="text-xs font-bold text-red-500 mt-4 text-center border-t border-yellow-200/50 pt-2">Never looked at again</p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { icon: Play, title: "Upload", desc: "Paste a YouTube link or upload audio/video in any language." },
    { icon: Cpu, title: "Understand", desc: "AI transcribes and translates the content into clear English." },
    { icon: FileText, title: "Transform", desc: "Get instant structured notes, summaries, and flashcards." },
    { icon: MessageSquare, title: "Interact", desc: "Ask the AI Tutor questions grounded strictly in the lecture." },
    { icon: Target, title: "Measure", desc: "Take generated quizzes to calculate your Grasp Analysis score." }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-slate-900 mb-4">From Upload to Mastery in Minutes</h2>
          <p className="text-lg text-slate-600">The entire learning lifecycle, automated and optimized by AI.</p>
        </Reveal>

        <div className="relative">
          {/* Desktop connecting line */}
          <div className="hidden lg:block absolute top-12 left-10 right-10 h-1 bg-gradient-to-r from-blue-200 via-purple-200 to-blue-200 rounded-full"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 relative z-10">
            {steps.map((step, i) => (
              <Reveal key={i} delay={i * 150} className="relative group">
                <div className="flex flex-col items-center text-center">
                  <div className="w-24 h-24 rounded-3xl bg-white shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center justify-center mb-6 relative group-hover:-translate-y-2 transition-transform duration-300">
                    <step.icon size={32} className="text-blue-600" />
                    <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold flex items-center justify-center text-sm shadow-md border-2 border-slate-50">
                      {i + 1}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CoreFeatures() {
  const features = [
    { icon: Languages, title: "Multilingual Understanding", desc: "Upload lectures in Hindi, Spanish, Marathi, etc. Get all study materials neatly translated to English." },
    { icon: Zap, title: "Instant Transcripts", desc: "Highly accurate speech-to-text processing for both local files and YouTube videos." },
    { icon: BookOpen, title: "Smart Summaries & Notes", desc: "Hours of rambling lectures distilled into structured, easy-to-read markdown notes." },
    { icon: BrainCircuit, title: "Context-Aware AI Tutor", desc: "An assistant that only answers based on the uploaded lecture, preventing AI hallucinations." },
    { icon: FileQuestion, title: "AI Quiz Generator", desc: "Automatically generates multiple-choice questions to test your retention of key concepts." }
  ];

  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-slate-900 mb-4">Everything You Need to Learn Faster</h2>
          <p className="text-lg text-slate-600">A complete suite of tools to break down complex information.</p>
        </Reveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <Reveal key={i} delay={i * 100}>
              <div className="bg-white border border-slate-200 rounded-2xl p-8 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 group h-full">
                <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  <feature.icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </div>
            </Reveal>
          ))}

          {/* Flagship Feature Card */}
          <Reveal delay={500}>
             <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-purple-900 rounded-2xl p-8 shadow-xl shadow-purple-900/20 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden h-full border border-slate-700">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[10px] font-bold uppercase tracking-wider mb-6">
                  <Star size={12} className="fill-purple-300" /> Flagship Feature
                </div>
                <h3 className="text-2xl font-display font-bold text-white mb-3">Learner Grasp Analysis</h3>
                <p className="text-slate-300 leading-relaxed mb-6">Go beyond reading. We analyze your quiz performance to estimate exactly which concepts you've mastered and which need revision.</p>
                <a href="#analysis" className="inline-flex items-center gap-2 text-purple-300 font-semibold hover:text-white transition-colors">
                  See how it works <ArrowRight size={16} />
                </a>
             </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function LearnerGraspAnalysis() {
  return (
    <section id="analysis" className="py-32 relative overflow-hidden bg-slate-950">
      {/* Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Reveal>
            <h2 className="font-display text-4xl lg:text-5xl font-extrabold text-white mb-6">Stop Guessing. <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Know What You Know.</span></h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-xl text-slate-400">The Learner Grasp Analysis synthesizes your quiz interactions into a clear, actionable map of your understanding.</p>
          </Reveal>
        </div>

        <Reveal delay={200} className="max-w-4xl mx-auto">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 lg:p-12 shadow-2xl">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              
              {/* Left: Overall Gauge */}
              <div className="flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-slate-800 pb-10 md:pb-0 md:pr-10">
                <div className="relative w-48 h-48 mb-6">
                  {/* Background Circle */}
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#1e293b" strokeWidth="8" />
                    {/* Animated Foreground Circle */}
                    <circle cx="50" cy="50" r="45" fill="none" stroke="url(#gradient)" strokeWidth="8" strokeLinecap="round" 
                      className="gauge-anim" style={{ strokeDasharray: 283, strokeDashoffset: 283 }} />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#9333ea" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-display font-bold text-white">78<span className="text-2xl text-slate-500">%</span></span>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">Overall Grasp</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Developing Mastery</h3>
                <p className="text-sm text-slate-400">You have a solid foundation, but a few complex topics require revision.</p>
              </div>

              {/* Right: Concept Breakdown */}
              <div className="space-y-6">
                <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2"><Target size={16}/> Concept Breakdown</h4>
                
                {/* Concept 1 */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white font-medium">Neural Networks</span>
                    <span className="text-green-400 font-bold">95%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full w-[95%] bar-fill" style={{ animationDelay: '0.5s' }}></div>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-bold">Status: Strong</p>
                </div>

                {/* Concept 2 */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white font-medium">Backpropagation</span>
                    <span className="text-amber-400 font-bold">60%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div className="bg-amber-500 h-2 rounded-full w-[60%] bar-fill" style={{ animationDelay: '0.7s' }}></div>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-bold">Status: Moderate</p>
                </div>

                {/* Concept 3 */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white font-medium">Gradient Descent</span>
                    <span className="text-rose-400 font-bold">30%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div className="bg-rose-500 h-2 rounded-full w-[30%] bar-fill" style={{ animationDelay: '0.9s' }}></div>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-bold">Status: Needs Review</p>
                </div>
              </div>

            </div>

            {/* Action Row */}
            <div className="mt-10 pt-8 border-t border-slate-800">
              <h4 className="text-sm font-medium text-slate-400 mb-4 text-center md:text-left">Recommended Actions</h4>
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <button className="text-xs font-semibold px-4 py-2 bg-rose-500/10 text-rose-300 border border-rose-500/20 rounded-full hover:bg-rose-500/20 transition-colors flex items-center gap-2">
                  <BookOpen size={14}/> Review "Gradient Descent"
                </button>
                <button className="text-xs font-semibold px-4 py-2 bg-slate-800 text-slate-300 border border-slate-700 rounded-full hover:bg-slate-700 transition-colors flex items-center gap-2">
                  <Play size={14}/> Revisit Timestamp 14:20
                </button>
                <button className="text-xs font-semibold px-4 py-2 bg-blue-500/10 text-blue-300 border border-blue-500/20 rounded-full hover:bg-blue-500/20 transition-colors flex items-center gap-2">
                  <FileQuestion size={14}/> Take Targeted Quiz
                </button>
              </div>
            </div>
          </div>
          <p className="text-center text-xs text-slate-500 mt-6">* Scores are AI-estimated based on quiz performance and interaction metrics.</p>
        </Reveal>
      </div>
    </section>
  );
}

function RagAiTutor() {
  return (
    <section className="py-24 bg-white overflow-hidden border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Mockup Left */}
          <div className="order-2 lg:order-1 relative">
            <Reveal className="bg-slate-50 border border-slate-200 rounded-3xl p-4 shadow-xl">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[400px]">
                <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                    <BrainCircuit size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Graspify Tutor</h4>
                    <p className="text-[10px] text-slate-500">Strictly grounded in uploaded lecture</p>
                  </div>
                </div>
                
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                  {/* User Message */}
                  <div className="flex justify-end">
                    <div className="bg-blue-600 text-white text-sm rounded-2xl rounded-tr-sm px-4 py-3 max-w-[85%] shadow-sm">
                      Can you explain how RNA polymerase works according to the professor?
                    </div>
                  </div>
                  
                  {/* AI Message */}
                  <div className="flex justify-start">
                    <div className="bg-slate-100 text-slate-700 text-sm rounded-2xl rounded-tl-sm px-4 py-3 max-w-[90%] shadow-sm">
                      <p className="mb-2">According to the lecture, RNA polymerase binds to the promoter region of the DNA and unwinds the double helix to begin transcription.</p>
                      <div className="bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-500 font-mono mt-2 flex items-start gap-2">
                        <Clock size={12} className="mt-0.5 shrink-0" />
                        <span>"At exactly 12 minutes in, we see RNA polymerase attaching to the promoter sequence..."</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-white border-t border-slate-100">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 flex items-center gap-2 opacity-50 cursor-not-allowed">
                    <div className="flex-1 text-sm text-slate-400">Ask a question about the lecture...</div>
                    <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center"><ArrowRight size={14} className="text-slate-400"/></div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Content Right */}
          <div className="order-1 lg:order-2">
            <Reveal>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 text-purple-700 text-xs font-bold uppercase tracking-wider mb-6 border border-purple-100">
                <Shield size={14} /> Grounded AI Responses
              </div>
            </Reveal>
            <Reveal delay={100}>
              <h2 className="font-display text-4xl font-extrabold text-slate-900 mb-6 leading-tight">
                An AI Tutor that doesn't hallucinate.
              </h2>
            </Reveal>
            <Reveal delay={200}>
              <p className="text-lg text-slate-600 mb-6">
                Generic AI tools make up facts when they don't know the answer. The Graspify AI Tutor is strictly sandboxed to your uploaded lecture transcript.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-green-500 mt-0.5 shrink-0" size={20} />
                  <span className="text-slate-700">Answers are directly cited from the source material.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-green-500 mt-0.5 shrink-0" size={20} />
                  <span className="text-slate-700">Includes exact timestamp references for video/audio.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-green-500 mt-0.5 shrink-0" size={20} />
                  <span className="text-slate-700">Advises "I don't know" if the concept wasn't covered.</span>
                </li>
              </ul>
            </Reveal>
          </div>

        </div>
      </div>
    </section>
  );
}

function QuizSection() {
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const options = [
    { id: 'a', text: "It remains constant regardless of velocity.", correct: false },
    { id: 'b', text: "Time dilates (slows down) as an object approaches the speed of light.", correct: true },
    { id: 'c', text: "Time accelerates as mass increases.", correct: false },
    { id: 'd', text: "It only applies to particles with zero rest mass.", correct: false }
  ];

  const handleSelect = (id) => {
    if(!isSubmitted) setSelectedOption(id);
  };

  const handleSubmit = () => {
    if(selectedOption) setIsSubmitted(true);
  };

  const reset = () => {
    setSelectedOption(null);
    setIsSubmitted(false);
  };

  return (
    <section className="py-24 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Reveal>
            <h2 className="font-display text-3xl font-bold text-slate-900 mb-4">Active Recall Built-In</h2>
            <p className="text-lg text-slate-600">Automatically generate quizzes to test your knowledge immediately after consuming content.</p>
          </Reveal>
        </div>

        <Reveal delay={200} className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 p-6 sm:p-8 relative overflow-hidden">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
              <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Question 1 of 5</span>
              <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                <span className="text-[10px] font-bold px-2 py-1 rounded bg-white shadow-sm text-slate-700">Hard</span>
              </div>
            </div>
            
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-6">
              According to the lecture on Special Relativity, how does time behave for an object in motion?
            </h3>

            <div className="space-y-3 mb-8">
              {options.map((opt) => {
                let btnClass = "w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-start gap-3 ";
                if (!isSubmitted) {
                  btnClass += selectedOption === opt.id ? "border-blue-500 bg-blue-50 text-blue-900" : "border-slate-100 bg-white hover:border-blue-200 hover:bg-slate-50 text-slate-700";
                } else {
                  if (opt.correct) {
                    btnClass += "border-green-500 bg-green-50 text-green-900";
                  } else if (selectedOption === opt.id && !opt.correct) {
                    btnClass += "border-rose-500 bg-rose-50 text-rose-900 opacity-50";
                  } else {
                    btnClass += "border-slate-100 bg-white opacity-50 text-slate-500";
                  }
                }

                return (
                  <button key={opt.id} onClick={() => handleSelect(opt.id)} disabled={isSubmitted} className={btnClass}>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${selectedOption === opt.id ? 'border-blue-500 bg-blue-500' : 'border-slate-300'}`}>
                      {selectedOption === opt.id && <div className="w-2 h-2 rounded-full bg-white"></div>}
                    </div>
                    <span className="font-medium text-sm sm:text-base leading-tight">{opt.text}</span>
                  </button>
                );
              })}
            </div>

            {!isSubmitted ? (
              <button onClick={handleSubmit} disabled={!selectedOption} className={`w-full py-3 rounded-xl font-bold text-white transition-all ${selectedOption ? 'bg-gradient-to-r from-blue-600 to-purple-600 shadow-md hover:shadow-lg hover:-translate-y-0.5' : 'bg-slate-300 cursor-not-allowed'}`}>
                Check Answer
              </button>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4">
                <div className={`p-4 rounded-xl flex items-start gap-3 mb-4 ${options.find(o=>o.id===selectedOption)?.correct ? 'bg-green-100 text-green-800' : 'bg-rose-100 text-rose-800'}`}>
                  {options.find(o=>o.id===selectedOption)?.correct ? <CheckCircle2 className="mt-0.5 shrink-0"/> : <X className="mt-0.5 shrink-0"/>}
                  <div>
                    <h4 className="font-bold mb-1">{options.find(o=>o.id===selectedOption)?.correct ? "Correct! Concept mastered." : "Incorrect. Needs Review."}</h4>
                    <p className="text-sm opacity-90">Time dilation dictates that moving clocks run slower compared to stationary observers.</p>
                  </div>
                </div>
                <button onClick={reset} className="w-full py-3 rounded-xl font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors">
                  Try Again
                </button>
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function MultilingualSection() {
  const languages = ["English", "Hindi", "Marathi", "Spanish", "French", "German", "Japanese"];
  
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <Reveal>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-blue-600 mb-6">
            <Languages size={32} />
          </div>
          <h2 className="font-display text-3xl font-bold text-slate-900 mb-6">Break Language Barriers</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10">
            Upload lectures in dozens of languages. Graspify automatically translates them, delivering your notes, summaries, and quizzes in clear English.
          </p>
        </Reveal>

        <Reveal delay={100} className="flex flex-wrap justify-center gap-3 mb-4 max-w-3xl mx-auto">
          {languages.map((lang, i) => (
            <span key={lang} className="px-4 py-2 bg-slate-50 border border-slate-200 text-slate-700 font-medium rounded-full hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-default">
              {lang}
            </span>
          ))}
          <span className="px-4 py-2 bg-blue-50 text-blue-700 font-bold rounded-full">+ Many More</span>
        </Reveal>
        
        <Reveal delay={200}>
          <p className="text-xs text-slate-400 mb-16">* Supports multiple commonly used languages globally.</p>
        </Reveal>

        {/* Horizontal Flow Diagram */}
        <div className="relative max-w-4xl mx-auto">
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 -z-10"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-4 relative z-10">
            
            <Reveal delay={300} className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-white border-2 border-slate-200 flex items-center justify-center mb-4 shadow-sm">
                <Mic className="text-slate-400" />
              </div>
              <span className="text-sm font-bold text-slate-800">Original Audio</span>
            </Reveal>

            <Reveal delay={400} className="flex flex-col items-center">
              <div className="hidden md:block absolute top-8 -ml-8"><ArrowRightCircle className="text-slate-300 bg-white rounded-full" size={20}/></div>
              <div className="w-16 h-16 rounded-2xl bg-white border-2 border-slate-200 flex items-center justify-center mb-4 shadow-sm">
                <FileText className="text-slate-400" />
              </div>
              <span className="text-sm font-bold text-slate-800">Original Transcript</span>
            </Reveal>

            <Reveal delay={500} className="flex flex-col items-center">
              <div className="hidden md:block absolute top-8 -ml-8"><ArrowRightCircle className="text-blue-300 bg-white rounded-full" size={20}/></div>
              <div className="w-16 h-16 rounded-2xl bg-blue-50 border-2 border-blue-200 flex items-center justify-center mb-4 shadow-sm">
                <Languages className="text-blue-600" />
              </div>
              <span className="text-sm font-bold text-blue-800">English Translation</span>
            </Reveal>

            <Reveal delay={600} className="flex flex-col items-center">
              <div className="hidden md:block absolute top-8 -ml-8"><ArrowRightCircle className="text-purple-300 bg-white rounded-full" size={20}/></div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center mb-4 shadow-md">
                <GraduationCap className="text-white" />
              </div>
              <span className="text-sm font-bold text-purple-900">AI Study Resources</span>
            </Reveal>

          </div>
        </div>
      </div>
    </section>
  );
}

function DashboardPreview() {
  return (
    <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <Reveal className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display text-3xl font-bold mb-4">Your Central Hub for Knowledge</h2>
          <p className="text-slate-400">Everything organized beautifully in one intuitive dashboard.</p>
        </Reveal>

        <Reveal delay={200} className="w-full max-w-5xl mx-auto">
          {/* Browser Chrome */}
          <div className="rounded-t-2xl bg-slate-800 border border-slate-700 border-b-0 p-3 flex items-center gap-2">
            <div className="flex gap-1.5 ml-2">
              <div className="w-3 h-3 rounded-full bg-rose-500"></div>
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="mx-auto w-1/2 max-w-sm bg-slate-900 rounded-md py-1 px-3 text-center text-xs text-slate-500 font-mono">
              app.graspify.com/dashboard
            </div>
          </div>
          
          {/* Dashboard Body */}
          <div className="bg-slate-950 border border-slate-700 rounded-b-2xl shadow-2xl flex h-[500px] overflow-hidden">
            {/* Sidebar Mock */}
            <div className="w-16 sm:w-48 bg-slate-900 border-r border-slate-800 p-4 flex flex-col gap-4">
              <div className="flex items-center gap-2 text-white mb-4">
                <img src="/logo.png" alt="Graspify Logo" className="w-8 h-auto shrink-0" />
                <span className="font-display font-bold hidden sm:block">Graspify</span>
              </div>
              
              <div className="space-y-2">
                {[{icon: LayoutDashboard, label: "Dashboard", active: true}, {icon: Compass, label: "My Content"}, {icon: BookOpen, label: "Summaries"}, {icon: BrainCircuit, label: "AI Tutor"}, {icon: Target, label: "Grasp Analysis"}].map((item, i) => (
                  <div key={i} className={`flex items-center gap-3 p-2 rounded-lg ${item.active ? 'bg-blue-600/20 text-blue-400' : 'text-slate-500'}`}>
                    <item.icon size={18} className="shrink-0" />
                    <span className="text-sm font-medium hidden sm:block">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Main Content Mock */}
            <div className="flex-1 p-6 sm:p-8 bg-slate-950/50 overflow-hidden relative">
              <h3 className="text-2xl font-bold text-white mb-1">Introduction to Machine Learning</h3>
              <p className="text-sm text-slate-500 mb-8">Uploaded 2 hours ago • English Translated</p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {/* Mock Cards */}
                {[
                  {title: "Full Transcript", icon: FileText, color: "text-blue-400", bg: "bg-blue-400/10"},
                  {title: "AI Summary", icon: Zap, color: "text-amber-400", bg: "bg-amber-400/10"},
                  {title: "Key Concepts (8)", icon: BookOpen, color: "text-green-400", bg: "bg-green-400/10"},
                  {title: "Quiz Score: 85%", icon: Trophy, color: "text-purple-400", bg: "bg-purple-400/10"},
                  {title: "Learner Grasp", icon: Target, color: "text-pink-400", bg: "bg-pink-400/10", glow: true},
                  {title: "Recommended", icon: Compass, color: "text-slate-400", bg: "bg-slate-800"},
                ].map((card, i) => (
                  <div key={i} className={`p-4 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 transition-colors cursor-pointer group ${card.glow ? 'ring-1 ring-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : ''}`}>
                    <div className={`w-10 h-10 rounded-lg ${card.bg} ${card.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <card.icon size={20} />
                    </div>
                    <h4 className="font-semibold text-sm text-slate-200">{card.title}</h4>
                    <div className="h-2 w-1/2 bg-slate-800 rounded mt-2"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Pricing() {
  const plans = [
    { name: "Free", price: "₹0", desc: "Basic tools to get started.", features: ["3 uploads per day", "Transcripts & Summaries", "Basic AI Tutor", "English only"] },
    { name: "Basic", price: "₹149", desc: "For casual learners.", features: ["10 uploads per day", "All free features", "Flashcards & Notes", "Multilingual Support"] },
    { name: "Pro", price: "₹249", desc: "For dedicated students.", features: ["25 uploads per day", "Unlimited Quizzes", "Learner Grasp Analysis", "Priority Processing"], popular: true },
    { name: "Premium", price: "₹349", desc: "For power users.", features: ["50 uploads per day", "All Pro features", "Advanced Export options", "Early access to features"] },
  ];

  return (
    <section id="pricing" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display text-3xl font-bold text-slate-900 mb-4">Simple, Transparent Pricing</h2>
          <p className="text-lg text-slate-600">Choose the plan that fits your learning pace.</p>
        </Reveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
          {plans.map((plan, i) => (
            <Reveal key={plan.name} delay={i * 100} className={`relative bg-white rounded-3xl border ${plan.popular ? 'border-purple-500 shadow-2xl shadow-purple-600/20 lg:-translate-y-4' : 'border-slate-200 shadow-lg shadow-slate-200/50'} p-8 flex flex-col h-full hover:-translate-y-2 transition-transform duration-300`}>
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
              
              <button className={`w-full py-3 rounded-xl font-bold transition-all ${plan.popular ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'}`}>
                {plan.price === "₹0" ? "Start Free" : "Upgrade"}
              </button>
            </Reveal>
          ))}
        </div>
        
        <Reveal delay={400}>
          <p className="text-center text-sm text-slate-500 mt-12">* Maximum 30 minutes per media upload on all standard plans.</p>
        </Reveal>
      </div>
    </section>
  );
}

function FAQ() {
  const faqs = [
    { q: "What types of files can I upload?", a: "You can upload standard audio and video formats (mp3, mp4, wav, m4a) or simply paste a public YouTube URL." },
    { q: "Which languages are supported?", a: "We support over 50 languages including English, Spanish, Hindi, French, German, and Japanese. Regardless of the input language, we translate your study materials into English." },
    { q: "How accurate is the Learner Grasp Analysis?", a: "The analysis is an AI-estimated score based on your performance in the generated quizzes. It's designed to guide your revision, not serve as a certified academic grade." },
    { q: "Can the AI Tutor hallucinate answers?", a: "No. The AI Tutor is strictly grounded using RAG (Retrieval-Augmented Generation) on your specific lecture transcript. If the answer isn't in the video, it will tell you it doesn't know." },
    { q: "Is there a limit to video length?", a: "Currently, all uploads are capped at 30 minutes maximum to ensure fast processing and optimal AI performance." },
    { q: "Do I need a credit card for the free plan?", a: "Absolutely not. You can sign up and use the free plan features immediately without providing any payment information." },
    { q: "Can I export my notes and flashcards?", a: "Yes, you can copy the markdown notes and we are actively working on PDF and Anki export features for premium users." },
    { q: "How do I cancel my subscription?", a: "You can cancel anytime from your Account Profile settings. You will retain pro access until the end of your current billing cycle." }
  ];

  const [openIdx, setOpenIdx] = useState(0);

  return (
    <section id="faq" className="py-24 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center mb-16">
          <h2 className="font-display text-3xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
        </Reveal>

        <Reveal delay={100} className="bg-white border border-slate-200 rounded-3xl shadow-lg shadow-slate-100 overflow-hidden divide-y divide-slate-100">
          {faqs.map((faq, i) => {
            const isOpen = openIdx === i;
            return (
              <div key={i} className="group">
                <button 
                  onClick={() => setOpenIdx(isOpen ? -1 : i)} 
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors focus:outline-none"
                >
                  <span className="font-bold text-slate-800 pr-4">{faq.q}</span>
                  <ChevronDown size={20} className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-600' : ''}`} />
                </button>
                <div 
                  className="grid transition-all duration-300 ease-in-out px-6"
                  style={{ gridTemplateRows: isOpen ? '1fr' : '0fr', opacity: isOpen ? 1 : 0, paddingBottom: isOpen ? '20px' : '0px' }}
                >
                  <div className="overflow-hidden">
                    <p className="text-slate-600 leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}

function FinalCTA() {
  const navigate = useNavigate();
  return (
    <section className="relative py-24 overflow-hidden bg-slate-950 flex items-center justify-center min-h-[500px]">
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 z-0"></div>
      
      {/* Blurred glow behind text */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-[100px] opacity-30 pointer-events-none z-0"></div>
      
      <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
        <Reveal>
          <h2 className="font-display text-5xl md:text-6xl font-extrabold text-white mb-6">Stop rewatching.<br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Start understanding.</span></h2>
        </Reveal>
        <Reveal delay={100}>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">Join thousands of learners saving hours of time while actively improving their grasp on complex subjects.</p>
        </Reveal>
        <Reveal delay={200} className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button onClick={() => navigate("/register")} className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg shadow-lg shadow-purple-600/20 hover:-translate-y-1 hover:shadow-purple-600/40 transition-all duration-300">
            Get Started for Free
          </button>
          <button onClick={() => navigate("/login")} className="w-full sm:w-auto px-8 py-4 text-slate-300 font-semibold hover:text-white transition-colors">
            Log in to existing account
          </button>
        </Reveal>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Graspify Logo" className="w-6 h-auto" />
          <span className="font-display font-bold text-slate-200">Graspify</span>
        </div>
        
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm font-medium text-slate-400">
          <a href="#" className="hover:text-slate-200 transition-colors">Product</a>
          <a href="#features" className="hover:text-slate-200 transition-colors">Features</a>
          <a href="#pricing" className="hover:text-slate-200 transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-slate-200 transition-colors">FAQ</a>
          <a href="#" className="hover:text-slate-200 transition-colors">Privacy</a>
          <a href="#" className="hover:text-slate-200 transition-colors">Terms</a>
        </div>
        
        <div className="text-sm text-slate-500">
          &copy; {new Date().getFullYear()} Graspify. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

// --- MAIN PAGE EXPORT ---

export default function Landing() {
  useEffect(() => {
    if (!document.getElementById('graspify-fonts')) {
      const link = document.createElement('link');
      link.id = 'graspify-fonts';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@700;800&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  return (
    <>
      <style>{`
        .graspify-root {
          font-family: 'Inter', sans-serif;
          scroll-behavior: smooth;
        }

        .font-display {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        @keyframes floatY {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes floatY-fast {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes floatY-slow {
          0%, 100% { transform: translateY(0px) rotate(-8deg); }
          50% { transform: translateY(-20px) rotate(-6deg); }
        }

        .float-y-medium { animation: floatY 6s ease-in-out infinite; }
        .float-y-fast { animation: floatY-fast 4s ease-in-out infinite; }
        .float-y-slow { animation: floatY-slow 8s ease-in-out infinite; }

        @keyframes fillBar {
          from { width: 0%; }
        }
        .bar-fill {
          animation: fillBar 1.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        
        @keyframes fillFloat {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
        .float-fill {
          animation: fillFloat 2s ease-out forwards;
        }

        @keyframes gaugeFill {
          from { stroke-dashoffset: 283; }
          to { stroke-dashoffset: 62.26; }
        }
        .gauge-anim {
          animation: gaugeFill 2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          animation-delay: 0.2s;
        }
      `}</style>

      <div className="graspify-root bg-white text-slate-900 min-h-screen selection:bg-blue-200 selection:text-blue-900">
        <Navbar />
        <Hero />
        <TrustStrip />
        <ProblemSection />
        <HowItWorks />
        <CoreFeatures />
        <LearnerGraspAnalysis />
        <RagAiTutor />
        <QuizSection />
        <MultilingualSection />
        <DashboardPreview />
        <Pricing />
        <FAQ />
        <FinalCTA />
        <Footer />
      </div>
    </>
  );
}
