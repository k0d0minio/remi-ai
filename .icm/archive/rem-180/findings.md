# Findings rem-180

Textes au « vous » que ce ticket ne change pas : leur lecteur n'est pas seulement le patient.

1. `apps/web/lib/content/fr.ts`, `meta.description` : la description de la page d'entrée. Le lecteur est un patient, un praticien ou un moteur de recherche.
2. `apps/web/lib/content/fr.ts`, `signIn` : la connexion de la session de développement. Elle sert aux deux rôles (« Continuer en tant que »).
3. `apps/web/app/[locale]/error.tsx` et `apps/web/app/[locale]/(app)/error.tsx` : la page d'erreur commune aux deux rôles.
4. `apps/marketing/lib/content/legal.ts` : la politique de confidentialité du site public. Elle reste au « vous ». La version 3 du texte de consentement `care` (dans l'application) est au « tu ». Les deux textes ont maintenant une forme différente pour le même contenu.
5. Les nouvelles versions `care` 3 et `genetic` 2 changent seulement la forme (« tu »), pas le contenu. Morgane ou un juriste peut relire la forme avant la promotion en production. La prochaine version de Morgane du consentement génétique devient la version 3.
