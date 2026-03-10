// components/ProfileNameEdit.tsx
"use client";

import { useState } from "react";
import { Pencil, Check, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function ProfileNameEdit({ initialName }: { initialName: string }) {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(initialName);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSave = async () => {
        if (!name || name.trim().length < 3) {
            toast.error("Le pseudo doit faire au moins 3 caractères");
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch("/api/profile/name", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: name.trim() })
            });

            if (res.ok) {
                toast.success("Falsification d'identité réussie !");
                setIsEditing(false);
                router.refresh(); // Rafraîchit la page pour mettre à jour partout
            } else {
                const err = await res.json();
                toast.error(err.error || "Bavure lors de la modification");
            }
        } catch (error) {
            toast.error("Standard de la brigade injoignable");
        } finally {
            setIsLoading(false);
        }
    };

    if (isEditing) {
        return (
            <div className="flex items-center justify-center gap-2 my-2">
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-2xl font-black italic tracking-tighter uppercase text-white outline-none focus:border-blue-500 w-full max-w-[250px] text-center"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                />
                <button onClick={handleSave} disabled={isLoading} className="p-3 bg-blue-600/20 text-blue-500 hover:bg-blue-600 hover:text-white rounded-xl transition-colors">
                    {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Check size={20} />}
                </button>
                <button onClick={() => { setIsEditing(false); setName(initialName); }} disabled={isLoading} className="p-3 bg-slate-800 text-slate-400 hover:bg-red-600 hover:text-white rounded-xl transition-colors">
                    <X size={20} />
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center gap-3 group relative cursor-pointer" onClick={() => setIsEditing(true)}>
            <h1 className="text-3xl font-black italic tracking-tighter uppercase transition-colors group-hover:text-blue-400">
                {name}
            </h1>
            <button 
                className="opacity-0 group-hover:opacity-100 transition-all bg-slate-800 p-2 rounded-full text-slate-400 hover:text-white hover:bg-blue-600 absolute -right-12"
                title="Falsifier l'identité"
            >
                <Pencil size={16} />
            </button>
        </div>
    );
}