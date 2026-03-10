// app/leaderboard/page.tsx
import { prisma } from "@/lib/prisma";
import { POLICE_RANKS } from "@/lib/ranks";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Shield, Target, Flame, Trophy, TrendingUp, Skull, ShieldAlert } from "lucide-react";

export default async function LeaderboardPage() {
    const session = await getServerSession();
    if (!session) redirect("/login");

    const allUsers = await prisma.user.findMany({
        orderBy: { walletBalance: 'desc' },
        include: { _count: { select: { bets: true } } }
    });

    const wantedTarget = allUsers[0];
    const BOUNTY_AMOUNT = 5000;
    const reversedRanks = [...POLICE_RANKS].reverse();

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-6 pb-32 font-sans">
            <header className="mb-10">
                <div className="flex items-center gap-2 mb-2">
                    <ShieldAlert className="text-red-500" size={16} />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                        RAPPORT DISCIPLINAIRE - IGPN
                    </span>
                </div>
                <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase">ÉTATS DE SERVICE</h1>
                <p className="text-slate-500 text-sm font-medium">Qui a commis le plus de bavures cette semaine ?</p>
            </header>

            <div className="space-y-8">
                {reversedRanks.map((rank, idx) => {
                    const nextRank = reversedRanks[idx - 1];
                    const usersInRank = allUsers.filter(u =>
                        u.walletBalance >= rank.min && (nextRank ? u.walletBalance < nextRank.min : true)
                    );

                    return (
                        <div key={rank.label} className="relative">
                            <div className={`flex items-center gap-3 mb-4 p-4 rounded-2xl bg-slate-900/30 border-l-4 ${rank.border} ${rank.color} backdrop-blur-sm shadow-xl`}>
                                <rank.icon size={20} />
                                <div>
                                    <h2 className="font-black uppercase tracking-widest text-[10px]">{rank.label}</h2>
                                    <p className="text-[9px] opacity-50 font-mono">Quota : {rank.min.toLocaleString()} ₪</p>
                                </div>
                            </div>

                            <div className="grid gap-2 pl-6">
                                {usersInRank.map((user) => {
                                    const isWanted = user.id === wantedTarget?.id;
                                    return (
                                        <div key={user.id} className={`relative flex justify-between items-center p-4 rounded-xl border ${isWanted ? 'bg-red-500/10 border-red-500/50' : 'bg-slate-900/60 border-slate-800/50'}`}>
                                            {isWanted && (
                                                <div className="absolute -top-2 -right-2 bg-red-600 text-white text-[7px] font-black px-2 py-0.5 rounded-full animate-bounce">
                                                    <Skull size={8} className="inline mr-1" /> WANTED : {BOUNTY_AMOUNT} ₪
                                                </div>
                                            )}
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-400 overflow-hidden border border-slate-700 shrink-0">
                                                    {user.image ? (
                                                        <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        user.name.substring(0, 2).toUpperCase()
                                                    )}
                                                </div>
                                                <div>
                                                    <span className="font-bold text-xs text-slate-200 block">{user.name}</span>
                                                    <div className="flex items-center gap-3 mt-1.5">
                                                        <div className="flex items-center gap-0.5 text-[9px] font-black text-orange-500"><Flame size={10} /> {user.currentStreak}</div>
                                                        <div className="flex items-center gap-0.5 text-[9px] font-black text-slate-600"><TrendingUp size={10} /> {user._count.bets} PV</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="font-mono font-bold text-indigo-400 text-sm italic">{user.walletBalance.toLocaleString()} ₪</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}