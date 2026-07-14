import type { Metadata } from "next";

import { brand } from "@/lib/brand";
import { Placeholder } from "@/app/legal/_components/placeholder";

/**
 * Gabarit « Mentions légales » — juridiction **FR** (obligatoire pour tout
 * site, LCEN art. 6-III + C. com. art. R.123-237). Livré avec les 4 gabarits
 * légaux ; conservé au build si `jurisdiction = FR`.
 *
 * Les valeurs propres à l'éditeur sont des `<Placeholder>` à substituer au
 * build (raison sociale, forme, capital, immatriculation, siège, contact,
 * directeur de publication, hébergeur). Le texte-cadre est générique.
 */
export const metadata: Metadata = {
  title: "Mentions légales",
  description: `Mentions légales de ${brand.name} : éditeur, directeur de la publication et hébergeur.`,
};

export default function MentionsLegalesPage() {
  return (
    <>
      <h1>Mentions légales</h1>
      <p>
        Conformément à l’article 6-III de la loi n° 2004-575 du 21 juin 2004
        pour la confiance dans l’économie numérique (LCEN), les informations
        suivantes sont portées à la connaissance des utilisateurs du site{" "}
        {brand.name}.
      </p>

      <h2>Éditeur du site</h2>
      <p>Le site {brand.name} est édité par :</p>
      <address>
        <Placeholder>RAISON_SOCIALE</Placeholder>, société{" "}
        <Placeholder>FORME_JURIDIQUE</Placeholder> au capital de{" "}
        <Placeholder>CAPITAL_SOCIAL</Placeholder>
        <br />
        Siège social : <Placeholder>ADRESSE_SIEGE</Placeholder>
        <br />
        Immatriculée au RCS de <Placeholder>VILLE_RCS</Placeholder> sous le
        numéro <Placeholder>SIREN</Placeholder>
        <br />
        Numéro de TVA intracommunautaire :{" "}
        <Placeholder>TVA_INTRACOM</Placeholder>
        <br />
        Courriel : <Placeholder>EMAIL_CONTACT</Placeholder> — Téléphone :{" "}
        <Placeholder>TELEPHONE</Placeholder>
      </address>

      <h2>Directeur de la publication</h2>
      <p>
        Le directeur de la publication est{" "}
        <Placeholder>DIRECTEUR_PUBLICATION</Placeholder>, en sa qualité de{" "}
        <Placeholder>QUALITE_DIRECTEUR</Placeholder>.
      </p>

      <h2>Hébergeur</h2>
      <p>Le site est hébergé par :</p>
      <address>
        <Placeholder>HEBERGEUR_NOM</Placeholder>
        <br />
        <Placeholder>HEBERGEUR_ADRESSE</Placeholder>
        <br />
        <Placeholder>HEBERGEUR_CONTACT</Placeholder>
      </address>

      <h2>Propriété intellectuelle</h2>
      <p>
        L’ensemble des contenus (textes, graphismes, logos, marques,
        interfaces) présents sur le site {brand.name} sont protégés par le droit
        de la propriété intellectuelle et demeurent la propriété exclusive de
        l’éditeur ou de ses partenaires. Toute reproduction, représentation ou
        exploitation, totale ou partielle, sans autorisation écrite préalable
        est interdite.
      </p>

      <h2>Contact</h2>
      <p>
        Pour toute question relative au site ou à ces mentions, vous pouvez
        écrire à <Placeholder>EMAIL_CONTACT</Placeholder>.
      </p>

      <p>
        Dernière mise à jour : <Placeholder>DATE_MAJ</Placeholder>.
      </p>
    </>
  );
}
