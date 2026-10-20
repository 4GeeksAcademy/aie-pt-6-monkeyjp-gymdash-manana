import { defineConfig, devices } from "@playwright/test";
import chromium from "@sparticuz/chromium";

export default defineConfig({
    testDir: "./tests",
    fullyParallel: true,
    workers: 1,
    reporter: "list",
    use: {
        baseURL: "http://127.0.0.1:4173",
        trace: "retain-on-failure",
    },
    projects: [
        {
            name: "chromium",
            use: {
                ...devices["Desktop Chrome"],
                launchOptions: {
                    args: chromium.args.filter((argument) => argument !== "--single-process"),
                    executablePath: await chromium.executablePath(),
                    headless: true,
                },
            },
        },
    ],
    webServer: {
        command: "python3 -m http.server 4173 --bind 127.0.0.1",
        url: "http://127.0.0.1:4173",
        reuseExistingServer: !process.env.CI,
        timeout: 10000,
    },
});
