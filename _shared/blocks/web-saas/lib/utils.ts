import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Fusionne des classes Tailwind conditionnelles en résolvant les conflits
 * (convention shadcn/ui). À réutiliser dans tout composant du châssis.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
