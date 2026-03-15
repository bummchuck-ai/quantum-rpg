'use client';

import React from 'react';
import type { CombatState, Combatant } from '@/lib/engine/combat';

interface CombatTrackerProps {
  combat: CombatState;
  onEndCombat: () => void;
  onNextRound: () => void;
}

const CombatTracker: React.FC<CombatTrackerProps> = ({ combat, onEndCombat, onNextRound }) => {
  if (!combat.active) return null;

  const HealthBar = ({ current, max, color }: { current: number; max: number; color: string }) => {
    const pct = Math.max(0, Math.min(100, ((max - current) / max) * 100));
    return (
      <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
        <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    );
  };

  const CombatantRow = ({ c }: { c: Combatant }) => {
    const isDown = c.wounds >= c.woundThreshold;
    return (
      <div className={`p-3 border rounded-lg ${c.type === 'pc' ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-red-500/30 bg-red-500/5'} ${isDown ? 'opacity-30' : ''} ${c.hasActed ? 'opacity-60' : ''}`}>
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black ${c.type === 'pc' ? 'bg-emerald-500 text-black' : 'bg-red-500 text-white'}`}>
              {c.type === 'pc' ? 'PC' : 'NPC'}
            </div>
            <span className="text-[10px] font-black text-white uppercase tracking-tight">{c.name}</span>
          </div>
          <div className="flex gap-3 text-[8px] font-black">
            <span className="text-zinc-500">SOAK {c.soak}</span>
            {c.defenseMelee > 0 && <span className="text-blue-400">DEF {c.defenseMelee}</span>}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="flex justify-between text-[7px] text-red-400 font-black mb-0.5">
              <span>WOUNDS</span><span>{c.wounds}/{c.woundThreshold}</span>
            </div>
            <HealthBar current={c.wounds} max={c.woundThreshold} color="bg-red-500" />
          </div>
          <div>
            <div className="flex justify-between text-[7px] text-blue-400 font-black mb-0.5">
              <span>STRAIN</span><span>{c.strain}/{c.strainThreshold}</span>
            </div>
            <HealthBar current={c.strain} max={c.strainThreshold} color="bg-blue-500" />
          </div>
        </div>
        {c.criticalInjuries.length > 0 && (
          <div className="mt-2 space-y-1">
            {c.criticalInjuries.map(ci => (
              <div key={ci.id} className="text-[7px] text-orange-400 bg-orange-500/10 px-2 py-1 rounded">
                {ci.name}: {ci.effect}
              </div>
            ))}
          </div>
        )}
        {c.statusEffects.length > 0 && (
          <div className="mt-1 flex gap-1 flex-wrap">
            {c.statusEffects.map((se, i) => (
              <span key={i} className="text-[7px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded">
                {se.name} {se.duration > 0 ? `(${se.duration}R)` : ''}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-zinc-950 border border-amber-500/30 rounded-xl overflow-hidden">
      <div className="p-3 bg-amber-500/10 border-b border-amber-500/20 flex justify-between items-center">
        <div>
          <div className="text-[8px] text-amber-500 font-black uppercase tracking-widest">Combat_Active</div>
          <div className="text-lg font-black text-white italic">Runde {combat.round}</div>
        </div>
        <div className="flex gap-2">
          <button onClick={onNextRound} className="bg-amber-600 text-black text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wider hover:bg-amber-500">
            Nächste Runde
          </button>
          <button onClick={onEndCombat} className="border border-zinc-700 text-zinc-400 text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wider hover:text-white">
            Beenden
          </button>
        </div>
      </div>
      <div className="p-3 space-y-2 max-h-[50vh] overflow-y-auto">
        {combat.combatants.map(c => (
          <CombatantRow key={c.id} c={c} />
        ))}
      </div>
      {combat.log.length > 0 && (
        <div className="p-3 border-t border-zinc-800 max-h-24 overflow-y-auto">
          <div className="text-[7px] text-zinc-600 font-black uppercase tracking-widest mb-1">Combat_Log</div>
          {combat.log.slice(-5).map((entry, i) => (
            <div key={i} className="text-[8px] text-zinc-500">
              <span className="text-zinc-700">R{entry.round}</span> {entry.actor}: {entry.action}
              {entry.result && <span className="text-amber-500"> → {entry.result}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default React.memo(CombatTracker);
