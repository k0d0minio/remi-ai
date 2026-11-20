# Recipe generation for REMI — research report

- Date: 2026-11-20
- Asked by: Jamie (CTO), before the build of REM-91
- Status: research only. No product code changed. No decision is taken here.

## The question

How should REMI generate recipes and weekly meal plans reliably, so that they fit a patient's
validated protocol, are safe, make culinary sense, taste good, and suit the patient's cooking
skill?

## The answer in short

Do not let a model write a recipe freely. Do not adapt twenty fixed recipes either. Use a middle
path with three parts.

1. **Data.** One closed ingredient catalogue that the safety gate knows completely. A set of
   verified dish skeletons (« canevas ») with slots, quantity ranges, ratios and steps. Morgane
   reviews both.
2. **Code.** Code removes the foods that the patient cannot eat before the model sees them. Code
   sets the quantities, computes the nutrients from CIQUAL, plans the week, scores the difficulty
   and runs every check.
3. **Model.** The model chooses which allowed foods fill the slots and which flavour profile the
   dish has. It writes the French title and the step text. A second model call scores the
   culinary sense with a rubric. The model never names a food that is not in the catalogue, and
   it never decides a quantity alone.

This keeps decision D-34 in its intent: each recipe starts from verified material. It changes
its letter: the verified material is a skeleton and a catalogue, not a full recipe. Jamie
decides this change (question J1).

## How to read this report

Each claim has one of these labels.

- **[E]** Evidence: a peer-reviewed study, an official source, or the code of this repo.
- **[e]** Thin evidence: one study, a preprint, a secondary summary, or a vendor's own statement.
- **[C]** Convention of cooks or dietitians. Not tested.
- **[J]** My judgement.

**A limit of the method.** Three research agents did the web search. The page fetch tool was
refused for most sites in their sessions. Thus most claims below come from search result
summaries and abstracts, and not from the full texts. Each link was returned by a search. No
link is invented. Check an exact number in its source before you encode it. Where a detail could
not be confirmed, the text says so.

---

## 1. What makes a dish work

### 1.1 Flavour pairing

- The "shared compound" hypothesis says that two foods go together when they share flavour
  compounds. Ahn et al. (2011) tested it on about 56,000 recipes, 381 ingredients and 1,021
  compounds. North American and Western European recipes prefer pairs that share compounds.
  East Asian recipes avoid them. **[E]**
  <https://pmc.ncbi.nlm.nih.gov/articles/PMC3240947>
- Jain, Rakhi and Bagler (2015) found that Indian regional cuisines pair below chance. Spices
  cause the negative pattern. **[E]** <https://pmc.ncbi.nlm.nih.gov/articles/PMC4592201>
- Spence (2020) calls the hypothesis "now-discredited" and says that many usual pairings come
  from culture and geography. **[E]** as an expert review. The wording is the author's.
  <https://pubmed.ncbi.nlm.nih.gov/32466920/>
- No independent test of the commercial Foodpairing method was found.

**Conclusion [J].** Shared compounds describe some Western cuisines. They are not a law of
taste. The sign of the effect changes between cuisines. A generator must not rank pairs by
compound count. The better signal is what real recipes of the target cuisine put together. For
REMI the practical form of that signal is a small set of flavour profiles that a cook wrote and
Morgane accepted (for example « provençal », « nordique », « asiatique doux »), and not a
statistical model.

### 1.2 Balance of taste

- Mixtures of two tastes usually suppress each other. The effect depends on the concentration.
  (Keast and Breslin 2003.) **[E]**
  <https://dro.deakin.edu.au/articles/journal_contribution/An_overview_of_binary_taste-taste_interactions/20542116>
- Salt suppresses bitterness, and sweetness then rises (Breslin and Beauchamp 1997). The effect
  depends on the bitter compound. **[E]** <https://www.nature.com/articles/42388>
- Sweetness suppresses bitterness, sourness and saltiness. **[E]**
  <https://pmc.ncbi.nlm.nih.gov/articles/PMC2975745>
- Umami synergy: glutamate (tomato, parmesan, soy sauce) with nucleotides (meat, fish, dried
  mushroom) is more than additive. **[E]** <https://pmc.ncbi.nlm.nih.gov/articles/PMC11097012>
- One study in water found that umami did not enhance the other tastes. **[e]**
  <https://centaur.reading.ac.uk/102035/1/Interactions%20of%20umami%20with%20the%20four%20other%20basic%20tastes.pdf>
- "Salt, fat, acid, heat" (Nosrat): salt enhances, fat carries flavour, acid balances, heat
  decides texture. **[C]**
  <https://www.npr.org/sections/thesalt/2017/05/30/529699099/-salt-fat-acid-heat-a-guide-to-the-elements-of-cooking>

**What code can use [J].** Give each catalogue food its taste roles: salt, acid, fat, sweet,
bitter, umami, pungent. A savoury skeleton then requires one acid source and one fat source,
and it adds salt or a sweet element when a bitter food is present. The science gives the
direction. It does not give the dose. A cook sets the dose in the skeleton.

A conflict to note: a protocol can limit salt, fat or sugar. The protocol wins (D-30). The
skeleton then uses acid, herbs, spices and umami sources in their place **[C]**.

### 1.3 Texture

- The idea that contrast of texture raises liking is old (Szczesniak and Kahn 1984, Hyde and
  Witherly 1993). It is mostly theory. **[e]**
- Pellegrino et al. (2020, 288 people, three countries) say that the idea "is largely based
  upon anecdotal data", and that liking of varied textures differs by culture. **[E]**
  <https://oar.a-star.edu.sg/storage/e/e0q875j07p/8-pellegrino-et-al-2019-texture-contrast-v15-1-cgf-002.pdf>

**What code can use [J].** A soft rule only: a skeleton names one optional "contrast" slot (a
crunchy topping on a soup, a fresh herb on a stew). It is a preference, never a reason to
refuse a recipe.

### 1.4 Cooking methods

- Browning (the Maillard reaction) needs dry heat. It is fast near 150 °C and above and slow in
  wet food. Boiling, steaming and braising near 100 °C do not brown. Roasting, grilling,
  sautéing and frying do. **[E]** for the factors, **[e]** for the exact numbers.
  <https://pmc.ncbi.nlm.nih.gov/articles/PMC12154226/>
