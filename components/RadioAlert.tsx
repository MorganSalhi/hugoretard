// components/RadioAlert.tsx
"use client";

import { useState, useEffect } from "react";
import { Radio, AlertTriangle } from "lucide-react";
import { usePathname } from "next/navigation";

export default function RadioAlert() {
    const [event, setEvent] = useState<any>(null);
    const pathname = usePathname();

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const res = await fetch("/api/events/radio");
                const data = await res.json();
                setEvent(data.event);
            } catch (error) {
                console.error("Erreur radio", error);
            }
        };

        fetchEvent(); // Vérification immédiate
        const interval = setInterval(fetchEvent, 30000); // Puis on vérifie toutes les 30 secondes
        return () => clearInterval(interval);
    }, []);

    // On cache l'alerte sur la page de login ou d'intro pour ne pas casser le design
    if (!event || pathname === "/login" || pathname === "/intro") return null;

    return (
        <div className="fixed top-0 left-0 w-full z-[100] bg-red-600/90 backdrop-blur-md text-white shadow-[0_0_20px_rgba(220,38,38,0.5)] border-b-2 border-red-800">
            <div className="max-w-md mx-auto flex items-center px-4 py-2 gap-3 text-[10px] sm:text-xs font-black uppercase tracking-widest">
                <Radio className="animate-pulse flex-shrink-0" size={18} />
                <div className="flex-1 overflow-hidden">
                    {/* Le texte défile s'il est trop long ou reste fixe s'il y a la place */}
                    <p className="truncate text-red-50">{event.message}</p>
                </div>
                <AlertTriangle className="animate-pulse text-amber-300 flex-shrink-0" size={18} />
            </div>
        </div>
    );
}