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
        },
    },
    plugins: [],
}
