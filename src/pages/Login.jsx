import React, { useState } from 'react';
import { ChevronRight, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { useStore } from '../store/useStore';

const Login = () => {
  const { login } = useStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', businessName: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      login(formData.email, formData.businessName, formData.password);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-white font-sans antialiased">

      {/* LEFT — IMAGE */}
      <div className="hidden md:block md:w-[55%] relative h-screen sticky top-0">
        <img
          src="/login.png"
          alt="Merchant"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10" />
        <div className="absolute bottom-10 left-10 right-10">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <p className="text-white font-black text-xl mb-1">Never lose a sale again.</p>
            <p className="text-white/80 text-sm">Record offline. Verify online. Protect your business.</p>
          </div>
        </div>
      </div>

      {/* MOBILE IMAGE - shows on small screens */}
      <div className="md:hidden w-full h-52 relative overflow-hidden">
        <img
          src="/login.png"
          alt="Merchant"
          className="w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white" />
      </div>

      {/* RIGHT — FORM */}
      <div className="w-full md:w-[45%] flex flex-col px-8 py-10 md:px-12 lg:px-16 justify-center bg-white">

        <div className="flex items-center gap-4 mb-8">
          <div className="bg-[#2F5FB3] p-2.5 rounded-2xl shadow-lg shadow-blue-100">
            <img src="/logo.png" alt="Logo" className="w-10 h-10 brightness-0 invert" />
          </div>
          <span className="text-3xl font-[1000] text-[#0F172A] tracking-tighter uppercase leading-none">
            PayTrack <span className="text-[#2F5FB3]">Lite</span>
          </span>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-[1000] text-[#0F172A] tracking-tighter leading-[1.1] mb-2">
            Get Started
          </h1>
          <p className="text-lg text-slate-500 font-bold">Secure access to your business.</p>
        </div>

        <div className="w-full max-w-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 transition-all font-bold text-slate-700"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Business Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Peter Store"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 transition-all font-bold text-slate-700"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Access PIN</label>
              <input
                type="password"
                required
                placeholder="••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 transition-all font-bold text-slate-700"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2F5FB3] text-white py-5 rounded-2xl font-black text-xl shadow-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
            >
              {loading ? 'Connecting...' : 'Access Store'} <ChevronRight size={24} />
            </button>
          </form>

          <div className="flex gap-6 mt-10 pt-8 border-t border-slate-100">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 tracking-tight">
              <CheckCircle2 size={16} className="text-[#2F5FB3]" /> Sales
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 tracking-tight">
              <Zap size={16} className="text-[#2F5FB3]" /> Sync
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 tracking-tight">
              <ShieldCheck size={16} className="text-[#2F5FB3]" /> Secure
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
