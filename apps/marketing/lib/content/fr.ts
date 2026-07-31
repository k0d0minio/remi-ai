import {
  ChefHat,
  Clock,
  EyeOff,
  Footprints,
  LineChart,
  NotebookPen,
  ShieldCheck,
  Stethoscope,
  TrendingDown,
  UtensilsCrossed,
} from "lucide-react";
import type { Content } from "./types";

/**
 * Le dictionnaire français — le marché de lancement. Mêmes règles que la
 * version anglaise : produit pré-lancement, donc le site vend le programme
 * pilote et ce qui se construit, jamais une fonctionnalité comme si elle était
 * en production. Les statistiques citent leurs sources ; le partenariat avec
 * le Dr Mouton / FunMedDev est réel et confirmé par les fondateurs. Pas de
 * tarif (rien n'est décidé), pas de témoignages, pas de traction inventée.
 */
export const fr: Content = {
  nav: [
    { href: "/practitioners", label: "Praticiens" },
    { href: "/individuals", label: "Pour vous" },
    { href: "/about", label: "À propos" },
  ],

  header: {
    contact: "Contact",
    cta: { href: "/contact", label: "Rejoindre le pilote" },
    menuLabel: "Menu",
  },

  footer: {
    tagline:
      "Le copilote bien-être qui prolonge l'accompagnement du praticien entre deux consultations.",
    disclaimer:
      "REMI aide à appliquer les recommandations d'un praticien. Il ne diagnostique pas, ne traite pas et ne remplace pas un suivi professionnel — tout ce qui est clinique relève de votre praticien.",
    navLabel: "Pied de page",
  },

  home: {
    meta: {
      title: "Le copilote bien-être entre deux consultations",
      description:
        "REMI se construit avec des praticiens de santé : il traduit leurs recommandations en repas, habitudes et petits pas au quotidien — en gardant le praticien dans la boucle.",
    },
    hero: {
      eyebrow: "En développement · première cohorte pilote en formation",
      title: "Entre deux consultations, tout se joue.",
      subtitle:
        "On sort de consultation en sachant quoi faire — puis la vraie vie reprend. REMI est un copilote bien-être qui se construit avec des praticiens de santé : il traduit leurs recommandations en repas, habitudes et petits pas, et garde le praticien dans la boucle.",
      actions: [
        {
          href: "/practitioners",
          label: "Je suis praticien",
          variant: "primary",
        },
        {
          href: "/individuals",
          label: "Je suis accompagné(e)",
          variant: "outline",
        },
      ],
    },
    stats: {
      eyebrow: "Pourquoi c'est important",
      title: "L'écart entre les conseils et le quotidien n'est pas un détail",
      note: "Ces chiffres décrivent le problème, pas les résultats de REMI — REMI n'a encore aucun résultat à revendiquer, et ce site n'en inventera jamais.",
      items: [
        {
          value: "3 sur 4",
          label:
            "des décès dans le monde sont liés aux maladies non transmissibles, comme le diabète et les maladies cardiovasculaires",
          source: "OMS, aide-mémoire, 2024",
        },
        {
          value: "1 sur 8",
          label: "personnes dans le monde vivaient avec l'obésité en 2022",
          source: "OMS, 2024",
        },
        {
          value: "~50 %",
          label:
            "d'adhésion moyenne aux traitements de longue durée dans les pays à revenu élevé — moins ailleurs",
          source: "OMS, L'observance des traitements de longue durée, 2003",
        },
      ],
    },
    audience: {
      eyebrow: "Deux côtés, une même boucle",
      title: "Pensé pour le praticien et la personne qu'il accompagne",
      cards: [
        {
          href: "/practitioners",
          title: "Vous recommandez. REMI aide à appliquer.",
          body: "Vos recommandations méritent mieux que d'être oubliées dès jeudi.",
          bullets: [
            "Transformer vos notes de consultation en recommandations claires et structurées",
            "Offrir un soutien quotidien que vous ne pouvez pas assurer entre deux séances",
            "Voir ce qui fonctionne — et ce qui bloque — avant la consultation suivante",
          ],
          cta: "Ce que nous construisons pour les praticiens",
        },
        {
          href: "/individuals",
          title: "Des conseils enfin vivables.",
          body: "Pas une énième app de régime — un compagnon pour le plan que vous avez déjà.",
          bullets: [
            "Des idées de repas qui suivent les recommandations reçues",
            "Un petit pas à la fois, à votre rythme",
            "Votre praticien reste la référence, et reste informé",
          ],
          cta: "Ce que REMI fera pour vous",
        },
      ],
    },
    vision: {
      eyebrow: "Ce que nous construisons",
      title: "Le produit qui prend forme",
      lead: "REMI est en plein développement avec ses premiers praticiens. Voici ce qu'il est conçu pour faire — et rien ici ne sera vendu comme disponible avant de fonctionner réellement.",
      items: [
        {
          icon: NotebookPen,
          title: "Des notes à un plan clair",
          body: "Le praticien rédige ses recommandations comme il l'a toujours fait. REMI les structure en un plan qu'une personne peut réellement suivre chez elle.",
          intent: "primary",
        },
        {
          icon: UtensilsCrossed,
          title: "Des idées de repas fidèles au plan",
          body: "Des suggestions et recettes alignées sur les recommandations du praticien et sur les goûts, le rythme et les contraintes de la personne.",
          intent: "success",
        },
        {
          icon: Footprints,
          title: "Des petits pas, dans l'ordre",
          body: "Pas de révolution au jour un. Un changement à la fois, au rythme de la personne, pour que le changement ait une chance de durer.",
          intent: "info",
        },
        {
          icon: LineChart,
          title: "De la visibilité entre les consultations",
          body: "Le praticien voit les progrès, les blocages et l'engagement — la consultation suivante part des faits, pas des souvenirs.",
          intent: "info",
        },
        {
          icon: Stethoscope,
          title: "Le praticien reste la référence",
          body: "REMI applique ; il ne prescrit jamais. Le praticien reste celui qui décide, et REMI travaille strictement dans le cadre de ses recommandations.",
          intent: "primary",
        },
        {
          icon: ShieldCheck,
          title: "La confidentialité dès la conception",
          body: "Une entreprise belge, soumise au RGPD. Une collecte limitée à ce dont l'accompagnement a besoin, jamais vendue, jamais partagée sans consentement.",
          intent: "neutral",
        },
      ],
    },
    steps: {
      eyebrow: "Comment ça fonctionnera",
      title: "Une boucle, trois moments",
      items: [
        {
          title: "Votre praticien recommande",
          body: "La consultation se déroule exactement comme aujourd'hui. Le praticien fixe le cap et les recommandations — REMI ne change rien à cela.",
        },
        {
          title: "REMI traduit",
          body: "Les recommandations deviennent des actions concrètes : quoi cuisiner ce soir, quoi choisir en magasin, quelle habitude commencer cette semaine.",
        },
        {
          title: "Les progrès remontent",
          body: "Jour après jour la personne est accompagnée, et le praticien voit où elle en est — la séance suivante ajuste le plan au lieu de le reconstruire.",
        },
      ],
    },
    partnership: {
      eyebrow: "Premier partenariat",
      title: "Co-conçu avec la médecine fonctionnelle",
      body: "REMI se développe en partenariat avec le Dr Georges Mouton, fondateur de la clinique FunMedDev et référence européenne en médecine fonctionnelle. Ce partenariat façonne la manière dont REMI traduit les recommandations d'un praticien en accompagnement quotidien, aligné sur de vrais protocoles cliniques plutôt que sur des conseils génériques.",
      points: [
        "Un partenariat signé avec la clinique FunMedDev",
        "Un accompagnement co-conçu avec l'expertise du Dr Mouton",
        "Des patients FunMedDev parmi les premiers utilisateurs pilotes",
      ],
      quote:
        "Personnalisation. Voilà, un mot. Et l'IA est un soutien à la personnalisation.",
      quoteAuthor: "Dr Georges Mouton",
      quoteRole: "Fondateur, FunMedDev — en échange avec l'équipe REMI",
    },
    faq: {
      eyebrow: "FAQ",
      title: "Les réponses honnêtes d'abord",
      items: [
        {
          id: "available",
          question: "Puis-je utiliser REMI aujourd'hui ?",
          answer:
            "Pas encore. REMI est en développement et sera lancé d'abord avec une petite cohorte pilote de praticiens. Si vous voulez en être — comme praticien, ou parce que vous aimeriez que votre praticien y participe — contactez-nous et nous vous tiendrons informé(e).",
        },
        {
          id: "replace",
          question: "REMI remplace-t-il mon praticien ?",
          answer:
            "Non, et il ne le fera jamais. Le praticien diagnostique, décide et reste la référence. REMI aide seulement à appliquer ce que le praticien a recommandé, dans le quotidien, entre les consultations.",
        },
        {
          id: "medical",
          question: "REMI donne-t-il un avis médical ?",
          answer:
            "Non. REMI est un compagnon bien-être qui part des recommandations de votre praticien. Il ne diagnostique pas, ne traite pas et ne prend aucune décision clinique — tout ce qui est clinique se passe en consultation.",
        },
        {
          id: "data",
          question: "Que deviennent mes données ?",
          answer:
            "REMI est construit par une entreprise belge, soumise au RGPD. L'engagement que nous construisons : ne collecter que ce dont l'accompagnement a besoin, ne jamais vendre, ne jamais partager sans votre consentement, et vous permettre d'exporter ou de supprimer vos données.",
        },
        {
          id: "price",
          question: "Combien ça coûtera ?",
          answer:
            "Le tarif n'est pas décidé. Il se construit honnêtement avec les premiers praticiens pilotes, et tant qu'il n'est pas arrêté, vous ne trouverez pas de chiffre sur ce site. Demandez-nous où on en est — on vous le dira.",
        },
      ],
    },
    cta: {
      title: "Aidez-nous à façonner la première version",
      body: "Nous cherchons un petit groupe de praticiens pour construire REMI avec nous — et des personnes qui aimeraient que leur praticien en entende parler.",
      action: { href: "/contact", label: "Nous contacter" },
    },
  },

  practitioners: {
    meta: {
      title: "Praticiens — le copilote entre vos consultations",
      description:
        "REMI se construit pour structurer vos recommandations, accompagner vos patients au quotidien et vous montrer ce qui se passe entre deux séances. Une cohorte pilote de 15 praticiens se forme.",
    },
    hero: {
      eyebrow: "Pour les praticiens",
      title: "Vos consultations changent des vies. Puis vient l'entre-deux.",
      subtitle:
        "Entre deux séances, les personnes que vous accompagnez sont seules — et une grande partie de vos recommandations se dissout dans le quotidien. REMI se construit pour combler cet écart, sans alourdir votre charge de travail.",
      actions: [
        {
          href: "/contact",
          label: "Candidater au pilote",
          variant: "primary",
        },
        { href: "/about", label: "Qui est derrière REMI", variant: "outline" },
      ],
    },
    pains: {
      eyebrow: "Le problème",
      title: "Trois réalités que chaque praticien connaît trop bien",
      items: [
        {
          icon: Clock,
          title: "La rédaction prend du temps",
          body: "Transformer une consultation en recommandations claires, structurées et personnalisées est un vrai travail — répété pour chaque personne accompagnée.",
          intent: "warning",
        },
        {
          icon: EyeOff,
          title: "Puis vous perdez la visibilité",
          body: "Entre deux séances, vous ne voyez ni ce qui est appliqué, ni ce qui est mal compris, ni le moment où quelqu'un abandonne en silence.",
          intent: "warning",
        },
        {
          icon: TrendingDown,
          title: "La motivation s'essouffle vite",
          body: "L'élan de la consultation survit rarement seul à la deuxième semaine. À la séance suivante, trop de terrain a été perdu.",
          intent: "warning",
        },
      ],
    },
    vision: {
      eyebrow: "Ce que nous construisons pour vous",
      title: "Conçu pour vous rendre du temps et de la visibilité",
      lead: "Voici le versant praticien de REMI tel qu'il se développe avec la cohorte pilote — décrit comme une intention, pas comme une liste de fonctionnalités en production.",
      items: [
        {
          icon: NotebookPen,
          title: "Des recommandations structurées",
          body: "Partez de vos notes brutes ; REMI aide à en faire un plan clair et partageable, fidèle à votre approche.",
          intent: "primary",
        },
        {
          icon: UtensilsCrossed,
          title: "Un accompagnement quotidien, issu de votre plan",
          body: "Des suggestions de repas et des petits pas générés strictement dans le cadre de vos recommandations — vous posez le cadre, REMI travaille dedans.",
          intent: "success",
        },
        {
          icon: LineChart,
          title: "Voir entre les séances",
          body: "Progrès, difficultés et engagement, visibles d'un coup d'œil — pour que la consultation parte de ce qui s'est réellement passé.",
          intent: "info",
        },
        {
          icon: Stethoscope,
          title: "Ajuster sans attendre",
          body: "Quand quelque chose ne fonctionne pas, affinez l'accompagnement à distance au lieu de perdre les semaines qui restent avant le prochain rendez-vous.",
          intent: "primary",
        },
      ],
    },
    pilot: {
      eyebrow: "Le programme pilote",
      title: "Une première cohorte de 15 praticiens",
      body: "La première version de REMI se construit avec un groupe volontairement restreint. Les praticiens pilotes ne sont pas des bêta-testeurs sur une liste de diffusion : ils façonnent ce qui se construit, toutes les deux semaines, avec les fondateurs.",
      includedTitle: "Ce que le pilote comprend",
      included: [
        "Un accès anticipé à chaque partie de REMI dès qu'elle devient réelle",
        "Des échanges directs avec l'équipe fondatrice",
        "Une influence réelle sur ce qui se construit, et dans quel ordre",
        "Votre approche reflétée dans la manière dont REMI guide vos patients",
      ],
      conditionsTitle: "Comment ça se passe",
      conditions: [
        "15 places, examinées personnellement — nous cherchons des praticiens engagés, pas des inscriptions",
        "Aucun engagement : quittez le pilote quand vous voulez",
        "Vos retours sont le cœur du programme — attendez-vous à ce qu'on vous les demande",
      ],
      pricingNote:
        "Les conditions du pilote, tarif compris, se finalisent avec les premiers praticiens. Rien n'est publié ici tant que ce n'est pas réel — demandez-nous où on en est.",
      action: { href: "/contact", label: "Candidater au pilote" },
    },
    cta: {
      title: "Quinze praticiens façonneront REMI. Soyez-en.",
      body: "Parlez-nous de votre pratique et de ce que deviennent vos recommandations après la consultation — cette conversation, c'est la candidature.",
      action: { href: "/contact", label: "Engager la conversation" },
    },
  },

  individuals: {
    meta: {
      title: "Pour vous — les conseils de votre praticien, enfin vivables",
      description:
        "REMI se construit pour traduire les recommandations de votre praticien en repas, habitudes et petits pas qui tiennent dans vos vraies journées — avec votre praticien dans la boucle.",
    },
    hero: {
      eyebrow: "Pour vous",
      title: "Vous savez quoi faire. REMI vous aide à le faire vraiment.",
      subtitle:
        "On sort de consultation plein de bonnes intentions — puis les courses, le travail et 19 h arrivent. REMI se construit pour vous soutenir entre les séances, en traduisant les recommandations de votre praticien en choses à cuisiner, à choisir et à répéter.",
      actions: [
        { href: "/contact", label: "Me tenir informé(e)", variant: "primary" },
        {
          href: "/practitioners",
          label: "Je suis praticien",
          variant: "outline",
        },
      ],
    },
    steps: {
      eyebrow: "Comment ça fonctionnera",
      title: "REMI s'utilise avec votre praticien, pas à sa place",
      items: [
        {
          title: "Votre praticien fixe le cap",
          body: "Vos recommandations viennent d'un humain qui vous connaît — REMI n'invente jamais son propre programme.",
        },
        {
          title: "REMI les rend quotidiennes",
          body: "Des idées de repas, des recettes adaptées, un petit pas à la fois — selon vos goûts, votre rythme et vos contraintes.",
        },
        {
          title: "Votre praticien reste proche",
          body: "Vos progrès et vos difficultés lui remontent, pour que la consultation suivante reparte de là où vous en êtes vraiment.",
        },
      ],
    },
    vision: {
      eyebrow: "Ce que nous construisons pour vous",
      title: "Un soutien qui tient dans de vraies journées",
      lead: "Voici ce que REMI est conçu pour apporter aux personnes accompagnées — en développement aujourd'hui, disponible seulement quand ce sera réellement au point.",
      items: [
        {
          icon: UtensilsCrossed,
          title: "Des repas qui suivent votre plan",
          body: "Des suggestions alignées sur ce que votre praticien a recommandé — pas un régime générique sorti de nulle part.",
          intent: "success",
        },
        {
          icon: ChefHat,
          title: "Des recettes que vous cuisinerez vraiment",
          body: "Adaptées à vos goûts, à votre temps et à ce qu'il y a dans votre cuisine — la recette parfaite qu'on saute n'aide personne.",
          intent: "primary",
        },
        {
          icon: Footprints,
          title: "Un pas à la fois",
          body: "Un changement progressif, à votre rythme. Des petites victoires qui s'additionnent, plutôt qu'une révolution de janvier qui s'effondre en mars.",
          intent: "info",
        },
        {
          icon: Stethoscope,
          title: "Jamais seul(e) avec tout ça",
          body: "Votre praticien voit comment ça se passe et peut ajuster — vous n'êtes plus livré(e) à vous-même entre deux rendez-vous.",
          intent: "primary",
        },
      ],
    },
    status: {
      title: "Où en est REMI aujourd'hui",
      body: "REMI n'est pas encore disponible. Il sera lancé d'abord avec un petit groupe de praticiens et les personnes qu'ils accompagnent. Si vous aimeriez que votre praticien en fasse partie — ou si vous voulez simplement savoir quand REMI ouvrira — laissez-nous un message.",
    },
    cta: {
      title: "Envie que votre praticien soit dans la boucle ?",
      body: "Dites-nous qui vous accompagne, ou demandez simplement à être tenu(e) informé(e) — nous vous préviendrons à l'ouverture de REMI.",
      action: { href: "/contact", label: "Laisser un message" },
    },
  },

  about: {
    meta: {
      title: "À propos — l'espace entre les conseils et la vraie vie",
      description:
        "REMI est construit en Belgique par Morgane Paquet et Arnaud Ruelle, en partenariat avec le Dr Georges Mouton (FunMedDev), sur une conviction : le plus dur n'est pas de savoir, c'est d'appliquer.",
    },
    intro: {
      eyebrow: "À propos de REMI",
      title: "L'espace entre les conseils et la vraie vie",
      lead: "Le changement ne se produit pas dans le cabinet de consultation. Il se produit au supermarché, dans la cuisine, un mardi à 19 h.",
      body: "REMI — Reprise En Main Individualisée — existe pour combler l'espace entre les conseils d'un praticien et le quotidien dans lequel ils atterrissent. REMI se construit en Belgique, d'abord pour les praticiens francophones et les personnes qu'ils accompagnent, avec le praticien fermement au centre.",
    },
    team: {
      eyebrow: "Qui le construit",
      title: "Deux fondateurs, une conviction",
      members: [
        {
          name: "Morgane Paquet",
          role: "Co-fondatrice — produit & nutrition",
          bio: "En formation de naturopathie et de nutrithérapie, portée par la manière dont les habitudes changent réellement — pas celle dont elles devraient changer.",
          quote:
            "Le plus grand défi n'est pas de savoir quoi faire. C'est de réussir à l'appliquer, durablement.",
          initials: "MP",
        },
        {
          name: "Arnaud Ruelle",
          role: "Co-fondateur — stratégie & développement",
          bio: "Un parcours entrepreneurial, à la construction de l'entreprise et de la plateforme produit derrière REMI.",
          quote:
            "La technologie doit donner plus de temps aux praticiens, et plus de soutien aux personnes qu'ils accompagnent.",
          initials: "AR",
        },
      ],
    },
    partnership: {
      eyebrow: "Partenariat",
      title: "Construit avec la médecine fonctionnelle dès le premier jour",
      body: "Le premier partenariat de REMI est celui conclu avec le Dr Georges Mouton, fondateur de la clinique FunMedDev et référence européenne en médecine fonctionnelle. Son expertise façonne la manière dont REMI transforme les recommandations d'un praticien en accompagnement quotidien, et des patients FunMedDev seront parmi les premiers utilisateurs pilotes.",
      points: [
        "Un partenariat signé avec la clinique FunMedDev",
        "Un accompagnement co-conçu avec l'expertise du Dr Mouton",
        "Un déploiement pilote prévu avec des patients FunMedDev",
      ],
      quote:
        "Personnalisation. Voilà, un mot. Et l'IA est un soutien à la personnalisation.",
      quoteAuthor: "Dr Georges Mouton",
      quoteRole: "Fondateur, FunMedDev — en échange avec l'équipe REMI",
    },
    principles: {
      eyebrow: "Notre manière de travailler",
      title: "Trois engagements auxquels ce site est tenu",
      items: [
        {
          title: "Le praticien reste la référence",
          body: "REMI amplifie le travail du praticien ; il ne le remplace jamais. Si une fonctionnalité devait brouiller cette ligne, elle ne serait pas construite.",
        },
        {
          title: "Uniquement des affirmations vraies",
          body: "Pas de témoignages inventés, pas de chiffres sans source, pas de fonctionnalités vendues avant d'exister. Ce que vous lisez ici est vérifiable.",
        },
        {
          title: "La confidentialité dès la conception",
          body: "Une entreprise belge, soumise au RGPD. Des données liées à la santé méritent le traitement le plus strict qui soit, dès la première ligne de code.",
        },
      ],
    },
    cta: {
      title: "Parlez à ceux qui le construisent",
      body: "Praticien, futur utilisateur, partenaire ou simple curieux — nous répondons nous-mêmes.",
      action: { href: "/contact", label: "Nous contacter" },
    },
  },

  contact: {
    meta: {
      title: "Contact",
      description:
        "Candidater au pilote praticiens, poser une question sur REMI, ou simplement dire bonjour — les fondateurs répondent personnellement.",
    },
    eyebrow: "Contact",
    title: "Parlons-en",
    lead: "Candidature au pilote, question sur REMI, partenariat ou presse — écrivez-nous, les fondateurs répondent personnellement. Merci de ne pas partager de données de santé personnelles ici : ce canal n'est pas clinique et nous ne pouvons pas vous conseiller.",
    people: [
      {
        name: "Morgane Paquet",
        role: "Co-fondatrice — produit & nutrition",
        email: "morgane@remiai.be",
        phone: "+32 486 12 46 83",
      },
      {
        name: "Arnaud Ruelle",
        role: "Co-fondateur — stratégie & développement",
        email: "arnaud@remiai.be",
        phone: "+32 486 16 31 55",
      },
    ],
    form: {
      name: "Votre nom",
      email: "E-mail",
      emailHint: "Nous répondons à cette adresse, et à rien d'autre.",
      message: "Comment pouvons-nous aider ?",
      consent: "J'accepte que REMI conserve ce message afin d'y répondre.",
      submit: "Envoyer le message",
      submitting: "Envoi…",
      successTitle: "Message bien reçu",
      successBody:
        "Merci — votre message est valide. L'envoi n'est pas encore raccordé, rien n'a donc été transmis ; écrivez-nous directement aux adresses ci-dessus.",
      errorBanner: "Merci de vérifier les champs ci-dessous.",
      errors: {
        name: "Dites-nous votre nom, s'il vous plaît.",
        emailMissing: "Indiquez-nous une adresse e-mail pour vous répondre.",
        emailInvalid: "Cela ne ressemble pas à une adresse e-mail.",
        message: "Un peu plus de détail nous permettra de mieux répondre.",
        consent: "Nous avons besoin de votre accord pour conserver ce message.",
      },
    },
  },
};
