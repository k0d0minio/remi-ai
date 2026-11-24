# Findings rem-133

1. Les utilisateurs Neon Auth des patients supprimés avant cette correction restent dans `neon_auth."user"` (UAT et production). Une requête qui cherche les utilisateurs sans ligne `patient_accounts` les trouve. Leur suppression est une décision de l'opérateur et une opération à part.
2. Les lignes `neon_auth.verification` d'un lien magique ou d'une réinitialisation de mot de passe gardent l'e-mail jusqu'à leur expiration (quelques minutes). Cette correction ne les supprime pas.
