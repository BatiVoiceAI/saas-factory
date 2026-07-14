"use client";

import { useSyncExternalStore } from "react";

import { prefersReducedMotion, watchReducedMotion } from "@/lib/motion";

/**
 * Abonnement `useSyncExternalStore` : on ignore la valeur poussée par
 * `watchReducedMotion` (React relit le snapshot lui-même via `getSnapshot`).
 * Défini au niveau module pour rester référentiellement stable entre rendus.
 */
function subscribe(onStoreChange: () => void): () => void {
  return watchReducedMotion(() => onStoreChange());
}

/**
 * Hook client : `true` si l'utilisateur préfère un mouvement réduit, réactif
 * aux bascules en direct.
 *
 * Bâti sur `useSyncExternalStore` — pas de déssynchronisation d'hydratation :
 * le snapshot serveur vaut `false` (préférence inconnue côté serveur, on assume
 * l'animation), et React recale proprement le rendu client si la vraie valeur
 * diffère, sans warning d'hydratation. À câbler dans tout composant animé pour
 * couper l'autoplay / rendre un repli statique.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, prefersReducedMotion, () => false);
}
