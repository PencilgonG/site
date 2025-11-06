// ✅ SERVER COMPONENT (ne pas mettre "use client")
import ProfilesClient from "./ProfilesClient";

// Empêche tout cache côté Vercel/Next (toujours à jour)
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Page Profils — wrapper server
 * Rend le composant client qui gère le fetch et l’affichage
 */
export default function Page() {
  return <ProfilesClient />;
}
