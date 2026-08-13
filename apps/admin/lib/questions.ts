/**
 * The open business questions, as data.
 *
 * Preparing the product for its first users keeps surfacing decisions that
 * belong to the business, not to the code. Rather than let any of them be made
 * by default — or ambushed into a call — they are collected on one page that
 * can be read at leisure and answered in conversation.
 *
 * Display-only on purpose: where options exist they are laid out a/b/c to give
 * the discussion a shape, never to close it, and nothing here is a form. The
 * technical counterpart of each subject is tracked separately with Jamie.
 *
 * Written in French per the working-languages rule in `CONVENTIONS.md`: this
 * is a review document for Morgane and Arnaud. Belgian register and French
 * typography throughout — « jours prestés », a space before `%` and `€`, a
 * space as the thousands separator, a comma for the decimal.
 */

export const author = "Jamie Nisbet";

/** The date the page was prepared. */
export const preparedOn = "6 août 2026";

export type Choice = {
  label: string;
  detail: string;
  /** Flags the option Jamie would pick, rendered as a small badge. */
  recommended?: true;
};

export type Question = {
  title: string;
  context: string;
  /** Absent on open questions — those render a standing "open" note instead. */
  choices?: readonly Choice[];
};

export type QuestionSection = {
  title: string;
  lead: string;
  questions: readonly Question[];
};

