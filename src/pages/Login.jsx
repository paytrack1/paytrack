import React, { useState } from 'react';
import { ChevronRight, CheckCircle2, ShieldCheck, Zap, AlertCircle } from 'lucide-react';
import { useStore } from '../store/useStore';

const Login = () => {
  const { login, isAuthenticated } = useStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ email: '', businessName: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.email || !formData.businessName || !formData.password) {
      setError('All fields are required.');
      return;
    }

    if (formData.password.length < 4) {
      setError('Access PIN must be at least 4 characters.');
      return;
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      // Check if returning user exists in localStorage
      const savedAuth = localStorage.getItem('paytrack-auth');
      if (savedAuth) {
        const parsed = JSON.parse(savedAuth);
        const savedUser = parsed?.state?.user;

        if (savedUser) {
          // Returning user — verify credentials
          if (
            savedUser.email.toLowerCase() !== formData.email.toLowerCase()
          ) {
            setError('Incorrect email address. Please try again.');
            setLoading(false);
            return;
          }
          if (savedUser.password !== formData.password) {
            setError('Incorrect PIN. Please try again.');
            setLoading(false);
            return;
          }
        }
      }

      setTimeout(() => {
        login(formData.email, formData.businessName, formData.password);
        setLoading(false);
      }, 1000);

    } catch (err) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-white font-sans antialiased">

      {/* LEFT IMAGE - desktop only */}
      <div className="hidden md:block md:w-[55%] relative h-screen sticky top-0">
        <img
          src="/login.png"
          alt="Merchant"
          className="w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10" />
        {/* Overlay card on image */}
        <div className="absolute bottom-10 left-10 right-10">
          <div className="bg-[#1B4F9B]/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <p className="text-white font-black text-xl mb-1">Never lose a sale again.</p>
            <p className="text-white/80 text-sm">Record offline. Verify online. Protect your business.</p>
            <div className="flex gap-4 mt-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-green-400" />
                <span className="text-white/80 text-xs font-bold">Offline First</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-green-400" />
                <span className="text-white/80 text-xs font-bold">Interswitch Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap size={14} className="text-green-400" />
                <span className="text-white/80 text-xs font-bold">Real-time Sync</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE IMAGE */}
      <div className="md:hidden w-full h-48 relative overflow-hidden">
        <img src="/login.png" alt="Merchant" className="w-full h-full object-cover object-top" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white" />
      </div>

      {/* RIGHT FORM */}
      <div className="w-full md:w-[45%] flex flex-col px-8 py-10 md:px-12 lg:px-16 justify-center bg-white">

        {/* LOGO */}
        <div className="flex items-center gap-4 mb-10">
          <div className="bg-[#2F5FB3] p-2.5 rounded-2xl shadow-lg shadow-blue-100">
            <img src="/logo.png" alt="Logo" className="w-10 h-10 brightness-0 invert" />
          </div>
          <div>
            <p className="text-2xl font-[1000] text-[#0F172A] tracking-tighter uppercase leading-none">
              PayTrack <span className="text-[#2F5FB3]">Lite</span>
            </p>
            <p className="text-xs text-slate-400 font-bold">Offline-first POS System</p>
          </div>
        </div>

        {/* HEADING */}
        <div className="mb-8">
          <h1 className="text-4xl font-[1000] text-[#0F172A] tracking-tighter leading-tight mb-2">
            Welcome Back
          </h1>
          <p className="text-slate-500 font-bold">Sign in to access your store dashboard.</p>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 mb-4">
            <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
            <p className="text-red-600 text-sm font-bold">{error}</p>
          </div>
        )}

        {/* FORM */}
        <div className="w-full max-w-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => { setFormData({ ...formData, email: e.target.value }); setError(''); }}
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-200 transition-all font-bold text-slate-700"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Business Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Peter Store"
                value={formData.businessName}
                onChange={(e) => { setFormData({ ...formData, businessName: e.target.value }); setError(''); }}
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-200 transition-all font-bold text-slate-700"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Access PIN</label>
              <input
                type="password"
                required
                placeholder="••••"
                value={formData.password}
                onChange={(e) => { setFormData({ ...formData, password: e.target.value }); setError(''); }}
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-200 transition-all font-bold text-slate-700"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2F5FB3] text-white py-5 rounded-2xl font-black text-xl shadow-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-70"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Connecting...
                </span>
              ) : (
                <>Access Store <ChevronRight size={24} /></>
              )}
            </button>
          </form>

          <div className="flex gap-6 mt-10 pt-8 border-t border-slate-100">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500">
              <CheckCircle2 size={16} className="text-[#2F5FB3]" /> Sales
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500">
              <Zap size={16} className="text-[#2F5FB3]" /> Sync
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500">
              <ShieldCheck size={16} className="text-[#2F5FB3]" /> Secure
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
