module.exports = {
  apps: [
    {
      name: "cospace",
      script: ".next/standalone/server.js",
      cwd: "/home/ubuntu/cospace",

      instances: 1,
      exec_mode: "fork",

      autorestart: true,
      watch: false,

      env: {
        NODE_ENV: "production",
        PORT: 3000,
        HOSTNAME: "127.0.0.1",
      },
    },
  ],
};
