// components/RacketCollection.tsx
"use client";

import { useState, useEffect } from "react";
import { RACKETS_DEFINITIONS } from "@/lib/rackets";
import { HandCoins, Loader2, MapPin } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function RacketCollection({ rackets }: { rackets: any[] }) {
    const [pendingCash, setPendingCash] = useState(0);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const calculatePending = () => {
            let total = 0;
            const now = new Date();
            rackets.forEach(r => {
                const def = RACKETS_DEFINITIONS[r.racketType as keyof typeof RACKETS_DEFINITIONS];
                if (def) {
                    const minsPassed = Math.floor((now.getTime() - new Date(r.lastCollectedAt).getTime()) / 60000);
                    if (minsPassed > 0) total += Math.floor(minsPassed * (def.hourlyYield / 60));
                }
            });
            setPendingCash(total);
        };

        calculatePending();
        const interval = setInterval(calculatePending, 60000); // Mise à jour toutes les minutes
        return () => clearInterval(interval);
    }, [rackets]);

    const handleCollect = async () => {
        if (pendingCash <= 0) return toast.error("Les enveloppes sont vides, revenez plus tard.");
        
        setLoading(true);
        try {
            const res = await fetch("/api/rackets/collect", { method: "POST" });
            if (res.ok) {
                const data = await res.json();
                toast.success(`+ ${data.amount.toLocaleString()} ₪ récupérés en liquide !`, { icon: '💰' });
                router.refresh(); // Rafraîchit la page pour tout mettre à jour
            } else {
                toast.error("Bavure lors du ramassage.");
            }
        } catch (e) {
            toast.error("Erreur réseau");
        } finally {
            setLoading(false);
        }
    };

    if (rackets.length === 0) return null; // Ne s'affiche pas si l'agent n'a aucun racket

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 mb-8 shadow-2xl relative overflow-hidden flex flex-col items-center text-center">
            <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-green-400"></div>
            
            <div className="flex items-center gap-2 mb-2 text-emerald-400">
                <MapPin size={18} />
                <h3 className="text-xs font-black uppercase tracking-widest">Contrôle de Territoire</h3>
            </div>
            
            <p className="text-3xl font-mono font-black text-white mb-1">
                {pendingCash > 0 ? `+ ${pendingCash.toLocaleString()} ₪` : "0 ₪"}
            </p>
            <p className="text-[10px] text-slate-500 uppercase font-bold mb-6">Argent sale en attente de récolte</p>

            <button 
                onClick={handleCollect} 
                disabled={loading || pendingCash <= 0}
                className="w-full sm:w-2/3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black py-4 rounded-2xl transition-all flex justify-center items-center gap-2 uppercase"
            >
                {loading ? <Loader2 className="animate-spin" /> : <HandCoins size={20} />}
                {pendingCash > 0 ? "Récolter les Enveloppes" : "Patience..."}
            </button>
        </div>
    );
}