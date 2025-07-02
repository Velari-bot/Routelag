# 🚀 Routelag Server Setup Summary

## 📋 Quick Reference

### Your Server Infrastructure
**Total Servers:** 10 (6 NA + 4 EU)

### 🌎 North America (NA) - 6 Servers
1. **vps-na-east-1** (Newark/NYC) - `routelag-na-east-1` - Routing/Ping/Relay
2. **vps-na-central** (Dallas) - `routelag-na-central` - Routing/Ping/Relay  
3. **vps-na-mid** (Chicago) - `routelag-na-mid` - Backup Relay/Ping
4. **vps-na-relay1** (Ashburn) - `routelag-na-relay1` - Relay Only
5. **vps-na-opt1** (Atlanta) - `routelag-na-opt1` - Relay/Ping Backup
6. **vps-na-west** (Los Angeles) - `routelag-na-west` - Routing/Ping/Relay

### 🇪🇺 Europe (EU) - 4 Servers
1. **vps-eu-west** (London) - `routelag-eu-west` - Routing/Ping/Relay
2. **vps-eu-central** (Frankfurt) - `routelag-eu-central` - Routing/Ping/Relay
3. **vps-eu-east** (Paris) - `routelag-eu-east` - Routing/Ping/Relay
4. **vps-eu-north** (Amsterdam) - `routelag-eu-north` - Routing/Ping Backup

## 🔧 Setup Process (Per Server)

### Step 1: Initial Setup (One-time)
```bash
# Run as root on each server
sudo bash routelag-server-init.sh
```

### Step 2: Environment Configuration
```bash
# Create environment template
sudo bash env-template.sh

# Edit for specific server
sudo nano /opt/routelag/.env
```

### Step 3: Service Configuration
```bash
# Setup systemd services
sudo bash systemd-services.sh
```

### Step 4: Start Services
```bash
# Start all services
sudo bash routelag-start.sh
```

## 📊 Service Distribution

### Full Routing Servers (6 servers)
- **Services:** API Server + Ping Monitor + Relay Service
- **Servers:** na-east-1, na-central, na-west, eu-west, eu-central, eu-east
- **Ports:** 22, 80, 443, 3000, 8080, 9000

### Relay-Only Servers (1 server)
- **Services:** Relay Service only
- **Servers:** na-relay1
- **Ports:** 22, 80, 443, 9000

### Backup Servers (3 servers)
- **Services:** Ping Monitor + Backup Relay
- **Servers:** na-mid, na-opt1, eu-north
- **Ports:** 22, 80, 443, 9000

## 🛠️ Management Commands

### Deploy Updates (All Servers)
```bash
# Linux/Mac
bash deploy.sh

# Windows
deploy-windows.bat
```

### Health Check (All Servers)
```bash
# Linux/Mac
bash health-check.sh

# Windows
health-check-windows.bat
```

### Individual Server Management
```bash
# SSH into server
ssh routelag@routelag-na-east-1

# Check status
pm2 status

# View logs
pm2 logs

# Restart services
pm2 reload all
```

## 🔒 Security Features

### Firewall Configuration
- **Default:** Deny incoming, allow outgoing
- **Allowed:** SSH (22), HTTP (80), HTTPS (443), App ports (3000, 8080, 9000)

### Security Services
- **fail2ban:** Brute force protection
- **ufw:** Firewall management
- **logrotate:** Log management

## 📈 Monitoring & Logs

### PM2 Process Management
- Auto-restart on crashes
- Memory limit: 1GB per process
- Log rotation: 7 days
- Process monitoring enabled

### Log Locations
- **Application:** `/opt/routelag/logs/`
- **System:** `/var/log/syslog`
- **Nginx:** `/var/log/nginx/`
- **Security:** `/var/log/fail2ban.log`

## 🚨 Troubleshooting Quick Reference

### Services Not Starting
```bash
pm2 status          # Check process status
pm2 logs            # View error logs
pm2 reload all      # Restart all services
```

### Permission Issues
```bash
sudo chown -R routelag:routelag /opt/routelag
sudo chmod -R 755 /opt/routelag
```

### Firewall Issues
```bash
sudo ufw status     # Check firewall status
sudo ufw allow 8080/tcp  # Allow specific port
```

### Server Unreachable
```bash
ping server-hostname     # Test connectivity
ssh routelag@server-hostname  # Test SSH access
```

## 📅 Maintenance Schedule

### Daily
- Run `health-check.sh` to monitor all servers
- Check PM2 status on each server

### Weekly
- Review log files for errors
- Check disk space usage
- Monitor memory usage

### Monthly
- Update system packages: `sudo apt update && sudo apt upgrade`
- Review security logs
- Backup configuration files

### Quarterly
- Review firewall rules
- Update security configurations
- Performance optimization review

## 🎯 Key Benefits

### Automated Management
- **PM2:** Process management with auto-restart
- **Systemd:** Boot-time service startup
- **Scripts:** Automated deployment and monitoring

### Scalable Architecture
- **Role-based:** Different services per server type
- **Geographic:** NA and EU coverage
- **Redundant:** Backup servers for reliability

### Security First
- **Firewall:** UFW with strict rules
- **Monitoring:** fail2ban for attack prevention
- **Logging:** Comprehensive audit trail

## 📞 Emergency Contacts

### Critical Issues
1. **All servers down:** Check network connectivity
2. **Service failures:** Check PM2 logs and restart
3. **Security breach:** Review fail2ban logs immediately
4. **Performance issues:** Monitor resource usage

### Recovery Procedures
1. **Server reboot:** Services auto-start via systemd
2. **Service restart:** `pm2 reload all`
3. **Configuration reset:** Restore from backup
4. **Full redeploy:** Run `deploy.sh`

---

**Last Updated:** $(date)
**Total Servers:** 10
**Coverage:** North America + Europe
**Status:** Ready for deployment 