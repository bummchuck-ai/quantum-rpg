'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useCharacterStore, Player } from '@/store/characterStore';
import { useRouter } from 'next/navigation';
import HolocronGuide from '../create/HolocronGuide';
import DiceRollerModal from './DiceRollerModal';
import { DicePool, formatRollResult, RollResult, buildSkillPool } from '@/lib/engine/dice';

// Map skill names (DE/EN, various forms) to store keys and characteristics
const SKILL_MAP: Record<string, { key: string; char: string }> = {
  'astronavigation': { key: 'astrogation', char: 'intellect' },
  'astrogation': { key: 'astrogation', char: 'intellect' },
  'athletik': { key: 'athletics', char: 'brawn' },
  'athletics': { key: 'athletics', char: 'brawn' },
  'charme': { key: 'charm', char: 'presence' },
  'charm': { key: 'charm', char: 'presence' },
  'einschüchterung': { key: 'coercion', char: 'willpower' },
  'coercion': { key: 'coercion', char: 'willpower' },
  'computer': { key: 'computers', char: 'intellect' },
  'computers': { key: 'computers', char: 'intellect' },
  'coolness': { key: 'cool', char: 'presence' },
  'cool': { key: 'cool', char: 'presence' },
  'körperbeherrschung': { key: 'coordination', char: 'agility' },
  'coordination': { key: 'coordination', char: 'agility' },
  'täuschung': { key: 'deception', char: 'cunning' },
  'deception': { key: 'deception', char: 'cunning' },
  'disziplin': { key: 'discipline', char: 'willpower' },
  'discipline': { key: 'discipline', char: 'willpower' },
  'führungsqualität': { key: 'leadership', char: 'presence' },
  'leadership': { key: 'leadership', char: 'presence' },
  'mechanik': { key: 'mechanics', char: 'intellect' },
  'mechanics': { key: 'mechanics', char: 'intellect' },
  'medizin': { key: 'medicine', char: 'intellect' },
  'medicine': { key: 'medicine', char: 'intellect' },
  'verhandlung': { key: 'negotiation', char: 'presence' },
  'negotiation': { key: 'negotiation', char: 'presence' },
  'wahrnehmung': { key: 'perception', char: 'cunning' },
  'perception': { key: 'perception', char: 'cunning' },
  'pilot (planetar)': { key: 'pilotingPlanetary', char: 'agility' },
  'planetares steuern': { key: 'pilotingPlanetary', char: 'agility' },
  'pilotingplanetary': { key: 'pilotingPlanetary', char: 'agility' },
  'pilot (weltraum)': { key: 'pilotingSpace', char: 'agility' },
  'steuern (raum)': { key: 'pilotingSpace', char: 'agility' },
  'pilotingspace': { key: 'pilotingSpace', char: 'agility' },
  'widerstandskraft': { key: 'resilience', char: 'brawn' },
  'resilience': { key: 'resilience', char: 'brawn' },
  'fingerfertigkeit': { key: 'skulduggery', char: 'cunning' },
  'skulduggery': { key: 'skulduggery', char: 'cunning' },
  'heimlichkeit': { key: 'stealth', char: 'agility' },
  'stealth': { key: 'stealth', char: 'agility' },
  'szenekenntnis': { key: 'streetwise', char: 'cunning' },
  'streetwise': { key: 'streetwise', char: 'cunning' },
  'überleben': { key: 'survival', char: 'cunning' },
  'survival': { key: 'survival', char: 'cunning' },
  'aufmerksamkeit': { key: 'vigilance', char: 'willpower' },
  'vigilance': { key: 'vigilance', char: 'willpower' },
  'nahkampf (faust)': { key: 'brawl', char: 'brawn' },
  'nahkampf (unbewaffnet)': { key: 'brawl', char: 'brawn' },
  'brawl': { key: 'brawl', char: 'brawn' },
  'artillerie': { key: 'gunnery', char: 'agility' },
  'gunnery': { key: 'gunnery', char: 'agility' },
  'nahkampf (waffe)': { key: 'melee', char: 'brawn' },
  'nahkampf (bewaffnet)': { key: 'melee', char: 'brawn' },
  'melee': { key: 'melee', char: 'brawn' },
  'fernkampf (leicht)': { key: 'rangedLight', char: 'agility' },
  'leichte fernkampfwaffen': { key: 'rangedLight', char: 'agility' },
  'rangedlight': { key: 'rangedLight', char: 'agility' },
  'fernkampf (schwer)': { key: 'rangedHeavy', char: 'agility' },
  'schwere fernkampfwaffen': { key: 'rangedHeavy', char: 'agility' },
  'rangedheavy': { key: 'rangedHeavy', char: 'agility' },
  'kernwelten': { key: 'coreWorlds', char: 'intellect' },
  'coreworlds': { key: 'coreWorlds', char: 'intellect' },
  'allgemeinbildung': { key: 'education', char: 'intellect' },
  'bildung': { key: 'education', char: 'intellect' },
  'education': { key: 'education', char: 'intellect' },
  'altes wissen': { key: 'lore', char: 'intellect' },
  'sagenkunde': { key: 'lore', char: 'intellect' },
  'lore': { key: 'lore', char: 'intellect' },
  'äußerer rand': { key: 'outerRim', char: 'intellect' },
  'outerrim': { key: 'outerRim', char: 'intellect' },
  'unterwelt': { key: 'underworld', char: 'intellect' },
  'underworld': { key: 'underworld', char: 'intellect' },
  'kriegskunst': { key: 'warfare', char: 'intellect' },
  'warfare': { key: 'warfare', char: 'intellect' },
  'xenologie': { key: 'xenology', char: 'intellect' },
  'xenology': { key: 'xenology', char: 'intellect' },
  'lichtschwert': { key: 'lightsaber', char: 'brawn' },
  'lightsaber': { key: 'lightsaber', char: 'brawn' },
};

