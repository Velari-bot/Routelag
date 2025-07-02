import React, { useState, useEffect, useCallback } from 'react';
import VpsServerSelect from './VpsServerSelect';

interface Game {
  id: string;
  name: string;
  image: string;
  category: string;
}

interface GameListProps {
  onGameSelect?: (gameId: string) => void;
  onAccount?: () => void;
}

const games: Game[] = [
  // Top Competitive Shooters
  { id: 'fortnite', name: 'Fortnite', image: '/games/fortnite.jpg', category: 'Top Competitive Shooters' },
  { id: 'valorant', name: 'Valorant', image: '/games/valorant.jpg', category: 'Top Competitive Shooters' },
  { id: 'warzone', name: 'Call of Duty: Warzone', image: '/games/cod.jpg', category: 'Top Competitive Shooters' },
  { id: 'cs2', name: 'Counter-Strike 2 (CS2)', image: '/games/cs2.jpg', category: 'Top Competitive Shooters' },
  { id: 'apex', name: 'Apex Legends', image: '/games/apex.jpg', category: 'Top Competitive Shooters' },
  { id: 'overwatch2', name: 'Overwatch 2', image: '/games/overwatch 2.jpg', category: 'Top Competitive Shooters' },
  { id: 'pubg', name: 'PUBG: Battlegrounds', image: '/games/pubg battlegrounds.jpg', category: 'Top Competitive Shooters' },
  { id: 'r6', name: 'Rainbow Six Siege', image: '/games/r6.jpg', category: 'Top Competitive Shooters' },
  { id: 'battlebit', name: 'BattleBit Remastered', image: '/games/battlebit.jpg', category: 'Top Competitive Shooters' },
  { id: 'xdefiant', name: 'XDefiant', image: '/games/xdefiant.avif', category: 'Top Competitive Shooters' },

  // Sports & Fighting Games
  { id: 'fifa', name: 'FIFA', image: '/games/FIFA.jpg', category: 'Sports & Fighting Games' },
  { id: 'nba2k', name: 'NBA 2K', image: '/games/NBA2k.png', category: 'Sports & Fighting Games' },
  { id: 'madden', name: 'Madden NFL', image: '/games/MaddenNFL.jpg', category: 'Sports & Fighting Games' },
  { id: 'rocketleague', name: 'Rocket League', image: '/games/RocketLeague.jpg', category: 'Sports & Fighting Games' },
  { id: 'streetfighter', name: 'Street Fighter', image: '/games/streetfighter.jpg', category: 'Sports & Fighting Games' },
  { id: 'tekken', name: 'Tekken', image: '/games/tekken.jpg', category: 'Sports & Fighting Games' },

  // MOBA & Strategy Games
  { id: 'lol', name: 'League of Legends', image: '/games/league of legends.avif', category: 'MOBA & Strategy Games' },
  { id: 'dota2', name: 'Dota 2', image: '/games/dota2.webp', category: 'MOBA & Strategy Games' },
  { id: 'smite', name: 'Smite', image: '/games/smite.jpg', category: 'MOBA & Strategy Games' },
  { id: 'starcraft', name: 'StarCraft', image: '/games/starcraftii.jpg', category: 'MOBA & Strategy Games' },
  { id: 'clashroyale', name: 'Clash Royale', image: '/games/clash royale.avif', category: 'MOBA & Strategy Games' },

  // Other Games
  { id: 'roblox', name: 'Roblox', image: '/games/roblox.jpg', category: 'Other Games' },
  { id: 'minecraft', name: 'Minecraft', image: '/games/minecraft.avif', category: 'Other Games' },
  { id: 'arena-breakout', name: 'Arena Breakout', image: '/games/arena breakout.png', category: 'Other Games' },
  { id: 'destiny2', name: 'Destiny 2', image: '/games/destiny 2.jpg', category: 'Other Games' },
  { id: 'gta', name: 'GTA', image: '/games/gta.jpg', category: 'Other Games' },
  { id: 'halo', name: 'Halo', image: '/games/halo.jpg', category: 'Other Games' },
  { id: 'projectl', name: 'Project L', image: '/games/project l.jpg', category: 'Other Games' },
  { id: 'projectmugen', name: 'Project Mugen', image: '/games/project-mugen.jpg', category: 'Other Games' },
  { id: 'thefinals', name: 'The Finals', image: '/games/the finals.webp', category: 'Other Games' },
];

