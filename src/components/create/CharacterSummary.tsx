'use client';

import React, { useState } from 'react';
import { useCharacterStore } from '../../store/characterStore';
import { useRouter } from 'next/navigation';
import HolocronGuide from './HolocronGuide';
import ProgressTracker from './ProgressTracker';

const CharacterSummary: React.FC = () => {
  const router = useRouter();
  const { 
    players, activePlayerIndex, setName, addPlayer, setActivePlayer, removePlayer
  } = useCharacterStore();

  const activePlayer = players[activePlayerIndex];
  const { 
    species, 
    career, 
    specializations, 
    characteristics,
    availableXP,
    name,
    credits,
    backgroundOption,
    backgroundValue,
    backgroundType,
    ownedGear,
    ownedTalents
  } = activePlayer;

  const [isEditingName, setIsEditingName] = useState(false);
  const [activeTab, setActiveTab] = useState<'skills' | 'talents' | 'gear' | 'story'>('skills');
  const [backstory, setBackstory] = useState<string>('');
  const [generating, setGenerating] = useState(false);

  const mainSpec = specializations[0];

  const generateBackstory = async () => {
    setGenerating(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { 
              role: 'system', 
              content: 'Du bist ein Star Wars Game Master. Schreibe eine kurze, epische Hintergrundgeschichte (max 150 Wörter) für diesen Charakter basierend auf seiner Spezies, Karriere und seinem Hintergrund. Nutze einen düsteren, atmosphärischen Ton. Antworte in reinem JSON-Format: {"response": "deine geschichte"}' 
            },
            { 
              role: 'user', 
              content: `Charakter: ${name}, Spezies: ${species?.name}, Karriere: ${career?.name}, Spezialisierung: ${mainSpec?.name}, Hintergrund: ${backgroundOption} (${backgroundType})` 
            }
          ]
        })
      });
      const data = await response.json();
      setBackstory(data.response || data.content || 'Die Archive sind korrumpiert. Keine Geschichte verfügbar.');
    } catch (error) {
      setBackstory('Verbindung zum Holocron unterbrochen.');
    }
    setGenerating(false);
  };

  const woundThreshold = species ? species.woundThresholdBase + characteristics.brawn : 0;
  const strainThreshold = species ? species.strainThresholdBase + characteristics.willpower : 0;
  const armor = ownedGear.filter(g => g.soak !== undefined);
  const soak = characteristics.brawn + armor.reduce((acc, curr) => acc + (curr.soak || 0), 0);
  const defense = armor.reduce((acc, curr) => Math.max(acc, curr.defense || 0), 0);

  const allSkills = new Set([
    ...(career?.careerSkills || []),
    ...(mainSpec?.skills || [])
  ]);

  const handleAddMember = () => {
    if (players.length >= 4) return;
    addPlayer();
    setActivePlayer(players.length); 
    router.push('/create');
  };

  if (!species || !career) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black text-amber-500 font-mono p-12 text-center uppercase tracking-widest">
        <div className="text-4xl mb-4 animate-pulse">⚠️</div>
        <h1 className="text-lg font-black">Data_Loss_Detected</h1>
        <button onClick={() => router.push('/')} className="mt-8 border border-amber-500 px-8 py-3 text-[10px] font-black uppercase">Reboot</button>
      </div>
    );
  }

  return (
    <main className="min-h-dvh w-full bg-black text-zinc-300 font-mono flex flex-col p-6">
      <header className="flex justify-between items-center border-b border-zinc-800 pb-4 mb-6 sticky top-0 bg-black z-30">
        <div className="flex gap-4 items-center">
            <div className="w-8 h-8 border border-amber-500 flex items-center justify-center text-amber-500 font-black italic">!</div>
            <h1 className="text-xl font-black text-white italic tracking-tighter uppercase">CHARACTER_MANIFEST</h1>
        </div>
        <div className="text-right text-[10px] text-amber-500 font-bold tracking-widest">FINAL_DEPLOYMENT</div>
      </header>

      <ProgressTracker currentStep={7} />

      <div className="flex-1 space-y-6 pb-32">
        <section className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl">
          <div className="text-[8px] text-zinc-600 font-black uppercase tracking-widest mb-3 flex justify-between">
            <span>Party_Configuration</span>
            <span>{players.length} / 4</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {players.map((p, idx) => (
              <div key={p.id} onClick={() => setActivePlayer(idx)} className={`flex-1 min-w-[80px] p-3 border rounded-xl text-center cursor-pointer transition-all ${activePlayerIndex === idx ? 'border-amber-500 bg-amber-500/10' : 'border-zinc-800 bg-zinc-900/50 text-zinc-600'}`}>
                <div className="text-[10px] font-black uppercase truncate">{p.name || `P${idx+1}`}</div>
                <div className="text-[7px] font-bold opacity-50">{p.species?.name || '---'}</div>
              </div>
            ))}
            {players.length < 4 && <button onClick={handleAddMember} className="w-12 h-12 border border-zinc-800 border-dashed rounded-xl flex items-center justify-center text-zinc-600 hover:border-amber-500 hover:text-amber-500 transition-all">+</button>}
          </div>
        </section>

        <section className="bg-zinc-900/20 border border-zinc-800 p-6 rounded-2xl relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/[0.02] rotate-45 translate-x-12 -translate-y-12 border-b border-zinc-800"></div>
            <div className="text-[8px] text-zinc-600 font-black uppercase tracking-widest mb-3">Target_Identification</div>
            {isEditingName ? (
              <input autoFocus className="bg-zinc-950 border-b-2 border-amber-500 text-3xl font-black text-white outline-none w-full mb-2 uppercase italic tracking-tighter" value={name} onChange={(e) => setName(e.target.value)} onBlur={() => setIsEditingName(false)} />
            ) : (
              <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-2" onClick={() => setIsEditingName(true)}>{name || "UNNAMED_ENTITY"} <span className="text-[10px] text-amber-500 opacity-40 not-italic">EDIT_</span></h2>
            )}
            <div className="flex flex-wrap items-center gap-x-3 text-[11px] font-black text-amber-500 italic uppercase">
                <span>{species.name}</span>
                <span className="text-zinc-800 not-italic"> // </span>
                <span className="text-zinc-400">{career.name}</span>
                <span className="text-zinc-800 not-italic"> // </span>
                <span className="text-zinc-500">{mainSpec?.name}</span>
            </div>
        </section>

        <div className="grid grid-cols-1 gap-4">
            <section className="bg-zinc-900/10 border border-zinc-800 p-6 rounded-2xl shadow-inner">
                <div className="text-[8px] text-zinc-600 font-black uppercase mb-4 tracking-[0.2em]">Attribute_Matrix</div>
                <div className="grid grid-cols-3 gap-3">
                    {Object.entries(characteristics).map(([key, val]) => (
                        <div key={key} className="flex flex-col items-center bg-black/40 border border-zinc-900 p-3 rounded-xl shadow-md">
                            <span className="text-2xl font-black text-white leading-none mb-1">{val}</span>
                            <span className="text-[7px] text-zinc-600 uppercase font-black">{key.substring(0,3)}</span>
                        </div>
                    ))}
                </div>
            </section>
            <section className="grid grid-cols-3 gap-3">
                <div className="bg-red-500/[0.03] border border-red-900/30 p-4 rounded-xl flex flex-col items-center shadow-lg"><div className="text-[7px] text-red-500 font-black uppercase mb-1">Wounds</div><div className="text-2xl font-black text-red-500 leading-none">{woundThreshold}</div></div>
                <div className="bg-blue-500/[0.03] border border-blue-900/30 p-4 rounded-xl flex flex-col items-center shadow-lg"><div className="text-[7px] text-blue-500 font-black uppercase mb-1">Strain</div><div className="text-2xl font-black text-blue-400 leading-none">{strainThreshold}</div></div>
                <div className="bg-zinc-900/30 border border-zinc-800 p-4 rounded-xl flex flex-col items-center shadow-lg"><div className="text-[7px] text-zinc-500 font-black uppercase mb-1">Soak_Def</div><div className="text-xl font-black text-zinc-300 leading-none">{soak} / {defense}</div></div>
            </section>
        </div>

        <section className="flex gap-4">
            <div className="flex-1 border border-zinc-800 p-5 bg-zinc-900/10 rounded-2xl text-center shadow-xl"><div className="text-[8px] text-zinc-600 font-black uppercase mb-1 tracking-widest">XP_UNITS</div><div className="text-2xl font-black text-emerald-400 italic">{availableXP}</div></div>
            <div className="flex-1 border border-zinc-800 p-5 bg-zinc-900/10 rounded-2xl text-center shadow-xl"><div className="text-[8px] text-zinc-600 font-black uppercase mb-1 tracking-widest">CREDITS</div><div className="text-2xl font-black text-amber-500 italic">{credits}</div></div>
        </section>

        <section className="border border-amber-500/20 bg-amber-500/[0.01] p-5 rounded-2xl shadow-inner">
             <div className="text-[9px] text-amber-500 font-black uppercase tracking-widest mb-2 flex justify-between"><span>{backgroundType?.toUpperCase() || 'DESTINY'}</span><span className="opacity-50 font-mono">ID_{backgroundValue}</span></div>
             <p className="text-lg font-black text-white italic uppercase tracking-tighter">{backgroundOption || 'UNSET'}</p>
        </section>

        <div className="space-y-4">
            <div className="flex border border-zinc-900 bg-zinc-950 p-1 rounded-xl shadow-lg">
                {['skills', 'talents', 'gear', 'story'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab as any)} className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest transition-all rounded-lg ${activeTab === tab ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-700'}`}>{tab}</button>
                ))}
            </div>
            <section className="bg-zinc-900/10 border border-zinc-800 p-6 rounded-2xl min-h-[200px] shadow-inner">
                {activeTab === 'skills' && <div className="grid grid-cols-1 gap-2 animate-in fade-in duration-300">{Array.from(allSkills).sort().map(skill => (<div key={skill} className="flex justify-between items-center py-2.5 border-b border-zinc-900 last:border-0"><span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">{skill}</span><div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div></div>))}</div>}
                {activeTab === 'talents' && <div className="grid grid-cols-1 gap-3 animate-in fade-in duration-300">{ownedTalents.length > 0 ? ownedTalents.map(t => (<div key={t} className="p-3 border border-zinc-900 bg-zinc-950/50 rounded-lg flex justify-between items-center"><span className="text-[10px] font-black text-amber-500 uppercase italic tracking-tighter">{t}</span><span className="text-[8px] text-zinc-800 font-bold tracking-widest">ENABLED</span></div>)) : <div className="text-[10px] text-zinc-800 text-center py-12 uppercase font-black tracking-widest">No_Skills_Extracted</div>}</div>}
                {activeTab === 'gear' && <div className="grid grid-cols-1 gap-3 animate-in fade-in duration-300">{ownedGear.length > 0 ? ownedGear.map(g => (<div key={g.name} className="p-4 border border-zinc-900 bg-zinc-950/50 rounded-xl flex justify-between items-center group shadow-md"><div><div className="text-[11px] font-black text-white uppercase italic tracking-tighter">{g.name}</div><div className="text-[8px] text-zinc-700 font-black uppercase mt-1">Status: EQUIPPED</div></div><div className="text-[9px] text-amber-500 font-black italic">{g.damage ? `DMG_${g.damage}` : `ABS_${g.soak}`}</div></div>)) : <div className="text-[10px] text-zinc-800 text-center py-12 uppercase font-black tracking-widest">No_Gear_Assigned</div>}</div>}
                {activeTab === 'story' && <div className="animate-in fade-in duration-500 space-y-6">{!backstory && !generating ? (<div className="flex flex-col items-center justify-center py-12 space-y-4"><div className="text-3xl grayscale opacity-20">📖</div><button onClick={generateBackstory} className="border border-amber-500/50 text-amber-500 px-6 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-amber-500/10 transition-all">Generate_Backstory_</button></div>) : generating ? (<div className="flex flex-col items-center justify-center py-12 space-y-4"><div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div><div className="text-[8px] text-amber-500 font-black uppercase tracking-[0.5em] animate-pulse">Consulting_Archives...</div></div>) : (<div className="space-y-4"><p className="text-xs leading-relaxed text-zinc-400 font-sans italic selection:bg-amber-500/30 first-letter:text-2xl first-letter:font-black first-letter:text-amber-500 first-letter:mr-1">{backstory}</p><button onClick={generateBackstory} className="text-[8px] text-zinc-700 font-black uppercase tracking-widest hover:text-amber-500 transition-all">[ Re-Generate_Manifest ]</button></div>)}</div>}
            </section>
        </div>
      </div>
      <HolocronGuide title="FINALE_ÜBERSICHT" description="Glückwunsch! Dein Charakter ist bereit. Vergiss nicht, deinem Helden einen Namen zu geben." advice="Überprüfe noch einmal deine Wounds und Strain. Wenn du bereit bist, klicke auf 'Deploy to Sector'!" />
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent z-40">
          <button onClick={() => router.push('/play')} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-5 rounded-xl uppercase italic tracking-widest text-sm shadow-[0_20px_40px_rgba(16,185,129,0.3)] transition-all active:scale-95 border-b-4 border-emerald-800">Deploy_to_Sector_→</button>
      </div>
    </main>
  );
};

export default CharacterSummary;
