'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCharacterStore } from '@/store/characterStore';
import { getLanguage, t } from '@/lib/i18n';
import { slugify } from '@/lib/save-utils';

interface GameOverScreenProps {
  playerName: string;
  speciesName: string;
  careerName: string;
  deathCause: string;
  deathLocation: string;
  totalXP: number;
  questsCompleted: number;
  selectedSubspecies: string | null;
  onNewGame: () => void;
  onLoadSave: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({
  playerName, speciesName, careerName, deathCause, deathLocation,
  totalXP, questsCompleted, selectedSubspecies, onNewGame, onLoadSave,
}) => {
  const [epitaph, setEpitaph] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [fadeIn, setFadeIn] = useState(false);
  const lang = getLanguage();

  useEffect(() => {
    setFadeIn(true);
    generateEpitaph();
  }, []);

  const generateEpitaph = async () => {
    try {
      const prompt = lang === 'de'
        ? `Du bist ein Star Wars Erzähler. Schreibe einen kurzen, emotionalen Nachruf (3-4 Sätze) für diesen gefallenen Helden: Name: ${playerName}, Spezies: ${speciesName}, Karriere: ${careerName}. Todesursache: ${deathCause}. Ort: ${deathLocation}. Quests abgeschlossen: ${questsCompleted}. XP verdient: ${totalXP}. Stil: Episch, traurig, würdevoll. Wie eine Grabinschrift in der Galaxis. Antworte NUR mit dem Text, kein JSON.`
        : `You are a Star Wars narrator. Write a short, emotional epitaph (3-4 sentences) for this fallen hero: Name: ${playerName}, Species: ${speciesName}, Career: ${careerName}. Cause of death: ${deathCause}. Location: ${deathLocation}. Quests completed: ${questsCompleted}. XP earned: ${totalXP}. Style: Epic, sad, dignified. Like a galactic tombstone inscription. Respond ONLY with the text, no JSON.`;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: prompt }], rawText: true }),
      });

      if (response.ok) {
        const data = await response.json();
        setEpitaph(data.rawText || data.narrative || '');
      }
    } catch {
      setEpitaph(lang === 'de'
        ? `${playerName} fiel im Kampf auf ${deathLocation}. Die Galaxis wird sich an diesen Namen erinnern.`
        : `${playerName} fell in battle on ${deathLocation}. The galaxy will remember this name.`
      );
    }
    setLoading(false);
  };

  const portraitSrc = selectedSubspecies
    ? `/species/${slugify(speciesName)}-${slugify(selectedSubspecies)}.jpg`
    : `/species/${slugify(speciesName)}.jpg`;

  return (
    <div className={`fixed inset-0 z-[300] bg-black font-mono flex flex-col items-center justify-center transition-opacity duration-1000 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
      {/* Dim red vignette */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-red-950/40 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-8 max-w-md space-y-6">

        {/* Portrait with death overlay */}
        <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-red-500/50 shadow-[0_0_40px_rgba(239,68,68,0.3)]">
          <img
            src={portraitSrc}
            alt={playerName}
            className="w-full h-full object-cover object-top grayscale opacity-60"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        </div>

        {/* GAME OVER */}
        <div className="space-y-2">
          <div className="text-[10px] text-red-500 font-black uppercase tracking-[0.5em] animate-pulse">
            Game Over
          </div>
          <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">
            {playerName}
          </h1>
          <div className="text-[11px] text-zinc-500">
            {speciesName} — {careerName}
          </div>
        </div>

        {/* Death info */}
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 w-full">
          <div className="text-[8px] text-red-400 font-black uppercase tracking-widest mb-1">
            {lang === 'de' ? 'Gefallen auf' : 'Fallen at'} {deathLocation}
          </div>
          <p className="text-[11px] text-red-300/80 italic">
            {deathCause}
          </p>
        </div>

        {/* Epitaph */}
        <div className="w-full">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-4">
              <div className="w-4 h-4 border-2 border-zinc-600 border-t-zinc-400 rounded-full animate-spin" />
              <span className="text-[9px] text-zinc-600 uppercase tracking-widest">{lang === 'en' ? 'Writing epitaph...' : 'Nachruf wird verfasst...'}</span>
            </div>
          ) : (
            <p className="text-sm text-zinc-400 font-sans italic leading-relaxed">
              &ldquo;{epitaph}&rdquo;
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="flex gap-6 text-center">
          <div>
            <div className="text-lg font-black text-amber-500">{totalXP}</div>
            <div className="text-[7px] text-zinc-600 uppercase tracking-widest">XP {lang === 'de' ? 'Verdient' : 'Earned'}</div>
          </div>
          <div>
            <div className="text-lg font-black text-emerald-500">{questsCompleted}</div>
            <div className="text-[7px] text-zinc-600 uppercase tracking-widest">{lang === 'de' ? 'Missionen' : 'Quests'}</div>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full space-y-3 pt-4">
          <button
            onClick={onLoadSave}
            className="w-full bg-zinc-900 border border-zinc-700 text-white font-black py-4 rounded-xl uppercase tracking-widest text-[11px] hover:bg-zinc-800 active:scale-95 transition-all"
          >
            {lang === 'de' ? 'Letzten Spielstand laden' : 'Load Last Save'}
          </button>
          <button
            onClick={onNewGame}
            className="w-full bg-amber-600 hover:bg-amber-500 text-black font-black py-4 rounded-xl uppercase tracking-widest text-[11px] active:scale-95 transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)]"
          >
            {lang === 'de' ? 'Neues Abenteuer' : 'New Adventure'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOverScreen;
