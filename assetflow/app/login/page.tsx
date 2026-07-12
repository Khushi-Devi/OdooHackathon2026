'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if already logged in
    fetch('/api/auth/me')
      .then((res) => {
        if (res.ok) {
          router.push('/');
        }
      })
      .catch(() => {});
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const url = isLogin ? '/api/auth/login' : '/api/auth/register';
    const body = isLogin ? { email, password } : { name, email, password };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      router.push('/');
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-8">
      <main className="w-full max-w-6xl h-full min-h-[700px] flex flex-col md:flex-row overflow-hidden bg-white shadow-2xl rounded-2xl border border-slate-200">
        
        {/* Left Side: Branding */}
        <section className="relative hidden md:flex flex-1 flex-col justify-between p-12 bg-blue-600 overflow-hidden">
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-blue-600 font-extrabold">
              <span className="material-symbols-outlined font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>
                account_balance_wallet
              </span>
            </div>
            <h1 className="text-xl font-black text-white tracking-tight">AssetFlow</h1>
          </div>

          <div className="relative z-10 max-w-md">
            <h2 className="text-3xl font-bold text-white mb-6 leading-tight">
              Enterprise Asset & Resource Management.
            </h2>
            <p className="text-blue-100 opacity-90 mb-8 text-sm">
              Centralize your global asset inventory, optimize resource allocation, and drive operational excellence with the industry-leading platform.
            </p>

            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/10 border border-white/20 text-white">
                <span className="material-symbols-outlined text-blue-200">check_circle</span>
                <span className="text-xs font-semibold">Real-time Global Inventory Tracking</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/10 border border-white/20 text-white">
                <span className="material-symbols-outlined text-blue-200">check_circle</span>
                <span className="text-xs font-semibold">Predictive Maintenance Workflows</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/10 border border-white/20 text-white">
                <span className="material-symbols-outlined text-blue-200">check_circle</span>
                <span className="text-xs font-semibold">Enterprise-Grade Compliance Auditing</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between text-blue-200 opacity-60 text-xs">
            <span>© 2026 AssetFlow Enterprise Inc.</span>
            <div className="flex gap-4">
              <span className="material-symbols-outlined scale-75">security</span>
              <span className="material-symbols-outlined scale-75">cloud_done</span>
            </div>
          </div>

          <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 w-[500px] h-[500px] bg-blue-500/20 blur-[120px] rounded-full"></div>
        </section>

        {/* Right Side: Auth Form */}
        <section className="flex-1 flex flex-col justify-center items-center p-8 md:p-16 bg-white relative">
          <div className="w-full max-w-md">
            
            {/* Mobile Branding */}
            <div className="md:hidden flex items-center gap-2 mb-10">
              <span className="material-symbols-outlined text-blue-600 text-3xl">account_balance_wallet</span>
              <span className="text-2xl font-black text-slate-800">AssetFlow</span>
            </div>

            <div className="mb-10">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                {isLogin ? 'Welcome back' : 'Create an Account'}
              </h3>
              <p className="text-sm text-slate-500">
                {isLogin
                  ? 'Enter your credentials to access the enterprise dashboard.'
                  : 'Get started by creating a new account on our platform.'}
              </p>
            </div>

            {/* Auth Tabs */}
            <div className="flex p-1 bg-slate-100 rounded-lg mb-8">
              <button
                onClick={() => { setIsLogin(true); setError(''); }}
                className={`flex-1 py-2 px-4 rounded-md text-xs font-semibold transition-all ${
                  isLogin ? 'bg-white shadow-sm text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setIsLogin(false); setError(''); }}
                className={`flex-1 py-2 px-4 rounded-md text-xs font-semibold transition-all ${
                  !isLogin ? 'bg-white shadow-sm text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Create Account
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs font-semibold rounded-lg">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <div className="floating-label-group">
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-4 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none text-sm text-slate-800 transition-all"
                    placeholder=" "
                    required
                  />
                  <label htmlFor="name">Full Name</label>
                </div>
              )}

              <div className="floating-label-group">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-4 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none text-sm text-slate-800 transition-all"
                  placeholder=" "
                  required
                />
                <label htmlFor="email">Corporate Email Address</label>
              </div>

              <div className="floating-label-group">
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-4 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none text-sm text-slate-800 transition-all"
                  placeholder=" "
                  required
                />
                <label htmlFor="password">Password</label>
              </div>

              {isLogin && (
                <div className="flex justify-end text-xs">
                  <a href="#" className="text-blue-600 font-semibold hover:underline">
                    Forgot password?
                  </a>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 disabled:opacity-50"
              >
                {loading && (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {isLogin ? 'Sign In to AssetFlow' : 'Create AssetFlow Account'}
                <span className="material-symbols-outlined text-xl">arrow_forward</span>
              </button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-4 bg-white text-slate-500 font-medium">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => router.push('/')}
                className="flex items-center justify-center gap-3 px-4 py-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all active:scale-[0.98] cursor-pointer"
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  <svg className="w-full h-full" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                  </svg>
                </div>
                <span className="text-xs font-semibold text-slate-700">Google SSO</span>
              </button>
              <button
                type="button"
                onClick={() => router.push('/')}
                className="flex items-center justify-center gap-3 px-4 py-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all active:scale-[0.98] cursor-pointer"
              >
                <div className="w-5 h-5 flex items-center justify-center text-slate-800">
                  <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z"></path>
                  </svg>
                </div>
                <span className="text-xs font-semibold text-slate-700">GitHub</span>
              </button>
            </div>

            <p className="mt-12 text-center text-xs text-slate-400 font-medium">
              By continuing, you agree to our{' '}
              <a className="text-slate-800 font-bold hover:underline" href="#">
                Terms of Service
              </a>{' '}
              and{' '}
              <a className="text-slate-800 font-bold hover:underline" href="#">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
