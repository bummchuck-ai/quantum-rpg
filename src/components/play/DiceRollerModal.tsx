'use client';

import React, { useState } from 'react';
import { 
  DicePool, 
  RollResult, 
  rollDicePool, 
  DiceType, 
  DiceSymbol 
} from '@/lib/engine/dice';

interface DiceRollerModalProps {
  initialPool: DicePool;
  skillName: string;
  difficulty: string;
  onRollComplete: (result: RollResult) => void;
  onClose: () => void;
}

const DICE_CONFIG: Record<DiceType, { color: string, label: string, shape: string }> = {
  boost: { color: 'bg-blue-400 text-black', label: 'Boost', shape: 'rounded-md' },
  setback: { color: 'bg-black border border-zinc-700 text-white', label: 'Setback', shape: 'rounded-md' },
  ability: { color: 'bg-green-500 text-black', label: 'Ability', shape: 'rotate-45 rounded-sm' },
  difficulty: { color: 'bg-purple-600 text-white', label: 'Difficulty', shape: 'rotate-45 rounded-sm' },
  proficiency: { color: 'bg-yellow-400 text-black', label: 'Proficiency', shape: 'clip-hexagon' },
  challenge: { color: 'bg-red-600 text-white', label: 'Challenge', shape: 'clip-hexagon' },
  force: { color: 'bg-white text-black', label: 'Force', shape: 'clip-hexagon' },
};

const SYMBOL_MAP: Record<DiceSymbol, string> = {
  success: '💥',
  failure: '▼',
  advantage: '⇡',
  threat: '⇣',
  triumph: '🌟',
  despair: '💀',
  lightSide: '⚪',
  darkSide: '⚫'
};

