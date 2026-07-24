import React, { useState } from 'react';
import { Key, X, Check, ExternalLink, Sparkles, AlertCircle } from 'lucide-react';
import { getApiKey, setApiKey } from '../services/tmdbApi';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onKeySaved }) => {
  const [keyInput, setKeyInput] = useState(getApiKey());
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setApiKey(keyInput);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onKeySaved();
      onClose();
    }, 800);
  };

  const handleResetDefault = () => {
    setApiKey('');
    setKeyInput(getApiKey());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onKeySaved();
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md rounded-3xl bg-[#0d0f17] border border-white/10 p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Key className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white">TMDB API Settings</h2>
              <p className="text-xs text-gray-400">Configure your live TMDB API connection</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-gray-300 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wider">
              TMDB v3 API Key
            </label>
            <input
              type="text"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="Paste your 32-character TMDB API Key..."
              className="w-full rounded-xl bg-black/60 border border-white/15 p-3 text-sm text-white placeholder-gray-500 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-mono"
            />
          </div>

          <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3.5 text-xs text-amber-300 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <Sparkles className="h-4 w-4" />
              <span>Out-of-the-Box Connection Active</span>
            </div>
            <p className="text-[11px] text-amber-200/80 leading-relaxed">
              MovieVerse comes with a default TMDB API key. You can also paste your own key from{' '}
              <a
                href="https://www.themoviedb.org/settings/api"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-white inline-flex items-center gap-1"
              >
                The Movie Database <ExternalLink className="h-3 w-3" />
              </a>
              .
            </p>
          </div>

          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleResetDefault}
              className="text-xs font-semibold text-gray-400 hover:text-white"
            >
              Reset Default
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 px-5 py-2.5 text-xs font-bold text-black shadow-lg"
            >
              {savedSuccess ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Key Saved!</span>
                </>
              ) : (
                <span>Save Key</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
