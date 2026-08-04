import type { Conversation, QuickReply } from "./types";

/**
 * The messaging side of the loop, grounded in the same four people as
 * `clients.ts` — Camille holding her step, Thomas gone quiet under his
 * travelling, Naïma reporting a symptom nobody has answered yet. Pierre has not
 * accepted his invitation, so he has no thread: an empty roster row and an empty
 * inbox row are the same fact seen twice.
 *
 * Ordered most recent first, which is the order the practitioner's list renders.
 */
export const conversations: Conversation[] = [
  {
    id: "conv_thomas",
    clientId: "thomas",
    clientName: "Thomas Lemaire",
    firstName: "Thomas",
    initials: "TL",
    subject: "Retour après les déplacements",
    lastAt: "hier, 22h18",
    unread: 1,
    messages: [
      {
        id: "msg_thomas_1",
        author: "practitioner",
        day: "Vendredi 24 juillet",
        time: "09h05",
        body: "Thomas, je vois que rien n'a été appliqué cette semaine. Ce n'est pas un reproche : dites-moi surtout si l'étape ne tient pas avec vos déplacements, c'est elle qu'on ajustera.",
      },
      {
        id: "msg_thomas_2",
        author: "person",
        day: "Hier",
        time: "22h18",
        body: "Désolé pour le silence. Trois villes en cinq jours, j'ai mangé dans le train ou pas du tout. Je ne vois pas comment tenir un déjeuner assis avec ce rythme-là.",
      },
    ],
  },
  {
    id: "conv_camille",
    clientId: "camille",
    clientName: "Camille Dubois",
    firstName: "Camille",
    initials: "CD",
    subject: "Petit-déjeuner protéiné",
    lastAt: "hier, 19h42",
    unread: 1,
    messages: [
      {
        id: "msg_camille_1",
        author: "person",
        day: "Jeudi 30 juillet",
        time: "08h12",
        body: "Bonjour docteur. Quatrième matin d'affilée avec des œufs, ça passe beaucoup mieux que je ne pensais. Et je n'ai plus le coup de barre de onze heures.",
      },
      {
        id: "msg_camille_2",
        author: "practitioner",
        day: "Jeudi 30 juillet",
        time: "13h40",
        body: "C'est exactement ce qu'on cherchait, et le coup de barre en moins est le signe le plus parlant. Gardez ce rythme jusqu'au 19 : on regardera ensemble s'il est temps de passer à l'étape suivante.",
      },
      {
        id: "msg_camille_3",
        author: "person",
        day: "Hier",
        time: "19h42",
        body: "Une question sur la semaine prochaine : je suis en formation à Anvers du 10 au 12, petit-déjeuner à l'hôtel. Est-ce que je laisse tomber ces trois matins, ou est-ce qu'il y a quelque chose à viser sur un buffet ?",
      },
    ],
  },
  {
    id: "conv_naima",
    clientId: "naima",
    clientName: "Naïma Benali",
    firstName: "Naïma",
    initials: "NB",
    subject: "Ballonnements les jours de bureau",
    lastAt: "samedi, 12h32",
    unread: 2,
    messages: [
      {
        id: "msg_naima_1",
        author: "person",
        day: "Samedi 1er août",
        time: "12h30",
        body: "Troisième fois cette semaine : ballonnements en début d'après-midi, uniquement les jours où je déjeune au bureau. À la maison, rien du tout.",
      },
      {
        id: "msg_naima_2",
        author: "person",
        day: "Samedi 1er août",
        time: "12h32",
        body: "Je prends le kéfir le matin dans les deux cas, donc je ne pense pas que ça vienne de l'aliment fermenté.",
      },
    ],
  },
];

/** The thread the person's side renders — Camille is who that surface is. */
export const personConversationId = "conv_camille";

/**
 * What REMI proposes above the composer, per thread — drawn from the plan in
 * flight and the practitioner's préceptes rather than from the last message
 * alone. None of them is a send: they land in the box, and the practitioner
 * still writes the reply.
 *
 * Keyed by conversation on purpose. The same three chips under every thread
 * would show a stakeholder a widget; chips that know Camille has a buffet
 * problem and Thomas has an untenable step show them the argument.
 *
 * Camille's answers contain no nuts, which is not a coincidence — her file
 * records the allergy. Naïma's lead with a question rather than a change,
 * because "les causes avant les symptômes" is one of the frame's principles.
 */
export const assistSuggestions: Record<string, QuickReply[]> = {
  conv_camille: [
    {
      id: "sug_camille_adapt",
      label: "Adapter à l'hôtel",
      text: "Sur un buffet, visez deux œufs durs ou du fromage blanc nature, et laissez le reste. L'idée n'est pas d'être parfaite ces trois matins-là, c'est de ne pas repartir de zéro au retour.",
    },
    {
      id: "sug_camille_reassure",
      label: "Rassurer sur l'écart",
      text: "Trois matins sur un rythme de quatorze ne cassent rien. Notez simplement ce que vous avez pu prendre là-bas, et on en reparle le 19.",
    },
    {
      id: "sug_camille_defer",
      label: "Garder pour la consultation",
      text: "Bonne question, et je préfère qu'on la regarde ensemble le 19 août avec ce que la formation aura donné. D'ici là, tenez le rythme sur les matins où vous êtes chez vous.",
    },
  ],
  conv_thomas: [
    {
      id: "sug_thomas_shrink",
      label: "Réduire l'étape",
      text: "On descend l'étape à ce qui tient : un déjeuner assis les deux jours où vous êtes au bureau, rien d'attendu les jours de train. Une étape qu'on ne peut pas appliquer n'est pas une étape.",
    },
    {
      id: "sug_thomas_fallback",
      label: "Proposer un repli",
      text: "Les jours de déplacement, on ne vise plus le repas assis : on vise de ne pas sauter. Quelque chose de simple pris en gare compte, et vous le notez comme appliqué.",
    },
    {
      id: "sug_thomas_advance",
      label: "Avancer la consultation",
      text: "Plutôt que d'attendre le 11, voyons-nous vingt minutes cette semaine pour retailler l'étape ensemble. Dites-moi ce qui vous arrange.",
    },
  ],
  conv_naima: [
    {
      id: "sug_naima_detail",
      label: "Demander le détail",
      text: "Avant de changer quoi que ce soit : que mangez-vous ces jours-là au bureau, et en combien de temps ? Le lieu compte souvent moins que ce qu'il y a dans l'assiette et le temps qu'on y met.",
    },
    {
      id: "sug_naima_kefir",
      label: "Écarter le kéfir",
      text: "Vous avez raison de le noter : le kéfir est pris les deux jours, il n'explique donc pas la différence. On cherche du côté de ce qui change entre le bureau et la maison.",
    },
    {
      id: "sug_naima_pause",
      label: "Suspendre l'étape",
      text: "Mettons l'aliment fermenté en pause trois jours, le temps de voir si les ballonnements suivent ou non. On reprendra ensuite, plus doucement.",
    },
  ],
};

/** The person's side of the same row: the two things she writes most often. */
export const quickReplies: QuickReply[] = [
  {
    id: "quick_question",
    label: "J'ai une question sur mon plan",
    text: "J'ai une question sur mon plan : ",
  },
  {
    id: "quick_blocked",
    label: "Je n'ai pas pu suivre l'étape",
    text: "Je n'ai pas pu suivre l'étape cette semaine. Voici ce qui s'est passé : ",
  },
  {
    id: "quick_good",
    label: "Tout s'est bien passé",
    text: "Tout s'est bien passé cette semaine, je continue comme ça.",
  },
];
