# RouteLag Agent Deployment Guide

This guide explains how to deploy and run the RouteLag agent (`routelag-vps-agent.js`) on your VPS servers. It covers both typical (`linuxuser`) and `root` user scenarios.

---

## 1. Prerequisites
- You have SSH access to your VPS (Ubuntu recommended)
- Node.js and npm are installed (the deployment script will attempt to install them)
- You have the agent file: `backend/scripts/routelag-vps-agent.js`

ssh linuxuser@144.202.53.250

---

## 2. Deploy the Agent (from your **local computer**)

**Open Git Bash in your project folder on your local computer:**

```
cd /path/to/your/project
# Example:
cd "/c/Users/bende/OneDrive/Desktop/Lunary x Routelag/Routelag"
```

**Run the deployment script (in Git Bash, in your project folder, on your local computer):**

For most servers (user is `linuxuser`):
```bash
bash backend/scripts/deploy-vps-agent.sh <VPS_IP> linuxuser
```

For the server where the user is `root`:
```bash
bash backend/scripts/deploy-vps-agent.sh <VPS_IP> root
```

---

## 3. Manual Setup (if needed)
If the script fails or you want to do it manually, follow these steps:

### **A. Copy the agent file to your VPS (run on your local computer):**
```bash
scp backend/scripts/routelag-vps-agent.js <user>@<VPS_IP>:~/
```

### **B. SSH into your VPS (run on your local computer):**
```bash
ssh <user>@<VPS_IP>
```

### **C. Move and set up the agent (run on your VPS, after SSHing in):**
```bash
mkdir -p ~/routelag-agent
mv ~/routelag-vps-agent.js ~/routelag-agent/
cd ~/routelag-agent
npm install express
```

### **D. Start the agent (run on your VPS):**
```bash
node routelag-vps-agent.js &
```

---

## 4. Verify the Agent is Running (run on your VPS)

On your VPS:
```bash
ps aux | grep node
```
You should see a line with `node routelag-vps-agent.js`.

---

## 5. Test the Agent from Your Local Computer

On your local computer (in any terminal):
```bash
curl http://<VPS_IP>:3000/ping/8.8.8.8
```
You should get a JSON response like:
```json
{"avg": 20.123}
```

---

## 6. Troubleshooting
- If you see `MODULE_NOT_FOUND`, make sure the file is in the correct directory (`~/routelag-agent/`).
- If you get `Cannot find module 'express'`, run `npm install express` in the agent directory (on your VPS).
- If you get a connection error with curl, check your VPS firewall (port 3000 must be open).
- If you are using `root`, your home directory is `/root/`. For `linuxuser`, it is `/home/linuxuser/`.

---

## 7. Repeat for All Servers
Repeat these steps for each VPS you want to use with RouteLag.

---

## 8. Example Commands

**For a server with user `linuxuser` (run in Git Bash, in your project folder, on your local computer):**
```bash
bash backend/scripts/deploy-vps-agent.sh 144.202.25.231 linuxuser
```

**For a server with user `root` (run in Git Bash, in your project folder, on your local computer):**
```bash
bash backend/scripts/deploy-vps-agent.sh 45.32.195.106 root
```

**Manual copy (if needed, run on your local computer):**
```bash
scp backend/scripts/routelag-vps-agent.js linuxuser@144.202.25.231:~/
```

---

**If you have any issues, copy and paste the error here for help!** 