import React, { useState, CSSProperties, useEffect } from 'react';
import PingGraph from './PingGraph';
import { db } from '../utils/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';

interface VpsServer {
  id: string;
  ip: string;
  region: string;
  location?: string;
  name?: string;
  ping: number;
}

interface RouteSelectProps {
  onBack: () => void;
  selectedGame: string;
  onEndOptimization: () => void;
  onConnected?: (server: VpsServer, ping: number, sessionId: string) => void;
  onDisconnected?: (sessionId: string) => void;
  user: any;
}

const dragStyle: CSSProperties = {
  WebkitAppRegion: 'drag'
} as any;

const noDragStyle: CSSProperties = {
  WebkitAppRegion: 'no-drag'
} as any;

const RouteSelect: React.FC<RouteSelectProps> = ({ onBack, selectedGame, onEndOptimization, onConnected, onDisconnected, user }) => {
  const [servers, setServers] = useState<VpsServer[]>([]);
  const [selectedServer, setSelectedServer] = useState<string>('');
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [connectionPing, setConnectionPing] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchServers() {
      setError(null);
      try {
        // Only call Electron API if running in Electron
        const isElectron = window && window.process && window.process.type;
        let vpsList: VpsServer[] = [];
        if (isElectron && window.electron && window.electron.pingVpsServers) {
          vpsList = await window.electron.pingVpsServers();
        } else {
          // Mock data for development (no real VPS yet)
          vpsList = [
            { id: 'na-east', ip: '1.1.1.1', region: 'NA-East', name: 'New York', ping: 45 },
            { id: 'eu-west', ip: '2.2.2.2', region: 'EU-West', name: 'London', ping: 120 },
            { id: 'asia', ip: '3.3.3.3', region: 'Asia', name: 'Singapore', ping: 210 }
          ];
        }
        setServers(vpsList);
      } catch (e) {
        setError('Failed to fetch or ping servers.');
      }
    }
    fetchServers();
  }, []);

  const handleConnect = async (serverId: string) => {
    setConnecting(true);
    setSelectedServer(serverId);
    // Simulate connection delay
    setTimeout(async () => {
      setConnected(true);
      const server = servers.find(s => s.id === serverId);
      setConnectionPing(server ? server.ping : null);
      setConnecting(false);
      if (server && onConnected) {
        if (user && user.uid) {
          try {
            const sessionRef = collection(db, 'users', user.uid, 'sessions');
            const docRef = await addDoc(sessionRef, {
              gameId: selectedGame,
              serverIP: server.ip,
              region: server.region,
              ping: server.ping,
              connectedAt: serverTimestamp(),
            });
            setCurrentSessionId(docRef.id);
            onConnected(server, server.ping, docRef.id);
          } catch (e) {
            console.error('Session write error:', e);
            onConnected(server, server.ping, ''); // Still navigate
          }
        } else {
          onConnected(server, server.ping, '');
        }
      }
    }, 1000);
  };

  const handleDisconnect = async () => {
    setConnected(false);
    setSelectedServer('');
    setConnectionPing(null);
    if (currentSessionId) {
      if (user) {
        const sessionDoc = doc(db, `users/${user.uid}/sessions/${currentSessionId}`);
        await updateDoc(sessionDoc, { disconnectedAt: serverTimestamp() });
      }
      if (onDisconnected) onDisconnected(currentSessionId);
      setCurrentSessionId(null);
    }
  };

  const getPingColor = (ping: number | null) => {
    if (ping === null) return 'text-gray-400';
    if (ping === -1 || ping === Infinity) return 'text-red-500';
    if (ping < 50) return 'text-green-400';
    if (ping < 100) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="w-[540px] h-[720px] rounded-[30px] bg-[#181622] flex flex-col relative">
      <div className="text-white text-center py-2 text-sm bg-[#232136] rounded-t-xl">Selected Game: {selectedGame}</div>
      <div className="flex items-center justify-between p-4 select-none flex-shrink-0" style={dragStyle}>
        <button 
          onClick={onBack} 
          className="text-white/70 hover:text-white text-base"
          style={noDragStyle}
        >
          Back
        </button>
        <h2 className="text-2xl font-bold text-white">Select Server</h2>
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
      <div className="flex-1 px-4 overflow-y-auto">
        {error && <div className="text-red-400 text-center my-4">{error}</div>}
        <div className="space-y-2">
          {servers.map((server) => (
            <div
              key={server.id}
              className={`group flex items-center w-full bg-[#14141f] hover:bg-[#1a1a24] transition-all duration-200 rounded-[16px] overflow-hidden border border-white/10`}
            >
              <div className="flex-1 flex items-center justify-between p-4">
                <div className="flex flex-col">
                  <span className="text-white text-lg font-medium">{server.name || server.region}</span>
                  <span className="text-white/60 text-sm">{server.location || server.ip}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className={`text-lg font-bold ${getPingColor(server.ping)}`}>
                      {server.ping === Infinity ? 'Error' : `${Math.round(server.ping)}ms`}
                    </div>
                    <div className="text-xs text-white/40">ping</div>
                  </div>
                  {connected && selectedServer === server.id ? (
                    <button
                      onClick={handleDisconnect}
                      className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold shadow hover:bg-red-700 transition"
                    >
                      Disconnect
                    </button>
                  ) : (
                    <button
                      onClick={() => handleConnect(server.id)}
                      disabled={connecting}
                      className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#a084fa] to-[#6f4ad2] text-white font-semibold shadow hover:from-[#b39dfa] hover:to-[#7e5ae2] transition disabled:opacity-50"
                    >
                      {connecting && selectedServer === server.id ? 'Connecting...' : 'Connect'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        {connected && (
          <div className="mt-6 text-center text-green-400 font-bold">Connected! Ping: {connectionPing}ms</div>
        )}
      </div>
    </div>
  );
};

export default RouteSelect;