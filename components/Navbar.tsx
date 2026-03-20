// components/Navbar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { 
  LayoutDashboard, 
  Trophy, 
  History, 
  UserCog, 
  ShieldAlert, 
  ShoppingBag, 
  LogOut,
  Skull // <-- L'icône du marché noir ajoutée ici
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Lobby", href: "/lobby", icon: LayoutDashboard },
    { name: "Hiérarchie", href: "/leaderboard", icon: Trophy },
    { name: "Archives", href: "/history", icon: History },
    { name: "Boutique", href: "/shop", icon: ShoppingBag },
    { name: "I.G.P.N", href: "/igpn", icon: Skull, isSecret: true },
    { name: "Profil", href: "/profile", icon: UserCog },
    { name: "Admin", href: "/admin", icon: ShieldAlert },
  ];

  // On ne montre pas la Navbar sur la page de login (et intro)
  if (pathname === "/login" || pathname === "/intro") return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/80 backdrop-blur-lg border-t border-slate-800 px-4 py-3 z-50">
      <div className="max-w-md mx-auto flex justify-between items-center overflow-x-auto gap-2 no-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          // Style visuel spécial pour le bouton IGPN (rouge) et normal (bleu)
          const colorClass = item.isSecret 
            ? (isActive ? "text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" : "text-red-900/80 hover:text-red-500")
            : (isActive ? "text-indigo-400" : "text-slate-500 hover:text-slate-300");

          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={`flex flex-col items-center gap-1 transition-colors min-w-fit ${colorClass}`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[9px] font-bold uppercase tracking-tighter">
                {item.name}
              </span>
            </Link>
          );
        })}
        
        <button 
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex flex-col items-center gap-1 text-slate-600 hover:text-red-400 transition-colors min-w-fit ml-1"
        >
          <LogOut size={20} />
          <span className="text-[9px] font-bold uppercase tracking-tighter">Quitter</span>
        </button>
      </div>
    </nav>
  );
}