export const questions = {
  header: {
    eyebrow: "Pour Morgane et Arnaud — à votre rythme",
    title: "Questions ouvertes",
    lead: "En préparant le produit pour ses premiers utilisateurs, une série de décisions sont apparues qui appartiennent au métier, pas à la technique. Elles sont rassemblées ici pour qu'aucune ne se prenne par défaut. Quand des options se dessinent, elles sont posées — a, b, c — pour donner une forme à la discussion, pas pour la fermer. Rien n'est interactif : les réponses se prennent en conversation, sur Slack ou de vive voix.",
    preparedFor: "Pour Morgane et Arnaud",
  },

  sections: [
    {
      title: "Le positionnement et le cadre légal",
      lead: "Les réponses ici définissent ce que Remi a le droit d'être. Elles précèdent tout le reste — y compris le premier compte réel.",
      questions: [
        {
          title:
            "Remi est-il un produit de bien-être ou un dispositif médical ?",
          context:
            "Le règlement européen sur les dispositifs médicaux s'applique dès qu'un logiciel poursuit une finalité médicale — diagnostiquer, traiter, atténuer une maladie. La ligne actuelle du produit — Remi applique les recommandations du praticien, il ne prescrit jamais — nous garde a priori du bon côté, à condition d'être tenue partout : dans le marketing, dans le support, et dans ce que l'IA a le droit de dire. C'est la question la plus structurante de cette page : elle décide du vocabulaire autorisé sur chaque écran.",
          choices: [
            {
              label: "Bien-être, assumé",
              detail:
                "Aucun langage clinique nulle part : pas de « traitement », pas de « patient », pas de promesse de résultat. Le praticien reste le seul acteur médical ; Remi reste l'outil d'accompagnement entre les consultations.",
              recommended: true,
            },
            {
              label: "Médical, à terme",
              detail:
                "Si l'ambition est qu'un jour Remi formule lui-même des recommandations cliniques, la conformité se prépare des années à l'avance — mieux vaut le savoir maintenant que le découvrir en pivotant.",
            },
            {
              label: "Trancher avec un avis juridique",
              detail:
                "Une consultation en droit de la santé numérique avant la fin de la fenêtre d'enrôlement, pour écrire la frontière noir sur blanc plutôt que de la supposer.",
            },
          ],
        },
        {
          title: "Quelles données de santé acceptons-nous de traiter ?",
          context:
            "Dès qu'un plan alimentaire est relié à un accompagnement thérapeutique, le RGPD le range très probablement parmi les données de santé — la catégorie la plus protégée : consentement explicite, registre de traitement, prestataires choisis pour cela. La question n'est pas d'y échapper — c'est le cœur du produit — mais de fixer la frontière de ce que nous refusons de stocker.",
          choices: [
            {
              label: "Le minimum qui fait tourner la boucle",
              detail:
                "Le cadre thérapeutique saisi par le praticien, les plans, les repas, les pas, le ressenti. Pas de documents médicaux téléversés — ni analyses ni bilans — tant que le pilote n'en démontre pas le besoin réel.",
              recommended: true,
            },
            {
              label: "Le dossier plus complet dès le pilote",
              detail:
                "Accepter analyses et bilans dès maintenant. Plus de valeur immédiate pour le praticien — et chaque document ajouté élargit ce que nous devons protéger, exporter, et savoir effacer.",
            },
          ],
        },
        {
          title:
            "L'hébergement en Europe — promesse publique ou préférence interne ?",
          context:
            "Aucun prestataire de données n'est encore choisi, et c'est voulu : cela rend l'engagement encore gratuit — il suffit de sélectionner des prestataires européens, ou à résidence des données en Europe, au moment du choix. La page de confiance du site annonce déjà l'intention ; reste à décider si « vos données restent en Europe » devient un argument public opposable ou une ligne de conduite interne.",
          choices: [
            {
              label: "Promesse publique",
              detail:
                "Affichée sur la page de confiance et portée dans le discours praticien. Différenciant, vérifiable, et tenable — à condition de le décider avant le premier enregistrement, c'est-à-dire maintenant.",
              recommended: true,
            },
            {
              label: "Préférence interne",
              detail:
                "Choisir l'Europe sans en faire une promesse, pour garder la liberté de changer plus tard. Moins fort commercialement, plus souple techniquement.",
            },
          ],
        },
        {
          title: "Qui répond des données, et qui signe quoi ?",
          context:
            "Avant le premier vrai compte, il faut une entité qui assume le rôle de responsable de traitement — la société est-elle constituée, qui la représente ? — et un socle de documents : politique de confidentialité, conditions d'utilisation, contrat praticien, registre de traitement. L'accord pilote signé existe déjà ; le reste est à produire, et la vraie question est le moment où l'avocat entre en scène.",
          choices: [
            {
              label: "Avocat maintenant",
              detail:
                "Faire rédiger l'ensemble avant la fin de la fenêtre d'enrôlement. Le plus sûr, au prix d'un budget immédiat.",
            },
            {
              label: "Modèles sérieux maintenant, avocat avant la facturation",
              detail:
                "Partir de modèles solides pour la période gratuite du pilote, et faire relire l'ensemble avant le 1er septembre 2026 — le jour où l'argent commence à circuler et où l'à-peu-près cesse d'être acceptable.",
              recommended: true,
            },
          ],
        },
        {
          title: "L'intelligence artificielle doit-elle voir les prénoms ?",
          context:
            "Quand Remi génère un plan ou un texte, l'IA peut travailler sur des données pseudonymisées — « la personne », sans prénom ni détail identifiant — ou recevoir les vrais prénoms. Précision qui compte : même pseudonymisée, l'expérience peut rester chaleureuse, le prénom étant réinséré à l'affichage, chez nous, sans jamais partir chez le fournisseur d'IA. La vraie question est de savoir si le ton personnel justifie qu'une donnée personnelle de plus circule — et ce ton, c'est vous qui le portez auprès des praticiens.",
          choices: [
            {
              label: "Pseudonymiser",
              detail:
                "L'IA ne voit jamais un prénom ni un détail identifiant. Moins de données personnelles chez un sous-traitant, un registre plus simple, et un argument fort auprès des praticiens — pour un coût technique modeste.",
              recommended: true,
            },
            {
              label: "Les prénoms réels",
              detail:
                "L'IA reçoit le prénom et peut écrire des textes qui l'utilisent naturellement, au-delà de la simple salutation. Plus direct — et une donnée personnelle de plus à documenter et à protéger chez le fournisseur.",
            },
          ],
        },
      ],
    },
    {
      title: "Le pilote et l'argent",
      lead: "La fenêtre d'enrôlement ferme le 31 août 2026. La facturation commence le lendemain — ces questions ont donc une échéance.",
      questions: [
        {
          title:
            "Le site public et les conditions du pilote se contredisent — lequel a raison ?",
          context:
            "La console rend les conditions signées — 24,50 € HTVA par praticien par mois, gelé un an pour la cohorte — pendant que la FAQ publique répond que le prix n'est pas encore décidé. L'un des deux est en retard sur l'autre ; le trancher avant la fermeture de la fenêtre est un vrai choix, pas une correction de texte.",
          choices: [
            {
              label: "Publier les conditions",
              detail:
                "Le prix devient public : transparent, et il cadre d'emblée les attentes des candidatures tardives.",
            },
            {
              label: "Garder privé jusqu'à la fermeture",
              detail:
                "Les conditions restent l'affaire de la cohorte ; le site continue de dire « en cours de finalisation » — ce qui reste vrai. Un prix se publie quand il concerne d'autres personnes que quinze praticiens déjà d'accord.",
              recommended: true,
            },
          ],
        },
        {
          title: "Qui facture, et comment, à partir du 1er septembre 2026 ?",
          context:
            "Quinze praticiens à 24,50 € HTVA par mois, c'est 367,50 € de facturation mensuelle : le montant ne justifie encore aucune infrastructure. Mais il faut une entité qui émet la facture, un numéro de TVA, et une décision sur la mécanique.",
          choices: [
            {
              label: "Facturation manuelle la première année",
              detail:
                "Quinze factures par mois s'envoient quasi à la main. Zéro intégration, zéro commission, et le temps de voir ce que devient le produit avant d'installer un prestataire de paiement.",
              recommended: true,
            },
            {
              label: "Prestataire de paiement dès le premier jour",
              detail:
                "Prélèvement automatique, relances gérées, et l'infrastructure déjà en place quand la cohorte grandit. Se paie en commissions et en travail d'intégration dès maintenant.",
            },
          ],
        },
        {
          title: "Que mesure le pilote, précisément ?",
          context:
            "L'initiative en cours tient en une question — les quinze garderont-ils Remi quand il cessera d'être gratuit ? — mais « garder » se compte. Combien de conversions payantes font du pilote un succès : quinze, douze, huit ? Et quels signaux d'usage comptent avant septembre — plans créés, personnes actives, sessions praticien par semaine ? Fixer le seuil maintenant évite de le renégocier avec soi-même le jour du bilan.",
        },
        {
          title: "Après la cohorte, quelle ambition pour l'année une ?",
          context:
            "Le plafond de quinze est une décision produit, pas une limite technique : le socle en construction vise sereinement quelques centaines d'utilisateurs — praticiens et personnes accompagnées confondues — avant ses premières vraies questions d'échelle, qui se traiteront à l'approche du plafond, pas avant. L'ambition commerciale de l'année une — combien de praticiens, à quel rythme, par quels canaux — décide du rythme d'ouverture après le 31 août.",
        },
      ],
    },
    {
      title: "La confiance et le service",
      lead: "Ce que les praticiens et les personnes accompagnées sont en droit d'attendre de nous — écrit, pas supposé.",
      questions: [
        {
          title: "Quel engagement de support pour le pilote ?",
          context:
            "La boîte de support existe dans la console et le centre d'aide est en ligne ; il manque l'engagement. Qui répond, en quelle langue, sous quel délai ? Quinze praticiens qui façonnent le produit méritent une réponse rapide — et un délai écrit vaut mieux qu'une bonne intention.",
          choices: [
            {
              label: "48 h ouvrées, en français, vous deux en première ligne",
              detail:
                "Le support du pilote, c'est du produit : ce que les praticiens demandent est la matière première des prochaines fonctionnalités. Jamie reste en escalade pour tout ce qui est technique.",
              recommended: true,
            },
            {
              label: "Rotation à trois",
              detail:
                "Une semaine chacun. Répartit la charge — et dilue le signal produit que le support renvoie.",
            },
          ],
        },
        {
          title: "L'assurance est-elle en place ?",
          context:
            "Une responsabilité civile professionnelle pour un logiciel utilisé dans un contexte de santé, co-conçu avec des cliniciens, est une ligne de budget, pas un luxe. Et le contrat praticien devra dire sans ambiguïté où s'arrête la responsabilité de Remi et où continue la leur. À vérifier : ce qui existe déjà, ce qui manque, et auprès de qui.",
        },
        {
          title: "Le partenariat FunMedDev — que couvre-t-il exactement ?",
          context:
            "Le partenariat signé avec la clinique du Dr Mouton est un actif majeur : co-conception, premiers utilisateurs, crédibilité. Pour bâtir dessus sans le fragiliser, il faut pouvoir répondre à quatre questions : exclusivité ou non, usage du nom dans le marketing, propriété de ce qui est co-conçu, et statut des données des patients de la clinique dans le pilote.",
        },
      ],
    },
    {
      title: "Le travail à trois",
      lead: "Comment nous décidons, où, et à quel rythme — à régler une fois, maintenant, pendant que les habitudes sont encore molles.",
      questions: [
        {
          title: "Slack comme espace de travail produit — on officialise ?",
          context:
            "La proposition : tout le travail produit — listes, documents, décisions en cours — vit dans Slack, en français, avec les listes et canvas de Slack plutôt qu'un outil de plus. Ce qui est décidé descend ensuite dans la documentation du produit, qui reste la référence. Il ne manque qu'une chose pour commencer : l'invitation de Jamie dans l'espace de travail.",
          choices: [
            {
              label: "Slack — listes, canvas, et c'est tout",
              detail:
                "Un canal produit, un canal support-pilote, les décisions tenues en liste. Aucun outil supplémentaire tant qu'un besoin réel ne l'exige pas.",
              recommended: true,
            },
            {
              label: "Un autre outil",
              detail:
                "Si Notion ou autre chose vous est plus naturel, c'est le moment de le dire — avant que les habitudes s'installent.",
            },
          ],
        },
        {
          title: "Quel rythme de décision ?",
          context:
            "Le pipeline de livraison a des portes humaines : rien ne passe de l'idée à la production sans un accord explicite de votre côté. Pour que ces portes ne deviennent pas des files d'attente, il faut un rythme — et les questions de cette page fourniraient l'ordre du jour des premières semaines.",
          choices: [
            {
              label: "Un point hebdomadaire, plus Slack en continu",
              detail:
                "Trente minutes par semaine pour les arbitrages et les portes ; tout le reste en asynchrone.",
              recommended: true,
            },
            {
              label: "Tout au fil de l'eau",
              detail:
                "Aucune réunion fixe. Fonctionne tant que les réponses arrivent vite ; les portes bloquent sinon.",
            },
          ],
        },
      ],
    },
  ] satisfies QuestionSection[],

  closing: {
    title: "Comment répondre",
    body: [
      "Dans l'ordre qui vous arrange, et sous la forme qui vous arrange — un message, une note, un appel. Les questions 1 à 4 sont celles qui débloquent le plus : elles conditionnent le socle légal de la feuille de route, et donc le premier compte réel.",
      "Cette page suit désormais une règle écrite du dépôt : tout document préparé pour votre analyse est rédigé en français. Si un point mérite plus de détail — ou un vrai dossier — dites-le, et il arrivera sous cette forme.",
    ],
  },
} as const;
