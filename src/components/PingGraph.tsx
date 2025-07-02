import React, { useEffect, useRef, useState, CSSProperties } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface PingGraphProps {
  onBack: () => void;
  selectedServer: string;
  onEndOptimization: () => void;
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

const PingGraph: React.FC<PingGraphProps> = ({ onBack, selectedServer, onEndOptimization }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const [routedIp, setRoutedIp] = useState('192.193.1:1');
  const [realIp, setRealIp] = useState('');
  const [currentPing, setCurrentPing] = useState(18);
  const [isRoutelagOn, setIsRoutelagOn] = useState(true);

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
            label: 'Optimized Ping',
            data: Array(30).fill(null),
            borderColor: '#a084fa',
            borderWidth: 2,
            tension: 0.4,
            fill: true,
            backgroundColor: gradient,
            pointRadius: 0,
          },
          {
            label: 'Unoptimized Ping',
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
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false },
        },
        scales: {
          x: {
            display: false,
          },
          y: {
            display: false,
            min: 0,
            max: 100,
          },
        },
      },
    });

    const interval = setInterval(() => {
      const { datasets } = chart.data;
      
      const unoptimizedPing = Math.random() * 40 + 40; // Simulate higher, unstable ping
      const optimizedPing = unoptimizedPing / (Math.random() * 1.5 + 1.5); // Simulate improved ping

      const newUnoptimizedData = [...datasets[1].data.slice(1), unoptimizedPing];
      const newOptimizedData = [...datasets[0].data.slice(1), isRoutelagOn ? optimizedPing : unoptimizedPing];

      datasets[1].data = newUnoptimizedData;
      datasets[0].data = newOptimizedData;

      setCurrentPing(Math.round(isRoutelagOn ? optimizedPing : unoptimizedPing));
      chart.update('none');
    }, 1000);

    return () => {
      clearInterval(interval);
      chart.destroy();
    };
  }, [isRoutelagOn]);

  useEffect(() => {
    // Fetch real IP address on mount
    fetch('https://api.ipify.org?format=json')
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => setRealIp(data.ip))
      .catch(error => {
        console.warn('Failed to fetch IP address:', error);
        setRealIp('Unknown'); // Fallback value
      });
  }, []);

  return (
    <div className="w-[540px] h-[720px] rounded-[30px] bg-[#181622] flex flex-col relative p-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0 draggable select-none" style={dragStyle}>
        <button onClick={onBack} className="text-white/70 hover:text-white" style={noDragStyle}>
          Back
        </button>
        <h2 className="text-2xl font-bold text-white">RouteLag</h2>
        <div className="flex items-center space-x-2" style={noDragStyle}>
          <button
            className="text-white/60 hover:text-white text-lg font-bold focus:outline-none"
            onClick={() => window.electron.minimizeWindow()}
            title="Minimize"
          >
            −
          </button>
          <button
            className="text-white/60 hover:text-white text-xl font-bold focus:outline-none"
            onClick={() => window.close()}
            title="Close"
          >
            ×
          </button>
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
          <div className="flex items-center justify-between bg-[#14141f] rounded-[16px] p-4">
            <span className="font-medium text-white">Routelag ON/OFF</span>
            <ToggleSwitch enabled={isRoutelagOn} onToggle={setIsRoutelagOn} />
          </div>
          <div className="flex items-center justify-between bg-[#14141f] rounded-[16px] p-4">
            <span className="font-medium text-white">Routed IP</span>
            <div className="flex items-center gap-4">
              <span className="text-white/80">{isRoutelagOn ? routedIp : realIp}</span>
              <span className="font-bold text-[#a084fa]">{currentPing}ms</span>
            </div>
          </div>
        </div>
      </div>

      {/* End Optimization Button */}
      <div className="flex-shrink-0 pt-4">
        <button
          onClick={onEndOptimization}
          className="w-full py-4 rounded-[16px] font-medium text-lg text-white bg-gradient-to-r from-[#a084fa] to-[#6f4ad2] hover:from-[#b39dfa] hover:to-[#7e5ae2] transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          style={{boxShadow: '0 4px 16px 0 rgba(160, 132, 250, 0.25)'}}
        >
          End Optimization
        </button>
      </div>
    </div>
  );
};

export default PingGraph; 