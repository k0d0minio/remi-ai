/**
 * The French sentence a screen shows for a refusal of a service.
 *
 * A service writes its `message` in English, for a developer: it goes to the
 * logs, to the tests and to `unwrap`. A screen never shows it. Every screen is
 * French (Jamie, 2026-11-20), so the place that shows a refusal calls
 * `userMessage(result)`.
 *
 * The order: the exact sentence of `sentences`, then a pattern of `patterns`
 * for a message that carries a value, then the sentence of the error code. A
 * message with no entry thus reads as a general French sentence, never as
 * English. `user-message.test.ts` reads the services and fails when a static
 * message has no entry here.
 *
 * The reader is the practitioner or the REMI team: « vous », neutral.
 */

export type ServiceFailure = { error: string; message: string };

const NO_PATIENT = "Ce dossier est introuvable.";
const NOT_VALID_DATE = "Cette date n'est pas valide.";
const DATE_REQUIRED = "Indiquez une date.";
const NAME_REQUIRED = "Indiquez un nom.";
const TITLE_REQUIRED = "Indiquez un titre.";
const EMAIL_REQUIRED = "Indiquez une adresse e-mail valide.";
const PASSWORD_12 = "Le mot de passe doit compter au moins 12 caractères.";
const LINK_NOT_VALID = "Ce lien n'est pas valide.";
const EMAIL_HAS_ACCOUNT = "Cette adresse e-mail a déjà un compte.";
const WRONG_CREDENTIALS = "L'adresse e-mail ou le mot de passe est incorrect.";

