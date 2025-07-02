# Routelag Server Startup Scripts

This document contains startup scripts for all Routelag servers across North America and Europe.

## 🌎 North America (NA) Servers

### vps-na-east-1 (Newark/NYC) - Routing / Ping / Relay
**Hostname:** routelag-na-east-1
**Provider:** Vultr
**Role:** Primary routing, ping monitoring, relay

### vps-na-central (Dallas) - Routing / Ping / Relay  
**Hostname:** routelag-na-central
**Provider:** Vultr
**Role:** Primary routing, ping monitoring, relay

### vps-na-mid (Chicago) - Backup Relay / Ping
**Hostname:** routelag-na-mid
**Provider:** Vultr
**Role:** Backup relay, ping monitoring

### vps-na-relay1 (Ashburn) - Relay Only
**Hostname:** routelag-na-relay1
**Provider:** GT Host
**Role:** Dedicated relay server

### vps-na-opt1 (Atlanta) - Relay / Ping Backup
**Hostname:** routelag-na-opt1
**Provider:** Vultr
**Role:** Backup relay, ping monitoring

### vps-na-west (Los Angeles) - Routing / Ping / Relay
**Hostname:** routelag-na-west
**Provider:** Vultr
**Role:** Primary routing, ping monitoring, relay

## 🇪🇺 Europe (EU) Servers

### vps-eu-west (London) - Routing / Ping / Relay
**Hostname:** routelag-eu-west
**Provider:** Vultr
**Role:** Primary routing, ping monitoring, relay

### vps-eu-central (Frankfurt) - Routing / Ping / Relay
**Hostname:** routelag-eu-central
**Provider:** Vultr
**Role:** Primary routing, ping monitoring, relay

### vps-eu-east (Paris) - Routing / Ping / Relay
**Hostname:** routelag-eu-east
**Provider:** Vultr
**Role:** Primary routing, ping monitoring, relay

### vps-eu-north (Amsterdam) - Routing / Ping Backup
**Hostname:** routelag-eu-north
**Provider:** Vultr
**Role:** Backup routing, ping monitoring

## 📋 Startup Scripts

### 1. System Initialization Script (run once per server)

```bash
#!/bin/bash
# routelag-server-init.sh
# Run this script once when setting up a new server

set -e

echo "🚀 Initializing Routelag Server..."

# Update system
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Install essential packages
echo "🔧 Installing essential packages..."
apt install -y curl wget git htop iotop nethogs nginx certbot python3-certbot-nginx ufw fail2ban

# Install Node.js 18.x
echo "📦 Installing Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install PM2 for process management
echo "📦 Installing PM2..."
npm install -g pm2

# Create routelag user
echo "👤 Creating routelag user..."
useradd -m -s /bin/bash routelag
usermod -aG sudo routelag

# Create application directory
echo "📁 Creating application directory..."
mkdir -p /opt/routelag
chown routelag:routelag /opt/routelag

# Setup firewall
echo "🔥 Configuring firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3000/tcp  # React app
ufw allow 8080/tcp  # API server
ufw allow 9000/tcp  # WebSocket
ufw --force enable

# Setup fail2ban
echo "🛡️ Configuring fail2ban..."
systemctl enable fail2ban
systemctl start fail2ban

# Setup log rotation
echo "📝 Setting up log rotation..."
cat > /etc/logrotate.d/routelag << EOF
/opt/routelag/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644 routelag routelag
}
EOF

echo "✅ Server initialization complete!"
```

### 2. Application Startup Script (run on boot)

```bash
#!/bin/bash
# routelag-start.sh
# This script starts all Routelag services

set -e

# Load environment variables
source /opt/routelag/.env

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
```

### 3. Service-Specific Scripts

#### API Server (routing servers)
```bash
#!/bin/bash
# start-api.sh

cd /opt/routelag

# Start the main API server
pm2 start ecosystem.config.js --name "routelag-api"

# Monitor the process
pm2 logs routelag-api --lines 100
```

#### Ping Monitor (all servers)
```bash
#!/bin/bash
# start-ping-monitor.sh

cd /opt/routelag

# Start ping monitoring service
pm2 start ping-monitor.js --name "routelag-ping"

# Monitor the process
pm2 logs routelag-ping --lines 100
```

#### Relay Service (routing and relay servers)
```bash
#!/bin/bash
# start-relay.sh

cd /opt/routelag

# Start relay service
pm2 start relay-service.js --name "routelag-relay"

# Monitor the process
pm2 logs routelag-relay --lines 100
```

### 4. PM2 Ecosystem Configuration

```javascript
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
```

### 5. Environment Configuration

```bash
# .env file for each server
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
```

### 6. Systemd Service Files

#### Routelag API Service
```ini
# /etc/systemd/system/routelag-api.service
[Unit]
Description=Routelag API Server
After=network.target

[Service]
Type=forking
User=routelag
WorkingDirectory=/opt/routelag
ExecStart=/usr/bin/pm2 start ecosystem.config.js --name routelag-api
ExecStop=/usr/bin/pm2 stop routelag-api
ExecReload=/usr/bin/pm2 reload routelag-api
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

#### Routelag Ping Monitor
```ini
# /etc/systemd/system/routelag-ping.service
[Unit]
Description=Routelag Ping Monitor
After=network.target

[Service]
Type=forking
User=routelag
WorkingDirectory=/opt/routelag
ExecStart=/usr/bin/pm2 start ping-monitor.js --name routelag-ping
ExecStop=/usr/bin/pm2 stop routelag-ping
ExecReload=/usr/bin/pm2 reload routelag-ping
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### 7. Deployment Script

```bash
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
```

### 8. Monitoring and Health Check Script

```bash
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
```

## 🔧 Usage Instructions

1. **Initial Setup**: Run `routelag-server-init.sh` once on each new server
2. **Daily Startup**: The `routelag-start.sh` script should be configured to run on boot
3. **Deployment**: Use `deploy.sh` to update all servers simultaneously
4. **Monitoring**: Use `health-check.sh` to monitor server health

## 📝 Notes

- All scripts assume Ubuntu/Debian systems
- SSH keys should be configured for passwordless access
- Firewall rules are configured for security
- PM2 is used for process management and auto-restart
- Logs are rotated automatically
- Each server type has different service configurations based on its role 