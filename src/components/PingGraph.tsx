import React, { useEffect, useRef, useState, CSSProperties } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

declare global {
  interface Window {
    routelag: {
      startTunnel: (confName?: string) => Promise<any>;
      stopTunnel: (confName?: string) => Promise<any>;
      checkTunnel: (confName?: string) => Promise<boolean>;
      pingHost: (host: string) => Promise<number>;
      vpsPing: (vpsIp: string, gameIp: string) => Promise<number>;
      vpsUdpLog: (vpsIp: string) => Promise<any[]>;
    };
  }
}

interface PingGraphProps {
  onBack: () => void;
  selectedServer: string;
  onEndOptimization: () => void;
  routedIp: string;
  routedPing: number | null;
}

const dragStyle: CSSProperties = {
  WebkitAppRegion: 'drag'
} as any;

const noDragStyle: CSSProperties = {
  WebkitAppRegion: 'no-drag'
} as any;

const ToggleSwitch: React.FC<{ enabled: boolean; onToggle: (enabled: boolean) => void }> = ({ enabled, onToggle }) => {
  return (
    <div
      onClick={() => onToggle(!enabled)}
      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 ease-in-out cursor-pointer ${
        enabled ? 'bg-[#a084fa]' : 'bg-white/10'
      }`}
    >
      <span
        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ease-in-out ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </div>
  );
};

const maskIp = (ip: string) => {
  if (!ip) return '';
  const parts = ip.split('.');
  if (parts.length !== 4) return ip;
  return `${parts[0]}.${parts[1]}.***.***`;
};

const PingGraph: React.FC<PingGraphProps> = ({ onBack, selectedServer, onEndOptimization, routedIp, routedPing }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const [realIp, setRealIp] = useState('');
  const [isRoutelagOn, setIsRoutelagOn] = useState(true);
  const [directPing, setDirectPing] = useState<number|null>(null);
  const [vpsPing, setVpsPing] = useState<number|null>(null);
  const [vpsToGamePing, setVpsToGamePing] = useState<number|null>(null);
  const [udpFlow, setUdpFlow] = useState(false);
  const [tunnelStatus, setTunnelStatus] = useState(false);
  const [userToGamePing, setUserToGamePing] = useState<number|null>(null);
  const [userToVpsPing, setUserToVpsPing] = useState<number|null>(null);
  const [routeLagPing, setRouteLagPing] = useState<number|null>(null);
  const gameServerIp = '8.8.8.8'; // TODO: Replace with real game server IP

  useEffect(() => {
    // Fetch real IP address on mount
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => setRealIp(data.ip))
      .catch(() => setRealIp('Unknown'));
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRoutelagOn && routedIp && gameServerIp) {
      window.routelag.startTunnel();
      interval = setInterval(async () => {
        setTunnelStatus(await window.routelag.checkTunnel());
        const safeGameServerIp: string = typeof gameServerIp === 'string' ? gameServerIp : String(gameServerIp);
        const safeRoutedIp: string = typeof routedIp === 'string' ? routedIp : String(routedIp);
        setDirectPing(await window.routelag.pingHost(safeGameServerIp));
        setVpsPing(await window.routelag.pingHost(safeRoutedIp));
        setVpsToGamePing(await window.routelag.vpsPing(safeRoutedIp, safeGameServerIp));
        const udpLog: any[] = await window.routelag.vpsUdpLog(safeRoutedIp);
        setUdpFlow(udpLog.some((pkt: any) => Date.now() - pkt.time < 5000));
        const utg = await window.routelag.pingHost(safeGameServerIp);
        const utv = await window.routelag.pingHost(safeRoutedIp);
        const vtg = await window.routelag.vpsPing(safeRoutedIp, safeGameServerIp);
        setUserToGamePing(utg);
        setUserToVpsPing(utv);
        setRouteLagPing((utv && vtg) ? (parseFloat(utv as any) + parseFloat(vtg as any)) : null);
      }, 2000);
    } else {
      window.routelag.stopTunnel();
      setTunnelStatus(false);
      setDirectPing(null);
      setVpsPing(null);
      setVpsToGamePing(null);
      setUdpFlow(false);
      setUserToGamePing(null);
      setUserToVpsPing(null);
      setRouteLagPing(null);
    }
    return () => clearInterval(interval);
  }, [isRoutelagOn, routedIp, gameServerIp]);

  // Chart update logic (real pings)
  useEffect(() => {
    if (!chartRef.current) return;
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(160, 132, 250, 0.25)');
    gradient.addColorStop(1, 'rgba(160, 132, 250, 0)');
    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: Array(30).fill(''),
        datasets: [
          {
            label: 'RouteLag Ping',
            data: Array(30).fill(null),
            borderColor: '#a084fa',
            borderWidth: 2,
            tension: 0.4,
            fill: true,
            backgroundColor: gradient,
            pointRadius: 0,
          },
          {
            label: 'Direct Ping',
            data: Array(30).fill(null),
            borderColor: 'rgba(255, 255, 255, 0.3)',
            borderWidth: 2,
            borderDash: [5, 5],
            tension: 0.4,
            fill: false,
            pointRadius: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: { x: { display: false }, y: { display: false, min: 0, max: 200 } },
      },
    });
    const interval = setInterval(() => {
      const { datasets } = chart.data;
      const routeLagPing = (vpsPing && vpsToGamePing) ? vpsPing + vpsToGamePing : null;
      const newRouteLagData = [...datasets[0].data.slice(1), routeLagPing];
      const newDirectData = [...datasets[1].data.slice(1), directPing];
      datasets[0].data = newRouteLagData;
      datasets[1].data = newDirectData;
      chart.update('none');
    }, 2000);
    return () => { clearInterval(interval); chart.destroy(); };
  }, [directPing, vpsPing, vpsToGamePing]);

  return (
    <div className="w-[540px] h-[720px] rounded-[30px] bg-[#181622] flex flex-col relative p-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0 draggable select-none" style={dragStyle}>
        <button onClick={onBack} className="text-white/70 hover:text-white" style={noDragStyle}>
          Back
        </button>
        <h2 className="text-2xl font-bold text-white">RouteLag</h2>
        <div className="flex items-center space-x-2" style={noDragStyle}>
          <button className="text-white/60 hover:text-white text-lg font-bold focus:outline-none" onClick={() => window.electron.minimizeWindow()} title="Minimize">−</button>
          <button className="text-white/60 hover:text-white text-xl font-bold focus:outline-none" onClick={() => window.close()} title="Close">×</button>
        </div>
      </div>
      {/* Graph Container */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="bg-black/20 rounded-[16px] p-4 my-4">
          <span className="text-sm text-white/60">Ping</span>
          <div className="h-48">
            <canvas ref={chartRef}></canvas>
          </div>
          <span className="text-sm text-white/60">Time</span>
        </div>
        {/* Controls */}
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-[#14141f] rounded-[16px] p-4" style={noDragStyle}>
            <span className="font-medium text-white">Routelag ON/OFF</span>
            <ToggleSwitch enabled={isRoutelagOn} onToggle={setIsRoutelagOn} />
          </div>
          <div className="flex items-center justify-between bg-[#14141f] rounded-[16px] p-4">
            <span className="font-medium text-white">Routed IP</span>
            <div className="flex items-center gap-4">
              <span className="text-white/80">{isRoutelagOn ? maskIp(routedIp) : realIp}</span>
            </div>
          </div>
          <div className="flex items-center justify-between bg-[#14141f] rounded-[16px] p-4">
            <span className="font-medium text-white">Tunnel Status</span>
            <span className={tunnelStatus ? 'text-green-400' : 'text-red-400'}>{tunnelStatus ? 'Active' : 'Inactive'}</span>
          </div>
          <div className="flex items-center justify-between bg-[#14141f] rounded-[16px] p-4">
            <span className="font-medium text-white">UDP Flow</span>
            <span className={udpFlow ? 'text-green-400' : 'text-red-400'}>{udpFlow ? 'Detected' : 'None'}</span>
          </div>
          <div className="flex flex-col gap-2 bg-[#14141f] rounded-[16px] p-4">
            <span className="font-medium text-white">User → Game Server: <span className="text-[#a084fa]">{userToGamePing ? `${userToGamePing} ms` : 'N/A'}</span></span>
            <span className="font-medium text-white">User → VPS: <span className="text-[#a084fa]">{userToVpsPing ? `${userToVpsPing} ms` : 'N/A'}</span></span>
            <span className="font-medium text-white">VPS → Game Server: <span className="text-[#a084fa]">{vpsToGamePing ? `${vpsToGamePing} ms` : 'N/A'}</span></span>
            <span className="font-medium text-white">RouteLag Ping (User→VPS + VPS→Game): <span className="text-[#a084fa]">{routeLagPing ? `${routeLagPing} ms` : 'N/A'}</span></span>
          </div>
        </div>
      </div>
      {/* End Optimization Button */}
      <div className="flex-shrink-0 pt-4">
        <button onClick={onEndOptimization} className="w-full py-4 rounded-[16px] font-medium text-lg text-white bg-gradient-to-r from-[#a084fa] to-[#6f4ad2] hover:from-[#b39dfa] hover:to-[#7e5ae2] transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed" style={{boxShadow: '0 4px 16px 0 rgba(160, 132, 250, 0.25)'}}>
          End Optimization
        </button>
      </div>
    </div>
  );
};

export default PingGraph; 