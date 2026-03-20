// lib/items.ts
import { Shield, Radio, Gavel, MailWarning, Droplets } from "lucide-react";

export const SHOP_ITEMS = {
  VEST: {
    id: "VEST",
    name: "Bouclier de CRS",
    description: "Réduit les pertes de 50%. Idéal pour encaisser les bavures d'Hugo sans broncher.",
    price: 500,
    icon: Shield,
    color: "text-blue-400",
  },
  MAGNIFIER: {
    id: "MAGNIFIER",
    name: "Radar de Chantier",
    description: "Espionne la brigade pour voir l'estimation moyenne des autres adjoints.",
    price: 300,
    icon: Radio,
    color: "text-amber-400",
  },
  WARRANT: {
    id: "WARRANT",
    name: "Abus de Pouvoir",
    description: "Double vos gains... mais l'IGPN vous retire tout si l'enquête foire !",
    price: 1000,
    icon: Gavel,
    color: "text-red-500",
  },
  IGPN_LETTER: {
    id: "IGPN_LETTER",
    name: "Lettre Anonyme",
    description: "Dénonce un collègue à l'IGPN pour remettre sa série d'immunité à zéro.",
    price: 3000,
    icon: MailWarning,
    color: "text-slate-400",
  },
  SUGAR: {
    id: "SUGAR",
    name: "Sucre dans le Réservoir",
    description: "Sabote le véhicule d'un collègue. Ajoute +2 minutes de malus à son prochain rapport.",
    price: 1500,
    icon: Droplets,
    color: "text-red-500",
  },
};

export type ItemType = keyof typeof SHOP_ITEMS;