import { type ReactNode } from "react";

import { cn } from "@/lib/utils";
import { LottieAnimation } from "@/components/motion/lottie-animation";

export interface EmptyStateProps {
  /** Titre court de l'état vide (ex. « Rien ici pour le moment »). */
  title: string;
  /** Phrase d'explication sous le titre (ce qui apparaîtra une fois rempli). */
  description?: string;
  /**
   * URL d'un `.lottie` à animer au centre (optionnel), branché au build. En
   * mouvement réduit ou avant montage, le repli `icon` prend le relais.
   * Voir `components/motion/README.md` pour brancher un asset.
   */
  animationSrc?: string;
  /** Visuel statique de repli (icône, illustration) — sert aussi de fallback anim. */
  icon?: ReactNode;
  /** Action principale — ex. `<Button asChild><Link/></Button>` du bloc ui-shell. */
  action?: ReactNode;
  className?: string;
}

/**
 * `<EmptyState>` — exemple NEUTRE (non métier) de câblage de la couche motion :
 * un état vide qui anime un `.lottie` (via `animationSrc`) avec repli statique
 * `icon`, réduisant la friction d'activation quand une liste est vide. Server
 * Component qui compose le client `<LottieAnimation>` — a11y et lazy hérités.
 *
 * À réutiliser tel quel dans le vrai espace produit (généré au build) : passer
 * la copy dans la langue `locale` et, au besoin, l'URL d'une animation de la
 * direction de marque.
 */
export function EmptyState({
  title,
  description,
  animationSrc,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border px-6 py-14 text-center",
        className,
      )}
    >
      {animationSrc ? (
        <LottieAnimation
          src={animationSrc}
          fallback={icon}
          className="h-32 w-32 text-muted-foreground"
          ariaLabel={title}
        />
      ) : icon ? (
        <div className="text-muted-foreground" aria-hidden>
          {icon}
        </div>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <h3 className="text-lg font-medium tracking-tight">{title}</h3>
        {description ? (
          <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>

      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
