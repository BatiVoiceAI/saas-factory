"use client";

import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils";
import { motionDuration } from "@/lib/motion";
import { useReducedMotion } from "@/components/motion/use-reduced-motion";

type Direction = "up" | "down" | "left" | "right" | "none";

/** Décalage de départ selon le sens d'entrée (léger, non spectaculaire). */
const OFFSET: Record<Direction, string> = {
  up: "translateY(16px)",
  down: "translateY(-16px)",
  left: "translateX(16px)",
  right: "translateX(-16px)",
  none: "none",
};

export interface RevealProps {
  children: ReactNode;
  /** Sens d'entrée du contenu. Défaut `"up"`. */
  direction?: Direction;
  /** Délai (ms) avant l'entrée — pour cascader plusieurs `Reveal`. */
  delay?: number;
  /** Rejoue à chaque entrée/sortie du viewport. Défaut : une seule fois. */
  once?: boolean;
  className?: string;
}

/**
 * `<Reveal>` — micro-interaction d'entrée (fondu + léger glissement) au scroll,
 * via `IntersectionObserver`, zéro dépendance. Progressive enhancement :
 *
 * - **Mouvement réduit** : aucun style d'animation appliqué — le contenu est
 *   visible immédiatement (opacité pleine), jamais masqué. La préférence est
 *   aussi renforcée par le backstop CSS global (CONVENTIONS §14).
 * - **Sans `IntersectionObserver`** (très vieux navigateur) : révélé au montage.
 *
 * On n'anime que l'opacité et un petit `translate` (pas de parallax ni de
 * transform sur de gros éléments), conforme à la doctrine motion.
 */
export function Reveal({
  children,
  direction = "up",
  delay = 0,
  once = true,
  className,
}: RevealProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (reduced || typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const node = ref.current;
    if (!node) {
      setShown(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            if (once) observer.disconnect();
          } else if (!once) {
            setShown(false);
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [reduced, once]);

  const style: CSSProperties = reduced
    ? {}
    : {
        opacity: shown ? 1 : 0,
        transform: shown ? "none" : OFFSET[direction],
        transition: `opacity ${motionDuration.slow}ms ease-out ${delay}ms, transform ${motionDuration.slow}ms ease-out ${delay}ms`,
        willChange: "opacity, transform",
      };

  return (
    <div ref={ref} className={cn(className)} style={style}>
      {children}
    </div>
  );
}
