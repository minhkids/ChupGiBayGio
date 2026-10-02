/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          light: '#FBF9F5',
          warm: '#F4EFE6',
          dark: '#141413',
          card: '#FFFFFF',
          border: '#E5DFD3',
          subtle: '#ECE6DB',
        },
        terracotta: {
          DEFAULT: '#C85A32',
          dark: '#A54320',
          light: '#DE7350',
          10: '#FAF0EC',
        },
        amberFilm: {
          DEFAULT: '#E09F3E',
          dark: '#BD8027',
          light: '#F1B761',
          10: '#FCF5E9',
        },
        slateInk: {
          DEFAULT: '#1C1D1F',
          soft: '#2D3033',
          muted: '#666B73',
          light: '#9499A1',
        },
        olive: {
          DEFAULT: '#4A5844',
          dark: '#354030',
          light: '#65775E',
          10: '#EFF2EE',
        }
      },
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
        // Legacy stacks kept as fallbacks so old class names still resolve.
        display: ['Fraunces', 'Georgia', 'serif'],
      },
      boxShadow: {
        'hard': '2px 2px 0px #141413',
        'hard-md': '3px 3px 0px #141413',
        'hard-lg': '5px 5px 0px #141413',
        'hard-amber': '2px 2px 0px #E09F3E',
        'hard-terracotta': '2px 2px 0px #C85A32',
      }
    },
  },
  plugins: [],
}
