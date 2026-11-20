/**
 * The food lexicon of the compatibility gate (`compatibility.ts`, REM-57).
 *
 * The gate knows a food only if a row here names it. A name that no row has is
 * unknown, and an unknown food is never compatible (D-30). Thus a missing row
 * hides a recipe. It never shows one that is unsafe.
 *
 * A row is: the names (French and English, separated by `|`), the tags that the
 * food contains, the tags that it can contain (traces, cross-contamination, a
 * frequent variant), and its flags.
 *
 * A tag is `family` or `family:sub`. The allergen families and their sub-keys
 * are the keys of `shared/questionnaire.ts`. A tag with no sub-key on a family
 * that has a sub-list means « the species is not known »: it matches each
 * sub-key. The other families are `lactose`, `meat` (with a species), `honey`,
 * `carb` (a food that a ketogenic diet forbids) and `alcohol`.
 *
 * The first name of a row is its identity. Do not put one name in two rows:
 * `compatibilityLexiconFaults()` reports it and the unit test fails.
 *
 * Morgane has not validated this table. It is a debt of REM-57.
 */

type Flags = {
  /** A prepared food. Its full composition is not known. */
  composite?: boolean;
  /** The names of the foods that this food is made from. */
  foods?: string;
};

export type LexiconRow = readonly [
  names: string,
  contains?: string,
  mayContain?: string,
  flags?: Flags,
];

const DAIRY = "milk lactose";
const BAKED_TRACES = "milk eggs sesame soy tree_nuts peanuts lupin";
const PREPARED_TRACES = "gluten milk eggs soy celery mustard sulphites";