const categories = [
  'Top Competitive Shooters',
  'Sports & Fighting Games',
  'MOBA & Strategy Games',
  'Other Games',
];

const GameList: React.FC<GameListProps> = ({ onGameSelect, onAccount }) => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [showVpsModal, setShowVpsModal] = useState(false);
  const [activeConnection, setActiveConnection] = useState<{ gameId: string; vpsId: string; ping: number } | null>(null);
  const [lastPingRefresh, setLastPingRefresh] = useState(Date.now());
  const [search, setSearch] = useState('');

  // Refresh ping data every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setLastPingRefresh(Date.now());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // When a game is clicked, show the VPS modal
  const handleGameClick = useCallback((gameId: string) => {
    setSelectedGame(gameId);
    setShowVpsModal(true);
    if (onGameSelect) onGameSelect(gameId);
  }, [onGameSelect]);

  // When a connection is made, update state and close modal
  const handleConnected = useCallback(() => {
    setShowVpsModal(false);
    // Optionally, fetch and set active connection info here
    // For now, just set a placeholder
    setActiveConnection(prev => prev && selectedGame ? { ...prev, gameId: selectedGame } : prev);
  }, [selectedGame]);

  // Allow switching servers
  const handleSwitchServer = () => {
    setShowVpsModal(true);
  };

  // Filter games by search
  const filteredGames = games.filter(game =>
    game.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-[540px] h-[680px] rounded-3xl bg-[#181622] p-10 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={onAccount} className="text-white/70 hover:text-white text-base">Account</button>
        <h2 className="text-2xl font-bold text-white">Routelag</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => window.electron.minimizeWindow()}
            className="text-white/60 hover:text-white text-lg font-bold focus:outline-none"
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

      {/* Search Bar */}
      <div className="mb-5">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search games..."
          className="w-full px-4 py-2 rounded-lg bg-[#232136] text-white placeholder-white/40 border border-[#2d2546] focus:outline-none focus:ring-2 focus:ring-[#a084fa]"
        />
      </div>

      {/* Game List by Category */}
      <div className="flex flex-col gap-6">
        {categories.map((cat) => {
          const catGames = filteredGames.filter(g => g.category === cat);
          if (catGames.length === 0) return null;
          return (
            <div key={cat}>
              <div className="text-lg font-bold text-white/80 mb-2 pl-1">{cat}</div>
              <div className="flex flex-col gap-3">
                {catGames.map((game) => (
                  <button
                    key={game.id}
                    onClick={() => handleGameClick(game.id)}
                    className="group flex items-center w-full bg-[#181622] transition-all duration-200 rounded-2xl overflow-hidden border border-white/10 shadow-lg min-h-[70px]"
                    style={{ minHeight: 70 }}
                  >
                    <div className="w-[40%] h-[70px] flex-shrink-0 relative overflow-hidden">
                      <img
                        src={game.image}
                        alt={game.name}
                        className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex-1 flex items-center pl-6 h-full justify-start text-left">
                      <span className="text-white text-lg font-bold drop-shadow-md">{game.name}</span>
                    </div>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-all duration-200 ml-4 mr-4">
                      <span className="text-white/60 group-hover:text-white text-xl transform group-hover:translate-x-0.5 transition-all duration-200">→</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {showVpsModal && selectedGame && (
        <VpsServerSelect
          gameId={selectedGame}
          onConnected={handleConnected}
        />
      )}

      {activeConnection && (
        <div className="fixed bottom-6 right-6 bg-blue-100 border border-blue-300 rounded-xl px-6 py-4 shadow-xl flex items-center gap-4">
          <div className="text-blue-700 font-semibold">Active Connection:</div>
          <div className="text-blue-900">{activeConnection.gameId} via {activeConnection.vpsId} ({activeConnection.ping} ms)</div>
          <button onClick={handleSwitchServer} className="ml-4 px-3 py-1 rounded bg-blue-400 text-white font-semibold hover:bg-blue-600 transition">Switch</button>
        </div>
      )}
    </div>
  );
};

export default GameList; 