const DiceRollerModal: React.FC<DiceRollerModalProps> = ({ 
  initialPool, 
  skillName, 
  difficulty,
  onRollComplete, 
  onClose 
}) => {
  const [pool, setPool] = useState<DicePool>(initialPool);
  const [result, setResult] = useState<RollResult | null>(null);
  const [isRolling, setIsRolling] = useState(false);

  const modifyPool = (type: DiceType, delta: number) => {
    setPool(prev => ({
      ...prev,
      [type]: Math.max(0, (prev[type] || 0) + delta)
    }));
  };

  const handleRoll = () => {
    setIsRolling(true);
    
    // Simulate animation delay
    setTimeout(() => {
      const rollResult = rollDicePool(pool);
      setResult(rollResult);
      setIsRolling(false);
    }, 800);
  };

  const handleConfirm = () => {
    if (result) {
      onRollComplete(result);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-zinc-900 bg-zinc-900/50 flex justify-between items-start">
          <div>
            <div className="text-[9px] text-amber-500 font-black uppercase tracking-widest mb-1">TACTICAL_COMPUTE</div>
            <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">{skillName}</h2>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Difficulty: {difficulty}</p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors text-xl">✕</button>
        </div>

        {/* Dice Pool Editor */}
        {!result && (
          <div className=\"p-6 overflow-y-auto space-y-6\">
            <div className=\"grid grid-cols-2 gap-4\">
              {/* Positive Dice */}
              <div className=\"space-y-3 bg-zinc-900/30 p-4 rounded-xl border border-zinc-800/50\">
                <div className=\"text-[8px] text-zinc-500 font-black uppercase tracking-widest text-center mb-2\">Player Pool</div>
                {(['proficiency', 'ability', 'boost'] as DiceType[]).map(type => {
                  const isLocked = type !== 'boost';
                  return (
                    <div key={type} className=\"flex items-center justify-between\">
                      <div className=\"flex items-center gap-2\">
                        <div className={`w-4 h-4 ${DICE_CONFIG[type].color} ${DICE_CONFIG[type].shape}`}></div>
                        <span className={`text-[10px] font-bold uppercase ${isLocked ? 'text-zinc-600' : 'text-zinc-300'}`}>{DICE_CONFIG[type].label}</span>
                      </div>
                      <div className={`flex items-center gap-3 rounded-lg border px-2 py-1 ${isLocked ? 'bg-zinc-950 border-zinc-900 opacity-40' : 'bg-black border-zinc-800'}`}>
                        {!isLocked ? (
                          <>
                            <button onClick={() => modifyPool(type, -1)} className=\"text-zinc-500 hover:text-white\">-</button>\n                            <span className=\"text-sm font-black w-4 text-center\">{pool[type] || 0}</span>\n                            <button onClick={() => modifyPool(type, 1)} className=\"text-zinc-500 hover:text-white\">+</button>\n                          </>\n                        ) : (\n                          <span className=\"text-sm font-black w-4 text-center text-zinc-500\">{pool[type] || 0}</span>\n                        )}\n                      </div>\n                    </div>\n                  );\n                })}\n              </div>\n\n              {/* Negative Dice */}\n              <div className=\"space-y-3 bg-zinc-900/30 p-4 rounded-xl border border-zinc-800/50\">\n                <div className=\"text-[8px] text-zinc-500 font-black uppercase tracking-widest text-center mb-2\">Difficulty</div>\n                {(['challenge', 'difficulty', 'setback'] as DiceType[]).map(type => {\n                  const isLocked = type !== 'setback';\n                  return (\n                    <div key={type} className=\"flex items-center justify-between\">\n                      <div className=\"flex items-center gap-2\">\n                        <div className={`w-4 h-4 ${DICE_CONFIG[type].color} ${DICE_CONFIG[type].shape}`}></div>\n                        <span className={`text-[10px] font-bold uppercase ${isLocked ? 'text-zinc-600' : 'text-zinc-300'}`}>{DICE_CONFIG[type].label}</span>\n                      </div>\n                      <div className={`flex items-center gap-3 rounded-lg border px-2 py-1 ${isLocked ? 'bg-zinc-950 border-zinc-900 opacity-40' : 'bg-black border-zinc-800'}`}>\n                        {!isLocked ? (\n                          <>
                            <button onClick={() => modifyPool(type, -1)} className=\"text-zinc-500 hover:text-white\">-</button>\n                            <span className=\"text-sm font-black w-4 text-center\">{pool[type] || 0}</span>\n                            <button onClick={() => modifyPool(type, 1)} className=\"text-zinc-500 hover:text-white\">+</button>\n                          </>\n                        ) : (\n                          <span className=\"text-sm font-black w-4 text-center text-zinc-500\">{pool[type] || 0}</span>\n                        )}\n                      </div>\n                    </div>\n                  );\n                })}\n              </div>\n            </div>\n          </div>\n        )}

        {/* Rolling Animation / Result */}
        {result && (
          <div className="p-8 flex flex-col items-center justify-center space-y-6 animate-in zoom-in-95 duration-300">
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {result.dice.map((die, i) => (
                <div key={i} className={`w-10 h-10 ${DICE_CONFIG[die.type].color} flex items-center justify-center text-lg shadow-lg relative group`}>
                  <div className={`absolute inset-0 ${DICE_CONFIG[die.type].shape} ${DICE_CONFIG[die.type].color} opacity-20`}></div>
                  <div className="relative z-10 flex gap-0.5">
                    {die.symbols.length > 0 ? die.symbols.map((s, j) => (
                      <span key={j} className="drop-shadow-md">{SYMBOL_MAP[s]}</span>
                    )) : <span className="opacity-20 text-[8px]">•</span>}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center space-y-2">
              <div className={`text-4xl font-black italic tracking-tighter uppercase ${result.isSuccess ? 'text-emerald-500' : 'text-red-500'}`}>
                {result.isSuccess ? 'ERFOLG' : 'FEHLSCHLAG'}
              </div>
              <div className="flex gap-4 justify-center text-xs font-bold uppercase tracking-widest text-zinc-400">
                {result.netSuccess !== 0 && <span>{Math.abs(result.netSuccess)} {result.netSuccess > 0 ? 'Success' : 'Failure'}</span>}
                {result.netAdvantage !== 0 && <span>{Math.abs(result.netAdvantage)} {result.netAdvantage > 0 ? 'Advantage' : 'Threat'}</span>}
                {result.triumph > 0 && <span className="text-yellow-500">{result.triumph} Triumph!</span>}
                {result.despair > 0 && <span className="text-red-600">{result.despair} Despair!</span>}
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="p-6 border-t border-zinc-900 bg-black/50">
          {!result ? (
            <button 
              onClick={handleRoll}
              disabled={isRolling}
              className="w-full bg-white text-black font-black py-4 rounded-xl uppercase italic tracking-widest text-sm hover:bg-zinc-200 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)]"
            >
              {isRolling ? 'CALCULATING_PHYSICS...' : 'ROLL_DICE_→'}
            </button>
          ) : (
            <div className="flex gap-3">
              <button 
                onClick={() => setResult(null)}
                className="flex-1 bg-zinc-900 text-zinc-400 font-bold py-4 rounded-xl uppercase tracking-widest text-xs hover:text-white transition-all"
              >
                Reroll
              </button>
              <button 
                onClick={handleConfirm}
                className="flex-[2] bg-emerald-600 text-white font-black py-4 rounded-xl uppercase italic tracking-widest text-xs hover:bg-emerald-500 active:scale-95 transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)]"
              >
                COMMIT_RESULT_→
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default DiceRollerModal;
