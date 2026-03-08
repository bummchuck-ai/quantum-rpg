'use client';

import React from 'react';
import type { Quest, NPC } from '@/lib/engine/game-state';

interface QuestLogProps {
  quests: Quest[];
  npcs: NPC[];
  onClose: () => void;
}

const QuestLog: React.FC<QuestLogProps> = ({ quests, npcs, onClose }) => {
  const activeQuests = quests.filter(q => q.status === 'active');
  const completedQuests = quests.filter(q => q.status === 'completed');
  const failedQuests = quests.filter(q => q.status === 'failed');

  const DispositionBar = ({ value }: { value: number }) => {
    const pct = ((value + 100) / 200) * 100;
    return (
      <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
        <div className={`h-full transition-all ${value >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`}
          style={{ width: `${pct}%`, marginLeft: value < 0 ? 0 : undefined }} />
      </div>
    );
  };

  return (
    <div className="absolute inset-0 z-[100] bg-black animate-in fade-in duration-300 flex flex-col">
      <header className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
        <h2 className="text-xl font-black text-white italic tracking-tighter uppercase">Missions_Log</h2>
        <button onClick={onClose} className="w-10 h-10 border border-zinc-800 flex items-center justify-center text-xl">✕</button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Active Quests */}
        <section>
          <div className="text-[8px] text-amber-500 font-black uppercase tracking-[0.2em] mb-3">Aktive Missionen ({activeQuests.length})</div>
          {activeQuests.length === 0 ? (
            <div className="text-[10px] text-zinc-700 italic">Keine aktiven Missionen...</div>
          ) : (
            <div className="space-y-2">
              {activeQuests.map(q => (
                <div key={q.id} className="bg-zinc-900 border border-amber-500/20 rounded-xl p-4">
                  <h3 className="text-sm font-black text-white uppercase italic tracking-tight">{q.title}</h3>
                  <p className="text-[9px] text-zinc-500 mt-1 mb-3">{q.description}</p>
                  {q.objectives.length > 0 && (
                    <div className="space-y-1">
                      {q.objectives.map((obj, i) => (
                        <div key={i} className="flex items-center gap-2 text-[9px]">
                          <div className={`w-3 h-3 border rounded-sm flex items-center justify-center ${obj.completed ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-700'}`}>
                            {obj.completed && <span className="text-[6px] text-black font-black">✓</span>}
                          </div>
                          <span className={obj.completed ? 'text-zinc-600 line-through' : 'text-zinc-400'}>{obj.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {(q.xpReward || q.creditsReward) && (
                    <div className="flex gap-3 mt-3 pt-2 border-t border-zinc-800">
                      {q.xpReward && <span className="text-[8px] text-amber-500 font-black">+{q.xpReward} XP</span>}
                      {q.creditsReward && <span className="text-[8px] text-emerald-500 font-black">+{q.creditsReward} Credits</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Completed Quests */}
        {completedQuests.length > 0 && (
          <section>
            <div className="text-[8px] text-emerald-500 font-black uppercase tracking-[0.2em] mb-3">Abgeschlossen ({completedQuests.length})</div>
            <div className="space-y-2">
              {completedQuests.map(q => (
                <div key={q.id} className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 opacity-60">
                  <div className="flex justify-between items-center">
                    <h3 className="text-[10px] font-black text-zinc-400 uppercase italic">{q.title}</h3>
                    <span className="text-[7px] text-emerald-500 font-black">ERLEDIGT</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Failed Quests */}
        {failedQuests.length > 0 && (
          <section>
            <div className="text-[8px] text-red-500 font-black uppercase tracking-[0.2em] mb-3">Gescheitert ({failedQuests.length})</div>
            <div className="space-y-2">
              {failedQuests.map(q => (
                <div key={q.id} className="bg-zinc-950 border border-red-500/20 rounded-xl p-3 opacity-40">
                  <h3 className="text-[10px] font-black text-zinc-500 uppercase italic">{q.title}</h3>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* NPCs */}
        <section>
          <div className="text-[8px] text-cyan-500 font-black uppercase tracking-[0.2em] mb-3">Bekannte NPCs ({npcs.length})</div>
          {npcs.length === 0 ? (
            <div className="text-[10px] text-zinc-700 italic">Noch keine bekannten NPCs...</div>
          ) : (
            <div className="space-y-2">
              {npcs.map(npc => (
                <div key={npc.id} className={`bg-zinc-900 border border-zinc-800 rounded-xl p-3 ${!npc.isAlive ? 'opacity-30' : ''}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-[10px] font-black text-white uppercase italic">{npc.name}</h3>
                      <p className="text-[8px] text-zinc-600">{npc.location}{npc.faction ? ` • ${npc.faction}` : ''}</p>
                    </div>
                    <div className="text-right">
                      <div className={`text-[8px] font-black ${npc.disposition >= 50 ? 'text-emerald-500' : npc.disposition >= 0 ? 'text-zinc-400' : npc.disposition >= -50 ? 'text-orange-400' : 'text-red-500'}`}>
                        {npc.disposition >= 50 ? 'VERBÜNDET' : npc.disposition >= 0 ? 'NEUTRAL' : npc.disposition >= -50 ? 'MISSTRAUISCH' : 'FEINDLICH'}
                      </div>
                      {!npc.isAlive && <div className="text-[7px] text-red-500 font-black">TOT</div>}
                    </div>
                  </div>
                  <DispositionBar value={npc.disposition} />
                  {npc.description && <p className="text-[8px] text-zinc-600 mt-2">{npc.description}</p>}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default QuestLog;
