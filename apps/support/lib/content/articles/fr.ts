import type { Article } from "../types";

/**
 * Les articles français — le marché de lancement.
 *
 * Mêmes règles que la version anglaise : chaque affirmation est vérifiée contre
 * le produit, pas contre la feuille de route. Là où une capacité n'existe pas,
 * l'article le dit dans un encadré `warning` plutôt que de la décrire au futur
 * en espérant que le lecteur le remarque.
 *
 * Les `slug` sont identiques à l'anglais : le sélecteur de langue remplace le
 * préfixe et garde le reste du chemin, donc un slug traduit enverrait le lecteur
 * sur une 404 au milieu d'un article.
 */
export const articles: Article[] = [
  /* ---------------------------------------------------------------- premiers pas */
  {
    slug: "what-remi-does",
    category: "getting-started",
    title: "Ce qu'est REMI, et ce qu'il n'est pas",
    summary:
      "REMI transforme les recommandations de votre praticien en repas et en petits pas quotidiens. Il ne diagnostique pas, ne traite pas et ne remplace pas la personne qui vous suit.",
    updated: "2026-08-03",
    related: ["how-your-plan-reaches-you", "what-your-practitioner-sees"],
    blocks: [
      {
        kind: "paragraph",
        text: "Vous sortez d'une consultation en sachant quoi faire. Puis la semaine arrive — les courses, le travail, 19 h un mardi — et le conseil parfaitement clair lundi a disparu jeudi. REMI existe pour cet espace-là, et pour rien d'autre.",
      },
      {
        kind: "paragraph",
        text: "C'est un copilote bien-être : votre praticien donne la direction, REMI vous aide à l'appliquer entre deux consultations. Il s'utilise avec un praticien, jamais à sa place.",
      },
      { kind: "heading", id: "what-it-does", text: "Ce que REMI fait" },
      {
        kind: "columns",
        columns: [
          {
            intent: "success",
            title: "REMI fait ceci",
            items: [
              "Transformer les recommandations validées par votre praticien en un plan écrit dans des mots sur lesquels vous pouvez agir",
              "Proposer des repas et des recettes qui restent dans ces recommandations, adaptés à vos goûts, à votre temps et à votre cuisine",
              "Vous donner un seul petit pas à la fois, et attendre qu'il tienne avant de proposer le suivant",
              "Renvoyer des signaux de progression à votre praticien, pour que la consultation suivante parte de ce qui s'est réellement passé",
            ],
          },
          {
            intent: "error",
            title: "REMI ne fait jamais ceci",
            items: [
              "Diagnostiquer. REMI ne se forme aucune opinion clinique et n'en donne aucune.",
              "Traiter ou prescrire. Aucun dosage, aucun complément de sa propre initiative, aucune modification de ce qu'un praticien ou un médecin a décidé.",
              "Remplacer un suivi professionnel. Il est fait pour vous renvoyer vers votre praticien, pas pour vous garder dans une application.",
              "Inventer son propre programme. Sans les recommandations d'un praticien derrière lui, REMI n'a rien à accompagner.",
            ],
          },
        ],
      },
      {
        kind: "note",
        intent: "warning",
        title: "REMI n'est pas un avis médical",
        body: "REMI aide à appliquer les recommandations d'un praticien. Il ne diagnostique pas, ne traite pas et ne remplace pas un suivi professionnel — tout ce qui est clinique relève de votre praticien. Si quelque chose a changé dans votre santé, ou si un symptôme vous inquiète, contactez-le, ou votre médecin. N'attendez pas qu'une suggestion dans l'application vous dise quoi faire.",
      },
      {
        kind: "heading",
        id: "not-a-diet-app",
        text: "Pourquoi ce n'est pas une application de régime",
      },
      {
        kind: "paragraph",
        text: "Une application de régime décide de ce que vous devriez manger. REMI n'a aucun avis propre là-dessus. Chaque repas proposé est traçable jusqu'à une recommandation qu'un praticien a écrite et validée — l'écran des repas affiche cette ligne sur chaque carte, sous « parce que votre praticien a recommandé ». Si personne ne l'a recommandé, REMI ne le propose pas.",
      },
      {
        kind: "paragraph",
        text: "Dans l'autre sens, c'est la même logique. Votre praticien pose un cadre thérapeutique : les règles de sa propre pratique, et une liste absolue de ce qui ne doit jamais être suggéré. REMI génère strictement à l'intérieur de ce cadre. En dehors, il n'improvise pas : il dit qu'il ne peut pas, et renvoie vers la personne qui, elle, peut.",
      },
      { kind: "heading", id: "today", text: "Où en est REMI aujourd'hui" },
      {
        kind: "paragraph",
        text: "REMI est en pré-lancement. Il se construit avec une première cohorte de praticiens et n'est pas ouvert au public : on y accède par un praticien qui participe au pilote. Une partie de ce que décrit ce centre d'aide fonctionne, une partie se construit encore, et chaque article dit lequel des deux.",
      },
      {
        kind: "action",
        body: "Le site principal en donne la version complète : ce qui est en développement, ce qui est conçu mais pas construit, et ce à quoi aucune date n'est attachée.",
        link: {
          target: "marketing",
          path: "/",
          label: "Lire le site principal",
        },
      },
    ],
  },
  {
    slug: "joining-the-pilot",
    category: "getting-started",
    title: "Rejoindre le pilote",
    summary:
      "REMI n'est pas ouvert au public. Deux entrées : postuler comme praticien, ou être invité par un praticien déjà dans la cohorte.",
    updated: "2026-08-01",
    related: ["signing-in", "contacting-support"],
    blocks: [
      {
        kind: "paragraph",
        text: "La première version de REMI se construit avec un groupe volontairement restreint : quinze praticiens, choisis une conversation à la fois. Ce ne sont pas des bêta-testeurs sur une liste de diffusion — ils décident de ce qui se construit, et dans quel ordre.",
      },
      {
        kind: "heading",
        id: "practitioners",
        text: "Si vous êtes praticien",
      },
      {
        kind: "steps",
        items: [
          {
            title: "Écrivez-nous",
            body: "Via le formulaire de contact du site principal. Parlez-nous de votre pratique et de ce que deviennent vos recommandations après la consultation — c'est cela, la candidature, et elle est lue par un fondateur plutôt que par un formulaire.",
          },
          {
            title: "On se parle",
            body: "Une vraie conversation, pas un entretien de sélection. Les places sont étudiées personnellement : nous cherchons des praticiens engagés, pas des inscriptions.",
          },
          {
            title: "On vous installe",
            body: "Pendant le pilote, l'accès est mis en place avec vous, directement. Il n'y a volontairement aucune page d'inscription automatique.",
          },
          {
            title: "Vous continuez à le façonner",
            body: "Attendez-vous à ce qu'on vous demande votre avis toutes les deux semaines. Cet échange est la raison d'être du pilote, pas une politesse.",
          },
        ],
      },
      {
        kind: "note",
        intent: "info",
        title: "Aucun engagement, et pas encore de prix",
        body: "Vous pouvez quitter le pilote quand vous voulez. Les conditions du pilote — y compris ce qu'il coûtera — se décident avec les premiers praticiens plutôt qu'elles ne leur sont annoncées : vous ne trouverez donc aucun chiffre sur une page REMI tant qu'il n'y en a pas un vrai.",
      },
      {
        kind: "heading",
        id: "individuals",
        text: "Si vous êtes suivi par un praticien",
      },
      {
        kind: "paragraph",
        text: "Vous ne pouvez pas rejoindre REMI seul, et c'est délibéré : sans les recommandations d'un praticien derrière, il n'y a pas de plan à accompagner. Vous arrivez par le praticien qui vous suit, et c'est lui qui vous invite.",
      },
      {
        kind: "list",
        items: [
          "Si votre praticien participe déjà au pilote, demandez-lui de vous inviter — l'invitation part de son côté.",
          "S'il n'y participe pas, dites-nous qui vous suit et nous le contacterons.",
          "Si vous voulez simplement savoir quand REMI s'ouvrira plus largement, écrivez-nous et nous vous tiendrons au courant.",
        ],
      },
      {
        kind: "action",
        body: "Tout cela passe par une seule porte d'entrée : le formulaire de contact du site principal. Les fondateurs y répondent eux-mêmes.",
        link: { target: "marketing", path: "/contact", label: "Nous écrire" },
      },
    ],
  },
  {
    slug: "contacting-support",
    category: "getting-started",
    title: "Contacter l'aide",
    summary:
      "Une seule porte d'entrée : le formulaire de contact du site principal, lu par les fondateurs. Ce qu'il faut mettre dans un message, et ce qu'il ne faut pas.",
    updated: "2026-08-03",
    related: ["joining-the-pilot", "what-remi-does"],
    blocks: [
      {
        kind: "paragraph",
        text: "REMI a une seule voie de contact pour tout le produit, sur le site principal. L'équipe est petite et lit tout : un message tombe sur une personne, pas sur une file d'attente. Il n'y a volontairement pas de seconde adresse — une deuxième porte d'entrée devient vite celle que personne ne relève.",
      },
      {
        kind: "heading",
        id: "what-to-say",
        text: "Quoi mettre dans un message",
      },
      {
        kind: "list",
        items: [
          "Ce que vous cherchiez à faire, avec vos mots — l'écran où vous étiez est plus utile que le nom de la fonctionnalité.",
          "Ce qui s'est passé à la place, et ce que vous attendiez.",
          "Si vous êtes praticien ou si vous êtes suivi par un praticien. Les deux côtés de REMI ne se comportent pas pareil, et cela change la réponse.",
          "La langue dans laquelle vous utilisez REMI, si le problème porte sur la formulation de quelque chose.",
        ],
      },
      {
        kind: "note",
        intent: "warning",
        title: "N'envoyez pas de détails de santé personnels",
        body: "Le formulaire de contact n'est pas un canal clinique et l'équipe ne peut rien conseiller de clinique. Symptômes, médicaments, résultats, un changement dans ce que vous ressentez : cela relève de votre praticien ou de votre médecin, qui vous connaissent et peuvent agir. Si votre question porte sur votre plan lui-même plutôt que sur le logiciel, ils sont aussi la réponse la plus rapide.",
      },
      {
        kind: "heading",
        id: "delivery",
        text: "Une réserve honnête sur le formulaire",
      },
      {
        kind: "paragraph",
        text: "Le formulaire de contact vérifie ce que vous écrivez, mais son envoi n'est pas encore branché : aucun prestataire e-mail n'a été choisi, donc valider le formulaire n'envoie rien. Le formulaire le dit lui-même sur son écran de confirmation, et les adresses des deux fondateurs figurent sur la même page. En attendant, écrivez directement à l'un d'eux.",
      },
      {
        kind: "action",
        body: "Les adresses et le formulaire sont tous les deux sur la page de contact.",
        link: {
          target: "marketing",
          path: "/contact",
          label: "Ouvrir la page de contact",
        },
      },
      {
        kind: "heading",
        id: "reply",
        text: "Ce qui se passe après votre message",
      },
      {
        kind: "paragraph",
        text: "Un fondateur répond à l'adresse depuis laquelle vous avez écrit, et à aucune autre. Si la réponse s'avère être quelque chose que ce centre d'aide aurait dû vous dire, l'article qui vous aurait évité le message est écrit. C'est à cela que sert ce centre d'aide : il se mesure aux questions qu'il évite, pas à celles qu'il collecte.",
      },
    ],
  },

  /* ------------------------------------------------------------- plan et repas */
  {
    slug: "how-your-plan-reaches-you",
    category: "plan-and-meals",
    title: "Comment le plan de votre praticien vous parvient",
    summary:
      "Des notes de consultation au plan sur votre écran : ce que REMI structure, ce que votre praticien valide, et ce qui ne vous parvient jamais.",
    updated: "2026-08-03",
    related: ["understanding-your-step", "what-your-practitioner-sees"],
    blocks: [
      {
        kind: "paragraph",
        text: "Rien n'apparaît dans votre espace sans que votre praticien l'ait validé. Le chemin de ses notes à votre écran comporte une porte, et c'est lui qui la tient.",
      },
      { kind: "heading", id: "the-path", text: "Le chemin, étape par étape" },
      {
        kind: "steps",
        items: [
          {
            title: "La consultation se déroule comme toujours",
            body: "Votre praticien écoute, décide et rédige ses notes exactement comme il le fait déjà. REMI n'y change rien, et ne modifie jamais ce qu'il a écrit.",
          },
          {
            title: "REMI structure les notes",
            body: "Il lit les notes et propose une liste de recommandations distinctes, chacune avec un titre, un détail court et une catégorie : nutrition, habitude, complément, activité ou suivi.",
          },
          {
            title: "Votre praticien valide, ligne par ligne",
            body: "Il coche ce qui est juste et décoche le reste. Ce qui est décoché reste un brouillon et ne quitte jamais son écran. C'est la porte : REMI propose, un humain décide.",
          },
          {
            title: "Il publie le plan",
            body: "La publication envoie les recommandations validées dans votre espace, où elles deviennent votre plan, vos repas de la semaine et vos pas. Publier un nouveau plan remplace le précédent.",
          },
        ],
      },
      {
        kind: "note",
        intent: "success",
        title: "Les recommandations non validées ne vous parviennent pas",
        body: "Votre côté de REMI filtre les brouillons plutôt que de faire confiance au fait que seules les recommandations validées aient été écrites. Si une recommandation a été évoquée en consultation mais n'est pas dans votre plan, c'est que votre praticien ne l'a pas validée — demandez-lui, plutôt que de supposer qu'elle s'est perdue.",
      },
      {
        kind: "heading",
        id: "what-you-see",
        text: "Ce qui arrive de votre côté",
      },
      {
        kind: "list",
        items: [
          "Mon plan — chaque recommandation validée, groupée par catégorie, avec la date de la consultation d'où elle vient et la date de la prochaine révision.",
          "Repas — une semaine de suggestions construites à partir de ce plan, chaque carte portant la recommandation qu'elle honore, avec une liste de courses rangée comme le magasin, pas comme les recettes.",
          "Pas — les recommandations transformées en un seul changement à la fois, dans l'ordre.",
          "Aujourd'hui — le pas sur lequel vous êtes en ce moment, et où vous en êtes dedans.",
        ],
      },
      {
        kind: "heading",
        id: "changes",
        text: "Quand le plan change",
      },
      {
        kind: "paragraph",
        text: "Un plan n'est pas définitif. Il porte une date de révision, et votre praticien peut en publier un nouveau après n'importe quelle consultation — ou avant la suivante, si quelque chose ne fonctionne manifestement pas. Le nouveau plan remplace alors entièrement l'ancien : ce que vous voyez est toujours la version en cours, pas des archives à lire à l'envers.",
      },
      {
        kind: "note",
        intent: "warning",
        title: "Pas encore construit : demander un changement depuis REMI",
        body: "Il n'y a aujourd'hui aucune messagerie entre vous et votre praticien dans REMI — la messagerie sécurisée est conçue mais pas construite. Si une recommandation ne vous convient pas, dites-le-lui comme vous le faites déjà, par son canal habituel ou à la prochaine consultation.",
      },
    ],
  },
  {
    slug: "understanding-your-step",
    category: "plan-and-meals",
    title: "Comprendre votre pas quotidien",
    summary:
      "Un seul changement à la fois, avec un nombre de jours à atteindre. Ce que l'écran montre, ce que veulent dire les statuts, et comment un jour est compté.",
    updated: "2026-08-02",
    related: ["how-your-plan-reaches-you", "logging-meals"],
    blocks: [
      {
        kind: "paragraph",
        text: "REMI ne vous demande jamais de tout changer dès le premier jour. Votre plan est découpé en pas, et un seul est actif à la fois — le suivant attend que celui en cours tienne. C'est toute la thèse du produit sur les habitudes, et c'est pourquoi votre écran paraît plus vide qu'une liste de tâches.",
      },
      { kind: "heading", id: "anatomy", text: "De quoi un pas est fait" },
      {
        kind: "list",
        items: [
          "Un titre — un changement concret, assez petit pour être fait sans réorganiser votre vie. « Un aliment fermenté par jour », pas « améliorer votre digestion ».",
          "Un pourquoi — le fil qui remonte à la consultation, dans vos mots plutôt que dans le raccourci du praticien.",
          "Un objectif : le nombre de jours au bout duquel le pas est considéré comme tenu.",
          "Le nombre de jours appliqués jusqu'ici, affiché sous forme de barre sur Aujourd'hui et sur Pas.",
        ],
      },
      { kind: "heading", id: "statuses", text: "Les quatre statuts" },
      {
        kind: "list",
        items: [
          "À venir — inscrit dans votre plan, il attend son tour. Il ne vous demande encore rien.",
          "En cours — le seul pas actif. Aujourd'hui l'affiche, et rien d'autre ne lui fait concurrence.",
          "Tenu — vous avez atteint l'objectif. Il reste dans votre routine, et le pas suivant démarre.",
          "Passé — mis de côté, pas raté. Un pas qui ne rentre pas dans votre vie dit quelque chose sur le pas ; votre praticien le voit et peut en choisir un autre.",
        ],
      },
      {
        kind: "note",
        intent: "info",
        title: "Un pas qui bloque retient la file",
        body: "REMI n'enterre pas un pas difficile sous les quatre suivants. Si un pas n'est pas appliqué, il reste actif et remonte du côté de votre praticien comme un point de blocage — c'est le moment de changer le pas, pas d'en ajouter un.",
      },
      {
        kind: "heading",
        id: "counting",
        text: "Comment un jour est compté",
      },
      {
        kind: "paragraph",
        text: "C'est la partie encore en discussion avec la cohorte pilote, et cela mérite d'être dit clairement : il n'existe aujourd'hui aucun bouton dans REMI pour marquer une journée comme faite. L'écran montre le pas, son objectif et sa progression, mais la façon dont un jour se comptabilise se conçoit avec les premiers praticiens plutôt qu'elle ne s'improvise.",
      },
      {
        kind: "note",
        intent: "warning",
        title: "Si le compte vous semble faux, dites-le",
        body: "Pendant le pilote, partez du principe que le chiffre affiché est un point de départ de conversation plutôt qu'une mesure de votre semaine. Racontez à votre praticien ce qui s'est réellement passé : c'est cette version-là qui compte, et c'est sur elle qu'il agit.",
      },
    ],
  },
  {
    slug: "logging-meals",
    category: "plan-and-meals",
    title: "Enregistrer ses repas",
    summary:
      "Ce que l'écran des repas fait aujourd'hui — une semaine de suggestions et une liste de courses — et la réponse honnête sur l'enregistrement de ce que vous avez mangé.",
    updated: "2026-08-02",
    related: ["understanding-your-step", "how-your-plan-reaches-you"],
    blocks: [
      {
        kind: "note",
        intent: "warning",
        title: "L'enregistrement des repas n'est pas encore construit",
        body: "REMI vous montre des repas ; il ne peut pas encore enregistrer ceux que vous avez mangés. Il n'y a pas de bouton pour marquer un repas comme cuisiné ou passé, et l'enregistrement d'un repas à partir d'une photo est conçu mais pas construit. Si vous cherchiez cela, la fin de cet article dit quoi faire en attendant ; le reste décrit ce que l'écran fait aujourd'hui.",
      },
      {
        kind: "heading",
        id: "what-exists",
        text: "Ce que fait l'écran des repas",
      },
      {
        kind: "paragraph",
        text: "Repas affiche une semaine de suggestions construites à partir du plan publié par votre praticien : petit-déjeuner, déjeuner, dîner et collations, répartis par jour. C'est une proposition pour la semaine, pas une prescription — vous cuisinez ce qui rentre.",
      },
      {
        kind: "list",
        items: [
          "Chaque carte nomme la recommandation qu'elle honore, sous « parce que votre praticien a recommandé ». Une suggestion qu'on ne peut pas remonter jusqu'à une consultation, REMI ne la fait pas.",
          "Chaque recette porte son temps, le nombre de parts, ses ingrédients et sa méthode.",
          "La liste de courses rassemble les ingrédients de la semaine et les range comme le magasin est agencé, pas comme les recettes sont écrites.",
          "Rien de ce que votre praticien a exclu dans son cadre thérapeutique ne peut apparaître ici, pour aucune des personnes qu'il suit.",
        ],
      },
      {
        kind: "heading",
        id: "swapping",
        text: "Un repas que vous ne pouvez ou ne voulez pas manger",
      },
      {
        kind: "paragraph",
        text: "Passez-le. Une suggestion ignorée ne coûte rien, et la recette parfaite que vous ne cuisinez jamais n'aide personne. Ce qui compte, c'est la recommandation derrière : si la raison du refus est structurelle plutôt qu'une affaire de goût, cela vaut la peine d'en parler à votre praticien — une allergie, une intolérance, un aliment que vous ne mangerez jamais, une semaine où cuisiner n'arrivera pas.",
      },
      {
        kind: "note",
        intent: "info",
        title: "Allergies et exclusions appartiennent au plan",
        body: "REMI s'adapte à ce qu'on lui a dit. Ce qui ne doit jamais vous être suggéré appartient à ce que votre praticien consigne à votre sujet, pas à un filtre que vous réglez une fois en espérant qu'il tienne — dites-le-lui, et cela s'applique à toutes les suggestions à partir de là.",
      },
      {
        kind: "heading",
        id: "meanwhile",
        text: "En attendant l'enregistrement",
      },
      {
        kind: "list",
        items: [
          "Faites simple : notez ce que vous avez remplacé et pourquoi, avec ce que vous utilisez déjà pour noter les choses.",
          "Apportez-le en consultation. C'est l'information que votre praticien ne peut obtenir autrement pour l'instant.",
          "Si toute une semaine est partie de travers, dites-le plutôt que de la reconstituer. Un praticien lit « trois jours de déplacement » plus utilement qu'un journal reconstruit de mémoire.",
        ],
      },
    ],
  },

  /* ------------------------------------------------------------- praticiens */
  {
    slug: "setting-up-the-frame",
    category: "practitioners",
    title: "Poser le cadre thérapeutique",
    summary:
      "Vos préceptes, une liste d'exclusions absolue et les aliments que vous favorisez. Le cadre est ce qui fait de REMI un copilote de votre pratique plutôt qu'une application de régime.",
    updated: "2026-08-03",
    related: ["reading-progress-signals", "invite-someone-you-support"],
    blocks: [
      {
        kind: "paragraph",
        text: "Le cadre thérapeutique, c'est là où vous dites à REMI comment votre pratique fonctionne. Tout ce qu'il génère pour les personnes que vous suivez — repas, pas, encouragements — est produit à l'intérieur de ce cadre. En dehors, REMI n'improvise pas : il décline et renvoie vers vous.",
      },
      {
        kind: "paragraph",
        text: "Le cadre est un ensemble d'interrupteurs et de listes plutôt qu'un champ de texte libre, et c'est délibéré. Une description en prose de votre approche serait un prompt, et un prompt n'est pas une limite. Une règle que vous voyez, que vous activez et désactivez, est une règle que vous pouvez vérifier.",
      },
      { kind: "heading", id: "three-parts", text: "Les trois parties" },
      {
        kind: "steps",
        items: [
          {
            title: "Préceptes",
            body: "Les règles de votre propre pratique, chacune avec un titre et le détail derrière, chacune active ou non. Un précepte inactif n'est pas la même chose qu'un précepte jamais écrit : il dit que vous l'avez considéré et écarté pour l'instant, et l'écran montre les deux.",
          },
          {
            title: "Jamais suggéré",
            body: "Une limite absolue, appliquée à toutes les personnes que vous suivez. Ingrédients, familles d'aliments, approches entières — rien de cette liste ne peut apparaître dans une suggestion, et les préférences d'une personne ne peuvent pas passer outre.",
          },
          {
            title: "Favorisé",
            body: "Une préférence plutôt qu'une règle. Là où REMI a un vrai choix entre plusieurs options, il commence par ici.",
          },
        ],
      },
      {
        kind: "heading",
        id: "effects",
        text: "Ce que le cadre change concrètement",
      },
      {
        kind: "paragraph",
        text: "L'écran du cadre affiche ses effets en phrases claires plutôt que de vous laisser les déduire — par exemple : aucune recette suggérée ne contient un aliment exclu, pour aucune des personnes que vous suivez ; un seul pas est actif à la fois, et REMI n'en propose pas un deuxième tant que le premier ne tient pas ; les suggestions du premier mois portent sur la digestion, quelle que soit la raison de la consultation. Ces phrases sont générées à partir de votre cadre : elles changent quand il change.",
      },
      {
        kind: "note",
        intent: "info",
        title: "Le cadre vaut pour la pratique, pas par personne",
        body: "Il s'applique à toutes les personnes que vous suivez. Ce qui est propre à l'une d'elles — ses allergies, ce qu'elle n'aime pas, pour qui elle cuisine, le temps dont elle dispose en semaine — vit dans son profil et dans le plan que vous publiez pour elle. Deux leviers distincts, volontairement : l'un décrit votre pratique, l'autre décrit une personne.",
      },
      {
        kind: "note",
        intent: "warning",
        title: "Pas encore construit : enregistrer un cadre",
        body: "L'éditeur de cadre est dans le produit et vous pouvez le manipuler, mais aucun prestataire de stockage n'a été choisi : les modifications ne sont pas conservées d'une visite à l'autre. Pendant le pilote, dites-nous le cadre que vous voulez et nous le mettons en place avec vous — et attendez-vous à ce que ce soit l'une des premières choses à changer.",
      },
    ],
  },
  {
    slug: "reading-progress-signals",
    category: "practitioners",
    title: "Lire les signaux de progression",
    summary:
      "Ce qui remonte entre deux consultations : quatre types de signaux, trois niveaux, et ce qu'un signal n'est délibérément pas.",
    updated: "2026-08-03",
    related: ["setting-up-the-frame", "what-your-practitioner-sees"],
    blocks: [
      {
        kind: "paragraph",
        text: "Entre deux séances, vous êtes normalement aveugle : aucune vue sur ce qui a été appliqué, ce qui a été mal compris, et l'endroit où quelqu'un a discrètement abandonné. Les signaux de progression répondent à cela — de petites observations qui remontent, pour que la consultation suivante parte de faits plutôt que de souvenirs.",
      },
      { kind: "heading", id: "kinds", text: "Les quatre types" },
      {
        kind: "list",
        items: [
          "Adhésion — le pas en cours est-il appliqué, et à quel rythme.",
          "Difficulté — quelque chose signalé comme difficile, avec le motif autour quand il y en a un.",
          "Engagement — la relation à REMI lui-même : une invitation non acceptée, un silence qui dure.",
          "Réussite — un pas tenu, une série, quelque chose qui a marché et qu'il vaut la peine de nommer à la séance suivante.",
        ],
      },
      { kind: "heading", id: "severity", text: "Les trois niveaux" },
      {
        kind: "columns",
        columns: [
          {
            intent: "success",
            title: "Ce qu'un niveau signifie",
            items: [
              "Positif — bon à voir, et bon à renvoyer à la personne.",
              "Neutre — du contexte. Il explique un chiffre sans rien vous demander.",
              "À regarder — les points de blocage. Ils alimentent la liste « ce qui demande votre attention » sur votre écran de pratique, pour qu'une personne qui se tait ne dépende pas de votre mémoire.",
            ],
          },
          {
            intent: "error",
            title: "Ce qu'un signal n'est pas",
            items: [
              "Pas un diagnostic. Un signal est une observation datée, pas une conclusion clinique.",
              "Pas une note. Il n'y a aucun classement des personnes que vous suivez, et aucune note attachée à quelqu'un.",
              "Pas une alerte à traiter sur-le-champ. « À regarder » veut dire « à voir avant sa consultation », pas « quelque chose ne va pas maintenant ».",
              "Pas un substitut à la question. Le récit de la personne reste la meilleure source, et REMI est fait pour vous y ramener.",
            ],
          },
        ],
      },
      { kind: "heading", id: "where", text: "Où apparaissent les signaux" },
      {
        kind: "list",
        items: [
          "Ma pratique — « depuis la dernière fois » rassemble les signaux récents de toutes les personnes que vous suivez, et « ce qui demande votre attention » liste celles à regarder avant leur consultation.",
          "La fiche client — les signaux depuis sa dernière consultation, à côté du pas en cours et de son avancement.",
          "Un signal est rattaché à ce qui l'a produit quand il y a quelque chose à rattacher : un pas, un repas. Quand il n'y a rien — une invitation restée sans réponse — il le dit plutôt que d'inventer une source.",
        ],
      },
      {
        kind: "note",
        intent: "warning",
        title: "L'éventail des signaux est plus étroit qu'il ne le sera",
        body: "Les signaux sont générés à partir de ce que le côté « personne » de REMI enregistre, et l'enregistrement est justement la partie en construction : pas d'enregistrement des repas, et aucun moyen de marquer une journée comme faite. Pendant le pilote, lisez les signaux comme une image partielle, et continuez à poser les questions que vous posez déjà.",
      },
    ],
  },
  {
    slug: "invite-someone-you-support",
    category: "practitioners",
    title: "Inviter une personne que vous accompagnez",
    summary:
      "Les invitations partent de votre côté, jamais du nôtre. Les quatre statuts par lesquels passe une personne, et quoi faire tant que l'e-mail d'invitation n'est pas branché.",
    updated: "2026-08-01",
    related: ["setting-up-the-frame", "joining-the-pilot"],
    blocks: [
      {
        kind: "paragraph",
        text: "Personne n'arrive seul dans REMI. Une personne est invitée par le praticien qui la suit, et l'accès qui suit est limité à cette relation : vous voyez les personnes que vous accompagnez, et personne d'autre.",
      },
      { kind: "heading", id: "statuses", text: "Les quatre statuts" },
      {
        kind: "list",
        items: [
          "Invitée — l'invitation est partie et n'a pas encore été acceptée. Si cela dure, cela remonte comme un signal d'engagement plutôt que de dormir dans une liste.",
          "Active — elle est entrée, avec un plan publié ou en route.",
          "En pause — l'accompagnement est suspendu. Rien n'est supprimé, et rien ne lui est demandé entre-temps.",
          "Terminée — la relation est finie. L'accès s'arrête en même temps que la relation qui le justifiait.",
        ],
      },
      {
        kind: "heading",
        id: "before",
        text: "Ce qu'il vaut mieux avoir avant d'inviter",
      },
      {
        kind: "list",
        items: [
          "Votre cadre thérapeutique, au moins dans les grandes lignes — c'est à l'intérieur de lui que sera générée chaque suggestion qu'elle verra.",
          "Une consultation à partir de laquelle publier un plan. Une invitation sans plan derrière ouvre un espace vide et ne donne aucune raison d'y revenir.",
          "Un mot en consultation sur ce qu'est REMI, et ce qu'il n'est pas. Le premier article de ce centre d'aide est écrit pour être lu par elle, et c'est un endroit raisonnable où l'envoyer.",
        ],
      },
      {
        kind: "note",
        intent: "warning",
        title: "Pas encore construit : l'envoi de l'invitation par e-mail",
        body: "Aucun prestataire e-mail n'est engagé : REMI n'envoie donc pas réellement d'invitation aujourd'hui — la mécanique est en place et rien n'en sort. Pendant le pilote, dites-nous qui vous voulez intégrer et nous organisons son accès avec vous, directement.",
      },
      {
        kind: "action",
        body: "Cette demande passe par la même porte d'entrée que le reste.",
        link: { target: "marketing", path: "/contact", label: "Nous écrire" },
      },
    ],
  },

  /* -------------------------------------------------------- compte et facturation */
  {
    slug: "signing-in",
    category: "account-and-billing",
    title: "Se connecter et récupérer l'accès",
    summary:
      "Comment on entre dans REMI pendant le pilote, pourquoi il n'y a pas de page d'inscription, et quoi faire quand vous ne pouvez plus entrer.",
    updated: "2026-08-01",
    related: ["joining-the-pilot", "switching-language"],
    blocks: [
      {
        kind: "paragraph",
        text: "REMI s'ouvre sur un écran de connexion : votre e-mail, votre mot de passe, et de quel côté de la boucle vous continuez — praticien, ou personne accompagnée par un praticien. Ce choix décide de votre navigation et de l'écran d'arrivée : il fait donc partie de la connexion, plutôt que d'être un réglage à retrouver plus tard.",
      },
      {
        kind: "note",
        intent: "info",
        title: "Il n'y a pas de bouton d'inscription, exprès",
        body: "L'accès est réservé au pilote. Un praticien entre en nous parlant ; une personne entre parce que son praticien l'invite. Un compte sans plan derrière ouvrirait un produit vide, ce qui est pire qu'une porte fermée.",
      },
      {
        kind: "heading",
        id: "cannot-get-in",
        text: "Si vous ne pouvez pas entrer",
      },
      {
        kind: "list",
        items: [
          "Vérifiez que vous êtes sur l'adresse du produit et non sur ce centre d'aide — ce sont deux sites distincts, et un seul demande de se connecter.",
          "Si vous êtes accompagné par un praticien, demandez-lui d'abord : une invitation jamais acceptée ressemble exactement à un problème de mot de passe vu de votre côté.",
          "Sinon, écrivez-nous. Pendant le pilote, l'accès est géré par un humain : un message vous fera rentrer plus vite que n'importe quel formulaire.",
        ],
      },
      {
        kind: "note",
        intent: "warning",
        title: "Pas encore construit : la réinitialisation du mot de passe",
        body: "Aucun prestataire d'authentification n'a été choisi : il n'y a donc pas de « mot de passe oublié » ni de récupération automatique. C'est l'une des premières choses qui changera dès qu'un prestataire sera engagé. En attendant, récupérer l'accès veut dire nous écrire.",
      },
      {
        kind: "heading",
        id: "signing-out",
        text: "Se déconnecter",
      },
      {
        kind: "paragraph",
        text: "Le menu du compte, en haut à droite du produit, contient la déconnexion, à côté de vos informations et de votre langue. Se déconnecter met fin à la session sur cet appareil, et rien d'autre : rien ne change dans votre plan, et votre praticien ne voit aucune différence.",
      },
      {
        kind: "action",
        body: "Les questions d'accès vont au même endroit que le reste.",
        link: { target: "marketing", path: "/contact", label: "Nous écrire" },
      },
    ],
  },
  {
    slug: "switching-language",
    category: "account-and-billing",
    title: "Changer de langue",
    summary:
      "Français et anglais, partout. Comment fonctionne le sélecteur, ce qu'il conserve, et le seul texte qu'il ne peut pas traduire.",
    updated: "2026-07-30",
    related: ["signing-in", "contacting-support"],
    blocks: [
      {
        kind: "paragraph",
        text: "Tous les sites REMI existent en français et en anglais : le produit, le site principal et ce centre d'aide. Le français est le marché de lancement — REMI est construit en Belgique, d'abord pour des praticiens francophones et les personnes qu'ils accompagnent — et l'anglais est là pour tous les autres.",
      },
      { kind: "heading", id: "how", text: "Comment changer" },
      {
        kind: "list",
        items: [
          "Le sélecteur EN | FR se trouve dans l'en-tête de chaque page, sur tous les sites REMI.",
          "Il vous garde où vous êtes : changer de langue au milieu d'un article donne le même article dans l'autre langue, pas la page d'accueil.",
          "La langue est dans l'adresse. Chaque page existe deux fois — /en/… et /fr/… — donc un lien que vous envoyez porte la langue dans laquelle vous lisiez.",
          "Dans le produit, le menu du compte contient aussi un réglage de langue : le choix vous suit plutôt que d'être refait sur chaque appareil.",
        ],
      },
      {
        kind: "note",
        intent: "info",
        title: "La première visite devine, puis arrête de deviner",
        body: "En arrivant sans langue dans l'adresse, vous êtes envoyé vers celle que votre navigateur demande : le français s'il la préfère, l'anglais sinon. C'est une supposition faite une fois ; le sélecteur la remplace, et c'est l'adresse où vous atterrissez qui fait foi.",
      },
      {
        kind: "heading",
        id: "not-translated",
        text: "Ce que le sélecteur ne traduit pas",
      },
      {
        kind: "paragraph",
        text: "L'interface est traduite. Ce que les gens écrivent ne l'est pas. Les notes de votre praticien, les recommandations qu'il a validées et la formulation de vos pas apparaissent dans la langue dans laquelle il les a écrites — traduire automatiquement une consigne clinique est exactement le genre de service rendu qui tourne mal en silence. Si vous lisez des recommandations dans une langue où vous n'êtes pas à l'aise, dites-le à votre praticien plutôt qu'à une machine.",
      },
      {
        kind: "note",
        intent: "warning",
        title: "Si quelque chose n'est pas traduit, c'est un bug",
        body: "Une phrase en anglais sur le site français est un défaut, pas un manque prévu : les deux dictionnaires sont vérifiés par le typage avant toute mise en ligne. Envoyez-nous la page et nous la corrigeons.",
      },
    ],
  },
  {
    slug: "billing-during-the-pilot",
    category: "account-and-billing",
    title: "La facturation pendant le pilote",
    summary:
      "Rien à payer, aucune carte enregistrée, aucun prix décidé. Ce que cela veut dire concrètement, et ce qui se passera quand il y aura un chiffre.",
    updated: "2026-08-01",
    related: ["joining-the-pilot", "exporting-or-deleting-your-data"],
    blocks: [
      {
        kind: "paragraph",
        text: "Il n'y a rien à payer pendant le pilote. Aucune carte n'est enregistrée, aucun abonnement n'est créé, et il n'y a pas d'écran de facturation dans REMI — parce qu'il n'aurait rien à afficher.",
      },
      {
        kind: "heading",
        id: "pricing",
        text: "Pourquoi il n'y a pas encore de prix",
      },
      {
        kind: "paragraph",
        text: "Le prix n'est pas décidé. Il se construit honnêtement avec les premiers praticiens plutôt qu'il ne leur est annoncé, et tant qu'il n'est pas fixé vous ne trouverez aucun chiffre sur une page REMI. Ce n'est pas de la coquetterie : un prix inventé avant que le produit soit fini est une promesse faite aux mauvaises personnes.",
      },
      {
        kind: "list",
        items: [
          "Les conditions du pilote, y compris son coût, se finalisent avec la première cohorte.",
          "Aucun engagement n'est attaché au pilote : vous pouvez partir quand vous voulez.",
          "Rien ici ne bascule en silence vers une formule payante. Quand il y aura un prix, ce sera une conversation avec les praticiens qui ont aidé à construire le produit, pas une surprise sur un relevé de carte.",
        ],
      },
      {
        kind: "note",
        intent: "info",
        title: "Si vous êtes la personne accompagnée",
        body: "La conversation du pilote se tient avec les praticiens : la facturation n'est donc pas votre sujet. Si votre praticien vous a dit autre chose sur ce que REMI vous coûte, c'est à lui qu'il faut le demander — son arrangement avec les personnes qu'il accompagne lui appartient, pas à nous.",
      },
      {
        kind: "action",
        body: "Demandez-nous où en est le prix. La réponse honnête est plus facile à donner que la réponse policée.",
        link: { target: "marketing", path: "/contact", label: "Nous demander" },
      },
    ],
  },

  /* ---------------------------------------------------- confidentialité et données */
  {
    slug: "what-your-practitioner-sees",
    category: "privacy-and-data",
    title: "Ce que votre praticien voit — et ne voit pas",
    summary:
      "L'accès suit la relation de suivi. Ce qui remonte vers le praticien qui vous accompagne, ce qui ne remonte pas, et quand l'accès s'arrête.",
    updated: "2026-08-03",
    related: ["reading-progress-signals", "your-data-and-gdpr"],
    blocks: [
      {
        kind: "paragraph",
        text: "REMI ne fonctionne que si vous savez qui se trouve de l'autre côté. La réponse est courte : le praticien qui vous accompagne, et personne d'autre.",
      },
      {
        kind: "columns",
        columns: [
          {
            intent: "info",
            title: "Il voit",
            items: [
              "Le plan qu'il a publié pour vous, et les recommandations qu'il contient.",
              "Le pas sur lequel vous êtes, son objectif et votre avancement dedans.",
              "Les signaux de progression depuis votre dernière consultation — ce qui s'applique, ce qui coince, ce qui a marché.",
              "Si vous avez accepté son invitation, et votre dernière activité.",
              "Ce que REMI vous a suggéré, pour pouvoir le corriger plutôt que de le découvrir.",
            ],
          },
          {
            intent: "error",
            title: "Il ne voit pas",
            items: [
              "Ce qui précède l'accompagnement, ni ce qui se passe en dehors.",
              "Les personnes qu'un autre praticien accompagne — l'accès est limité à la relation qui le justifie.",
              "Un dossier clinique. REMI n'est pas le dossier médical : diagnostics, prescriptions et antécédents restent dans son propre système.",
              "Ce qu'un praticien ailleurs conserve à votre sujet. REMI ne va chercher aucun dossier ailleurs.",
            ],
          },
        ],
      },
      { kind: "heading", id: "why", text: "Pourquoi il le voit" },
      {
        kind: "paragraph",
        text: "Parce que la boucle ne se ferme que si l'information remonte. Si un praticien est aveugle entre deux consultations, c'est que rien ne lui parvient, et cela coûte une séance passée à reconstituer quinze jours au lieu d'ajuster un plan. Ce que REMI renvoie est ce qui permet à la consultation suivante de partir de là où vous en êtes vraiment.",
      },
      {
        kind: "note",
        intent: "info",
        title: "L'accès s'arrête avec la relation",
        body: "Quand un accompagnement se termine, l'accès qui allait avec se termine aussi. Un praticien ne garde pas une fenêtre sur une personne qu'il n'accompagne plus. Ses propres notes, dans son propre système, restent les siennes : ce dossier-là n'appartient pas à REMI, ni à conserver ni à supprimer.",
      },
      {
        kind: "note",
        intent: "warning",
        title: "Où en est-on aujourd'hui",
        body: "REMI est en pré-lancement et aucun prestataire de stockage n'est engagé : aucune donnée client n'est traitée à ce jour. Les règles ci-dessus décrivent la façon dont le produit se construit plutôt qu'un système en fonctionnement — et c'est précisément pour cela qu'elles sont écrites avant que le premier enregistrement existe.",
      },
    ],
  },
  {
    slug: "your-data-and-gdpr",
    category: "privacy-and-data",
    title: "Vos données et le RGPD",
    summary:
      "Une société belge sous RGPD : ce que REMI collecte, ce qu'il n'en fera jamais, et ce qui, honnêtement, n'est pas encore décidé.",
    updated: "2026-08-03",
    related: ["exporting-or-deleting-your-data", "what-your-practitioner-sees"],
    blocks: [
      {
        kind: "paragraph",
        text: "REMI est construit par une société belge : le RGPD est donc le plancher ici, pas l'ambition. Les décisions ci-dessous ont été prises avant que le premier enregistrement existe — une protection intégrée pendant que le schéma se dessine encore n'est pas le même produit qu'une protection ajoutée après le lancement.",
      },
      { kind: "heading", id: "commitments", text: "Les engagements" },
      {
        kind: "list",
        items: [
          "Collecter moins que ce qui serait possible. Uniquement ce dont l'accompagnement a besoin — un champ intéressant à avoir mais inutile pour aider quelqu'un n'est pas collecté.",
          "L'accès suit la relation de suivi. Un praticien voit les personnes qu'il accompagne, et l'accès s'arrête avec la relation.",
          "Jamais vendues, jamais échangées, jamais un jeu d'entraînement. Vos données ne deviennent pas le produit de quelqu'un d'autre, et c'est une décision de produit plutôt qu'un réglage à retrouver.",
          "Écrit plutôt que supposé. Ce qui est stocké, pourquoi, combien de temps et qui le traite — consigné au fur et à mesure, avec les sous-traitants nommés.",
          "Les données cliniques restent cliniques. REMI n'est pas le dossier médical : diagnostics, prescriptions et antécédents restent dans le système de votre praticien.",
        ],
      },
      { kind: "heading", id: "residency", text: "Où vivront les données" },
      {
        kind: "paragraph",
        text: "L'intention est que les données personnelles restent dans l'UE, avec une région belge ou européenne par défaut pour le pilote. Aucun prestataire de stockage n'est engagé — délibérément, parce que c'est ce qui garde la localisation comme critère de choix plutôt que comme projet de migration ensuite. Tout traitement qui sortirait de l'UE est nommé, documenté et justifié avant d'avoir lieu.",
      },
      {
        kind: "note",
        intent: "warning",
        title: "Ce que c'est, et ce que ce n'est pas",
        body: "Ceci est une intention écrite, et vaut ce que vaut une intention écrite. REMI ne détient aucune certification et n'en revendique aucune, et aucune donnée client n'est traitée à ce jour. Quand un prestataire sera choisi, la page « confiance et données » du site principal portera un nom, une région et une date — et si la réponse s'avère différente, cette page changera plutôt que de rester discrètement identique.",
      },
      {
        kind: "heading",
        id: "ai",
        text: "La question de l'IA",
      },
      {
        kind: "paragraph",
        text: "C'est la question qui mérite d'être posée, et elle n'a pas encore de réponse arrêtée : quel prestataire, ce qui est envoyé exactement, et ce qui en est délibérément tenu à l'écart. Aucun fournisseur d'IA n'est engagé non plus. Ce qui est déjà décidé, c'est la limite : les données personnelles ne servent pas à entraîner des modèles au bénéfice de quelqu'un d'autre que la personne à qui elles appartiennent.",
      },
      {
        kind: "action",
        body: "La page « confiance et données » du site principal en donne la version longue, y compris les questions que nous préférons entendre tôt plutôt que tard.",
        link: {
          target: "marketing",
          path: "/trust",
          label: "Lire confiance et données",
        },
      },
    ],
  },
  {
    slug: "exporting-or-deleting-your-data",
    category: "privacy-and-data",
    title: "Exporter ou supprimer vos données",
    summary:
      "Les droits que vous avez, comment les exercer tant qu'aucun bouton ne le fait, et le seul dossier que REMI ne peut pas supprimer pour vous.",
    updated: "2026-08-03",
    related: ["your-data-and-gdpr", "contacting-support"],
    blocks: [
      {
        kind: "paragraph",
        text: "Le RGPD vous permet de demander ce qui est conservé à votre sujet, d'en obtenir une copie dans un format réutilisable, de faire corriger une erreur et de faire supprimer vos données. Ces droits existent, qu'un produit ait construit un bouton pour eux ou non.",
      },
      {
        kind: "note",
        intent: "warning",
        title: "Il n'y a pas encore de bouton exporter ou supprimer",
        body: "L'export et la suppression en autonomie ne sont pas construits. Le dire est plus utile que de décrire un écran qui n'existe pas : en attendant, une demande est traitée par une personne — et elle est traitée.",
      },
      { kind: "heading", id: "how", text: "Comment demander" },
      {
        kind: "steps",
        items: [
          {
            title: "Écrivez-nous",
            body: "Via la page de contact du site principal, depuis l'adresse de votre compte. Dites laquelle des deux demandes vous faites — une copie, ou une suppression — et si elle porte sur tout ou sur un élément précis.",
          },
          {
            title: "Nous vérifions que c'est bien vous",
            body: "Une demande de remise ou d'effacement des données de quelqu'un est exactement le genre de message qu'il ne faut pas prendre pour argent comptant : attendez-vous à une étape qui vérifie que la demande vient bien de vous.",
          },
          {
            title: "C'est fait, et vous en êtes informé",
            body: "On vous dit ce qui a été exporté ou supprimé, plutôt que de conclure en silence. Si une partie ne peut pas être supprimée, on vous dit laquelle et pourquoi.",
          },
        ],
      },
      {
        kind: "heading",
        id: "limits",
        text: "Ce que la suppression ne couvre pas",
      },
      {
        kind: "columns",
        columns: [
          {
            intent: "success",
            title: "REMI peut supprimer",
            items: [
              "Votre compte et le profil derrière.",
              "Les plans, les pas et les suggestions de repas de votre espace.",
              "Les signaux de progression générés par votre usage de REMI.",
            ],
          },
          {
            intent: "neutral",
            title: "REMI ne peut pas supprimer",
            items: [
              "Les notes et le dossier clinique de votre praticien. Ils vivent dans son système, il en est responsable, et une demande à leur sujet s'adresse à lui.",
              "Ce qu'un praticien a consigné séparément, en dehors de REMI.",
              "Ce qu'une loi impose de conserver — le cas échéant, on vous dit quoi et pour combien de temps.",
            ],
          },
        ],
      },
      {
        kind: "note",
        intent: "info",
        title: "Supprimer n'est pas la seule option",
        body: "Si ce que vous voulez, c'est faire une pause plutôt que tout effacer, un accompagnement peut être mis en pause : rien n'est supprimé, et rien ne vous est demandé entre-temps. Dites bien laquelle des deux vous voulez — on les confond facilement, et une seule est réversible.",
      },
      {
        kind: "action",
        body: "Les deux demandes passent par la page de contact.",
        link: {
          target: "marketing",
          path: "/contact",
          label: "Faire une demande",
        },
      },
    ],
  },
];
