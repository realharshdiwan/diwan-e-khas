import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Music, Wifi, Sparkles, Key, Home, Calendar as EventIcon, MapPin, Mail } from 'lucide-react';
import { jsPDF } from 'jspdf';

const useKonamiCode = (action: () => void) => {
  useEffect(() => {
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let konamiIndex = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === konamiCode[konamiIndex].toLowerCase()) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
          action();
          konamiIndex = 0;
        }
      } else {
        konamiIndex = e.key.toLowerCase() === 'arrowup' ? 1 : 0;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [action]);
};

// Generative Ambient Drone (Tanpura-ish)
const useAmbientDrone = (isPlaying: boolean) => {
  const ctxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const oscsRef = useRef<OscillatorNode[]>([]);
  const lfoRef = useRef<OscillatorNode | null>(null);

  useEffect(() => {
    if (isPlaying) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      if (!ctxRef.current) {
        ctxRef.current = new AudioContextClass();
      }
      const ctx = ctxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0, ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 3); // Slow fade in
      masterGain.connect(ctx.destination);
      masterGainRef.current = masterGain;

      // Drone frequencies (C sharp mix)
      const freqs = [138.59, 207.65, 69.30]; // C#3, G#3, C#2
      
      // LFO for slow pulsing
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 0.1; // 10 seconds per cycle
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.05;
      lfo.connect(lfoGain);

      const oscs = freqs.map((f, i) => {
        const osc = ctx.createOscillator();
        osc.type = i === 2 ? 'triangle' : 'sine';
        osc.frequency.value = f;
        
        const oscGain = ctx.createGain();
        oscGain.gain.value = 1 / freqs.length;
        
        // Connect LFO to this oscillator's gain
        lfoGain.connect(oscGain.gain);

        osc.connect(oscGain);
        oscGain.connect(masterGain);
        
        osc.start();
        return osc;
      });
      
      lfo.start();
      lfoRef.current = lfo;
      oscsRef.current = oscs;

    } else {
      // Fade out and cleanup
      const masterGain = masterGainRef.current;
      const ctx = ctxRef.current;
      if (masterGain && ctx) {
        masterGain.gain.setValueAtTime(masterGain.gain.value, ctx.currentTime);
        masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 2);
        
        setTimeout(() => {
          oscsRef.current.forEach(osc => { try { osc.stop(); osc.disconnect(); } catch (e) {} });
          if (lfoRef.current) { try { lfoRef.current.stop(); lfoRef.current.disconnect(); } catch(e) {} }
          masterGain.disconnect();
          oscsRef.current = [];
          lfoRef.current = null;
        }, 2100);
      }
    }
  }, [isPlaying]);
};

// 1. Darbaar Curtain Entrance
const Curtains = () => {
  const [mounted, setMounted] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setMounted(false), 2000);
    return () => clearTimeout(timer);
  }, []);
  
  if (!mounted) return null;
  return (
    <div className="fixed inset-0 z-[200] flex pointer-events-none">
      <div className="w-1/2 h-full bg-maroon-hero curtain-left border-r border-gold/30"></div>
      <div className="w-1/2 h-full bg-maroon-hero curtain-right border-l border-gold/30"></div>
    </div>
  );
};

