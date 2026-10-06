// src/components/typing/TypingEngine.jsx
// Core typing practice engine with character-by-character tracking, real-time WPM,
// accuracy calculation, configurable durations, and interview-themed text prompts.

import { useState, useEffect, useRef, useCallback } from 'react';
import TypingStats from './TypingStats';
import { saveSession } from './TypingHistory';

// ─── Interview-themed text prompts ───────────────────────────────────────────
const PROMPTS = [
  "A binary search tree is a data structure where each node has at most two children. The left subtree contains only nodes with keys less than the parent node, and the right subtree contains nodes with keys greater than the parent node. This property makes search operations efficient with an average time complexity of O(log n).",
  "In system design, horizontal scaling means adding more machines to handle increased load, while vertical scaling means adding more resources to existing machines. Load balancers distribute incoming traffic across multiple servers to ensure no single server becomes a bottleneck.",
  "Dynamic programming breaks complex problems into simpler overlapping subproblems and stores their solutions to avoid redundant computation. The two main approaches are top-down memoization and bottom-up tabulation. Classic examples include the Fibonacci sequence and the knapsack problem.",
  "RESTful APIs follow a set of architectural constraints including statelessness, client-server separation, and a uniform interface. HTTP methods like GET, POST, PUT, and DELETE correspond to read, create, update, and delete operations on resources identified by URIs.",
  "Hash tables provide constant-time average-case complexity for insertions, deletions, and lookups. They use a hash function to compute an index into an array of buckets. Collision resolution strategies include chaining with linked lists and open addressing with linear probing.",
  "Microservices architecture decomposes an application into loosely coupled, independently deployable services. Each service owns its data and communicates through well-defined APIs. This approach enables teams to develop, deploy, and scale services independently.",
  "The SOLID principles in object-oriented programming include Single Responsibility, Open-Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion. These principles guide developers in creating flexible, maintainable, and scalable software systems.",
  "Graph algorithms like Dijkstra's shortest path and breadth-first search are fundamental to computer science. Graphs can represent networks, social connections, and dependency structures. Understanding adjacency lists and adjacency matrices is crucial for efficient implementation.",
  "Version control systems like Git enable teams to collaborate on code effectively. Key concepts include branching, merging, rebasing, and conflict resolution. Feature branches and pull requests facilitate code review and maintain a clean commit history.",
  "Database normalization reduces data redundancy by organizing tables and relationships. The first three normal forms eliminate repeating groups, partial dependencies, and transitive dependencies. However, denormalization is sometimes used in read-heavy applications for performance.",
  "Event-driven architecture uses events to trigger and communicate between decoupled services. Message queues like Kafka and RabbitMQ enable asynchronous processing, improving system resilience and scalability. Producers publish events while consumers process them independently.",
  "Time complexity analysis using Big O notation describes how an algorithm's running time grows relative to input size. Common complexities include O(1) constant, O(log n) logarithmic, O(n) linear, O(n log n) linearithmic, and O(n squared) quadratic.",
];

function getRandomPrompt(excludeIndex) {
  let idx;
  do {
    idx = Math.floor(Math.random() * PROMPTS.length);
  } while (idx === excludeIndex && PROMPTS.length > 1);
  return { text: PROMPTS[idx], index: idx };
}

// ─── Durations ───────────────────────────────────────────────────────────────
const DURATIONS = [30, 60, 120];

