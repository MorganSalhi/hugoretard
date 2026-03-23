// app/missions/page.tsx
"use client";

import { useState, useEffect } from "react";
import { ClipboardList, PackageOpen, CheckCircle2, Loader2, Target } from "lucide-react";
import toast from "react-hot-toast";

export default function MissionsPage() {
    const [missions, setMissions] = useState<any[]>([]);
    const [lootboxes, setLootboxes] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMissions = async () => {
            try {
                const res = await fetch("/api/missions/get");
                const data = await res.json();
                if (res.ok) {
                    setMissions(data.missions);
                    setLootboxes(data.lootboxes);
                } else {
                    toast.error(data.error || "Impossible de récupérer les dossiers.");
                }
            } catch (error) {
                toast.error("Erreur de liaison avec le central.");
            } finally {
                setLoading(false);
            }
        };

        fetchMissions();
    }, []);

    const handleOpenBox = () => {
        // On codera l'ouverture de la boîte plus tard !
        toast.error("Le Commissaire n'a pas encore validé les clés de la réserve (En cours de dev !)", { icon: '🔐' });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Loader2 className="animate-spin text-indigo-500" size={40} />
            </div>
        );
    }

    const allCompleted = missions.length > 0 && missions.every(m => m.completed);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-6 pb-32">
            <header className="mb-8 text-center">
                <div className="flex items-center justify-center gap-2 mb-2 text-indigo-500">
                    <ClipboardList size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Bureau du Commissaire</span>
                </div>
                <h1 className="text-4xl font-black italic tracking-tighter text-white">LES QUOTAS</h1>
                <p className="text-slate-500 text-xs mt-2">Remplissez vos objectifs journaliers pour obtenir des caisses de contrebande.</p>
            </header>

            {/* SECTION 1 : LES MISSIONS */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 mb-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-600 to-blue-400"></div>
                <h2 className="text-lg font-black uppercase italic mb-6 flex items-center gap-2 text-slate-300">
                    <Target size={18} className="text-indigo-400" /> Objectifs du Jour
                </h2>

                <div className="space-y-4">
                    {missions.map((mission) => {
                        const isDone = mission.completed;
                        const percent = Math.min(100, (mission.progress / mission.target) * 100);

                        return (
                            <div key={mission.id} className={`p-4 rounded-2xl border transition-all ${isDone ? 'bg-green-900/10 border-green-900/30' : 'bg-slate-950 border-slate-800'}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className={`font-bold text-sm ${isDone ? 'text-green-400' : 'text-slate-200'}`}>
                                        {mission.description}
                                    </h3>
                                    {isDone ? (
                                        <CheckCircle2 size={18} className="text-green-500" />
                                    ) : (
                                        <span className="text-xs font-mono font-black text-indigo-400">
                                            {mission.progress} / {mission.target}
                                        </span>
                                    )}
                                </div>
                                
                                {/* Barre de progression */}
                                <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden mt-3">
                                    <div 
                                        className={`h-full rounded-full transition-all duration-1000 ${isDone ? 'bg-green-500' : 'bg-indigo-500'}`}
                                        style={{ width: `${percent}%` }}
                                    ></div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {allCompleted && (
                    <div className="mt-6 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-center">
                        <p className="text-xs font-black uppercase text-green-400">Excellent travail. Revenez demain pour la suite.</p>
                    </div>
                )}
            </div>

            {/* SECTION 2 : LES RÉCOMPENSES (CAISSES) */}
            <div className="bg-slate-900/40 border border-amber-900/30 rounded-3xl p-6 relative overflow-hidden flex flex-col items-center text-center">
                <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-400 left-0"></div>
                
                <div className="p-4 bg-amber-500/10 rounded-full mb-4 border border-amber-500/20">
                    <PackageOpen size={32} className="text-amber-400" />
                </div>
                
                <h3 className="text-2xl font-black italic text-white mb-1">{lootboxes} Caisse(s)</h3>
                <p className="text-[10px] text-slate-500 uppercase font-bold mb-6 tracking-widest">Matériel de Contrebande Saisi</p>

                <button 
                    onClick={handleOpenBox}
                    disabled={lootboxes === 0}
                    className="w-full sm:w-2/3 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-black py-4 rounded-2xl transition-all uppercase"
                >
                    {lootboxes > 0 ? "Forcer le cadenas" : "Aucune caisse disponible"}
                </button>
            </div>

        </div>
    );
}