// 7. Custom Gold Cursor
const CustomCursor = () => {
  const [pos, setPos] = useState({x: 0, y: 0});
  const [trailPos, setTrailPos] = useState({x: 0, y: 0});
  const [visible, setVisible] = useState(false);
  const requestRef = useRef<number>(undefined);

  useEffect(() => {
    const isTouch = (('ontouchstart' in window) || (navigator.maxTouchPoints > 0));
    if (isTouch) return;

    setVisible(true);

    const onMouseMove = (e: MouseEvent) => {
      setPos({x: e.clientX, y: e.clientY});
    };
    window.addEventListener('mousemove', onMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
  }, []);

  useEffect(() => {
    const updateTrail = () => {
      setTrailPos(prev => {
        const diffX = pos.x - prev.x;
        const diffY = pos.y - prev.y;
        return {
          x: prev.x + diffX * 0.15,
          y: prev.y + diffY * 0.15
        };
      });
      requestRef.current = requestAnimationFrame(updateTrail);
    };
    requestRef.current = requestAnimationFrame(updateTrail);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [pos]);

  // Hide native cursor site-wide when custom is active
  useEffect(() => {
    if (visible) {
      document.body.classList.add('cursor-none-all');
      return () => document.body.classList.remove('cursor-none-all');
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <>
      <div 
        className="fixed top-0 left-0 w-2 h-2 bg-gold rounded-full pointer-events-none z-[9999] opacity-90 transition-transform duration-75" 
        style={{ transform: `translate3d(${pos.x - 4}px, ${pos.y - 4}px, 0)` }}
      />
      <div 
        className="fixed top-0 left-0 w-6 h-6 border bg-gold/20 border-gold/50 rounded-full pointer-events-none z-[9998] opacity-50" 
        style={{ transform: `translate3d(${trailPos.x - 12}px, ${trailPos.y - 12}px, 0)` }}
      />
    </>
  );
};

// Warm gold particles, slow drift upward, dense
const Particles = () => {
  const [particles, setParticles] = useState<{ id: number; left: string; size: string; duration: string; delay: string; opacity: number }[]>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 2 + 1}px`, 
      duration: `${Math.random() * 20 + 25}s`,
      delay: `-${Math.random() * 30}s`,
      opacity: Math.random() * 0.2 + 0.1,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute bg-gold rounded-full blur-[1px]"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            bottom: '-10px',
          }}
          animate={{
            y: ['0vh', '-110vh'],
            x: ['-2vw', '2vw'],
          }}
          transition={{
            y: { duration: parseFloat(p.duration), ease: 'linear', repeat: Infinity, delay: parseFloat(p.delay) },
            x: { duration: parseFloat(p.duration) * 0.8, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' },
          }}
        />
      ))}
    </div>
  );
};

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}
const Reveal: React.FC<RevealProps> = ({ children, className = '', delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, ease: "easeOut", delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 2. Mughal Arch SVG - Hero
const MughalArchSVG = () => (
  <svg className="absolute inset-x-0 w-full h-[150vh] -top-[25vh] pointer-events-none opacity-[0.03]" preserveAspectRatio="xMidYMid slice" viewBox="0 0 100 100">
    <path d="M5,100 L5,30 C5,10 50,5 50,5 C50,5 95,10 95,30 L95,100" fill="none" stroke="#C9A84C" strokeWidth="0.5" />
    <path d="M15,100 L15,35 C15,20 50,12 50,12 C50,12 85,20 85,35 L85,100" fill="none" stroke="#C9A84C" strokeWidth="0.3" />
  </svg>
);

// 4. Gold Ornamental Section Dividers
const GoldDivider = ({ className = "" }) => (
  <div className={`w-full flex items-center justify-center overflow-hidden ${className}`}>
    <div className="flex-grow h-px bg-gold-dim"></div>
    <div className="px-4 text-gold shrink-0 flex items-center justify-center">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
        <polygon points="12,2 15,9 22,12 15,15 12,22 9,15 2,12 9,9" fill="currentColor"/>
      </svg>
    </div>
    <div className="flex-grow h-px bg-gold-dim"></div>
  </div>
);

// 5. Scrolling Marquee Ticker
const Marquee = () => {
  const text = "Ilm Ki Mehfil · Jashn-E-Khas · Karkhaana · Mehfil-E-Aam · Darbaar Mein Aapka Swagat Hai · ";
  return (
    <div className="w-full bg-maroon-deep border-y border-gold/40 py-3 overflow-hidden flex relative mughal-texture">
      <div className="animate-marquee whitespace-nowrap text-gold font-sans tracking-[0.2em] font-medium text-sm flex items-center select-none">
        <span className="mx-4">{text}</span>
        <span className="mx-4">{text}</span>
        <span className="mx-4">{text}</span>
        <span className="mx-4">{text}</span>
      </div>
    </div>
  );
};

// 8. Wax Seal SVG
const WaxSeal = () => (
  <div className="absolute -right-6 -top-8 w-28 h-28 transform -rotate-12 z-20 pointer-events-none drop-shadow-xl opacity-90 hidden sm:block">
    <svg viewBox="0 0 100 100">
      <path d="M50 5 C60 2, 75 8, 85 18 C95 28, 98 45, 92 60 C88 72, 75 85, 60 92 C45 98, 28 95, 18 85 C8 75, 2 60, 5 50 C8 35, 20 20, 35 10 C40 8, 45 6, 50 5 Z" fill="#8B0000" />
      <circle cx="50" cy="50" r="36" fill="none" stroke="#C9A84C" strokeWidth="1.5" strokeDasharray="3 2" />
      <circle cx="50" cy="50" r="32" fill="none" stroke="#C9A84C" strokeWidth="0.5" />
      <text x="50" y="58" fontFamily="Playfair Display" fontSize="24" fill="#C9A84C" textAnchor="middle" fontWeight="bold">D·E·K</text>
    </svg>
  </div>
);

// 11. Mobile Bottom Nav
const MobileNav = () => (
  <div className="fixed bottom-0 left-0 w-full bg-maroon-hero border-t border-gold z-[150] md:hidden">
    <div className="flex items-center justify-around py-3 px-2">
      <a href="#" className="flex flex-col items-center text-muted hover:text-gold transition-colors">
        <Home className="w-5 h-5 mb-1" />
        <span className="text-[10px] uppercase tracking-wider">Darbaar</span>
      </a>
      <a href="#mehfilein" className="flex flex-col items-center text-muted hover:text-gold transition-colors">
        <EventIcon className="w-5 h-5 mb-1" />
        <span className="text-[10px] uppercase tracking-wider">Mehfilein</span>
      </a>
      <a href="#location" className="flex flex-col items-center text-muted hover:text-gold transition-colors">
        <MapPin className="w-5 h-5 mb-1" />
        <span className="text-[10px] uppercase tracking-wider">Pata</span>
      </a>
      <a href="#request" className="flex flex-col items-center text-muted hover:text-gold transition-colors">
        <Mail className="w-5 h-5 mb-1" />
        <span className="text-[10px] uppercase tracking-wider">Arz</span>
      </a>
    </div>
  </div>
);

export default function App() {
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  useKonamiCode(() => setShowEasterEgg(true));

  useEffect(() => {
    const t = setTimeout(() => setInitialLoad(false), 200);
    return () => clearTimeout(t);
  }, []);

  const toggleAudio = () => setIsAudioPlaying(!isAudioPlaying);
  useAmbientDrone(isAudioPlaying);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted. We'll get back. Probably.");
    (e.target as HTMLFormElement).reset();
  };

  // 9. Farman PDF Download
  const downloadFarman = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'in',
      format: 'a4'
    });
    
    // Parchment background
    doc.setFillColor(245, 230, 200); // #F5E6C8
    doc.rect(0, 0, 8.27, 11.69, 'F');
    
    // Ornate Border outer
    doc.setDrawColor(180, 140, 60);
    doc.setLineWidth(0.04);
    doc.rect(0.5, 0.5, 7.27, 10.69);
    
    // Ornate Border inner
    doc.setLineWidth(0.01);
    doc.rect(0.6, 0.6, 7.07, 10.49);

    // Decorative corner dots
    doc.setFillColor(180, 140, 60);
    doc.circle(0.55, 0.55, 0.05, 'F');
    doc.circle(7.72, 0.55, 0.05, 'F');
    doc.circle(0.55, 11.14, 0.05, 'F');
    doc.circle(7.72, 11.14, 0.05, 'F');
    
    // Header Title
    doc.setTextColor(139, 0, 0); // Maroonish red
    doc.setFont("times", "normal");
    doc.setFontSize(14);
    doc.text("S H A H I   F A R M A N", 4.135, 1.5, { align: 'center' });

    // Main seal at top
    doc.setFillColor(139, 0, 0); 
    doc.circle(4.135, 2.2, 0.35, 'F');
    doc.setTextColor(245, 230, 200);
    doc.setFontSize(12);
    doc.setFont("times", "bolditalic");
    doc.text("D·E·K", 4.135, 2.25, { align: 'center' });
    
    doc.setTextColor(26, 5, 5); // Dark text
    doc.setFont("times", "italic");
    doc.setFontSize(36);
    doc.text("Diwan-E-Khas", 4.135, 3.4, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setFont("times", "normal");
    const bodyText = [
      "By the authority vested in the collective, it is hereby decreed:",
      "",
      "That Diwan-E-Khas operates upon its own terms.",
      "That guests shall be welcomed with grace, provided they bring",
      "no disruptions to the sanctity of the Darbaar.",
      "That all gatherings shall be meaningfully curated.",
      "",
      "The location is physical. The vibe is earned."
    ];
    doc.text(bodyText, 4.135, 4.4, { align: 'center', lineHeightFactor: 1.8 });
    
    // Footer / Date
    doc.setFont("times", "italic");
    doc.setFontSize(12);
    doc.text("Given at Kaggalipura, South Bangalore.", 4.135, 8.5, { align: 'center' });
    doc.text("Issued: " + new Date().toLocaleDateString(), 4.135, 8.8, { align: 'center' });

    // Signature Area
    doc.setDrawColor(26, 5, 5);
    doc.setLineWidth(0.01);
    doc.line(2.8, 10.0, 5.47, 10.0);
    doc.setFontSize(10);
    doc.text("The Diwan / Keeper of the Khas", 4.135, 10.2, { align: 'center' });
    
    doc.save("Diwan-E-Khas-Farman.pdf");
  };

  const containerFade = initialLoad ? "opacity-0" : "opacity-100";

  return (
    <>
      <Curtains />
      <CustomCursor />
      
      <div className={`transition-opacity duration-[1800ms] ${containerFade} relative pb-16 md:pb-0`}>
        
        {/* Audio Toggle */}
        <button 
          onClick={toggleAudio}
          className="fixed top-6 right-6 z-50 text-gold hover:text-gold-light transition-colors p-2 rounded-full opacity-80 hover:opacity-100 js-cursor-pointer"
          aria-label="Toggle ambient sound"
        >
          <Music className={`w-5 h-5 ${isAudioPlaying ? 'animate-pulse' : ''}`} />
        </button>

        {/* Easter Egg Popup */}
        <AnimatePresence>
          {showEasterEgg && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-maroon-deep/90 backdrop-blur-md"
            >
              <div className="bg-maroon-hero border-2 border-gold p-12 text-center max-w-md w-full relative">
                <h2 className="text-2xl font-serif text-ivory mb-8">Diwan Sahab has been notified.</h2>
                <button 
                  onClick={() => setShowEasterEgg(false)}
                  className="px-8 py-3 bg-gold text-maroon-deep font-serif border border-gold hover:bg-transparent hover:text-gold transition-colors block mx-auto js-cursor-pointer"
                >
                  Theek Hai
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="font-sans text-ivory selection:bg-gold/30 selection:text-gold min-h-screen">
          
          {/* HERO SECTION */}
          <section className="relative h-[100svh] flex flex-col items-center justify-center bg-maroon-hero overflow-hidden mughal-texture">
            <MughalArchSVG />
            <Particles />
            
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8, duration: 1.5, ease: "easeOut" }}
              className="relative z-10 text-center px-4 flex flex-col items-center max-w-4xl w-full mt-10"
            >
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-serif italic text-gold mb-8 drop-shadow-md tracking-wider">
                Diwan-E-Khas
              </h1>
              
              <div className="w-full flex items-center justify-center overflow-hidden mb-8 max-w-lg mx-auto opacity-70">
                <div className="flex-grow h-px bg-gold"></div>
                <div className="px-4 text-gold shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <polygon points="12,2 15,9 22,12 15,15 12,22 9,15 2,12 9,9" fill="currentColor"/>
                  </svg>
                </div>
                <div className="flex-grow h-px bg-gold"></div>
              </div>
              
              <p className="text-xs md:text-sm font-sans tracking-[0.4em] uppercase text-ivory mb-16 opacity-90">
                Kaggalipura ka sabse khas address
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full sm:w-auto mt-4 px-6 sm:px-0">
                <a href="#about" className="px-10 py-4 bg-gold text-maroon-hero font-medium rounded-sm border border-gold hover:bg-transparent hover:text-gold transition-all duration-300 text-center w-full sm:w-48 tracking-widest uppercase text-sm js-cursor-pointer">
                  Padharo
                </a>
                <a href="#mehfilein" className="px-10 py-4 border border-gold text-gold font-medium rounded-sm hover:bg-gold hover:text-maroon-hero transition-all duration-300 text-center w-full sm:w-48 tracking-widest uppercase text-sm js-cursor-pointer">
                  Dekhte Hain
                </a>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.8, duration: 1 }}
              className="absolute bottom-20 md:bottom-10 left-1/2 -translate-x-1/2 z-10 text-gold"
            >
              <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
                <ChevronDown className="w-8 h-8 shrink-0 opacity-70" />
              </motion.div>
            </motion.div>
          </section>

          <GoldDivider />

          {/* ABOUT "Ek Khas Jagah" */}
          <section id="about" className="py-24 md:py-32 bg-maroon-deep relative mughal-texture border-y border-gold/10">
            <div className="max-w-6xl mx-auto px-6 lg:px-12 relative z-10">
              <Reveal>
                <div className="flex flex-col items-center mb-16 text-center">
                  <h2 className="text-4xl md:text-5xl font-serif text-gold italic tracking-wide mb-6">Ek Khas Jagah</h2>
                  <GoldDivider className="max-w-2xl" />
                </div>
              </Reveal>
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-12 items-center relative z-10">
                <div className="md:col-span-7 lg:col-span-8 border-l border-gold/30 pl-6 md:pl-10 relative">
                  <Reveal delay={0.1}>
                    <p className="text-lg md:text-xl text-ivory leading-[1.8] font-light max-w-2xl bg-black/10 p-4 md:p-8 rounded-sm">
                      Tucked in the quieter side of South Bangalore. Close enough to everything. Far enough to think. 
                      Diwan-E-Khas is where people come to gather, create, and occasionally get nothing done. 
                      That counts too.
                    </p>
                  </Reveal>
                </div>
                
                <div className="md:col-span-5 lg:col-span-4">
                  <Reveal delay={0.2}>
                    <div className="flex flex-col gap-10">
                      <div className="flex items-center gap-6 group">
                        <Wifi className="w-6 h-6 text-gold shrink-0 transition-transform group-hover:scale-110" />
                        <span className="text-ivory font-light text-lg">Always connected</span>
                      </div>
                      <div className="flex items-center gap-6 group">
                        <Sparkles className="w-6 h-6 text-gold shrink-0 transition-transform group-hover:scale-110" />
                        <span className="text-ivory font-light text-lg">Always something on</span>
                      </div>
                      <div className="flex items-center gap-6 group">
                        <Key className="w-6 h-6 text-gold shrink-0 transition-transform group-hover:scale-110" />
                        <span className="text-ivory font-light text-lg">Open to the right people</span>
                      </div>
                    </div>
                  </Reveal>
                </div>
              </div>
            </div>
          </section>

          <Marquee />

          {/* MEHFILEIN */}
          <section id="mehfilein" className="py-24 md:py-32 bg-maroon-hero relative mughal-texture border-y border-gold/10">
            <div className="max-w-6xl mx-auto px-6 lg:px-12 relative z-10">
              <Reveal>
                <div className="flex flex-col items-center mb-20 text-center">
                  <h2 className="text-4xl md:text-5xl font-serif text-gold italic tracking-wide mb-4">Mehfilein</h2>
                  <p className="text-muted tracking-widest text-sm uppercase mb-6">What happens at Diwan-E-Khas</p>
                  <GoldDivider className="max-w-2xl" />
                </div>
              </Reveal>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                {[
                  {
                    num: "I",
                    title: "Ilm Ki Mehfil",
                    desc: "The intent is always productivity. The results vary. The company doesn't."
                  },
                  {
                    num: "II",
                    title: "Jashn-E-Khas",
                    desc: "Curated guest list. No dress code. Good energy is the only entry requirement."
                  },
                  {
                    num: "III",
                    title: "Karkhaana",
                    desc: "For when you have an idea and need a room that doesn't judge it."
                  },
                  {
                    num: "IV",
                    title: "Mehfil-E-Aam",
                    desc: "Occasionally public. Announced when ready. Worth watching for."
                  }
                ].map((item, idx) => (
                  <Reveal key={idx} delay={idx * 0.1}>
                    <div className="group h-full flex flex-col justify-between p-10 bg-maroon-card border border-gold-dim hover:border-gold transition-all duration-500 hover:-translate-y-1 rounded-sm shadow-none hover:shadow-[0_0_25px_rgba(201,168,76,0.15)] cursor-default relative overflow-hidden">
                      <div className="absolute inset-0 bg-maroon-deep opacity-0 group-hover:opacity-20 transition-opacity pointer-events-none"></div>
                      <div className="relative z-10">
                        <p className="text-gold-dim font-serif text-lg mb-6 leading-none transition-colors group-hover:text-gold">{item.num}</p>
                        <h3 className="text-3xl font-serif italic text-gold mb-6">{item.title}</h3>
                      </div>
                      <p className="text-muted leading-relaxed font-light text-base relative z-10">{item.desc}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          <GoldDivider />

          {/* AAPKE LIYE */}
          <section className="py-32 bg-maroon-deep flex flex-col relative mughal-texture border-y border-gold/10">
            <div className="relative z-10 w-full">
              {[
                "You're done studying alone.",
                "You have something worth celebrating.",
                "You just need a different ceiling."
              ].map((text, idx) => (
                <React.Fragment key={idx}>
                  <Reveal delay={idx * 0.2}>
                    <div className="py-12 md:py-16 text-center px-4 w-full">
                      <p className="text-3xl md:text-5xl lg:text-6xl text-ivory font-serif italic tracking-wide">{text}</p>
                    </div>
                  </Reveal>
                  {idx < 2 && <div className="h-px bg-gold-dim w-full max-w-4xl mx-auto opacity-30"></div>}
                </React.Fragment>
              ))}
            </div>
          </section>

          <GoldDivider />

          {/* ROYAL DECREE */}
          <section className="py-24 md:py-40 bg-maroon-hero relative flex items-center justify-center mughal-texture border-y border-gold/10">
            <div className="max-w-4xl mx-auto px-6 relative z-10 w-full">
              <Reveal>
                <div className="relative p-12 md:p-20 py-20 text-center border-double border-[6px] border-gold rounded-sm bg-maroon-deep backdrop-blur-md shadow-[0_0_50px_rgba(201,168,76,0.05)]">
                  
                  <div className="absolute inset-0 bg-parchment opacity-[0.08] pointer-events-none mix-blend-overlay z-0"></div>
                  
                  <WaxSeal />
                  
                  <div className="relative z-10 flex flex-col items-center gap-5 md:gap-7 font-serif italic text-xl md:text-3xl text-ivory leading-[1.6]">
                    <Reveal delay={0}><p className="text-sm md:text-base font-sans font-medium uppercase tracking-[0.3em] text-gold not-italic mb-2 md:mb-6">S H A H I &nbsp; F A R M A N</p></Reveal>
                    <Reveal delay={0.1}><p className="text-base md:text-lg text-muted not-italic mb-2 md:mb-4">By the authority vested in the collective, it is hereby decreed:</p></Reveal>
                    <Reveal delay={0.2}><p>That Diwan-E-Khas operates upon its own terms.</p></Reveal>
                    <Reveal delay={0.4}><p className="max-w-xl mx-auto">That guests shall be welcomed with grace, provided they bring no disruptions to the sanctity of the Darbaar.</p></Reveal>
                    <Reveal delay={0.6}><p>That all gatherings shall be meaningfully curated.</p></Reveal>
                    <Reveal delay={0.8}><p className="mt-4 md:mt-8">The location is physical. The vibe is earned.</p></Reveal>
                  </div>

                  <Reveal delay={1}>
                    <button 
                      onClick={downloadFarman}
                      className="relative z-10 mt-14 px-8 py-3 border-2 border-gold text-gold font-sans uppercase tracking-widest text-[11px] font-semibold hover:bg-gold hover:text-maroon-deep transition-all duration-300 js-cursor-pointer rounded-sm"
                    >
                      Download Farman
                    </button>
                  </Reveal>
                </div>
              </Reveal>
            </div>
          </section>

          <GoldDivider />

          {/* TESTIMONIALS */}
          <section className="py-24 md:py-32 bg-maroon-deep relative mughal-texture border-y border-gold/10">
            <div className="max-w-6xl mx-auto px-6 lg:px-12 relative z-10">
              <Reveal>
                <div className="flex flex-col items-center mb-20 text-center">
                  <h2 className="text-4xl md:text-5xl font-serif text-gold italic tracking-wide mb-6">Darbaar Ki Raye</h2>
                  <GoldDivider className="max-w-2xl" />
                </div>
              </Reveal>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    quote: "Aaya tha ek ghante ke liye. Teen din baad nikla.",
                    author: "Shrimaan R.",
                    title: "Frequent Visitor"
                  },
                  {
                    quote: "Expected a place. Found a feeling.",
                    author: "Lady P.",
                    title: "Cultural Attaché"
                  },
                  {
                    quote: "Productive? No. Worth it? Completely.",
                    author: "The Honourable A.",
                    title: "Study Envoy"
                  }
                ].map((item, index) => (
                  <Reveal key={index} delay={index * 0.1}>
                    <div className="p-10 bg-maroon-card border border-gold/20 hover:border-gold transition-all duration-500 hover:-translate-y-1 rounded-sm flex flex-col h-full justify-between shadow-none relative overflow-hidden group">
                      <div className="absolute w-full h-full inset-0 bg-gold opacity-0 group-hover:opacity-[0.03] pointer-events-none transition-opacity"></div>
                      <span className="text-gold font-serif text-6xl leading-[0] mt-6 mb-4 opacity-50 group-hover:opacity-100 transition-opacity">"</span>
                      <p className="text-lg md:text-xl text-ivory/90 mb-12 font-serif leading-relaxed italic z-10">
                        {item.quote}
                      </p>
                      <div className="z-10 mt-auto pt-6 border-t border-gold/30">
                        <p className="text-gold font-sans font-medium text-sm tracking-wide" style={{ fontVariant: 'small-caps', fontSize: '16px' }}>{item.author}</p>
                        <p className="text-muted text-[10px] uppercase tracking-[0.2em] mt-1">{item.title}</p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          <GoldDivider />

          {/* LOCATION */}
          <section id="location" className="py-24 md:py-32 bg-maroon-hero relative mughal-texture border-y border-gold/10">
            <div className="max-w-6xl mx-auto px-6 lg:px-12 text-center relative z-10">
              <Reveal>
                <div className="flex flex-col items-center mb-16 text-center">
                  <h2 className="text-4xl md:text-5xl font-serif text-gold mb-6 tracking-wide italic">Darbaar Ka Pata</h2>
                  <p className="text-muted text-lg font-light max-w-lg mx-auto leading-relaxed mb-6">South Bangalore. Minutes from Brigade Meadows.</p>
                  <GoldDivider className="max-w-2xl" />
                </div>
                
                <div className="w-full max-w-4xl mx-auto h-[450px] mb-12 bg-maroon-deep overflow-hidden border border-gold/50 rounded-sm p-2 shadow-2xl relative">
                  <div className="absolute inset-0 bg-gold/5 mix-blend-overlay pointer-events-none z-10"></div>
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3889.658607380962!2d77.4984!3d12.8202!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae41a84f3ccb95%3A0xe54e3ed92661ab20!2sKaggalipura%2C%20Bengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin" 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen={true} 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                    className="grayscale hover:grayscale-0 transition-all duration-[1500ms] brightness-75 hover:brightness-100 relative z-0"
                  />
                </div>
                
                <a 
                  href="https://maps.app.goo.gl/yWM2GogHXvGzPcrv5" 
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex py-4 px-12 border border-gold text-gold hover:bg-gold hover:text-maroon-deep transition-colors duration-300 tracking-widest uppercase text-sm font-medium rounded-sm js-cursor-pointer"
                >
                  Open in Google Maps
                </a>
              </Reveal>
            </div>
          </section>

          <GoldDivider />

          {/* REQUEST ENTRY */}
          <section id="request" className="py-24 md:py-32 bg-maroon-deep relative mughal-texture border-y border-gold/10">
            <div className="max-w-2xl mx-auto px-6 lg:px-8 relative z-10">
              <Reveal>
                <div className="flex flex-col items-center mb-16 text-center">
                  <h2 className="text-4xl md:text-5xl font-serif text-gold italic tracking-wide mb-6">Arz Kijiye</h2>
                  <GoldDivider />
                </div>
                
                <form onSubmit={handleFormSubmit} className="flex flex-col gap-8 bg-maroon-hero p-8 md:p-12 border border-gold/30 rounded-sm">
                  <div className="flex flex-col gap-3">
                    <label htmlFor="name" className="text-muted text-xs font-medium uppercase tracking-[0.2em] ml-1">Name</label>
                    <input 
                      type="text" 
                      id="name" 
                      required 
                      className="w-full bg-maroon-deep border border-gold/40 focus:border-gold outline-none py-4 px-5 text-ivory text-base transition-colors rounded-sm shadow-inner placeholder-muted/50"
                    />
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <label htmlFor="occasion" className="text-muted text-xs font-medium uppercase tracking-[0.2em] ml-1">Occasion</label>
                    <select 
                      id="occasion" 
                      required 
                      defaultValue=""
                      className="w-full bg-maroon-deep border border-gold/40 focus:border-gold outline-none py-4 px-5 text-ivory text-base transition-colors appearance-none rounded-sm js-cursor-pointer shadow-inner"
                    >
                      <option value="" disabled className="text-muted/50">Select occasion</option>
                      <option value="study" className="bg-maroon-deep text-ivory">Ilm Ki Mehfil</option>
                      <option value="gathering" className="bg-maroon-deep text-ivory">Jashn-E-Khas</option>
                      <option value="creative" className="bg-maroon-deep text-ivory">Karkhaana</option>
                      <option value="other" className="bg-maroon-deep text-ivory">Mehfil-E-Aam</option>
                      <option value="other" className="bg-maroon-deep text-ivory">Kuch Aur</option>
                    </select>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <label htmlFor="message" className="text-muted text-xs font-medium uppercase tracking-[0.2em] ml-1">Message</label>
                    <textarea 
                      id="message" 
                      rows={4} 
                      required 
                      className="w-full bg-maroon-deep border border-gold/40 focus:border-gold outline-none py-4 px-5 text-ivory text-base transition-colors resize-y min-h-[120px] rounded-sm shadow-inner"
                    ></textarea>
                  </div>
                  
                  <button 
                    type="submit" 
                    className="mt-6 px-10 py-5 bg-gold text-maroon-hero font-semibold rounded-sm border border-gold hover:bg-transparent hover:text-gold transition-colors duration-300 w-full text-center tracking-widest uppercase text-sm js-cursor-pointer"
                  >
                    Bhejo
                  </button>
                  <p className="text-center text-muted text-[11px] font-light mt-4 tracking-[0.1em] uppercase">We'll get back. Probably.</p>
                </form>
              </Reveal>
            </div>
          </section>

          {/* FOOTER */}
          <footer className="py-24 bg-maroon-hero relative z-20">
            <div className="max-w-6xl mx-auto px-6 flex flex-col items-center text-center">
              <h3 className="font-serif text-3xl md:text-4xl text-gold mb-3 tracking-wider italic">Diwan-E-Khas</h3>
              <p className="text-muted font-light mb-10 text-sm md:text-base tracking-wide">Kaggalipura, South Bangalore</p>
              
              <GoldDivider className="mb-10 w-24 h-3" />
              
              <p className="text-ivory text-lg mb-8 italic font-serif tracking-wide">Atithi devo bhava. Par batana pehle.</p>
              <p className="text-muted text-[10px] uppercase tracking-[0.2em] mb-4">Community Centre · Cultural Landmark</p>
              <p className="text-muted/40 text-[10px] mt-4 tracking-widest uppercase">© Est. whenever it needed to be.</p>
            </div>
          </footer>

        </main>
      </div>

      <MobileNav />
    </>
  );
}
