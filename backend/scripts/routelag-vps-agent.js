const express = require('express');
const { exec } = require('child_process');
const dgram = require('dgram');
const app = express();
const udpLog = [];

// Ping API: GET /ping/:host
app.get('/ping/:host', (req, res) => {
  exec(`ping -c 3 ${req.params.host}`, (err, stdout) => {
    if (err) return res.status(500).send('error');
    const match = stdout.match(/= ([\d.]+)\//);
    res.json({ avg: match ? parseFloat(match[1]) : null });
  });
});

// UDP log API: GET /udp-log
app.get('/udp-log', (req, res) => {
  res.json(udpLog.slice(-20)); // last 20 packets
});

// UDP listener for logging
const udpServer = dgram.createSocket('udp4');
udpServer.on('message', (msg, rinfo) => {
  udpLog.push({ from: rinfo.address, port: rinfo.port, time: Date.now() });
});
udpServer.bind(9999); // Listen on game port or 9999 for test

app.listen(3000, () => console.log('RouteLag VPS agent running on 3000')); 