/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            colors: {
                dark: {
                    bg: '#151921',
                    sidebar: '#15171e',
                    card: '#1E222B',
                    border: '#2a2f3d',
                },
                brand: {
                    purple: '#6366f1',
                    green: '#10B981',
                    red: '#EF4444',
                    blue: '#3b82f6',
                },
                // Keep legacy aliases
                primary: '#6366f1',
                success: '#10B981',
                danger: '#EF4444',
                warning: '#f1c40f',
                // Light mode pastel surface tokens
                surface: {
                    body: '#eef1f8',
                    card: '#f5f7fe',
                    border: '#d0d8ee',
                },
            },
            // Override ONLY the background utilities (not text-white, border-white etc.)
            // These pastel values apply in light mode. The dark: variant overrides them in dark mode.
            backgroundColor: {
                'white': '#ffffff', // pure white for cards — max contrast against pastel body
                'slate-50': '#eef1fa', // subtle pastel for zebra lighter rows
                'slate-100': '#dce1f2', // medium pastel
                'slate-200': '#c8cfea', // matches body bg
            },
        },
    },
    plugins: [],
}
