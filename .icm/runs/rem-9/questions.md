### Q1. Quel texte des CGV la fenêtre modale « Conditions générales de vente » affiche-t-elle ?

- type: single
- options: Les CGV du site public, copiées dans l'app | Un texte des CGV du pilote fourni par Morgane ou un juriste | La page CGV du site public dans un cadre
- default: Copier les CGV du site public (version du 02.11.2026, bandeau « à faire valider par un juriste » compris) dans un fichier versionné de l'app, `packages/services/src/consent/texts/cgv/1.fr-BE.md`. Le texte ne change pas. L'app n'a aujourd'hui aucun texte des CGV : le seul document de l'inscription est la politique de confidentialité (clé `care`, version 3).
- answer: _waiting_

### Q2. Comment l'app enregistre-t-elle l'acceptation des CGV ?

- type: single
- options: Comme aujourd'hui, sans la version des CGV | Une ligne de plus avec la version des CGV
- default: Comme aujourd'hui. La case cochée enregistre une ligne pour la politique de confidentialité : date, version et empreinte du texte. La version des CGV n'est pas enregistrée. Un ticket de suivi peut l'ajouter. La deuxième option est une nouvelle donnée : une clé `cgv` apparaît aussi dans « Mes consentements » et dans la section consentements de l'admin. Elle dépasse la voie `tweak` et demande la voie `new`.
- answer: _waiting_
