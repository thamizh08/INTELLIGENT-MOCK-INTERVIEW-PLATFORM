// src/components/interview/VoiceRecorder.jsx
// Adaptive voice recorder using SpeechRecognition — works across all four themes.

import { useState, useRef } from 'react';
import Button from '../common/Button';

function VoiceRecorder({ onTranscript }) {
  const [isRecording, setIsRecording] = useState(false);
  const [supported] = useState(
    () => typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)
  );
  const recognitionRef = useRef(null);

  function startRecording() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join(' ');
      onTranscript(transcript);
    };

    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  }

  function stopRecording() {
    recognitionRef.current?.stop();
    setIsRecording(false);
  }

  if (!supported) {
    return (
      <p className="text-xs text-theme-muted font-mono mt-2">
        Voice input isn't supported in this browser - try Chrome, or type your answer above.
      </p>
    );
  }

  return (
    <div className="mt-3 flex items-center gap-3">
      <Button
        variant={isRecording ? 'magenta' : 'outline'}
        onClick={isRecording ? stopRecording : startRecording}
        className="text-xs py-2 px-4"
      >
        {isRecording ? '⏹ Stop Recording' : '🎙 Speak Your Answer'}
      </Button>
      {isRecording && (
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--accent-secondary) 10%, transparent)',
            border: '1px solid color-mix(in srgb, var(--accent-secondary) 40%, transparent)',
          }}
        >
          <span
            className="w-2 h-2 rounded-full animate-ping"
            style={{
              backgroundColor: 'var(--accent-secondary)',
              boxShadow: '0 0 8px var(--accent-secondary)',
            }}
          />
          <span
            className="text-xs font-mono font-semibold tracking-wider uppercase animate-pulse"
            style={{ color: 'var(--accent-secondary)' }}
          >
            Listening live...
          </span>
        </div>
      )}
    </div>
  );
}

export default VoiceRecorder;
