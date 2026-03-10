// components/ProfileAvatar.tsx
"use client";

import { useState, useRef } from "react";
import { Camera, Loader2, User } from "lucide-react";
import toast from "react-hot-toast";

export default function ProfileAvatar({ initialImage, userName }: { initialImage: string | null, userName: string }) {
    const [image, setImage] = useState(initialImage);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Limite de taille fixée à 1 Mo (très important pour ne pas saturer la base de données !)
        if (file.size > 1 * 1024 * 1024) {
            toast.error("Le fichier est trop lourd (Max 1 Mo)");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64String = reader.result as string;
            setImage(base64String); // Met à jour l'image visuellement tout de suite
            setUploading(true);

            try {
                const res = await fetch("/api/profile/image", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ image: base64String })
                });

                if (res.ok) {
                    toast.success("Photo d'identité judiciaire mise à jour !");
                } else {
                    toast.error("Bavure lors de la mise à jour");
                    setImage(initialImage); // Annulation en cas d'erreur
                }
            } catch (error) {
                toast.error("Standard de la brigade injoignable");
                setImage(initialImage);
            } finally {
                setUploading(false);
            }
        };
        reader.readAsDataURL(file); // Convertit l'image en texte
    };

    return (
        <div className="relative inline-block group">
            {/* Cadre de l'Avatar */}
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-slate-900 border-4 border-slate-800 shadow-2xl flex items-center justify-center overflow-hidden relative transition-all group-hover:border-blue-500">
                {image ? (
                    <img src={image} alt={userName} className="w-full h-full object-cover" />
                ) : (
                    <User size={48} className="text-blue-500" />
                )}
            </div>
            
            {/* Overlay d'édition (Apparaît au survol) */}
            <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
                {uploading ? (
                    <Loader2 className="animate-spin text-white" size={28} />
                ) : (
                    <>
                        <Camera className="text-white mb-1" size={28} />
                        <span className="text-[10px] font-black text-white uppercase">Modifier</span>
                    </>
                )}
            </button>

            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/jpeg, image/png, image/webp" 
                className="hidden" 
            />
        </div>
    );
}