export const LEXICON_ROWS: readonly LexiconRow[] = [
  // Cereals that contain gluten.
  [
    "blé|froment|wheat|farine de blé|wheat flour|semoule|semoule de blé|semolina|boulgour|bulgur|couscous|seitan|kamut|khorasan|germe de blé|son de blé",
    "gluten:wheat carb",
  ],
  ["farine|flour", "gluten carb"],
  ["seigle|rye|farine de seigle|rye flour", "gluten:rye carb"],
  [
    "orge|barley|orge perlé|pearl barley|malt|extrait de malt",
    "gluten:barley carb",
  ],
  [
    "avoine|oat|oats|flocons d'avoine|oat flakes|rolled oats|son d'avoine|farine d'avoine|porridge",
    "gluten:oats carb",
  ],
  [
    "épeautre|spelt|petit épeautre|einkorn|farine d'épeautre|spelt flour",
    "gluten:spelt gluten:wheat carb",
  ],
  ["triticale", "gluten:wheat gluten:rye carb"],
  [
    "pain|bread|baguette|pain complet|pain de mie|pain de campagne|pain de seigle|rye bread|toast|pain grillé|biscotte",
    "gluten carb",
    BAKED_TRACES,
  ],
  [
    "pâtes|pasta|spaghetti|tagliatelle|penne|macaroni|fusilli|lasagne|nouilles|noodles|vermicelles",
    "gluten:wheat carb",
    "eggs",
  ],
  ["gnocchi", "gluten:wheat carb", "eggs milk", { foods: "pomme de terre" }],
  [
    "chapelure|breadcrumbs|panure|croûtons|croutons",
    "gluten carb",
    BAKED_TRACES,
  ],
  [
    "biscuit|cookie|gâteau|cake|brioche|croissant|crêpe|pancake|gaufre|waffle|viennoiserie|muffin",
    `gluten eggs ${DAIRY} carb`,
    "tree_nuts peanuts soy sesame lupin",
    { composite: true },
  ],
  [
    "pâte feuilletée|pâte brisée|pâte sablée|pâte à pizza|pâte à tarte|puff pastry|shortcrust pastry|pizza dough",
    "gluten carb",
    `${DAIRY} eggs soy`,
    { composite: true },
  ],
  ["bière|beer", "gluten:barley alcohol carb", "sulphites"],
  ["sauce soja|soy sauce|shoyu", "soy gluten:wheat"],
  ["tamari", "soy", "gluten"],

  // Starches without gluten. A milled or mixed one can carry gluten traces.
  ["riz|rice|riz basmati|riz complet|brown rice|riz thaï|riz rond", "carb"],
  ["quinoa", "carb", "gluten"],
  ["sarrasin|buckwheat|kasha", "carb", "gluten"],
  ["millet|sorgho|sorghum|amarante|amaranth", "carb", "gluten"],
  ["maïs|corn|sweetcorn|maïs doux", "carb"],
  [
    "polenta|semoule de maïs|cornmeal|farine de maïs|corn flour|fécule de maïs|cornstarch|maïzena",
    "carb",
    "gluten",
    { foods: "maïs" },
  ],
  [
    "farine de riz|rice flour|farine de sarrasin|buckwheat flour|farine de pois chiche|chickpea flour",
    "carb",
    "gluten tree_nuts",
    { foods: "riz|sarrasin|pois chiche" },
  ],
  ["farine de châtaigne|chestnut flour", "tree_nuts:other carb", "gluten"],
  [
    "nouilles de riz|rice noodles|vermicelles de riz|galette de riz|rice cake",
    "carb",
    "gluten",
    { foods: "riz" },
  ],
  ["pomme de terre|potato|potatoes|patate", "carb"],
  ["patate douce|sweet potato|sweet potatoes", "carb"],
  [
    "fécule de pomme de terre|potato starch|tapioca|manioc|cassava",
    "carb",
    "gluten",
    { foods: "pomme de terre" },
  ],

  // Legumes.
  [
    "lentilles|lentils|lentilles corail|red lentils|lentilles vertes|green lentils",
    "carb",
    "gluten",
  ],
  ["pois chiche|chickpea|chickpeas", "carb"],
  [
    "haricot rouge|kidney bean|kidney beans|haricot blanc|white bean|white beans|haricot noir|black bean|black beans|fève|broad bean|broad beans|pois cassé|split pea|split peas|flageolet",
    "carb",
  ],
  ["petits pois|peas|green peas", "carb"],
  [
    "arachide|cacahuète|cacahouète|peanut|peanuts|beurre de cacahuète|peanut butter|huile d'arachide|peanut oil",
    "peanuts",
  ],
  [
    "soja|soy|soya|tofu|tempeh|edamame|lait de soja|soy milk|boisson au soja|yaourt de soja|soy yogurt|protéine de soja|huile de soja|soybean oil|lécithine de soja|soy lecithin",
    "soy",
  ],
  ["miso", "soy", "gluten"],
  ["lupin|lupine|farine de lupin|lupin flour", "lupin"],

  // Dairy.
  [
    "lait|milk|lait entier|whole milk|lait demi-écrémé|lait écrémé|skimmed milk|lait de vache|lait de chèvre|goat milk|lait de brebis|sheep milk|lait en poudre|milk powder|lait concentré|babeurre|buttermilk",
    DAIRY,
  ],
  [
    "crème|cream|crème fraîche|crème liquide|crème épaisse|sour cream",
    DAIRY,
  ],
  ["beurre|butter|beurre clarifié|ghee", DAIRY],
  [
    "yaourt|yogurt|yoghurt|yaourt grec|greek yogurt|skyr|fromage blanc|kéfir|kefir|petit suisse",
    DAIRY,
  ],
  [
    "fromage|cheese|parmesan|emmental|gruyère|comté|mozzarella|feta|ricotta|mascarpone|cheddar|camembert|brie|roquefort|fromage de chèvre|goat cheese|fromage frais|cream cheese|halloumi",
    DAIRY,
  ],
  ["lactosérum|whey|caséine|casein|protéine de lait", DAIRY],
  ["lactose", "lactose", "milk"],
  ["lait sans lactose|lactose-free milk", "milk"],
  [
    "glace|ice cream|crème glacée",
    `${DAIRY} carb`,
    "eggs tree_nuts peanuts soy gluten",
    { composite: true },
  ],
  ["margarine", "", "milk lactose soy", { composite: true }],

  // Plant drinks.
  [
    "lait de coco|coconut milk|crème de coco|coconut cream",
    "",
    "",
    { foods: "noix de coco" },
  ],
  [
    "lait d'amande|almond milk|boisson à l'amande|boisson amande",
    "tree_nuts:almond",
  ],
  ["lait de noisette|hazelnut milk", "tree_nuts:hazelnut"],
  ["lait d'avoine|oat milk|boisson à l'avoine", "gluten:oats"],
  ["lait de riz|rice milk", "carb", "gluten", { foods: "riz" }],

  // Eggs.
  [
    "œuf|egg|eggs|jaune d'œuf|egg yolk|blanc d'œuf|egg white|œuf dur|œuf à la coque|omelette",
    "eggs",
  ],
  ["mayonnaise|mayo", "eggs", "mustard sulphites", { composite: true }],

  // Fish. `fish:other` is a species that the sub-list does not name.
  ["saumon|salmon|saumon fumé|smoked salmon", "fish:salmon"],
  ["thon|tuna", "fish:tuna"],
  ["cabillaud|cod|morue", "fish:cod"],
  ["sole", "fish:sole"],
  ["truite|trout", "fish:trout"],
  ["sardine", "fish:sardine"],
  ["maquereau|mackerel", "fish:mackerel"],
  ["anchois|anchovy|anchovies", "fish:anchovy"],
  [
    "colin|merlu|hake|lieu noir|lieu jaune|pollock|haddock|églefin|sea bass|dorade|daurade|sea bream|hareng|herring|lotte|monkfish|merlan|whiting|flétan|halibut|espadon|swordfish|tilapia|rouget|turbot",
    "fish:other",
  ],
  ["poisson|fish|poisson blanc|white fish|filet de poisson", "fish"],
  [
    "surimi",
    "fish",
    "crustaceans eggs gluten soy milk",
    { composite: true },
  ],
  [
    "sauce poisson|nuoc mam|fish sauce",
    "fish",
    "crustaceans molluscs",
    { composite: true },
  ],
  ["sauce worcestershire|worcestershire sauce", "fish:anchovy", "gluten", {
    composite: true,
  }],

  // Crustaceans and molluscs.
  ["crevette|shrimp|prawn|gambas", "crustaceans:shrimp"],
  ["crabe|crab|tourteau", "crustaceans:crab"],
  ["homard|lobster", "crustaceans:lobster"],
  ["langoustine", "crustaceans:langoustine"],
  ["écrevisse|crayfish|langouste|krill", "crustaceans:other"],
  ["crustacé|crustacean", "crustaceans"],
  ["fruits de mer|seafood|shellfish", "crustaceans molluscs"],
  ["moule|mussel", "molluscs:mussel"],
  ["huître|oyster", "molluscs:oyster"],
  ["calamar|calmar|squid|encornet", "molluscs:squid"],
  ["poulpe|octopus|pieuvre", "molluscs:octopus"],
  [
    "coquille saint-jacques|noix de saint-jacques|saint-jacques|scallop|pétoncle",
    "molluscs:scallop",
  ],
  [
    "escargot|snail|bulot|whelk|palourde|clam|coque|cockle|seiche|cuttlefish|bigorneau",
    "molluscs:other",
  ],
  ["mollusque|mollusc", "molluscs"],
  ["sauce huître|oyster sauce", "molluscs:oyster", "gluten soy", {
    composite: true,
  }],

  // Tree nuts. `tree_nuts:other` is a nut that the sub-list does not name.
  [
    "amande|almond|poudre d'amande|ground almond|ground almonds|purée d'amande|almond butter|massepain|pâte d'amande|marzipan",
    "tree_nuts:almond",
  ],
  [
    "noisette|hazelnut|purée de noisette|huile de noisette|hazelnut oil",
    "tree_nuts:hazelnut",
  ],
  [
    "noix|walnut|cerneaux de noix|huile de noix|walnut oil",
    "tree_nuts:walnut",
  ],
  ["noix de cajou|cajou|cashew", "tree_nuts:cashew"],
  ["noix de pécan|pécan|pecan", "tree_nuts:pecan"],
  ["pistache|pistachio", "tree_nuts:pistachio"],
  ["noix du brésil|brazil nut", "tree_nuts:brazil_nut"],
  ["noix de macadamia|macadamia", "tree_nuts:macadamia"],
  [
    "pignon de pin|pignon|pine nut|châtaigne|marron|chestnut",
    "tree_nuts:other",
  ],
  ["fruits à coque|tree nuts|nuts|mixed nuts|oléagineux", "tree_nuts", "peanuts"],
  ["fruits secs", "tree_nuts", "sulphites peanuts"],
  ["praliné|praline", "tree_nuts:almond tree_nuts:hazelnut carb", "milk", {
    composite: true,
  }],
  [
    "pâte à tartiner|chocolate spread",
    `tree_nuts:hazelnut ${DAIRY} soy carb`,
    "tree_nuts peanuts",
    { composite: true, foods: "cacao" },
  ],
  ["pesto", `tree_nuts ${DAIRY}`, "peanuts", { composite: true }],
  [
    "noix de coco|coconut|coco|coco râpée|huile de coco|coconut oil|noix de muscade|muscade|nutmeg",
  ],

  // Celery, mustard, sesame, sulphites.
  [
    "céleri|celery|céleri-rave|celeriac|céleri branche|sel de céleri|celery salt",
    "celery",
  ],
  [
    "moutarde|mustard|graines de moutarde|mustard seeds|moutarde de dijon|dijon mustard",
    "mustard",
    "sulphites",
  ],
  [
    "sésame|sesame|graines de sésame|sesame seeds|tahin|tahini|huile de sésame|sesame oil|gomasio",
    "sesame",
  ],
  ["houmous|hummus|houmos", "sesame carb", "", {
    composite: true,
    foods: "pois chiche",
  }],
  ["sulfite|sulphite", "sulphites"],
  [
    "vin|wine|vin blanc|white wine|vin rouge|red wine",
    "sulphites alcohol",
    "",
    { foods: "raisin" },
  ],
  [
    "vinaigre de vin|wine vinegar|vinaigre balsamique|balsamic vinegar",
    "sulphites",
    "",
    { foods: "raisin" },
  ],
  ["vinaigre|vinegar|vinaigre de cidre|cider vinegar", "", "sulphites", {
    foods: "pomme",
  }],
  ["cidre|cider", "sulphites alcohol carb", "", { foods: "pomme" }],
  ["rhum|rum|cognac|whisky|vodka|liqueur|kirsch", "alcohol"],
  [
    "abricot sec|dried apricot|dried apricots|raisin sec|sultana|fruits séchés|dried fruit|pruneau|figue sèche|datte|dates",
    "carb",
    "sulphites",
    { foods: "abricot|raisin|prune|figue" },
  ],

  // Meat. The species is the sub-key.
  ["bœuf|beef|steak|viande hachée|ground beef|minced beef", "meat:beef"],
  ["veau|veal", "meat:veal"],
  ["porc|pork|filet mignon de porc|côte de porc", "meat:pork"],
  [
    "jambon|ham|lardon|bacon|lard|pancetta|saindoux",
    "meat:pork",
    `${DAIRY} sulphites gluten`,
    { composite: true },
  ],
  [
    "saucisse|sausage|chorizo|saucisson|merguez|charcuterie",
    "meat",
    `${DAIRY} gluten sulphites soy mustard tree_nuts`,
    { composite: true },
  ],
  ["poulet|chicken|blanc de poulet|chicken breast", "meat:chicken"],
  ["dinde|turkey|escalope de dinde", "meat:turkey"],
  ["canard|duck|magret", "meat:duck"],
  ["volaille|poultry|pintade", "meat"],
  ["agneau|lamb|mouton|mutton", "meat:lamb"],
  ["lapin|rabbit", "meat:rabbit"],
  ["viande|meat|gibier|foie|liver|foie gras|abats", "meat"],
  ["gélatine|gelatin|gelatine", "meat"],
  [
    "bouillon|stock|broth|bouillon cube|stock cube",
    "",
    `meat fish ${PREPARED_TRACES}`,
    { composite: true },
  ],
  [
    "bouillon de légumes|vegetable stock|vegetable broth",
    "",
    PREPARED_TRACES,
    { composite: true },
  ],
  [
    "bouillon de volaille|chicken stock|bouillon de bœuf|beef stock|fond de veau",
    "meat",
    PREPARED_TRACES,
    { composite: true },
  ],
  ["miel|honey", "honey carb"],

  // Sugar and chocolate.
  [
    "sucre|sugar|sucre de canne|cassonade|brown sugar|sucre glace|sirop d'érable|maple syrup|sirop d'agave|agave syrup",
    "carb",
  ],
  ["confiture|jam", "carb", "sulphites", { composite: true }],
  [
    "chocolat|chocolate|chocolat noir|dark chocolate",
    "carb",
    `${DAIRY} tree_nuts peanuts soy gluten`,
    { composite: true, foods: "cacao" },
  ],
  [
    "chocolat au lait|milk chocolate|chocolat blanc|white chocolate",
    `${DAIRY} carb`,
    "tree_nuts peanuts soy gluten",
    { composite: true, foods: "cacao" },
  ],
  [
    "cacao|cocoa|cacao en poudre|cocoa powder|beurre de cacao|cocoa butter",
    "",
    "milk lactose tree_nuts",
  ],

  // Vegetables.
  [
    "tomate|tomato|tomatoes|tomate cerise|concentré de tomate|tomato paste|coulis de tomate|passata|tomates pelées",
  ],
  ["sauce tomate|tomato sauce|ketchup", "", "celery sulphites gluten", {
    composite: true,
    foods: "tomate",
  }],
  ["carotte|carrot"],
  ["oignon|onion"],
  ["ail|garlic"],
  ["échalote|shallot"],
  ["poireau|leek"],
  ["courgette|zucchini"],
  ["aubergine|eggplant"],
  ["poivron|bell pepper"],
  ["concombre|cucumber"],
  ["épinard|spinach"],
  ["salade|laitue|lettuce|roquette|arugula|mâche"],
  [
    "chou|cabbage|chou-fleur|cauliflower|brocoli|broccoli|kale|chou kale|chou rouge|chou de bruxelles",
  ],
  ["champignon|mushroom|champignon de paris"],
  ["courge|squash|potiron|pumpkin|butternut|potimarron"],
  ["betterave|beetroot"],
  ["navet|turnip"],
  ["radis|radish"],
  ["fenouil|fennel"],
  ["asperge|asparagus"],
  ["artichaut|artichoke"],
  ["avocat|avocado"],
  ["haricot vert|green bean|green beans"],
  ["endive|chicon"],
  ["blette|panais|parsnip"],
  ["olive"],
  ["cornichon|pickle|câpres|capers", "", "sulphites mustard"],

  // Fruit. A sweet fruit carries `carb`.
  ["pomme|apple", "carb"],
  ["poire|pear", "carb"],
  ["banane|banana", "carb"],
  ["orange|clémentine|mandarine", "carb"],
  ["raisin|grape", "carb", "sulphites"],
  ["mangue|mango", "carb"],
  ["ananas|pineapple", "carb"],
  ["pêche|peach", "carb"],
  ["abricot|apricot", "carb"],
  ["cerise|cherry|cherries", "carb"],
  ["prune|plum", "carb", "sulphites"],
  ["kiwi", "carb"],
  ["melon|pastèque|watermelon", "carb"],
  ["figue|fig", "carb"],
  ["grenade|pomegranate", "carb"],
  ["jus d'orange|orange juice", "carb", "", { foods: "orange" }],
  ["jus de pomme|apple juice", "carb", "", { foods: "pomme" }],
  ["citron|lemon|citron vert|lime|jus de citron|lemon juice"],
  ["pamplemousse|grapefruit"],
  ["fraise|strawberry|strawberries"],
  ["framboise|raspberry|raspberries"],
  ["myrtille|blueberry|blueberries"],
  ["mûre|blackberry|blackberries"],
  ["fruits rouges|berries|red berries"],

  // Oils, seeds, herbs, spices and the rest.
  [
    "huile d'olive|olive oil|huile de colza|rapeseed oil|canola oil|huile de tournesol|sunflower oil",
    "",
    "",
    { foods: "olive" },
  ],
  ["huile|oil|huile végétale|vegetable oil", "", "peanuts soy sesame tree_nuts"],
  [
    "graines de chia|chia|graines de lin|flaxseed|linseed|graines de tournesol|sunflower seeds|graines de courge|pumpkin seeds",
    "",
    "sesame tree_nuts peanuts",
  ],
  ["sel|salt"],
  ["poivre|pepper|black pepper"],
  [
    "persil|parsley|basilic|basil|coriandre|coriander|cilantro|menthe|mint|thym|thyme|romarin|rosemary|laurier|bay leaf|ciboulette|chives|aneth|dill|origan|oregano|estragon|tarragon|sauge|sage|herbes de provence",
  ],
  [
    "cumin|curcuma|turmeric|paprika|cannelle|cinnamon|gingembre|ginger|piment|chili|chilli|vanille|vanilla|safran|saffron|clou de girofle|clove",
  ],
  [
    "curry|curry powder|poudre de curry|garam masala|ras el hanout|épices|spices|mélange d'épices",
    "",
    "mustard celery gluten sesame",
    { composite: true },
  ],
  ["levure|yeast|levure chimique|baking powder", "", "gluten"],
  ["bicarbonate|bicarbonate de soude|baking soda"],
  ["eau|water"],
  ["café|coffee|tisane"],
];

