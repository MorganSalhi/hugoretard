"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
    Clock, 
    Coins, 
    TrendingUp, 
    Loader2, 
    ShieldAlert, 
    Shield, 
    Search, 
    Gavel,
    Flame,
    Radio,
    Siren,
    Coffee
} from "lucide-react";
import { BetSchema } from "@/lib/validations";
import { getPoliceRank } from "@/lib/ranks";
import toast from "react-hot-toast";

// Configuration visuelle des objets alignée sur le nouveau thème "Bavure"
const ITEM_ASSETS: Record<string, { icon: any, color: string, label: string }> = {
    VEST: { icon: Shield, color: "text-blue-400", label: "Bouclier CRS" },
    MAGNIFIER: { icon: Radio, color: "text-amber-400", label: "Radar" },
    WARRANT: { icon: Gavel, color: "text-red-500", label: "Abus de Pouvoir" },
};

export default function LobbyDeParis() {
    const [course, setCourse] = useState<any>(null);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [betting, setBetting] = useState(false);
    const [selectedItem, setSelectedItem] = useState<string | null>(null);
    const [activities, setActivities] = useState([]);

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: zodResolver(BetSchema),
    });

    useEffect(() => {
        async function initLobby() {
            try {
                const [courseRes, betRes, actRes] = await Promise.all([
                    fetch("/api/courses/live"),
                    fetch("/api/bets"),
                    fetch("/api/activity")
                ]);

                if (courseRes.ok) setCourse(await courseRes.json());
                const betData = await betRes.json();
                if (betData.user) setUser(betData.user);
                if (actRes.ok) setActivities(await actRes.json());
            } catch (e) {
                console.error("Erreur de transmission radio");
            } finally {
                setLoading(false);
            }
        }
        initLobby();
    }, []);

    const onSubmit = async (data: any) => {
        if (!course) return;
        setBetting(true);
        try {
            const res = await fetch("/api/bets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    ...data, 
                    courseId: course.id,
                    appliedItem: selectedItem 
                }),
            });

            const result = await res.json();

            if (res.ok) {
                toast.success(`Procès-verbal enregistré ! Fond de saisie : -${data.amount} ₪`, {
                    style: { background: '#1e293b', color: '#fff', border: '1px solid #3b82f6' },
                    icon: '🚓'
                });

                setUser((prev: any) => ({ 
                    ...prev, 
                    walletBalance: result.newBalance,
                }));
                setSelectedItem(null);
                reset();
            } else {
                toast.error(result.error || "Bavure lors du dépôt", {
                    style: { background: '#1e293b', color: '#fff' }
                });
            }
        } catch (error) {
            toast.error("Standard de police injoignable", {
                style: { background: '#1e293b', color: '#fff' }
            });
        } finally {
            setBetting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <Loader2 className="animate-spin text-blue-500" size={48} />
        </div>
    );

    const currentRank = user ? getPoliceRank(user.walletBalance) : getPoliceRank(0);
    const RankIcon = currentRank.icon;

    const availableItems = user?.items?.filter((i: any) => i.quantity > 0) || [];
    const hasMagnifier = availableItems.some((i: any) => i.itemType === "MAGNIFIER");

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-4 pb-24 font-sans">
            <header className="mb-8 mt-4 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-blue-500 uppercase italic flex items-center gap-2">
                        B.A.R.H. <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded italic not-italic">LIVE</span>
                    </h1>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">Brigade Anti-Retard d'Hugo • Unité de Bavure</p>
                </div>
                <Siren className="text-blue-600 animate-pulse" size={32} />
            </header>

            {/* État Civil de l'Agent */}
            <div className="bg-slate-900 border-b-4 border-blue-600 rounded-2xl p-5 mb-6 flex justify-between items-center shadow-2xl relative overflow-hidden">
                {user?.currentStreak >= 3 && (
                    <div className="absolute -right-4 -top-4 opacity-[0.05] rotate-12">
                        <Flame size={120} className="text-orange-500" />
                    </div>
                )}

                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                        <Coins size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Fond de Saisie</p>
                        <p className="text-xl font-mono font-bold text-white">
                            {user?.walletBalance?.toLocaleString() || "0"} ₪
                        </p>
                    </div>
                </div>

                <div className="flex flex-col items-center px-4 border-x border-slate-800/50">
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Série</p>
                    <div className="flex items-center gap-1">
                        <span className={`text-lg font-black font-mono ${user?.currentStreak > 0 ? 'text-orange-500' : 'text-slate-700'}`}>
                            {user?.currentStreak || 0}
                        </span>
                        <Flame 
                            size={18} 
                            className={`${user?.currentStreak >= 5 ? 'text-orange-500 animate-bounce' : 'text-slate-800'}`} 
                        />
                    </div>
                </div>

                <div className="text-right">
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Échelon</p>
                    <div className={`flex items-center gap-1 justify-end font-black italic text-[10px] uppercase ${currentRank.color}`}>
                        <span>{currentRank.label}</span>
                    </div>
                </div>
            </div>

            {/* Alerte Radio de Terrain */}
            {course ? (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden shadow-2xl">
                    {/* Gyrophare de fond */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-white to-red-600 opacity-50"></div>
                    
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2 text-red-500">
                            <Siren size={14} className="animate-ping" />
                            <span className="text-[10px] font-black uppercase tracking-tighter">Bavure Imminente : Hugo est en mouvement</span>
                        </div>

                        <h2 className="text-2xl font-black uppercase italic leading-tight mb-1">{course.subject}</h2>
                        <p className="text-slate-400 text-xs mb-6 italic">Cible repérée avec {course.professor} • Prévu à {new Date(course.scheduledStartTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>

                        {course.averageEstimate && hasMagnifier ? (
                            <div className="bg-blue-500/10 border-l-4 border-blue-500 p-4 mb-6 flex items-center gap-4 animate-pulse">
                                <Radio className="text-blue-400" size={20} />
                                <div>
                                    <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Renseignement Radar</p>
                                    <p className="text-sm font-bold text-blue-100 italic">Moyenne de la patrouille : <span className="font-mono text-lg underline decoration-blue-500">{course.averageEstimate}</span></p>
                                </div>
                            </div>
                        ) : null}

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Point de passage (HH:mm)</label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                        <input {...register("time")} type="text" placeholder="08:45" className="w-full bg-slate-950 border border-slate-800 rounded-xl py-4 pl-10 pr-4 font-mono text-xl focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:opacity-20" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Dépôt du Bakchich (₪)</label>
                                    <div className="relative">
                                        <Coins className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                        <input {...register("amount")} type="number" placeholder="500" className="w-full bg-slate-950 border border-slate-800 rounded-xl py-4 pl-10 pr-4 font-mono text-xl focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:opacity-20" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest italic flex items-center gap-1">
                                    <Coffee size={10} /> Équipement de patrouille
                                </label>
                                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                                    {availableItems.length > 0 ? (
                                        availableItems.map((item: any) => {
                                            const asset = ITEM_ASSETS[item.itemType];
                                            const Icon = asset.icon;
                                            const isSelected = selectedItem === item.itemType;

                                            return (
                                                <button
                                                    key={item.id}
                                                    type="button"
                                                    onClick={() => setSelectedItem(isSelected ? null : item.itemType)}
                                                    className={`flex flex-col items-center gap-1 min-w-[90px] p-3 rounded-2xl border-2 transition-all ${
                                                        isSelected 
                                                        ? "bg-blue-600/20 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]" 
                                                        : "bg-slate-950/50 border-slate-800 opacity-60"
                                                    }`}
                                                >
                                                    <Icon size={18} className={asset.color} />
                                                    <span className="text-[8px] font-black uppercase">{asset.label}</span>
                                                    <span className="text-[8px] font-mono">STOCK: {item.quantity}</span>
                                                </button>
                                            );
                                        })
                                    ) : (
                                        <div className="w-full py-3 px-4 rounded-xl bg-slate-950/30 border border-dashed border-slate-800 text-center opacity-30">
                                            <p className="text-[9px] font-bold uppercase italic">Arsenal vide • Passez au shop</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button disabled={betting} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 uppercase tracking-tighter transition-all shadow-xl shadow-blue-900/20 group">
                                {betting ? <Loader2 className="animate-spin" /> : <ShieldAlert size={20} className="group-hover:rotate-12 transition-transform" />}
                                DÉPLOYER LA PATROUILLE
                            </button>
                        </form>
                    </div>
                </div>
            ) : (
                <div className="text-center py-24 border-2 border-dashed border-slate-800 rounded-3xl opacity-20 flex flex-col items-center gap-3">
                    <Coffee size={40} className="text-slate-600" />
                    <div>
                        <p className="text-slate-500 font-black uppercase text-xs">Pause Café du Commissariat</p>
                        <p className="text-slate-600 text-[10px] mt-1 italic">Aucune bavure d'Hugo signalée pour le moment.</p>
                    </div>
                </div>
            )}

            {/* Radio de la Brigade */}
            <div className="mt-10 border-t border-slate-900 pt-8">
                <div className="flex items-center gap-2 mb-4">
                    <Radio size={14} className="text-blue-500" />
                    <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Fréquence Radio IGPN (Canal 17)</h3>
                </div>
                
                <div className="space-y-3">
                    <div className="bg-slate-900/40 border border-slate-800/50 rounded-xl p-3 flex items-center gap-3 animate-pulse">
                        <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                        <p className="text-[10px] text-slate-500 font-bold italic">
                            Signal radio : Transmission cryptée en cours... Hugo localisé près d'un kebab.
                        </p>
                    </div>
                    
                    {activities.length > 0 ? activities.map((act: any) => (
                        <div key={act.id} className="bg-slate-900/60 border-l-2 border-blue-500/50 rounded-r-xl p-3 flex items-center justify-between animate-in fade-in slide-in-from-bottom-2">
                            <div className="flex items-center gap-3">
                                <div className={`w-1.5 h-1.5 rounded-full ${act.type === "WIN" ? "bg-green-500 shadow-[0_0_5px_green]" : "bg-blue-400"}`} />
                                <p className="text-[10px] text-slate-300">
                                    <span className="font-black text-blue-400 uppercase tracking-tighter">{act.userTitle} {act.user}</span> {act.type === "WIN" ? "a détourné une prime sur" : "est en planque sur"} <span className="text-slate-100 italic font-bold">{act.subject}</span>
                                </p>
                            </div>
                            <span className="text-[8px] text-slate-600 font-mono italic">
                                {new Date(act.time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    )) : (
                        <p className="text-[9px] text-slate-700 italic pl-2">Silence radio... La brigade dort.</p>
                    )}
                </div>
            </div>
        </div>
    );
}