- Cooking changes weight and nutrients. Two public tables give factors: the USDA Table of
  Nutrient Retention Factors, Release 6, and the EuroFIR recipe guideline, which rests on
  Bognár (2002). The EuroFIR rule: apply the weight yield at recipe level and the nutrient
  retention at ingredient level. **[E]**
  <https://www.ars.usda.gov/Services/docs.htm?docid=9448>,
  <https://www.eurofir.org/wp-admin/wp-content/uploads/2015/12/EUROFIR-RECIPE-GUIDELINE_FINAL.pdf>
- Boiling loses the most vitamin C. Steaming and microwaving keep more. **[E]** for the
  direction, **[e]** for the numbers. <https://pmc.ncbi.nlm.nih.gov/articles/PMC6049644>

**What code can use [J].** Each method is one row of a small table: dry or moist, its usual
temperature and time range for each food family, its equipment, and its skill tier. A step
whose time or temperature is out of the range fails a check. Energy and protein change little
with the method, so a first version can compute them from raw weights. Retention factors
matter when a protocol targets a vitamin. That can wait.

### 1.5 Ratios and the function of an ingredient

- Ruhlman's ratios by weight: bread 5:3 flour to water, pie dough 3:2:1 flour to fat to water,
  vinaigrette 3:1 oil to vinegar. **[C]**
  <https://www.npr.org/2009/07/26/107019060/throw-away-the-recipe-learn-the-ratio-instead>
- Baker's percentages: flour is 100 %, water about 65 %, salt about 2 %. **[C]**, an industry
  standard. <https://www.kingarthurbaking.com/pro/reference/bakers-percentage>
- No study was found that tests which dish families tolerate free quantities. The usual split
  is: baking, custards and emulsified sauces are sensitive. Soups, salads, sautés, bowls,
  tray-bakes and stews are tolerant. **[C]**

**What this means for REMI [J].** This split is the most useful single fact for the design.
A generator can vary a tolerant dish safely: a soup with 50 g more carrot is still a soup. It
cannot vary a cake. REMI's everyday meals are almost all in the tolerant families. Thus
skeletons for tolerant families can have wide slots, and a ratio-sensitive dish (pancakes,
bread, a quiche base) must be a fixed verified recipe with narrow, named substitutions.

### 1.6 Substitutions for allergies and evictions

- **Gluten.** Gluten holds the gas in a dough. Binders (xanthan, psyllium, HPMC) replace this
  in part. The result depends on the flour and the water. **[E]** for the function.
  <https://pmc.ncbi.nlm.nih.gov/articles/PMC8701227>
- **Egg.** An egg binds, foams and emulsifies. No single replacer does all three. Some
  replacers bring a second allergen (whey, soy). **[E]**
  <https://link.springer.com/article/10.1007/s11947-023-02999-1>
- **Dairy.** Most plant drinks have little protein. Soy is the nearest to milk. They can
  curdle with heat and acid. **[e]** <https://www.mdpi.com/2304-8158/14/23/3989>
- **Nuts.** Seeds are the usual replacement. Clinics differ on the detail, and
  cross-contact is a risk. Many people with one tree-nut allergy react to more than one nut.
  **[E]** for the caution.
  <https://www.chla.org/sites/default/files/atoms/files/CHLA-Tree-Nut-Free-Diet-2016.pdf>
- **Low FODMAP (Monash University).** Fructans dissolve in water and not in oil. Garlic-infused
  oil carries the flavour without the fructans. Garlic that simmers in a soup and is then
  removed is not safe. The green part of leek and spring onion is low, the white part is high.
  A food's rating changes with the portion, and several "green" portions in one meal can add
  up. **[E]**
  <https://monashfodmap.com/blog/all-about-onion-garlic-and-infused-oils-on-the-low-fodmap-diet>,
  <https://monashfodmap.com/blog/fodmap-stacking-explained>
- **Learned substitution models** exist (GISMo and the Recipe1MSubs benchmark, FoodKG, FoodBERT).
  They learn what cooks swap. They are not a safety filter. **[E]**
  <https://arxiv.org/pdf/2302.07960>, <https://pmc.ncbi.nlm.nih.gov/articles/PMC7861309>

**What this means for REMI [J].**

- In a tolerant dish a substitution is a slot choice: the slot « féculent » takes rice in the
  place of pasta. Nothing breaks. This is the reason to build on slots.
- In a sensitive dish a substitution changes the recipe. It needs a verified variant, written
  by a cook. REMI must not invent a gluten-free or egg-free baked recipe.
- A substitute can bring a new allergen. The gate must read the recipe after every
  substitution. It does so today.
- A FODMAP rule is a rule on grams for each portion and for each meal. The gate has no such
  rule today (section 6.2). It needs the validated table of D-33 first.

---

## 2. How recipes are represented and generated

### 2.1 Schemas and ontologies

| Name | What it is | Use for REMI |
| --- | --- | --- |
| schema.org `Recipe` | Web markup. Ingredients are free text lines. Steps are `HowToStep`. Nutrition values are strings. **[E]** | Export only (a shared recipe page). It cannot carry a food code or a number that code can use. |
| Cooklang | Plain-text recipe markup. Each ingredient mention in a step carries its quantity. **[E]** <https://cooklang.org/docs/spec/> | The idea is useful: a step names the ingredients that it uses. No need for the format. |
| FoodOn | Open food ontology, more than 28,000 classes. **[e]** | Not needed now. A later source of hierarchy ("almond is a tree nut"). |
| FoodEx2 (EFSA), LanguaL | Facet codes for foods, used by national tables. **[E]** <https://www.eurofir.org/our-tools/foodexplorer/> | Not needed now. |
| Recipe1M+, RecipeNLG, FoodKG | Research corpora, English, scraped. RecipeNLG allows research use only. **[E]** <https://huggingface.co/datasets/recipe_nlg/blob/main/README.md> | Not usable in the product. |

**Conclusion [J].** REMI's own structured recipe (`structured-recipe.ts`) is the right base. No
public schema gives what the generator needs: a food identity that code can check, a role for
each ingredient, and a quantity in grams. REMI adds these fields to its own shape.

### 2.2 Food composition and allergen data

