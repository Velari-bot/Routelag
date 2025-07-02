#!/bin/bash
# routelag-start.sh
# This script starts all Routelag services

set -e

# Load environment variables
if [ -f /opt/routelag/.env ]; then
    source /opt/routelag/.env
fi

# Set server-specific variables
SERVER_HOSTNAME=$(hostname)
SERVER_REGION=""
SERVER_TYPE=""

# Determine server configuration based on hostname
case $SERVER_HOSTNAME in
    "routelag-na-east-1")
        SERVER_REGION="NA-East"
        SERVER_TYPE="routing"
        ;;
    "routelag-na-central")
        SERVER_REGION="NA-Central"
        SERVER_TYPE="routing"
        ;;
    "routelag-na-mid")
        SERVER_REGION="NA-Midwest"
        SERVER_TYPE="backup"
        ;;
    "routelag-na-relay1")
        SERVER_REGION="Relay"
        SERVER_TYPE="relay"
        ;;
    "routelag-na-opt1")
        SERVER_REGION="Optional"
        SERVER_TYPE="backup"
        ;;
    "routelag-na-west")
        SERVER_REGION="NA-West"
        SERVER_TYPE="routing"
        ;;
    "routelag-eu-west")
        SERVER_REGION="EU-West"
        SERVER_TYPE="routing"
        ;;
    "routelag-eu-central")
        SERVER_REGION="EU-Central"
        SERVER_TYPE="routing"
        ;;
    "routelag-eu-east")
        SERVER_REGION="EU-East"
        SERVER_TYPE="routing"
        ;;
    "routelag-eu-north")
        SERVER_REGION="EU-North"
        SERVER_TYPE="backup"
        ;;
    *)
        echo "❌ Unknown hostname: $SERVER_HOSTNAME"
        exit 1
        ;;
esac

echo "🚀 Starting Routelag services on $SERVER_HOSTNAME ($SERVER_REGION - $SERVER_TYPE)"

# Change to application directory
cd /opt/routelag

# Create logs directory if it doesn't exist
mkdir -p logs

# Start services based on server type
if [ "$SERVER_TYPE" = "routing" ]; then
    echo "🔄 Starting routing services..."
    
    # Start API server
    pm2 start ecosystem.config.js --name "routelag-api"
    
    # Start ping monitoring service
    pm2 start ping-monitor.js --name "routelag-ping"
    
    # Start relay service
    pm2 start relay-service.js --name "routelag-relay"
    
elif [ "$SERVER_TYPE" = "relay" ]; then
    echo "🔄 Starting relay-only services..."
    
    # Start relay service only
    pm2 start relay-service.js --name "routelag-relay"
    
elif [ "$SERVER_TYPE" = "backup" ]; then
    echo "🔄 Starting backup services..."
    
    # Start ping monitoring service
    pm2 start ping-monitor.js --name "routelag-ping"
    
    # Start backup relay service
    pm2 start relay-service.js --name "routelag-relay-backup"
fi

# Start Nginx
echo "🌐 Starting Nginx..."
systemctl start nginx
systemctl enable nginx

# Save PM2 configuration
pm2 save
pm2 startup

echo "✅ All services started successfully!" 