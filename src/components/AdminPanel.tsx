import React, { useState, useEffect } from 'react';
import { generateAuthKey, storeAuthKey, fetchAuthKeys, auth, db, deleteAuthKey } from '../utils/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { FiRefreshCw, FiCopy, FiEye, FiEyeOff } from 'react-icons/fi';

interface AuthKey {
  id?: string;
  key: string;
  expiresAt: any;
  claimed: boolean;
  claimedBy: string | null;
}

const AdminPanel: React.FC = () => {
  const [authKeys, setAuthKeys] = useState<AuthKey[]>([]);
  const [newKey, setNewKey] = useState<AuthKey | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [checkingAdmin, setCheckingAdmin] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [filterClaimed, setFilterClaimed] = useState<'all' | 'claimed' | 'unclaimed'>('all');
  const [filterExpiresSoon, setFilterExpiresSoon] = useState(false);
  const [showKey, setShowKey] = useState<{[id: string]: boolean}>({});
  const [showNewKey, setShowNewKey] = useState(false);

  const loadKeys = async () => {
    setLoading(true);
    const keys = await fetchAuthKeys();
    setAuthKeys(keys as AuthKey[]);
    setLoading(false);
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setIsAdmin(false);
      setCheckingAdmin(true);
      if (u) {
        // Check admin flag in Firestore
        const userDoc = await getDoc(doc(db, 'users', u.uid));
        if (userDoc.exists() && userDoc.data().admin === true) {
          setIsAdmin(true);
          loadKeys();
        }
      }
      setCheckingAdmin(false);
    });
    return () => unsub();
  }, []);

  const handleGenerateKey = async () => {
    const { key, expiresAt } = generateAuthKey();
    await storeAuthKey(key, expiresAt);
    setNewKey({ key, expiresAt, claimed: false, claimedBy: null });
    loadKeys();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
    } catch (err: any) {
      setLoginError(err.message || 'Login failed');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setIsAdmin(false);
  };

  if (checkingAdmin) {
    return <div className="text-white p-8">Checking admin status...</div>;
  }

  if (!user) {
    return (
      <div className="max-w-sm mx-auto p-8 bg-[#181622] rounded-2xl mt-10 text-white shadow-lg">
        <h1 className="text-2xl font-bold mb-6">Admin Login</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={loginEmail}
            onChange={e => setLoginEmail(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-[#232136] text-white placeholder-white/40 border border-[#2d2546] focus:outline-none focus:ring-2 focus:ring-[#a084fa]"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={loginPassword}
            onChange={e => setLoginPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-[#232136] text-white placeholder-white/40 border border-[#2d2546] focus:outline-none focus:ring-2 focus:ring-[#a084fa]"
            required
          />
          {loginError && <div className="text-red-400 text-sm">{loginError}</div>}
          <button type="submit" className="w-full py-2 bg-gradient-to-r from-[#a084fa] to-[#6f4ad2] rounded-lg font-semibold text-white hover:from-[#b39dfa] hover:to-[#7e5ae2] transition">Login</button>
        </form>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto p-8 bg-[#181622] rounded-2xl mt-10 text-white shadow-lg text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="mb-4">You do not have admin privileges.</p>
        <button onClick={handleLogout} className="py-2 px-6 bg-gradient-to-r from-[#a084fa] to-[#6f4ad2] rounded-lg font-semibold text-white hover:from-[#b39dfa] hover:to-[#7e5ae2] transition">Logout</button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-8 bg-[#181622] rounded-2xl mt-10 text-white shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <button onClick={handleLogout} className="py-2 px-6 bg-gradient-to-r from-[#a084fa] to-[#6f4ad2] rounded-lg font-semibold text-white hover:from-[#b39dfa] hover:to-[#7e5ae2] transition">Logout</button>
      </div>
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Auth Key Management</h2>
        <div className="flex flex-wrap gap-4 mb-4 items-end">
          <button
            onClick={handleGenerateKey}
            className="px-6 py-2 bg-gradient-to-r from-[#a084fa] to-[#6f4ad2] rounded-lg font-semibold text-white hover:from-[#b39dfa] hover:to-[#7e5ae2] transition"
          >
            Generate 1 Month Auth Key
          </button>
          <button
            onClick={loadKeys}
            className="flex items-center px-3 py-2 bg-[#232136] hover:bg-[#2d2546] rounded-lg text-white"
            title="Refresh"
          >
            {FiRefreshCw({ className: "mr-1" })} Refresh
          </button>
          <div>
            <label className="block text-sm mb-1">Search by Name</label>
            <input
              type="text"
              value={searchName}
              onChange={e => setSearchName(e.target.value)}
              className="px-2 py-1 rounded bg-[#232136] border border-[#2d2546] text-white"
              placeholder="Name..."
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Claimed Status</label>
            <select
              value={filterClaimed}
              onChange={e => setFilterClaimed(e.target.value as any)}
              className="px-2 py-1 rounded bg-[#232136] border border-[#2d2546] text-white"
            >
              <option value="all">All</option>
              <option value="claimed">Claimed</option>
              <option value="unclaimed">Unclaimed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Expires Soon</label>
            <input
              type="checkbox"
              checked={filterExpiresSoon}
              onChange={e => setFilterExpiresSoon(e.target.checked)}
              className="mr-1"
            />
            <span className="text-sm">Within 7 days</span>
          </div>
        </div>
        {newKey && (
          <div className="mb-4 p-4 bg-[#232136] rounded-lg">
            <div>
              <span className="font-bold">New Key:</span> 
              <span className="break-all">
                {showNewKey ? newKey.key : '••••••••••••••••••••••••••••••••••'}
                <button
                  onClick={() => setShowNewKey(v => !v)}
                  className="ml-2 text-white/60 hover:text-white"
                  title={showNewKey ? 'Hide Key' : 'Show Key'}
                >
                  {showNewKey ? FiEyeOff({}) : FiEye({})}
                </button>
              </span>
            </div>
            <div><span className="font-bold">Expires:</span> {new Date(newKey.expiresAt.seconds ? newKey.expiresAt.seconds * 1000 : newKey.expiresAt).toLocaleString()}</div>
          </div>
        )}
        <div>
          <h3 className="font-semibold mb-2">All Generated Keys</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm bg-[#232136] rounded-lg">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left">Key</th>
                  <th className="px-4 py-2 text-left">Expires</th>
                  <th className="px-4 py-2 text-left">Claimed</th>
                  <th className="px-4 py-2 text-left">Claimed By</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="px-4 py-2 text-center text-white/60">Loading...</td></tr>
                ) : authKeys.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-2 text-center text-white/60">No keys generated yet.</td></tr>
                ) : authKeys
                  .filter(k => {
                    if (filterClaimed === 'claimed' && !k.claimed) return false;
                    if (filterClaimed === 'unclaimed' && k.claimed) return false;
                    if (filterExpiresSoon) {
                      const now = new Date();
                      const expires = new Date(k.expiresAt.seconds ? k.expiresAt.seconds * 1000 : k.expiresAt);
                      const diff = (expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
                      if (diff > 7) return false;
                    }
                    if (searchName && (!k.claimedBy || !k.claimedBy.toLowerCase().includes(searchName.toLowerCase()))) return false;
                    return true;
                  })
                  .map((k, i) => (
                    <tr key={k.id || i} className="border-t border-[#2d2546]">
                      <td className="px-4 py-2 break-all font-mono">
                        <span>
                          {showKey[k.id || i] ? k.key : '••••••••••••••••••••••••••••••••••'}
                        </span>
                        <button
                          onClick={() => setShowKey(s => ({ ...s, [k.id || i]: !s[k.id || i] }))}
                          className="ml-2 text-white/60 hover:text-white"
                          title={showKey[k.id || i] ? 'Hide Key' : 'Show Key'}
                        >
                          {showKey[k.id || i] ? FiEyeOff({}) : FiEye({})}
                        </button>
                        <button
                          onClick={() => navigator.clipboard.writeText(k.key)}
                          className="ml-2 text-white/60 hover:text-white"
                          title="Copy Key"
                        >
                          {FiCopy({})}
                        </button>
                      </td>
                      <td className="px-4 py-2">{new Date(k.expiresAt.seconds ? k.expiresAt.seconds * 1000 : k.expiresAt).toLocaleString()}</td>
                      <td className="px-4 py-2">{k.claimed ? 'Yes' : 'No'}</td>
                      <td className="px-4 py-2">{k.claimedBy || '-'}</td>
                      <td className="px-4 py-2">
                        <button
                          onClick={async () => { await deleteAuthKey(k.id!); loadKeys(); }}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white text-xs font-semibold"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-2">Customer Management</h2>
        <div className="bg-[#232136] rounded-lg p-4 text-white/60">Customer management features coming soon...</div>
      </div>
    </div>
  );
};

export default AdminPanel; 