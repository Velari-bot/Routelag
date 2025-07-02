# Routelag Server Startup Scripts

This directory contains all the startup scripts needed to deploy and manage your Routelag server infrastructure.

## 📁 Script Overview

### Core Scripts
- **`routelag-server-init.sh`** - One-time server initialization
- **`routelag-start.sh`** - Main startup script (runs on boot)
- **`deploy.sh`** - Deploy updates to all servers
- **`health-check.sh`** - Monitor server health
- **`systemd-services.sh`** - Setup systemd services
- **`env-template.sh`** - Create environment configuration

### Configuration Files
- **`ecosystem.config.js`** - PM2 process manager configuration
- **`startup-scripts.md`** - Complete documentation

## 🚀 Quick Start Guide

### 1. Initial Server Setup

For each new server, run these commands in order:

```bash
# 1. Run the initialization script (as root)
sudo bash routelag-server-init.sh

# 2. Create environment configuration
sudo bash env-template.sh

# 3. Edit the environment file for your specific server
sudo nano /opt/routelag/.env

# 4. Setup systemd services
sudo bash systemd-services.sh

# 5. Start the services
sudo bash routelag-start.sh
```

### 2. Server Configuration

Each server needs a customized `.env` file. Use the template and modify:

```bash
# Server Configuration
NODE_ENV=production
PORT=8080
SERVER_HOSTNAME=routelag-na-east-1  # Change for each server
SERVER_REGION=NA-East               # Change for each server
SERVER_TYPE=routing                 # Change for each server
```

### 3. Server Types and Services

#### Routing Servers (Full Services)
- **Servers:** na-east-1, na-central, na-west, eu-west, eu-central, eu-east
- **Services:** API Server, Ping Monitor, Relay Service
- **Ports:** 80, 443, 3000, 8080, 9000

#### Relay-Only Servers
- **Servers:** na-relay1
- **Services:** Relay Service only
- **Ports:** 80, 443, 9000

#### Backup Servers
- **Servers:** na-mid, na-opt1, eu-north
- **Services:** Ping Monitor, Backup Relay
- **Ports:** 80, 443, 9000

## 🔧 Management Commands

### Deploy Updates
```bash
# Deploy to all servers
bash deploy.sh
```

### Check Server Health
```bash
# Monitor all servers
bash health-check.sh
```

### Individual Server Management
```bash
# SSH into a server
ssh routelag@routelag-na-east-1

# Check PM2 status
pm2 status

# View logs
pm2 logs

# Restart services
pm2 reload all

# Stop all services
pm2 stop all
```

## 📋 Server Inventory

### North America (NA)
| Label | Hostname | Role | Services |
|-------|----------|------|----------|
| vps-na-east-1 | routelag-na-east-1 | Routing/Ping/Relay | API, Ping, Relay |
| vps-na-central | routelag-na-central | Routing/Ping/Relay | API, Ping, Relay |
| vps-na-mid | routelag-na-mid | Backup Relay/Ping | Ping, Backup Relay |
| vps-na-relay1 | routelag-na-relay1 | Relay Only | Relay |
| vps-na-opt1 | routelag-na-opt1 | Relay/Ping Backup | Ping, Backup Relay |
| vps-na-west | routelag-na-west | Routing/Ping/Relay | API, Ping, Relay |

### Europe (EU)
| Label | Hostname | Role | Services |
|-------|----------|------|----------|
| vps-eu-west | routelag-eu-west | Routing/Ping/Relay | API, Ping, Relay |
| vps-eu-central | routelag-eu-central | Routing/Ping/Relay | API, Ping, Relay |
| vps-eu-east | routelag-eu-east | Routing/Ping/Relay | API, Ping, Relay |
| vps-eu-north | routelag-eu-north | Routing/Ping Backup | Ping, Backup Relay |

## 🔒 Security Configuration

### Firewall Rules
- SSH (22)
- HTTP (80)
- HTTPS (443)
- React App (3000)
- API Server (8080)
- WebSocket (9000)

### Security Services
- **fail2ban** - Brute force protection
- **ufw** - Firewall management
- **logrotate** - Log management

## 📊 Monitoring

### PM2 Process Management
- Auto-restart on crashes
- Memory limit: 1GB per process
- Log rotation enabled
- Process monitoring

### Health Checks
- Server reachability
- PM2 process status
- Disk space monitoring
- Memory usage tracking

## 🚨 Troubleshooting

### Common Issues

1. **Services not starting**
   ```bash
   # Check PM2 status
   pm2 status
   
   # Check logs
   pm2 logs
   
   # Restart services
   pm2 reload all
   ```

2. **Permission issues**
   ```bash
   # Fix ownership
   sudo chown -R routelag:routelag /opt/routelag
   
   # Fix permissions
   sudo chmod -R 755 /opt/routelag
   ```

3. **Firewall blocking**
   ```bash
   # Check firewall status
   sudo ufw status
   
   # Allow specific ports
   sudo ufw allow 8080/tcp
   ```

### Log Locations
- **PM2 logs:** `/opt/routelag/logs/`
- **System logs:** `/var/log/syslog`
- **Nginx logs:** `/var/log/nginx/`
- **Fail2ban logs:** `/var/log/fail2ban.log`

## 📞 Support

For issues with server deployment or management:

1. Check the logs first: `pm2 logs`
2. Verify server connectivity: `ping server-hostname`
3. Check service status: `systemctl status service-name`
4. Review firewall rules: `ufw status`

## 🔄 Maintenance

### Regular Tasks
- **Daily:** Check `health-check.sh` output
- **Weekly:** Review logs and disk usage
- **Monthly:** Update system packages
- **Quarterly:** Review security configurations

### Backup Strategy
- Configuration files in `/opt/routelag/`
- Environment files in `/opt/routelag/.env`
- PM2 configuration: `pm2 save`
- System configuration in `/etc/systemd/system/` 