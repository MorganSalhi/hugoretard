// lib/rackets.ts

export const RACKETS_DEFINITIONS = {
    KEBAB: {
        id: "KEBAB",
        name: "Le Kebab du Coin",
        description: "Ferme les yeux sur l'hygiène. Petit revenu sûr.",
        cost: 2000,
        hourlyYield: 60, // Rapporte 60 ₪ par heure (soit 1 ₪ par minute)
        icon: "Store",
        color: "text-orange-400"
    },
    CHICHA: {
        id: "CHICHA",
        name: "Bar à Chicha clandestin",
        description: "Tolérance sur le tapage nocturne.",
        cost: 10000,
        hourlyYield: 420, // Rapporte 420 ₪ par heure
        icon: "Flame",
        color: "text-purple-400"
    },
    NIGHTCLUB: {
        id: "NIGHTCLUB",
        name: "La Boîte de Nuit",
        description: "Protection rapprochée des videurs.",
        cost: 35000,
        hourlyYield: 1800, // Rapporte 1800 ₪ par heure
        icon: "Music",
        color: "text-pink-400"
    },
    CASINO: {
        id: "CASINO",
        name: "Cercle de Jeu Illégal",
        description: "Le patron te reverse une part pour éviter les descentes.",
        cost: 100000,
        hourlyYield: 6000, // Rapporte 6000 ₪ par heure
        icon: "Coins",
        color: "text-amber-400"
    }
};