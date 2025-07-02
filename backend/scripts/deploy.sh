#!/bin/bash
# deploy.sh
# Deploy application updates to all servers

set -e

# List of all servers
SERVERS=(
    "routelag-na-east-1"
    "routelag-na-central"
    "routelag-na-mid"
    "routelag-na-relay1"
    "routelag-na-opt1"
    "routelag-na-west"
    "routelag-eu-west"
    "routelag-eu-central"
    "routelag-eu-east"
    "routelag-eu-north"
)

echo "🚀 Deploying Routelag to all servers..."

for server in "${SERVERS[@]}"; do
    echo "📦 Deploying to $server..."
    
    # Copy application files
    rsync -avz --exclude 'node_modules' --exclude '.git' \
        ./backend/ routelag@$server:/opt/routelag/
    
    # SSH into server and restart services
    ssh routelag@$server << 'EOF'
        cd /opt/routelag
        npm install --production
        pm2 reload all
        echo "✅ $server deployment complete"
EOF
done

echo "🎉 All deployments complete!" 