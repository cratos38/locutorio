module.exports = {
  apps: [
    {
      name: 'locutorio',
      script: 'npm',
      args: 'run dev',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
        HOSTNAME: '0.0.0.0'
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork',
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
}
