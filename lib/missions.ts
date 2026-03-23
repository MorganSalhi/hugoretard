// lib/missions.ts

// Le catalogue des bavures possibles
export const MISSION_TYPES = [
    { type: "PLACE_BETS", desc: "Dresser des PV (Faire des rapports)", target: 2 },
    { type: "USE_IGPN", desc: "Balancer un collègue (Marché Noir)", target: 1 },
    { type: "PLAY_SCELLES", desc: "Faire un casse (Salle des Scellés)", target: 1 },
    { type: "BUY_SHOP", desc: "Acheter du matériel tactique", target: 1 },
];

// Fonction pour tirer 3 missions au hasard
export function generateRandomMissions() {
    // On mélange le tableau et on prend les 3 premières
    const shuffled = [...MISSION_TYPES].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
}