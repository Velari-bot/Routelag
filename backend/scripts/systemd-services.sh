#!/bin/bash
# systemd-services.sh
# Setup systemd services for automatic startup

set -e

echo "🔧 Setting up systemd services for Routelag..."

# Create Routelag API Service
cat > /etc/systemd/system/routelag-api.service << 'EOF'
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
EOF

# Create Routelag Ping Monitor Service
cat > /etc/systemd/system/routelag-ping.service << 'EOF'
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
EOF

# Create Routelag Relay Service
cat > /etc/systemd/system/routelag-relay.service << 'EOF'
[Unit]
Description=Routelag Relay Service
After=network.target

[Service]
Type=forking
User=routelag
WorkingDirectory=/opt/routelag
ExecStart=/usr/bin/pm2 start relay-service.js --name routelag-relay
ExecStop=/usr/bin/pm2 stop routelag-relay
ExecReload=/usr/bin/pm2 reload routelag-relay
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd
systemctl daemon-reload

# Enable services based on server type
SERVER_HOSTNAME=$(hostname)

case $SERVER_HOSTNAME in
    "routelag-na-east-1"|"routelag-na-central"|"routelag-na-west"|"routelag-eu-west"|"routelag-eu-central"|"routelag-eu-east")
        echo "🔄 Enabling routing services for $SERVER_HOSTNAME..."
        systemctl enable routelag-api.service
        systemctl enable routelag-ping.service
        systemctl enable routelag-relay.service
        ;;
    "routelag-na-relay1")
        echo "🔄 Enabling relay-only services for $SERVER_HOSTNAME..."
        systemctl enable routelag-relay.service
        ;;
    "routelag-na-mid"|"routelag-na-opt1"|"routelag-eu-north")
        echo "🔄 Enabling backup services for $SERVER_HOSTNAME..."
        systemctl enable routelag-ping.service
        systemctl enable routelag-relay.service
        ;;
    *)
        echo "❌ Unknown hostname: $SERVER_HOSTNAME"
        exit 1
        ;;
esac

echo "✅ Systemd services configured and enabled!" 