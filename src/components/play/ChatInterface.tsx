'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useCharacterStore } from '@/store/characterStore';
import { useRouter } from 'next/navigation';

interface Message {
  role: 'gm' | 'player';
  content: any;
}

const ChatInterface: React.FC = () => {
  const router = useRouter();
  const { 
    name, species, career, characteristics, credits, ownedGear, 
    specializations, backgroundOption, backgroundType, backgroundValue 
  } = useCharacterStore();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!species || !career) {
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
            character: { 
              name, species, career, characteristics, credits, ownedGear,
              specializations, backgroundOption, backgroundType, backgroundValue 
            },
            currentPlanet: 'Tatooine (Orbit)',
            currentScene: 'Der Anfang',
            sessionHistory: [],
            destinyPool: { lightSide: 3, darkSide: 1 },
            questLog: [],
            npcRelationships: []
          },
          userMessage: "Beginne das Abenteuer! Beschreibe die erste Szene basierend auf meinem Charakter."
        })
      });
      
      const data = await response.json();
      setMessages([{ role: 'gm', content: data }]);
    } catch (error) {
      console.error("Intro failed:", error);
    }
    setIsTyping(false);
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
            character: { 
              name, species, career, characteristics, credits, ownedGear,
              specializations, backgroundOption, backgroundType, backgroundValue 
            },
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
      setMessages(prev => [...prev, { role: 'gm', content: data }]);
    } catch (error) {
        console.error("Chat failed:", error);
    }
    setIsTyping(false);
  };

  return (
    <main className="h-screen w-screen bg-black text-zinc-300 font-mono flex flex-col overflow-hidden">
      
      {/* HUD Header */}
      <header className="bg-zinc-950/80 border-b border-zinc-800 p-4 flex justify-between items-center backdrop-blur-md z-20 shadow-2xl">
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 border border-amber-500/50 rounded bg-amber-500/5 flex items-center justify-center">
                <span className="text-amber-500 font-black italic text-xl">{name?.charAt(0) || 'Q'}</span>
            </div>
            <div>
                <h1 className="text-sm font-black text-white italic tracking-tighter">{name || 'PILOT_UNKNOWN'}</h1>
                <div className="text-[7px] text-zinc-500 tracking-[0.2em] uppercase">{career?.name} // {species?.name}</div>
            </div>
        </div>
        <div className="flex gap-6">
            <div className="text-right">
                <div className="text-[7px] text-red-500/50 font-black uppercase tracking-widest mb-1">Health</div>
                <div className="text-xs font-black text-red-500 italic">STABLE</div>
            </div>
            <div className="text-right">
                <div className="text-[7px] text-blue-500/50 font-black uppercase tracking-widest mb-1">Stress</div>
                <div className="text-xs font-black text-blue-400 italic">NOMINAL</div>
            </div>
        </div>
      </header>

      {/* CHAT INTERFACE */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar pb-32">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'player' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
            <div className={`max-w-[90%] ${msg.role === 'player' ? 'bg-zinc-900 border border-zinc-800 p-4 rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl shadow-xl' : 'space-y-4'}`}>
              {msg.role === 'gm' ? (
                <div className="space-y-6">
                  {/* Narrative Text */}
                  <p className="text-[13px] leading-relaxed text-zinc-300 font-sans italic selection:bg-amber-500/30">
                    {msg.content.narrative}
                  </p>
                  
                  {/* NPC Dialogues */}
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

                  {/* GM Suggestions (Buttons) */}
                  <div className="grid grid-cols-1 gap-2 pt-4">
                    {msg.content.options?.map((opt: any) => (
                        <button 
                            key={opt.id}
                            onClick={() => handleSendMessage(opt.text)}
                            className="bg-zinc-900/50 border border-zinc-800 hover:border-amber-500/50 p-4 rounded-xl text-left transition-all group active:scale-95 shadow-md"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] text-amber-500 font-black opacity-40 group-hover:opacity-100 border border-amber-500/20 w-6 h-6 flex items-center justify-center rounded uppercase italic">{opt.id}</span>
                                <span className="text-[10px] text-zinc-400 group-hover:text-white uppercase font-black tracking-tight">{opt.text}</span>
                            </div>
                        </button>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-white font-black italic uppercase tracking-tight leading-relaxed">{msg.content.narrative}</p>
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

      {/* INPUT AREA */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black to-transparent z-30">
        <div className="max-w-2xl mx-auto flex gap-3">
            <div className="flex-1 relative">
                <input 
                    className="w-full bg-zinc-950 border border-zinc-800 p-5 rounded-2xl text-xs outline-none focus:border-amber-500 text-white placeholder:text-zinc-800 shadow-2xl font-mono"
                    placeholder="EINGABE_KOMMANDO..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[7px] text-zinc-800 font-black tracking-widest hidden md:block">DIRECT_FEED</div>
            </div>
            <button 
                onClick={() => handleSendMessage(inputValue)}
                className="bg-amber-600 hover:bg-amber-500 text-black px-8 rounded-2xl transition-all shadow-[0_0_30px_rgba(245,158,11,0.2)] active:scale-90 font-black"
            >
                📡
            </button>
        </div>
      </div>

    </main>
  );
};

export default ChatInterface;
