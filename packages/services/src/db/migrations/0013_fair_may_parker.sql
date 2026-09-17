CREATE TABLE "nutrition_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"body" text DEFAULT '' NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"kind" text DEFAULT 'principle' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"validated_by" uuid,
	"validated_at" timestamp with time zone,
	"superseded_by" uuid,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
-- The corpus' first rows: what Morgane's own sources actually say, and nothing
-- else. Every row lands as a DRAFT — validating is her act, and the whole point
-- of this table is that the nutrition in it is hers.
--
-- Two shapes, because the sources come in two shapes. Five rows carry real
-- content, quoted from the v2 structure brainstorm (§§ G, H, I); four are
-- SKELETONS for the food lists § H asks for by name — « sources d'oméga-3,
-- fibres, polyphénols, diversité végétale » — and never fills in. Writing those
-- lists here would be us inventing her nutrition, which is the exact failure
-- this corpus exists to prevent, so each one says « à compléter » instead and
-- the gap is visible in the console rather than hidden.
--
-- `.icm/docs/braindump/` holds no nutrition content at all; the sources below
-- are the whole of what there was to seed.
--
-- Guarded on an empty table so a manual re-apply cannot duplicate the corpus.
INSERT INTO "nutrition_rules" ("title", "body", "tags", "kind", "status")
SELECT * FROM (VALUES
  (
    'Saisonnalité et surgelés',
    E'Favoriser les fruits et légumes **de saison**.\n\nLes surgelés restent possibles lorsque c’est pratique ou pertinent : simplifier le quotidien compte autant que l’idéal, et un légume surgelé mangé vaut mieux qu’un légume frais oublié.\n\n> Source — brainstorm v2 § H : « Saisonnalité : favoriser les fruits et légumes de saison ; autoriser surgelés lorsque pratique ou pertinent. »',
    '{saison,surgelés,légumes,fruits}'::text[],
    'seasonality',
    'draft'
  ),
  (
    'Orientation globalement anti-inflammatoire',
    E'Favoriser une alimentation globalement anti-inflammatoire **lorsque cela est cohérent avec l’accompagnement** — pas comme une règle absolue, mais comme une direction par défaut quand rien ne s’y oppose.\n\n> Source — brainstorm v2 § I : « Favoriser une alimentation globalement anti-inflammatoire lorsque cela est cohérent avec l’accompagnement. »',
    '{anti-inflammatoire,recettes}'::text[],
    'principle',
    'draft'
  ),
  (
    'Variété et diversité végétale',
    E'Favoriser la variété plutôt que la répétition : un plat qui revient trois fois par semaine appauvrit l’assiette même quand il est bon.\n\n> Sources — brainstorm v2 § I : « Favoriser la variété et la saisonnalité » · § H : « Compléter la sélection : … diversité végétale … lorsque pertinent. »',
    '{diversité,variété,légumes}'::text[],
    'principle',
    'draft'
  ),
  (
    'Médicaments : sécuriser les propositions, pas gérer la médication',
    E'Les médicaments en cours servent **uniquement** à sécuriser ce qui est proposé et à signaler les précautions ou interactions éventuelles.\n\nREMI ne gère pas la médication, n’en propose pas et n’en modifie pas.\n\n> Source — brainstorm v2 § G : « Les médicaments actuels servent uniquement à sécuriser les propositions et à signaler les précautions ou interactions éventuelles ; REMI ne gère pas la médication. »',
    '{médicaments,interactions,sécurité}'::text[],
    'safety',
    'draft'
  ),
  (
    'REMI propose, le praticien valide',
    E'Le praticien ne doit pas encoder aliment par aliment des champs comme « pourquoi / quantité / saison / nutriments ». REMI produit ces éléments à partir de ses connaissances, et le praticien valide ensuite.\n\n> Source — brainstorm v2 § H.',
    '{validation,praticien}'::text[],
    'house-rule',
    'draft'
  ),
  (
    'Sources d’oméga-3',
    E'**À compléter.**\n\n§ H demande à REMI de compléter une sélection avec des sources d’oméga-3, sans jamais dire lesquelles. Cette liste est donc vide volontairement : elle attend les aliments que Morgane retient, dans ses mots.\n\n> Source — brainstorm v2 § H : « Compléter la sélection : sources d’oméga-3, fibres, polyphénols, diversité végétale, etc., lorsque pertinent. »',
    '{oméga-3,lipides}'::text[],
    'food-list',
    'draft'
  ),
  (
    'Sources de fibres',
    E'**À compléter.**\n\n§ H nomme les fibres sans lister d’aliments. Rien n’a été écrit ici à sa place.\n\n> Source — brainstorm v2 § H : « Compléter la sélection : sources d’oméga-3, fibres, polyphénols, diversité végétale, etc., lorsque pertinent. »',
    '{fibres,digestion}'::text[],
    'food-list',
    'draft'
  ),
  (
    'Sources de polyphénols',
    E'**À compléter.**\n\n§ H nomme les polyphénols sans lister d’aliments. Rien n’a été écrit ici à sa place.\n\n> Source — brainstorm v2 § H : « Compléter la sélection : sources d’oméga-3, fibres, polyphénols, diversité végétale, etc., lorsque pertinent. »',
    '{polyphénols,antioxydants}'::text[],
    'food-list',
    'draft'
  ),
  (
    'Diversité végétale : quoi proposer',
    E'**À compléter.**\n\nLe principe est écrit ailleurs dans ce corpus ; ce qui manque, ce sont les aliments — lesquels proposer, et dans quel contexte. § H les demande sans les nommer.\n\n> Source — brainstorm v2 § H : « Compléter la sélection : sources d’oméga-3, fibres, polyphénols, diversité végétale, etc., lorsque pertinent. »',
    '{diversité,légumes,légumineuses}'::text[],
    'food-list',
    'draft'
  )
) AS seed(title, body, tags, kind, status)
WHERE NOT EXISTS (SELECT 1 FROM "nutrition_rules");