function TypingEngine() {
  const [duration, setDuration] = useState(60);
  const [promptIndex, setPromptIndex] = useState(-1);
  const [promptText, setPromptText] = useState('');
  const [input, setInput] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [startTime, setStartTime] = useState(null);

  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const containerRef = useRef(null);

  // ─── Initialize prompt ──────────────────────────────────────────────────
  const loadNewPrompt = useCallback(() => {
    const { text, index } = getRandomPrompt(promptIndex);
    setPromptText(text);
    setPromptIndex(index);
    setInput('');
    setIsActive(false);
    setIsFinished(false);
    setTimeRemaining(duration);
    setStartTime(null);
    if (timerRef.current) clearInterval(timerRef.current);
  }, [promptIndex, duration]);

  useEffect(() => {
    loadNewPrompt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Timer tick ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (isActive && !isFinished) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsActive(false);
            setIsFinished(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, isFinished]);

  // ─── Computed stats ─────────────────────────────────────────────────────
  const correctChars = input.split('').filter((ch, i) => ch === promptText[i]).length;
  const incorrectChars = input.length - correctChars;
  const totalChars = input.length;
  const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 0;

  const elapsedSeconds = startTime ? (Date.now() - startTime) / 1000 : 0;
  const wpm =
    elapsedSeconds > 0 ? Math.round((correctChars / 5) / (elapsedSeconds / 60)) : 0;

  // ─── Save on finish ─────────────────────────────────────────────────────
  useEffect(() => {
    if (isFinished && totalChars > 0) {
      saveSession({ wpm, accuracy, duration, correctChars, incorrectChars, totalChars });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinished]);

  // ─── Handle input ───────────────────────────────────────────────────────
  function handleInput(e) {
    if (isFinished) return;

    const value = e.target.value;

    // Start timer on first keystroke
    if (!isActive && value.length > 0) {
      setIsActive(true);
      setStartTime(Date.now());
    }

    // Don't allow typing past the prompt
    if (value.length <= promptText.length) {
      setInput(value);
    }

    // Auto-finish if all characters typed
    if (value.length >= promptText.length) {
      setIsActive(false);
      setIsFinished(true);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }

  // ─── Restart ────────────────────────────────────────────────────────────
  function handleRestart() {
    setInput('');
    setIsActive(false);
    setIsFinished(false);
    setTimeRemaining(duration);
    setStartTime(null);
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function handleNewText() {
    loadNewPrompt();
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function handleDurationChange(d) {
    setDuration(d);
    setTimeRemaining(d);
    handleRestart();
  }

  // ─── Focus on container click ───────────────────────────────────────────
  function handleContainerClick() {
    if (!isFinished) {
      inputRef.current?.focus();
    }
  }

  // ─── Keyboard shortcuts ─────────────────────────────────────────────────
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Tab' && isFinished) {
        e.preventDefault();
        handleNewText();
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        handleRestart();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinished, promptIndex, duration]);

  // ─── Render character spans ─────────────────────────────────────────────
  function renderPrompt() {
    return promptText.split('').map((char, i) => {
      let className = 'typing-char';

      if (i < input.length) {
        className += input[i] === char ? ' typing-char-correct' : ' typing-char-incorrect';
      } else if (i === input.length) {
        className += ' typing-char-current';
      } else {
        className += ' typing-char-pending';
      }

      return (
        <span key={i} className={className}>
          {char}
        </span>
      );
    });
  }

  // ─── Results panel ──────────────────────────────────────────────────────
  function renderResults() {
    const wpmLevel = wpm >= 60 ? 'Excellent' : wpm >= 40 ? 'Good' : wpm >= 20 ? 'Keep Practicing' : 'Getting Started';
    const wpmColor = wpm >= 60 ? 'text-emerald-400' : wpm >= 40 ? 'text-amber-400' : 'text-rose-400';

    return (
      <div className="glass-card rounded-2xl p-6 sm:p-8 text-center animate-scale-in space-y-5">
        <div>
          <div className="font-mono text-xs text-theme-muted uppercase tracking-widest mb-2">Test Complete</div>
          <div className={`font-display text-5xl font-extrabold ${wpmColor}`}>{wpm}</div>
          <div className="font-mono text-sm text-theme-muted mt-1">Words Per Minute</div>
        </div>

        <div className={`font-mono text-sm font-bold ${wpmColor} px-3 py-1.5 rounded-full inline-block ${
          wpm >= 60 ? 'bg-emerald-500/10 border border-emerald-500/30' :
          wpm >= 40 ? 'bg-amber-500/10 border border-amber-500/30' :
          'bg-rose-500/10 border border-rose-500/30'
        }`}>
          {wpmLevel}
        </div>

        <div className="grid grid-cols-3 gap-4 pt-2">
          <div>
            <div className="font-display text-xl font-bold text-theme-accent">{accuracy}%</div>
            <div className="font-mono text-[10px] text-theme-muted uppercase">Accuracy</div>
          </div>
          <div>
            <div className="font-display text-xl font-bold text-emerald-400">{correctChars}</div>
            <div className="font-mono text-[10px] text-theme-muted uppercase">Correct</div>
          </div>
          <div>
            <div className="font-display text-xl font-bold text-rose-400">{incorrectChars}</div>
            <div className="font-mono text-[10px] text-theme-muted uppercase">Errors</div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={handleRestart}
            className="font-mono text-xs px-5 py-2.5 rounded-lg border-2 border-theme-accent text-theme-accent bg-theme-accent/10 hover:bg-theme-accent/20 transition-all active:scale-95"
          >
            ↻ Retry Same Text
          </button>
          <button
            onClick={handleNewText}
            className="font-mono text-xs px-5 py-2.5 rounded-lg bg-theme-accent text-theme-main font-bold hover:brightness-110 transition-all active:scale-95"
          >
            New Text →
          </button>
        </div>

        <div className="font-mono text-[10px] text-theme-muted">
          <kbd className="px-1.5 py-0.5 rounded border border-theme-border bg-theme-card text-[9px]">Tab</kbd> new text
          &nbsp;·&nbsp;
          <kbd className="px-1.5 py-0.5 rounded border border-theme-border bg-theme-card text-[9px]">Esc</kbd> restart
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Duration selector */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-theme-muted uppercase tracking-wider">Duration</span>
          <div className="flex rounded-lg border border-theme-border overflow-hidden">
            {DURATIONS.map((d) => (
              <button
                key={d}
                onClick={() => handleDurationChange(d)}
                disabled={isActive}
                className={`font-mono text-xs px-4 py-2 transition-all ${
                  duration === d
                    ? 'bg-theme-accent text-theme-main font-bold'
                    : 'bg-theme-surface text-theme-secondary hover:bg-theme-card'
                } disabled:opacity-50`}
              >
                {d}s
              </button>
            ))}
          </div>
        </div>

        {!isFinished && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleNewText}
              disabled={isActive}
              className="font-mono text-[10px] px-3 py-1.5 rounded-lg border border-theme-border text-theme-muted hover:text-theme-accent hover:border-theme-accent transition-colors disabled:opacity-40"
            >
              ↻ New Text
            </button>
          </div>
        )}
      </div>

      {/* Live stats */}
      <TypingStats
        wpm={wpm}
        accuracy={accuracy}
        correctChars={correctChars}
        incorrectChars={incorrectChars}
        totalChars={totalChars}
        timeRemaining={timeRemaining}
        totalTime={duration}
        isActive={isActive}
        isFinished={isFinished}
      />

      {/* Typing area or results */}
      {isFinished ? (
        renderResults()
      ) : (
        <div
          ref={containerRef}
          onClick={handleContainerClick}
          className="glass-card rounded-2xl p-5 sm:p-8 cursor-text relative group"
        >
          {/* Invisible input captures keystrokes */}
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInput}
            className="absolute inset-0 opacity-0 w-full h-full resize-none cursor-text z-10"
            autoFocus
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            aria-label="Typing practice input"
          />

          {/* Rendered text */}
          <div className="typing-text-display font-mono text-base sm:text-lg leading-relaxed select-none">
            {renderPrompt()}
          </div>

          {/* Click hint */}
          {!isActive && input.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-theme-main/60 backdrop-blur-sm rounded-2xl z-5 pointer-events-none">
              <div className="text-center animate-pulse">
                <div className="font-mono text-sm text-theme-accent font-bold">Click here & start typing</div>
                <div className="font-mono text-[10px] text-theme-muted mt-1">Timer starts on first keystroke</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default TypingEngine;
