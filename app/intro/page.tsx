// app/intro/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

export default function IntroPage() {
    const router = useRouter();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isCracked, setIsCracked] = useState(false);

    // Fonction déclenchée à la fin de la vidéo
    const endIntro = () => {
        router.push("/lobby");
    };

    // Gestion intelligente du lancement de la vidéo avec le son
    useEffect(() => {
        const video = videoRef.current;
        if (video) {
            video.play().catch((error) => {
                console.warn("Lecture avec son bloquée, passage en mode muet :", error);
                video.muted = true;
                video.play();
            });
        }
    }, []);

    // Vérifie le temps de la vidéo à chaque fraction de seconde
    const handleTimeUpdate = () => {
        if (videoRef.current && videoRef.current.currentTime >= 2.5 && !isCracked) {
            setIsCracked(true);
        }
    };

    return (
        <div className="fixed inset-0 bg-black z-[100] flex items-center justify-center overflow-hidden cursor-none">
            
            {/* Effet visuel de fissure au moment de l'impact */}
            {isCracked && (
                <div 
                    className="absolute inset-0 z-50 pointer-events-none opacity-40 mix-blend-screen bg-cover"
                    style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/glass-shattered.png')" }}
                ></div>
            )}

            <video 
                ref={videoRef}
                src="/intro.mp4" 
                playsInline
                controls={false}
                onTimeUpdate={handleTimeUpdate} // Synchronisation parfaite avec l'effet de fissure
                onEnded={endIntro}
                className="w-full h-full object-cover"
            />

            {/* Logo B.A.R.H et sous-titre */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-40 pointer-events-none">
                <h1 
                    className={`text-6xl md:text-9xl font-black italic text-white tracking-tighter transition-all duration-500 drop-shadow-[0_0_15px_rgba(255,0,0,0.5)] ${
                        isCracked ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                    }`}
                >
                    B.A.R.H.
                </h1>
                <p 
                    className={`text-[10px] md:text-sm font-bold text-red-500 uppercase tracking-[0.3em] mt-4 transition-opacity duration-1000 ${
                        isCracked ? 'opacity-100' : 'opacity-0'
                    }`}
                >
                    Usage de la force nécessaire
                </p>
            </div>

            {/* Filtre global type Caméra pour assombrir légèrement la vidéo et faire ressortir le texte */}
            <div className="absolute inset-0 z-10 opacity-20 pointer-events-none bg-blue-900 mix-blend-overlay"></div>
        </div>
    );
}