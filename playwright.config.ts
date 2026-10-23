import { defineConfig } from '@playwright/test';
export default defineConfig({
    testDir: './tests',
    workers: 1,
    fullyParallel: false,
    use: {
        baseURL: 'http://127.0.0.1:5174',
        timezoneId: 'America/Sao_Paulo',
        launchOptions: {
            executablePath: process.env.CHROMIUM_PATH ?? '/usr/bin/chromium',
        },
    },
    webServer: [
        {
            command:
                'npm --prefix ../FiveBits-backend run build && node ../FiveBits-backend/scripts/e2e-server.mjs',
            url: 'http://127.0.0.1:3334/api',
            reuseExistingServer: false,
            timeout: 60000,
        },
        {
            command:
                'VITE_SERVER_URL=http://127.0.0.1:3334 npm run dev -- --host 127.0.0.1 --port 5174 --strictPort',
            url: 'http://127.0.0.1:5174',
            reuseExistingServer: false,
        },
    ],
});
