/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                becalab: {
                    purple: '#312C8E',
                    blue: '#4B50D0',
                    lime: '#D5ED86',
                    white: '#FFFFFF',
                },
            },
            animation: {
                'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
                'fadeIn': 'fadeIn 0.4s ease-in',
            },
            keyframes: {
                pulseGlow: {
                    '0%, 100%': { opacity: '0.2', transform: 'scale(1)' },
                    '50%': { opacity: '0.4', transform: 'scale(1.05)' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
            }
        },
    },
    plugins: [],
}
