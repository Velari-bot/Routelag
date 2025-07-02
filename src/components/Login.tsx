import React, { useState } from 'react';
import { loginUser, registerUser, loginWithAuthKey } from '../utils/firebase';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loginMode, setLoginMode] = useState<'account' | 'authkey'>('account');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authKey, setAuthKey] = useState('');
  const [authName, setAuthName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (loginMode === 'authkey') {
        const result = await loginWithAuthKey(authKey, authName || email || undefined);
        if (result.success) {
          localStorage.setItem('authKeyName', authName);
          onLogin();
        } else {
          setError(result.error || 'An error occurred');
        }
      } else if (isLogin) {
        // Login flow
        const result = await loginUser(email, password);
        if (result.success) {
          onLogin();
        } else {
          setError(result.error || 'An error occurred');
        }
      } else {
        // Registration flow
        const result = await registerUser(email, password);
        if (result.success) {
          setShowVerificationMessage(true);
          setMessage('Please check your email to verify your account. Once verified, you can log in.');
          setEmail('');
          setPassword('');
        } else {
          setError(result.error || 'An error occurred');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setMessage('');
    setShowVerificationMessage(false);
    setEmail('');
    setPassword('');
  };

  return (
    <div className="w-[540px] h-[680px] rounded-3xl bg-[#181622] p-10 flex flex-col items-center">
      {/* Window controls */}
      <div className="absolute top-4 right-8 flex items-center space-x-2">
        <button 
          onClick={() => window.electron.minimizeWindow()} 
          className="text-white/60 hover:text-white text-lg font-bold focus:outline-none"
          title="Minimize"
        >
          −
        </button>
        <button 
          onClick={() => window.close()} 
          className="text-white/60 hover:text-white text-xl font-bold focus:outline-none"
          title="Close"
        >
          ×
        </button>
      </div>
      {/* App Icon */}
      <div className="mb-6 flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#a084fa] to-[#6f4ad2] flex items-center justify-center mb-2 shadow-lg">
          <img src="/Lunary.png" alt="Lunary" className="w-14 h-14" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-1">Welcome!</h2>
        <p className="text-white/70 text-sm">
          {loginMode === 'authkey' ? 'Sign in with your Auth Key' : isLogin ? 'Sign in to your account' : 'Create your account'}
        </p>
      </div>
      {/* Login mode tabs */}
      <div className="flex w-full mb-6">
        <button
          className={`flex-1 py-2 rounded-l-xl font-semibold text-base transition-colors ${loginMode === 'account' ? 'bg-gradient-to-r from-[#a084fa] to-[#6f4ad2] text-white' : 'bg-[#232136] text-white/60'}`}
          onClick={() => { setLoginMode('account'); setError(''); }}
        >
          Account Login
        </button>
        <button
          className={`flex-1 py-2 rounded-r-xl font-semibold text-base transition-colors ${loginMode === 'authkey' ? 'bg-gradient-to-r from-[#a084fa] to-[#6f4ad2] text-white' : 'bg-[#232136] text-white/60'}`}
          onClick={() => { setLoginMode('authkey'); setError(''); }}
        >
          Auth Key Login
        </button>
      </div>
      {showVerificationMessage ? (
        <div className="w-full">
          <div className="bg-green-900/30 border border-green-700 text-green-300 px-4 py-3 rounded-xl text-center">
            <p className="font-medium mb-2">Verification Email Sent!</p>
            <p className="text-sm">Please check your email to verify your account. Once verified, you can log in.</p>
          </div>
          <button
            onClick={handleToggleMode}
            className="w-full mt-4 py-3 rounded-xl font-semibold text-lg text-white bg-gradient-to-r from-[#a084fa] to-[#6f4ad2] shadow-lg hover:from-[#b39dfa] hover:to-[#7e5ae2] transition"
          >
            Go to Login
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="w-full space-y-5">
          {loginMode === 'authkey' ? (
            <div className="relative">
              <input
                id="authkey"
                type="text"
                required
                value={authKey}
                onChange={(e) => setAuthKey(e.target.value)}
                className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#a084fa] focus:bg-white/20 transition pr-10"
                placeholder="Enter Auth Key"
                autoComplete="off"
              />
              <input
                id="authname"
                type="text"
                required
                value={authName}
                onChange={(e) => setAuthName(e.target.value)}
                className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 mt-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#a084fa] focus:bg-white/20 transition"
                placeholder="Your Name (for admin)"
                autoComplete="off"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M15.7 10.3a5 5 0 10-1.4 1.4l2.3 2.3a1 1 0 001.4-1.4l-2.3-2.3zm-5.7 1.7a3 3 0 110-6 3 3 0 010 6z" />
                </svg>
              </div>
            </div>
          ) : (
            <>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#a084fa] focus:bg-white/20 transition pr-10"
                  placeholder="Email"
                  autoComplete="email"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#a084fa] focus:bg-white/20 transition pr-10"
                  placeholder="Password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/70 focus:outline-none"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              </div>
            </>
          )}
          {error && (
            <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-2 rounded-xl text-center text-sm">
              {error}
            </div>
          )}
          {message && !showVerificationMessage && (
            <div className="bg-green-900/30 border border-green-700 text-green-300 px-4 py-2 rounded-xl text-center text-sm">
              {message}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-lg text-white bg-gradient-to-r from-[#a084fa] to-[#6f4ad2] shadow-lg hover:from-[#b39dfa] hover:to-[#7e5ae2] transition flex items-center justify-center"
            style={{boxShadow: '0 4px 16px 0 rgba(160, 132, 250, 0.25)'}}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              loginMode === 'authkey' ? 'Log in with Auth Key' : isLogin ? 'Log in' : 'Sign up'
            )}
          </button>
        </form>
      )}
      {!showVerificationMessage && loginMode === 'account' && (
        <button
          onClick={handleToggleMode}
          className="mt-6 text-white/70 hover:text-white text-sm underline-offset-2 underline"
        >
          {isLogin ? 'Register' : 'Back to Login'}
        </button>
      )}
    </div>
  );
};

export default Login; 