import React, { useEffect, useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../utils/firebase';

interface VpsConfig {
  id: string;
  ip: string;
  region: string;
  type: string;
  label: string;
  ping?: number;
  status?: 'up' | 'down';
}

interface VpsServerSelectProps {
  gameId: string;
  onConnected?: () => void;
}

const VpsServerSelect: React.FC<VpsServerSelectProps> = ({ gameId, onConnected }) => {
  const [vpsList, setVpsList] = useState<VpsConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectingId, setConnectingId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    // Fetch VPS configs from preload
    (async () => {
      try {
        // 1. Load configs
        const configs: VpsConfig[] = await (window as any).electron.pingVpsServers();
        if (isMounted) {
          // Order: NYC (East), Chicago (Midwest), Dallas (Central), then other routing, then relays
          const routing = configs.filter(cfg => cfg.type === 'routing');
          const relays = configs.filter(cfg => cfg.type === 'relay');
          // Find specific routing servers
          const nyc = routing.find(cfg => cfg.region === 'East');
          const chicago = routing.find(cfg => cfg.region === 'Midwest');
          const dallas = routing.find(cfg => cfg.region === 'Central');
          // Remove them from the rest
          const rest = routing.filter(cfg => cfg.region !== 'East' && cfg.region !== 'Midwest' && cfg.region !== 'Central');
          // Build ordered list
          const ordered = [nyc, chicago, dallas, ...rest].filter(Boolean).concat(relays);
          setVpsList(ordered as VpsConfig[]);
          setLoading(false);
        }
      } catch (e: any) {
        setError('Failed to load VPS list.');
        setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  const handleConnect = async (vps: VpsConfig) => {
    setConnectingId(vps.id);
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) throw new Error('User not authenticated');
      await addDoc(collection(db, 'users', uid, 'sessions'), {
        gameId,
        serverIP: vps.ip,
        region: vps.region,
        ping: vps.ping,
        connectedAt: serverTimestamp(),
      });
      setConnectingId(null);
      if (onConnected) onConnected();
    } catch (e) {
      setError('Failed to connect.');
      setConnectingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-[420px] max-w-full border-2 border-blue-100 relative">
        <h2 className="text-2xl font-bold text-blue-700 mb-4 text-center">Select a Server</h2>
        {loading ? (
          <div className="text-blue-500 text-center py-8">Loading servers...</div>
        ) : error ? (
          <div className="text-red-500 text-center py-8">{error}</div>
        ) : (
          <div className="divide-y divide-blue-100">
            {vpsList.length === 0 && (
              <div className="text-blue-400 text-center py-8">No servers available.</div>
            )}
            {/* Routing servers */}
            {vpsList.filter(vps => vps.type === 'routing').map((vps) => (
              <div key={vps.id} className="flex items-center justify-between py-4 px-2 hover:bg-blue-50 rounded-lg transition">
                <div>
                  <div className="font-semibold text-blue-800">{vps.label} <span className="text-xs text-blue-400">({vps.region})</span></div>
                  <div className="text-xs text-blue-500">{vps.ip}</div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`font-mono text-lg ${vps.status === 'up' ? 'text-green-600' : 'text-red-400'}`}>{vps.ping !== undefined && vps.ping !== Infinity ? `${Math.round(vps.ping)} ms` : 'down'}</span>
                  <button
                    className={`px-4 py-2 rounded-lg font-semibold text-white transition-colors ${connectingId === vps.id ? 'bg-blue-300' : 'bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700'} disabled:opacity-60`}
                    disabled={vps.status !== 'up' || connectingId === vps.id}
                    onClick={() => handleConnect(vps)}
                  >
                    {connectingId === vps.id ? 'Connecting...' : 'Connect'}
                  </button>
                </div>
              </div>
            ))}
            {/* Relay servers, visually separated */}
            {vpsList.some(vps => vps.type === 'relay') && (
              <div className="my-2 border-t border-blue-200" />
            )}
            {vpsList.filter(vps => vps.type === 'relay').map((vps) => (
              <div key={vps.id} className="flex items-center justify-between py-4 px-2 hover:bg-purple-50 rounded-lg transition opacity-80">
                <div>
                  <div className="font-semibold text-purple-800">{vps.label} <span className="text-xs text-purple-400">(Relay)</span></div>
                  <div className="text-xs text-purple-500">{vps.ip}</div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`font-mono text-lg ${vps.status === 'up' ? 'text-green-600' : 'text-red-400'}`}>{vps.ping !== undefined && vps.ping !== Infinity ? `${Math.round(vps.ping)} ms` : 'down'}</span>
                  <button
                    className={`px-4 py-2 rounded-lg font-semibold text-white transition-colors ${connectingId === vps.id ? 'bg-purple-300' : 'bg-gradient-to-r from-purple-400 to-purple-600 hover:from-purple-500 hover:to-purple-700'} disabled:opacity-60`}
                    disabled={vps.status !== 'up' || connectingId === vps.id}
                    onClick={() => handleConnect(vps)}
                  >
                    {connectingId === vps.id ? 'Connecting...' : 'Connect'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <button className="absolute top-3 right-3 text-blue-300 hover:text-blue-600 text-2xl font-bold focus:outline-none" onClick={onConnected} title="Close">×</button>
      </div>
    </div>
  );
};

export default VpsServerSelect; 