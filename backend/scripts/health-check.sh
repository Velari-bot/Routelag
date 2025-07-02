#!/bin/bash
# health-check.sh
# Monitor all server health and services

set -e

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

echo "🏥 Routelag Server Health Check"
echo "================================"

for server in "${SERVERS[@]}"; do
    echo "Checking $server..."
    
    # Check if server is reachable
    if ping -c 1 $server > /dev/null 2>&1; then
        echo "✅ $server is reachable"
        
        # Check PM2 processes
        ssh routelag@$server "pm2 status" 2>/dev/null || echo "❌ PM2 not running on $server"
        
        # Check disk space
        ssh routelag@$server "df -h /" 2>/dev/null || echo "❌ Cannot check disk space on $server"
        
        # Check memory usage
        ssh routelag@$server "free -h" 2>/dev/null || echo "❌ Cannot check memory on $server"
        
    else
        echo "❌ $server is unreachable"
    fi
    
    echo "---"
done 