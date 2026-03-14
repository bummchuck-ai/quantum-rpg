'use client';

import React, { useState, useCallback } from 'react';
import { t, getLanguage } from '@/lib/i18n';
import { playConfirm, playClick, playNavigate } from '@/lib/sounds';

interface BackgroundOption {
  id: string;
  text: string;
}

interface IdentityModalProps {
  speciesName: string;
  onConfirm: (name: string, age: number | null, backgroundStory: string) => void;
  onClose: () => void;
}

const IdentityModal: React.FC<IdentityModalProps> = ({ speciesName, onConfirm, onClose }) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [backgroundStory, setBackgroundStory] = useState('');
  const [backgroundOptions, setBackgroundOptions] = useState<BackgroundOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [nameError, setNameError] = useState(false);

  const lang = getLanguage();

  const generateBackgrounds = useCallback(async () => {
    if (!name.trim()) {
      setNameError(true);
      return;
    }
    setNameError(false);
    setIsGenerating(true);
    setBackgroundOptions([]);
    setSelectedOption(null);
    setShowCustom(false);
    setBackgroundStory('');
    playNavigate();

    const ageStr = age ? (lang === 'de' ? `${age} Jahre alt` : `${age} years old`) : '';

    const systemPrompt = lang === 'de'
      ? `Du bist ein Star Wars Kreativ-Autor. Schreibe 3 kurze, unterschiedliche Hintergrundgeschichten (je 2-3 Sätze) für einen Star Wars Charakter. Gib NUR valides JSON zurück, keine Erklärungen.`
      : `You are a Star Wars creative writer. Write 3 short, distinct backstories (2-3 sentences each) for a Star Wars character. Return ONLY valid JSON, no explanations.`;

    const userPrompt = lang === 'de'
      ? `Charakter: ${name}, Spezies: ${speciesName}${ageStr ? `, ${ageStr}` : ''}. Erstelle 3 verschiedene Hintergrundgeschichten mit unterschiedlichen Themen (z.B. Schmuggler-Vergangenheit, tragischer Verlust, geheimnisvolle Herkunft). Format: {"options":[{"id":"A","text":"..."},{"id":"B","text":"..."},{"id":"C","text":"..."}]}`
      : `Character: ${name}, Species: ${speciesName}${ageStr ? `, ${ageStr}` : ''}. Create 3 different backstories with varied themes (e.g. smuggler past, tragic loss, mysterious origin). Format: {"options":[{"id":"A","text":"..."},{"id":"B","text":"..."},{"id":"C","text":"..."}]}`;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-secret': process.env.NEXT_PUBLIC_API_SECRET || '' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
        }),
      });

      if (!res.ok) throw new Error('API error');
      const data = await res.json();

      if (data.options && Array.isArray(data.options)) {
        setBackgroundOptions(data.options);
      } else {
        // Fallback: try to find options in response
        setBackgroundOptions([
          { id: 'A', text: lang === 'de' ? 'Der Holocron-Dienst ist momentan gestört. Schreibe deine eigene Geschichte!' : 'The Holocron service is currently disrupted. Write your own story!' },
        ]);
      }
    } catch {
      setBackgroundOptions([
        { id: 'A', text: lang === 'de' ? 'Verbindung zum Holocron unterbrochen. Schreibe deine eigene Geschichte!' : 'Connection to Holocron interrupted. Write your own story!' },
      ]);
    } finally {
      setIsGenerating(false);
    }
  }, [name, age, speciesName, lang]);

  const handleSelectOption = useCallback((opt: BackgroundOption) => {
    playClick();
    setSelectedOption(opt.id);
    setBackgroundStory(opt.text);
    setShowCustom(false);
  }, []);

  const handleConfirm = useCallback(() => {
    if (!name.trim()) {
      setNameError(true);
      return;
    }
    playConfirm();
    const finalAge = age ? parseInt(age) : null;
    onConfirm(name.trim().toUpperCase(), finalAge, backgroundStory.trim());
  }, [name, age, backgroundStory, onConfirm]);

  const handleCustomToggle = useCallback(() => {
    playClick();
    setShowCustom(true);
    setSelectedOption(null);
    setBackgroundStory('');
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-md max-h-[90dvh] overflow-y-auto bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-500 no-scrollbar">

        {/* Header */}
        <div className="sticky top-0 bg-zinc-950 border-b border-zinc-800 p-5 z-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[9px] text-amber-500 font-black uppercase tracking-[0.3em] mb-1">
                {speciesName}
              </div>
              <h2 className="text-xl font-black text-white italic tracking-tighter uppercase">
                {t('identityTitle')}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 border border-zinc-700 rounded flex items-center justify-center text-zinc-500 hover:text-white hover:border-zinc-500 transition-colors text-xs font-black"
            >
              ✕
            </button>
          </div>
          <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-widest">
            {t('identitySubtitle')}
          </p>
        </div>

        <div className="p-5 space-y-6">

          {/* Name Input */}
          <div>
            <label className="text-[10px] text-amber-500 font-black uppercase tracking-[0.3em] block mb-2">
              {t('identityName')}
            </label>
            <input
              className={`w-full bg-black border-b-2 ${nameError ? 'border-red-500' : 'border-amber-500/50 focus:border-amber-500'} p-3 text-xl font-mono font-black text-white uppercase tracking-wider outline-none placeholder:text-zinc-800 placeholder:font-normal placeholder:tracking-widest transition-colors`}
              placeholder={t('identityNamePlaceholder')}
              value={name}
              onChange={(e) => { setName(e.target.value.toUpperCase()); setNameError(false); }}
              autoFocus
            />
            {nameError && (
              <div className="text-[9px] text-red-400 font-bold mt-1 uppercase tracking-wider animate-in fade-in duration-200">
                {t('identityNameRequired')}
              </div>
            )}
          </div>

          {/* Age Input */}
          <div>
            <label className="text-[10px] text-amber-500 font-black uppercase tracking-[0.3em] block mb-2">
              {t('identityAge')}
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                max="999"
                className="w-24 bg-black border border-zinc-800 focus:border-amber-500 p-3 text-lg font-mono font-black text-white text-center outline-none rounded-lg transition-colors"
                placeholder={t('identityAgePlaceholder')}
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
              <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
                {t('identityStandard')}
              </span>
            </div>
          </div>

          {/* Background Story */}
          <div>
            <label className="text-[10px] text-amber-500 font-black uppercase tracking-[0.3em] block mb-1">
              {t('identityBackground')}
            </label>
            <p className="text-[10px] text-zinc-500 mb-3">{t('identityBackgroundDesc')}</p>

            {/* Generate / Regenerate Button */}
            <button
              onClick={generateBackgrounds}
              disabled={isGenerating}
              className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all mb-4 ${
                isGenerating
                  ? 'bg-zinc-900 border border-zinc-800 text-zinc-500 cursor-wait'
                  : 'bg-zinc-900 border border-amber-500/30 text-amber-500 hover:bg-amber-500/10 hover:border-amber-500 active:scale-95'
              }`}
            >
              {isGenerating ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-2 h-2 bg-amber-500 rounded-full animate-ping" />
                  {t('identityGenerating')}
                </span>
              ) : backgroundOptions.length > 0 ? (
                t('identityRegenerate')
              ) : (
                t('identityGenerate')
              )}
            </button>

            {/* Options */}
            {backgroundOptions.length > 0 && !showCustom && (
              <div className="space-y-3 animate-in slide-in-from-bottom-8 duration-500">
                {backgroundOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(opt)}
                    className={`w-full text-left p-4 border rounded-xl transition-all duration-200 ${
                      selectedOption === opt.id
                        ? 'border-amber-500 bg-amber-500/[0.08] shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                        : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-600 active:scale-[0.98]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-0.5 ${
                        selectedOption === opt.id
                          ? 'border-amber-500 bg-amber-500 text-black'
                          : 'border-zinc-700 text-zinc-600'
                      }`}>
                        {opt.id}
                      </div>
                      <p className="text-[12px] text-zinc-300 leading-relaxed font-sans">{opt.text}</p>
                    </div>
                  </button>
                ))}

                {/* Custom text toggle */}
                <button
                  onClick={handleCustomToggle}
                  className="w-full text-center text-[10px] text-zinc-600 hover:text-zinc-400 font-bold uppercase tracking-widest py-2 transition-colors"
                >
                  — {t('identityOrText')} —
                </button>
                <button
                  onClick={handleCustomToggle}
                  className="w-full py-2.5 border border-zinc-800 rounded-xl text-[10px] text-zinc-500 hover:text-zinc-300 hover:border-zinc-600 font-black uppercase tracking-widest transition-all"
                >
                  {t('identityCustom')}
                </button>
              </div>
            )}

            {/* Custom text area */}
            {showCustom && (
              <div className="animate-in fade-in duration-300">
                <textarea
                  className="w-full bg-black border border-zinc-800 focus:border-amber-500 p-4 rounded-xl text-xs text-white font-sans leading-relaxed outline-none resize-none h-32 placeholder:text-zinc-700 transition-colors"
                  placeholder={t('identityCustomPlaceholder')}
                  value={backgroundStory}
                  onChange={(e) => setBackgroundStory(e.target.value)}
                />
                {backgroundOptions.length > 0 && (
                  <button
                    onClick={() => { playClick(); setShowCustom(false); }}
                    className="text-[10px] text-zinc-600 hover:text-zinc-400 font-bold uppercase tracking-widest mt-2 transition-colors"
                  >
                    ← {t('identityBackground')}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer Confirm */}
        <div className="sticky bottom-0 bg-zinc-950 border-t border-zinc-800 p-5">
          <button
            onClick={handleConfirm}
            disabled={!name.trim()}
            className={`w-full font-black py-5 rounded-2xl uppercase italic tracking-widest text-xs shadow-2xl transition-all ${
              name.trim()
                ? 'bg-amber-600 hover:bg-amber-500 text-black active:scale-95'
                : 'bg-zinc-900 text-zinc-600 cursor-not-allowed border border-zinc-800'
            }`}
          >
            {t('identityConfirm')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IdentityModal;