| Source | Facts | Use for REMI |
| --- | --- | --- |
| CIQUAL (ANSES) | 3,484 foods and 74 components in the version that this repo imports. Open data. The licence text of the newest version was not confirmed by the research. **[E]** <https://www.anses.fr/en/content/new-enhanced-and-more-representative-version-ciqual-table> | The nutrient source. Already in the repo. |
| Nubel, Internubel (Belgium) | Table of 1,544 products (7th edition, 2022). Internubel is the brand database. No current price, licence for software use, or API was found. **[e]** <https://news.belgium.be/fr/node/30994/pdf> | Possible later for Belgian brands. Needs a direct request to Nubel. |
| USDA FoodData Central | Public domain (CC0). US foods. **[E]** <https://fdc.nal.usda.gov/about-us> | A fallback for a missing value. Its retention table is useful. |
| Open Food Facts | ODbL licence with share-alike. Crowdsourced, "best effort", with allergen fields. No validation study of the allergen field was found. **[E]** <https://wiki.openfoodfacts.org/Quality> | Never the source of truth for an allergen. Possible later for a barcode feature. |
| EU Regulation 1169/2011, Annex II | The 14 allergens that a label must name. **[E]** <https://www.legislation.gov.uk/eur/2011/1169/annex/II> | The gate's allergen families already follow it (`shared/questionnaire.ts`). |

### 2.3 What goes wrong when a model writes recipes and meal plans

- **Allergen leaks.** Niszczota and Rybicka (2023) asked ChatGPT for 56 diets for people with
  food allergies. Some nut-free diets held almond milk. Wrong portions and wrong energy values
  were the most common errors. The model is old and the study is single. **[E]** for the
  finding. <https://pubmed.ncbi.nlm.nih.gov/37269717/>
- **Wrong energy and nutrients.** Dietitians who rated chatbot menus found missed targets for
  energy, carbohydrate, fat, vitamin D and calcium. One 2026 study reports plans about 695 kcal
  under a dietitian's reference. **[E]** and **[e]**.
  <https://pubmed.ncbi.nlm.nih.gov/39060542/>, <https://pubmed.ncbi.nlm.nih.gov/40111941/>,
  <https://pmc.ncbi.nlm.nih.gov/articles/PMC11206595>
- **List and steps that do not agree.** Papers on recipe generation name forgotten
  ingredients, ingredients that appear only in a step, wrong quantities, and steps that read
  well and are wrong. Text metrics do not detect these. **[e]**
  <https://arxiv.org/html/2508.14718v1>
- **Unsafe output.** A supermarket's meal bot (Pak'nSave, 2023) produced a recipe for chlorine
  gas from free-text input. No person reviewed its recipes. **[E]**
  <https://incidentdatabase.ai/cite/594/>
- **Monotony.** Reported in summaries of the 2023 study. **[e]**
- **Not found:** a study that measures cooking-safety errors (undercooked poultry, unsafe
  preserving) in model recipes. The risk is plausible. It is not measured.

This repo has its own case **[E]**: the cheap model proposes foods that the gate's lexicon does
not know, and the gate refuses them (`ai/index.ts`: `fast` is `mistral/mistral-nemo`).

### 2.4 Approaches that reduce these faults

- **Retrieve a verified case, then adapt it.** This is case-based reasoning. CHEF (Hammond,
  1986) reused and repaired past recipes. Taaable (Computer Cooking Contest, from 2008)
  retrieves a recipe, substitutes ingredients with a food hierarchy, and adapts quantities
  with linear optimisation. This is the nearest academic precedent to D-34. **[E]**
  <https://hal.archives-ouvertes.fr/hal-00912767>
- **Optimisation for nutrients.** Linear and mixed-integer diet models are a mature field.
  Reviews say that acceptability must be modelled or the result is not eaten. **[E]**
  <https://pmc.ncbi.nlm.nih.gov/articles/PMC6021504>
- **Model plus solver.** A 2026 conference paper reports that plans within 10 kcal of the
  target rose from 9 % to about 80 % when a numeric optimiser did the numbers. A template
  baseline with no model was stronger on some numeric measures. Read as an abstract only.
  **[e]** <https://icml.cc/virtual/2026/82530>
- **Hard filters before the model, checks in code after it.** Reported by recent preprints.
  **[e]** <https://arxiv.org/pdf/2610.07886>
- **Retrieval alone** does not clearly fix numbers. It gives traceable food codes. **[e]**
- **A model as the only validator** is not enough. One student project scored about 85 %. **[e]**
- **Constrained output to a closed vocabulary, and critique passes.** No evaluation in this
  domain was found. Structured output with an enumerated field is a standard feature of the
  model providers, and the repo's seam already uses structured output. **[J]** that it works
  here. It needs a test (stage 3 of the plan).
- **Commercial meal planners.** PlateJoy, Mealime, Eat This Much and Jow select from a recipe
  base that people wrote. Samsung Food adds a model that rewrites a retrieved recipe, with no
  published safety evaluation. No vendor was found that sends freely generated recipes to
  patients with a documented safety record. **[e]**, mostly the vendors' own statements.
  <https://www.healthline.com/nutrition/platejoy>, <https://www.eatthismuch.com/how-it-works>

**Conclusion [J], from [E] and [e] above.** The evidence supports this order of trust: code
for anything that is a number or a safety rule, verified human material for the structure of a
dish, and a model for choice among allowed options and for wording. No evidence supports a
model as the author of quantities or as the judge of safety.

---

## 3. How a weekly plan is built

### 3.1 What dietitians do

- People who plan meals follow dietary guidelines better and eat a wider variety
  (NutriNet-Santé, 40,554 adults, Ducrot et al. 2017). This is an association, not a proven
  cause. **[E]** <https://pubmed.ncbi.nlm.nih.gov/28153017/>
- Do not plan seven cooked dinners. Plan two to four cooked meals and use planned leftovers.
  Double a recipe and eat or freeze the extra portions. **[C]**
  <https://www.brownhealth.org/be-well/meal-planning-101-how-eat-healthy-and-save-time-and-money>
- Make one shopping list for the week, after a check of the cupboard. **[C]**
- No dietetic body was found that gives a number for acceptable repetition.