const sentences: Readonly<Record<string, string>> = {
  // the model of an AI role (`server/ai-models`)
  "only an admin reads or changes the model of an AI role":
    "Seul un compte d'administration peut modifier les modèles d'IA.",
  "this AI role does not exist": "Ce rôle d'IA n'existe pas.",
  "a model id is required": "Indiquez l'identifiant d'un modèle.",
  "the model list is not available":
    "La liste des modèles n'est pas disponible. L'enregistrement est refusé tant que la passerelle ne répond pas.",
  "the gateway does not list this model":
    "La passerelle ne propose pas ce modèle. Vérifiez l'identifiant.",
  "this model has no structured output":
    "Ce modèle ne produit pas de sortie structurée. REMI en a besoin pour lire la réponse.",
  "the providers of this model may train on the data":
    "Ce modèle est refusé : ses fournisseurs peuvent utiliser les données envoyées pour entraîner leurs modèles. Les demandes de REMI contiennent des données de santé.",
  // the food records (`db/services/food-records`, `server/foods/propose`)
  "this food already has a record":
    "Cet aliment a déjà une fiche. Une proposition ne remplace jamais une fiche.",
  "this food has no record yet":
    "Cet aliment n'a pas encore de fiche. Confirmez d'abord sa fiche.",
  "the compatibility gate does not know this tag":
    "Une étiquette d'allergène n'est pas reconnue par le contrôle de compatibilité.",
  "this role in a dish does not exist": "Ce rôle dans un plat n'existe pas.",
  "a cookable food needs a role in a dish":
    "Choisissez le rôle de l'aliment dans un plat : un aliment cuisinable en a un.",
  "the kitchen units are not valid":
    "Les unités de cuisine ne sont pas valides. Vérifiez les noms, les poids et la densité.",
  "the food proposal is not available":
    "REMI n'a pas pu proposer de fiche. Réessayez dans un instant.",
  // the table of the meal shares (`server/meal-shares`)
  "only a console account reads or changes the meal shares":
    "Seul un compte de la console peut lire ou corriger les parts des repas.",
  "each column of the reference day must give 100":
    "Sur la journée de référence, la somme de chaque colonne doit être de 100 %.",
  "each meal share is a whole number from 1 to 100":
    "Chaque part est un nombre entier de 1 à 100.",
  "the meal share table is not complete":
    "La table est incomplète. Rechargez la page, puis réessayez.",
  // conflict
  "a challenge is already running — pick its outcome to replace it":
    "Un challenge est déjà en cours. Choisissez son issue pour le remplacer.",
  "a challenge is ready for the next once acquired":
    "Le challenge suivant est possible une fois celui-ci acquis.",
  "an operator with that email already exists":
    "Un compte existe déjà avec cette adresse e-mail.",
  "another change of the meals ran at the same time":
    "Un autre changement des repas a eu lieu au même moment. Rechargez la page.",
  "another validation ran at the same time":
    "Une autre validation a eu lieu au même moment. Rechargez la page.",
  "no consent in force to withdraw":
    "Aucun consentement en vigueur ne peut être retiré.",
  "that address already has an account": EMAIL_HAS_ACCOUNT,
  "the protocol is empty": "Le protocole est vide.",
  "a coeliac disease is not confirmed":
    "La personne cite une maladie cœliaque dans ses pathologies. Répondez d'abord « Oui » ou « Non » à « Maladie cœliaque confirmée » dans le profil.",
  "the energy need has no estimate yet":
    "Les besoins énergétiques n'ont pas encore d'estimation. Complétez d'abord le dossier.",
  "the protein need has no estimate yet":
    "Les besoins protéiques n'ont pas encore d'estimation. Complétez d'abord le dossier.",
  "this auth user already has an account":
    "Cette identité a déjà un compte.",
  "this e-mail already has an account": EMAIL_HAS_ACCOUNT,
  "this file already has an account": "Ce dossier a déjà un compte.",
  "the care of this file is not active":
    "L'accompagnement de ce dossier n'est pas actif.",
  "the activation e-mail already went out":
    "L'e-mail « Votre espace REMI est prêt » est déjà parti. Il n'est envoyé qu'une fois.",
  "a send of the activation e-mail was already tried":
    "Un envoi de l'e-mail a déjà été tenté. Utilisez « Renvoyer l'e-mail ».",
  "this invitation has already been used":
    "Cette invitation a déjà été utilisée.",
  "this link has already served": "Ce lien a déjà servi.",
  "this patient already has an account": "Ce dossier a déjà un compte.",
  "this week's question is already answered":
    "La question de cette semaine a déjà une réponse.",
  "a file of this practitioner holds this e-mail and has no account":
    "Un de vos dossiers porte déjà cette adresse e-mail et n'a pas de compte.",
  "this file or its e-mail already has an account":
    "Ce dossier ou son adresse e-mail a déjà un compte.",

  // invalid_input
  "this is not a change of the meal configuration":
    "Ce changement des repas n'est pas valide. Rechargez la page.",
  "a check-in needs a direction, a measure or a note":
    "Un point de suivi demande une tendance, une mesure ou une note.",
  "a consent needs a patient, a key, a version, a locale and a decision":
    "Ce consentement est incomplet.",
  "a document attaches to a goal or a recipe, not both":
    "Un document se rattache à un objectif ou à une recette, pas aux deux.",
  "a lead needs a list, a valid email address and the consent version":
    "Cette demande est incomplète.",
  "a note needs a title or something written in it":
    "Une note demande un titre ou un contenu.",
  "a patient account needs a patient, an e-mail and an auth subject":
    "Ce compte patient est incomplet.",
  "a pilot lead needs a first name": "Indiquez un prénom.",
  "a practitioner lead needs a profession": "Indiquez une profession.",
  "a template needs at least one row":
    "Un modèle demande au moins une ligne.",
  "another template already uses that name":
    "Un autre modèle porte déjà ce nom.",
  "a new advice is not valid": "Un nouveau conseil n'est pas valide.",
  "an edited advice is not valid": "Un conseil modifié n'est pas valide.",
  "an edited advice is not in force in this file":
    "Un conseil modifié n'est plus actif dans ce dossier.",
  "choose at least one recipe": "Choisissez au moins une recette.",
  "declare at least one item, or answer « none known »":
    "Cochez au moins un élément, ou répondez « Aucune connue ».",
  "one score per goal": "Donnez une seule note par objectif.",
  "only a PDF or an image (JPEG, PNG, WebP) of 10 MB at most is accepted":
    "Seuls un PDF ou une image (JPEG, PNG, WebP) de 10 Mo au plus sont acceptés.",
  "only « Autre » takes a text": "Seul « Autre » accepte une précision.",
  "rate at least one goal": "Notez au moins un objectif.",
  "restore this rule before editing it":
    "Restaurez cette règle avant de la modifier.",
  "restore this rule before validating it":
    "Restaurez cette règle avant de la valider.",
  "that anamnesis category does not exist":
    "Cette rubrique d'anamnèse n'existe pas.",
  "that calculation does not exist": "Ce calcul n'existe pas.",
  "that estimate is not valid": "Cette estimation n'est pas valide.",
  "that calorie target is not valid":
    "L'objectif, la situation particulière ou l'objectif calorique n'est pas valide. Vérifiez votre saisie.",
  "that protein target is not valid":
    "Le poids de référence, le coefficient ou la valeur finale n'est pas valide. Vérifiez votre saisie.",
  "that file status does not exist": "Ce statut de dossier n'existe pas.",
  "that goal is not this patient's":
    "Cet objectif n'appartient pas à ce dossier.",
  "that is not a role": "Ce rôle n'existe pas.",
  "that list does not exist": "Cette liste n'existe pas.",
  "that note is too long": "Cette note est trop longue.",
  "that outcome is not one of hers": "Cette issue n'existe pas.",
  "that recipe is not this patient's":
    "Cette recette n'appartient pas à ce dossier.",
  "that value is not valid": "Cette valeur n'est pas valide.",
  "the file has no e-mail to take it over with":
    "Le dossier n'a pas d'adresse e-mail pour la reprise.",
  "the mandatory consents are missing or not current":
    "Les consentements obligatoires manquent ou ne sont plus à jour.",
  "the password does not fit the rules":
    "Le mot de passe ne respecte pas les règles.",
  "the protocol is not valid for a version":
    "Le protocole n'est pas valide : la version n'a pas été créée.",
  "the sort must be appointment or name":
    "Le tri se fait par rendez-vous ou par nom.",
  "this rule is already validated": "Cette règle est déjà validée.",
  "this version was replaced — edit the current one":
    "Cette version a été remplacée. Modifiez la version en cours.",
  "this version was replaced — validate the current one":
    "Cette version a été remplacée. Validez la version en cours.",
  "« Autre » needs a text": "Précisez « Autre ».",
  "the link carries no token": LINK_NOT_VALID,
  "the new password is too long": "Le nouveau mot de passe est trop long.",
  "the new password is too short": "Le nouveau mot de passe est trop court.",

  // not_found
  "no such advice": "Ce conseil est introuvable.",
  "no such anamnesis entry": "Cette entrée d'anamnèse est introuvable.",
  "no such assignment": "Cette attribution est introuvable.",
  "no such challenge": "Ce challenge est introuvable.",
  "no such check-in": "Ce point de suivi est introuvable.",
  "no such document": "Ce document est introuvable.",
  "no such food": "Cet aliment est introuvable.",
  "no such goal": "Cet objectif est introuvable.",
  "no such goal for this patient":
    "Cet objectif est introuvable dans ce dossier.",
  "no such instruction": "Cette consigne est introuvable.",
  "no such invitation": "Cette invitation est introuvable.",
  "no such lead": "Cette demande est introuvable.",
  "no such link": "Ce lien est introuvable.",
  "no such meal entry": "Ce repas est introuvable.",
  "no such message": "Ce message est introuvable.",
  "no such note": "Cette note est introuvable.",
  "no such observation": "Cette observation est introuvable.",
  "no such open challenge": "Aucun challenge n'est en cours.",
  "no such operator": "Ce compte est introuvable.",
  "no such pantry essential": "Cet indispensable est introuvable.",
  "no such patient": NO_PATIENT,
  "no such patient link": "Ce lien patient est introuvable.",
  "no such patient message": "Ce message est introuvable.",
  "no such planned meal": "Ce repas prévu est introuvable.",
  "no such recipe": "Cette recette est introuvable.",
  "no such recommendation": "Cette recommandation est introuvable.",
  "no such rule": "Cette règle est introuvable.",
  "no such sign-up link": "Ce lien d'inscription est introuvable.",
  "no such supplement": "Ce complément est introuvable.",
  "no such template": "Ce modèle est introuvable.",
  "the file did not reach the store":
    "Le fichier n'est pas arrivé. Envoyez-le de nouveau.",
  "the file of this link is gone": "Le dossier de ce lien n'existe plus.",
  "this identity has no patient account":
    "Cette identité n'a pas de compte patient.",
  "this invitation link is not valid":
    "Ce lien d'invitation n'est pas valide.",
  "this link is not valid": LINK_NOT_VALID,

  // not_permitted
  "a practitioner creates files for itself only":
    "Un praticien crée des dossiers pour lui-même uniquement.",
  "only the patient withdraws a consent":
    "Seule la personne concernée retire un consentement.",
  "the care consent is not in force":
    "Le consentement au traitement des données n'est pas en vigueur.",
  "a withdrawal needs a patient and a consent key":
    "Ce retrait est incomplet.",
  "only the patient records the genetic consent":
    "Seule la personne concernée enregistre le consentement génétique.",
  "that email and password do not match": WRONG_CREDENTIALS,
  "that file does not belong to this patient":
    "Ce fichier n'appartient pas à ce dossier.",
  "that is not the current password":
    "Ce n'est pas le mot de passe actuel.",
  "the desired weight needs the care consent":
    "Le poids souhaité demande le consentement au traitement des données.",
  "the genotype needs the genetic consent":
    "Le génotype demande le consentement génétique.",
  "the medications and the supplements need the care consent":
    "Les médicaments et les compléments demandent le consentement au traitement des données.",
  "this account still holds patient files — they need another practitioner first":
    "Ce compte tient encore des dossiers patients. Confiez-les d'abord à un autre praticien.",
  "this invitation has expired": "Cette invitation a expiré.",
  "this is the last admin — promote someone else before changing this account":
    "C'est le dernier compte administrateur. Donnez d'abord ce rôle à un autre compte.",
  "this is the last admin — the console would have nobody who can manage it":
    "C'est le dernier compte administrateur : plus personne ne pourrait gérer la console.",
  "this link has expired": "Ce lien a expiré.",
  "this template belongs to another operator":
    "Ce modèle appartient à un autre compte.",
  "wrong e-mail or password": WRONG_CREDENTIALS,

  // rate_limited
  "a claim link went out less than five minutes ago":
    "Un lien de reprise est parti il y a moins de cinq minutes.",
  "the limit of meals for this day is reached":
    "La limite de repas pour ce jour est atteinte.",
  "the second suggestion of this meal is used":
    "Une autre suggestion a déjà été donnée pour ce repas.",
  "the claim on this meal was not written":
    "L'autre suggestion n'a pas pu être préparée. Réessayez dans un instant.",
  "no valid ticket for a second suggestion":
    "Une autre suggestion n'est pas possible pour ce repas.",
  "too many changes at once — try again shortly":
    "Trop de modifications à la fois. Réessayez dans un instant.",
  "too many changes today — try again tomorrow":
    "Trop de modifications aujourd'hui. Réessayez demain.",

  // upstream_failed
  "no file store is configured, so the patient's files cannot be removed — nothing was deleted":
    "Aucun stockage de fichiers n'est configuré : les fichiers du dossier ne peuvent pas être retirés. Rien n'a été supprimé.",
  "no mailer is registered, so no notice can go out: the sweep did nothing":
    "Aucun service d'e-mail n'est configuré : aucun avis n'est parti.",
  "the auth service returned no user":
    "Le service de connexion n'a pas répondu. Réessayez dans un instant.",
  "the change signals were not recorded":
    "Les signaux de modification n'ont pas été enregistrés.",
  "the claim e-mail did not go out": "L'e-mail de reprise n'est pas parti.",
  "the file could not be removed from the store — nothing was removed":
    "Le fichier n'a pas pu être retiré du stockage. Rien n'a été supprimé.",
  "the patient's files could not all be removed from the store — the profile was kept; try the deletion again":
    "Tous les fichiers du dossier n'ont pas pu être retirés du stockage. Le dossier est conservé : relancez la suppression.",
  "the validated protocol cannot be read":
    "Le protocole validé ne peut pas être lu.",
  "the model reply does not satisfy the schema":
    "La réponse du modèle n'est pas exploitable. Réessayez.",
  "the model refused to answer": "Le modèle n'a pas répondu. Réessayez.",
  "the model call failed": "L'appel au modèle a échoué. Réessayez.",
  "no file store is configured": "Aucun stockage de fichiers n'est configuré.",

  // The messages of the validation schemas.
  "a challenge cannot start in the future":
    "Un challenge ne peut pas commencer dans le futur.",
  "a challenge is required": "Indiquez un challenge.",
  "a consultation date is required": "Indiquez la date de la consultation.",
  "a date is required": DATE_REQUIRED,
  "a description is required": "Indiquez une description.",
  "a goal is required": "Indiquez un objectif.",
  "a link starts with https://": "Un lien commence par https://.",
  "a message is required": "Écrivez un message.",
  "a name is required": NAME_REQUIRED,
  "a practitioner is required": "Indiquez un praticien.",
  "a pseudonym is required": "Indiquez un pseudonyme.",
  "a reason is required": "Indiquez un motif.",
  "a recipe needs its ingredients and steps":
    "Une recette demande ses ingrédients et ses étapes.",
  // the structured recipe (`shared/structured-recipe`, REM-90)
  "a recipe needs at least one ingredient":
    "Une recette demande au moins un ingrédient.",
  "a recipe needs at least one step": "Une recette demande au moins une étape.",
  "a recipe has 40 ingredients at most":
    "Une recette compte 40 ingrédients au maximum.",
  "a recipe has 30 steps at most": "Une recette compte 30 étapes au maximum.",
  "choose at least one meal for this recipe":
    "Choisissez au moins un repas pour cette recette.",
  "the number of portions runs from 1 to 50":
    "Le nombre de portions va de 1 à 50.",
  "a time runs from 0 to 1440 minutes":
    "Un temps s'écrit en minutes, de 0 à 1440.",
  "that quantity is not valid": "Cette quantité n'est pas valide.",
  "an ingredient needs a food name": "Chaque ingrédient demande un aliment.",
  "a unit needs a quantity": "Une unité demande une quantité.",
  "a step needs a text": "Chaque étape demande un texte.",
  "that recipe text is too long": "Un texte de la recette est trop long.",
  "that recipe is not valid": "Cette recette n'est pas valide.",
  "only a structured recipe can be verified":
    "Seule une recette structurée peut être vérifiée. Ajoutez ses ingrédients et ses étapes ligne par ligne.",
  "an archived recipe cannot be verified":
    "Une recette archivée ne peut pas être vérifiée. Remettez-la d'abord dans la bibliothèque.",
  "only a recipe that the gate confirmed is stored":
    "Seule une recette dont la compatibilité est confirmée peut être enregistrée.",
  "a generated recipe starts from a verified template":
    "Une recette générée part d'une recette vérifiée de la bibliothèque.",
  "one recipe for each day and meal":
    "Une seule recette par jour et par repas.",
  "a rule needs a body — this is the text a prompt will quote":
    "Une règle demande un texte : c'est lui que l'IA citera.",
  "a score runs from 0 to 5": "Une note va de 0 à 5.",
  "a start date is required": "Indiquez une date de début.",
  "a title is required": TITLE_REQUIRED,
  "a valid email address is required": EMAIL_REQUIRED,
  "an item is required": "Indiquez un élément.",
  "an observation is required": "Écrivez une observation.",
  "that comment is too long": "Ce commentaire est trop long.",
  "that date is not valid": NOT_VALID_DATE,
  "that description is too long": "Cette description est trop longue.",
  "that email address is not valid": "Cette adresse e-mail n'est pas valide.",
  "that feedback is too long": "Ce retour est trop long.",
  "that learning is too long": "Cet apprentissage est trop long.",
  "that message is too long": "Ce message est trop long.",
  "that observation is too long": "Cette observation est trop longue.",
  "that phone number is not valid":
    "Ce numéro de téléphone n'est pas valide.",
  "that value is out of range": "Cette valeur est hors limites.",
  "the password needs at least 12 characters": PASSWORD_12,
};

