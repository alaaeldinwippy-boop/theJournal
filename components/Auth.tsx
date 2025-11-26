import React, { useState } from 'react';
import { login, register } from '../services/auth';
import { User } from '../types';
import { Book, Loader2 } from 'lucide-react';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        const user = await login(email, password, rememberMe);
        onLogin(user);
      } else {
        if (!name) throw new Error('Name is required');
        const user = await register(email, password, name);
        onLogin(user);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-custom-main flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-900/20 mb-4">
            <Book size={24} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">The Journal</h1>
          <p className="text-slate-400">Your professional trading companion</p>
        </div>

        <div className="bg-custom-panel border border-slate-800 rounded-2xl p-8 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6">
            {isLogin ? 'Sign in to your account' : 'Create a new account'}
          </h2>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm p-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-custom-main border border-slate-800 rounded-lg px-4 py-3 text-slate-200 focus:border-blue-500 outline-none transition-colors"
                  placeholder="Enter your name"
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-custom-main border border-slate-800 rounded-lg px-4 py-3 text-slate-200 focus:border-blue-500 outline-none transition-colors"
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-custom-main border border-slate-800 rounded-lg px-4 py-3 text-slate-200 focus:border-blue-500 outline-none transition-colors"
                placeholder="Enter your password"
                required
              />
            </div>

            {isLogin && (
              <div className="flex items-center gap-2 mt-2">
                <input 
                  type="checkbox" 
                  id="remember" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-custom-main text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="remember" className="text-sm text-slate-400 select-none cursor-pointer">Stay signed in</label>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-lg shadow-lg shadow-blue-900/30 transition-all hover:translate-y-[-1px] mt-6 flex justify-center items-center gap-2"
            >
              {isLoading && <Loader2 size={18} className="animate-spin" />}
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800 text-center">
            <p className="text-slate-400 text-sm">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="text-blue-500 hover:text-blue-400 font-bold transition-colors"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;