### 3.2 Belgian and French guidelines

The Belgian Superior Health Council's advice 9284 (2019) gives numbers that code can check
**[E]**: wholegrain at least 125 g a day, fruit 250 g a day, vegetables at least 300 g a day,
legumes at least once a week, nuts or seeds 15 to 25 g a day, fish once or twice a week, red
meat at most 300 g a week, processed meat at most 30 g a week, salt under 5 g a day.
<https://www.fao.org/nutrition/education/food-dietary-guidelines/regions/countries/Belgium/en>

**A caution.** Secondary sources report that the Council replaced this advice in 2025 (advice
9805 to 9807) with other numbers for fish, legumes and nuts. The primary text was not read.
Read it before any number is encoded. <https://news.belgium.be/fr/node/40330/pdf>

The French numbers (PNNS 4) are looser on meat: 500 g of meat other than poultry and 150 g of
charcuterie a week. **[E]** The Harvard plate gives proportions only: half vegetables and fruit,
a quarter whole grains, a quarter protein. **[C]**
<https://nutritionsource.hsph.harvard.edu/healthy-eating-plate/>

**For REMI [J].** These are population guidelines. A patient's validated protocol outranks
them (D-30). They are the default for what the protocol does not say, and only if Morgane
accepts them (question M6). REMI already has Morgane's own plate rule in the five meal
orientations of story 11 (`shared/meal-configuration.ts`).

### 3.3 Protein over the day

- One small study (8 people) found more muscle protein synthesis with an even split than with
  a skewed split. **[e]** <https://pmc.ncbi.nlm.nih.gov/articles/PMC4018950>
- A review proposes about 0.4 g/kg for each meal. **[e]** <https://pubmed.ncbi.nlm.nih.gov/29497353/>
- Against this: one trial found that a single dose of 100 g gave a larger and longer response
  than 25 g. A trial in older adults found no difference between even and skewed. A 2021
  systematic review called the evidence not sufficient. **[e]**
  <https://pubmed.ncbi.nlm.nih.gov/38118410/>, <https://pubmed.ncbi.nlm.nih.gov/33550490>

**Conclusion [J].** The daily total is the established target. The split is a soft preference.
The planner must reach the validated daily protein value. It must not refuse a plan because of
the split. Where the practitioner set an orientation for a meal, that orientation decides.

### 3.4 Season in Belgium

Several calendars exist (Bruxelles Environnement, Good Food Brussels, Test-Achats, Velt). They
differ on stored and greenhouse produce. **[C]**
<https://goodfood.brussels/sites/default/files/inline-files/Calendrier_FR_2025_V5.pdf>

REMI needs one reference table. Morgane already answered: her « Calendrier fruits et légumes de
saison » is the table (`recipe-space/breakdown.md`, question 2). Frozen vegetables are
acceptable all year **[C]**.

### 3.5 Variety and repetition

- More variety in a meal raises intake. **[E]** <https://pmc.ncbi.nlm.nih.gov/articles/PMC7948867>
- People who ate the same sauce once a week for ten weeks liked it less with time. Boredom was
  lowest when they chose among three flavours. One product, 105 people. **[e]**
  <https://pubmed.ncbi.nlm.nih.gov/10986104/>
- No study gives a limit for how often a dish can come back in a plan.

**Conclusion [J].** Any repeat limit is a convention. REM-91's rule (no recipe name twice in
the week, nor in the two weeks before) is one. The useful finding is that choice reduces
boredom. A patient who can replace a proposed recipe by another one will accept the plan
better than a patient with a perfect plan and no choice.

---

## 4. Cooking skill

### 4.1 Published frameworks

- Lavelle et al. (2017) validated two confidence measures. Cooking skills has 14 items: chop
  and mix, blend, steam, boil, stew, roast, fry, microwave, bake, prepare vegetables, prepare
  raw meat, prepare raw fish, make a sauce, use herbs and spices. Food skills has 19 items:
  plan ahead, write a list, keep a budget, use leftovers and more. **[E]**
  <https://link.springer.com/10.1186/s12966-017-0575-y>
- Hartmann, Dohle and Siegrist (2013): higher skill goes with more vegetables and less
  convenience food. Enjoyment of cooking was the strongest predictor of skill. **[E]** for the
  association.
- Short (2006): skill is also perception (to judge when a food is cooked) and organisation (to
  time several tasks), not only technique. **[e]**, qualitative.
- McGowan et al. (2017): the field has no agreed definition or measure of cooking skill. **[E]**
  <https://openaccess.city.ac.uk/id/eprint/14731/>

### 4.2 How recipe difficulty is measured

- No validated standard was found.
- HelloFresh publishes the meaning of its three levels: level 1 has little multitasking and one
  or two pans. Level 2 has more multitasking and more techniques. Level 3 has the most
  multitasking and unfamiliar ingredients. No formula. **[C]**
  <https://hellofreshusa.zendesk.com/hc/en-us/articles/115008779048-What-do-the-recipe-levels-mean>
- Marmiton and BBC Good Food publish no criteria.
- One preprint scores difficulty from six features: the level of the cooking action, the text
  length, the utensils, the seasonings, the ingredients and the steps. **[e]**
  <https://www.researchsquare.com/article/rs-11506878>

### 4.3 One dish at several levels

- No published method was found. The usual moves are conventions **[C]**: canned or frozen or
  pre-cut ingredients, one pan, a sauce that is assembled and not cooked, no step where two
  things must be ready at the same moment.
- Frozen vegetables are near fresh in nutrients. Canning loses vitamin C. No-added-salt cans
  are the better choice. **[e]** <https://ucanr.edu/sites/default/files/2010-06/19187.pdf>
- Barriers to cooking from scratch are time, cost, effort and the fear of failure. **[e]**
  <https://openaccess.city.ac.uk/id/eprint/15260/>

**Conclusion [J].** Skill has three parts that software can use: the techniques that a person
can do, the number of things that the person can manage at the same time, and the equipment in
the kitchen. Time is a separate axis: a skilled cook can have ten minutes. REMI has time
(`cookingTimes`) and enjoyment (`cookingAffinities`) today. It has no skill and no equipment.

---

## 5. How to know that a generated recipe is correct and good

