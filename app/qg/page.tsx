// app/qg/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Users, Shield, LogOut, Plus, Loader2, Landmark, Banknote } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function QGPage() {
    const [myBrigade, setMyBrigade] = useState<any>(null);
    const [availableBrigades, setAvailableBrigades] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [newBrigadeName, setNewBrigadeName] = useState("");
    const [donateAmount, setDonateAmount] = useState(""); // <-- NOUVEAU
    const router = useRouter();

    const fetchHQData = async () => {
        try {
            const res = await fetch("/api/brigades/me");
            const data = await res.json();
            if (res.ok) {
                setMyBrigade(data.brigade);
                setAvailableBrigades(data.availableBrigades || []);
            }
        } catch (error) {
            toast.error("Erreur de communication avec le central.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHQData();
    }, []);

    const handleAction = async (action: string, brigadeId?: string) => {
        if (action === "CREATE" && !newBrigadeName.trim()) return toast.error("Il faut un nom pour votre syndicat.");
        
        setActionLoading(action);
        try {
            const res = await fetch("/api/brigades/action", {
                method: "POST",
                body: JSON.stringify({ action, name: newBrigadeName, brigadeId }),
            });
            const data = await res.json();
            
            if (res.ok) {
                toast.success(action === "LEAVE" ? "Vous avez déserté." : "Opération réussie !");
                setNewBrigadeName("");
                fetchHQData();
                router.refresh();
            } else {
                toast.error(data.error);
            }
        } catch (e) {
            toast.error("Erreur réseau.");
        } finally {
            setActionLoading(null);
        }
    };

    // --- NOUVELLE FONCTION POUR LE VERSEMENT ---
    const handleDonate = async () => {
        const amount = parseInt(donateAmount);
        if (isNaN(amount) || amount <= 0) return toast.error("Montant invalide.");

        setActionLoading("DONATE");
        try {
            const res = await fetch("/api/brigades/donate", {
                method: "POST",
                body: JSON.stringify({ amount }),
            });
            const data = await res.json();

            if (res.ok) {
                toast.success(`+ ${amount} ₪ blanchis dans la caisse !`);
                setDonateAmount("");
                fetchHQData();
                router.refresh();
            } else {
                toast.error(data.error);
            }
        } catch (e) {
            toast.error("Erreur réseau.");
        } finally {
            setActionLoading(null);
        }
    };
    // -------------------------------------------

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Loader2 className="animate-spin text-indigo-500" size={40} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-6 pb-32">
            <header className="mb-8 text-center">
                <div className="flex items-center justify-center gap-2 mb-2 text-indigo-500">
                    <Shield size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Syndicats & Gangs</span>
                </div>
                <h1 className="text-4xl font-black italic tracking-tighter text-white">LE Q.G</h1>
            </header>

            {myBrigade ? (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-600 to-blue-400"></div>
                    
                    <div className="flex justify-between items-start mb-6 border-b border-slate-800 pb-4">
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1">Votre Équipe</p>
                            <h2 className="text-3xl font-black italic text-white">{myBrigade.name}</h2>
                        </div>
                        <div className="text-right flex flex-col items-end">
                            <Landmark className="text-emerald-500 mb-1" size={20} />
                            <p className="text-sm text-slate-500 font-bold uppercase">Caisse Noire</p>
                            <p className="text-xl font-mono font-black text-emerald-400">{myBrigade.bank} ₪</p>
                        </div>
                    </div>

                    <h3 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-wider flex items-center gap-2">
                        <Users size={16} /> Effectifs ({myBrigade.members.length})
                    </h3>
                    
                    <div className="space-y-3 mb-6">
                        {myBrigade.members.map((member: any) => (
                            <div key={member.id} className="flex justify-between items-center bg-slate-950 p-4 rounded-xl border border-slate-800">
                                <span className="font-bold text-slate-200">
                                    {member.name} {member.id === myBrigade.leaderId && "👑"}
                                </span>
                                <span className="text-xs font-mono text-slate-500">{member.walletBalance} ₪</span>
                            </div>
                        ))}
                    </div>

                    {/* --- NOUVELLE ZONE DE VERSEMENT --- */}
                    <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 mb-6 flex gap-2">
                        <div className="flex items-center pl-2 text-emerald-500">
                            <Banknote size={20} />
                        </div>
                        <input
                            type="number"
                            placeholder="Montant à blanchir..."
                            value={donateAmount}
                            onChange={(e) => setDonateAmount(e.target.value)}
                            className="flex-1 bg-transparent border-none px-2 py-2 text-sm focus:outline-none focus:ring-0 text-emerald-400 font-mono"
                            min="1"
                        />
                        <button
                            onClick={handleDonate}
                            disabled={!!actionLoading || !donateAmount}
                            className="bg-emerald-900/40 hover:bg-emerald-900/80 text-emerald-400 border border-emerald-900/50 px-4 rounded-xl font-bold transition-all flex items-center justify-center disabled:opacity-50 uppercase text-xs"
                        >
                            {actionLoading === "DONATE" ? <Loader2 className="animate-spin" size={16}/> : "Verser"}
                        </button>
                    </div>
                    {/* ---------------------------------- */}

                    <button 
                        onClick={() => handleAction("LEAVE")}
                        disabled={!!actionLoading}
                        className="w-full bg-red-900/40 hover:bg-red-900/60 text-red-400 border border-red-900/50 disabled:opacity-50 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all uppercase text-sm"
                    >
                        {actionLoading === "LEAVE" ? <Loader2 className="animate-spin" size={18}/> : <LogOut size={18} />}
                        Déserter la brigade
                    </button>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* ... Le reste du code reste identique (Créer / Rejoindre) ... */}
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                        <h2 className="text-lg font-black uppercase italic mb-2 text-white">Fonder un Syndicat</h2>
                        <p className="text-xs text-slate-500 mb-4">Créez votre propre équipe et recrutez des agents corrompus.</p>
                        
                        <div className="flex gap-2">
                            <input 
                                type="text"
                                placeholder="Nom du gang..."
                                value={newBrigadeName}
                                onChange={(e) => setNewBrigadeName(e.target.value)}
                                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
                                maxLength={20}
                            />
                            <button 
                                onClick={() => handleAction("CREATE")}
                                disabled={!!actionLoading || !newBrigadeName.trim()}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 rounded-xl font-bold transition-all flex items-center justify-center disabled:opacity-50"
                            >
                                {actionLoading === "CREATE" ? <Loader2 className="animate-spin" size={20}/> : <Plus size={20} />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-lg font-black uppercase italic mb-4 text-slate-400 border-b border-slate-800 pb-2">Brigades Actives</h2>
                        {availableBrigades.length === 0 ? (
                            <p className="text-sm text-slate-600 text-center py-8 italic">Aucun syndicat n'a été formé en ville.</p>
                        ) : (
                            <div className="grid gap-3">
                                {availableBrigades.map((brigade) => (
                                    <div key={brigade.id} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex justify-between items-center">
                                        <div>
                                            <h3 className="font-bold text-slate-200 text-lg">{brigade.name}</h3>
                                            <p className="text-xs text-slate-500">{brigade._count.members} Membre(s)</p>
                                        </div>
                                        <button 
                                            onClick={() => handleAction("JOIN", brigade.id)}
                                            disabled={!!actionLoading}
                                            className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all"
                                        >
                                            {actionLoading === "JOIN" ? <Loader2 className="animate-spin" size={16}/> : "Rejoindre"}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}