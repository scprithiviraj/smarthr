/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                heading: ['Outfit', 'sans-serif'],
            },
            boxShadow: {
                'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
                'glow': '0 0 15px rgba(79, 70, 229, 0.3)',
            },
            colors: {
                primary: {
                    DEFAULT: '#2563EB', // Blue 600
                    light: '#60A5FA',   // Blue 400
                    dark: '#1D4ED8',    // Blue 700
                },
                secondary: {
                    DEFAULT: '#10B981', // Emerald 500
                    light: '#34D399',   // Emerald 400
                    dark: '#059669',    // Emerald 600
                },
                background: '#F8FAFC', // Slate 50
                surface: '#FFFFFF',
            },
            keyframes: {
                'fade-in-up': {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                }
            },
            animation: {
                'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
            }
        },
    },
    plugins: [],
}
