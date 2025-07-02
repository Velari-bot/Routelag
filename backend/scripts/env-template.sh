#!/bin/bash
# env-template.sh
# Template for creating .env files for each server

# Copy this template and customize for each server
cat > /opt/routelag/.env << 'EOF'
# Server Configuration
NODE_ENV=production
PORT=8080
SERVER_HOSTNAME=routelag-na-east-1
SERVER_REGION=NA-East
SERVER_TYPE=routing

# Database configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=routelag
DB_USER=routelag
DB_PASSWORD=secure_password

# Redis configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=secure_redis_password

# Monitoring configuration
MONITORING_ENABLED=true
PING_INTERVAL=5000
LOG_LEVEL=info

# Firebase configuration (if needed)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email

# Security
JWT_SECRET=your-jwt-secret
ENCRYPTION_KEY=your-encryption-key
EOF

echo "✅ Environment template created at /opt/routelag/.env"
echo "📝 Please customize the values for your specific server" 