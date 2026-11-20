import { PRACTICE_TIME_ZONE } from "../../shared/format";
import type { Locale } from "../../shared/i18n";
import type { EmailMessage } from "../index";

/**
 * « Votre espace REMI est prêt » (stories 19 and 22). It goes out once, when
 * the practitioner activates the care.
 *
 * Two forms, one template:
 * - `sign_in`: the patient has an account. The link is the sign-in page.
 * - `takeover`: the practitioner created the file. The link is the one-time
 *   take-over link of `issueActivationLink`: it is a credential.
 *
 * Then the steps to put REMI on the home screen of a phone. There is no app
 * store listing, so this e-mail is the one place that says how.
 *
 * The e-mail holds no health data: no recommendation, no allergy, no goal.
 * The subject is the client's own wording, with « Votre ». The body addresses
 * the patient with « tu », as the charter asks.
 *
 * The shape follows `file-claim.ts`: plain text carries the whole message,
 * the HTML says nothing more. The name comes from what a person typed, so the
 * HTML escapes it.
 */

/** The five characters HTML gives a meaning to. */
const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

/** The expiry, as the practice's clock reads it: a day and an hour. */
const expiryMoment = (at: Date) =>
  new Intl.DateTimeFormat("fr-BE", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: PRACTICE_TIME_ZONE,
  }).format(at);

export type ActivationEmailAccess =
  | { kind: "sign_in" }
  | { kind: "takeover"; expiresAt: Date };

type Props = {
  /** How the patient is addressed: their first name, else empty. */
  name: string;
  /** The link of the button: the sign-in page, or the take-over link. */
  url: string;
  /** The address of REMI that the home-screen steps name. Never a one-time link. */
  appUrl: string;
  access: ActivationEmailAccess;
  locale: Locale;
};

type Copy = {
  subject: string;
  greeting: (name: string) => string;
  lead: string;
  signIn: { how: string; action: string };
  takeover: {
    how: string;
    action: string;
    expiry: (moment: string) => string;
  };
  fallback: string;
  homeScreen: {
    lead: string;
    iphone: { title: string; steps: (appUrl: string) => readonly string[] };
    android: { title: string; steps: (appUrl: string) => readonly string[] };
  };
  signature: string;
};

const copy: Record<Locale, Copy> = {
  fr: {
    subject: "Votre espace REMI est prêt",
    greeting: (name) => (name ? `Bonjour ${name},` : "Bonjour,"),
    lead: "Ton espace REMI est prêt. Tu peux l'ouvrir dès maintenant, à ton rythme.",
    signIn: {
      how: "Connecte-toi avec l'adresse e-mail et le mot de passe de ton inscription.",
      action: "Ouvrir mon espace",
    },
    takeover: {
      how: "La personne qui te suit a déjà ouvert ton dossier. Ce lien te demande d'abord ton accord sur le traitement de tes données, puis un mot de passe. Tu retrouves ensuite les informations déjà enregistrées.",
      action: "Activer mon accès",
      expiry: (moment) =>
        `Ce lien est personnel : garde-le pour toi. Il sert une seule fois et expire le ${moment}.`,
    },
    fallback: "Ou copie ce lien :",
    homeScreen: {
      lead: "Pour retrouver REMI comme une application sur ton téléphone, sans passer par l'App Store ni Google Play :",
      iphone: {
        title: "Sur iPhone",
        steps: (appUrl) => [
          `Ouvre ${appUrl} dans Safari.`,
          "Touche le bouton « Partager ».",
          "Choisis « Sur l'écran d'accueil », puis « Ajouter ».",
        ],
      },
      android: {
        title: "Sur Android",
        steps: (appUrl) => [
          `Ouvre ${appUrl} dans Chrome.`,
          "Touche le menu, les trois points en haut à droite.",
          "Choisis « Ajouter à l'écran d'accueil ».",
        ],
      },
    },
    signature: "— REMI",
  },
};

const numbered = (steps: readonly string[]) =>
  steps.map((step, index) => `${index + 1}. ${step}`);

const htmlSteps = (title: string, steps: readonly string[]) =>
  [
    `<p style="margin-bottom:4px;"><strong>${title}</strong></p>`,
    '<ol style="margin-top:0;padding-left:20px;">',
    ...steps.map((step) => `<li>${escapeHtml(step)}</li>`),
    "</ol>",
  ].join("");

export const activationEmail = ({
  name,
  url,
  appUrl,
  access,
  locale,
}: Props): Omit<EmailMessage, "to"> => {
  const t = copy[locale];
  const greeting = t.greeting(name.trim());
  const form = access.kind === "takeover" ? t.takeover : t.signIn;
  const expiry =
    access.kind === "takeover"
      ? t.takeover.expiry(expiryMoment(access.expiresAt))
      : null;
  const iphone = t.homeScreen.iphone.steps(appUrl);
  const android = t.homeScreen.android.steps(appUrl);

  const text = [
    greeting,
    "",
    t.lead,
    "",
    form.how,
    "",
    url,
    ...(expiry ? ["", expiry] : []),
    "",
    t.homeScreen.lead,
    "",
    t.homeScreen.iphone.title,
    ...numbered(iphone),
    "",
    t.homeScreen.android.title,
    ...numbered(android),
    "",
    t.signature,
  ].join("\n");

  const html = [
    "<div style=\"font-family:system-ui,-apple-system,'Segoe UI',sans-serif;font-size:15px;line-height:1.6;color:#253348;\">",
    `<p>${escapeHtml(greeting)}</p>`,
    `<p>${escapeHtml(t.lead)}</p>`,
    `<p>${escapeHtml(form.how)}</p>`,
    `<p><a href="${url}" style="display:inline-block;padding:10px 22px;border-radius:999px;background:#3362AE;color:#ffffff;text-decoration:none;">${form.action}</a></p>`,
    `<p style="font-size:13px;color:#566579;">${t.fallback}<br /><span style="word-break:break-all;">${url}</span></p>`,
    expiry
      ? `<p style="font-size:13px;color:#566579;">${escapeHtml(expiry)}</p>`
      : "",
    `<p>${escapeHtml(t.homeScreen.lead)}</p>`,
    htmlSteps(t.homeScreen.iphone.title, iphone),
    htmlSteps(t.homeScreen.android.title, android),
    `<p>${t.signature}</p>`,
    "</div>",
  ].join("");

  return { subject: t.subject, text, html };
};
