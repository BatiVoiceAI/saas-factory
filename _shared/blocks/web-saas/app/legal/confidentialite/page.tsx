import type { Metadata } from "next";

import { brand } from "@/lib/brand";
import { Placeholder } from "@/app/legal/_components/placeholder";

/**
 * Gabarit « Politique de confidentialité » — juridiction **FR** (RGPD, dès
 * qu’une donnée personnelle — a minima l’e-mail — est collectée). Livré avec
 * les 4 gabarits légaux ; conservé au build si `jurisdiction = FR`.
 *
 * Valeurs propres à l’éditeur = `<Placeholder>` (responsable de traitement,
 * durées, sous-traitants, contact/DPO). Le texte-cadre est générique et
 * s’aligne sur les droits RGPD (accès, rectification, effacement, opposition,
 * portabilité, réclamation CNIL).
 */
export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: `Comment ${brand.name} collecte, utilise et protège vos données personnelles (RGPD).`,
};

export default function ConfidentialitePage() {
  return (
    <>
      <h1>Politique de confidentialité</h1>
      <p>
        La présente politique décrit la manière dont {brand.name} collecte,
        utilise et protège les données personnelles des utilisateurs, dans le
        respect du Règlement général sur la protection des données (RGPD) et de
        la loi Informatique et Libertés.
      </p>

      <h2>Responsable du traitement</h2>
      <p>
        Le responsable du traitement est{" "}
        <Placeholder>RAISON_SOCIALE</Placeholder>, dont le siège est situé{" "}
        <Placeholder>ADRESSE_SIEGE</Placeholder>. Pour toute question relative à
        vos données : <Placeholder>EMAIL_DPO</Placeholder>.
      </p>

      <h2>Données collectées</h2>
      <p>Dans le cadre de l’utilisation du service, nous collectons :</p>
      <ul>
        <li>
          les données de compte que vous fournissez (adresse e-mail, et le cas
          échéant nom et informations de profil) ;
        </li>
        <li>
          les données générées par votre utilisation du service (contenus que
          vous créez, préférences) ;
        </li>
        <li>
          des données techniques de connexion (journaux, adresse IP, type de
          navigateur) à des fins de sécurité et de bon fonctionnement.
        </li>
      </ul>

      <h2>Finalités et bases légales</h2>
      <ul>
        <li>
          fournir et sécuriser le service, gérer votre compte — base :{" "}
          <strong>exécution du contrat</strong> ;
        </li>
        <li>
          vous envoyer les e-mails nécessaires au service (connexion,
          notifications) — base : <strong>exécution du contrat</strong> ;
        </li>
        <li>
          améliorer le service et mesurer son audience — base :{" "}
          <strong>intérêt légitime</strong> ou{" "}
          <strong>consentement</strong> selon le cas ;
        </li>
        <li>
          respecter nos obligations légales et comptables — base :{" "}
          <strong>obligation légale</strong>.
        </li>
      </ul>

      <h2>Durée de conservation</h2>
      <p>
        Les données de compte sont conservées tant que votre compte est actif,
        puis pendant <Placeholder>DUREE_CONSERVATION</Placeholder> après sa
        clôture, sauf obligation légale de conservation plus longue.
      </p>

      <h2>Destinataires et sous-traitants</h2>
      <p>
        Vos données ne sont jamais vendues. Elles peuvent être traitées par nos
        sous-traitants techniques, uniquement pour les besoins du service et
        sous contrat conforme à l’article 28 du RGPD (hébergement, envoi
        d’e-mails, mesure d’audience, paiement) :{" "}
        <Placeholder>LISTE_SOUS_TRAITANTS</Placeholder>.
      </p>

      <h2>Transferts hors Union européenne</h2>
      <p>
        Lorsqu’un sous-traitant traite des données hors de l’Union européenne,
        ce transfert est encadré par des garanties appropriées (clauses
        contractuelles types de la Commission européenne ou décision
        d’adéquation).
      </p>

      <h2>Vos droits</h2>
      <p>
        Vous disposez d’un droit d’accès, de rectification, d’effacement, de
        limitation, d’opposition et de portabilité de vos données, ainsi que du
        droit de définir des directives relatives à leur sort après votre décès.
        Pour les exercer, écrivez à <Placeholder>EMAIL_DPO</Placeholder>. Vous
        pouvez également introduire une réclamation auprès de la CNIL
        (www.cnil.fr).
      </p>

      <h2>Cookies</h2>
      <p>
        Le site dépose des cookies strictement nécessaires à son fonctionnement
        ainsi que, sous réserve de votre consentement, des cookies de mesure
        d’audience. Vous pouvez à tout moment modifier vos choix depuis les
        paramètres de votre navigateur.
      </p>

      <p>
        Dernière mise à jour : <Placeholder>DATE_MAJ</Placeholder>.
      </p>
    </>
  );
}
