// app/intro/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export default function IntroPage() {
    const router = useRouter();
    const videoRef = useRef<HTMLVideoElement>(null);

    const endIntro = () => {
        router.push("/lobby");
    };

    useEffect(() => {
        const video = videoRef.current;
        if (video) {
            // On tente de lancer la vidéo AVEC le son.
            // Si le navigateur la bloque quand même, on la relance en mode muet pour que l'image tourne au moins.
            video.play().catch((error) => {
                console.warn("Autoplay avec son bloqué, passage en muet pour forcer la lecture :", error);
                video.muted = true;
                video.play();
            });
        }
    }, []);

    return (
        <div className="fixed inset-0 bg-black z-[100] flex items-center justify-center overflow-hidden cursor-none">
            {/* Overlay Grain de film façon "Caméra de surveillance" */}
            <div className="absolute inset-0 z-10 opacity-30 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>

            <video 
                ref={videoRef}
                src="/intro.mp4" 
                playsInline
                controls={false}
                onEnded={endIntro}
                className="w-full h-full object-cover"
            />

            {/* Logo B.A.R.H qui s'affiche par-dessus à la fin */}
            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                <h1 className="text-6xl md:text-9xl font-black italic text-white tracking-tighter animate-pulse opacity-0 [animation-delay:3s] [animation-fill-mode:forwards] drop-shadow-[0_0_15px_rgba(255,0,0,0.8)]">
                    B.A.R.H.
                </h1>
            </div>
        </div>
    );
}