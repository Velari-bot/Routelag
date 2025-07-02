#!/bin/bash

# Routelag VPS Server Setup Script
# This script configures a VPS server for routing functionality

set -e

echo "🚀 Setting up Routelag VPS Server..."

# Update system packages
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install required packages
echo "🔧 Installing required packages..."
sudo apt install -y iptables-persistent netfilter-persistent iproute2 traceroute

# Configure firewall rules for routing
echo "🔥 Configuring firewall rules..."
sudo iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
sudo iptables -A FORWARD -i eth0 -o eth0 -j ACCEPT
sudo iptables -A FORWARD -i tun0 -o eth0 -j ACCEPT
sudo iptables -A FORWARD -i eth0 -o tun0 -j ACCEPT

# Save firewall rules
sudo netfilter-persistent save

# Enable IP forwarding
echo "🌐 Enabling IP forwarding..."
echo 'net.ipv4.ip_forward=1' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Create routing service
echo "⚙️ Creating routing service..."
sudo tee /etc/systemd/system/routelag-routing.service > /dev/null <<EOF
[Unit]
Description=Routelag Routing Service
After=network.target

[Service]
Type=simple
User=root
ExecStart=/usr/local/bin/routelag-routing
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Create routing binary placeholder
echo "📝 Creating routing binary placeholder..."
sudo tee /usr/local/bin/routelag-routing > /dev/null <<EOF
#!/bin/bash
echo "Routelag routing service started"
echo "Server: \$(hostname)"
echo "IP: \$(hostname -I | awk '{print \$1}')"
echo "Timestamp: \$(date)"

# Keep the service running
while true; do
    sleep 60
    echo "Routing service heartbeat: \$(date)"
done
EOF

sudo chmod +x /usr/local/bin/routelag-routing

# Enable and start the service
echo "🚀 Enabling and starting routing service..."
sudo systemctl daemon-reload
sudo systemctl enable routelag-routing
sudo systemctl start routelag-routing

# Create health check endpoint
echo "🏥 Setting up health check endpoint..."
sudo tee /usr/local/bin/routelag-health > /dev/null <<EOF
#!/bin/bash
echo "HTTP/1.1 200 OK"
echo "Content-Type: application/json"
echo ""
echo '{"status":"healthy","server":"'$(hostname)'","timestamp":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}'
EOF

sudo chmod +x /usr/local/bin/routelag-health

# Set up simple HTTP server for health checks
sudo tee /etc/systemd/system/routelag-health.service > /dev/null <<EOF
[Unit]
Description=Routelag Health Check Service
After=network.target

[Service]
Type=simple
User=root
ExecStart=/usr/bin/socat TCP-LISTEN:8080,fork EXEC:/usr/local/bin/routelag-health
Restart=always

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable routelag-health
sudo systemctl start routelag-health

echo "✅ Routelag VPS server setup complete!"
echo "📊 Server Information:"
echo "   Hostname: $(hostname)"
echo "   IP Address: $(hostname -I | awk '{print $1}')"
echo "   Routing Service: $(systemctl is-active routelag-routing)"
echo "   Health Service: $(systemctl is-active routelag-health)"
echo ""
echo "🔍 To check status:"
echo "   sudo systemctl status routelag-routing"
echo "   sudo systemctl status routelag-health"
echo "   curl http://localhost:8080" 