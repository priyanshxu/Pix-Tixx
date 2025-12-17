export const apps = [
    {
        name: "pix-tix-api",
        script: "./app.js",
        env: {
            NODE_ENV: "development",
            PORT: 5000
        }
    },
    {
        name: "email-worker",
        script: "./workers/emailWorker.js",
        env: {
            NODE_ENV: "development"
        }
    }
];