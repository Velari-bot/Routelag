// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'routelag-api',
    script: 'server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 8080,
      SERVER_HOSTNAME: process.env.SERVER_HOSTNAME,
      SERVER_REGION: process.env.SERVER_REGION,
      SERVER_TYPE: process.env.SERVER_TYPE
    },
    error_file: './logs/api-error.log',
    out_file: './logs/api-out.log',
    log_file: './logs/api-combined.log',
    time: true
  }]
}; 