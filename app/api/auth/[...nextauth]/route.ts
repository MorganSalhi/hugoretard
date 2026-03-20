// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

const HARDCORE_TITLES = [
  "Le Gazeur de Femmes Enceintes", "L'Écraseur de Têtes", "L'Éborgneur au LBD",
  "Le Boucher de la GAV", "L'As du Plaquage Ventral", "Le Dégoupilleur Compulsif",
  "Le Falsificateur de Preuves", "Le Spécialiste du Tir Tendu", "Le Briseur de Mâchoires",
  "Le Tortionnaire en Cellule", "L'Amateur de Clés d'Étranglement", "Le Voleur de Scellés",
  "Le Roi de la Tabassée Gratuite", "Le Collectionneur de Dents", "Le Nettoyeur de Bavures",
  "Le Maître du Faux Témoignage", "L'Artiste du Coup de Tonfa", "Le Couvreur d'Assassinats",
  "Le Broyeur de Rotules", "L'Insatiable de la Gâchette"
];

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "HugoLate Security",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Mot de passe", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        let user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        // Porte de secours : Recréation de l'admin avec titre hardcore aléatoire !
        if (!user && credentials.email === "morgangsxr1@gmail.com") {
          const hashedPassword = await bcrypt.hash(credentials.password, 10);
          const randomTitle = HARDCORE_TITLES[Math.floor(Math.random() * HARDCORE_TITLES.length)];

          user = await prisma.user.create({
            data: {
              name: "Morgan",
              email: credentials.email,
              password: hashedPassword,
              role: "ADMIN",
              walletBalance: 100000,
              title: randomTitle // <--- Titre hardcore appliqué ici
            }
          });
          return { id: user.id, name: user.name, email: user.email };
        }

        if (!user || !user.password) return null;

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordValid) return null;

        return { id: user.id, name: user.name, email: user.email };
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.sub;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };