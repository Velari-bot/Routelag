import React, { useState, useEffect } from 'react';
import { auth, logoutUser, fetchClaimedAuthKeyForUser, db } from './utils/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import Login from './components/Login';
import GameList from './components/GameList';
import RouteSelect from './components/RouteSelect';
import PingGraph from './components/PingGraph';
import AdminPanel from './components/AdminPanel';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import './App.css';

// Add type for claimed auth key
interface ClaimedAuthKey {
  id: string;
  expiresAt: any;
  [key: string]: any;
}

// Account Page
const AccountPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [usedAuthKey, setUsedAuthKey] = useState<boolean>(false);
  const [settings, setSettings] = useState({
    startWithWindows: true,
    autoStartupLogin: true,
    minimizeToTray: false,
    optimizeDNS: true,
    notifyOnConnect: true,
    notifications: true,
    fasterKeyboard: true,
    disableWindowsButton: false,
    disableComputerStats: true,
    autoQOS: true,
  });
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [authKeyName, setAuthKeyName] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('[onAuthStateChanged] user:', user);
      setUser(user);
      setLoading(false);
      let claimedKey = null;
      let authKeyNameLocal = localStorage.getItem('authKeyName');
      if (user) {
        // Try to fetch by UID first
        claimedKey = await fetchClaimedAuthKeyForUser(user.uid) as ClaimedAuthKey | null;
        // If not found and we have an auth key name, try to fetch by name
        if ((!claimedKey || !claimedKey.expiresAt) && authKeyNameLocal) {
          claimedKey = await fetchClaimedAuthKeyForUser(authKeyNameLocal) as ClaimedAuthKey | null;
        }
        if (claimedKey && claimedKey.expiresAt) {
          setUsedAuthKey(true);
          if (claimedKey.claimedBy && typeof claimedKey.claimedBy === 'string' && !claimedKey.claimedBy.match(/^\w{28}$/)) {
            setAuthKeyName(claimedKey.claimedBy);
          } else {
            setAuthKeyName(null);
          }
          let expiresAt;
          if (claimedKey.expiresAt.seconds) {
            expiresAt = new Date(claimedKey.expiresAt.seconds * 1000);
          } else {
            expiresAt = new Date(claimedKey.expiresAt);
          }
          const now = new Date();
          const diff = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          setDaysLeft(diff > 0 ? diff : 0);
        } else {
          setUsedAuthKey(false);
          setDaysLeft(null);
          setAuthKeyName(null);
        }
      } else {
        setUsedAuthKey(false);
        setDaysLeft(null);
        setAuthKeyName(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackSent(true);
    setTimeout(() => {
      setFeedbackOpen(false);
      setFeedbackSent(false);
      setFeedback("");
    }, 1500);
  };

  if (loading) {
    return (
      <div className="w-[540px] h-[680px] rounded-3xl bg-[#181622] p-10">
        <div className="flex items-center justify-between mb-6">
          <button onClick={onBack} className="text-white/70 hover:text-white text-base">Back</button>
          <h2 className="text-2xl font-bold text-white">Account</h2>
          <div className="flex items-center space-x-2">
            <button onClick={() => window.electron.minimizeWindow()} className="text-white/60 hover:text-white text-lg font-bold focus:outline-none" title="Minimize">−</button>
            <button className="text-white/60 hover:text-white text-xl font-bold focus:outline-none" onClick={() => window.close()} title="Close">×</button>
          </div>
        </div>
        <div className="flex items-center justify-center h-32">
          <div className="text-white/60">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[540px] h-[680px] rounded-3xl bg-[#181622] p-10 overflow-y-auto max-h-[90vh] relative">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="text-white/70 hover:text-white text-base">Back</button>
        <h2 className="text-2xl font-bold text-white">Account</h2>
        <div className="flex items-center space-x-2">
          <button onClick={() => window.electron.minimizeWindow()} className="text-white/60 hover:text-white text-lg font-bold focus:outline-none" title="Minimize">−</button>
          <button className="text-white/60 hover:text-white text-xl font-bold focus:outline-none" onClick={() => window.close()} title="Close">×</button>
        </div>
      </div>

      {/* Subscription Card */}
      <div className="bg-[#211a32] border border-[#2d2546] rounded-2xl p-6 mb-6 shadow flex flex-col items-start">
        <div className="text-xs text-white/50 font-semibold mb-1 tracking-widest">SUBSCRIPTION</div>
        <div className="text-2xl font-bold mb-2">
          <span className="text-[#a084fa]">
            {daysLeft !== null ? daysLeft : '--'}
          </span> <span className="text-white">days left</span>
        </div>
        <hr className="border-[#2d2546] w-full my-3" />
        <div className="text-xs text-white/50 font-semibold mb-1 tracking-widest">USER</div>
        <div className="text-lg font-bold text-white mb-4">{usedAuthKey ? (authKeyName || 'used auth key') : (user?.email || 'user@email.com')}</div>
        <div className="flex space-x-3 w-full">
          <button className="flex-1 bg-gradient-to-r from-[#a084fa] to-[#6f4ad2] hover:from-[#b39dfa] hover:to-[#7e5ae2] text-white font-semibold py-2 rounded-lg transition-colors">Renew now!</button>
          <button onClick={handleLogout} className="flex-1 bg-[#23243a] hover:bg-[#35365a] text-white font-semibold py-2 rounded-lg transition-colors">Log out of account</button>
        </div>
      </div>

      {/* Settings Section */}
      <div className="bg-[#211a32] border border-[#2d2546] rounded-2xl p-6 mb-6 shadow">
        <div className="text-xs text-white/50 font-semibold mb-4 tracking-widest">SETTINGS</div>
        <div className="grid grid-cols-1 gap-4">
          {Object.entries(settings).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-white/80 capitalize">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
              <button
                onClick={() => handleToggle(key as keyof typeof settings)}
                className={`w-12 h-6 rounded-full relative transition-colors duration-200 focus:outline-none ${value ? 'bg-gradient-to-r from-[#a084fa] to-[#6f4ad2]' : 'bg-[#23243a]'}`}
                aria-pressed={value}
              >
                <span
                  className={`absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200 shadow ${value ? 'translate-x-6' : ''}`}
                  style={{ transform: value ? 'translateX(18px)' : 'translateX(0)' }}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Feedback Button */}
      <button
        className="w-full bg-gradient-to-r from-[#a084fa] to-[#6f4ad2] hover:from-[#b39dfa] hover:to-[#7e5ae2] text-white font-semibold py-2 rounded-lg transition-colors mb-2"
        onClick={() => setFeedbackOpen(true)}
      >
        Submit Feedback
      </button>

      {/* Feedback Modal */}
      {feedbackOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-[#211a32] rounded-2xl p-8 w-[350px] shadow-xl border border-[#2d2546] relative">
            <button
              className="absolute top-3 right-3 text-white/60 hover:text-white text-xl font-bold focus:outline-none"
              onClick={() => setFeedbackOpen(false)}
              title="Close"
            >
              ×
            </button>
            <h3 className="text-xl font-bold text-white mb-4">Submit Feedback</h3>
            {feedbackSent ? (
              <div className="text-[#a084fa] text-center font-semibold">Thank you for your feedback!</div>
            ) : (
              <form onSubmit={handleFeedbackSubmit} className="flex flex-col space-y-4">
                <textarea
                  className="w-full h-24 rounded-lg p-2 bg-[#181622] text-white border border-[#2d2546] focus:outline-none focus:ring-2 focus:ring-[#a084fa] resize-none"
                  placeholder="Let us know your thoughts..."
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  className="bg-gradient-to-r from-[#a084fa] to-[#6f4ad2] hover:from-[#b39dfa] hover:to-[#7e5ae2] text-white font-semibold py-2 rounded-lg transition-colors"
                >
                  Send Feedback
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ErrorBoundary to catch rendering errors
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: any}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return <div style={{color: 'red', padding: 20}}><b>Something went wrong:</b><br/>{this.state.error?.toString()}</div>;
    }
    return this.props.children;
  }
}

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'login' | 'games' | 'routes' | 'monitor' | 'account'>('login');
  const [selectedGame, setSelectedGame] = useState<string>('');
  const [isOptimized, setIsOptimized] = useState(false);
  const [selectedServer, setSelectedServer] = useState<string>('');
  const [showAccount, setShowAccount] = useState(false);
  const [sessionWriteError, setSessionWriteError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('[onAuthStateChanged] user:', user);
      setUser(user);
      setLoading(false);
      if (!user) {
        setCurrentView('login');
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchSessions = async () => {
      try {
        const sessionsRef = collection(db, 'users', user.uid, 'sessions');
        const snapshot = await getDocs(sessionsRef);
        snapshot.forEach(doc => {
          console.log('Firestore session read:', doc.id, doc.data());
        });
      } catch (e: any) {
        console.error('Firestore session read error:', e);
      }
    };
    fetchSessions();
  }, [user]);

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    setCurrentView('login');
  };

  const handleGameSelect = (gameId: string) => {
    console.log('[handleGameSelect] gameId:', gameId);
    setSelectedGame(gameId);
    setCurrentView('routes');
  };

  const handleToggleOptimization = () => {
    setIsOptimized(!isOptimized);
  };

  const handleEndOptimization = () => {
    setIsOptimized(false);
    setCurrentView('games');
    setSelectedGame('');
  };

  // Firestore session write
  const handleSessionWrite = async (gameId: string, server: any, ping: number) => {
    if (!user) {
      console.error('No user, cannot write session');
      return;
    }
    try {
      setSessionWriteError(null);
      const sessionRef = collection(db, 'users', user.uid, 'sessions');
      console.log('Writing session:', { gameId, server, ping, uid: user.uid });
      await addDoc(sessionRef, {
        gameId,
        serverIP: server.ip,
        region: server.region,
        ping,
        connectedAt: serverTimestamp(),
      });
      console.log('Session write successful');
    } catch (e) {
      setSessionWriteError('Failed to save session.');
      console.error('Session write error:', e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#14141f]">
        <div className="w-[540px] h-[680px] rounded-3xl bg-[#181622] p-10 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'login':
        return <Login onLogin={() => setCurrentView('games')} />;
      case 'games':
        return (
          <GameList 
            onGameSelect={handleGameSelect} 
            onAccount={() => setCurrentView('account')} 
          />
        );
      case 'routes':
        return (
          <RouteSelect
            selectedGame={selectedGame}
            onBack={() => setCurrentView('games')}
            onEndOptimization={handleEndOptimization}
            onConnected={async (server, ping, sessionId) => {
              await handleSessionWrite(selectedGame, server, ping);
              setCurrentView('monitor');
              setSelectedServer(server.id);
            }}
            user={user}
          />
        );
      case 'monitor':
        return (
          <PingGraph
            selectedServer={selectedServer}
            onBack={() => setCurrentView('routes')}
            onEndOptimization={handleEndOptimization}
          />
        );
      case 'account':
        return <AccountPage onBack={() => setCurrentView('games')} />;
      default:
        return null;
    }
  };

  return (
    <Router>
      <Routes>
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/*" element={
          <ErrorBoundary>
            <div className="relative w-screen h-screen overflow-hidden bg-transparent">
              <div className="flex items-center justify-center w-full h-full min-h-screen">
                {renderView()}
              </div>
            </div>
          </ErrorBoundary>
        } />
      </Routes>
    </Router>
  );
};

export default App; 