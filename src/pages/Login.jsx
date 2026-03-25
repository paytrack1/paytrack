import React, { useState } from 'react';
import { ChevronRight, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { useStore } from '../store/useStore'; // Assuming this is your Zustand/Context store

const Login = () => {
  const { login } = useStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    businessName: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. TRY ONLINE LOGIN (If backend is ready)
      // const response = await fetch('https://api.paytracklite.com/v1/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });
      // const data = await response.json();

      // 2. OFFLINE BYPASS (Works now while backend is not connected)
      console.log("Login Attempt:", formData);
      
      // Simulate a small delay for the backend feel
      setTimeout(() => {
        // This saves the data to your App State and moves to Dashboard
        login(formData.email, formData.businessName, formData.password);
        setLoading(false);
      }, 1000);

    } catch (error) {
      console.error("Login Error:", error);
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col md:flex-row bg-white overflow-hidden font-sans antialiased">
      
      {/* LEFT SIDE: THE IMAGE (60% Width) */}
      <div className="hidden md:block md:w-[60%] relative h-full bg-slate-100">
        <img 
          src="/login.png" 
          alt="Merchant" 
          /* object-top ensures her head is never cut off */
          className="w-full h-full object-cover object-top" 
        />
        {/* Subtle overlay to blend into the white form */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/5"></div>
      </div>

      {/* RIGHT SIDE: THE FORM (40% Width) */}
      <div className="w-full md:w-[40%] flex flex-col p-8 md:p-12 lg:p-16 justify-center bg-white relative">
        
        {/* LOGO & BRAND */}
        <div className="flex items-center gap-4 mb-10">
          <div className="bg-[#2F5FB3] p-2.5 rounded-2xl shadow-lg shadow-blue-100">
             <img src="/logo.png" alt="Logo" className="w-10 h-10 brightness-0 invert" />
          </div>
          <span className="text-3xl font-[1000] text-[#0F172A] tracking-tighter uppercase leading-none">
            PayTrack <span className="text-[#2F5FB3]">Lite</span>
          </span>
        </div>

        {/* TEXT HEADERS */}
        <div className="mb-10">
          <h1 className="text-5xl font-[1000] text-[#0F172A] tracking-tighter leading-[1.1] mb-2">
            Get Started
          </h1>
          <p className="text-lg text-slate-500 font-bold">
            Secure access to your business.
          </p>
        </div>

        {/* FORM AREA */}
        <div className="w-full max-w-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Email Address</label>
              <input 
                type="email" 
                required
                placeholder="ebube7440@gmail.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 transition-all font-bold text-slate-700"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Business Name</label>
              <input 
                type="text" 
                required
                placeholder="Adeola Store"
                value={formData.businessName}
                onChange={(e) => setFormData({...formData, businessName: e.target.value})}
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
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 transition-all font-bold text-slate-700"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#2F5FB3] text-white py-5 rounded-2xl font-black text-xl shadow-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
            >
              {loading ? "Connecting..." : "Access Store"} <ChevronRight size={24} />
            </button>
          </form>

          {/* STATUS ICONS - Bottom of the form context */}
          <div className="flex gap-6 mt-12 pt-8 border-t border-slate-100">
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