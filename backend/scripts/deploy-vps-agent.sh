#!/bin/bash
set -e
VPS_IP=$1
USER=${2:-root}

scp backend/scripts/routelag-vps-agent.js $USER@$VPS_IP:~/routelag-vps-agent.js
ssh $USER@$VPS_IP "sudo apt update && sudo apt install -y nodejs npm && \
  mkdir -p ~/routelag-agent && mv ~/routelag-vps-agent.js ~/routelag-agent/ && \
  cd ~/routelag-agent && npm init -y && npm install express && \
  nohup node routelag-vps-agent.js > agent.log 2>&1 &"
echo "Agent deployed and running on $VPS_IP:3000" 