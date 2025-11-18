module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c3d66',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        // Semantic colors untuk light/dark mode consistency
        background: {
          light: '#f9fafb',     // gray-50 untuk light mode
          DEFAULT: '#f9fafb',
          dark: '#111827',       // gray-900 untuk dark mode
        },
        surface: {
          light: '#ffffff',      // white untuk cards di light mode
          DEFAULT: '#ffffff',
          dark: '#1f2937',       // gray-800 untuk cards di dark mode
        },
        surfaceHover: {
          light: '#f3f4f6',      // gray-100 untuk hover di light mode
          DEFAULT: '#f3f4f6',
          dark: '#374151',       // gray-700 untuk hover di dark mode
        },
        textPrimary: {
          light: '#111827',      // gray-900 untuk text utama di light mode
          DEFAULT: '#111827',
          dark: '#ffffff',       // white untuk text utama di dark mode
        },
        textSecondary: {
          light: '#6b7280',      // gray-500 untuk text secondary di light mode
          DEFAULT: '#6b7280',
          dark: '#9ca3af',       // gray-400 untuk text secondary di dark mode
        },
        border: {
          light: '#e5e7eb',      // gray-200 untuk border di light mode
          DEFAULT: '#e5e7eb',
          dark: '#374151',       // gray-700 untuk border di dark mode
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: '0.5rem',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      },
    },
  },
  plugins: [
    require('tailwindcss/plugin')(function ({ addBase, theme }) {
      addBase({
        html: {
          scrollBehavior: 'smooth',
        },
      })
    }),
  ],
}