type Pattern = readonly [RegExp, (...groups: string[]) => string];

/** The messages that carry a value. The value passes as it is. */
const patterns: readonly Pattern[] = [
  [
    /^this patient already has « (.+) » — remove it from the selection$/,
    (title) =>
      `Ce dossier a déjà « ${title} ». Retirez cette recette de la sélection.`,
  ],
  [
    /^that text is too long — (\d+) characters at most$/,
    (max) => `Ce texte est trop long : ${max} caractères au plus.`,
  ],
  [
    /^that value is too long — (\d+) characters at most$/,
    (max) => `Cette valeur est trop longue : ${max} caractères au plus.`,
  ],
  [/^at most (\d+) tags$/, (max) => `${max} étiquettes au plus.`],
  [
    /^a file at \w+ has no recommendations to validate$/,
    () => "À ce statut, le dossier n'a pas de recommandations à valider.",
  ],
  [
    /^a file at \w+ cannot be activated$/,
    () => "À ce statut, le dossier ne peut pas être activé.",
  ],
  [
    /^the activation is blocked: /,
    () => "L'activation est bloquée : relisez le récapitulatif.",
  ],
  [
    /^a file cannot move from \w+ to \w+$/,
    () => "Le dossier ne peut pas passer à ce statut.",
  ],
  [
    /^"(.+)" is checked twice$/,
    (item) => `« ${item} » est coché deux fois.`,
  ],
  [
    /^"(.+)" is not in the (?:\w+ list|sub-list of ".+")$/,
    (item) => `« ${item} » n'est pas dans la liste.`,
  ],
];

