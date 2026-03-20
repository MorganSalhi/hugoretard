// app/igpn/page.tsx
"use client";

import { useState, useEffect } from "react";
import { ShieldAlert, MailWarning, Droplets, Loader2, UserX } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function IGPNPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [myItems, setMyItems] = useState<any[]>([]);
    const [loading, setLoading] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        // Récupérer les cibles et l'inventaire de l'attaquant
        const fetchData = async () => {
            const res = await fetch("/api/admin/users"); // On réutilise ta route admin pour avoir la liste
            const data = await res.json();
            setUsers(data);
        };
        fetchData();
        // Dans une V2, tu devras créer une petite route API pour récupérer juste l'inventaire de la session en cours.
    }, []);

    const useItem = async (targetId: string, itemType: string) => {
        setLoading(`${targetId}-${itemType}`);
        const res = await fetch("/api/pvp/use", {
            method: "POST",
            body: JSON.stringify({ targetId, itemType }),
        });

        const data = await res.json();
        if (res.ok) {
            toast.success(`Coup bas réussi sur ${data.targetName} !`, { icon: '😈' });
            router.refresh();
        } else {
            toast.error(data.error);
        }
        setLoading(null);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-6 pb-32">
            <header className="mb-10">
                <div className="flex items-center gap-2 mb-2 text-red-500">
                    <ShieldAlert size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Bureau des Affaires Internes</span>
                </div>
                <h1 className="text-4xl font-black italic tracking-tighter text-white">L'I.G.P.N</h1>
                <p className="text-slate-500 text-sm">Achetez vos objets au marché noir et sabotez vos collègues ici.</p>
            </header>

            <div className="grid gap-4">
                {users.map((user) => (
                    <div key={user.id} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                                <UserX className="text-slate-500" size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg leading-tight">{user.name}</h3>
                                <div className="flex items-center gap-3 text-[10px] font-black uppercase text-slate-500">
                                    <span className="text-amber-500">{user.walletBalance} ₪</span>
                                    <span>•</span>
                                    <span className={user.currentStreak > 0 ? "text-orange-500" : ""}>Série : {user.currentStreak}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 w-full sm:w-auto">
                            <button 
                                onClick={() => useItem(user.id, "IGPN_LETTER")}
                                disabled={!!loading}
                                className="flex-1 sm:flex-none bg-slate-800 hover:bg-slate-700 text-slate-300 p-3 rounded-xl flex items-center justify-center gap-2 transition-all"
                                title="Envoyer une Lettre Anonyme"
                            >
                                {loading === `${user.id}-IGPN_LETTER` ? <Loader2 className="animate-spin" size={20}/> : <MailWarning size={20} />}
                            </button>
                            <button 
                                onClick={() => useItem(user.id, "SUGAR")}
                                disabled={!!loading}
                                className="flex-1 sm:flex-none bg-red-900/50 hover:bg-red-900 text-red-400 p-3 rounded-xl flex items-center justify-center gap-2 transition-all border border-red-800/50"
                                title="Mettre du sucre dans le réservoir"
                            >
                                {loading === `${user.id}-SUGAR` ? <Loader2 className="animate-spin" size={20}/> : <Droplets size={20} />}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}