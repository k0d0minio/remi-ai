import type { EmailMessage } from "../index";

/**
 * The invitation to the admin console.
 *
 * French, per the working-languages rule: the console's operators are Morgane
 * and Arnaud, and a message inviting someone into their own tool should not
 * arrive as a translation exercise.
 *
 * Plain text carries the whole message and the HTML adds nothing it does not
 * say — a mail client that strips HTML must still deliver a usable link, and
 * this one is the only way in.
 */

type Props = {
  /** The invitee's name, as the inviter typed it. May be empty. */
  name: string;
  inviterName: string;
  url: string;
  expiresAt: Date;
};

const formatDate = (value: Date) =>
  new Intl.DateTimeFormat("fr-BE", { dateStyle: "long" }).format(value);

export const operatorInvitationEmail = ({
  name,
  inviterName,
  url,
  expiresAt,
}: Props): Omit<EmailMessage, "to"> => {
  const greeting = name.trim() ? `Bonjour ${name.trim()},` : "Bonjour,";
  const inviter = inviterName.trim() || "L'équipe REMI";
  const deadline = formatDate(expiresAt);

  const text = [
    greeting,
    "",
    `${inviter} vous invite à rejoindre la console d'administration REMI, où sont gérés les profils patients et leurs recommandations.`,
    "",
    "Ouvrez ce lien pour créer votre accès :",
    url,
    "",
    `Ce lien est personnel et expire le ${deadline}. Si vous n'attendiez pas cette invitation, ignorez ce message : sans le lien, aucun compte n'est créé.`,
    "",
    "— REMI",
  ].join("\n");

  const html = [
    "<div style=\"font-family:system-ui,-apple-system,'Segoe UI',sans-serif;font-size:15px;line-height:1.6;color:#1f2933;\">",
    `<p>${greeting}</p>`,
    `<p>${inviter} vous invite à rejoindre la console d'administration REMI, où sont gérés les profils patients et leurs recommandations.</p>`,
    `<p><a href="${url}" style="display:inline-block;padding:10px 18px;border-radius:8px;background:#1f2933;color:#ffffff;text-decoration:none;">Créer mon accès</a></p>`,
    `<p style="font-size:13px;color:#616e7c;">Ou copiez ce lien : <br /><span style="word-break:break-all;">${url}</span></p>`,
    `<p style="font-size:13px;color:#616e7c;">Ce lien est personnel et expire le ${deadline}. Si vous n'attendiez pas cette invitation, ignorez ce message : sans le lien, aucun compte n'est créé.</p>`,
    "<p>— REMI</p>",
    "</div>",
  ].join("");

  return {
    subject: "Votre accès à la console REMI",
    text,
    html,
  };
};
