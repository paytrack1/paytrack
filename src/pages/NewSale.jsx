import React, { useState } from 'react';
import { db } from '../db/dexie';
import { v4 as uuidv4 } from 'uuid';
import SaleItemRow from '../components/SaleItemRow';

const NewSale = ({ onBack }) => {
  const [items, setItems] = useState([{ id: Date.now(), name: '', qty: 1, price: 0 }]);

  const calculateTotal = () => items.reduce((sum, item) => sum + (item.qty * item.price), 0);

  const addItem = () => {
    setItems([...items, { id: Date.now(), name: '', qty: 1, price: 0 }]);
  };

  const updateItem = (id, updatedItem) => {
    setItems(items.map(item => item.id === id ? updatedItem : item));
  };

  const handleSaveSale = async () => {
    const total = calculateTotal();
    if (total === 0) return alert("Please add items first!");

    const newSale = {
      id: uuidv4(),
      items: items,
      total: total,
      createdAt: new Date().toISOString(),
      synced: 0 // 0 = Pending (Offline first!)
    };

    await db.sales.add(newSale);
    onBack(); // Go back to Home
  };

  return (
    <div className="bg-[#F5F7FA] min-h-screen pb-32">
      {/* Header */}
      <div className="p-6 bg-white flex items-center gap-4 border-b border-[#E2E8F0]">
        <button onClick={onBack} className="text-2xl">←</button>
        <h1 className="text-lg font-black text-[#0F172A]">New Sale</h1>
      </div>

      {/* Summary Banner */}
      <div className="bg-[#2F5FB3] p-6 text-white flex justify-between items-center">
        <div>
          <p className="text-blue-200 text-xs font-bold uppercase">Order Total</p>
          <h2 className="text-3xl font-black">₦{calculateTotal().toLocaleString()}</h2>
        </div>
        <div className="bg-white/20 px-4 py-2 rounded-xl text-sm font-bold">
          {items.length} Items
        </div>
      </div>

      {/* Items List */}
      <div className="p-6">
        {items.map((item) => (
          <SaleItemRow 
            key={item.id} 
            item={item} 
            onUpdate={(val) => updateItem(item.id, val)} 
            onRemove={() => setItems(items.filter(i => i.id !== item.id))}
          />
        ))}

        <button 
          onClick={addItem}
          className="w-full py-4 border-2 border-dashed border-[#CBD5E1] rounded-2xl text-[#64748B] font-bold mt-2"
        >
          + Add Another Item
        </button>
      </div>

      {/* Bottom Save Button */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-[#E2E8F0]">
        <button 
          onClick={handleSaveSale}
          className="w-full bg-[#2F5FB3] text-white py-4 rounded-2xl font-bold shadow-lg"
        >
          Save Sale — ₦{calculateTotal().toLocaleString()}
        </button>
        <p className="text-center text-[10px] text-[#94A3B8] mt-2 font-bold uppercase tracking-widest">
          Offline will sync automatically
        </p>
      </div>
    </div>
  );
};

export default NewSale;