/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
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
                background: '#F9FAFB', // Gray 50 (lighter than before)
                surface: '#FFFFFF',
            }
        },
    },
    plugins: [],
}