No published, validated rubric for generated recipes or meal plans exists. Studies use ad hoc
scales by one or two dietitians. **[e]** The methods below are the ones in use.

| Method | What it catches | Evidence |
| --- | --- | --- |
| Recompute the nutrients from a composition table | Wrong energy and macros | **[E]**: every study of chatbot menus does this and finds errors of about 20 % |
| Rule checks in code | Allergens, evictions, list against steps, time and temperature ranges, ratios | **[E]** that they are necessary (the almond-milk case). No measure of how complete they are |
| Golden set | Regressions when a prompt, a model or a rule changes | **[C]**, standard practice in software |
| A second model as judge | Culinary nonsense, unclear steps | **[e]**: judges have position and self-preference bias. Use another model than the generator, and calibrate it on recipes that a person scored <https://arxiv.org/pdf/2411.15594> |
| Expert review of a sample | What no rule expresses: taste, sense, tone | **[E]** for the statistics: with zero faults in *n* reviewed items, the fault rate is below about 3/*n* with 95 % confidence. 300 clean reviews give "below 1 %" <https://en.wikipedia.org/wiki/Rule_of_three_(statistics)> |
| Feedback of patients | Real acceptance | **[C]**. No published evaluation was found |

**Conclusion [J].** Safety and numbers can be proved by code on every recipe. "Good" cannot.
It can only be sampled by a person and estimated by a judge model that the person calibrated.
The honest claim for REMI is thus: each recipe is checked for safety and numbers, and the
quality is measured on a sample.

---

## 6. What the repo has today

Read on branch `claude/recipe-generation-research-826baa`, 2026-11-20. All **[E]**.

### 6.1 The recipe

`packages/services/src/shared/structured-recipe.ts` (REM-90) is the one definition. A recipe
has a description, preparation and cooking minutes, portions, meal slots, seasons, ingredients
and steps. An ingredient has `quantity`, `unit` (a closed list of 19), `name` (free text),
`note` (free text) and `foodCode` (a CIQUAL code, or null). A step has a text, an optional
temperature and an optional duration.

It has no field for: a role of an ingredient, a weight in grams, a technique, equipment, a
difficulty, or the ingredients that a step uses.

`recipes` holds the library. A recipe with `verifiedAt` set is a template (D-34).
`patient_recipes` holds a generated recipe for one patient, one day and one meal. The service
refuses a write with no verified template and a write that the gate did not confirm
(`db/services/generated-recipes`).

### 6.2 The safety gate

`ai/compatibility.ts` (REM-57) is one pure function. Only `compatible` is shown. The gate
reads the `name` of each ingredient and looks for it in `ai/compatibility-lexicon.ts`, about
215 rows of French and English names with allergen tags. A word that the lexicon does not know
makes the recipe `uncertain`, and it is not shown.

Four facts matter for generation.

1. **Two vocabularies do not meet.** The gate reads `name` against the lexicon. Nutrients come
   from `foodCode` against CIQUAL. Nothing links a lexicon row to a CIQUAL food. Nothing makes
   a model use either.
2. **The lexicon is not validated.** Its header says: "Morgane has not validated this table. It
   is a debt of REM-57."
3. **Some patients can get no recipe at all.** An intolerance to fructose, sorbitol, polyols,
   histamine or FODMAP has no food table. The gate marks it `unresolved`, and then every item
   is `uncertain`. The same holds for a diet « Autre », for an « Autre » allergen that the gate
   cannot read, and for a patient who did not answer the allergy questions. This is correct
   and safe. It also means that generation produces nothing for these patients until D-33's
   table exists.
4. **The gate does not read `note`, the steps or the title.** A step that says « ajoute une
   noix de beurre » is not seen if butter is not in the ingredient list.

### 6.3 The AI seam

`ai/index.ts` gives three roles: `fast` (`mistral/mistral-nemo`), `balanced` and `deep`. An
admin can change the model of a role in the console. `generateJson` gives structured output
checked by a zod schema. `server/meals/suggest.ts` (REM-102) is the pattern: code builds the
context, the model answers, the gate reads the answer, and only a confirmed food is shown. The
meal prompt asks for "one simple food, one to three words". The answer is free text. That is
the cause of the known fault: the model names a food that the lexicon does not have.

### 6.4 CIQUAL

`db/services/foods` holds 3,484 foods and 74 components. `rankFoodsByComponent` ranks foods by
a nutrient. No code computes the nutrients of a recipe today. A unit such as `piece`, `clove`
or `tbsp` has no weight in grams, so a sum is not possible for such a line.

### 6.5 The protocol and the patient

The validated snapshot (`shared/protocol-snapshot.ts`) gives: validated energy and protein
values, food directives (`favour`, `limit` with two levels, `exclude` with dates), the meal
configuration (four slots, five orientations, a fasting option), recommendations, goals and
supplements. The patient profile gives `likesCooking` (yes, somewhat, no), `cookingTime` (low,
medium, high) and a budget in three levels.

### 6.6 The plan of record

REM-91 plans one structured call for each recipe, from a verified template, through the gate,
with one retry. It asks for a recipe for each active meal of seven days and no repeated name
in the week or in the two weeks before. REM-92 to REM-99, REM-104 and REM-105 are screens and
lists that read the result: today's recipes, the recipe page, favourites, portions, sharing,
the shopping list, and two read-only views for the practitioner. None of them depends on how
a recipe is made. They depend on the stored shape only.

One number from these tickets **[J]**: four active meals for 21 days with no repeated name is
up to 84 different recipes for one patient. Twenty templates cannot give 84 different names
unless the adaptation changes the dish. An adaptation that changes the dish is generation.
Thus the template plan needs the same controls as generation, or it needs a much larger
library.

---

## 7. Proposal for REMI

All of section 7 is **[J]**, built on the evidence above. Where a part rests on thin evidence
the text says so.

### 7.1 The architecture

| Part | Is | Who owns it |
| --- | --- | --- |
| Ingredient catalogue | Data | Morgane reviews it. Code tests it |
| Dish skeletons and flavour profiles | Data | A cook or Morgane writes them. Morgane verifies each one |
| Technique table, equipment list | Data | Jamie's team drafts. Morgane accepts |
| Patient's allowed foods, quantities, nutrients, week plan, difficulty, all checks | Code | — |
| Choice of foods for the slots, choice of profile, title, step wording, quality score | Model | — |

#### The ingredient catalogue (data)

One table. A food that is not in it does not exist for generation. A first size of about 250
to 350 foods covers everyday Belgian cooking. This number is an estimate. One row has:

- an id, the French name that the patient reads, and other names
- the allergen tags (today's lexicon row) and the `composite` and `mayContain` data
- the CIQUAL code, with the raw or cooked form stated
- the weight in grams of each unit that the food is sold or counted in (one egg, one clove, one
  tablespoon)
- its roles in a dish: protein, starch, vegetable, fat, acid, aromatic, herb or spice, liquid,
  crunchy topping, sweetener
- its taste roles (section 1.2)
- its months of season, from Morgane's calendar
- the methods that suit it, with a time range for each
- a budget level, and its convenience forms (canned, frozen, pre-cut)

The lexicon does not go away. The gate must still read a meal that a patient types, and that
text can name any food. The rule is: **each catalogue row points to one lexicon row, and a
unit test proves that the gate knows every catalogue name with no unknown word.** A new
catalogue food with no lexicon row fails the test and never reaches a patient.

#### Dish skeletons (data)

A skeleton is a dish family that a cook knows how to make, written once. Examples: « poêlée et
céréale », « soupe-repas », « salade composée », « plat au four sur une plaque », « omelette ou
frittata », « curry doux », « papillote », « bol de céréales chaudes », « tartine garnie »,
« yaourt, fruit et oléagineux ». A skeleton has:

- the meal slots and the meal orientations that it suits
- its slots. Each slot has a role, the foods or the food tags that it accepts, a range of grams
  for one portion, and whether it is required
- its fixed ratios, where the dish has one (vinaigrette, grain to water)
- its steps, written with slot names, with a method, a time range and a temperature
- the flavour profiles that suit it. A profile is a named set of aromatics, herbs, spices, acid
  and fat that go together
- for each skill level, the variant of the steps (section 7.3)
- one or more full example recipes. Morgane's verified templates are these examples

Tolerant families get wide slots. A ratio-sensitive dish (section 1.5) is a skeleton with fixed
quantities and a short list of named substitutions. It is a verified recipe in practice.

This is D-34 with one change. The start of every generation is still verified material, and
the template id that `patient_recipes` requires becomes the skeleton's example recipe. What
changes is that REMI may fill the slots with other foods than the example has.

#### What code does

1. **The patient's pantry.** For one patient and one day, code runs the gate on each catalogue
   food. Only `compatible` foods stay. Then it removes foods out of season as a main
   ingredient, and it marks the `favour` and `limit` foods. The model receives this list and no
   other food. A patient whose data makes the gate `uncertain` on everything gets an empty
   pantry, and REMI generates nothing and tells the practitioner why.
2. **The week.** Code chooses a skeleton for each active meal of the seven days. Rules: the
   orientation of the slot, no skeleton with the same main food on two days in a row, the
   limits of the protocol, the weekly counts for `favour` foods, planned leftovers (a dinner
   that is made for two meals fills the next lunch), the patient's time and skill. A first
   version can do this with a scored greedy choice. A solver is a later option (section 7.5).
3. **The quantities.** The model does not set them. Code takes the grams of each slot inside
   its range so that the meal reaches its share of the validated energy and protein values.
   With four or five slots this is a small calculation. It then rounds to a quantity that a
   person can measure.
4. **The nutrients.** Code sums CIQUAL values for the grams. The day must reach the validated
   protein value and be near the validated energy value. The tolerance is Morgane's decision
   (question M4). A value is an « estimation » in the sense of D-30.
5. **The checks.** Every recipe passes all of these, or it is not stored:
   - the gate, as today
   - each ingredient is a catalogue id, and its name is the catalogue name
   - the `note` of an ingredient comes from a closed list of preparations
   - the title and each step name no food that is not in the ingredient list. The lexicon's own
     parser can find the foods in a text
   - each ingredient is used in at least one step
   - each time and temperature is inside the range of its method. Poultry, minced meat, pork,
     egg dishes for at-risk patients and reheated rice get explicit rules
   - the ratios of the skeleton hold
   - the difficulty is not above the patient's level (section 7.3)
   - the name is not in the patient's last three weeks

#### What the model does

1. **It chooses.** Input: the skeleton, the patient's pantry for each slot, the profile list,
   the foods to favour and to limit, the recipes of the last weeks, and the pseudonymous
   context block. Output: one catalogue id for each slot and one profile, as structured output
   where each field is an enumeration of the allowed ids. The model cannot name another food,
   because the schema has no free text for a food.
2. **It writes.** The title, the short description and the step text in French, from the
   skeleton's steps and the chosen foods. Code puts the quantities, times and temperatures in
   the structured fields. The model does not repeat them in a way that code cannot check.
3. **It judges.** A second call, with another model, scores the finished recipe on a short
   rubric: do the foods go together, is the dish one that a Belgian or French cook would
   recognise, are the steps in a workable order, is the wording clear. A recipe below the
   threshold is made again once, then dropped. The evidence for judge models is thin (section
   5). Thus the judge is a filter for obvious nonsense. It is not a proof of quality.
4. **Away from patients, it drafts.** A model can draft a new skeleton, a new profile or a new
   catalogue row. A person verifies it before it enters the data. This is how the base grows.

The generation runs in the daily batch that REM-91 already plans. It is not in a request of the
patient. Thus the stronger `balanced` role is affordable for the choice and the wording, and
the `fast` role does not need to be trusted with it. Whether `fast` is good enough is a test,
not an assumption (stage 3).

#### A pool of accepted recipes

A recipe that passed every check is stored with its skeleton, its foods and its scores. Later,
the planner can give the same recipe to another patient whose pantry allows every food in it,
after the gate reads it for that patient. This lowers cost. More important, it makes review
possible: Morgane reviews a recipe once, and every patient who gets it benefits. With time
REMI moves from "generate each time" towards "select from a growing base of reviewed recipes,
and generate to fill gaps". This is how the commercial planners work (section 2.4).

### 7.2 What Morgane must supply or review

The amounts are estimates. They are the largest uncertainty of this proposal.

| Item | Amount for a first version | Later | Her act |
| --- | --- | --- | --- |
| Ingredient catalogue | about 150 foods | 250 to 350 | Review. The rows are drafted from the lexicon and CIQUAL. She checks the allergen tags, the roles and the unit weights. This also pays the REM-57 debt |
| Dish skeletons | 10 to 12, across the four meal slots | 30 to 40 | Verify each one. A cook can write them. Her verified templates become the examples |
| Flavour profiles | 6 to 8 | 15 to 20 | Accept or refuse each one |
| Season table | Exists (her calendar) | — | Already confirmed |
| Portion rules for each meal orientation | One table: the share of the day's energy and protein for each slot and orientation | — | Write or accept |
| Skill levels | Three levels and the technique table | — | Accept |
| Golden set | 30 patient cases (invented, not real patients) with what a good week looks like | 100 | Review the cases |
| Review of generated recipes | Each recipe of the first 100 | A weekly sample of 10 to 20 | Score with the rubric |
| Table for FODMAP, histamine and the other unresolved intolerances | Not in the first version | D-33 | Name the sources and validate |

### 7.3 Cooking skill

**The patient.** Add two facts to the profile. Both are asked once and both can be « Non
renseigné ».

- `cookingSkill`: three levels. « Je débute », « Je me débrouille », « Je cuisine avec
  plaisir ». Asked with a few concrete questions and not with one self-rating, in the manner of
  Lavelle's items: « Sais-tu faire revenir des légumes à la poêle ? », « Sais-tu cuire une
  viande ou un poisson cru ? », « Sais-tu préparer une sauce ? ». The answers give the level.
- `equipment`: a short closed list. Oven, hob, microwave, blender, steamer.

With no answer, REMI uses level 1 and the basic equipment. This is the safe default: an easy
recipe suits everyone, a hard one does not. `likesCooking` and `cookingTime` stay. They decide
how long and how elaborate a recipe may be. Skill decides which techniques it may use.

**The recipe.** Each technique is one row of a table with a level:

- Level 1: assemble, cut roughly, boil, bake on a tray, cook in a microwave, heat a canned or
  frozen food.
- Level 2: sauté, brown a meat, cook a fish in a pan, make a vinaigrette, cook two things at
  the same time.
- Level 3: make a sauce that can fail (emulsion, roux), manage three things at the same time, a
  step where timing is critical, a fine knife cut.

Code computes the difficulty of a recipe from: its highest technique level, the number of
steps, the number of ingredients, the active minutes, the number of pans, the number of
parallel tasks, and the number of timing-critical steps. The exact formula is a choice with no
validated standard behind it (section 4.2). It starts simple, and the feedback corrects it.

**One dish at several levels.** A skeleton carries a step variant for each level that it
supports. Example for « poêlée de légumes, pois chiches et riz »:

- Level 1: frozen vegetable mix, canned chickpeas, pre-cooked rice, one pan, five steps.
- Level 2: fresh vegetables that the patient cuts, canned chickpeas, rice cooked beside, two
  pans.
- Level 3: the same, with a spice base that is toasted first and a yoghurt and herb sauce.

The foods and the nutrients are almost the same. The work is not. A skeleton that cannot be
made at level 1 (a risotto) says so, and the planner does not give it to a level 1 patient.

### 7.4 How the model stays inside the gate's known foods

Five barriers, in this order. The first one removes the known fault. The others are for
defence in depth.

1. The model's output schema has only enumerated catalogue ids for foods. It has no free-text
   food field.
2. The list that the model chooses from is the patient's pantry: the gate already confirmed
   each food for this patient.
3. Code writes the ingredient `name` from the catalogue. The model's wording never becomes an
   ingredient name. The `note` comes from a closed list.
4. Code reads the title and the steps for a food that is not in the list, and refuses the
   recipe if one is found.
5. The gate reads the finished recipe, exactly as it does today. Nothing in this proposal
   weakens or bypasses it.

A unit test proves that the gate knows every catalogue name. So a recipe that the generator
builds can only be refused by the gate for a real reason (an exclusion of the patient), and no
longer for an unknown word.

The meal suggestion of REM-102 has the same fault and can take the same cure: its `food` field
becomes an id of the patient's pantry.

### 7.5 Alternatives that I rejected

| Alternative | Why not |
| --- | --- |
| Free generation by a model, then the gate (the plan as written, with a stronger model) | The documented faults are exactly here: allergen leaks, wrong quantities, wrong energy, steps and list that disagree (section 2.3). The gate catches the first. Nothing catches the others. A stronger model lowers the rate and does not remove it |
| Twenty verified templates with a light adaptation (D-34 as written) | Safe, and not enough: up to 84 different recipes for one patient in three weeks (section 6.6). The patient would see the same dishes, or the adaptation would be generation with no controls |
| A large bought or scraped recipe base and a selector | The research corpora are English and not licensed for a product. A French base needs a licence, and each ingredient must still be mapped to the catalogue. It is not Morgane's voice. Possible later as a source of skeleton drafts |
| A flavour-pairing engine on shared compounds | The hypothesis fails outside some Western cuisines and is called discredited by a leading reviewer (section 1.1) |
| A fine-tuned recipe model | No verified French data to train on. It would still need every check |
| A full mixed-integer solver for the whole week from the first version | The evidence for solvers on numbers is good. The need is not there yet: a meal has four or five slots, and a greedy planner with checks is enough to learn from. Keep the solver for the stage where leftovers, budget and the shopping list must be optimised together |
| Add to the lexicon each food that the model proposes | It follows the model. Each added row is one more unvalidated safety row. It never ends |
| A model as the safety checker | Thin evidence, about 85 % in the one project found. D-16 already forbids it |

### 7.6 Risks and limits of this proposal

- **The skeleton work is real work.** Ten good skeletons need a person who cooks. If that
  person is only Morgane, her time is the bottleneck.
- **"Tastes good" is not proven by any step.** The design raises the floor: verified
  structures, known profiles, checked steps. The ceiling is measured only by review and
  feedback.
- **Enumerated output with a long list** is untested on the cheap model. Stage 3 tests it.
- **Nutrient sums are estimates.** Unit weights, raw or cooked forms and cooking losses each
  add error. Energy and protein are robust. Vitamins are not, without retention factors.
- **Patients with an unresolved intolerance get no recipe.** This is today's behaviour, and it
  stays until D-33.
- **The catalogue limits the cuisine.** A food that is not in it cannot appear. This is the
  price of safety, and the cure is to grow the catalogue with review.

### 7.7 Staged build plan

Each line is one ticket. The stages are in order. Inside a stage the tickets can run in
parallel unless the text says otherwise.

**Stage 1 — the foundations (no model call)**

1. Ingredient catalogue: the table, the link to the lexicon, the CIQUAL code, the unit weights,
   and the unit test "the gate knows every catalogue name". Seeded with a draft of 150 foods.
2. A console page where Morgane reviews and marks a catalogue row « vérifiée ».
3. Recipe nutrients: code that sums CIQUAL values for a structured recipe whose ingredients
   have catalogue ids. Shown to the practitioner as an « estimation ».
4. Extend the structured recipe: catalogue id and grams for an ingredient, technique and
   ingredient ids for a step, skeleton id, level and equipment for the recipe. Old recipes stay
   readable.

**Stage 2 — skeletons and the assembler (no model call)**

5. The skeleton schema, the profile schema and the technique table, with integrity tests. The
   first three skeletons as data.
6. The assembler: a skeleton, a food for each slot, a profile and a level give a structured
   recipe with quantities, by code alone, with template step text.
7. The checks of section 7.1 as one function with a list of reasons, in the manner of
   `checkCompatibility`.
8. The patient's pantry: the gate over the catalogue for one patient and one day.

After stage 2 REMI can already produce a safe, correct, plain recipe with no model. That is a
useful fallback when the provider fails.

**Stage 3 — the model chooses and writes**

9. `prompts/recipe.ts`: the choice with enumerated ids, and the French wording. A test on the
   golden set compares the `fast` and `balanced` roles.
10. REM-91, rewritten on this base: the week planner, the daily batch, the regeneration on a
    new protocol version, the log of counts.
11. Skill: the two profile fields, the questions, the level variants of the first skeletons.

**The first usable version is the end of stage 3**: ten to twelve skeletons, about 150 foods,
four meal slots, three skill levels, quantities and nutrients by code, every check, and
Morgane's review of each of the first 100 recipes in the console. REM-92 to REM-99, REM-104
and REM-105 can be built beside stages 1 to 3, because they read the stored shape only.

**Stage 4 — quality**

12. The judge call and its rubric, calibrated on the recipes that Morgane scored.
13. The review screen for the practitioner: a weekly sample, a score, a reason. A refused
    recipe leaves the pool.
14. Signals of the patient: favourite (REM-95), « remplacer cette recette », and « cuisiné ».
    These feed the planner's choice.
15. The pool of accepted recipes, and reuse across patients.

**Stage 5 — depth**

16. Planned leftovers and batch cooking in the planner, joined with the shopping list
    (REM-98).
17. FODMAP and the other unresolved intolerances, after D-33's table.
18. A solver for the week, if the greedy planner shows its limits.
19. Retention factors, if a protocol targets a vitamin or a mineral.

---

## 8. Open questions

Each question has a default. The default applies if no answer comes.

### For Morgane

- **M1.** Can a cook other than you write the dish skeletons, if you verify each one before use?
  Default: yes.
- **M2.** Do you review the ingredient catalogue (about 150 foods at first: allergen tags,
  roles, unit weights) before the first patient gets a generated recipe? Default: yes. No
  generated recipe is shown before your review.
- **M3.** Which cuisines and flavour profiles do you want for your patients? Default: everyday
  Belgian and French, Mediterranean, and two or three mild world profiles.
- **M4.** How near to the validated values must a day be? Default: protein at or above the
  value, energy within 10 %, judged on the day and not on each meal.
- **M5.** Which share of the day does each meal get, for each of your five orientations?
  Default: we draft one table from story 11 and you correct it.
- **M6.** Where the protocol says nothing, does REMI follow the Belgian guidelines (fish,
  legumes, red and processed meat, wholegrain)? Default: yes, as a soft preference, after we
  read the 2025 text.
- **M7.** Are the three skill levels and the short questions of section 7.3 right for your
  patients? Default: yes.
- **M8.** May a patient replace a proposed recipe by another one, and tell REMI that a recipe
  was cooked? D-30 forbids a periodic feedback questionnaire. This is one tap on one recipe.
  Default: yes to both.
- **M9.** Are canned, frozen and pre-cut foods acceptable for a level 1 patient? Default: yes,
  with no-added-salt cans and plain frozen vegetables.
- **M10.** Do you score each of the first 100 generated recipes, and then a weekly sample of 10
  to 20? Default: yes.
- **M11.** May a recipe that you accepted for one patient go to another patient whose safety
  data allows it? Default: yes, after the gate reads it for that patient.

### For Jamie

- **J1.** Does D-34 change from "a verified template recipe" to "a verified skeleton and a
  verified catalogue, with the template as the skeleton's example"? Default: yes.
- **J2.** Does the catalogue become the one home of food facts, with each row linked to a
  lexicon row and a test that the gate knows every catalogue name? Default: yes. The lexicon
  stays for free text.
- **J3.** Which role chooses and writes a recipe in the batch? Default: `balanced`, until the
  stage 3 test shows that `fast` is as good on the golden set.
- **J4.** Is the stage 2 assembler, with no model, an acceptable fallback when the provider
  fails or a recipe fails twice? Default: yes.
- **J5.** Does REM-91 wait for stages 1 and 2, while REM-92 to REM-99, REM-104 and REM-105
  go on against the stored shape? Default: yes.
- **J6.** Does the meal suggestion of REM-102 take the same cure (a pantry id in the place of a
  free-text food)? Default: yes, as its own ticket after stage 2.
- **J7.** Who writes the first skeletons if Morgane's time is short: a paid cook, or drafts by
  a model that Morgane verifies? Default: model drafts from her verified templates, verified by
  her.
- **J8.** Do the golden set and the model comparison run as a workflow in CI and not on a
  developer's machine? Default: yes, a separate workflow that is started by hand, because it
  costs model calls.
- **J9.** Is a request to Nubel for the terms of its table worth making now? Default: no.
  CIQUAL is enough for the first version.

