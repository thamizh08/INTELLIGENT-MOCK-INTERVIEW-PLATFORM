// src/components/interview/AnswerInput.jsx
// Adaptive cyber terminal textarea — works across all four themes (dark, light, midnight, warm).

import { useState } from 'react';
import Button from '../common/Button';

function AnswerInput({ onSubmit, disabled }) {
  const [answerText, setAnswerText] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!answerText.trim()) return;
    onSubmit(answerText.trim());
    setAnswerText('');
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6">
      <div className="relative group">
        <textarea
          value={answerText}
          onChange={(e) => setAnswerText(e.target.value)}
          disabled={disabled}
          rows={6}
          placeholder="Type your structured answer here... (be detailed & specific)"
          className="w-full rounded-md p-4 font-mono text-sm text-theme-text placeholder:text-theme-muted outline-none resize-none disabled:opacity-50 transition-all duration-200"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--accent-primary)';
            e.target.style.boxShadow = '0 0 15px var(--glow-accent)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'var(--border-color)';
            e.target.style.boxShadow = 'none';
          }}
        />
        <div
          className="absolute bottom-3 right-3 text-[11px] font-mono text-theme-muted px-2 py-0.5 rounded"
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
          }}
        >
          {answerText.length} chars
        </div>
      </div>
      <div className="flex justify-end mt-3">
        <Button type="submit" variant="cyan" disabled={disabled || !answerText.trim()}>
          Submit Answer ➔
        </Button>
      </div>
    </form>
  );
}

export default AnswerInput;
