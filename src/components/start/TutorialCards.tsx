'use client';

import React, { useState, useRef } from 'react';
import HolocronOrb from '@/components/ui/HolocronOrb';
import { playNavigate, playConfirm } from '@/lib/sounds';
import { getLanguage } from '@/lib/i18n';

interface TutorialCardsProps {
  onComplete: () => void;
}

const TUTORIAL_PAGES_DE = [
  {
    title: 'WILLKOMMEN, REISENDER',
    sections: [
      { heading: 'Die Galaxis erwartet dich', text: 'Quantum RPG ist ein Star Wars Rollenspiel, in dem ein KI-Game Master deine Geschichte erzählt. Jede Entscheidung formt dein Abenteuer — es gibt kein "richtig" oder "falsch", nur DEINE Geschichte.' },
      { heading: 'Wie es funktioniert', text: 'Du beschreibst was dein Charakter tut. Der Game Master reagiert, beschreibt die Welt und bietet dir Optionen. Bei riskanten Aktionen wird gewürfelt — Erfolg, Fehlschlag, Triumph und Verzweiflung weben die Geschichte.' },
    ]
  },
  {
    title: 'CHARAKTER-ERSCHAFFUNG',
    sections: [
      { heading: '1. Spezies wählen', text: '92 spielbare Spezies — von Menschen über Twi\'leks bis Wookiees. Jede hat einzigartige Attribute, Wunden-Schwelle, Start-XP und Spezialfähigkeiten. Swipe durch die Karten um deine Spezies zu finden.' },
      { heading: '2. Karriere & Spezialisierung', text: '20 Karrieren mit je 6 Spezialisierungen. Deine Karriere bestimmt welche Fertigkeiten günstiger sind. Schmuggler, Kopfgeldjäger, Soldat, Diplomat, Mystiker — jeder Pfad spielt sich anders.' },
      { heading: '3. Hintergrund', text: 'Obligation (Schulden/Verpflichtungen), Pflicht (Dienst an einer Sache) oder Moralität (innerer Kompass für Machtnutzer). Du kannst dein Schicksal erhöhen für +10 XP oder +2.500 Credits.' },
    ]
  },
  {
    title: 'ATTRIBUTE & FERTIGKEITEN',
    sections: [
      { heading: 'Die 6 Attribute', text: 'Stärke (Nahkampf), Gewandtheit (Fernkampf), Intelligenz (Wissen), List (Heimlichkeit), Willenskraft (Macht), Charisma (sozial). WICHTIG: Nach der Erschaffung können Attribute nur noch durch das seltene Talent "Hingabe" gesteigert werden!' },
      { heading: '34 Fertigkeiten', text: 'Karriere-Skills kosten nur 5 XP pro Rang (statt 10). Investiere zuerst in die Skills die zu deinem Spielstil passen. Piloten brauchen Steuern, Kämpfer Fernkampf, Schmuggler Täuschung.' },
    ]
  },
  {
    title: 'TALENTE & AUSRÜSTUNG',
    sections: [
      { heading: 'Talentbäume', text: '71 Spezialisierungen mit je 20 Talenten in 5 Tiers. Du kaufst von oben nach unten. "Ranked" Talente können mehrfach gekauft werden. Tipp: Die Kosten steigen pro Reihe um 5 XP.' },
      { heading: 'Waffen & Rüstung', text: '184 Waffen in 10 Kategorien — von Blasterpistolen über Vibroklingen bis zum Thermaldetonator. Achte auf Encumbrance (Gewicht) und Sperrigkeit (braucht genug Stärke). Kauf mindestens 2-3 Stimpacks!' },
    ]
  },
  {
    title: 'DAS WÜRFELSYSTEM',
    sections: [
      { heading: 'FFG Würfel', text: 'Grüne Fähigkeitswürfel + gelbe Kompetenzwürfel gegen lila Schwierigkeitswürfel + rote Herausforderungswürfel. Dazu blaue Boost- und schwarze Komplikationswürfel.' },
      { heading: 'Ergebnisse', text: 'Erfolg vs. Fehlschlag bestimmt OB es klappt. Vorteile vs. Bedrohungen bestimmen WIE es klappt. Triumph = epischer Moment. Verzweiflung = Katastrophe. Der GM interpretiert alles narrativ.' },
    ]
  },
  {
    title: 'KAMPF & TOD',
    sections: [
      { heading: 'Kampfsystem', text: 'Jede Runde: 1 Aktion + 1 Manöver. Aktionen: Angreifen, Fähigkeit nutzen. Manöver: Bewegen, Zielen, In Deckung gehen, Waffe wechseln. Du kannst 2 Erschöpfung ausgeben für ein 2. Manöver.' },
      { heading: 'Wunden & Tod', text: 'Wunden ≥ Schwelle = bewusstlos (nicht tot!). Kritische Verletzungen stapeln sich (+10 pro bestehender). "Sofortiger Tod" nur bei Würfelergebnis 151+. Der GM kann deinen Charakter retten — oder nicht.' },
    ]
  },
  {
    title: 'HERAUSFORDERUNGEN & MACHT',
    sections: [
      { heading: '10 Challenge-Ketten', text: 'Scharfschütze, Meisterjäger, Jedi, Kopfgeldjäger, Händler, Glücksspieler, Schatzsucher, Reitkunst, Waffenspezialist, Überlebenskünstler. Jede Kette schaltet neue Talentbäume frei!' },
      { heading: 'Die Macht', text: '18 Machtkräfte: Bewegen, Gespür, Beherrschung, Heilung, Telekinese, Kampfmeditation, Irreführung und mehr. Machtsensitive Karrieren starten mit Force Rating 1. Dunkle-Seite-Punkte = Konflikt!' },
    ]
  },
  {
    title: 'TIPPS FÜR DEN START',
    sections: [
      { heading: 'Für Anfänger', text: 'Wähle Mensch (flexibel, 110 XP) und Schmuggler oder Soldat (einfache Mechanik). Steigere 1-2 Attribute auf 3-4 bevor du Skills kaufst. Vergiss nicht: Stimpacks retten Leben!' },
      { heading: 'Spielerfahrung', text: 'Sprich mit NPCs, erkunde die Welt, probiere verschiedene Ansätze. Der GM belohnt kreatives Rollenspiel mit XP. Die Settings (⚙) im Chat bieten Save/Load, Sprachausgabe und Stimmenwahl.' },
    ]
  },
];

