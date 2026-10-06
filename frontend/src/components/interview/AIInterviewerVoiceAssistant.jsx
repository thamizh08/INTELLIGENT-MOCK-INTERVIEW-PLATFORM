// src/components/interview/AIInterviewerVoiceAssistant.jsx
// Professional AI Recruiter Voice Assistant.
// Each recruiter persona has a DISTINCT voice fingerprint:
//   - Different speech rate, pitch, and voice gender preference
//   - Voice selection prioritizes natural/neural voices for each persona
//   - Guaranteed different voice characteristics between recruiters

import { useState, useEffect, useRef, useCallback } from 'react';

// ──────────────────────────────────────────────────────────
// RECRUITER PERSONAS — Each with unique voice fingerprint
// ──────────────────────────────────────────────────────────
const RECRUITER_PERSONAS = [
  {
    id: 'sarah',
    name: 'Sarah Jenkins',
    title: 'Senior Technical Recruiter',
    company: 'Meta · Google Alumni',
    avatar: '👩‍💼',
    gender: 'female',
    rate: 0.88,          // Measured, deliberate pacing
    pitch: 1.12,         // Slightly higher, warm pitch
    preferredVoiceNames: ['Samantha', 'Jenny', 'Aria', 'Zira', 'Victoria', 'Karen', 'Moira'],
    tagline: 'Warm, encouraging, and clear interview delivery',
    accentHint: 'American (Neutral)',
    color: 'from-rose-500 to-pink-400',
  },
  {
    id: 'david',
    name: 'David Chen',
    title: 'Engineering Director',
    company: 'Ex-Amazon Tech Lead',
    avatar: '👨‍💻',
    gender: 'male',
    rate: 0.82,          // Slower, very authoritative
    pitch: 0.88,         // Deep, low pitch
    preferredVoiceNames: ['David', 'Daniel', 'Alex', 'George', 'Ryan', 'Mark'],
    tagline: 'Structured, direct, and authoritative tech lead tone',
    accentHint: 'British (Formal)',
    color: 'from-blue-600 to-indigo-500',
  },
  {
    id: 'elena',
    name: 'Dr. Elena Rostova',
    title: 'Principal AI Architect',
    company: 'AI Research Lead',
    avatar: '👩‍🔬',
    gender: 'female',
    rate: 1.05,          // Brisk, precise, confident
    pitch: 1.18,         // Higher and crisp
    preferredVoiceNames: ['Ava', 'Nicky', 'Serena', 'Tessa', 'Allison', 'Susan', 'Helena'],
    tagline: 'Analytical, precise, and highly articulate persona',
    accentHint: 'European (Formal)',
    color: 'from-violet-500 to-purple-400',
  },
  {
    id: 'alex',
    name: 'Alex Vance',
    title: 'Lead Systems Architect',
    company: 'Distributed Systems Lead',
    avatar: '👨‍💼',
    gender: 'male',
    rate: 0.95,          // Natural, confident, even
    pitch: 0.97,         // Moderate, neutral male pitch
    preferredVoiceNames: ['Aaron', 'Tom', 'Fred', 'Reed', 'Bruce', 'Junior', 'Ralph'],
    tagline: 'Natural, confident, and professional recruiter voice',
    accentHint: 'American (West Coast)',
    color: 'from-emerald-500 to-teal-400',
  },
  {
    id: 'priya',
    name: 'Priya Nair',
    title: 'Head of Engineering Talent',
    company: 'FAANG Recruiter',
    avatar: '👩‍🏫',
    gender: 'female',
    rate: 0.93,          // Measured and professional
    pitch: 1.08,         // Slightly elevated, clear
    preferredVoiceNames: ['Rishi', 'Veena', 'Priya', 'Monica', 'Emily', 'Kate', 'Charlotte'],
    tagline: 'Empathetic, professional, and detail-oriented',
    accentHint: 'Indian (Formal English)',
    color: 'from-amber-500 to-orange-400',
  },
  {
    id: 'marcus',
    name: 'Marcus Reid',
    title: 'VP of Engineering',
    company: 'Startup Founder & CTO',
    avatar: '👨‍🔬',
    gender: 'male',
    rate: 0.78,          // Very slow and powerful
    pitch: 0.82,         // Very deep, commanding
    preferredVoiceNames: ['Lee', 'Liam', 'Oliver', 'Arthur', 'James', 'Albert'],
    tagline: 'Bold, commanding, and executive-level presence',
    accentHint: 'British (Executive)',
    color: 'from-slate-600 to-zinc-500',
  },
];