/**
 * Words that do not change what a food is. A word that can change the
 * composition is not here: « sans », « pané », « sec », « fumé ». Such a word
 * stays unknown, and an unknown word makes the item uncertain.
 */
export const FILLER_WORDS =
  "de|d|du|des|la|le|l|les|au|aux|à|un|une|et|en|of|the|and|frais|fraîche|cru|crue|cuit|cuite|haché|hachée|râpé|râpée|moulu|moulue|entier|entière|bio|nature|surgelé|surgelée|fresh|raw|cooked|ground|chopped|grated|organic|plain|frozen|rouge|vert|verte|jaune|blanc|blanche|noir|noire|red|green|yellow|white|black|petit|petite|gros|grosse";

/**
 * The words of a text term that name a family and not one food. An eviction
 * « lait » excludes each dairy food, not only the row « lait ».
 */
export const TERM_TAGS: readonly (readonly [terms: string, tags: string])[] = [
  ["gluten", "gluten"],
  [
    "lait|milk|produit laitier|produits laitiers|laitage|dairy|protéines de lait",
    "milk",
  ],
  ["lactose", "lactose"],
  ["œuf|egg|eggs", "eggs"],
  ["poisson|fish", "fish"],
  ["crustacé|crustacean", "crustaceans"],
  ["mollusque|mollusc", "molluscs"],
  ["fruits de mer|seafood|shellfish", "crustaceans molluscs"],
  ["fruits à coque|tree nuts|nuts", "tree_nuts"],
  ["arachide|cacahuète|peanut|peanuts", "peanuts"],
  ["soja|soy|soya", "soy"],
  ["sésame|sesame", "sesame"],
  ["moutarde|mustard", "mustard"],
  ["céleri|celery", "celery"],
  ["lupin", "lupin"],
  ["sulfite|sulphite", "sulphites"],
  ["viande|meat", "meat"],
  ["volaille|poultry", "meat:chicken meat:turkey meat:duck"],
  ["porc|pork", "meat:pork"],
  ["bœuf|beef", "meat:beef"],
  ["alcool|alcohol", "alcohol"],
  ["miel|honey", "honey"],
];
