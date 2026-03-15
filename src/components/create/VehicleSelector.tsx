'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCharacterStore, PlayerVehicle } from '@/store/characterStore';
import vehicleData from '@/../data/json/vehicles.json';
import HolocronGuide from './HolocronGuide';
import ProgressTracker from './ProgressTracker';
import CharacterPreview from './CharacterPreview';
import { playConfirm, playNavigate } from '@/lib/sounds';

type VehicleCategory = 'freighter' | 'starfighter' | 'shuttle' | 'base' | 'other';

const CATEGORY_LABELS: Record<string, string> = {
  freighter: 'Frachter',
  starfighter: 'Jäger',
  shuttle: 'Fähren',
  base: 'Basen',
  other: 'Sonstige',
};

const getCategoryKey = (cat: string): VehicleCategory => {
  if (cat === 'freighter') return 'freighter';
  if (cat === 'starfighter') return 'starfighter';
  if (cat === 'shuttle') return 'shuttle';
  if (cat === 'base') return 'base';
  return 'other';
};

const VehicleSelector: React.FC = () => {
  const router = useRouter();
  const { players, activePlayerIndex, selectVehicle, removeVehicle } = useCharacterStore();
  const activePlayer = players[activePlayerIndex];

  const [category, setCategory] = useState<VehicleCategory>('freighter');
  const [selectedId, setSelectedId] = useState<string | null>(activePlayer.vehicles[0]?.id || null);
  const [detailId, setDetailId] = useState<string | null>(null);

  // Filter vehicles that are suitable as group starting assets (freighters, shuttles, bases)
  const startingAssetVehicles = vehicleData.filter((v: any) =>
    ['freighter', 'shuttle', 'base'].includes(v.category)
  );

  const categories = Array.from(new Set(startingAssetVehicles.map((v: any) => getCategoryKey(v.category))));
  const filteredVehicles = startingAssetVehicles.filter((v: any) => getCategoryKey(v.category) === category);

  const detailVehicle = vehicleData.find((v: any) => v.id === detailId);
  const selectedVehicle = vehicleData.find((v: any) => v.id === selectedId);

  const handleSelect = (vehicle: any) => {
    // Remove previous selection
    if (activePlayer.vehicles.length > 0) {
      activePlayer.vehicles.forEach(v => removeVehicle(v.id));
    }

    const pv: PlayerVehicle = {
      id: vehicle.id,
      name: vehicle.name,
      category: vehicle.category,
      manufacturer: vehicle.manufacturer,
      silhouette: vehicle.silhouette,
      speed: vehicle.speed,
      handling: vehicle.handling,
      armor: vehicle.armor,
      hullTraumaThreshold: vehicle.hullTraumaThreshold,
      systemStrainThreshold: vehicle.systemStrainThreshold,
      currentHullTrauma: 0,
      currentSystemStrain: 0,
      defenseForward: vehicle.defenseForward,
      defenseAft: vehicle.defenseAft,
      sensorRange: vehicle.sensorRange,
      crew: vehicle.crew,
      passengers: vehicle.passengers,
      encumbrance: vehicle.encumbrance,
      consumables: vehicle.consumables,
      cost: vehicle.cost,
      hardpoints: vehicle.hardpoints,
      weapons: vehicle.weapons || [],
      specialFeatures: vehicle.specialFeatures || [],
      hyperdrive: vehicle.hyperdrive,
      backupHyperdrive: vehicle.backupHyperdrive,
      navsComputer: vehicle.navsComputer,
    };
    selectVehicle(pv);
    playConfirm();
    setSelectedId(vehicle.id);
  };

  const handleConfirm = () => {
    playNavigate();
    router.push('/create/summary');
  };

  return (
    <main className="min-h-dvh w-full bg-black text-zinc-300 font-mono flex flex-col p-6 safe-area-top safe-area-fixed">
      <header className="flex justify-between items-center border-b border-zinc-800 pb-4 mb-6 sticky top-0 bg-black z-30">
        <div className="flex gap-3 items-center">
          <button onClick={() => router.push('/create/armory')} className="w-8 h-8 border border-zinc-700 flex items-center justify-center text-zinc-500 font-black text-xs hover:border-amber-500 hover:text-amber-500 transition-all rounded">←</button>
          <div className="w-8 h-8 border border-amber-500 flex items-center justify-center text-amber-500 font-black italic">8</div>
          <div>
            <h1 className="text-xl font-black text-white italic tracking-tighter uppercase leading-none">HANGAR_BAY</h1>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-amber-500 font-bold tracking-widest uppercase">Gruppen-Asset</div>
          <div className="text-[7px] text-zinc-600 font-black uppercase tracking-widest">Step 8</div>
        </div>
      </header>

      <ProgressTracker currentStep={8} />
      <CharacterPreview />

      <div className="border border-zinc-800 bg-zinc-900/10 p-4 rounded-xl mb-4">
        <p className="text-[10px] leading-relaxed text-zinc-500 uppercase tracking-wider">
          Wähle das Startschiff oder die Basis deiner Gruppe. Dieses Asset teilt sich die gesamte Party. Es bestimmt eure Mobilität und Möglichkeiten im Spiel.
        </p>
      </div>

      {/* Detail Modal */}
      {detailVehicle && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col animate-in fade-in duration-200">
          <header className="p-6 border-b border-zinc-800 flex justify-between items-center">
            <h2 className="text-lg font-black text-white italic tracking-tighter uppercase">{detailVehicle.name}</h2>
            <button onClick={() => setDetailId(null)} className="w-10 h-10 border border-zinc-800 flex items-center justify-center text-xl rounded-lg">✕</button>
          </header>
          <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-32">
            <div className="text-[9px] text-zinc-500 uppercase tracking-widest">{detailVehicle.manufacturer} — {detailVehicle.model}</div>

            {detailVehicle.silhouette > 0 && (
              <>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-zinc-900/50 border border-zinc-800 p-3 rounded-xl text-center">
                    <div className="text-[7px] text-zinc-600 font-black uppercase mb-1">Silhouette</div>
                    <div className="text-xl font-black text-white">{detailVehicle.silhouette}</div>
                  </div>
                  <div className="bg-zinc-900/50 border border-zinc-800 p-3 rounded-xl text-center">
                    <div className="text-[7px] text-zinc-600 font-black uppercase mb-1">Speed</div>
                    <div className="text-xl font-black text-white">{detailVehicle.speed}</div>
                  </div>
                  <div className="bg-zinc-900/50 border border-zinc-800 p-3 rounded-xl text-center">
                    <div className="text-[7px] text-zinc-600 font-black uppercase mb-1">Handling</div>
                    <div className={`text-xl font-black ${detailVehicle.handling >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{detailVehicle.handling >= 0 ? '+' : ''}{detailVehicle.handling}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-red-500/[0.03] border border-red-900/30 p-3 rounded-xl text-center">
                    <div className="text-[7px] text-red-500 font-black uppercase mb-1">Hülle</div>
                    <div className="text-lg font-black text-red-400">{detailVehicle.hullTraumaThreshold}</div>
                  </div>
                  <div className="bg-blue-500/[0.03] border border-blue-900/30 p-3 rounded-xl text-center">
                    <div className="text-[7px] text-blue-500 font-black uppercase mb-1">System</div>
                    <div className="text-lg font-black text-blue-400">{detailVehicle.systemStrainThreshold}</div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <div className="bg-zinc-900/50 border border-zinc-800 p-2 rounded-lg text-center">
                    <div className="text-[6px] text-zinc-600 font-black uppercase">Panzerung</div>
                    <div className="text-sm font-black text-white">{detailVehicle.armor}</div>
                  </div>
                  <div className="bg-zinc-900/50 border border-zinc-800 p-2 rounded-lg text-center">
                    <div className="text-[6px] text-zinc-600 font-black uppercase">Crew</div>
                    <div className="text-sm font-black text-white">{detailVehicle.crew}</div>
                  </div>
                  <div className="bg-zinc-900/50 border border-zinc-800 p-2 rounded-lg text-center">
                    <div className="text-[6px] text-zinc-600 font-black uppercase">Passagiere</div>
                    <div className="text-sm font-black text-white">{detailVehicle.passengers}</div>
                  </div>
                  <div className="bg-zinc-900/50 border border-zinc-800 p-2 rounded-lg text-center">
                    <div className="text-[6px] text-zinc-600 font-black uppercase">Hardpoints</div>
                    <div className="text-sm font-black text-white">{detailVehicle.hardpoints}</div>
                  </div>
                </div>

                {detailVehicle.hyperdrive && (
                  <div className="flex gap-3">
                    <div className="flex-1 bg-zinc-900/50 border border-zinc-800 p-3 rounded-xl">
                      <div className="text-[7px] text-zinc-600 font-black uppercase mb-1">Hyperantrieb</div>
                      <div className="text-sm font-black text-white">Klasse {detailVehicle.hyperdrive}</div>
                    </div>
                    {detailVehicle.backupHyperdrive && (
                      <div className="flex-1 bg-zinc-900/50 border border-zinc-800 p-3 rounded-xl">
                        <div className="text-[7px] text-zinc-600 font-black uppercase mb-1">Backup</div>
                        <div className="text-sm font-black text-white">Klasse {detailVehicle.backupHyperdrive}</div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {detailVehicle.weapons.length > 0 && (
              <div>
                <div className="text-[8px] text-zinc-600 font-black uppercase tracking-widest mb-3">Bewaffnung</div>
                <div className="space-y-2">
                  {detailVehicle.weapons.map((w: any, i: number) => (
                    <div key={i} className="border border-zinc-800 bg-zinc-950/50 p-3 rounded-lg">
                      <div className="text-[10px] font-black text-amber-500 uppercase italic">{w.name}</div>
                      <div className="flex gap-3 mt-1">
                        <span className="text-[8px] text-zinc-500">DMG {w.damage}</span>
                        <span className="text-[8px] text-zinc-500">CRIT {w.critical}</span>
                        <span className="text-[8px] text-zinc-500">{w.range.toUpperCase()}</span>
                        <span className="text-[8px] text-zinc-600">{w.firingArc}</span>
                      </div>
                      {w.special.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {w.special.map((s: string, j: number) => (
                            <span key={j} className="text-[7px] bg-zinc-900 border border-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded">{s}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {detailVehicle.specialFeatures.length > 0 && (
              <div>
                <div className="text-[8px] text-zinc-600 font-black uppercase tracking-widest mb-3">Besonderheiten</div>
                <div className="flex flex-wrap gap-2">
                  {detailVehicle.specialFeatures.map((f: string, i: number) => (
                    <span key={i} className="text-[9px] bg-zinc-900 border border-zinc-800 text-zinc-400 px-2 py-1 rounded-lg font-bold">{f}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="p-6 bg-gradient-to-t from-black via-black to-transparent">
            <button
              onClick={() => { handleSelect(detailVehicle); setDetailId(null); }}
              className={`w-full font-black py-4 rounded-xl uppercase italic tracking-widest text-xs transition-all active:scale-95 ${
                selectedId === detailVehicle.id
                  ? 'bg-emerald-600 text-white border-b-4 border-emerald-800'
                  : 'bg-amber-600 text-black border-b-4 border-amber-800'
              }`}
            >
              {selectedId === detailVehicle.id ? 'Bereits_Ausgewählt_✓' : 'Auswählen_→'}
            </button>
          </div>
        </div>
      )}

      {/* Category tabs */}
      <div className="flex gap-1 mb-4 border border-zinc-900 bg-zinc-950 p-1 rounded-xl">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`flex-1 py-2.5 text-[8px] font-black uppercase tracking-widest transition-all rounded-lg ${
              category === cat ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-700'
            }`}
          >
            {CATEGORY_LABELS[cat] || cat}
          </button>
        ))}
      </div>

      {/* Vehicle list */}
      <div className="flex-1 space-y-3 pb-32">
        {filteredVehicles.map((vehicle: any) => {
          const isSelected = selectedId === vehicle.id;
          const isBase = vehicle.category === 'base';

          return (
            <div
              key={vehicle.id}
              onClick={() => setDetailId(vehicle.id)}
              className={`border rounded-2xl p-4 cursor-pointer transition-all ${
                isSelected
                  ? 'border-amber-500 bg-amber-500/[0.05] shadow-[0_0_20px_rgba(245,158,11,0.1)]'
                  : 'border-zinc-800 bg-zinc-900/20 hover:border-zinc-700'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="text-[11px] font-black text-white uppercase italic tracking-tighter">{vehicle.name}</div>
                  <div className="text-[8px] text-zinc-600 uppercase tracking-widest">{vehicle.manufacturer}</div>
                </div>
                {isSelected && (
                  <div className="text-[8px] text-amber-500 font-black uppercase px-2 py-1 border border-amber-500/30 rounded">
                    Gewählt
                  </div>
                )}
              </div>

              {!isBase ? (
                <div className="grid grid-cols-5 gap-2 mt-3">
                  <div className="text-center">
                    <div className="text-[6px] text-zinc-700 font-black uppercase">SIL</div>
                    <div className="text-xs font-black text-zinc-400">{vehicle.silhouette}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[6px] text-zinc-700 font-black uppercase">SPD</div>
                    <div className="text-xs font-black text-zinc-400">{vehicle.speed}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[6px] text-zinc-700 font-black uppercase">ARM</div>
                    <div className="text-xs font-black text-zinc-400">{vehicle.armor}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[6px] text-zinc-700 font-black uppercase">HULL</div>
                    <div className="text-xs font-black text-zinc-400">{vehicle.hullTraumaThreshold}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[6px] text-zinc-700 font-black uppercase">HP</div>
                    <div className="text-xs font-black text-zinc-400">{vehicle.hardpoints}</div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-1 mt-2">
                  {vehicle.specialFeatures.map((f: string, i: number) => (
                    <span key={i} className="text-[8px] bg-zinc-900 border border-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded">{f}</span>
                  ))}
                </div>
              )}

              {!isBase && vehicle.weapons.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {vehicle.weapons.map((w: any, i: number) => (
                    <span key={i} className="text-[7px] bg-red-900/20 border border-red-900/30 text-red-400 px-1.5 py-0.5 rounded">{w.name}</span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <HolocronGuide
        sectionKey="vehicle"
        title="GRUPPEN-ASSET"
        description="Jede Abenteurergruppe startet mit einem gemeinsamen Schiff oder einer Basis. Dies ist ein Gruppenentscheid — alle teilen dieses Asset."
        advice="Frachter bieten Mobilität und Laderaum. Kampfschiffe bieten Feuerkraft. Basen bieten Sicherheit, aber keine Mobilität. Wähle weise für euren Spielstil!"
      />

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/90 to-transparent z-40">
        <button
          onClick={handleConfirm}
          disabled={!selectedId}
          className={`w-full font-black py-5 rounded-xl uppercase italic tracking-widest text-xs transition-all active:scale-95 border-b-4 ${
            selectedId
              ? 'bg-white text-black shadow-[0_20px_40px_rgba(0,0,0,0.8)] border-zinc-400'
              : 'bg-zinc-900 text-zinc-600 cursor-not-allowed border-zinc-800'
          }`}
        >
          {selectedId ? 'Confirm_Vessel_→' : 'Wähle_ein_Schiff...'}
        </button>
      </div>
    </main>
  );
};

export default VehicleSelector;
