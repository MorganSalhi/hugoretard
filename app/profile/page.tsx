// app/profile/page.tsx
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { getPoliceRank, getRankProgress } from "@/lib/ranks";
import { BADGE_DEFINITIONS, checkAndAwardBadges } from "@/lib/badges";
import * as Icons from "lucide-react";
import ProfileStats from "@/components/ProfileStats";
import ProfileAvatar from "@/components/ProfileAvatar"; // Le fameux composant d'upload
import ProfileNameEdit from "@/components/ProfileNameEdit";

export default async function ProfilePage() {
  const session = await getServerSession();
  if (!session?.user?.email) redirect("/login");

  const tempUser = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (tempUser) {
    await checkAndAwardBadges(tempUser.id);
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      badges: true,
      bets: {
        include: { course: true },
        orderBy: { createdAt: 'desc' }
      },
      _count: { select: { bets: true } }
    }
  });

  if (!user) redirect("/login");

  const rank = getPoliceRank(user.walletBalance);
  const progress = getRankProgress(user.walletBalance);
  const RankIcon = rank.icon;

  const unlockedBadges = new Set(user.badges.map(b => b.type));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 pb-32 font-sans">

      {/* HEADER AGENT - Restructuré exactement comme à l'origine (Centré) */}
      <header className="mb-10 text-center flex flex-col items-center justify-center">
        <div className="mb-4">
          <ProfileAvatar initialImage={user.image || null} userName={user.name || "Adjoint"} />
        </div>

        {/* NOUVEAU COMPOSANT D'EDITION */}
        <ProfileNameEdit initialName={user.name || "Adjoint"} />

        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">{user.email}</p>
      </header>

      {/* CARTE DU GRADE ACTUEL */}
      <div className={`mb-8 p-6 rounded-3xl bg-slate-900/50 border-2 ${rank.border} relative overflow-hidden`}>
        <div className="flex items-center gap-4 mb-6 relative z-10">
          <div className={`p-4 rounded-2xl bg-slate-950 border border-slate-800 ${rank.color}`}>
            <RankIcon size={32} />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Échelon de Bavure</p>
            <h2 className={`text-xl font-black uppercase italic ${rank.color}`}>{rank.label}</h2>
          </div>
        </div>

        {!progress.isMax ? (
          <div className="relative z-10">
            <div className="flex justify-between items-end mb-2">
              <p className="text-[10px] font-black uppercase text-slate-400">Corruption nécessaire pour le grade {progress.nextLabel}</p>
              <p className="text-xs font-mono font-bold text-indigo-400">-{progress.needed.toLocaleString()} ₪</p>
            </div>
            <div className="h-4 w-full bg-slate-950 rounded-full border border-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 transition-all duration-1000 shadow-[0_0_15px_rgba(79,70,229,0.5)]"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
          </div>
        ) : (
          <p className="text-amber-400 text-xs font-bold uppercase italic text-center">Échelon Maximum Atteint</p>
        )}
        <Icons.TrendingUp className="absolute -right-8 -bottom-8 opacity-5 text-white" size={150} />
      </div>

      {/* STATISTIQUES RAPIDES (SÉRIES) */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
          <Icons.Flame className="text-orange-500" size={24} />
          <div>
            <p className="text-[9px] text-slate-500 uppercase font-bold">Jours sans signalement IGPN</p>
            <p className="text-lg font-mono font-bold">{user.currentStreak}</p>
          </div>
        </div>
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
          <Icons.Trophy className="text-amber-500" size={24} />
          <div>
            <p className="text-[9px] text-slate-500 uppercase font-bold">Record d'immunité diplomatique</p>
            <p className="text-lg font-mono font-bold">{user.bestStreak}</p>
          </div>
        </div>
      </div>

      {/* STATISTIQUES FINANCIÈRES & MISSIONS */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4">
          <Icons.Wallet className="text-emerald-500 mb-2" size={20} />
          <p className="text-[9px] text-slate-500 uppercase font-bold">Solde Disponible</p>
          <p className="text-lg font-mono font-bold">{user.walletBalance.toLocaleString()} ₪</p>
        </div>
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4">
          <Icons.Award className="text-amber-500 mb-2" size={20} />
          <p className="text-[9px] text-slate-500 uppercase font-bold">PV dressés au pif</p>
          <p className="text-lg font-mono font-bold">{user._count.bets} Rapports</p>
        </div>
      </div>

      {/* SECTION MÉDAILLES DE SERVICE (BADGES) */}
      <div className="mt-8">
        <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-4">Distinctions pour Abus Notoires</h3>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
          {Object.entries(BADGE_DEFINITIONS).map(([type, details]) => {
            const isUnlocked = unlockedBadges.has(type);

            // Sélection dynamique de l'icône correspondante
            const IconComponent = (Icons as any)[details.icon] || Icons.Award;

            return (
              <div key={type} className="group relative flex flex-col items-center">
                <div className={`
                  p-3 rounded-2xl border transition-all duration-500
                  ${isUnlocked
                    ? `bg-slate-900 border-slate-700 ${details.color} shadow-[0_0_15px_rgba(0,0,0,0.4)]`
                    : 'bg-slate-900/20 border-slate-800/50 text-slate-600 opacity-40'}
                `}>
                  <IconComponent size={24} />
                </div>

                {/* Tooltip détaillé */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-40 p-3 bg-slate-900 border border-slate-800 rounded-xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-30 shadow-2xl">
                  <p className={`text-[10px] font-black uppercase mb-1 ${isUnlocked ? details.color : 'text-slate-500'}`}>
                    {isUnlocked ? details.label : "Verrouillé"}
                  </p>
                  <p className="text-[8px] text-slate-400 leading-relaxed">
                    {details.description}
                  </p>
                  {!isUnlocked && (
                    <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-center gap-1 text-[7px] text-slate-600 font-bold uppercase">
                      <Icons.Lock size={8} /> Mission requise
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* BUREAU DES STATISTIQUES (GRAPHIQUES) */}
      <div className="mt-10 border-t border-slate-900 pt-10">
        <header className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Icons.Target size={14} className="text-indigo-500" />
            <h2 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Renseignement et Analyse</h2>
          </div>
          <p className="text-lg font-black italic uppercase">Rapport de matraquage</p>
        </header>
        <ProfileStats bets={user.bets} />
      </div>
    </div>
  );
}