const TUTORIAL_PAGES_EN = [
  {
    title: 'WELCOME, TRAVELER',
    sections: [
      { heading: 'The Galaxy Awaits', text: 'Quantum RPG is a Star Wars role-playing game where an AI Game Master narrates your story. Every decision shapes your adventure — there is no "right" or "wrong", only YOUR story.' },
      { heading: 'How It Works', text: 'You describe what your character does. The Game Master reacts, describes the world, and offers options. Risky actions require dice rolls — success, failure, triumph and despair weave the tale.' },
    ]
  },
  {
    title: 'CHARACTER CREATION',
    sections: [
      { heading: '1. Choose Species', text: '92 playable species — from Humans to Twi\'leks to Wookiees. Each has unique attributes, wound threshold, starting XP and special abilities.' },
      { heading: '2. Career & Specialization', text: '20 careers with 6 specializations each. Your career determines which skills are cheaper. Smuggler, Bounty Hunter, Soldier, Diplomat, Mystic — each path plays differently.' },
      { heading: '3. Background', text: 'Obligation (debts), Duty (service to a cause) or Morality (inner compass for Force users). You can increase your fate for +10 XP or +2,500 Credits.' },
    ]
  },
  {
    title: 'ATTRIBUTES & SKILLS',
    sections: [
      { heading: 'The 6 Attributes', text: 'Brawn (melee), Agility (ranged), Intellect (knowledge), Cunning (stealth), Willpower (Force), Presence (social). IMPORTANT: After creation, attributes can only be raised by the rare "Dedication" talent!' },
      { heading: '34 Skills', text: 'Career skills cost only 5 XP per rank (vs 10). Invest first in skills that match your playstyle.' },
    ]
  },
  {
    title: 'TALENTS & GEAR',
    sections: [
      { heading: 'Talent Trees', text: '71 specializations with 20 talents each across 5 tiers. Buy from top to bottom. "Ranked" talents can be purchased multiple times.' },
      { heading: 'Weapons & Armor', text: '184 weapons in 10 categories. Watch Encumbrance (weight) and Cumbersome (needs enough Brawn). Buy at least 2-3 Stimpacks!' },
    ]
  },
  {
    title: 'DICE SYSTEM',
    sections: [
      { heading: 'FFG Dice', text: 'Green Ability + Yellow Proficiency dice vs Purple Difficulty + Red Challenge dice. Plus blue Boost and black Setback dice.' },
      { heading: 'Results', text: 'Success vs Failure determines IF it works. Advantage vs Threat determines HOW. Triumph = epic moment. Despair = catastrophe.' },
    ]
  },
  {
    title: 'COMBAT & DEATH',
    sections: [
      { heading: 'Combat System', text: 'Each round: 1 Action + 1 Maneuver. Actions: Attack, use ability. Maneuvers: Move, Aim, Take Cover, switch weapon.' },
      { heading: 'Wounds & Death', text: 'Wounds ≥ Threshold = unconscious (not dead!). Critical Injuries stack (+10 per existing). "Instant Death" only on roll 151+.' },
    ]
  },
  {
    title: 'CHALLENGES & THE FORCE',
    sections: [
      { heading: '10 Challenge Chains', text: 'Sharpshooter, Master Hunter, Jedi, Bounty Hunter, Trader, Gambler, Treasure Hunter, Riding, Weapon Specialist, Survivalist. Each chain unlocks new talent trees!' },
      { heading: 'The Force', text: '18 Force Powers: Move, Sense, Influence, Heal, Telekinesis, Battle Meditation, Misdirect and more. Force-sensitive careers start with Force Rating 1.' },
    ]
  },
  {
    title: 'TIPS FOR BEGINNERS',
    sections: [
      { heading: 'For New Players', text: 'Choose Human (flexible, 110 XP) and Smuggler or Soldier (simple mechanics). Raise 1-2 attributes to 3-4 before buying skills. Don\'t forget: Stimpacks save lives!' },
      { heading: 'Experience', text: 'Talk to NPCs, explore the world, try different approaches. The GM rewards creative roleplaying with XP. Settings (⚙) in chat offer Save/Load, voice output and voice selection.' },
    ]
  },
];

