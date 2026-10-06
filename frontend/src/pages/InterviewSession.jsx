// src/pages/InterviewSession.jsx
// Premium interview session with progress bar, character counter, AI Voice Assistant, and keyword-rigorous evaluation.

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSession, submitAnswer, completeInterview } from '../services/interviewService';
import { generateReport } from '../services/reportService';
import AIInterviewerVoiceAssistant from '../components/interview/AIInterviewerVoiceAssistant';
import QuestionCard from '../components/interview/QuestionCard';
import AnswerInput from '../components/interview/AnswerInput';
import VoiceRecorder from '../components/interview/VoiceRecorder';
import Timer from '../components/interview/Timer';
import VideoRoom from '../components/interview/VideoRoom';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';

function InterviewSession() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [lastEvaluation, setLastEvaluation] = useState(null);
  const [isLastQuestion, setIsLastQuestion] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [voiceDraft, setVoiceDraft] = useState('');
  const [error, setError] = useState('');
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(8);

  useEffect(() => {
    async function loadSession() {
      try {
        const data = await getSession(sessionId);
        const { questions } = data;
        const unanswered = questions.find((q) => !q.answerText) || questions[questions.length - 1];
        setCurrentQuestion({ id: unanswered._id, text: unanswered.questionText, order: unanswered.order });
        setQuestionsAnswered(data.questionsAnswered || 0);
        setTotalQuestions(data.totalQuestions || 8);
      } catch (err) {
        setError('Could not load this interview session.');
      } finally {
        setLoading(false);
      }
    }
    loadSession();
  }, [sessionId]);

  async function handleAnswer(answerText) {
    setSubmitting(true);
    setLastEvaluation(null);
    try {
      const result = await submitAnswer(sessionId, { questionId: currentQuestion.id, answerText });
      setLastEvaluation(result.evaluation);
      setIsLastQuestion(result.isLastQuestion);
      setQuestionsAnswered(result.questionsAnswered || questionsAnswered + 1);
      if (result.totalQuestions) setTotalQuestions(result.totalQuestions);
      if (!result.isLastQuestion && result.nextQuestion) {
        setCurrentQuestion(result.nextQuestion);
      }
      setVoiceDraft('');
    } catch (err) {
      setError('Could not submit your answer. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleFinish() {
    setSubmitting(true);
    try {
      await completeInterview(sessionId);
      await generateReport(sessionId);
      navigate(`/report/${sessionId}`);
    } catch (err) {
      setError('Could not generate your report. Please try again.');
      setSubmitting(false);
    }
  }

  if (loading) return <Loader message="Connecting to AI Interviewer Node..." />;
  if (error) return (
    <div className="max-w-md mx-auto mt-20 text-center p-6 border border-rose-500/40 bg-rose-500/10 rounded-lg text-rose-400 font-mono text-sm">
      ⚠ {error}
    </div>
  );

  const progressPercent = totalQuestions > 0 ? Math.round((questionsAnswered / totalQuestions) * 100) : 0;

  const getVerdictBadgeColor = (verdict) => {
    if (!verdict) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    if (verdict.includes('Strong')) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
    if (verdict.includes('Hire') && !verdict.includes('Leaning')) return 'bg-sky-500/20 text-sky-400 border-sky-500/50';
    if (verdict.includes('Leaning')) return 'bg-amber-500/20 text-amber-400 border-amber-500/50';
    return 'bg-rose-500/20 text-rose-400 border-rose-500/50';
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      {/* Session Top Bar */}
      <div className="flex justify-between items-center mb-4 pb-3 border-b border-theme-border">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="font-mono text-xs text-theme-muted">
            LIVE INTERVIEW • SESSION <strong className="text-theme-accent">{sessionId.slice(-6).toUpperCase()}</strong>
          </span>
        </div>
        <Timer seconds={120} resetKey={currentQuestion?.id} onExpire={() => {}} />
      </div>

      {/* Webcam Preview */}
      <VideoRoom enabled={true} />


      {/* Progress Bar */}
      <div className="mb-6 animate-fade-in">
        <div className="flex justify-between items-center mb-1.5">
          <span className="font-mono text-[10px] text-theme-muted uppercase">Question {questionsAnswered + 1} of {totalQuestions}</span>
          <span className="font-mono text-[10px] text-theme-accent font-bold">{progressPercent}% Complete</span>
        </div>
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {/* AI Voice Assistant */}
      {currentQuestion && (
        <AIInterviewerVoiceAssistant textToRead={currentQuestion.text} autoRead={true} />
      )}

      {/* Question Card */}
      <QuestionCard
        questionText={currentQuestion?.text}
        order={currentQuestion?.order}
        isFollowUp={currentQuestion?.order > 1}
      />

      {/* Evaluation Box */}
      {lastEvaluation && (
        <div className="mt-6 border border-theme-border rounded-xl p-5 bg-theme-surface/95 shadow-xl animate-scale-in space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-theme-border/60 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-base">👔</span>
              <h4 className="font-mono text-xs font-bold text-theme-text uppercase tracking-wider">
                Hiring Manager Evaluation
              </h4>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs font-semibold">
              <span className={`px-2.5 py-1 rounded-md border text-[11px] ${getVerdictBadgeColor(lastEvaluation.recruiterVerdict)}`}>
                Verdict: {lastEvaluation.recruiterVerdict || 'Hire'}
              </span>
              <span className="px-2.5 py-1 rounded-md border border-theme-accent/40 bg-theme-accent/15 text-theme-accent text-[11px]">
                Signal: {lastEvaluation.senioritySignal || 'Mid-Level'}
              </span>
            </div>
          </div>

          {/* Scores */}
          <div className="grid grid-cols-3 gap-3 text-center py-2.5 bg-theme-card rounded-lg border border-theme-border/50">
            <div>
              <span className="text-[10px] font-mono uppercase text-theme-muted block">Technical Depth</span>
              <span className="text-base font-mono font-bold text-theme-accent">{lastEvaluation.correctnessScore ?? 5}/10</span>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-theme-muted block">Clarity</span>
              <span className="text-base font-mono font-bold text-emerald-400">{lastEvaluation.clarityScore ?? 5}/10</span>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-theme-muted block">Structure</span>
              <span className="text-base font-mono font-bold text-purple-400">{lastEvaluation.structureScore ?? 5}/10</span>
            </div>
          </div>

          {/* Recruiter's Live Reaction */}
          {lastEvaluation.recruiterComment && (
            <div className="flex items-start gap-3 p-3.5 rounded-lg bg-theme-card border border-theme-accent/30 animate-fade-in">
              <span className="text-xl mt-0.5">🗣</span>
              <div>
                <span className="font-mono text-[10px] uppercase text-theme-muted block mb-0.5">Recruiter's Reaction</span>
                <p className="text-sm text-theme-text font-sans italic leading-snug">"{lastEvaluation.recruiterComment}"</p>
              </div>
            </div>
          )}

          {/* Feedback */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-mono text-theme-accent font-semibold mb-1">
              <span>👔</span> Recruiter Feedback:
            </div>
            <p className="text-sm text-theme-text font-sans leading-relaxed bg-theme-card/60 p-3.5 rounded-lg border border-theme-border/40">
              {lastEvaluation.feedback}
            </p>
          </div>

          {/* Missing Keywords */}
          {lastEvaluation.missingKeywords?.length > 0 && (
            <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs animate-fade-in">
              <span className="font-mono font-bold text-rose-400 block mb-1.5 flex items-center gap-1">
                <span>🔑</span> Missing Required Keywords (Marks Deducted):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {lastEvaluation.missingKeywords.map((kw, idx) => (
                  <span key={idx} className="font-mono text-[11px] px-2.5 py-0.5 rounded border border-rose-500/40 text-rose-300 bg-rose-500/20 font-semibold">
                    ❌ {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Strengths & Gaps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
            {lastEvaluation.keyStrengths?.length > 0 && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                <span className="font-mono font-bold text-emerald-400 block mb-1.5">✓ Strengths:</span>
                <ul className="space-y-1 text-theme-text list-disc list-inside text-[11px]">
                  {lastEvaluation.keyStrengths.map((str, idx) => <li key={idx}>{str}</li>)}
                </ul>
              </div>
            )}
            {lastEvaluation.missedOpportunities?.length > 0 && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <span className="font-mono font-bold text-amber-400 block mb-1.5">🎯 Gaps:</span>
                <ul className="space-y-1 text-theme-text list-disc list-inside text-[11px]">
                  {lastEvaluation.missedOpportunities.map((gap, idx) => <li key={idx}>{gap}</li>)}
                </ul>
              </div>
            )}
          </div>

          {/* Sample Strong Answer */}
          {lastEvaluation.sampleStrongAnswer && (
            <div className="p-3.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-xs">
              <span className="font-mono font-bold text-indigo-400 block mb-1">⭐ Benchmark Strong Answer:</span>
              <p className="text-theme-text font-sans text-xs italic leading-relaxed">
                "{lastEvaluation.sampleStrongAnswer}"
              </p>
            </div>
          )}
        </div>
      )}

      {/* Answer Area or Completion */}
      {isLastQuestion ? (
        <div className="mt-8 rounded-xl p-8 text-center border border-theme-border bg-theme-surface shadow-xl animate-scale-in">
          <span className="font-mono text-xs text-theme-accent px-3 py-1 rounded bg-theme-accent/15 border border-theme-accent/40 uppercase font-bold">
            ROUND COMPLETED
          </span>
          <h3 className="font-display text-xl font-bold text-theme-text mt-3 mb-2">All questions answered!</h3>
          <p className="text-sm text-theme-muted font-sans mb-6">
            Generate your comprehensive hiring committee report with offer probability and 7-day study roadmap.
          </p>
          <Button onClick={handleFinish} disabled={submitting} variant="primary" className="py-3 px-8 text-base shadow-lg">
            {submitting ? 'Generating Report...' : 'Finish & View Report ➔'}
          </Button>
        </div>
      ) : (
        <>
          <AnswerInput onSubmit={handleAnswer} disabled={submitting} />
          <VoiceRecorder onTranscript={setVoiceDraft} />
          {voiceDraft && (
            <div className="mt-3 p-3 rounded-lg bg-theme-card border border-theme-accent/30 text-xs font-mono text-theme-text animate-fade-in">
              <span className="text-theme-accent font-semibold">VOICE TRANSCRIBED:</span> "{voiceDraft}"
              <p className="text-[11px] text-theme-muted mt-1">Copy or edit this text into the answer block above.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default InterviewSession;
