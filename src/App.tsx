import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Music, Wifi, Sparkles, Key } from 'lucide-react';

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

// Warm gold particles, slow drift upward, dense
const Particles = () => {
  const [particles, setParticles] = useState<{ id: number; left: string; size: string; duration: string; delay: string; opacity: number }[]>([]);

  useEffect(() => {
    // Dense warm gold particles
    const newParticles = Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 4 + 1.5}px`, 
      duration: `${Math.random() * 15 + 15}s`, // Slow drift
      delay: `-${Math.random() * 30}s`, // Start everywhere
      opacity: Math.random() * 0.4 + 0.1,
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

const MughalArchSVG = () => (
  <svg className="absolute inset-4 sm:inset-8 w-[calc(100%-2rem)] sm:w-[calc(100%-4rem)] h-[calc(100%-2rem)] sm:h-[calc(100%-4rem)] pointer-events-none opacity-20" preserveAspectRatio="none" viewBox="0 0 100 100">
    <path d="M5,100 L5,40 C5,20 20,5 50,5 C80,5 95,20 95,40 L95,100" fill="none" stroke="#C9A84C" strokeWidth="0.5" />
    <path d="M10,100 L10,40 C10,25 22,10 50,10 C78,10 90,25 90,40 L90,100" fill="none" stroke="#C9A84C" strokeWidth="0.2" />
  </svg>
);

const GoldDivider = ({ className = "" }) => (
  <svg className={`w-32 h-4 ${className}`} viewBox="0 0 100 10" preserveAspectRatio="none">
     <path d="M0,5 L40,5 L50,0 L60,5 L100,5" fill="none" stroke="#C9A84C" strokeWidth="1" />
     <circle cx="50" cy="5" r="2" fill="#C9A84C" />
  </svg>
);

export default function App() {
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  useKonamiCode(() => setShowEasterEgg(true));

  useEffect(() => {
    // Cinematic entry fade
    const t = setTimeout(() => setInitialLoad(false), 200);
    return () => clearTimeout(t);
  }, []);

  const toggleAudio = () => {
    setIsAudioPlaying(!isAudioPlaying);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted. We'll get back. Probably.");
    (e.target as HTMLFormElement).reset();
  };

  // Cinematic fade classes
  const containerFade = initialLoad ? "opacity-0" : "opacity-100";

  return (
    <div className={`transition-opacity duration-[1800ms] ${containerFade} relative`}>
      {/* Global Mughal Texture Overlay */}
      <div className="fixed inset-0 bg-mughal-pattern opacity-[0.05] pointer-events-none z-50 mix-blend-screen" />
      
      {/* Audio Toggle */}
      <button 
        onClick={toggleAudio}
        className="fixed top-6 right-6 z-50 text-gold hover:text-gold-light transition-colors p-2 rounded-full cursor-pointer opacity-80 hover:opacity-100"
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
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-maroon-deep/90 backdrop-blur-md"
          >
            <div className="bg-maroon-hero border-2 border-gold p-12 text-center max-w-md w-full relative">
              <h2 className="text-2xl font-serif text-ivory mb-8">Diwan Sahab has been notified.</h2>
              <button 
                onClick={() => setShowEasterEgg(false)}
                className="px-8 py-3 bg-gold text-maroon-deep font-serif border border-gold hover:bg-transparent hover:text-gold transition-colors block mx-auto"
              >
                Theek Hai
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="font-sans text-ivory selection:bg-gold/30 selection:text-gold min-h-screen">
        
        {/* 1. HERO SECTION */}
        <section className="relative h-[100svh] flex flex-col items-center justify-center bg-maroon-hero overflow-hidden">
          <MughalArchSVG />
          <Particles />
          
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 1.5, ease: "easeOut" }}
            className="relative z-10 text-center px-4 flex flex-col items-center max-w-4xl w-full"
          >
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-serif italic text-gold mb-8 drop-shadow-lg tracking-wider">
              Diwan-E-Khas
            </h1>
            
            <GoldDivider className="mb-8" />
            
            <p className="text-xs md:text-sm font-sans tracking-[0.4em] uppercase text-ivory mb-16 opacity-90">
              Kaggalipura ka sabse khas address
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full sm:w-auto mt-4 px-6 sm:px-0">
              <a href="#about" className="px-10 py-4 bg-gold text-maroon-hero font-medium rounded-sm border border-gold hover:bg-transparent hover:text-gold transition-all duration-300 text-center w-full sm:w-48 tracking-widest uppercase text-sm">
                Padharo
              </a>
              <a href="#mehfilein" className="px-10 py-4 border border-gold text-gold font-medium rounded-sm hover:bg-gold hover:text-maroon-hero transition-all duration-300 text-center w-full sm:w-48 tracking-widest uppercase text-sm">
                Dekhte Hain
              </a>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8, duration: 1 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 text-gold"
          >
            <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
              <ChevronDown className="w-8 h-8 shrink-0 opacity-70" />
            </motion.div>
          </motion.div>
        </section>

        {/* 2. ABOUT "Ek Khas Jagah" */}
        <section id="about" className="py-24 md:py-32 bg-maroon-deep relative border-l border-gold/20">
          <div className="max-w-6xl mx-auto px-6 lg:px-12">
            <Reveal>
              <div className="flex flex-col items-center mb-16">
                <h2 className="text-4xl md:text-5xl font-serif text-gold italic tracking-wide mb-6">Ek Khas Jagah</h2>
                <GoldDivider />
              </div>
            </Reveal>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-12 items-center">
              <div className="md:col-span-7 lg:col-span-8">
                <Reveal delay={0.1}>
                  <p className="text-lg md:text-xl text-ivory leading-[1.8] font-light max-w-2xl">
                    Tucked in the quieter side of South Bangalore. Close enough to everything. Far enough to think. 
                    Diwan-E-Khas is where people come to gather, create, and occasionally get nothing done. 
                    That counts too.
                  </p>
                </Reveal>
              </div>
              
              <div className="md:col-span-5 lg:col-span-4">
                <Reveal delay={0.2}>
                  <div className="flex flex-col gap-10 border-l border-gold/30 pl-8 md:pl-12">
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

        {/* 3. MEHFILEIN */}
        <section id="mehfilein" className="py-24 md:py-32 bg-maroon-hero">
          <div className="max-w-6xl mx-auto px-6 lg:px-12">
            <Reveal>
              <div className="flex flex-col items-center mb-20 text-center">
                <h2 className="text-4xl md:text-5xl font-serif text-gold italic tracking-wide mb-4">Mehfilein</h2>
                <p className="text-muted tracking-widest text-sm uppercase mb-6">What happens at Diwan-E-Khas</p>
                <GoldDivider />
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
                  <div className="group h-full flex flex-col justify-between p-10 bg-maroon-card border border-gold-dim hover:border-gold transition-all duration-500 hover:-translate-y-1 rounded-sm shadow-none hover:shadow-[0_0_25px_rgba(201,168,76,0.15)] cursor-default">
                    <div>
                      <p className="text-gold-dim font-serif text-lg mb-6 leading-none transition-colors group-hover:text-gold">{item.num}</p>
                      <h3 className="text-3xl font-serif italic text-gold mb-6">{item.title}</h3>
                    </div>
                    <p className="text-muted leading-relaxed font-light text-base">{item.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* 4. AAPKE LIYE */}
        <section className="py-32 bg-maroon-deep flex flex-col border-y border-gold/10">
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
        </section>

        {/* 5. ROYAL DECREE */}
        <section className="py-32 md:py-48 bg-maroon-deep relative overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-parchment opacity-[0.08] pointer-events-none mix-blend-overlay"></div>
          
          <div className="max-w-4xl mx-auto px-6 relative z-10 w-full">
            <Reveal>
              <div className="relative p-12 md:p-20 text-center border-double border-4 border-gold rounded-sm bg-maroon-deep backdrop-blur-sm">
                
                <div className="absolute -right-4 -top-8 w-24 h-24 transform rotate-12 opacity-80 text-gold drop-shadow-[0_0_10px_rgba(201,168,76,0.3)]">
                  <svg viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="#3D1010" stroke="#C9A84C" strokeWidth="2"/>
                    <circle cx="50" cy="50" r="38" fill="none" stroke="#C9A84C" strokeWidth="1" strokeDasharray="4 2"/>
                    <text x="50" y="58" fontFamily="Playfair Display" fontSize="30" fill="#C9A84C" textAnchor="middle" fontStyle="italic">DK</text>
                  </svg>
                </div>
                
                <div className="flex flex-col gap-6 md:gap-8 font-serif italic text-2xl md:text-4xl text-ivory leading-[1.6]">
                  <Reveal delay={0}><p>Diwan-E-Khas operates on its own terms.</p></Reveal>
                  <Reveal delay={0.2}><p>Guests are welcomed.</p></Reveal>
                  <Reveal delay={0.4}><p>Gatherings are curated.</p></Reveal>
                  <Reveal delay={0.6}><p>The address is real.</p></Reveal>
                  <Reveal delay={0.8}><p>The vibe is earned.</p></Reveal>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* 6. TESTIMONIALS */}
        <section className="py-24 md:py-32 bg-maroon-hero relative">
          <div className="max-w-6xl mx-auto px-6 lg:px-12">
            <Reveal>
              <div className="flex flex-col items-center mb-20 text-center">
                <h2 className="text-4xl md:text-5xl font-serif text-gold italic tracking-wide mb-6">Darbaar Ki Raye</h2>
                <GoldDivider />
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
                  <div className="p-10 bg-[#250d08] border border-gold/10 hover:border-gold transition-all duration-500 hover:-translate-y-1 rounded-sm flex flex-col h-full justify-between shadow-lg relative overflow-hidden">
                    <div className="absolute w-full h-full inset-0 bg-[#A68868] opacity-5 pointer-events-none mix-blend-color"></div>
                    <span className="text-gold font-serif text-6xl leading-[0] mt-6 mb-4 drop-shadow-md">"</span>
                    <p className="text-lg md:text-xl text-ivory/90 mb-12 font-serif leading-relaxed italic z-10">
                      {item.quote}
                    </p>
                    <div className="z-10 mt-auto">
                      <p className="text-gold font-serif font-medium uppercase tracking-widest text-sm">{item.author}</p>
                      <p className="text-muted text-xs uppercase tracking-[0.2em] mt-2">{item.title}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* 7. LOCATION */}
        <section className="py-24 md:py-32 bg-maroon-deep border-y border-gold/10">
          <div className="max-w-6xl mx-auto px-6 lg:px-12 text-center">
            <Reveal>
              <h2 className="text-4xl md:text-5xl font-serif text-gold mb-6 tracking-wide">Darbaar Ka Pata</h2>
              <p className="text-muted text-lg font-light mb-16 max-w-lg mx-auto leading-relaxed">South Bangalore. Minutes from Brigade Meadows.</p>
              
              <div className="w-full max-w-4xl mx-auto h-[450px] mb-12 bg-maroon-card overflow-hidden border-2 border-gold rounded-sm shadow-[0_0_30px_rgba(201,168,76,0.1)] p-2">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3889.658607380962!2d77.4984!3d12.8202!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae41a84f3ccb95%3A0xe54e3ed92661ab20!2sKaggalipura%2C%20Bengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen={true} 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  className="grayscale hover:grayscale-0 transition-all duration-[1500ms] brightness-75 hover:brightness-100"
                />
              </div>
              
              <a 
                href="https://maps.app.goo.gl/yWM2GogHXvGzPcrv5" 
                target="_blank"
                rel="noreferrer"
                className="inline-flex py-4 px-12 border border-gold text-gold hover:bg-gold hover:text-maroon-deep transition-colors duration-300 tracking-widest uppercase text-sm font-medium rounded-sm"
              >
                Open in Google Maps
              </a>
            </Reveal>
          </div>
        </section>

        {/* 8. REQUEST ENTRY */}
        <section className="py-24 md:py-32 bg-maroon-hero relative">
          <div className="max-w-2xl mx-auto px-6 lg:px-8 relative z-10">
            <Reveal>
              <h2 className="text-4xl md:text-5xl font-serif text-gold mb-16 italic tracking-wide text-center">Arz Kijiye</h2>
              
              <form onSubmit={handleFormSubmit} className="flex flex-col gap-8">
                <div className="flex flex-col gap-3">
                  <label htmlFor="name" className="text-muted text-xs font-medium uppercase tracking-[0.2em] ml-1">Name</label>
                  <input 
                    type="text" 
                    id="name" 
                    required 
                    className="w-full bg-maroon-card border border-gold-dim focus:border-gold outline-none py-4 px-5 text-ivory text-base transition-colors rounded-sm shadow-inner placeholder-muted/50"
                  />
                </div>
                
                <div className="flex flex-col gap-3">
                  <label htmlFor="occasion" className="text-muted text-xs font-medium uppercase tracking-[0.2em] ml-1">Occasion</label>
                  <select 
                    id="occasion" 
                    required 
                    defaultValue=""
                    className="w-full bg-maroon-card border border-gold-dim focus:border-gold outline-none py-4 px-5 text-ivory text-base transition-colors appearance-none rounded-sm cursor-pointer shadow-inner"
                  >
                    <option value="" disabled className="text-muted/50">Select occasion</option>
                    <option value="study" className="bg-maroon-card text-ivory">Ilm Ki Mehfil</option>
                    <option value="gathering" className="bg-maroon-card text-ivory">Jashn-E-Khas</option>
                    <option value="creative" className="bg-maroon-card text-ivory">Karkhaana</option>
                    <option value="other" className="bg-maroon-card text-ivory">Mehfil-E-Aam</option>
                    <option value="other" className="bg-maroon-card text-ivory">Kuch Aur</option>
                  </select>
                </div>
                
                <div className="flex flex-col gap-3">
                  <label htmlFor="message" className="text-muted text-xs font-medium uppercase tracking-[0.2em] ml-1">Message</label>
                  <textarea 
                    id="message" 
                    rows={4} 
                    required 
                    className="w-full bg-maroon-card border border-gold-dim focus:border-gold outline-none py-4 px-5 text-ivory text-base transition-colors resize-y min-h-[120px] rounded-sm shadow-inner"
                  ></textarea>
                </div>
                
                <button 
                  type="submit" 
                  className="mt-6 px-10 py-5 bg-gold text-maroon-card font-semibold rounded-sm border border-gold hover:bg-transparent hover:text-gold transition-colors duration-300 w-full text-center tracking-widest uppercase text-sm"
                >
                  Bhejo
                </button>
                <p className="text-center text-muted text-xs font-light mt-6 tracking-wide">We'll get back. Probably.</p>
              </form>
            </Reveal>
          </div>
        </section>

        {/* 9. FOOTER */}
        <footer className="py-24 bg-maroon-deep relative z-20">
          <div className="max-w-6xl mx-auto px-6 flex flex-col items-center text-center">
            <h3 className="font-serif text-3xl md:text-4xl text-gold mb-3 tracking-wider">Diwan-E-Khas</h3>
            <p className="text-muted font-light mb-10 text-sm md:text-base tracking-wide">Kaggalipura, South Bangalore</p>
            
            <GoldDivider className="mb-10 w-24 h-3" />
            
            <p className="text-ivory text-lg mb-8 italic font-serif tracking-wide">Atithi devo bhava. Par batana pehle.</p>
            <p className="text-muted text-xs uppercase tracking-[0.2em] mb-4">Community Centre · Cultural Landmark</p>
            <p className="text-muted/60 text-xs mt-4">© Est. whenever it needed to be.</p>
          </div>
        </footer>

      </main>
    </div>
  );
}