const TutorialCards: React.FC<TutorialCardsProps> = ({ onComplete }) => {
  const [showTutorial, setShowTutorial] = useState(false); // false = ask first
  const [page, setPage] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const lang = getLanguage();
  const pages = lang === 'en' ? TUTORIAL_PAGES_EN : TUTORIAL_PAGES_DE;

  const handleSkip = () => {
    playConfirm();
    setFadeOut(true);
    setTimeout(() => onCompleteRef.current(), 400);
  };

  const handleNext = () => {
    playNavigate();
    if (page < pages.length - 1) {
      setPage(prev => prev + 1);
    } else {
      handleSkip();
    }
  };

  const handlePrev = () => {
    playNavigate();
    if (page > 0) setPage(prev => prev - 1);
  };

  // Phase 1: Ask if tutorial wanted
  if (!showTutorial) {
    return (
      <div className={`fixed inset-0 bg-black z-[200] flex flex-col items-center justify-center px-6 font-mono select-none transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <HolocronOrb size={300} opacity={0.1} />
        </div>

        <div className="relative z-10 text-center max-w-sm space-y-8">
          <div className="text-[8px] text-amber-500 font-black uppercase tracking-[0.5em]">Holocron Archiv</div>
          <h2 className="text-2xl font-black text-white italic tracking-tight uppercase">
            {lang === 'en' ? 'Need a Briefing?' : 'Einweisung gefällig?'}
          </h2>
          <p className="text-[13px] text-zinc-500 leading-relaxed">
            {lang === 'en'
              ? 'The Holocron contains detailed instructions about character creation, combat, the Force and more. Recommended for new players.'
              : 'Das Holocron enthält ausführliche Informationen über Charaktererschaffung, Kampf, die Macht und mehr. Empfohlen für neue Spieler.'}
          </p>

          <div className="space-y-3 pt-4">
            <button
              onClick={() => { playConfirm(); setShowTutorial(true); }}
              className="w-full bg-amber-600 hover:bg-amber-500 text-black font-black py-4 rounded-xl uppercase tracking-widest text-[11px] active:scale-95 transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)]"
            >
              {lang === 'en' ? 'Yes, Open Holocron' : 'Ja, Holocron öffnen'}
            </button>
            <button
              onClick={handleSkip}
              className="w-full border border-zinc-800 text-zinc-500 hover:text-white font-black py-4 rounded-xl uppercase tracking-widest text-[11px] active:scale-95 transition-all"
            >
              {lang === 'en' ? 'No, I Know the Galaxy' : 'Nein, ich kenne die Galaxis'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Phase 2: Full tutorial
  const currentPage = pages[page];
  const isLast = page === pages.length - 1;

  return (
    <div className={`fixed inset-0 bg-black z-[200] flex flex-col font-mono select-none transition-opacity duration-500 safe-area-top ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
      {/* Header */}
      <header className="px-5 pt-5 pb-3 flex justify-between items-center">
        <div>
          <div className="text-[7px] text-amber-500/60 font-black uppercase tracking-[0.3em]">Holocron Archiv</div>
          <div className="text-[10px] text-zinc-600 font-bold">{page + 1} / {pages.length}</div>
        </div>
        <button onClick={handleSkip} className="text-[9px] text-zinc-600 hover:text-amber-500 uppercase tracking-widest transition-colors">
          [ {lang === 'en' ? 'Skip' : 'Überspringen'} ]
        </button>
      </header>

      {/* Progress bar */}
      <div className="px-5 mb-4">
        <div className="h-0.5 bg-zinc-900 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-500 transition-all duration-500"
            style={{ width: `${((page + 1) / pages.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 pb-32">
        <div key={page} className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
          <h2 className="text-xl font-black text-white italic tracking-tighter uppercase">
            {currentPage.title}
          </h2>

          {currentPage.sections.map((section, i) => (
            <div key={i} className="bg-zinc-900/40 border border-zinc-800/50 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-amber-500 rounded-full" />
                <h3 className="text-[10px] text-amber-500 font-black uppercase tracking-widest">
                  {section.heading}
                </h3>
              </div>
              <p className="text-[13px] text-zinc-400 leading-relaxed font-sans">
                {section.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black via-black/95 to-transparent z-10">
        <div className="flex gap-3 max-w-md mx-auto">
          {page > 0 && (
            <button
              onClick={handlePrev}
              className="flex-1 border border-zinc-800 text-zinc-400 font-black py-3.5 rounded-xl uppercase tracking-widest text-[10px] active:scale-95 transition-all"
            >
              ← {lang === 'en' ? 'Back' : 'Zurück'}
            </button>
          )}
          <button
            onClick={handleNext}
            className="flex-1 bg-amber-600 hover:bg-amber-500 text-black font-black py-3.5 rounded-xl uppercase tracking-widest text-[10px] active:scale-95 transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)]"
          >
            {isLast
              ? (lang === 'en' ? "Let's Go →" : 'Los geht\'s →')
              : (lang === 'en' ? 'Next →' : 'Weiter →')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TutorialCards;
