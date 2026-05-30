import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                green: {
                    50: '#F0FDF4',
                    100: '#DCFCE7',
                    600: '#16A34A',
                    700: '#15803D',
                },
                slate: {
                    50: '#F8FAFC',
                    100: '#F1F5F9',
                    400: '#94A3B8',
                    500: '#64748B',
                    600: '#475569',
                    700: '#334155',
                    800: '#1E293B',
                },
            },
            spacing: {
                'safe-bottom': 'max(1rem, env(safe-area-inset-bottom))',
            },
        },
    },
    plugins: [],
};

export default config;
