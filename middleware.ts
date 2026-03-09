export { default } from "next-auth/middleware";

// Toutes les routes listées ici nécessitent d'être connecté.
// Si l'utilisateur n'a pas de session, il est redirigé vers /login (défini dans authOptions.pages.signIn)
export const config = {
  matcher: [
    "/lobby/:path*",
    "/profile/:path*",
    "/leaderboard/:path*",
    "/history/:path*",
    "/shop/:path*",
    "/admin/:path*",
  ],
};