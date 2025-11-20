
import React, { useState } from 'react';
import { CloudDrizzle, ArrowRight, Mail, Lock, User as UserIcon, Loader2 } from 'lucide-react';
import { User } from '../types';
import { authService } from '../services/authService';
import { tokenService } from '../services/tokenService';


interface AuthScreenProps {
  onLogin: (user: User) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Validation
      if (!email || !password || (!isLogin && !name)) {
        alert('Please fill in all required fields');
        return;
      }

      let token: string;

      if (isLogin) {
        // Login
        token = await authService.login({ email, password });
      } else {
        // Register
        token = await authService.register({
          username: name,
          email,
          password,
        });
      }

      // Store token in localStorage
      tokenService.setToken(token);

      // Build a simple user object for now (replace with /me endpoint later)
      const user: User = {
        id: email,
        name: isLogin ? email.split('@')[0] : name,
        email: email,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      };

      onLogin(user);
    } catch (error: any) {
      console.error('Authentication error:', error);
      const errorMsg = error.response?.data?.msg || 'Authentication failed';
      alert(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
        {/* Background Elements */}
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[128px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[128px] pointer-events-none" />

      <div className="w-full max-w-md z-10 animate-in fade-in zoom-in duration-300">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-zinc-900/50 rounded-2xl border border-zinc-800 mb-4 shadow-lg shadow-green-500/20">
             <CloudDrizzle className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">NanoCloud</h1>
          <p className="text-zinc-400 text-center">
            {isLogin ? 'Welcome back to your smart storage.' : 'Create your secure cloud space.'}
          </p>
        </div>

        <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
                <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-400 ml-1 uppercase tracking-wider">Full Name</label>
                    <div className="relative group">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-green-400 transition-colors" />
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all"
                            placeholder="John Doe"
                            required={!isLogin}
                        />
                    </div>
                </div>
            )}
            
            <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-400 ml-1 uppercase tracking-wider">Email Address</label>
                <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-green-400 transition-colors" />
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all"
                        placeholder="name@example.com"
                        required
                    />
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-400 ml-1 uppercase tracking-wider">Password</label>
                <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-green-400 transition-colors" />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all"
                        placeholder="••••••••"
                        required
                    />
                </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-500 text-black font-bold py-3 rounded-xl hover:bg-green-400 transition-all duration-200 flex items-center justify-center mt-6 disabled:opacity-70 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-zinc-800 text-center">
            <p className="text-zinc-400 text-sm">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => {
                    setIsLogin(!isLogin);
                    setEmail('');
                    setPassword('');
                    setName('');
                }}
                className="text-green-400 hover:text-green-300 font-medium transition-colors hover:underline"
              >
                {isLogin ? 'Sign up' : 'Log in'}
              </button>
            </p>
          </div>
        </div>
        
        <div className="mt-8 text-center">
            <p className="text-zinc-600 text-xs">
                By continuing, you agree to NanoCloud's Terms of Service and Privacy Policy.
            </p>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
