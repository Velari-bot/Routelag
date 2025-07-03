const { exec } = require('child_process');
const ping = require('ping');
const fetch = require('node-fetch');

window.routelag = {
  startTunnel: (confName = 'routelag-vpn') =>
    new Promise((resolve, reject) => {
      exec(`wg-quick up ${confName}`, (err) => err ? reject(err) : resolve(true));
    }),
  stopTunnel: (confName = 'routelag-vpn') =>
    new Promise((resolve, reject) => {
      exec(`wg-quick down ${confName}`, (err) => err ? reject(err) : resolve(true));
    }),
  checkTunnel: (confName = 'routelag-vpn') =>
    new Promise((resolve) => {
      exec(`wg show ${confName}`, (err, stdout) => resolve(!err && stdout.includes('interface:')));
    }),
  pingHost: (host) => ping.promise.probe(host).then(res => res.time),
  vpsPing: (vpsIp, gameIp) =>
    fetch(`http://${vpsIp}:3000/ping/${gameIp}`).then(res => res.json()).then(data => data.avg),
  vpsUdpLog: (vpsIp) =>
    fetch(`http://${vpsIp}:3000/udp-log`).then(res => res.json()),
}; 