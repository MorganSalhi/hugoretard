// app/shop/page.tsx
"use client";

import { useState } from "react";
import { SHOP_ITEMS, ItemType } from "@/lib/items";
import { RACKETS_DEFINITIONS } from "@/lib/rackets";
import { ShoppingBag, Loader2, MapPin } from "lucide-react";
import * as Icons from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function ShopPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  // Achat d'un objet normal
  const buyItem = async (itemType: ItemType) => {
    setLoading(itemType);
    const res = await fetch("/api/shop/buy", {
      method: "POST",
      body: JSON.stringify({ itemType }),
    });

    if (res.ok) {
      toast.success("Équipement ajouté à votre arsenal !");
      router.refresh();
    } else {
      const err = await res.json();
      toast.error(err.error);
    }
    setLoading(null);
  };

  // Achat d'un territoire
  const buyRacket = async (racketId: string) => {
    setLoading(racketId);
    const res = await fetch("/api/rackets/buy", {
      method: "POST",
      body: JSON.stringify({ racketId }),
    });

    if (res.ok) {
      toast.success("Territoire sous votre contrôle ! L'argent rentre.");
      router.refresh();
    } else {
      const err = await res.json();
      toast.error(err.error);
    }
    setLoading(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 pb-32">
      <header className="mb-10">
        <div className="flex items-center gap-2 mb-2 text-indigo-500">
          <ShoppingBag size={16} />
          <span className="text-[10px] font-black uppercase tracking-widest">Marché Noir</span>
        </div>
        <h1 className="text-4xl font-black italic tracking-tighter">LE BAZAR</h1>
        <p className="text-slate-500 text-sm">Équipez-vous ou placez votre argent sale.</p>
      </header>

      {/* SECTION 1 : LES TERRITOIRES (RACKET) */}
      <h2 className="text-xl font-black uppercase italic mb-4 flex items-center gap-2 text-emerald-500 border-b border-slate-800 pb-2">
        <MapPin size={20} /> Immobilier & Racket
      </h2>
      <div className="grid gap-6 mb-12">
        {Object.values(RACKETS_DEFINITIONS).map((racket) => {
          const IconComponent = (Icons as any)[racket.icon] || Icons.Map;
          return (
            <div key={racket.id} className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 bg-emerald-600/10 rounded-bl-2xl border-b border-l border-emerald-500/30">
                <p className="text-xs font-mono font-bold text-emerald-400">+{racket.hourlyYield} ₪ / h</p>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className={`p-4 rounded-2xl bg-slate-950 border border-slate-800 ${racket.color}`}>
                  <IconComponent size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold leading-tight">{racket.name}</h3>
                  <p className="text-[10px] text-slate-500 uppercase font-black">{racket.cost} ₪</p>
                </div>
              </div>

              <p className="text-sm text-slate-400 mb-6 italic">"{racket.description}"</p>

              <button
                onClick={() => buyRacket(racket.id)}
                disabled={!!loading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all"
              >
                {loading === racket.id ? <Loader2 className="animate-spin" /> : "PRENDRE LE CONTRÔLE"}
              </button>
            </div>
          );
        })}
      </div>

{/* SECTION 2 : L'ARSENAL (OBJETS LÉGAUX) */}
      <h2 className="text-xl font-black uppercase italic mb-4 flex items-center gap-2 text-indigo-500 border-b border-slate-800 pb-2">
        <Icons.Shield size={20} /> Équipement Tactique
      </h2>
      <div className="grid gap-6 mb-12">
        {Object.values(SHOP_ITEMS)
          .filter(item => ["VEST", "MAGNIFIER", "WARRANT"].includes(item.id))
          .map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.id} className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div className={`p-4 rounded-2xl bg-slate-950 border border-slate-800 ${item.color}`}>
                  <Icon size={24} />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-mono font-black">{item.price} ₪</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-bold mb-1">{item.name}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{item.description}</p>
              </div>

              <button 
                onClick={() => buyItem(item.id as ItemType)}
                disabled={!!loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all"
              >
                {loading === item.id ? <Loader2 className="animate-spin" /> : "ACQUÉRIR"}
              </button>
            </div>
          );
        })}
      </div>

      {/* SECTION 3 : LE MARCHÉ NOIR (COUPS BAS) */}
      <h2 className="text-xl font-black uppercase italic mb-4 flex items-center gap-2 text-red-500 border-b border-slate-800 pb-2">
        <Icons.Skull size={20} /> Marché Noir (Coups Bas)
      </h2>
      <div className="grid gap-6">
        {Object.values(SHOP_ITEMS)
          .filter(item => ["IGPN_LETTER", "SUGAR"].includes(item.id))
          .map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.id} className="bg-slate-900/40 border border-red-900/30 rounded-3xl p-6 flex flex-col gap-4 relative overflow-hidden">
              <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-red-600 to-red-900 left-0"></div>
              <div className="flex justify-between items-start">
                <div className={`p-4 rounded-2xl bg-slate-950 border border-slate-800 ${item.color}`}>
                  <Icon size={24} />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-mono font-black text-red-400">{item.price} ₪</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-bold mb-1">{item.name}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{item.description}</p>
              </div>

              <button 
                onClick={() => buyItem(item.id as ItemType)}
                disabled={!!loading}
                className="w-full bg-red-900/80 hover:bg-red-800 text-red-100 disabled:opacity-50 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all"
              >
                {loading === item.id ? <Loader2 className="animate-spin" /> : "ACHETER SOUS LE MANTEAU"}
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
}