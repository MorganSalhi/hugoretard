// lib/events.ts

export const EVENT_TYPES = [
    { 
        type: "DOUBLE_BETS", 
        message: "🚨 ÉMEUTES EN VILLE : Les primes de risque sont activées. Tous les gains de paris sont doublés !" 
    },
    { 
        type: "CHEAP_SHOP", 
        message: "🎥 PANNE DES CAMÉRAS : Les prix du marché noir (I.G.P.N) sont divisés par deux !" 
    },
    { 
        type: "FREEZE_RACKETS", 
        message: "🚔 DESCENTE DE L'I.G.P.N : L'économie souterraine est gelée. Les rackets ne rapportent plus rien jusqu'à nouvel ordre." 
    }
];

export function getRandomEvent() {
    const shuffled = [...EVENT_TYPES].sort(() => 0.5 - Math.random());
    return shuffled[0];
}