function resolveSkill(skillName: string): { key: string; char: string } {
  const normalized = skillName.toLowerCase().trim();
  return SKILL_MAP[normalized] || { key: normalized, char: 'intellect' };
}

interface Message {
  role: 'gm' | 'player';
  content: any;
}

interface RollRequest {
  skill: string;
  difficulty: string;
  reason: string;
  boost?: number;
  setback?: number;
}

const DIFFICULTY_MAP: Record<string, number> = {
  simple: 0,
  easy: 1,
  average: 2,
  hard: 3,
  daunting: 4,
  formidable: 5
};

const ChatInterface: React.FC = () => {
  const router = useRouter();
  const { 
    players, activePlayerIndex, updateStatus, exportState, importState, setActivePlayer
  } = useCharacterStore();
  
  const activePlayer = players[activePlayerIndex];
  const { 
    name, species, career, characteristics, credits, ownedGear, 
    specializations, backgroundOption, backgroundType, backgroundValue,
    wounds, strain
  } = activePlayer;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [showCharSheet, setShowCharSheet] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const [showDiceRoller, setShowDiceRoller] = useState(false);
  const [activeRollRequest, setActiveRollRequest] = useState<RollRequest | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  const woundThreshold = species ? species.woundThresholdBase + characteristics.brawn : 0;
  const strainThreshold = species ? species.strainThresholdBase + characteristics.willpower : 0;
  const armor = ownedGear.filter(g => g.soak !== undefined);
  const soak = characteristics.brawn + armor.reduce((acc, curr) => acc + (curr.soak || 0), 0);
  const defense = armor.reduce((acc, curr) => Math.max(acc, curr.defense || 0), 0);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!activePlayer.species || !activePlayer.career) {
       router.push('/');
       return;
    }
    startGame();
  }, []);

  const startGame = async () => {
    setIsTyping(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameState: {
            character: { ...activePlayer },
            party: players,
            currentPlanet: 'Tatooine (Orbit)',
            currentScene: 'Der Anfang',
            sessionHistory: [],
            destinyPool: { lightSide: 3, darkSide: 1 },
            questLog: [],
            npcRelationships: []
          },
          userMessage: "Beginne das Abenteuer! Beschreibe die erste Szene basierend auf unserem Team."
        })
      });
      const data = await response.json();
      handleGMResponse(data);
    } catch (error) {
      console.error("Intro failed:", error);
    }
    setIsTyping(false);
  };

  const handleGMResponse = (data: any) => {
    if (data.stateChanges) {
      updateStatus(
        data.stateChanges.wounds || 0,
        data.stateChanges.strain || 0,
        data.stateChanges.credits || 0
      );
    }
    setMessages(prev => [...prev, { role: 'gm', content: data }]);
  };

  const handleExport = () => {
    const data = exportState();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quantum-save-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      importState(content);
      setShowSettings(false);
      window.location.reload(); 
    };
    reader.readAsText(file);
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    const newMessage: Message = { role: 'player', content: { narrative: text } };
    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
    setIsTyping(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameState: { 
            character: { ...activePlayer },
            party: players,
            currentPlanet: 'Tatooine (Orbit)',
            currentScene: 'Fortlaufendes Abenteuer',
            sessionHistory: messages.map(m => m.content.narrative || ""),
            destinyPool: { lightSide: 3, darkSide: 1 },
            questLog: [],
            npcRelationships: []
          },
          userMessage: text
        })
      });
      const data = await response.json();
      handleGMResponse(data);
    } catch (error) {
        console.error("Chat failed:", error);
    }
    setIsTyping(false);
  };

  const initiateRoll = (skill: string, difficulty: string, reason: string, boost?: number, setback?: number) => {
    setActiveRollRequest({ skill, difficulty, reason, boost, setback });
    setShowDiceRoller(true);
  };

  const handleRollComplete = (result: RollResult) => {
    setShowDiceRoller(false);
    const resultText = formatRollResult(result);
    const rollMessage = `[SYSTEM] Würfelwurf für ${activePlayer.name} (${activeRollRequest?.skill}): ${resultText}. (Erfolge: ${result.netSuccess}, Vorteile: ${result.netAdvantage}, Triumph: ${result.triumph}, Despair: ${result.despair})`;
    handleSendMessage(rollMessage);
    setActiveRollRequest(null);
  };

  const getInitialPool = (): DicePool => {
    const difficultyLevel = DIFFICULTY_MAP[activeRollRequest?.difficulty.toLowerCase() || 'average'] || 2;
    const boost = activeRollRequest?.boost || 0;
    const setback = activeRollRequest?.setback || 0;

    // Resolve skill name to key + characteristic
    const { key: skillKey, char: charKey } = resolveSkill(activeRollRequest?.skill || '');
    const skillRank = (activePlayer.skillRanks || {})[skillKey] || 0;
    const charValue = (characteristics as any)[charKey] || 2;

    // Use FFG rules: buildSkillPool calculates ability vs proficiency dice
    return buildSkillPool(charValue, skillRank, difficultyLevel, 0, boost, setback);
  };

  return (
    <main className="h-screen w-screen bg-black text-zinc-300 font-mono flex flex-col overflow-hidden relative">
      {showSettings && (
        <div className="absolute inset-0 z-[100] bg-black/95 animate-in fade-in duration-300 flex flex-col items-center justify-center p-6">
          <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-8 shadow-2xl">
            <div className="text-center">
              <div className="text-[10px] text-amber-500 font-black uppercase tracking-[0.3em] mb-2">System_Core</div>
              <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">Einstellungen</h2>
            </div>
            <div className="space-y-3">
              <button onClick={handleExport} className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3">💾 Spielstand speichern</button>
              <label className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 cursor-pointer text-center">
                <span>📁</span> Spielstand laden
                <input type="file" accept=".json" onChange={handleImport} className="hidden" />
              </label>
              <button onClick={() => { if(confirm("Abenteuer wirklich abbrechen?")) router.push('/'); }} className="w-full border border-red-900/50 text-red-500 font-bold py-4 rounded-xl flex items-center justify-center gap-3">🚫 Beenden</button>
            </div>
            <button onClick={() => setShowSettings(false)} className="w-full bg-white text-black font-black py-4 rounded-xl uppercase tracking-widest text-xs">Schließen</button>
          </div>
        </div>
      )}

      {showDiceRoller && activeRollRequest && (
        <DiceRollerModal initialPool={getInitialPool()} skillName={activeRollRequest.skill} difficulty={activeRollRequest.difficulty} onRollComplete={handleRollComplete} onClose={() => setShowDiceRoller(false)} />
      )}

      {showCharSheet && (
        <div className="absolute inset-0 z-[100] bg-black animate-in fade-in zoom-in duration-300 flex flex-col">
          <header className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
            <h2 className="text-xl font-black text-white italic tracking-tighter uppercase">{name}_Bogen</h2>
            <button onClick={() => setShowCharSheet(false)} className="w-10 h-10 border border-zinc-800 flex items-center justify-center text-xl">✕</button>
          </header>
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            <section>
              <div className="text-[8px] text-zinc-600 font-black uppercase mb-4 tracking-[0.2em]">Attribute</div>
              <div className="grid grid-cols-3 gap-3">
                  {Object.entries(characteristics).map(([key, val]) => (
                      <div key={key} className="flex flex-col items-center bg-zinc-900/40 border border-zinc-800 p-3 rounded-xl">
                          <span className="text-2xl font-black text-white leading-none mb-1">{val}</span>
                          <span className="text-[7px] text-zinc-600 uppercase font-black">{key.substring(0,3)}</span>
                      </div>
                  ))}
              </div>
            </section>
            <section className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-xl">
                <div className="text-[7px] text-zinc-600 font-black uppercase mb-1 tracking-widest">Soak_Value</div>
                <div className="text-xl font-black text-white">{soak}</div>
              </div>
              <div className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-xl">
                <div className="text-[7px] text-zinc-600 font-black uppercase mb-1 tracking-widest">Defense</div>
                <div className="text-xl font-black text-white">{defense}</div>
              </div>
            </section>
            <section>
              <div className="text-[8px] text-zinc-600 font-black uppercase mb-4 tracking-[0.2em]">Equipment</div>
              <div className="space-y-2">
                {ownedGear.length > 0 ? ownedGear.map((g, i) => (
                  <div key={i} className="p-3 border border-zinc-800 bg-zinc-950 rounded-lg flex justify-between items-center">
                    <span className="text-[10px] font-black text-white uppercase italic">{g.name}</span>
                    <span className="text-[8px] text-amber-500 font-black italic">{g.damage ? `DMG_${g.damage}` : g.soak ? `SOAK_${g.soak}` : 'ITEM'}</span>
                  </div>
                )) : <div className="text-[10px] text-zinc-800 italic uppercase">Keine Ausrüstung...</div>}
              </div>
            </section>
          </div>
        </div>
      )}

      <header className="bg-zinc-950/80 border-b border-zinc-800 p-4 flex flex-col gap-4 backdrop-blur-md z-20 shadow-2xl">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
              <button onClick={() => setShowCharSheet(true)} className="w-10 h-10 border border-amber-500/50 rounded bg-amber-500/5 flex items-center justify-center active:scale-90">
                  <span className="text-amber-500 font-black italic text-xl">{name?.charAt(0) || 'Q'}</span>
              </button>
              <div>
                  <h1 className="text-sm font-black text-white italic tracking-tighter truncate max-w-[120px]">{name || 'PILOT_UNKNOWN'}</h1>
                  <div className="text-[7px] text-zinc-500 tracking-[0.2em] uppercase">{credits} Credits</div>
              </div>
          </div>
          <div className="flex gap-4 items-center">
              <div className="text-right">
                  <div className="text-[7px] text-red-500/50 font-black uppercase tracking-widest mb-1">Wounds</div>
                  <div className="text-xs font-black text-red-500 italic">{wounds}/{woundThreshold}</div>
              </div>
              <div className="text-right">
                  <div className="text-[7px] text-blue-500/50 font-black uppercase tracking-widest mb-1">Strain</div>
                  <div className="text-xs font-black text-blue-400 italic">{strain}/{strainThreshold}</div>
              </div>
              <button onClick={() => setShowSettings(true)} className="w-10 h-10 border border-zinc-800 rounded bg-zinc-900 flex items-center justify-center active:scale-90 ml-2">⚙️</button>
          </div>
        </div>

        {players.length > 1 && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {players.map((p, idx) => (
              <div key={p.id} onClick={() => setActivePlayer(idx)} className={`flex-1 min-w-[100px] p-2 border rounded-lg flex items-center gap-2 cursor-pointer transition-all ${activePlayerIndex === idx ? 'border-amber-500 bg-amber-500/10' : 'border-zinc-900 bg-black/40 opacity-40'}`}>
                <div className="w-6 h-6 rounded bg-zinc-800 flex items-center justify-center text-[10px] font-black">{p.name?.charAt(0) || idx+1}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-[8px] font-black uppercase truncate text-white">{p.name || 'PILOT'}</div>
                  <div className="h-0.5 w-full bg-zinc-800 mt-0.5 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500" style={{ width: `${Math.max(0, 100 - (p.wounds / ((p.species?.woundThresholdBase || 10) + p.characteristics.brawn)) * 100)}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar pb-32">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'player' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
            <div className={`max-w-[90%] ${msg.role === 'player' ? 'bg-zinc-900 border border-zinc-800 p-4 rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl shadow-xl' : 'space-y-4'}`}>
              {msg.role === 'gm' ? (
                <div className="space-y-6">
                  {msg.content.error && <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl text-xs font-mono text-red-200">{msg.content.error}</div>}
                  {msg.content.narrative && <p className="text-base md:text-lg leading-relaxed text-zinc-300 font-sans italic">{msg.content.narrative}</p>}
                  {msg.content.npcDialogue?.length > 0 && (
                    <div className="space-y-3 border-l-2 border-amber-500/30 pl-4 bg-amber-500/[0.02] py-2">
                        {msg.content.npcDialogue.map((d: any, idx: number) => (
                            <div key={idx}>
                                <span className="text-[8px] font-black text-amber-500 uppercase tracking-[0.2em]">{d.name}</span>
                                <p className="text-xs text-zinc-400 mt-1 italic font-sans leading-relaxed">"{d.text}"</p>
                            </div>
                        ))}
                    </div>
                  )}
                  {msg.content.requiresRoll && msg.content.rollInfo && (
                    <div className="bg-amber-500/5 border border-amber-500/30 p-4 rounded-xl flex items-center justify-between">
                        <div className="flex-1">
                            <div className="text-[8px] text-amber-500 font-black uppercase tracking-widest mb-1">Incoming_Challenge</div>
                            <div className="text-xs font-black text-white uppercase italic">{msg.content.rollInfo.skill} <span className="text-zinc-500">//</span> {msg.content.rollInfo.difficulty}</div>
                        </div>
                        <button onClick={() => initiateRoll(msg.content.rollInfo.skill, msg.content.rollInfo.difficulty, msg.content.rollInfo.reason, msg.content.rollInfo.boost, msg.content.rollInfo.setback)} className="bg-amber-600 hover:bg-amber-500 text-black font-black px-4 py-3 rounded-lg text-xs uppercase tracking-widest animate-pulse">🎲 Würfeln</button>
                    </div>
                  )}
                  <div className="grid grid-cols-1 gap-2 pt-4">
                    {msg.content.options?.map((opt: any) => (
                        <button key={opt.id} onClick={() => handleSendMessage(opt.text)} className="bg-zinc-900/50 border border-zinc-800 hover:border-amber-500/50 p-4 rounded-xl text-left transition-all active:scale-95">
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] text-amber-500 font-black opacity-40 border border-amber-500/20 w-6 h-6 flex items-center justify-center rounded uppercase italic">{opt.id}</span>
                                <span className="text-[10px] text-zinc-400 font-black uppercase">{opt.text}</span>
                            </div>
                        </button>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-white font-black italic uppercase tracking-tight">{msg.content.narrative}</p>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
            <div className="flex justify-start animate-pulse">
                <div className="bg-zinc-900/20 text-[8px] text-amber-500 font-black uppercase tracking-[0.5em] p-2 border border-amber-500/10 rounded">GM_Thinking...</div>
            </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black to-transparent z-30">
        <div className="max-w-2xl mx-auto flex gap-3">
            <div className="flex-1 relative">
                <input className="w-full bg-zinc-950 border border-zinc-800 p-5 rounded-2xl text-xs outline-none focus:border-amber-500 text-white placeholder:text-zinc-800 shadow-2xl font-mono" placeholder="EINGABE_KOMMANDO..." value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputValue)} />
            </div>
            <button onClick={() => handleSendMessage(inputValue)} className="bg-amber-600 hover:bg-amber-500 text-black px-8 rounded-2xl transition-all active:scale-90 font-black">📡</button>
        </div>
      </div>
      <HolocronGuide title="GEFECHTS_MODUS" description="Aktives Spiel. Nutze die Eingabe unten für Aktionen. GM reagiert und fordert Würfe an. Oben links: Charakterbogen. Oben rechts: Team-Wechsel (Hotseat)." advice="Speichere dein Spiel regelmäßig über das Zahnrad-Symbol!" />
    </main>
  );
};

export default ChatInterface;
