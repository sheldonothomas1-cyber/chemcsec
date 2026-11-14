// The seven focus areas: the parts of CSEC Chemistry that carry the most marks and cause the
// most trouble. Each one gathers its objectives from across the syllabus and adds a study guide
// (methods written as numbered steps, exam technique and the traps examiners see every year).
// Chemistry inside [[double brackets]] is typeset and checked by the test suite.

export interface FocusMethod {
  title: string;
  when: string;
  steps: string[];
  example?: { q: string; working: string[] };
}

export interface FocusArea {
  id: string;
  name: string;
  short: string;
  why: string;
  /** Objectives from the syllabus that belong to this area. */
  objectives: string[];
  methods: FocusMethod[];
  examTips: string[];
  /** Skills the learner ticks off when confident. */
  skills: string[];
  lab?: { id: string; label: string }[];
  lessons: string[];
}

export const FOCUS_AREAS: FocusArea[] = [
  {
    id: 'atoms-bonding', name: 'Atomic structure and bonding', short: 'Atoms & bonding',
    why: 'Almost every other topic is explained by electrons: how many there are, which shell they are in, and whether they are transferred or shared. Weak bonding answers also cost marks in electrolysis, organic and properties questions.',
    objectives: ['A3.1', 'A3.2', 'A3.3', 'A4.1', 'A5.1', 'A5.2', 'A5.3'],
    lessons: ['A3', 'A4', 'A5'],
    methods: [
      {
        title: 'Working out protons, neutrons and electrons', when: 'Any question giving atomic number, mass number or charge.',
        steps: ['Protons = atomic number (the smaller number).', 'Neutrons = mass number - atomic number.', 'Electrons = protons for an atom. For an ion, subtract the charge: a 2+ ion has 2 fewer electrons, a 1- ion has 1 more.'],
        example: { q: 'How many of each particle are in an aluminium ion, [[Al^3+]] (atomic number 13, mass number 27)?', working: ['Protons = 13.', 'Neutrons = 27 - 13 = 14.', 'Electrons = 13 - 3 = 10.'] },
      },
      {
        title: 'Writing the formula of an ionic compound', when: 'Metal + non-metal, or any compound containing a named ion.',
        steps: ['Write each ion with its charge (use the group: I gives 1+, II gives 2+, III gives 3+, VI gives 2-, VII gives 1-).', 'Find the smallest numbers of each ion that make the total charge zero.', 'Write those numbers as subscripts. Put brackets round a group ion (such as [[OH-]] or [[SO4^2-]]) when there is more than one of it.'],
        example: { q: 'Write the formula of aluminium sulfate.', working: ['Ions: [[Al^3+]] and [[SO4^2-]].', '2 × (3+) = 6+ balances 3 × (2-) = 6-.', 'Formula: [[Al2(SO4)3]].'] },
      },
      {
        title: 'Drawing dot-and-cross diagrams', when: 'Any "draw a diagram to show the bonding" question.',
        steps: ['Ionic: draw each ion separately, in square brackets, with the charge outside at the top right. Show the full outer shell; use dots for one atom\'s electrons and crosses for the other\'s.', 'Covalent: draw overlapping outer shells. Put each shared pair (one dot, one cross) in the overlap. Show the lone pairs too.', 'Check: every atom except hydrogen ends with 8 outer electrons; hydrogen ends with 2.'],
      },
      {
        title: 'Explaining a property from structure', when: '"Explain why X has a high melting point / conducts / is soft."',
        steps: ['Name the structure: giant ionic, simple molecular, giant covalent, or metallic.', 'Name the particles and the force that must be overcome (ions and strong electrostatic attraction; molecules and weak forces between them; atoms and strong covalent bonds; ions and delocalised electrons).', 'Link to the property: lots of energy needed means a high melting point; mobile charged particles means conduction.'],
        example: { q: 'Explain why sodium chloride has a high melting point.', working: ['Sodium chloride is a giant ionic lattice.', 'Oppositely charged ions are held by strong electrostatic attraction in all directions.', 'A large amount of energy is needed to overcome these forces, so the melting point is high.'] },
      },
    ],
    examTips: [
      'Never write that a molecular substance "breaks its covalent bonds" when it melts. Only the forces between molecules are overcome.',
      'Say "electrostatic attraction between oppositely charged ions", not just "strong bonds".',
      'Graphite conducts because of delocalised electrons, not ions. Molten or dissolved ionic compounds conduct because of mobile ions, not electrons.',
      'Isotopes: same protons and electrons, different neutrons, so the same chemical properties.',
    ],
    skills: [
      'Find protons, neutrons and electrons in any atom or ion',
      'Write electron arrangements for the first 20 elements and their ions',
      'Calculate relative atomic mass from isotope percentages',
      'Write the formula of any ionic compound from its ions',
      'Draw dot-and-cross diagrams for ionic and covalent compounds',
      'Explain melting point and conductivity from structure and bonding',
    ],
    lab: [{ id: 'elements', label: 'Combine elements and see ionic and covalent bonding' }],
  },
  {
    id: 'mole', name: 'The mole concept', short: 'Mole',
    why: 'The mole is the most tested calculation skill: reacting masses, gas volumes, concentrations, titrations, electrolysis and percentage yield all depend on it. It is also the topic examiners most often report as weak.',
    objectives: ['A6.1', 'A6.2', 'A6.3', 'A6.4'],
    lessons: ['A6'],
    methods: [
      {
        title: 'The three bridges (use for every calculation)', when: 'Any question that links two amounts in an equation.',
        steps: ['Bridge 1: turn what you are given into moles (mass ÷ Mr; gas volume ÷ 24 dm³; concentration × volume in dm³).', 'Bridge 2: use the balanced equation\'s coefficients to get moles of the substance asked about.', 'Bridge 3: turn moles into what is asked for (moles × Mr; moles × 24 dm³; moles ÷ volume in dm³).'],
        example: { q: 'What volume of carbon dioxide forms when 10 g of calcium carbonate reacts with excess acid? [[CaCO3 + 2HCl -> CaCl2 + H2O + CO2]]', working: ['Moles of [[CaCO3]] = 10 ÷ 100 = 0.10 mol.', 'Ratio 1 : 1, so 0.10 mol of [[CO2]].', 'Volume = 0.10 × 24 = 2.4 dm³.'] },
      },
      {
        title: 'Empirical formula', when: 'You are given masses or percentages of each element.',
        steps: ['Divide each mass (or percentage) by that element\'s relative atomic mass.', 'Divide every answer by the smallest one.', 'If a ratio ends in about .5, multiply all of them by 2. Write the whole numbers as the formula.'],
      },
      {
        title: 'Limiting reactant', when: 'You are given amounts of two reactants.',
        steps: ['Find moles of each reactant.', 'Divide each by its coefficient in the equation. The smaller result is the limiting reactant.', 'Work out the product from the limiting reactant only.'],
      },
      {
        title: 'Percentage yield and purity', when: '"Calculate the percentage yield" or "percentage purity".',
        steps: ['Calculate the theoretical (maximum) amount using the three bridges.', 'Percentage yield = actual ÷ theoretical × 100.', 'Percentage purity = mass of pure substance ÷ mass of sample × 100.'],
      },
    ],
    examTips: [
      'Coefficients compare moles, never grams. Go through moles every time.',
      'Turn cm³ into dm³ (÷ 1000) before using concentration.',
      'Show every step: marks are given for working even if the final answer is wrong.',
      'Give the final answer with a unit and to a sensible number of significant figures (usually 2 or 3).',
    ],
    skills: [
      'Calculate relative formula mass',
      'Convert between mass, moles, particles and gas volume',
      'Calculate concentration in mol dm⁻³ and g dm⁻³',
      'Calculate reacting masses and gas volumes from an equation',
      'Find empirical and molecular formulae',
      'Work out the limiting reactant and percentage yield',
    ],
  },
  {
    id: 'acids', name: 'Acids, bases and salts', short: 'Acids & salts',
    why: 'This topic links straight into titration, qualitative analysis and the practical paper. Salt preparation in particular is a regular Paper 02 question.',
    objectives: ['A7.1', 'A7.2', 'A7.3'],
    lessons: ['A7'],
    methods: [
      {
        title: 'Writing acid reactions', when: '"Write an equation for the reaction of an acid with..."',
        steps: ['Acid + metal → salt + hydrogen.', 'Acid + base (metal oxide or hydroxide) → salt + water.', 'Acid + carbonate → salt + water + carbon dioxide.', 'The salt takes its metal from the base and its negative ion from the acid: hydrochloric gives chlorides, sulfuric gives sulfates, nitric gives nitrates.'],
        example: { q: 'Write the equation for magnesium oxide with nitric acid.', working: ['Salt: magnesium nitrate, [[Mg(NO3)2]].', '[[MgO + 2HNO3 -> Mg(NO3)2 + H2O]].'] },
      },
      {
        title: 'Choosing how to make a salt', when: '"Describe how you would prepare a pure dry sample of..."',
        steps: ['Is the salt soluble? Use the solubility rules.', 'Insoluble salt: mix two solutions containing its ions; filter, wash with distilled water, dry.', 'Soluble salt of sodium, potassium or ammonium: titrate the acid with the alkali to find the exact volumes, repeat without indicator, evaporate and crystallise.', 'Other soluble salts: add excess insoluble metal, oxide or carbonate to warm acid; filter off the excess; evaporate until crystals start to form; cool and crystallise.'],
      },
      {
        title: 'Strength versus concentration', when: '"Distinguish between a strong acid and a concentrated acid."',
        steps: ['Strength: how completely the acid ionises in water (strong = fully ionised).', 'Concentration: how much acid is dissolved per dm³.', 'Give an example of each: dilute hydrochloric acid is strong but dilute; concentrated ethanoic acid is weak but concentrated.'],
      },
    ],
    examTips: [
      'Learn the solubility rules by heart: they decide the method for every salt preparation.',
      'Say "effervescence" for bubbling and name the gas and its test.',
      'When making a salt with an excess of solid, explain that the excess makes sure all the acid is used up.',
      'Do not evaporate a solution to dryness when making crystals: heat until crystals start to form, then leave it to cool.',
    ],
    skills: [
      'Distinguish strong and weak, concentrated and dilute',
      'Use pH and indicators to describe acids and alkalis',
      'Write equations for acids with metals, bases and carbonates',
      'Write the ionic equation for neutralisation',
      'Use the solubility rules',
      'Choose and describe a method to prepare a given salt',
    ],
    lab: [{ id: 'titration', label: 'Neutralise an alkali in the titration bench' }],
  },
  {
    id: 'electrochem', name: 'Electrochemistry', short: 'Electrochem',
    why: 'Redox and electrolysis together appear in most papers, and the half-equations are where candidates most often drop marks.',
    objectives: ['A8.1', 'A8.2', 'A8.3', 'A9.1', 'A9.2', 'A9.3', 'C1.2'],
    lessons: ['A8', 'A9', 'C1'],
    methods: [
      {
        title: 'Predicting electrolysis products', when: 'Any electrolysis question.',
        steps: ['List every ion present. In solution, add [[H+]] and [[OH-]] from water.', 'Cathode (negative): the least reactive positive ion is discharged. Hydrogen forms unless the metal is below hydrogen (copper, silver).', 'Anode (positive): a concentrated halide gives the halogen; otherwise [[OH-]] gives oxygen. An active anode (copper) dissolves instead.', 'Molten salts have only two ions, so the metal forms at the cathode and the non-metal at the anode.'],
      },
      {
        title: 'Writing half-equations', when: '"Write the half-equation for the reaction at the cathode/anode."',
        steps: ['Write the ion and the product, balancing atoms first: 2Cl⁻ → Cl₂ (the charge is not balanced yet).', 'Add electrons to balance the charge: [[2Cl- -> Cl2 + 2e-]].', 'Check: cathode equations have electrons on the left (gained, reduction); anode equations have them on the right (lost, oxidation).'],
      },
      {
        title: 'Faraday calculations', when: 'A current and a time are given.',
        steps: ['Charge Q = current (A) × time (s).', 'Moles of electrons = Q ÷ 96 500.', 'Use the half-equation for the ratio of electrons to product, then convert moles to mass or gas volume.'],
        example: { q: 'What mass of copper is deposited by 2.0 A for 965 s? [[Cu^2+ + 2e- -> Cu]] (Cu = 63.5)', working: ['Q = 2.0 × 965 = 1930 C.', 'Moles of electrons = 1930 ÷ 96 500 = 0.020 mol.', 'Moles of Cu = 0.020 ÷ 2 = 0.010 mol; mass = 0.010 × 63.5 = 0.635 g.'] },
      },
      {
        title: 'Identifying oxidising and reducing agents', when: 'Any redox equation.',
        steps: ['Assign oxidation numbers to each element before and after.', 'An increase is oxidation; a decrease is reduction.', 'The substance that is oxidised is the reducing agent; the substance that is reduced is the oxidising agent.'],
      },
    ],
    examTips: [
      'Electrons flow in the wires; ions carry the charge through the electrolyte. Never write that electrons move through the solution.',
      'Name the electrode correctly: cathode is negative and attracts cations.',
      'In concentrated sodium chloride solution, hydrogen (not sodium) forms at the cathode.',
      'For colour changes, give both colours: "the blue colour fades", "orange to green".',
    ],
    skills: [
      'Define oxidation and reduction three ways (oxygen, electrons, oxidation number)',
      'Assign oxidation numbers and name oxidising and reducing agents',
      'Predict products of electrolysis for molten and aqueous electrolytes',
      'Write half-equations at each electrode',
      'Do Faraday calculations for mass and gas volume',
      'Describe electroplating, purifying copper and extracting aluminium',
    ],
    lab: [{ id: 'electrolysis', label: 'Run eight different electrolysis cells' }, { id: 'displacement', label: 'Try displacement reactions' }],
  },
  {
    id: 'organic', name: 'Organic chemistry', short: 'Organic',
    why: 'Section B is a whole section of the syllabus. Its questions reward exact names, structures and reaction conditions, which are learnable marks.',
    objectives: ['B1.1', 'B1.2', 'B1.3', 'B2.1', 'B2.2', 'B2.3', 'B3.1', 'B3.2', 'B3.3'],
    lessons: ['B1', 'B2', 'B3'],
    methods: [
      {
        title: 'Naming and drawing', when: '"Name this compound" or "draw the fully displayed structure".',
        steps: ['Count the carbons in the longest chain: meth (1), eth (2), prop (3), but (4), pent (5), hex (6).', 'Add the ending for the family: -ane, -ene, -ol, -oic acid.', 'Number the position of a double bond or -OH from the nearer end when it matters (but-1-ene).', 'When drawing, show every bond and every atom; each carbon has exactly four bonds.'],
      },
      {
        title: 'Remembering the reactions', when: '"State the conditions and name the product."',
        steps: ['Alkane + halogen: substitution, ultraviolet light, gives a halogenoalkane and a hydrogen halide.', 'Alkene + bromine: addition, room temperature, decolourises bromine water.', 'Alkene + hydrogen: addition, nickel catalyst, about 150 °C, gives an alkane.', 'Alkene + steam: addition, phosphoric acid catalyst, high temperature and pressure, gives an alcohol.', 'Ethanol + acidified potassium dichromate(VI), warm: oxidation to ethanoic acid (orange to green).', 'Acid + alcohol, concentrated sulfuric acid catalyst, warm: an ester and water.'],
      },
      {
        title: 'Drawing a polymer from its monomer', when: 'Addition polymerisation questions.',
        steps: ['Draw the monomer with its C=C double bond.', 'Change the double bond to a single bond and put bonds sticking out of each side.', 'Put brackets round the repeat unit and an n after them.'],
      },
    ],
    examTips: [
      'Bromine water: say "orange-brown to colourless", never "clear" (clear is not a colour).',
      'Isomers have the same molecular formula but different structural formulae. Draw them to show the difference.',
      'Cracking needs heat and a catalyst; fractional distillation is only a physical separation.',
      'Name esters with the alcohol part first: ethanol + ethanoic acid gives ethyl ethanoate.',
    ],
    skills: [
      'Name and draw the first six alkanes and alkenes',
      'Draw and name structural isomers',
      'Compare substitution and addition, with conditions',
      'Describe fermentation and the reactions of ethanol',
      'Describe the reactions of ethanoic acid and how esters form',
      'Explain fractional distillation, cracking and polymerisation',
    ],
  },
  {
    id: 'qa', name: 'Qualitative analysis', short: 'Qual analysis',
    why: 'Ion and gas tests appear in Paper 01, Paper 02 and every practical paper. They are memory marks that a well-prepared student should never drop.',
    objectives: ['C4.1', 'C4.2', 'C4.3'],
    lessons: ['C4'],
    methods: [
      {
        title: 'Testing for a cation', when: 'An unknown solution, or "identify the cation".',
        steps: ['Add sodium hydroxide a few drops at a time. Note the colour of any precipitate.', 'Add excess sodium hydroxide. Note whether the precipitate dissolves.', 'Repeat with aqueous ammonia on a fresh sample.', 'White, soluble in excess of both: zinc. White, soluble only in excess NaOH: aluminium or lead (lead gives a yellow precipitate with potassium iodide). White with NaOH, none with ammonia: calcium.'],
      },
      {
        title: 'Testing for an anion', when: '"Identify the anion" or "describe a test for".',
        steps: ['Carbonate: add dilute acid; effervescence, gas turns limewater milky.', 'Sulfate: add dilute nitric acid then barium nitrate; white precipitate.', 'Halides: add dilute nitric acid then silver nitrate; chloride white, bromide cream, iodide yellow.', 'Nitrate: warm with sodium hydroxide and aluminium foil; ammonia gas turns damp red litmus blue.'],
      },
      {
        title: 'Recording results', when: 'Practical and data questions.',
        steps: ['Write the observation first: colour, precipitate, gas, temperature change.', 'Then the inference: which ion or gas is present, and why.', 'Never write the inference in the observation column.'],
      },
    ],
    examTips: [
      'Give the colour of the precipitate AND what happens in excess. That is where the marks are.',
      'Acidify with nitric acid (not hydrochloric) before silver nitrate, so you do not add chloride ions.',
      '"Relights a glowing splint" is oxygen; "squeaky pop with a lighted splint" is hydrogen. Do not mix them up.',
      'Write ionic equations for precipitates: only the two ions that form the solid.',
    ],
    skills: [
      'Identify cations with sodium hydroxide and aqueous ammonia',
      'Tell aluminium from lead with potassium iodide',
      'Identify carbonate, sulfate, chloride, bromide, iodide and nitrate',
      'Identify the common gases from their tests',
      'Write ionic equations for precipitation reactions',
      'Record observations and inferences correctly',
    ],
    lab: [{ id: 'ions', label: 'Test unknown solutions and solve a mystery sample' }],
  },
  {
    id: 'titration', name: 'Titrations', short: 'Titrations',
    why: 'Titration is the most common practical calculation in CSEC, and it is assessed in the SBA too. It combines the mole concept with careful practical technique.',
    objectives: ['A7.4', 'A6.2'],
    lessons: ['A7', 'A6'],
    methods: [
      {
        title: 'Carrying out a titration', when: '"Describe how you would carry out a titration."',
        steps: ['Rinse the pipette with the alkali and pipette 25.0 cm³ into a conical flask. Add 2 to 3 drops of indicator.', 'Rinse the burette with the acid, fill it, and record the starting reading to 2 decimal places.', 'Add acid while swirling. Near the end point add it drop by drop until the indicator just changes colour.', 'Record the final reading. Do a rough titration first, then repeat until two or three titres agree within 0.10 cm³.'],
      },
      {
        title: 'The titration calculation', when: 'Any titration result.',
        steps: ['Write the balanced equation and note the mole ratio.', 'Moles of the known solution = concentration × volume ÷ 1000.', 'Use the ratio to get moles of the unknown.', 'Concentration of the unknown = moles ÷ (volume ÷ 1000). Give mol dm⁻³, and convert to g dm⁻³ by × Mr if asked.'],
        example: { q: '25.0 cm³ of sodium carbonate solution needs 20.00 cm³ of 0.100 mol dm⁻³ hydrochloric acid. Find the concentration of the sodium carbonate. [[Na2CO3 + 2HCl -> 2NaCl + H2O + CO2]]', working: ['Moles of HCl = 0.100 × 20.00 ÷ 1000 = 0.00200 mol.', 'Ratio Na₂CO₃ : HCl = 1 : 2, so moles of Na₂CO₃ = 0.00100 mol.', 'Concentration = 0.00100 ÷ 0.0250 = 0.0400 mol dm⁻³.'] },
      },
      {
        title: 'Choosing an indicator', when: '"Name a suitable indicator and give the colour change."',
        steps: ['For a strong acid and strong alkali, phenolphthalein or methyl orange both work.', 'Phenolphthalein: pink in alkali, colourless in acid.', 'Methyl orange: yellow in alkali, red in acid, orange at the end point.', 'Give the colour change in the direction it happens: alkali in the flask and phenolphthalein goes pink to colourless.'],
      },
    ],
    examTips: [
      'Average only concordant titres (within 0.10 cm³). Leave out the rough titre.',
      'Burette readings are recorded to 2 decimal places, ending in 0 or 5.',
      'Rinsing the flask with water does not matter; rinsing the burette or pipette with water does.',
      'Check the mole ratio: sulfuric acid reacts with sodium hydroxide 1 : 2, and sodium carbonate with hydrochloric acid 1 : 2.',
    ],
    skills: [
      'Name and use a burette, pipette and conical flask correctly',
      'Read a burette and record titres to 2 decimal places',
      'Choose concordant titres and calculate the mean',
      'Choose an indicator and state its colour change',
      'Calculate an unknown concentration, including 1 : 2 ratios',
      'Explain sources of error and how to reduce them',
    ],
    lab: [{ id: 'titration', label: 'Do a full titration in the virtual lab' }],
  },
];

export const FOCUS_BY_ID: Record<string, FocusArea> = Object.fromEntries(FOCUS_AREAS.map((f) => [f.id, f]));
export const FOCUS_OBJECTIVES = new Set(FOCUS_AREAS.flatMap((f) => f.objectives));
