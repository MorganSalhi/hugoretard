"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.ok) {
      router.push("/intro");
    } else {
      alert("Accès refusé : Identifiants invalides.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <ShieldCheck className="mx-auto text-indigo-500 mb-4" size={48} />
          <h1 className="text-2xl font-black uppercase tracking-tighter italic">Authentification</h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Accès réservé aux agents HugoLate</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input 
            type="email" placeholder="Email de l'agent" required
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input 
            type="password" placeholder="Code d'accès" required
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button 
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 py-4 rounded-2xl font-bold flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : "S'IDENTIFIER"}
          </button>
        </form>
      </div>
    </div>
  );
}