// ──────────────────────────────────────────────────────────
// COMPONENT
// ──────────────────────────────────────────────────────────
function AIInterviewerVoiceAssistant({ textToRead, onSpeechEnd, autoRead = true, role = '', experienceLevel = '' }) {
  const [selectedPersona, setSelectedPersona] = useState(RECRUITER_PERSONAS[0]);
  const [voices, setVoices] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(autoRead);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [showSettings, setShowSettings] = useState(false);
  const [voiceLoaded, setVoiceLoaded] = useState(false);

  const utteranceRef = useRef(null);

  // ── Load TTS voices
  useEffect(() => {
    function loadVoices() {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
      const available = window.speechSynthesis.getVoices();
      const english = available.filter((v) => v.lang.startsWith('en'));
      const voiceList = english.length ? english : available;
      setVoices(voiceList);
      if (voiceList.length > 0) setVoiceLoaded(true);
    }

    loadVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // ── Find the best unique voice for a persona
  const getBestVoice = useCallback(
    (persona) => {
      if (!voices.length) return null;

      // Priority 1: Match preferred voice names (each persona has unique preferred names)
      for (const preferred of persona.preferredVoiceNames) {
        const match = voices.find((v) => v.name.toLowerCase().includes(preferred.toLowerCase()));
        if (match) return match;
      }

      // Priority 2: Natural/neural voices filtered by gender
      const naturalVoices = voices.filter(
        (v) =>
          v.name.includes('Natural') ||
          v.name.includes('Neural') ||
          v.name.includes('Online') ||
          v.name.includes('Google') ||
          v.name.includes('Microsoft')
      );

      const genderPool = (naturalVoices.length ? naturalVoices : voices).filter((v) => {
        const n = v.name.toLowerCase();
        if (persona.gender === 'female') {
          return (
            n.includes('aria') ||
            n.includes('zira') ||
            n.includes('samantha') ||
            n.includes('victoria') ||
            n.includes('jenny') ||
            n.includes('ava') ||
            n.includes('female') ||
            n.includes('woman')
          );
        }
        return (
          n.includes('david') ||
          n.includes('daniel') ||
          n.includes('guy') ||
          n.includes('george') ||
          n.includes('alex') ||
          n.includes('ryan') ||
          n.includes('male') ||
          n.includes('man')
        );
      });

      // Priority 3: Gender match in full pool
      if (genderPool.length) {
        // Pick a voice index based on persona id hash to ensure variety
        const idx = persona.id.charCodeAt(0) % genderPool.length;
        return genderPool[idx];
      }

      // Fallback: offset by persona position so each gets a different voice
      const personaIndex = RECRUITER_PERSONAS.findIndex((p) => p.id === persona.id);
      return voices[personaIndex % voices.length];
    },
    [voices]
  );

  // ── Clean text for speech
  function prepareSpeechText(rawText) {
    if (!rawText) return '';
    return rawText
      .replace(/```[\s\S]*?```/g, 'Code snippet provided.')
      .replace(/[`#*_~]/g, '')
      .replace(/\n+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // ── Speak with persona voice
  const speakText = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const cleanedText = prepareSpeechText(textToRead);
    if (!cleanedText) return;

    const utterance = new SpeechSynthesisUtterance(cleanedText);
    const voice = getBestVoice(selectedPersona);

    if (voice) utterance.voice = voice;

    // Apply persona-specific voice characteristics
    utterance.rate = Math.max(0.6, Math.min(1.5, selectedPersona.rate * speechRate));
    utterance.pitch = selectedPersona.pitch;
    utterance.volume = 1.0;

    utterance.onstart = () => { setIsSpeaking(true); setIsPaused(false); };
    utterance.onend = () => { setIsSpeaking(false); setIsPaused(false); if (onSpeechEnd) onSpeechEnd(); };
    utterance.onerror = () => { setIsSpeaking(false); setIsPaused(false); };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [textToRead, selectedPersona, speechRate, getBestVoice, onSpeechEnd]);

  // ── Auto-speak when question arrives
  useEffect(() => {
    if (textToRead && autoPlayEnabled && voiceLoaded) {
      const timer = setTimeout(speakText, 500);
      return () => clearTimeout(timer);
    }
  }, [textToRead, autoPlayEnabled, voiceLoaded]);

  // Restart when persona changes mid-speech
  useEffect(() => {
    if (isSpeaking) {
      speakText();
    }
  }, [selectedPersona]);

  function handlePauseResume() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (isSpeaking && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    } else if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      speakText();
    }
  }

  function handleStop() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  }

  return (
    <div className="mb-6 rounded-xl border border-theme-border bg-theme-surface shadow-md overflow-hidden transition-all duration-300">
      {/* Accent top bar with persona gradient */}
      <div className={`h-1 w-full bg-gradient-to-r ${selectedPersona.color}`} />

      <div className="p-4">
        {/* Header: Avatar + Identity + Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Recruiter Identity */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl border-2 transition-all duration-300 ${
                  isSpeaking
                    ? 'border-theme-accent scale-105 shadow-[0_0_16px_var(--glow-accent)]'
                    : 'border-theme-border bg-theme-card'
                }`}
              >
                {selectedPersona.avatar}
              </div>
              {isSpeaking && !isPaused && (
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-theme-surface animate-ping" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-semibold text-sm text-theme-text">{selectedPersona.name}</h4>
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold uppercase tracking-wide"
                  style={{
                    background: 'color-mix(in srgb, var(--accent-primary) 15%, transparent)',
                    color: 'var(--accent-primary)',
                    border: '1px solid color-mix(in srgb, var(--accent-primary) 30%, transparent)',
                  }}
                >
                  AI Recruiter
                </span>
              </div>
              <p className="text-xs text-theme-muted">
                {selectedPersona.title} · {selectedPersona.company}
              </p>
              <p className="text-[10px] text-theme-muted/60 font-mono mt-0.5">
                🎙 {selectedPersona.accentHint} · Rate {(selectedPersona.rate * speechRate).toFixed(2)}x · Pitch {selectedPersona.pitch}
              </p>
            </div>
          </div>

          {/* Speaking equalizer */}
          {isSpeaking && !isPaused && (
            <div
              className="flex items-center gap-0.5 px-3 py-1.5 rounded-lg border"
              style={{
                background: 'color-mix(in srgb, var(--accent-primary) 10%, transparent)',
                borderColor: 'color-mix(in srgb, var(--accent-primary) 35%, transparent)',
              }}
            >
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className="w-1 rounded-full animate-bounce"
                  style={{
                    height: `${[16, 24, 12, 20, 14][i]}px`,
                    backgroundColor: 'var(--accent-primary)',
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: '0.6s',
                  }}
                />
              ))}
              <span className="text-[11px] font-mono font-semibold ml-2 text-theme-accent animate-pulse">
                Speaking...
              </span>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={speakText}
              type="button"
              className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg font-mono text-xs font-bold hover:brightness-110 shadow-sm transition-all active:scale-95 text-white"
              style={{ backgroundColor: 'var(--accent-primary)' }}
            >
              {isSpeaking ? '🔁 Replay' : '🔊 Listen'}
            </button>

            {isSpeaking && (
              <button
                onClick={handlePauseResume}
                type="button"
                className="py-1.5 px-3 rounded-lg border border-theme-border bg-theme-card text-theme-text font-mono text-xs hover:border-theme-accent transition-all"
              >
                {isPaused ? '▶ Resume' : '⏸ Pause'}
              </button>
            )}
            {isSpeaking && (
              <button
                onClick={handleStop}
                type="button"
                className="py-1.5 px-2.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-500 font-mono text-xs hover:bg-rose-500/20 transition-all"
              >
                ⏹
              </button>
            )}

            <button
              onClick={() => setShowSettings(!showSettings)}
              type="button"
              className="py-1.5 px-2.5 rounded-lg border border-theme-border bg-theme-card text-theme-muted hover:text-theme-text transition-all"
            >
              ⚙️
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mt-4 pt-4 border-t border-theme-border/60 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Persona Selector */}
              <div>
                <p className="text-[10px] font-mono font-bold text-theme-muted uppercase tracking-wider mb-2">
                  🎙 Choose Recruiter Voice
                </p>
                <div className="space-y-1.5">
                  {RECRUITER_PERSONAS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPersona(p)}
                      type="button"
                      className={`w-full text-left p-2.5 rounded-xl border text-xs flex items-center gap-3 transition-all ${
                        selectedPersona.id === p.id
                          ? 'border-theme-accent bg-theme-accent/10 text-theme-text'
                          : 'border-theme-border bg-theme-card text-theme-muted hover:text-theme-text hover:border-theme-accent/40'
                      }`}
                    >
                      <span className="text-xl shrink-0">{p.avatar}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-theme-text">{p.name}</div>
                        <div className="text-[10px] text-theme-muted truncate">{p.title}</div>
                        <div className="text-[10px] font-mono mt-0.5 flex gap-2">
                          <span className="text-theme-accent">Rate {p.rate}x</span>
                          <span className="text-theme-secondary">·</span>
                          <span className="text-theme-secondary">Pitch {p.pitch}</span>
                          <span className="text-theme-secondary">·</span>
                          <span className="text-theme-muted">{p.accentHint}</span>
                        </div>
                      </div>
                      {selectedPersona.id === p.id && (
                        <span className="text-theme-accent font-bold text-sm shrink-0">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Audio Preferences */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono font-bold text-theme-muted uppercase tracking-wider mb-2">
                    Global Speed Multiplier ({speechRate}x)
                  </label>
                  <input
                    type="range"
                    min="0.7"
                    max="1.4"
                    step="0.05"
                    value={speechRate}
                    onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                    className="w-full cursor-pointer accent-indigo-500"
                    style={{ accentColor: 'var(--accent-primary)' }}
                  />
                  <div className="flex justify-between text-[10px] font-mono text-theme-muted mt-1">
                    <span>Slow (0.7x)</span>
                    <span>Normal (1.0x)</span>
                    <span>Fast (1.4x)</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-theme-border bg-theme-card flex items-center justify-between gap-3">
                  <div>
                    <span className="block text-xs font-semibold text-theme-text">Auto-Read Questions</span>
                    <span className="text-[11px] text-theme-muted">
                      Recruiter reads each question aloud on arrival
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={autoPlayEnabled}
                      onChange={(e) => setAutoPlayEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-theme-border rounded-full peer peer-checked:bg-theme-accent transition-all after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                  </label>
                </div>

                <div className="p-3 rounded-xl border border-theme-border bg-theme-card">
                  <p className="text-[10px] font-mono font-bold text-theme-muted uppercase tracking-wider mb-2">
                    Current Session
                  </p>
                  {role && (
                    <p className="text-xs text-theme-text font-semibold">{role}</p>
                  )}
                  {experienceLevel && (
                    <p className="text-[11px] text-theme-muted capitalize mt-0.5">
                      {experienceLevel} level · Tailored questions
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AIInterviewerVoiceAssistant;
