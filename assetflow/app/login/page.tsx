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
    fetch('/api/auth/me')
      .then((res) => {
        if (res.ok) router.push('/');
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
      if (!res.ok) throw new Error(data.error || 'Authentication failed');

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
              Centralize your global asset inventory, optimize resource allocation, and drive operational excellence.
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

        <section className="flex-1 flex flex-col justify-center items-center p-8 md:p-16 bg-white relative">
          <div className="w-full max-w-md">
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

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 disabled:opacity-50"
              >
                {loading && (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {isLogin ? 'Sign In to AssetFlow' : 'Create AssetFlow Account'}
                <span className="material-symbols-outlined text-xl">arrow_forward</span>
              </button>
            </form>

            <p className="mt-12 text-center text-xs text-slate-400 font-medium">
              By continuing, you agree to our{' '}
              <a className="text-slate-800 font-bold hover:underline" href="#">Terms of Service</a>{' '}
              and{' '}
              <a className="text-slate-800 font-bold hover:underline" href="#">Privacy Policy</a>.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}