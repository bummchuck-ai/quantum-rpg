import type { Metadata, Viewport } from 'next';

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
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />

        {/* Tailwind CDN - The Lifesaver for Local Dev */}
        <script src="https://cdn.tailwindcss.com"></script>
        
        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;500;600;700&family=Share+Tech+Mono&display=swap" rel="stylesheet" />

        <script dangerouslySetInnerHTML={{
          __html: `
            tailwind.config = {
              theme: {
                extend: {
                  colors: {
                    'obsidian': '#050505',
                    'amber': {
                      DEFAULT: '#FFB800',
                      dim: 'rgba(255, 184, 0, 0.2)',
                      glow: 'rgba(255, 184, 0, 0.5)',
                    },
                    'blue': {
                      data: '#00AAFF',
                    },
                    'red': {
                      alert: '#FF3333',
                    }
                  },
                  fontFamily: {
                    sans: ['Rajdhani', 'sans-serif'],
                    mono: ['"Share Tech Mono"', 'monospace'],
                  },
                }
              }
            }
          `
        }} />

        {/* Dynamic html lang attribute based on user setting */}
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            var s = JSON.parse(localStorage.getItem('quantum-rpg-settings') || '{}');
            if (s.language === 'en') document.documentElement.lang = 'en';
          } catch(e) {}
        `}} />

        <style>{`
          /* GLOBAL RESET & SCANLINES */
          body {
            background-color: #000;
            color: #fff;
            overflow-x: hidden;
          }
          
          /* CRT Scanline Effect */
          .scanline {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: linear-gradient(
              to bottom,
              rgba(255,255,255,0),
              rgba(255,255,255,0) 50%,
              rgba(0,0,0,0.2) 50%,
              rgba(0,0,0,0.2)
            );
            background-size: 100% 4px;
            pointer-events: none;
            z-index: 9999;
            opacity: 0.3;
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
