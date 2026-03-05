'use client';

import React from 'react';

interface ProgressTrackerProps {
  currentStep: number;
}

const STEPS = [
  { id: 1, label: 'Origin', icon: '🧬' },
  { id: 2, label: 'Path', icon: '🛤️' },
  { id: 3, label: 'Destiny', icon: '🎲' },
  { id: 4, label: 'Attributes', icon: '💪' },
  { id: 5, label: 'Training', icon: '⚡' },
  { id: 6, label: 'Loadout', icon: '⚔️' },
  { id: 7, label: 'Final', icon: '✅' },
];

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ currentStep }) => {
  return (
    <div className="w-full flex justify-between items-center gap-1 mb-8">
      {STEPS.map((step, index) => {
        const isActive = step.id === currentStep;
        const isCompleted = step.id < currentStep;
        
        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center flex-1">
              <div 
                className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center text-[10px] transition-all duration-500 ${
                  isActive 
                    ? 'border-amber-500 bg-amber-500/20 text-white shadow-[0_0_15px_rgba(245,158,11,0.4)] scale-110' 
                    : isCompleted 
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500' 
                      : 'border-zinc-800 bg-zinc-900/40 text-zinc-700'
                }`}
              >
                {isCompleted ? '✓' : step.id}
              </div>
              <span className={`text-[6px] font-black uppercase tracking-tighter mt-1.5 ${
                isActive ? 'text-amber-500' : isCompleted ? 'text-emerald-800' : 'text-zinc-800'
              }`}>
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div className={`h-[1px] flex-1 mb-4 ${
                isCompleted ? 'bg-emerald-900' : 'bg-zinc-900'
              }`}></div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default ProgressTracker;
