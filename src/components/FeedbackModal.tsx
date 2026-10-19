'use client';

import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Check, 
  MessageSquare, 
  Copy, 
  ExternalLink, 
  AlertCircle,
  Mail,
  Sparkles
} from 'lucide-react';
import { safeCopyToClipboard } from '@/lib/calculator';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  { id: 'peptide', label: '💊 Request New Peptide', placeholder: 'Which peptide would you like to see added? (e.g. CagriSema, BPC-157, AOD-9604, Tesofensine...)' },
  { id: 'feature', label: '💡 Feature Suggestion', placeholder: 'What feature or tool improvement would make PepPlotter more helpful for you?' },
  { id: 'bug', label: '🐛 Bug Report', placeholder: 'Describe what happened, what inputs you used, or any unexpected calculation behavior...' },
  { id: 'general', label: '💬 General Feedback', placeholder: 'Share your thoughts, clinical feedback, or experience using the tool...' },
];

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('peptide');
  const [message, setMessage] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [honeypot, setHoneypot] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState<boolean>(false);

  if (!isOpen) return null;

  const activeCategoryObj = CATEGORIES.find((c) => c.id === selectedCategory) || CATEGORIES[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || message.trim().length < 3) {
      setErrorMessage('Please enter at least 3 characters for your feedback.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: activeCategoryObj.label,
          message: message.trim(),
          email: email.trim() || undefined,
          _hp: honeypot, // Honeypot
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to send feedback. Please try again or use direct email.');
      }

      setIsSuccess(true);
      setMessage('');
      setEmail('');
    } catch (err: unknown) {
      const errText = err instanceof Error ? err.message : 'An error occurred while submitting feedback.';
      setErrorMessage(errText);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopySupportEmail = async () => {
    await safeCopyToClipboard('support@pepplotter.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const getGmailComposeUrl = () => {
    const subject = encodeURIComponent(`PepPlotter Feedback: ${activeCategoryObj.label}`);
    const body = encodeURIComponent(message ? `${message}\n\n---\nSent from PepPlotter.com` : 'Hi PepPlotter team,\n\n');
    return `https://mail.google.com/mail/?view=cm&fs=1&to=support@pepplotter.com&su=${subject}&body=${body}`;
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-dialog-title"
    >
      <div 
        className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 id="feedback-dialog-title" className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2">
                <span>Community Feedback &amp; Requests</span>
                <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-mono rounded font-semibold border border-emerald-500/20">
                  Direct to Dev
                </span>
              </h2>
              <p className="text-xs text-slate-400">Anonymous &amp; instant. Help us expand clinical compound tools.</p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close feedback dialog"
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {isSuccess ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Check className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">Thank You for Your Feedback!</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
                  Your message has been delivered to our engineering dashboard. We review every suggestion to keep PepPlotter 100% free, accurate, and ad-free.
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => {
                    setIsSuccess(false);
                    onClose();
                  }}
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  What is your feedback about?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setErrorMessage(null);
                      }}
                      className={`px-3 py-2 text-left rounded-xl text-xs font-medium transition-all border ${
                        selectedCategory === cat.id
                          ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 shadow-sm shadow-emerald-500/10'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Input */}
              <div>
                <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5 font-medium">
                  <label htmlFor="feedback-message">
                    <span>Details &amp; Suggestions</span> <span className="text-rose-400">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {message.length}/1000
                  </span>
                </div>
                <textarea
                  id="feedback-message"
                  rows={4}
                  maxLength={1000}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={activeCategoryObj.placeholder}
                  required
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-400 outline-none resize-none transition-colors"
                />
              </div>

              {/* Optional Email */}
              <div>
                <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5 font-medium">
                  <label htmlFor="feedback-email">
                    <span>Your Email</span> <span className="text-slate-400 font-normal">(Optional — 100% anonymous if left blank)</span>
                  </label>
                </div>
                <input
                  id="feedback-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com (only if you would like a reply)"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder:text-slate-400 outline-none transition-colors"
                />
              </div>

              {/* Honeypot field (hidden from real users, traps spam bots) */}
              <div className="hidden" aria-hidden="true">
                <input
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>

              {/* Error Banner */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/50 flex items-start gap-2 text-xs text-rose-300">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span>{errorMessage}</span>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting || message.trim().length < 3}
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Sending directly to dev team...</span>
                    </span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit In-Page Feedback</span>
                    </>
                  )}
                </button>
              </div>

              {/* Alternative Fallback Options */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span className="text-[11px]">Prefer web email?</span>
                <div className="flex items-center gap-3">
                  <a
                    href={getGmailComposeUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                  >
                    <span>Open in Gmail</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    type="button"
                    onClick={handleCopySupportEmail}
                    className="inline-flex items-center gap-1 text-[11px] text-slate-300 hover:text-slate-100 font-medium transition-colors cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedEmail ? 'Copied!' : 'Copy support@pepplotter.com'}</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Official Contact & Clinical Inquiry Footer Card */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3 text-[11px] text-slate-400">
          <div className="flex items-center gap-2 text-slate-300">
            <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>
              Official &amp; Clinical Inquiries:{' '}
              <a 
                href="mailto:support@pepplotter.com" 
                className="text-emerald-400 hover:text-emerald-300 font-medium underline underline-offset-2"
              >
                support@pepplotter.com
              </a>
            </span>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
