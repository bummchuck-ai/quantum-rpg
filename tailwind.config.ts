import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: '#050505',
        amber: {
          DEFAULT: '#FFB800',
          dim: 'rgba(255, 184, 0, 0.2)',
          glow: 'rgba(255, 184, 0, 0.5)',
        },
        blue: {
          data: '#00AAFF',
        },
        red: {
          alert: '#FF3333',
        },
      },
      fontFamily: {
        sans: ['Rajdhani', 'sans-serif'],
        mono: ['"Share Tech Mono"', 'monospace'],
      },
      animation: {
        'spin-slow': 'spin 8s linear infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
export default config;
