// app/login/page.tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ShieldAlert, Loader2, Lock, Mail, User } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [isRegistering, setIsRegistering] = useState(false);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isRegistering) {
                // INSCRIPTION
                const res = await fetch("/api/auth/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData)
                });

                const data = await res.json();

                if (!res.ok) {
                    toast.error(data.error || "Bavure lors de l'inscription");
                    setLoading(false);
                    return;
                }
                
                toast.success("Enrôlement réussi. Validation de la plaque...");
            }

            // CONNEXION (Exécutée après l'inscription, ou directement si déjà inscrit)
            const signInResult = await signIn("credentials", {
                email: formData.email,
                password: formData.password,
                redirect: false,
            });

            if (signInResult?.error) {
                toast.error("Identifiants refusés par le commissariat.");
                setLoading(false);
            } else {
                router.push("/intro"); // Direction la cinématique
            }
        } catch (error) {
            toast.error("Le standard de l'IGPN est en panne.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Gyrophare de fond */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-white to-red-600 opacity-50"></div>
            <ShieldAlert size={150} className="absolute text-slate-900 opacity-50 -rotate-12 blur-sm pointer-events-none" />

            <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black italic tracking-tighter text-white drop-shadow-[0_0_15px_rgba(59,130,246,0.5)] uppercase mb-2">
                        B.A.R.H.
                    </h1>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                        {isRegistering ? "Bureau de Recrutement" : "Portail d'Identification"}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Le champ Pseudo n'apparait que si on s'inscrit */}
                    {isRegistering && (
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input 
                                type="text" 
                                required 
                                placeholder="Pseudo d'agent"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 pl-12 text-white placeholder-slate-600 outline-none focus:border-blue-500 transition-all font-bold"
                            />
                        </div>
                    )}

                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input 
                            type="email" 
                            required 
                            placeholder="Matricule (Email)"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 pl-12 text-white placeholder-slate-600 outline-none focus:border-blue-500 transition-all font-bold"
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input 
                            type="password" 
                            required 
                            placeholder="Mot de passe (6 min.)"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 pl-12 text-white placeholder-slate-600 outline-none focus:border-blue-500 transition-all font-bold"
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 uppercase tracking-widest transition-all mt-4"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : (isRegistering ? "S'enrôler" : "Prendre son service")}
                    </button>
                </form>

                {/* Bouton pour basculer entre Inscription / Connexion */}
                <div className="mt-6 text-center">
                    <button 
                        onClick={() => {
                            setIsRegistering(!isRegistering);
                            setFormData({ name: "", email: "", password: "" }); 
                        }}
                        type="button"
                        className="text-xs text-slate-400 hover:text-white transition-colors underline decoration-slate-600 underline-offset-4"
                    >
                        {isRegistering ? "Déjà membre de la brigade ? Connectez-vous." : "Nouvelle recrue ? Déposez votre dossier."}
                    </button>
                </div>
            </div>
        </div>
    );
}