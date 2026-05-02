import React, { useState } from 'react';

const Login = ({ onLogin }) => {
  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setError('');
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.email || !form.password) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      // Replace this with your real auth API call when ready
      // const res = await fetch(`${BACKEND_URL}/api/auth/login`, { ... })
      // For now — simulate login
      await new Promise((r) => setTimeout(r, 800));
      onLogin({ email: form.email });
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col justify-center px-6">
      {/* Logo */}
      <div className="mb-10 text-center">
        <div className="w-14 h-14 bg-[#185FA5] rounded-2xl flex items-center justify-center text-white font-black text-xl mx-auto mb-4">
          PT
        </div>
        <h1 className="text-2xl font-black text-[#0F172A]">Flowora</h1>
        <p className="text-[#94A3B8] text-sm font-medium mt-1">Sign in to your store</p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm flex flex-col gap-4">
        <div>
          <label className="text-[#0F172A] text-xs font-bold uppercase tracking-wide mb-1.5 block">
            Email
          </label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@store.com"
            className="w-full border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-[#0F172A] outline-none focus:border-[#185FA5] transition-colors"
          />
        </div>

        <div>
          <label className="text-[#0F172A] text-xs font-bold uppercase tracking-wide mb-1.5 block">
            Password
          </label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            className="w-full border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-[#0F172A] outline-none focus:border-[#185FA5] transition-colors"
          />
        </div>

        {/* Inline error */}
        {error && (
          <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-600 text-sm font-medium">⚠️ {error}</p>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-[#185FA5] text-white py-4 rounded-2xl font-bold disabled:opacity-60 active:scale-95 transition-all mt-1"
        >
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </div>

      {/* Footer */}
      <p className="text-center text-[#CBD5E1] text-[10px] font-bold uppercase tracking-widest mt-8">
        Flowora · Secure payments via Paystack
      </p>
    </div>
  );
};

export default Login;