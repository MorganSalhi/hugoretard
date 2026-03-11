// app/admin/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { CreateCourseSchema, CreateUserSchema } from "@/lib/validations";
import toast from "react-hot-toast"; // <-- On importe nos notifications stylées !
import {
    ShieldAlert,
    PlusCircle,
    CheckCircle2,
    Loader2,
    Gavel,
    Users,
    UserPlus,
    HandCoins,
    BookOpen,
    Lock
} from "lucide-react";

export default function AdminPage() {
    const { data: session, status } = useSession();
    const [activeTab, setActiveTab] = useState<"courses" | "users">("courses");
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const ADMIN_EMAIL = "morgangsxr1@gmail.com";

    const [activeCourses, setActiveCourses] = useState<any[]>([]);
    const [actualTimes, setActualTimes] = useState<{ [key: string]: string }>({});

    const [agents, setAgents] = useState<any[]>([]);
    const [creditAmounts, setCreditAmounts] = useState<{ [key: string]: number }>({});

    const courseForm = useForm({ resolver: zodResolver(CreateCourseSchema) });
    const userForm = useForm({ resolver: zodResolver(CreateUserSchema) });

    const fetchData = async () => {
        setFetching(true);
        try {
            const [coursesRes, usersRes] = await Promise.all([
                fetch("/api/courses/live?all=true"),
                fetch("/api/admin/users")
            ]);

            if (coursesRes.ok) {
                const data = await coursesRes.json();
                setActiveCourses(Array.isArray(data) ? data : data.id ? [data] : []);
            }
            if (usersRes.ok) setAgents(await usersRes.json());
        } catch (error) {
            toast.error("Erreur de synchronisation avec le serveur");
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        if (status === "authenticated" && session?.user?.email === ADMIN_EMAIL) {
            fetchData();
        }
    }, [status, session]);

    if (status === "loading") return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <Loader2 className="animate-spin text-indigo-500" size={48} />
        </div>
    );
    if (!session || session.user?.email !== ADMIN_EMAIL) redirect("/lobby");

    // --- LOGIQUE COURS ---
    const onCreateCourse = async (data: any) => {
        setLoading(true);
        const tId = toast.loading("Ouverture du dossier...");
        try {
            const res = await fetch("/api/courses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (res.ok) {
                toast.success("Dossier de surveillance ouvert !", { id: tId });
                courseForm.reset();
                fetchData();
            } else {
                toast.error("Bavure lors de l'ouverture", { id: tId });
            }
        } catch (err) {
            toast.error("Standard injoignable", { id: tId });
        } finally { setLoading(false); }
    };

    const onResolveCourse = async (courseId: string) => {
        const actualTime = actualTimes[courseId];
        if (!actualTime || !/^([01]\d|2[0-3]):([0-5]\d)$/.test(actualTime)) {
            return toast.error("Format de l'heure invalide (HH:mm)");
        }
        setLoading(true);
        const tId = toast.loading("Classement de l'affaire...");
        try {
            const res = await fetch("/api/resolve", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ courseId, actualTime }),
            });
            if (res.ok) {
                toast.success("Verdict rendu avec succès !", { id: tId });
                fetchData();
            } else {
                const err = await res.json();
                toast.error(err.error || "Erreur de classement", { id: tId });
            }
        } catch (err) {
            toast.error("Standard injoignable", { id: tId });
        } finally { setLoading(false); }
    };

    // --- LOGIQUE AGENTS ---
    const onCreateUser = async (data: any) => {
        setLoading(true);
        const tId = toast.loading("Recrutement en cours...");
        try {
            const res = await fetch("/api/admin/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (res.ok) {
                toast.success("Nouvel Adjoint enrôlé !", { id: tId });
                userForm.reset();
                fetchData();
            } else {
                const err = await res.json();
                toast.error(err.error || "Bavure au recrutement", { id: tId });
            }
        } catch (err) {
            toast.error("Standard injoignable", { id: tId });
        } finally { setLoading(false); }
    };

    // LA FONCTION CORRIGÉE POUR INJECTER L'ARGENT
    const onInjectMoney = async (userId: string) => {
        const amount = creditAmounts[userId];

        if (!amount || amount <= 0) {
            return toast.error("Somme invalide, veuillez entrer un montant.");
        }

        setLoading(true);
        const tId = toast.loading("Versement du Bakchich...");

        try {
            const res = await fetch("/api/admin/users", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, amount }),
            });

            if (res.ok) {
                toast.success("Fonds de saisie injectés !", { id: tId });
                // Réinitialiser le champ d'input de cet agent
                setCreditAmounts(prev => ({ ...prev, [userId]: 0 }));
                // Rafraîchir les données pour afficher le nouveau solde
                fetchData();
            } else {
                const err = await res.json();
                toast.error(err.error || "Erreur de virement", { id: tId });
            }
        } catch (err) {
            toast.error("Standard injoignable", { id: tId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 p-6 pb-32 text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                    <ShieldAlert className="text-red-500" size={32} />
                    <div>
                        <h1 className="text-2xl font-black uppercase italic">Commissariat HugoLate</h1>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Poste de Commandement Central</p>
                    </div>
                </div>

                <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
                    <button onClick={() => setActiveTab("courses")} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === "courses" ? "bg-indigo-600 text-white" : "text-slate-500 hover:text-slate-300"}`}>
                        <BookOpen size={14} /> DOSSIERS
                    </button>
                    <button onClick={() => setActiveTab("users")} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === "users" ? "bg-indigo-600 text-white" : "text-slate-500 hover:text-slate-300"}`}>
                        <Users size={14} /> AGENTS
                    </button>
                </div>
            </div>

            {activeTab === "courses" ? (
                <div className="grid lg:grid-cols-2 gap-8">
                    <section className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 shadow-xl h-fit">
                        <div className="flex items-center gap-2 mb-6 text-indigo-400">
                            <PlusCircle size={20} />
                            <h2 className="text-lg font-bold">Nouvelle Surveillance</h2>
                        </div>
                        <form onSubmit={courseForm.handleSubmit(onCreateCourse)} className="space-y-5">
                            <input {...courseForm.register("subject")} placeholder="Matière" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                            <div className="grid grid-cols-2 gap-4">
                                <input {...courseForm.register("professor")} placeholder="Professeur" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                                <input {...courseForm.register("startTime")} placeholder="HH:mm" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono" />
                            </div>
                            <button disabled={loading} type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 py-4 rounded-2xl font-bold flex items-center justify-center gap-2">
                                {loading ? <Loader2 className="animate-spin" /> : <Gavel size={20} />} OUVRIR LE DOSSIER
                            </button>
                        </form>
                    </section>

                    <section className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 shadow-xl h-fit">
                        <div className="flex items-center gap-2 mb-6 text-green-400">
                            <CheckCircle2 size={20} />
                            <h2 className="text-lg font-bold">Verdict IGPN</h2>
                        </div>
                        {activeCourses.length > 0 ? (
                            <div className="space-y-4">
                                {activeCourses.map((course) => (
                                    <div key={course.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
                                        <h3 className="font-bold text-indigo-400 mb-4">{course.subject}</h3>
                                        <div className="flex items-end gap-3">
                                            <input type="text" placeholder="HH:mm" value={actualTimes[course.id] || ""} onChange={(e) => setActualTimes(prev => ({ ...prev, [course.id]: e.target.value }))} className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-2 outline-none font-mono" />
                                            <button disabled={loading} onClick={() => onResolveCourse(course.id)} className="bg-green-600 p-2.5 rounded-xl disabled:opacity-50"><CheckCircle2 size={20} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : <p className="text-center py-10 text-slate-600 italic">Rien à signaler, officier.</p>}
                    </section>
                </div>
            ) : (
                <div className="grid lg:grid-cols-2 gap-8">
                    <section className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 shadow-xl h-fit">
                        <div className="flex items-center gap-2 mb-6 text-indigo-400">
                            <UserPlus size={20} />
                            <h2 className="text-lg font-bold">Recruter un Agent</h2>
                        </div>
                        <form onSubmit={userForm.handleSubmit(onCreateUser)} className="space-y-5">
                            <input {...userForm.register("name")} placeholder="Nom de l'agent" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                            <input {...userForm.register("email")} placeholder="Email (Identifiant)" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                                <input {...userForm.register("password")} type="password" placeholder="Mot de passe temporaire" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 pl-12 outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                            </div>
                            <input {...userForm.register("initialBalance")} type="number" placeholder="Budget initial (₪)" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                            <button disabled={loading} type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 py-4 rounded-2xl font-bold flex items-center justify-center gap-2">
                                {loading ? <Loader2 className="animate-spin" /> : <UserPlus size={20} />} ENRÔLER L'AGENT
                            </button>
                        </form>
                    </section>

                    <section className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 shadow-xl h-fit">
                        <div className="flex items-center gap-2 mb-6 text-amber-400">
                            <HandCoins size={20} />
                            <h2 className="text-lg font-bold">Effectifs & Budget</h2>
                        </div>
                        {fetching ? (
                            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-amber-500" /></div>
                        ) : (
                            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                {agents.map((agent) => (
                                    <div key={agent.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-bold">{agent.name}</p>
                                                <p className="text-[10px] text-slate-500 uppercase">{agent.email}</p>
                                            </div>
                                            <p className="font-mono text-amber-400 font-bold">{agent.walletBalance.toLocaleString()} ₪</p>
                                        </div>
                                        <div className="flex gap-2">
                                            {/* On sécurise le format de l'input pour être sûr de récupérer un Nombre */}
                                            <input
                                                type="number"
                                                placeholder="+ ₪"
                                                value={creditAmounts[agent.id] || ""}
                                                onChange={(e) => setCreditAmounts(prev => ({ ...prev, [agent.id]: e.target.value ? Number(e.target.value) : 0 }))}
                                                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1 text-sm outline-none focus:border-amber-500 font-mono transition-all"
                                            />
                                            <button
                                                disabled={loading}
                                                onClick={() => onInjectMoney(agent.id)}
                                                className="bg-amber-600 hover:bg-amber-500 p-2 rounded-xl transition-all disabled:opacity-50"
                                            >
                                                <HandCoins size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            )}
        </div>
    );
}