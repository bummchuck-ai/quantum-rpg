import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'QUANTUM // GALACTIC_INTERFACE',
  description: 'Star Wars RPG Engine',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" className="bg-black">
      <head>
        {/* PWA Manifest & Apple Meta Tags */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-title" content="Q-RPG" />

        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700&family=Share+Tech+Mono&display=swap" rel="stylesheet" />

        {/* Dynamic html lang attribute + Service Worker registration */}
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            var s = JSON.parse(localStorage.getItem('quantum-rpg-settings') || '{}');
            if (s.language === 'en') document.documentElement.lang = 'en';
          } catch(e) {}
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').catch(function() {});
          }
        `}} />

        <style>{`
          /* GLOBAL RESET & SCANLINES */
          body {
            background-color: #000;
            color: #fff;
            overflow-x: hidden;
          }
          
          /* CRT Scanline Effect (GPU-accelerated) */
          .scanline {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: repeating-linear-gradient(
              0deg,
              rgba(0,0,0,0.15) 0px,
              rgba(0,0,0,0.15) 1px,
              transparent 1px,
              transparent 2px
            );
            pointer-events: none;
            z-index: 9999;
            opacity: 0.3;
            will-change: opacity;
            transform: translateZ(0);
          }

          /* Scrollbar Hide */
          ::-webkit-scrollbar {
            width: 0px;
            background: transparent;
          }
        `}</style>
      </head>
      <body className="bg-black text-white antialiased font-sans min-h-screen">
        <div className="scanline"></div>
        {children}
      </body>
    </html>
  );
}
