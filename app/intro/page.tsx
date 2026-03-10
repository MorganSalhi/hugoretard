// app/intro/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export default function IntroPage() {
    const router = useRouter();
    const videoRef = useRef<HTMLVideoElement>(null);

    // Fonction déclenchée automatiquement à la fin de la vidéo
    const handleVideoEnd = () => {
        router.push("/lobby");
    };

    // Sécurité au cas où la vidéo ne se lance pas (bloqueur de navigateur)
    useEffect(() => {
        const video = videoRef.current;
        if (video) {
            video.play().catch((error) => {
                console.log("Lecture automatique bloquée par le navigateur :", error);
                // Si le navigateur bloque l'autoplay, on redirige directement pour ne pas bloquer l'utilisateur
                router.push("/lobby");
            });
        }
    }, [router]);

    return (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center overflow-hidden">
            <video 
                ref={videoRef}
                src="/intro.mp4" 
                autoPlay 
                playsInline
                controls={false}
                onEnded={handleVideoEnd}
                className="w-full h-full object-cover"
            />
        </div>
    );
}