'use client';

import React, { useEffect, useState } from 'react';

interface StarWarsCrawlProps {
  onComplete: () => void;
}

const StarWarsCrawl: React.FC<StarWarsCrawlProps> = ({ onComplete }) => {
  const [skip, setSkip] = useState(false);

  useEffect(() => {
    const timer = setTimeout(onComplete, 25000); // Intro dauert ca. 25-30s
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div 
      className="fixed inset-0 bg-black z-[200] overflow-hidden cursor-pointer flex items-center justify-center font-sans"
      onClick={() => { setSkip(true); onComplete(); }}
    >
      {/* Stars Background */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1506318137071-a8bcbf6755dd?q=80&w=2070&auto=format&fit=crop')] bg-cover opacity-50"></div>

      <div className="relative w-full h-full perspective-3d">
        <div className="crawl-container">
          <div className="crawl-content text-amber-400 font-bold text-justify tracking-widest leading-loose">
            <h1 className="text-center text-5xl mb-12 uppercase">Episode I<br/>Das Erwachen</h1>
            <p className="mb-8">
              Es herrscht Unruhe in der Galaxis. Das Imperium festigt seinen Griff um die Systeme des Outer Rim, während mutige Rebellen im Schatten agieren.
            </p>
            <p className="mb-8">
              Inmitten dieses Chaos erwacht eine neue Macht. Das QUANTUM UNIVERSUM öffnet seine Pforten für jene, die den Mut haben, ihr eigenes Schicksal zu schmieden.
            </p>
            <p className="mb-8">
              Du bist einer dieser Wenigen. Deine Herkunft ist ungewiss, deine Zukunft ungeschrieben. Doch die Entscheidungen, die du heute triffst, werden das Schicksal von Tausenden besiegeln...
            </p>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-10 right-10 text-zinc-600 text-[10px] uppercase tracking-widest animate-pulse">
        [ Klicke zum Überspringen ]
      </div>

      <style jsx>{`
        .perspective-3d {
          perspective: 300px;
        }
        .crawl-container {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          justify-content: center;
          transform-origin: 50% 100%;
          animation: crawl 30s linear forwards;
        }
        .crawl-content {
          width: 80%;
          max-width: 600px;
          transform: rotateX(25deg);
        }
        @keyframes crawl {
          0% {
            top: 100%;
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            top: -150%;
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default StarWarsCrawl;
