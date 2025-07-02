#!/bin/bash
# routelag-server-init.sh
# Run this script once when setting up a new server

set -e

echo "Initializing Routelag Server..."

# Update system
echo "Updating system packages..."
apt update && apt upgrade -y

# Install essential packages
echo "Installing essential packages..."
apt install -y curl wget git htop iotop nethogs nginx certbot python3-certbot-nginx ufw fail2ban

# Install Node.js 18.x
echo "Installing Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install PM2 for process management
echo "Installing PM2..."
npm install -g pm2

# Create routelag user
echo "Creating routelag user..."
useradd -m -s /bin/bash routelag
usermod -aG sudo routelag

# Create application directory
echo "Creating application directory..."
mkdir -p /opt/routelag
chown routelag:routelag /opt/routelag

# Setup firewall
echo "Configuring firewall..."
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
echo "Configuring fail2ban..."
systemctl enable fail2ban
systemctl start fail2ban

# Setup log rotation
echo "Setting up log rotation..."
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

echo "Server initialization complete!" 