/** The sentence of a code, for a message that has no sentence of its own. */
const byCode: Readonly<Record<string, string>> = {
  not_found: "Cet élément est introuvable.",
  not_permitted: "Cette action n'est pas autorisée.",
  invalid_input: "Une valeur n'est pas valide. Vérifiez votre saisie.",
  conflict:
    "Cette action n'est plus possible dans l'état actuel. Rechargez la page.",
  rate_limited: "Trop de demandes. Réessayez dans un instant.",
  upstream_failed: "Un service n'a pas répondu. Réessayez dans un instant.",
};

const FALLBACK = "Cette action n'a pas abouti. Réessayez.";

const sentenceOf = (message: string): string | null => {
  const exact = sentences[message];
  if (exact) {
    return exact;
  }
  for (const [pattern, write] of patterns) {
    const match = pattern.exec(message);
    if (match) {
      return write(...match.slice(1));
    }
  }
  return null;
};

/** Whether a static message of a service has its French sentence. */
export const hasUserMessage = (message: string) =>
  sentenceOf(message) !== null;

export const userMessage = ({ error, message }: ServiceFailure): string => {
  const general = byCode[error] ?? FALLBACK;
  // A list save names the row: `row 3: a title is required`.
  const row = /^row (\d+): (.*)$/.exec(message);
  if (row) {
    const [, index = "", rest = ""] = row;
    return `Ligne ${index} : ${sentenceOf(rest) ?? general}`;
  }
  // The questionnaire names the field: `heightCm: …`. The field name is a
  // code, so only the sentence shows.
  const field = /^\w+: (.*)$/.exec(message);
  return (
    sentenceOf(message) ?? (field ? sentenceOf(field[1] ?? "") : null) ?? general
  );
};
