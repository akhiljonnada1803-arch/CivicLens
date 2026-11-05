/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        civic: {
          dark: '#0f172a',
          card: '#1e293b',
          border: '#334155',
          accent: '#3b82f6',
          urgent: '#ef4444',
          sanitation: '#f59e0b',
          resolved: '#10b981'
        }
      }
    },
  },
  plugins: [],
}

