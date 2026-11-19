# Findings rem-182

- La charte (section 3) propose une zone libre égale à la hauteur de la lettre « I » autour du logo. Le « I » a la hauteur de tout le logo. Les barres latérales de `apps/web` et `apps/admin` (240 px) et les en-têtes ne gardent pas cette marge : ils gardent leur espacement actuel. La charte dit « proposition de règle à valider sur le master ». Jamie ou Morgane confirme la règle.
- L'image Open Graph de `apps/marketing` (`app/[locale]/opengraph-image.tsx`) tape le nom « REMI » dans une police. Ce ticket ne la nomme pas. Un ticket peut y mettre le logo.
- Le fichier `remi-logo-charte.png` a un fin filet bleu clair au bord gauche du « E ». Il vient de la source. La découpe le garde, car elle ne redessine pas les lettres.
