// app/history/page.tsx
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import {
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  NotebookTabs,
  Shield,
  Search,
  Gavel,
  Target,
  Flame
} from "lucide-react";

// Mapping des icônes pour les objets utilisés
const ITEM_ICONS: Record<string, any> = {
  VEST: { icon: Shield, color: "text-blue-400", label: "Gilet Pare-Balles" },
  MAGNIFIER: { icon: Search, color: "text-amber-400", label: "Loupe de Précision" },
  WARRANT: { icon: Gavel, color: "text-red-500", label: "Mandat d'Arrêt" },
};

export default async function HistoryPage() {
  const session = await getServerSession();

  if (!session?.user?.email) {
    redirect("/login");
  }

  // 1. ON RÉCUPÈRE L'UTILISATEUR DEPUIS LA BASE DE DONNÉES (Pour avoir son nom frais)
  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  const bets = await prisma.bet.findMany({
    where: {
      user: { email: session.user.email }
    },
    include: {
      course: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 pb-32 font-sans">
      <header className="mb-10">
        <div className="flex items-center gap-2 mb-2">
          <NotebookTabs className="text-indigo-500" size={16} />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
            Archives Centrales HugoLate
          </span>
        </div>
        <h1 className="text-4xl font-black italic tracking-tighter text-white">MES DOSSIERS</h1>
        {/* 2. ON AFFICHE LE NOM FRAIS AU LIEU DE CELUI DE LA SESSION */}
        <p className="text-slate-500 text-sm">Rapports d'interventions de l'agent {user?.name || session.user.name}.</p>
      </header>

      <div className="space-y-6">
        {bets.length > 0 ? (
          bets.map((bet) => {
            const isResolved = bet.course.status === "FINISHED";
            const won = (bet.pointsEarned ?? 0) > bet.amount;

            // Calcul de la précision pour la barre de progression (max 1000 points = 100%)
            const precisionPercent = isResolved ? Math.min(100, Math.max(0, (bet.pointsEarned ?? 0) / (bet.amount * 10) * 100)) : 0;

            const item = bet.appliedItem ? ITEM_ICONS[bet.appliedItem] : null;
            const ItemIcon = item?.icon;

            return (
              <div key={bet.id} className="bg-slate-900/40 border border-slate-800 rounded-3xl p-5 backdrop-blur-md relative overflow-hidden group">
                {/* Indicateur de bonus/item en fond */}
                {bet.appliedItem && (
                  <div className="absolute -right-2 -top-2 opacity-5 rotate-12 group-hover:scale-110 transition-transform">
                    <ItemIcon size={100} />
                  </div>
                )}

                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div>
                    <h3 className="font-bold text-lg leading-tight text-slate-100">{bet.course.subject}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">
                        {bet.course.professor}
                      </p>
                      {item && (
                        <div className={`flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 ${item.color}`}>
                          <ItemIcon size={10} />
                          <span className="text-[8px] font-black uppercase">{item.label}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {isResolved ? (
                    <div className={`flex flex-col items-end gap-1`}>
                      <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase ${won ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                        {won ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                        {won ? 'Profit' : 'Perte'}
                      </div>
                      {/* Temps réel d'arrivée */}
                      <p className="text-[9px] font-mono text-slate-500 italic">
                        Réel : {new Date(bet.course.actualArrivalTime!).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1">
                      <Clock size={12} className="animate-pulse" />
                      Enquête en cours
                    </div>
                  )}
                </div>

                {/* Barre de Précision de l'Agent */}
                {isResolved && (
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-1 text-[9px] font-black text-slate-500 uppercase">
                        <Target size={10} />
                        Précision du Rapport
                      </div>
                      <span className="text-[9px] font-mono font-bold text-indigo-400">{Math.round(precisionPercent)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${won ? 'bg-indigo-500' : 'bg-red-500/50'}`}
                        style={{ width: `${precisionPercent}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 border-t border-slate-800/50 pt-4 relative z-10">
                  <div>
                    <p className="text-[9px] text-slate-600 uppercase font-black mb-1 tracking-tighter">Mise / Est. Arrivée</p>
                    <p className="font-mono text-sm text-indigo-300">
                      {bet.amount} ₪ • {new Date(bet.guessedTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-slate-600 uppercase font-black mb-1 tracking-tighter">Résultat Mission</p>
                    <p className={`font-mono text-lg font-black ${won ? 'text-green-400' : 'text-slate-500'}`}>
                      {isResolved ? `${won ? '+' : ''}${bet.pointsEarned} ₪` : '-- ₪'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-20 border-2 border-dashed border-slate-900 rounded-3xl opacity-20">
            <TrendingUp size={40} className="mx-auto text-slate-800 mb-4" />
            <p className="text-slate-600 font-bold uppercase text-[10px] tracking-widest">Aucune mission archivée</p>
          </div>
        )}
      </div>
    </div>
  );
}