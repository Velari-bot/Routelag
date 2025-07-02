# Routelag VPS Server Deployment Guide

This guide will help you deploy and configure your 5 Routelag VPS servers for optimal routing performance.

## Prerequisites

- 5 VPS servers with Ubuntu 20.04+ or Debian 11+
- Username: **linuxuser** (as provided by your VPS dashboard)
- Password: (see your VPS dashboard for each server)
- SSH access to each server
- Your server IP addresses ready

## Step 1: Update VPS Configuration Files

Replace the placeholder IPs in the following files with your actual server IPs:

### File: `backend/vps/vps-east.json` (NYC Server)
```json
{
  "id": "vps-east",
  "ip": "YOUR_ACTUAL_NYC_IP_HERE",
  "region": "East",
  "type": "routing",
  "label": "Routelag NYC"
}
```

### File: `backend/vps/vps-central.json` (Dallas Server)
```json
{
  "id": "vps-central",
  "ip": "YOUR_ACTUAL_DALLAS_IP_HERE",
  "region": "Central",
  "type": "routing",
  "label": "Routelag Dallas"
}
```

### File: `backend/vps/vps-west.json` (LA Server)
```json
{
  "id": "vps-west",
  "ip": "YOUR_ACTUAL_LA_IP_HERE",
  "region": "West",
  "type": "routing",
  "label": "Routelag LA"
}
```

### File: `backend/vps/vps-mid.json` (Chicago Server)
```json
{
  "id": "vps-mid",
  "ip": "YOUR_ACTUAL_CHICAGO_IP_HERE",
  "region": "Midwest",
  "type": "routing",
  "label": "Routelag Chicago"
}
```

### File: `backend/vps/vps-opt1.json` (Atlanta Server)
```json
{
  "id": "vps-opt1",
  "ip": "YOUR_ACTUAL_ATLANTA_IP_HERE",
  "region": "Southeast",
  "type": "routing",
  "label": "Routelag Atlanta"
}
```

## Step 2: Deploy to Each VPS Server

For each of your 5 VPS servers, follow these steps:

### 2.1 SSH into your VPS server
```bash
ssh linuxuser@YOUR_SERVER_IP
```
- When prompted, enter the password from your VPS dashboard.

### 2.2 (Optional) Switch to root
Some commands require root privileges. You can switch to root with:
```bash
sudo -i
```
Or, prefix commands with `sudo` as shown below.

### 2.3 Download and run the setup script
```bash
# Download the setup script
wget -O vps-setup.sh https://raw.githubusercontent.com/your-repo/routelag/main/backend/scripts/vps-setup.sh

# Make it executable
chmod +x vps-setup.sh

# Run the setup script (use sudo if not root)
sudo ./vps-setup.sh
```

### 2.4 Verify the installation
```bash
# Check if services are running
sudo systemctl status routelag-routing
sudo systemctl status routelag-health

# Test health check endpoint
curl http://localhost:8080

# Check IP forwarding is enabled
cat /proc/sys/net/ipv4/ip_forward
```

## Step 3: Configure Firewall Rules

The setup script configures firewall rules, but you can verify:
```bash
sudo iptables -L -n -v
sudo iptables -t nat -L -n -v

# If you need to add additional rules:
sudo iptables -A INPUT -p tcp --dport 8080 -j ACCEPT  # Health check port
sudo iptables -A INPUT -p icmp -j ACCEPT              # Allow ping
sudo netfilter-persistent save
```

## Step 4: Test Connectivity

### 4.1 Test from your local machine
```bash
ping 144.202.25.231  # Atlanta
ping 144.202.53.250  # Chicago
ping 45.32.195.106   # Dallas
ping 45.63.62.238    # LA
ping 66.135.9.254    # NYC

curl http://144.202.25.231:8080  # Atlanta
curl http://144.202.53.250:8080  # Chicago
curl http://45.32.195.106:8080   # Dallas
curl http://45.63.62.238:8080    # LA
curl http://66.135.9.254:8080    # NYC
```

### 4.2 Test from the Routelag app
1. Start the Routelag app
2. Go to a game selection
3. Click "Select Server"
4. Verify all 5 servers appear with ping times

## Step 5: Monitor and Maintain

### 5.1 Check server status
```bash
sudo systemctl status routelag-routing
sudo systemctl status routelag-health
sudo journalctl -u routelag-routing -f
```

### 5.2 Monitor system resources
```bash
htop
iftop
```

### 5.3 Update servers
```bash
sudo apt update && sudo apt upgrade -y
```

## Troubleshooting

- **Permission denied (publickey,password):** Make sure you are using the correct username (`linuxuser`) and password from your VPS dashboard.
- **Need root access:** Use `sudo -i` to switch to root, or prefix commands with `sudo`.
- **Server not responding to ping:** Check if the server is online, verify firewall rules allow ICMP, check network configuration.
- **Health check failing:**
  1. `sudo systemctl status routelag-health`
  2. `sudo netstat -tlnp | grep 8080`
  3. `sudo systemctl restart routelag-health`
- **Routing not working:**
  1. `cat /proc/sys/net/ipv4/ip_forward`
  2. `sudo iptables -L -n -v`
  3. `sudo journalctl -u routelag-routing -f`
- **App can't connect to servers:**
  1. Verify IP addresses in VPS config files
  2. Check if servers are reachable from your network
  3. Ensure firewall rules allow the necessary traffic

## Security Considerations

- Change default SSH port (optional but recommended)
- Use SSH keys instead of passwords
- Regular security updates
- Monitor logs for suspicious activity
- Backup configuration files

## Performance Optimization

- Enable TCP optimizations on each VPS
- Monitor bandwidth usage
- Set up monitoring and alerting
- Regular performance testing

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review server logs: `sudo journalctl -u routelag-routing -f`
3. Verify network connectivity between servers
4. Test with a simple ping/traceroute to isolate issues 