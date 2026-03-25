import React, { useState } from 'react';
import { X, Save, CreditCard, Smartphone, Banknote, CheckCircle, AlertTriangle } from 'lucide-react';
import { useStore } from '../store/useStore';

const NewSale = ({ onBack }) => {
  const { addSale } = useStore();
  
  const [itemName, setItemName] = useState('');
  const [total, setTotal] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [reference, setReference] = useState('');
  const [isDraft, setIsDraft] = useState(false);

  // Validation Logic
  const isInvalid = (!total || total <= 0) || (paymentMethod !== 'cash' && !reference);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    
    // If the button is tapped but invalid, we show why
    if (isInvalid) {
      alert("Please enter an amount. For Transfer/POS, a Reference ID is required.");
      return;
    }

    // Try to save
    try {
      addSale({
        itemName: itemName || "General Sale",
        total: parseFloat(total),
        paymentMethod,
        reference: paymentMethod === 'cash' ? null : reference,
        status: isDraft ? 'draft' : 'completed',
      });
      
      // SUCCESS: Go back to dashboard
      onBack(); 
    } catch (err) {
      console.error("Sale Error:", err);
      alert("Store Error: Could not save sale.");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#F8FAFC] z-[100] relative">
      {/* Header */}
      <div className="bg-white p-6 flex justify-between items-center border-b border-slate-100">
        <div>
          <h2 className="text-xl font-black text-[#0F172A]">New Transaction</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Adeola Store Ledger</p>
        </div>
        <button onClick={onBack} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-1 overflow-y-auto pb-32">
        {/* ITEM NAME */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Items Sold</label>
          <input 
            type="text"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            className="w-full p-4 rounded-2xl border border-slate-200 focus:border-[#2F5FB3] outline-none font-bold"
            placeholder="e.g. 2 Loaves of Bread"
          />
        </div>

        {/* AMOUNT */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Total Amount (₦)</label>
          <input 
            type="number" 
            required
            value={total}
            onChange={(e) => setTotal(e.target.value)}
            className="w-full p-4 text-3xl font-black rounded-2xl border border-slate-200 focus:border-[#2F5FB3] outline-none"
            placeholder="0.00"
          />
        </div>

        {/* PAYMENT METHODS */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Payment Method</label>
          <div className="grid grid-cols-3 gap-3">
            {['cash', 'transfer', 'pos'].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setPaymentMethod(m)}
                className={`py-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                  paymentMethod === m ? 'border-[#2F5FB3] bg-blue-50 text-[#2F5FB3]' : 'border-transparent bg-white text-slate-400'
                }`}
              >
                {m === 'cash' && <Banknote size={24} />}
                {m === 'transfer' && <Smartphone size={24} />}
                {m === 'pos' && <CreditCard size={24} />}
                <span className="text-[10px] font-black uppercase">{m}</span>
              </button>
            ))}
          </div>
        </div>

        {/* REFERENCE FIELD */}
        {paymentMethod !== 'cash' && (
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-red-500">Reference / Session ID (Required)</label>
            <input 
              required
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full p-4 rounded-2xl border-2 border-red-50 focus:border-[#2F5FB3] outline-none font-mono"
              placeholder="Enter RRN or ID..."
            />
          </div>
        )}
      </form>

      {/* ACTION BUTTON - INSIDE DIV FOR BETTER TAPPING */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-slate-100 z-50">
        <button 
          type="button"
          onClick={handleSubmit}
          className={`w-full py-5 rounded-[2rem] font-black text-white shadow-xl transition-all flex items-center justify-center gap-2 
            ${isInvalid ? 'bg-slate-300' : 'bg-[#2F5FB3] active:scale-95'}`}
        >
          <CheckCircle size={20} />
          {isDraft ? 'SAVE DRAFT' : 'COMPLETE SALE'}
        </button>
      </div>
    </div>
  );
};

export default NewSale;